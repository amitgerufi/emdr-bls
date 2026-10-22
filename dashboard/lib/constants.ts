/**
 * Media + content catalogs, ported verbatim from the POC (dashboard.html /
 * index.html) so Milestone 2 can build the control panel directly on top of
 * them. Asset files (backgrounds/*.jpg, music/*.mp3) live at the repo root
 * alongside the patient client and are shared with it. Labels are bilingual
 * (en/he) to match the dashboard's language toggle.
 */

import type { Lang } from "@/lib/i18n";
import type { BgProjection } from "@/lib/session-state";

type Label = { en: string; he: string };

// ── 360° photo environments (backgrounds/<id>.jpg) ──────────────────────────
export interface PhotoEnv {
  id: string;
  label: Label;
}

export const PHOTOS: PhotoEnv[] = [
  { id: "green-valley", label: { en: "Green Valley 360°", he: "עמק ירוק 360°" } },
  { id: "white-beach", label: { en: "White Beach", he: "חוף לבן" } },
  { id: "open-sea", label: { en: "Open Sea", he: "ים פתוח" } },
  { id: "shore", label: { en: "Shoreline", he: "שפת מים" } },
  { id: "sunrise-hills", label: { en: "Sunrise Hills", he: "זריחה על גבעות" } },
  { id: "rocky-beach", label: { en: "Rocky Beach", he: "חוף סלעים" } },
  { id: "green-hills", label: { en: "Green Hills", he: "גבעות ירוקות" } },
  { id: "night-sky", label: { en: "Night Sky", he: "שמי לילה" } },
  { id: "turquoise-waves", label: { en: "Turquoise Waves", he: "גלי טורקיז" } },
  { id: "space", label: { en: "Space", he: "חלל" } },
  { id: "nebula", label: { en: "Nebula", he: "ערפילית" } },
  { id: "nebula-blue", label: { en: "Blue Nebula", he: "ערפילית כחולה" } },
  { id: "nebula-purple", label: { en: "Purple Nebula", he: "ערפילית סגולה" } },
  { id: "nebula-orange", label: { en: "Orange Nebula", he: "ערפילית כתומה" } },
  { id: "watercolor", label: { en: "Watercolor", he: "אקוורל" } },
];

export const PHOTO_IDS = new Set(PHOTOS.map((p) => p.id));

// ── Looping video backgrounds ───────────────────────────────────────────────
// The video itself lives at the repo root (backgrounds/<id>.mp4) and is played
// by the patient client; the dashboard only needs a poster image for the tile
// and the live preview (dashboard/public/backgrounds/<id>.jpg).
export interface VideoEnv {
  id: string;
  label: Label;
  projection: BgProjection;
}

export const VIDEOS: VideoEnv[] = [
  { id: "airplane-night", label: { en: "Airplane — Night Cabin", he: "מטוס — תא לילה" }, projection: "flat" },
  { id: "airplane-evening", label: { en: "Airplane — Evening Cabin", he: "מטוס — תא ערב" }, projection: "flat" },
];

// Media backgrounds are written to `env` as 'video:<id>' (built in) or
// 'local:<id>' (a file the patient added on their own device).
export const VIDEO_ENV_PREFIX = "video:";
export const LOCAL_ENV_PREFIX = "local:";
export const videoEnv = (id: string) => `${VIDEO_ENV_PREFIX}${id}`;
export const isVideoEnv = (env: string) => env.startsWith(VIDEO_ENV_PREFIX);
export const isLocalEnv = (env: string) => env.startsWith(LOCAL_ENV_PREFIX);
export const isMediaEnv = (env: string) => isVideoEnv(env) || isLocalEnv(env);

/** Image to draw for a background in the live preview (null → a color wash). */
export function envPreviewSrc(env: string): string | null {
  if (PHOTO_IDS.has(env)) return `/backgrounds/${env}.jpg`;
  if (isVideoEnv(env)) {
    const id = env.slice(VIDEO_ENV_PREFIX.length);
    return VIDEOS.some((v) => v.id === id) ? `/backgrounds/${id}.jpg` : null;
  }
  return null;
}

// ── Code-generated gradient environments (no asset file) ────────────────────
export const GRADIENT_IDS = ["room", "nature", "beach", "sky", "neutral"] as const;
export type GradientId = (typeof GRADIENT_IDS)[number];

export const ENV_COLORS: Record<GradientId, { top: string; bottom: string }> = {
  room: { top: "#d9c9b0", bottom: "#8a7355" },
  nature: { top: "#9fd4e8", bottom: "#5a8f4e" },
  beach: { top: "#aee4f0", bottom: "#e8d6a8" },
  sky: { top: "#3a7bd5", bottom: "#bfe3ff" },
  neutral: { top: "#5a5a66", bottom: "#23232b" },
};

const GRADIENT_NAMES: Record<GradientId, Label> = {
  room: { en: "Calm Room", he: "חדר רגוע" },
  nature: { en: "Nature View", he: "נוף טבע" },
  beach: { en: "Beach", he: "חוף ים" },
  sky: { en: "Sky", he: "שמיים" },
  neutral: { en: "Neutral", he: "ניטרלי" },
};

const ENV_LABELS: Record<string, Label> = {
  ...GRADIENT_NAMES,
  ...Object.fromEntries(PHOTOS.map((p) => [p.id, p.label])),
  ...Object.fromEntries(VIDEOS.map((v) => [videoEnv(v.id), v.label])),
};

export function envName(id: string, lang: Lang): string {
  return ENV_LABELS[id]?.[lang] ?? id;
}

// ── Background music tracks (music/<id>.mp3) ────────────────────────────────
export interface MusicTrack {
  id: string;
  label: Label;
  dur: string;
}

export const MUSIC: MusicTrack[] = [
  { id: "mondamusic-meditation-491684", label: { en: "Short Meditation", he: "מדיטציה קצרה" }, dur: "1:43" },
  { id: "ribhavagrawal-solo-handpan-music-no-copyright-345257", label: { en: "Handpan", he: "האנדפן" }, dur: "2:26" },
  { id: "leberch-meditation-509071", label: { en: "Gentle Meditation", he: "מדיטציה רכה" }, dur: "2:54" },
  { id: "alex-morgan-documentary-nature-528316", label: { en: "Nature", he: "טבע" }, dur: "2:49" },
  { id: "the_mountain-spiritual-meditation-444137", label: { en: "Spiritual", he: "רוחני" }, dur: "5:26" },
  { id: "leberch-meditation-510292", label: { en: "Deep Meditation", he: "מדיטציה עמוקה" }, dur: "5:28" },
  { id: "freemusicforvideo-meditation-background-409198", label: { en: "Long Meditation", he: "מדיטציה ארוכה" }, dur: "7:52" },
  { id: "siarhei_korbut-handpan-soundscape-432-hz-396231", label: { en: "Handpan 432Hz", he: "האנדפן 432Hz" }, dur: "10:00" },
];

export function musicName(id: string, lang: Lang): string {
  const track = MUSIC.find((m) => m.id === id);
  return track ? track.label[lang] : id;
}

// ── Interweave preset phrases (text shown to the patient) ───────────────────
export const INTERWEAVES: Label[] = [
  { en: "You are safe now", he: "עכשיו הכל בטוח" },
  { en: "It's over", he: "זה נגמר" },
  { en: "That belongs to the past", he: "זה שייך לעבר" },
  { en: "You are here, in the present", he: "אנחנו כאן, בהווה" },
  { en: "You did the best you could", he: "עשית כמיטב יכולתך" },
  { en: "It's not your fault", he: "זאת לא אשמתך" },
  { en: "You are not alone", he: "אנחנו יחד כאן" },
  { en: "You can let go", he: "אפשר לשחרר" },
  { en: "Take a deep breath", he: "לקחת נשימה עמוקה" },
  { en: "You are strong enough", he: "יש בך מספיק כוח" },
];

// ── Ball color presets ──────────────────────────────────────────────────────
export const COLOR_PRESETS = [
  "#5599ff",
  "#34d399",
  "#ffffff",
  "#fbbf24",
  "#fb923c",
  "#f472b6",
  "#a78bfa",
];
