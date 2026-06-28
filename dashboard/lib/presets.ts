/**
 * Therapist presets — saved sensory/environment configurations, stored under
 * `therapists/{uid}/presets/{presetId}` in Firestore (per-therapist, never
 * shared). Only the configurable treatment parameters are saved; session/
 * timer fields (running, sessionSeq, setSeq, iwText, iwSeq) are excluded —
 * a preset is a "look", not a session-in-progress.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import type { SessionState } from "@/lib/session-state";

export type PresetSettings = Pick<
  SessionState,
  | "speed"
  | "swing"
  | "height"
  | "size"
  | "color"
  | "pattern"
  | "visual"
  | "audio"
  | "audioVolume"
  | "haptic"
  | "hapticStrength"
  | "env"
  | "music"
  | "musicVolume"
  | "hapticOnly"
>;

export interface SessionPreset {
  id: string;
  name: string;
  settings: PresetSettings;
  createdAt: Timestamp | null;
}

const presetsCollection = (uid: string) =>
  collection(getFirebaseFirestore(), "therapists", uid, "presets");

export async function listPresets(uid: string): Promise<SessionPreset[]> {
  const snap = await getDocs(query(presetsCollection(uid), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name as string,
      settings: data.settings as PresetSettings,
      createdAt: (data.createdAt as Timestamp | undefined) ?? null,
    };
  });
}

export async function savePreset(
  uid: string,
  name: string,
  settings: PresetSettings,
): Promise<string> {
  const docRef = await addDoc(presetsCollection(uid), {
    name,
    settings,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function deletePreset(uid: string, presetId: string): Promise<void> {
  return deleteDoc(doc(getFirebaseFirestore(), "therapists", uid, "presets", presetId));
}
