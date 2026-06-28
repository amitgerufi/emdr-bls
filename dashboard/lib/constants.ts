/**
 * Media + content catalogs, ported verbatim from the POC (dashboard.html /
 * index.html) so Milestone 2 can build the control panel directly on top of
 * them. Asset files (backgrounds/*.jpg, music/*.mp3) live at the repo root
 * alongside the patient client and are shared with it.
 */

// ── 360° photo environments (backgrounds/<id>.jpg) ──────────────────────────
export interface PhotoEnv {
  id: string;
  label: string;
}

export const PHOTOS: PhotoEnv[] = [
  { id: "green-valley", label: "עמק ירוק 360°" },
  { id: "white-beach", label: "חוף לבן" },
  { id: "open-sea", label: "ים פתוח" },
  { id: "shore", label: "שפת מים" },
  { id: "sunrise-hills", label: "זריחה על גבעות" },
  { id: "rocky-beach", label: "חוף סלעים" },
  { id: "green-hills", label: "גבעות ירוקות" },
  { id: "night-sky", label: "שמי לילה" },
  { id: "turquoise-waves", label: "גלי טורקיז" },
  { id: "space", label: "חלל" },
  { id: "nebula", label: "ערפילית" },
  { id: "nebula-blue", label: "ערפילית כחולה" },
  { id: "nebula-purple", label: "ערפילית סגולה" },
  { id: "nebula-orange", label: "ערפילית כתומה" },
  { id: "watercolor", label: "אקוורל" },
];

export const PHOTO_IDS = new Set(PHOTOS.map((p) => p.id));

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

export const ENV_NAMES: Record<string, string> = {
  room: "חדר רגוע",
  nature: "נוף טבע",
  beach: "חוף ים",
  sky: "שמיים",
  neutral: "ניטרלי",
  ...Object.fromEntries(PHOTOS.map((p) => [p.id, p.label])),
};

// ── Background music tracks (music/<id>.mp3) ────────────────────────────────
export interface MusicTrack {
  id: string;
  label: string;
  dur: string;
}

export const MUSIC: MusicTrack[] = [
  { id: "mondamusic-meditation-491684", label: "מדיטציה קצרה", dur: "1:43" },
  { id: "ribhavagrawal-solo-handpan-music-no-copyright-345257", label: "האנדפן", dur: "2:26" },
  { id: "leberch-meditation-509071", label: "מדיטציה רכה", dur: "2:54" },
  { id: "alex-morgan-documentary-nature-528316", label: "טבע", dur: "2:49" },
  { id: "the_mountain-spiritual-meditation-444137", label: "רוחני", dur: "5:26" },
  { id: "leberch-meditation-510292", label: "מדיטציה עמוקה", dur: "5:28" },
  { id: "freemusicforvideo-meditation-background-409198", label: "מדיטציה ארוכה", dur: "7:52" },
  { id: "siarhei_korbut-handpan-soundscape-432-hz-396231", label: "האנדפן 432Hz", dur: "10:00" },
];

export const MUSIC_NAMES: Record<string, string> = Object.fromEntries(
  MUSIC.map((m) => [m.id, m.label]),
);

// ── Interweave preset phrases (text shown to the patient) ───────────────────
export const INTERWEAVES: string[] = [
  "את/ה בטוח/ה עכשיו",
  "זה נגמר",
  "זה שייך לעבר",
  "את/ה כאן, בהווה",
  "עשית כמיטב יכולתך",
  "זאת לא אשמתך",
  "את/ה לא לבד",
  "אפשר לשחרר",
  "קח/י נשימה עמוקה",
  "את/ה חזק/ה מספיק",
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
