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
import { get, onValue, ref, set, type Unsubscribe } from "firebase/database";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb, getFirebaseFirestore } from "@/lib/firebase";
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
export const pinPath = (pin: string) => `pins/${pin}`;

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

/**
 * Resolve the therapist's permanent room, creating it on first login.
 *
 * Each therapist (Firebase Auth uid) owns exactly one room — roomId === uid.
 * A 4-digit PIN is generated once and stored both in Firestore (therapist
 * profile, for the dashboard to display) and in the RTDB `/pins` index (so
 * the patient client can resolve a PIN to a roomId without auth, in M3).
 */
export async function ensureRoom(
  uid: string,
): Promise<{ roomId: string; pin: string }> {
  const therapistRef = doc(getFirebaseFirestore(), "therapists", uid);
  const existing = await getDoc(therapistRef);
  const existingPin = existing.data()?.pin as string | undefined;
  if (existingPin) return { roomId: uid, pin: existingPin };

  let pin = generatePin();
  for (let attempt = 0; attempt < 10; attempt++) {
    const taken = await get(ref(getFirebaseDb(), pinPath(pin)));
    if (!taken.exists()) break;
    pin = generatePin();
  }

  await Promise.all([
    setDoc(therapistRef, { pin, createdAt: serverTimestamp() }),
    set(ref(getFirebaseDb(), pinPath(pin)), uid),
    initRoom(uid),
  ]);

  return { roomId: uid, pin };
}
