/**
 * Owns the live session state for one room and keeps it synced to the
 * patient client via `/sessions/{roomId}` — the React port of the POC
 * dashboard's `S` object + `push()`/`sl()`/`step()`/`tog()`/session-control
 * functions (dashboard.html). Sliders push throttled (100ms), everything
 * else (buttons, toggles, segments) pushes immediately, exactly like the POC.
 *
 * Two things go the other way — from the headset to the dashboard:
 *  - when the page opens it RESUMES the live session instead of resetting it
 *    (see lib/session-resume.ts), so a reload no longer stops the patient's ball;
 *  - when the patient starts or pauses the movement with a controller trigger,
 *    the dashboard follows it like a press on its own Start / Pause button
 *    (see lib/patient-run.ts).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { firebaseSessionIo, type SessionIo } from "@/lib/room";
import { nextPatientRun } from "@/lib/patient-run";
import { resumeSessionState } from "@/lib/session-resume";
import {
  deviceMediaSignature,
  sanitizeDeviceMedia,
  type DeviceMediaItem,
} from "@/lib/device-media";
import {
  DEFAULT_SESSION_STATE,
  type BgProjection,
  type SessionState,
  type SessionStatus,
} from "@/lib/session-state";
import type { PresetSettings } from "@/lib/presets";

const PUSH_THROTTLE_MS = 100;
const CONNECTION_TIMEOUT_MS = 4000;
const READ_TIMEOUT_MS = 6000;

export type SessionPhase = "ready" | "active" | "paused" | "between";

/** Never rejects and never hangs: a failed or slow read just reports `ok: false`. */
function settle<T>(promise: Promise<T>): Promise<{ ok: boolean; value: T | null }> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ ok: false, value: null }), READ_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve({ ok: true, value });
      },
      () => {
        clearTimeout(timer);
        resolve({ ok: false, value: null });
      },
    );
  });
}

export function useSessionPanel(roomId: string | null, io: SessionIo = firebaseSessionIo) {
  const [state, setState] = useState<SessionState>(DEFAULT_SESSION_STATE);
  const stateRef = useRef(state);

  // False until the live session has been read — the panel waits for it, so nothing is
  // written from default values while the real ones are still on their way.
  const [ready, setReady] = useState(false);

  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [connected, setConnected] = useState(false);
  const lastAliveRef = useRef(0);

  // The patient's last start/pause press on a controller (n counts them, so a UI can announce each one).
  const [patientRun, setPatientRun] = useState<{ on: boolean; n: number } | null>(null);
  const lastRunKeyRef = useRef<string | null | undefined>(undefined);

  // Files the patient added on their own device, as published by the patient client.
  const [deviceMedia, setDeviceMedia] = useState<DeviceMediaItem[]>([]);
  const mediaSignatureRef = useRef("");

  const [sets, setSets] = useState(0);
  const [setSecs, setSetSecs] = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [iwStatusText, setIwStatusText] = useState("");
  const iwTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushThrottled = useCallback(() => {
    if (pushTimerRef.current || !roomId) return;
    pushTimerRef.current = setTimeout(() => {
      pushTimerRef.current = null;
      io.writeSession(roomId, stateRef.current).catch(() => {});
    }, PUSH_THROTTLE_MS);
  }, [roomId, io]);

  /** Merge a patch into state and push (throttled or immediate). */
  const update = useCallback(
    (patch: Partial<SessionState>, immediate = true) => {
      const next = { ...stateRef.current, ...patch };
      stateRef.current = next;
      setState(next);
      if (immediate) {
        if (pushTimerRef.current) {
          clearTimeout(pushTimerRef.current);
          pushTimerRef.current = null;
        }
        if (roomId) io.writeSession(roomId, next).catch(() => {});
      } else {
        pushThrottled();
      }
    },
    [roomId, pushThrottled, io],
  );

  // ── sliders / steppers ──
  const setField = useCallback(
    <K extends keyof SessionState>(key: K, value: SessionState[K]) =>
      update({ [key]: value } as Partial<SessionState>, false),
    [update],
  );
  const step = useCallback(
    <K extends keyof SessionState>(key: K, dir: 1 | -1, min: number, max: number) => {
      const current = Number(stateRef.current[key]);
      const val = Math.max(min, Math.min(max, current + dir));
      update({ [key]: val } as unknown as Partial<SessionState>, true);
    },
    [update],
  );

  // ── toggles / segments / color ──
  const toggle = useCallback(
    (key: "visual" | "audio" | "haptic" | "hapticOnly") =>
      update({ [key]: !stateRef.current[key] } as Partial<SessionState>, true),
    [update],
  );
  const setPattern = useCallback(
    (pattern: SessionState["pattern"]) => update({ pattern }, true),
    [update],
  );
  // Picking a video/local background also sets how it is shown (flat screen or 360°).
  const setEnv = useCallback(
    (env: string, projection?: BgProjection) =>
      update(projection ? { env, bgProjection: projection } : { env }, true),
    [update],
  );
  const setBgProjection = useCallback(
    (bgProjection: BgProjection) => update({ bgProjection }, true),
    [update],
  );
  const setMusic = useCallback((music: string) => update({ music }, true), [update]);
  const setColor = useCallback((color: string) => update({ color }, true), [update]);

  // ── session control: play/pause · end set · new session ──
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setSetSecs((s) => s + 1);
      setTotalSecs((t) => t + 1);
    }, 1000);
  }, []);

  const togglePlay = useCallback(() => {
    const running = !stateRef.current.running;
    if (running) startTimer();
    else stopTimer();
    update({ running }, true);
  }, [startTimer, stopTimer, update]);

  const endSet = useCallback(() => {
    if (setSecs === 0 && !stateRef.current.running) return;
    setSets((s) => s + 1);
    setSetSecs(0);
    stopTimer();
    update({ running: false, setSeq: stateRef.current.setSeq + 1 }, true);
  }, [setSecs, stopTimer, update]);

  const newSession = useCallback(() => {
    setSets(0);
    setSetSecs(0);
    setTotalSecs(0);
    stopTimer();
    update({ running: false, sessionSeq: stateRef.current.sessionSeq + 1 }, true);
  }, [stopTimer, update]);

  // The patient pressed start / pause on their own controller: do what a press on our own
  // Start / Pause button would do (timers, preview, buttons) and tell the headset the shared
  // state — otherwise our next slider move would send the old "running" value back and undo it.
  // A pause is a pause, not the end of the set: the therapist still ends a set with "End set".
  const followPatient = useCallback(
    (on: boolean) => {
      if (stateRef.current.running === on) return; // already in that state (for example we just did the same)
      if (on) startTimer();
      else stopTimer();
      update({ running: on }, true);
      setPatientRun((previous) => ({ on, n: (previous?.n ?? 0) + 1 }));
    },
    [startTimer, stopTimer, update],
  );

  // ── interweave — preset phrases + free text ──
  const sendInterweave = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      update({ iwText: t, iwSeq: stateRef.current.iwSeq + 1 }, true);
      setIwStatusText(t);
      const hold = Math.min(14000, 3500 + t.length * 130);
      if (iwTimerRef.current) clearTimeout(iwTimerRef.current);
      iwTimerRef.current = setTimeout(() => setIwStatusText(""), 1200 + hold + 1200);
    },
    [update],
  );
  const hideInterweave = useCallback(() => {
    update({ iwText: "", iwSeq: stateRef.current.iwSeq + 1 }, true);
    if (iwTimerRef.current) {
      clearTimeout(iwTimerRef.current);
      iwTimerRef.current = null;
    }
    setIwStatusText("");
  }, [update]);

  // ── presets ──
  const applyPreset = useCallback(
    (settings: PresetSettings) => update(settings, true),
    [update],
  );
  const currentPresetSettings = useCallback((): PresetSettings => {
    const s = stateRef.current;
    return {
      speed: s.speed,
      swing: s.swing,
      height: s.height,
      size: s.size,
      color: s.color,
      pattern: s.pattern,
      visual: s.visual,
      audio: s.audio,
      audioVolume: s.audioVolume,
      haptic: s.haptic,
      hapticStrength: s.hapticStrength,
      env: s.env,
      bgProjection: s.bgProjection,
      bgVolume: s.bgVolume,
      music: s.music,
      musicVolume: s.musicVolume,
      hapticOnly: s.hapticOnly,
    };
  }, []);

  // ── mount: resume the live session (never reset it), then watch the patient's headset ──
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    lastRunKeyRef.current = undefined; // the first status snapshot is only a baseline

    (async () => {
      // Reloading the page must not stop a session that is running: read what is there first.
      const [session, headset] = await Promise.all([
        settle(io.readSession(roomId)),
        settle(io.readStatus(roomId)),
      ]);
      if (cancelled) return;
      const resumed = resumeSessionState({
        session: session.value,
        sessionKnown: session.ok,
        status: headset.value,
        statusKnown: headset.ok,
        now: Date.now(),
      });
      stateRef.current = resumed.state;
      setState(resumed.state);
      if (resumed.state.running) startTimer();
      if (resumed.write) io.writeSession(roomId, resumed.state).catch(() => {});
      setReady(true);

      unsubscribe = io.subscribeStatus(roomId, (s) => {
        setStatus(s);
        if (s) lastAliveRef.current = Date.now();
        // The status node updates every second (heartbeat); only re-read the media list when it changed.
        const signature = deviceMediaSignature(s?.media);
        if (signature !== mediaSignatureRef.current) {
          mediaSignatureRef.current = signature;
          setDeviceMedia(sanitizeDeviceMedia(s?.media));
        }
        // The patient started or paused the movement with a controller.
        const run = nextPatientRun(lastRunKeyRef.current, s?.run);
        lastRunKeyRef.current = run.key;
        if (run.command) followPatient(run.command.on);
      });
    })();

    const connInterval = setInterval(() => {
      setConnected(Date.now() - lastAliveRef.current < CONNECTION_TIMEOUT_MS);
    }, 1000);
    return () => {
      cancelled = true;
      unsubscribe?.();
      clearInterval(connInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      if (iwTimerRef.current) clearTimeout(iwTimerRef.current);
    };
  }, [roomId, io, startTimer, followPatient]);

  const phase: SessionPhase = state.running
    ? "active"
    : setSecs > 0
      ? "paused"
      : sets > 0
        ? "between"
        : "ready";

  return {
    state,
    ready,
    reps: status?.reps ?? 0,
    connected,
    patientRun,
    deviceMedia,
    sets,
    setSecs,
    totalSecs,
    phase,
    endSetDisabled: !(state.running || setSecs > 0),
    iwStatusText,
    setField,
    step,
    toggle,
    setPattern,
    setEnv,
    setBgProjection,
    setMusic,
    setColor,
    togglePlay,
    endSet,
    newSession,
    sendInterweave,
    hideInterweave,
    applyPreset,
    currentPresetSettings,
  };
}
