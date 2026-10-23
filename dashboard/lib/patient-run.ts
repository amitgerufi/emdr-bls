/**
 * The patient can start or pause the movement themselves with a controller
 * trigger. The headset announces every press under `status/{roomId}/run` as
 * `{ at: <ms timestamp>, on: <boolean> }`, and the dashboard follows it exactly
 * as if the therapist had pressed Start / Pause.
 *
 * `status` is writable without signing in (the patient client has no account),
 * so the value is untrusted: only a well-formed `{ at: number, on: boolean }`
 * is accepted.
 */
export interface PatientRun {
  at: number;
  on: boolean;
}

export function parsePatientRun(raw: unknown): PatientRun | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.on !== "boolean") return null;
  if (typeof r.at !== "number" || !Number.isFinite(r.at)) return null;
  return { at: r.at, on: r.on };
}

/**
 * Compare a status snapshot with the last press already handled.
 *
 * `lastKey` is `undefined` until the first snapshot has been seen: that first
 * one is only a baseline, because it may still hold an old press from before
 * the dashboard was opened. After that, any change of the value is a new press;
 * the heartbeat that arrives every second with the same value is not. Junk or a
 * missing value is ignored and the last valid press stays remembered, so the
 * same old press showing up again can't be mistaken for a new one.
 */
export function nextPatientRun(
  lastKey: string | null | undefined,
  raw: unknown,
): { key: string | null; command: PatientRun | null } {
  const run = parsePatientRun(raw);
  if (!run) return { key: lastKey ?? null, command: null };
  const key = `${run.at}:${run.on ? 1 : 0}`;
  if (lastKey === undefined || key === lastKey) return { key, command: null };
  return { key, command: run };
}
