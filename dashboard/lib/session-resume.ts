/**
 * What the dashboard starts from when it opens (or is reloaded).
 *
 * It used to overwrite the live session with default values every time it
 * loaded, so reloading the page — easy to do by accident on a phone, for
 * example when the browser restores a tab — stopped the ball for the patient
 * in the middle of a set and reset every setting. Now it reads what is there
 * and carries on from it.
 */
import {
  DEFAULT_SESSION_STATE,
  type SessionState,
  type SessionStatus,
} from "@/lib/session-state";

/** The headset counts as present when its heartbeat (sent every second) is this fresh. */
export const HEADSET_FRESH_MS = 15_000;

/** Known fields with the right types only; anything else falls back to its default. */
export function adoptSessionState(raw: unknown): SessionState {
  const out: Record<string, unknown> = { ...DEFAULT_SESSION_STATE };
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const src = raw as Record<string, unknown>;
    for (const key of Object.keys(DEFAULT_SESSION_STATE) as (keyof SessionState)[]) {
      const value = src[key];
      const fallback = DEFAULT_SESSION_STATE[key];
      if (typeof value === typeof fallback && (typeof value !== "number" || Number.isFinite(value))) {
        out[key] = value;
      }
    }
  }
  if (out.pattern !== "horizontal" && out.pattern !== "figure8") out.pattern = DEFAULT_SESSION_STATE.pattern;
  if (out.bgProjection !== "flat" && out.bgProjection !== "360") out.bgProjection = DEFAULT_SESSION_STATE.bgProjection;
  return out as unknown as SessionState;
}

export interface ResumeInput {
  /** The session node as read from the database (null: it doesn't exist yet). */
  session: unknown;
  /** False when the read failed or timed out — then nothing is written. */
  sessionKnown: boolean;
  /** The headset's status node (null: it has never connected). */
  status: SessionStatus | null;
  statusKnown: boolean;
  now: number;
}

export interface Resumed {
  state: SessionState;
  /** Whether the dashboard has to write the state back (otherwise it leaves the database alone). */
  write: boolean;
}

export function resumeSessionState(input: ResumeInput): Resumed {
  // Couldn't read: start from defaults locally but don't overwrite anything that may be live.
  if (!input.sessionKnown) return { state: { ...DEFAULT_SESSION_STATE }, write: false };
  // A brand-new room: seed it with defaults, as before.
  if (input.session == null) return { state: { ...DEFAULT_SESSION_STATE }, write: true };

  const saved = adoptSessionState(input.session);
  if (!input.statusKnown) return { state: saved, write: false };

  // A leftover "running" from a session nobody is watching must not start by itself the
  // next time the patient puts the headset on. While the headset IS there, it knows best.
  const status = input.status;
  const headsetHere =
    !!status && typeof status.alive === "number" && input.now - status.alive < HEADSET_FRESH_MS;
  const running = headsetHere ? status?.running === true : false;
  return { state: { ...saved, running }, write: saved.running !== running };
}
