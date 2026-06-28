/**
 * The live session payload synced to the patient WebXR client.
 *
 * This is the EXACT contract preserved verbatim from the POC
 * (dashboard.html `DEFAULTS` / index.html `S`). The patient client reads
 * these fields by name, so field names, value ranges, and defaults must not
 * change. The only architectural shift vs. the POC is the storage location:
 * the POC wrote the whole object to a single global `/emdr.json`; the SaaS
 * writes it to a room-scoped path `/sessions/{roomId}` (see lib/room.ts).
 */
export interface SessionState {
  running: boolean;
  speed: number; // 1–9
  swing: number; // 1–9 (movement width)
  height: number; // -5..+5
  size: number; // 1–9
  color: string; // hex
  pattern: "horizontal" | "figure8";
  visual: boolean;
  audio: boolean;
  audioVolume: number; // 0–9
  haptic: boolean;
  hapticStrength: number; // 1–9
  env: string; // background id (gradient or photo)
  music: string; // 'off' | track id
  musicVolume: number; // 0–9
  hapticOnly: boolean;
  iwText: string; // interweave text shown to patient ('' = none)
  iwSeq: number; // bumped on each send/hide → triggers fade in/out
  sessionSeq: number; // bumped on full reset (new session)
  setSeq: number; // bumped at start of each set → resets reps
}

export const DEFAULT_SESSION_STATE: SessionState = {
  running: false,
  speed: 5,
  swing: 5,
  height: 0,
  size: 5,
  color: "#5599ff",
  pattern: "horizontal",
  visual: true,
  audio: true,
  audioVolume: 5,
  haptic: true,
  hapticStrength: 5,
  env: "sky",
  music: "off",
  musicVolume: 5,
  hapticOnly: false,
  iwText: "",
  iwSeq: 0,
  sessionSeq: 0,
  setSeq: 0,
};

/**
 * Status reported back BY the patient client (heartbeat + live counters).
 * Preserved from the POC's `/status.json` payload.
 */
export interface SessionStatus {
  alive: number; // Date.now() heartbeat
  reps: number; // completed movement cycles
  running: boolean;
}
