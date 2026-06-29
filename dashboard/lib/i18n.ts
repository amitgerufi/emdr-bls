export type Lang = "en" | "he";

type Entry = { en: string; he: string };

export const dict = {
  // Shell / brand
  appTagline: { en: "Therapist Dashboard", he: "דשבורד מטפל" },
  signOut: { en: "Sign out", he: "התנתקות" },
  loading: { en: "Loading…", he: "טוען…" },

  // Login
  welcome: { en: "Welcome", he: "ברוך/ה הבא/ה" },
  loginSubtitle: {
    en: "Sign in to run live EMDR sessions and control the patient's bilateral stimulation.",
    he: "התחבר/י כדי לנהל סשן EMDR בזמן אמת ולשלוט בגירוי הבילטרלי של המטופל/ת.",
  },
  signingIn: { en: "Signing in…", he: "מתחבר/ת…" },
  signInWithGoogle: { en: "Sign in with Google", he: "התחברות עם Google" },
  noPatientData: {
    en: "No patient-identifying data is ever stored.",
    he: "לא נשמרים פרטים מזהים של מטופלים — לעולם.",
  },
  signInFailedTitle: { en: "Sign-in failed", he: "ההתחברות נכשלה" },
  signInFailedDesc: {
    en: "Something went wrong signing in with Google. Please try again.",
    he: "אירעה תקלה בהתחברות עם Google. נסה/י שוב.",
  },

  // Dashboard shell
  settingUpRoom: { en: "Setting up your room…", he: "מכין/ה את החדר שלך…" },
  roomSetupFailed: {
    en: "Room setup failed. Check your Database/Firestore permissions (see SETUP.md).",
    he: "יצירת החדר נכשלה. בדקו את הרשאות ה-Database/Firestore (ראו SETUP.md).",
  },
  copyPin: { en: "Copy PIN code", he: "העתקת קוד PIN" },
  lightMode: { en: "Light mode", he: "מצב בהיר" },
  darkMode: { en: "Dark mode", he: "מצב כהה" },
  headsetConnected: { en: "Headset connected", he: "משקפת מחוברת" },
  disconnected: { en: "Disconnected", he: "מנותק" },
  livePreviewTag: { en: "Live preview — what the patient sees", he: "תצוגה חיה — מה שהמטופל רואה" },

  // Accordion sections
  sectionMotion: { en: "Motion", he: "תנועה" },
  sectionChannels: { en: "Stimulation Channels", he: "ערוצי גירוי" },
  sectionInterweave: { en: "Interweaves — Text to Patient", he: "שזירות — טקסט למטופל" },
  sectionAmbiance: { en: "Ambiance & Music", he: "סביבה ומוזיקה" },
  sectionPresets: { en: "Saved Presets", he: "פריסטים שמורים" },

  // Session hero
  phaseReady: { en: "Ready", he: "מוכן" },
  phaseActive: { en: "Active", he: "פעיל" },
  phasePaused: { en: "Paused", he: "מושהה" },
  phaseBetween: { en: "Between sets", he: "בין סטים" },
  newSession: { en: "New session", he: "סשן חדש" },
  statSets: { en: "Sets", he: "סטים" },
  statReps: { en: "Reps", he: "חזרות" },
  statSetTime: { en: "Set time", he: "זמן סט" },
  statTotalTime: { en: "Total time", he: "זמן כולל" },
  speed: { en: "Speed", he: "מהירות" },

  // Motion section
  width: { en: "Width", he: "רוחב" },
  height: { en: "Height", he: "גובה" },
  pattern: { en: "Pattern", he: "תבנית" },
  patternHorizontal: { en: "Horizontal", he: "אופקי" },
  patternFigure8: { en: "Figure-8", he: "שמינייה" },

  // Channels section
  channelVisual: { en: "Visual — the ball", he: "ויזואל — הכדור" },
  size: { en: "Size", he: "גודל" },
  channelAudio: { en: "Audio — alternating tone", he: "אודיו — צליל מתחלף" },
  volume: { en: "Volume", he: "ווליום" },
  channelHaptic: { en: "Haptics — controllers", he: "רטט — בשלטים" },
  strength: { en: "Strength", he: "עוצמה" },
  hapticOnly: { en: "Haptics only — no headset", he: "רטט בלבד — ללא קסדה" },
  hapticOnlyHelp: {
    en: "The patient removes the headset and feels vibration in their hands only. To prevent the device from sleeping, disable the proximity sensor via SideQuest / Meta Quest Developer Hub.",
    he: "המטופל מוריד את הקסדה וחווה רק רטט בידיים. כדי שהמכשיר לא יירדם — יש לכבות את חיישן הקירבה דרך SideQuest / Meta Quest Developer Hub.",
  },
  decrease: { en: "Decrease", he: "הפחתת" },
  increase: { en: "Increase", he: "הגדלת" },
  freeColor: { en: "Custom color", he: "צבע חופשי" },

  // Interweave section
  presetPhrasesHint: { en: "Preset phrases — tap to send instantly", he: "משפטים מוכנים — לחיצה שולחת מיד" },
  freeText: { en: "Free text", he: "טקסט חופשי" },
  freeTextPlaceholder: { en: "Type a phrase and send…", he: "כתוב/י משפט ושלח/י…" },
  send: { en: "Send", he: "שלח" },
  hideTextFromPatient: { en: "Hide text from patient", he: "הסתר טקסט מהמטופל" },
  iwStatusNone: {
    en: "No text is showing right now. Text fades in and out automatically.",
    he: "אין טקסט מוצג כרגע. הטקסט נכנס בפייד-אין ויוצא אוטומטית.",
  },
  iwStatusShowingPrefix: { en: "Currently showing:", he: "מוצג כעת:" },
  iwStatusShowingSuffix: {
    en: "disappears automatically, or tap Hide.",
    he: "נעלם אוטומטית, או לחצ/י הסתר.",
  },

  // Ambiance section
  background: { en: "Background", he: "רקע" },
  backgroundMusic: { en: "Background music", he: "מוזיקת רקע" },
  none: { en: "None", he: "ללא" },
  musicLoopHint: { en: "Music plays in the background on a loop.", he: "המוזיקה מתנגנת ברקע בלולאה." },

  // Presets section
  presetNamePlaceholder: { en: "Name for current settings…", he: "שם להגדרות הנוכחיות…" },
  save: { en: "Save", he: "שמירה" },
  loadingPresets: { en: "Loading presets…", he: "טוען פריסטים…" },
  noPresetsYet: { en: "No saved presets yet.", he: "אין עדיין פריסטים שמורים." },
  deletePreset: { en: "Delete preset", he: "מחיקת פריסט" },
  presetSaved: { en: "Preset saved", he: "הפריסט נשמר" },
  presetSaveFailed: { en: "Failed to save preset", he: "שמירת הפריסט נכשלה" },
  presetsLoadFailed: { en: "Failed to load presets", he: "טעינת הפריסטים נכשלה" },
  presetDeleteFailed: { en: "Failed to delete preset", he: "מחיקת הפריסט נכשלה" },

  // Action bar
  pause: { en: "Pause", he: "השהה" },
  start: { en: "Start", he: "התחל" },
  endSet: { en: "End set", he: "סיים סט" },
  pauseMidSet: { en: "Pause without ending the set", he: "השהיה זמנית — בלי לסיים את הסט" },
  resume: { en: "Resume", he: "המשך" },
} as const satisfies Record<string, Entry>;

export type DictKey = keyof typeof dict;
