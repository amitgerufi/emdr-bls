# 🌐 EMDR BLS — Bilateral Stimulation in Virtual Reality

> A system for **EMDR** therapy in a **VR** environment, producing synchronized bilateral
> stimulation across three channels — visual, auditory, and tactile — with a real-time
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

- **Session control** — start / pause / reset, elapsed-time timer, and rep counter
- **Live headset connection** — indicator showing whether the headset is connected
- **Motion** — speed, width, height, and pattern: ⟷ horizontal or ∞ figure-8
- **Ball** — size, color, and a live preview of exactly what the patient sees
- **Background environments** — color washes (room / nature / beach / sky / neutral) plus **360° photo backgrounds** that wrap around the patient
- **Channels** — independent on/off per channel, plus a "haptics only (no headset)" mode
- **Background music** — track selection (8 meditation tracks) with volume control
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

**Legacy version (POC, no PIN, single global room):** `dashboard.html`
(https://amitgerufi.github.io/emdr-bls/dashboard.html) stays live as a reference
artifact only — not for regular use, and not synced with the new dashboard.

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
dashboard.html    ← legacy dashboard (POC, single global room) — reference artifact
dashboard/        ← the new dashboard: multi-tenant Next.js SaaS (see dashboard/SETUP.md)
backgrounds/      ← 360° photo backgrounds (equirectangular, 4096×2048)
music/            ← background music files
SPEC.md           ← original spec document + architecture updates
```

---

## 🎵 Adding music

Drop an MP3 file into the [`music/`](music/) folder and add a line to the `MUSIC` list in
[`dashboard/lib/constants.ts`](dashboard/lib/constants.ts) (file name + label) — it will
show up as a button in the new dashboard. See [music/README.txt](music/README.txt) for details.

---

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
- [ ] **Milestone 4** — Harden Firebase security rules, handle disconnects, deployment hardening

---

## ⚕️ Clinical note

This system is a **self-developed tool**, not an approved medical device. Clinical use with
patients may fall under the definition of a "medical device" — consult a regulatory authority
before actual use, and ensure informed consent. Consider motion sickness, light sensitivity,
and a safe physical space. Full details in [SPEC.md](SPEC.md).
