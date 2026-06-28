/**
 * Owns the live session state for one room and keeps it synced to the
 * patient client via `/sessions/{roomId}` — the React port of the POC
 * dashboard's `S` object + `push()`/`sl()`/`step()`/`tog()`/session-control
 * functions (dashboard.html). Sliders push throttled (100ms), everything
 * else (buttons, toggles, segments) pushes immediately, exactly like the POC.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeStatus, writeSessionState } from "@/lib/room";
import {
  DEFAULT_SESSION_STATE,
  type SessionState,
  type SessionStatus,
} from "@/lib/session-state";
import type { PresetSettings } from "@/lib/presets";

const PUSH_THROTTLE_MS = 100;
const CONNECTION_TIMEOUT_MS = 4000;

export type SessionPhase = "ready" | "active" | "paused" | "between";

export function useSessionPanel(roomId: string | null) {
  const [state, setState] = useState<SessionState>(DEFAULT_SESSION_STATE);
  const stateRef = useRef(state);

  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [connected, setConnected] = useState(false);
  const lastAliveRef = useRef(0);

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
      writeSessionState(roomId, stateRef.current).catch(() => {});
    }, PUSH_THROTTLE_MS);
  }, [roomId]);

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
        if (roomId) writeSessionState(roomId, next).catch(() => {});
      } else {
        pushThrottled();
      }
    },
    [roomId, pushThrottled],
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
  const setEnv = useCallback((env: string) => update({ env }, true), [update]);
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
      music: s.music,
      musicVolume: s.musicVolume,
      hapticOnly: s.hapticOnly,
    };
  }, []);

  // ── mount: push initial defaults, watch patient heartbeat ──
  useEffect(() => {
    if (!roomId) return;
    writeSessionState(roomId, stateRef.current).catch(() => {});
    const unsubscribe = subscribeStatus(roomId, (s) => {
      setStatus(s);
      if (s) lastAliveRef.current = Date.now();
    });
    const connInterval = setInterval(() => {
      setConnected(Date.now() - lastAliveRef.current < CONNECTION_TIMEOUT_MS);
    }, 1000);
    return () => {
      unsubscribe();
      clearInterval(connInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      if (iwTimerRef.current) clearTimeout(iwTimerRef.current);
    };
  }, [roomId]);

  const phase: SessionPhase = state.running
    ? "active"
    : setSecs > 0
      ? "paused"
      : sets > 0
        ? "between"
        : "ready";

  return {
    state,
    reps: status?.reps ?? 0,
    connected,
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
