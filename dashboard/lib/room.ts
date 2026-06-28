/**
 * Room-scoped data layer.
 *
 * Architectural shift from the POC: instead of one global `/emdr.json`, each
 * therapist session lives under `/sessions/{roomId}` in the Realtime DB, with
 * the patient client's heartbeat under `/status/{roomId}`. A 4-digit PIN maps
 * to a roomId so a patient can join anonymously.
 *
 * Milestone 1 establishes these helpers so the data layer is room-scoped from
 * the start. The dashboard controls are wired to `writeSessionState` in
 * Milestone 2, and the patient client is pointed at these paths in Milestone 3.
 */
import { onValue, ref, set, type Unsubscribe } from "firebase/database";
import { getFirebaseDb } from "@/lib/firebase";
import {
  DEFAULT_SESSION_STATE,
  type SessionState,
  type SessionStatus,
} from "@/lib/session-state";

/** Generate a random 4-digit PIN, e.g. "4821". */
export function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const sessionPath = (roomId: string) => `sessions/${roomId}`;
export const statusPath = (roomId: string) => `status/${roomId}`;

/** Write the full live state for a room (mirrors the POC's `push()`). */
export function writeSessionState(
  roomId: string,
  state: SessionState,
): Promise<void> {
  return set(ref(getFirebaseDb(), sessionPath(roomId)), state);
}

/** Seed a brand-new room with default parameters. */
export function initRoom(roomId: string): Promise<void> {
  return writeSessionState(roomId, { ...DEFAULT_SESSION_STATE });
}

/** Subscribe to the patient client's heartbeat/reps for a room. */
export function subscribeStatus(
  roomId: string,
  callback: (status: SessionStatus | null) => void,
): Unsubscribe {
  return onValue(ref(getFirebaseDb(), statusPath(roomId)), (snapshot) => {
    callback(snapshot.val() as SessionStatus | null);
  });
}
