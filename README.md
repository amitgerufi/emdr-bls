# 🌐 BLS-VR — Bilateral Stimulation in Virtual Reality

> A system for delivering synchronized bilateral stimulation in a **VR** environment,
> across three channels — visual, auditory, and tactile — with a real-time
> therapist control dashboard.

Built for **Meta Quest** (2 / 3 / Pro), running directly from the headset browser via
**WebXR** — no install, no app store.

---

## ✨ What it does

The patient wears the headset and sees a **3D ball** floating in front of them, moving
left to right. The therapist holds a phone/tablet with a **dashboard** and controls the
experience in real time.

All three channels stay synchronized to the same movement cycle:

| Channel | Description |
|---------|--------------|
| 👁 **Visual** | 3D ball with stereoscopic depth and head tracking |
| ♪ **Auditory** | A short "tick" sound panning between right and left ear |
| 📳 **Tactile** | Alternating vibration between the right and left controller |

---

## 🎛️ The Dashboard (therapist interface)

- **Session control** — start / pause / reset, elapsed-time timer, and rep counter. It **follows the patient**: when they start or pause the movement with a controller trigger, the dashboard's timers, preview and Start / Pause button follow and a notice appears. Reloading the dashboard no longer resets a running session
- **Live headset connection** — indicator showing whether the headset is connected
- **Motion** — speed, width, height, and pattern: ⟷ horizontal or ∞ figure-8
- **Ball** — size, color, and a live preview of what the patient sees (the built-in videos play live in it; a file from the patient's own device shows as its thumbnail)
- **Background environments** — color washes (room / nature / beach / sky / neutral), **360° photo backgrounds** that wrap around the patient, and **looping video backgrounds** with their own sound (see [Video backgrounds](#-video--image-backgrounds))
- **Channels** — independent on/off per channel, plus a "haptics only (no headset)" mode
- **Background music** — track selection (8 meditation tracks) with volume control, or music from the patient's own device
- **Your own media** — videos, images and music the patient adds on their own device, selectable as the background or the music (see [Your own media](#-your-own-media-on-the-patients-device))
- **Interweaves** — send text to the patient (preset phrases or free text) that floats above the ball, fading in and out without interrupting the movement

---

## 🚀 Getting started

The system is now a **multi-tenant SaaS**: each therapist signs in with a Google account
and gets their own room + a permanent PIN code, so multiple therapists can use the system
concurrently without interfering with one another.

| Device | URL | Note |
|--------|-----|------|
| 🖥️ **Therapist dashboard** | https://dashboard-five-virid-29.vercel.app | Sign in with Google. On first login a permanent room + PIN are created and shown at the top of the screen. |
| 🥽 **Quest** | https://amitgerufi.github.io/emdr-bls/ | On launch, asks for a 4-digit PIN — get it from the dashboard. Saved on the headset for next time. |

1. Open the dashboard URL, sign in with Google, and note the PIN shown at the top of the screen.
2. Open the Quest URL in the headset browser, enter the PIN, and tap **"Enter VR"**.
3. Control the experience from the dashboard — every change updates on the headset instantly.

> Both devices sync via **Firebase** — they don't need to be on the same network. Sync is
> scoped to that therapist's room (`/sessions/{roomId}`), so multiple therapists never
> cross paths.

---

## 🛠️ Tech stack

**Therapist dashboard** (`dashboard/`, deployed on Vercel):
- **Next.js** (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- **Firebase Auth** — Google sign-in only
- **Firestore** — therapist profile + saved presets
- **Firebase Realtime Database** — live state written to `/sessions/{roomId}`

**VR experience** (`index.html`, deployed on GitHub Pages):
- **Three.js** on top of **WebXR** — 3D rendering, stereoscopic depth, head tracking (6DoF)
- **Web Audio API** — bilateral audio with stereo panning
- **Gamepad Haptics API** — controller vibration
- A **PIN** entry screen that resolves the code to a roomId (`/pins/{pin}`) and listens on `/sessions/{roomId}`

```
index.html        ← the VR experience (runs on the Quest), includes the PIN entry screen
device-media.js   ← the patient's own media library (kept on their device) + its "Media on this device" panel
dashboard/        ← the therapist dashboard: multi-tenant Next.js SaaS (see dashboard/SETUP.md)
backgrounds/      ← 360° photo backgrounds (equirectangular, 4096×2048) and looping video backgrounds (.mp4)
music/            ← background music files
SPEC.md           ← original spec document + architecture updates
```

---

## 🎵 Adding music

Drop an MP3 file into the [`music/`](music/) folder and add a line to the `MUSIC` list in
[`dashboard/lib/constants.ts`](dashboard/lib/constants.ts) (file name + label) — it will
show up as a button in the new dashboard. See [music/README.txt](music/README.txt) for details.

---

## 🎬 Video & image backgrounds

Besides color washes and 360° photos, a background can be a **looping video** (with its own sound) or a
**still image**, shown either on a flat **screen** in front of the patient or wrapped around them (**360°**).
Pick one in the dashboard under *Ambiance → Video*; the **Sound** slider sets the video's own volume.
Built-in videos live in [`backgrounds/`](backgrounds/) (for example the two airplane-cabin loops).

**Adding a built-in video**

1. Make a short, seamless loop — a few seconds is enough, the player repeats it endlessly and its sound loops
   without a click. (With Claude and the video-studio skill: *"make this clip a seamless loop, normalise the
   sound to -20 LUFS, H.264 + AAC, 1280×720"*.) Plain H.264 video + AAC audio plays everywhere.
2. Put it in `backgrounds/<id>.mp4` (the headset plays this one), and put a copy of it plus a poster picture
   (JPG, about 640 px wide) in `dashboard/public/backgrounds/` as `<id>.mp4` and `<id>.jpg` (the dashboard's
   live preview plays the copy and shows the poster until it starts).
3. Add a line to `VIDEOS` in [`dashboard/lib/constants.ts`](dashboard/lib/constants.ts) — the id, an English and a
   Hebrew label, and `flat` (a screen) or `360`.

## 📁 Your own media (on the patient's device)

The patient can add **their own videos, images and music** — on the headset or a computer — without uploading
anything:

1. On the patient screen (in the headset browser, before entering VR) tap **Media on this device → Add files**.
2. The files are stored in that browser, on that device only. The dashboard receives just a list — name, type,
   length and a small thumbnail — and shows it under **On the patient's device**, in the Video group and next to
   the music tracks.
3. Pick a file in the dashboard. For a video or picture choose **Screen** or **360°** (a 2:1 picture is
   suggested as 360°); the **Sound** slider sets a video's own volume.

**Getting a file onto a Quest:** upload it to Google Drive (even from a phone), open Drive in the headset
browser and download the file, then add it from the Downloads folder in step 1. A USB cable to the headset's
*Download* folder works too.

Good to know: the library belongs to one device (another headset has its own); what plays is whatever that
device's browser supports (MP4/H.264, JPG/PNG, MP3/M4A — a file that can't be played is rejected when it is
added); pictures wider than 4096 px are scaled down when added so the headset doesn't run out of memory.

## 📍 Development status

- [x] **Stage 1** — Prototype: 3D ball moving on the Quest
- [x] **Stage 2** — Local control from within VR
- [x] **Stage 3** — Bilateral audio + synced vibration
- [x] **Stage 4** — Therapist dashboard + real-time sync (POC, single global room)
- [x] **Stage 5** — Polish: styling, environments, music, figure-8, rep counter
- [x] **Interweaves** — Floating text for the patient (preset phrases + free text)
- [x] **Milestone 1** — Next.js SaaS dashboard: Google sign-in, clinical design system
- [x] **Milestone 2** — Full control panel in the new dashboard: all parameters, saved presets, PIN
- [x] **Milestone 3** — Quest connects to a specific room by PIN (not a global room)
- [x] **Media backgrounds** — looping video / image backgrounds with sound, plus a per-device library of the patient's own media
- [ ] **Milestone 4** — Harden Firebase security rules, handle disconnects, deployment hardening

---

## ⚕️ Clinical note

This system is a **self-developed tool**, not an approved medical device. Clinical use with
patients may fall under the definition of a "medical device" — consult a regulatory authority
before actual use, and ensure informed consent. Consider motion sickness, light sensitivity,
and a safe physical space. Full details in [SPEC.md](SPEC.md).
