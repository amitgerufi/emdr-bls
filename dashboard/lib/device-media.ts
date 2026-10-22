/**
 * Files the patient added on their own device (headset or computer) — see
 * device-media.js in the patient client. The files themselves never leave that
 * device: the client publishes only a small list (name, type, length and a tiny
 * thumbnail) to `status/{roomId}/media`, and the therapist picks from it.
 *
 * `status` is writable without signing in (the patient client has no account),
 * so everything read from it is untrusted: only known fields in known shapes
 * are kept, a thumbnail must be a small base64 image data URL, and text is only
 * ever rendered through React — never as HTML.
 */
import type { BgProjection } from "@/lib/session-state";

export type DeviceMediaKind = "video" | "image" | "audio";

export interface DeviceMediaItem {
  id: string;
  kind: DeviceMediaKind;
  name: string;
  dur?: number; // seconds (video / audio)
  w?: number;
  h?: number;
  proj: BgProjection; // how the patient's device suggests showing it
  thumb?: string; // data:image/…;base64,…
  added: number;
}

const ID_RE = /^[a-z0-9]{4,24}$/;
const THUMB_RE = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_THUMB_CHARS = 60_000;
const MAX_ITEMS = 60;

function int(value: unknown, max: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.min(Math.round(value), max) : undefined;
}

/** Validate the raw `media` node from the status path into a clean list, newest first. */
export function sanitizeDeviceMedia(raw: unknown): DeviceMediaItem[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const items: DeviceMediaItem[] = [];
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!ID_RE.test(id) || !value || typeof value !== "object") continue;
    const r = value as Record<string, unknown>;
    if (r.kind !== "video" && r.kind !== "image" && r.kind !== "audio") continue;
    const name =
      typeof r.name === "string"
        ? r.name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80)
        : "";
    const thumb =
      typeof r.thumb === "string" && r.thumb.length <= MAX_THUMB_CHARS && THUMB_RE.test(r.thumb)
        ? r.thumb
        : undefined;
    items.push({
      id,
      kind: r.kind,
      name: name || id,
      dur: int(r.dur, 86_400),
      w: int(r.w, 20_000),
      h: int(r.h, 20_000),
      proj: r.proj === "360" ? "360" : "flat",
      thumb,
      added: int(r.added, Number.MAX_SAFE_INTEGER) ?? 0,
    });
  }
  return items.sort((a, b) => b.added - a.added).slice(0, MAX_ITEMS);
}

/**
 * Cheap change detector for the raw node. Files are immutable once added (they
 * are only ever added or deleted), so the set of ids tells us when to re-parse —
 * the status node itself updates every second with the heartbeat.
 */
export function deviceMediaSignature(raw: unknown): string {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "";
  return Object.keys(raw as Record<string, unknown>).sort().join(",");
}

/** 125 → "2:05" */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
