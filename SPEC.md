# EMDR System Spec in VR — Development Kickoff Document

> This document describes a system for EMDR therapy in a VR environment. It was written to serve as the starting point for development.
> Read it in full before starting work. For every technical decision — update the user and explain it in plain language, assuming no programming background.

---

## 0. Architecture update (2026-06-28) — the system is now a multi-tenant SaaS

This document was written when the system was still a **single global room** (one therapist, no authentication).
Since then, the system has migrated to a SaaS that supports multiple concurrent therapists, each with a separate room:

- The **therapist dashboard** is now a separate **Next.js** app (`dashboard/`), with
  **Google** sign-in, rather than the static file `dashboard.html` described in section 3 below.
  That legacy file has since been removed from the repo — the Next.js app is the only dashboard now.
- The **sync layer** is **Firebase Realtime Database** (not WebSocket/WebRTC as
  originally proposed in section 3), with a path **specific to each therapist** — `/sessions/{roomId}`
  and `/status/{roomId}` — instead of a single global path.
- The **VR experience** (`index.html`) asks for a 4-digit **PIN code** on launch, resolves it
  to the specific therapist's room (`/pins/{pin}`), and stays connected to that same room on the headset
  (saved to localStorage) — so multiple therapists can use the system without crossing paths.

**The rest of the document (sections 1, 4, 5, 6, 7) remains accurate for the clinical/UX behavior** —
the parameters, stimulation channels, and clinical/safety considerations haven't changed. Only section 3
(architecture) and the "single dashboard" assumption in "Stage 4" have actually been replaced. For install
details, live links, and the current security rules — see [README.md](README.md) and
[dashboard/SETUP.md](dashboard/SETUP.md).

---

## 1. Overview

The system is designed to produce **bilateral stimulation** for EMDR therapy, across three synchronized channels:
- **Visual** — an object (ball/light) moving across the patient's field of view
- **Audio** — a sound panning between the right and left ear in sync with the movement
- **Haptic** (vibration) — alternating vibration between the two controllers in sync

The system includes a **therapist control dashboard** that runs in parallel on a phone/tablet and controls the experience in real time.

---

## 2. Platform

- **Target hardware:** Meta Quest (2 / 3 / Pro)
- **Technology:** WebXR (runs directly from the Quest browser — no Unity/Unreal install, no app-store submission)
- **Languages:** HTML / JavaScript / CSS, with a WebXR library. Three.js is recommended for 3D rendering.
- **Important:** the user has no programming background. All code must come with an explanation, and every install/run step must be spelled out step by step.

---

## 3. Architecture

The system is built from three components:

1. **VR experience** (runs on the Quest) — displays the bilateral stimulation and the 3D environment.
2. **Therapist dashboard** (runs on a phone/tablet browser) — controls the parameters.
3. **Sync layer** — real-time communication between the dashboard and the VR client (WebSocket or WebRTC DataChannel recommended). Both devices on the same WiFi network.

**Alternative (simpler for a first version):** pre-configure inside the headset, then hand it to the patient — no real-time remote control. It may be worth building this first, then adding the sync layer.

---

## 4. Dashboard spec (therapist interface)

### Physical parameters (sliders)

| Parameter | Range | Default | Notes |
|-----------|-------|---------|-------|
| Movement speed | 1–9 | 5 | An odd-numbered scale so the middle (5) lands exactly at center |
| Height (Y axis) | -5 to +5 | 0 | 0 = eye height, positive = above, negative = below |
| Ball size | 1–9 | 5 | Controls the apparent size of the sphere |

> Important: the 1–9 and (-5 to +5) scales are aligned so the "neutral" point (speed 5, height 0, size 5) sits exactly at the middle of the track — all with an odd number of steps.

### Size vs. proximity (implementation decision)
The apparent size of the ball can be controlled two ways, which are visually interchangeable:
- **Actual size** — scaling the sphere itself (the mesh's `scale`), distance stays constant. **This is the recommended default** — simple and predictable.
- **Proximity (distance)** — moving the ball closer to/farther from the patient. Also changes the apparent size, but additionally affects the angular width the eyes need to track.

Recommended: implement the slider as "size" (actual size) for the first version. If the therapist later wants to control distance as a separate parameter too, an additional "proximity" slider can be added.

### Ball color
- A color picker, or a selection of preset color washes.
- Default: a calm hue with good contrast against the chosen background.
- Note: ensure sufficient contrast between the ball's color and the background so the patient can track it comfortably.

### Stimulation channels (on/off toggles)
- Visual stimulation
- Bilateral sound
- Controller vibration
- Background music

### Environment selection (dropdown)
- Calm room / nature scenery / beach / sky-space / neutral background

### Session control
- Start / stop button
- Session time timer
- Status indicator (ready / active / paused)
- Reset button
- **"Haptics only (no headset)" toggle** — enables a mode where the patient can remove the headset and experience only the vibration in their hands (see section 5 for implementation details)

### Interweaves — floating text for the patient (implemented)
- **Purpose:** displaying "interweaves" (cognitive interweaves) to the patient — calming/grounding phrases the therapist sends during the session.
- **Dashboard:** a grid of preset phrases (tap to send instantly) + a free-text field + a "hide" button. The phrase list can be edited in `INTERWEAVES` inside `dashboard/lib/constants.ts`.
- **Headset:** the text is shown as a 3D panel (`CanvasTexture`, supports RTL Hebrew) floating **above** the ball's path — fades in, holds for a duration based on text length, and fades out, without interrupting the ball's movement.
- **Control:** auto-hide based on text length, plus a "hide" button for immediate manual dismissal that overrides the automatic timer.

### Future options (not for the first version)
- Saving last-used settings / profiles per patient
- Separate X and Y movement range (in meters)
- Movement pattern: X only (standard) / Y only / simultaneous sine (diagonal)

---

## 5. VR experience spec

- **Visual stimulation — a real 3D ball:** the object is a **3D sphere** (a 3D mesh with volume and shading), not a flat circle/sprite. The ball **floats in space at a fixed distance from the patient** (e.g. 1.5–2 meters ahead) and moves in a left↔right sine wave. Controlled from the dashboard: speed (1–9), height (Y axis, -5 to +5 relative to eye height), **sphere size (1–9)**, and **sphere color**.
- **Depth and head tracking (required):** rendering must be **stereoscopic** (a separate image per eye → real depth perception) with **head tracking (6DoF)** — when the patient moves their head, the ball stays put in space. This is built-in WebXR behavior; make sure it's active and don't work around it with flat 2D rendering.
- **Environment — a static 3D background:** implemented as a **skybox / 360° photo** wrapping the patient from every direction (doesn't need to be dynamic — static is preferable, both for performance and for a calm atmosphere). The patient can look around and feel like they are *inside* the space. Switchable from the dashboard (calm room / nature / beach / sky / neutral).
- **Bilateral audio:** a sound with stereo panning that moves between the ears in full sync with the visual movement. Uses the Web Audio API (StereoPannerNode).
- **Haptics:** uses the WebXR Gamepad Haptics API — alternating vibration between the left and right controller in sync with the movement.
- **"Haptics only / no headset" mode (important):** the system needs to support a scenario where the patient **removes the headset and holds only the controllers**, experiencing the bilateral vibration in their hands only. The experience inside the headset keeps running in the background (the ball keeps moving) — it just isn't being watched.
  - **Obstacle:** the Quest's proximity sensor puts the device to sleep when it's taken off the head, which pauses the session and stops the vibration.
  - **Fix:** disable the proximity sensor so the device stays awake. Possible via SideQuest / Meta Quest Developer Hub / Quest Games Optimizer. (The Quest 3S has no proximity sensor — the issue doesn't exist there.)
  - **Why the vibration continues:** vibration is a controller function, not a headset one. As long as the session is alive, haptic pulses are sent to the controllers wirelessly regardless of whether the headset is being worn.
  - **Verify on-device** at Stage 3 (when haptics are added). Note: battery drains faster with the proximity sensor disabled.
  - **Audio in this mode:** the Quest's speakers are far from the ears when it's set down to the side; "vibration + audio without the headset" requires separate headphones.
- **Sync:** all three channels (visual + audio + haptic) must be synchronized to the same movement cycle — when the ball is at the right edge, the sound and vibration are on the right side, and so on.
- **Technology:** Three.js on top of WebXR. Three.js draws the sphere and the 3D environment; WebXR provides access to the headset, stereoscopic depth, and head tracking.

---

## 6. Recommended development stages

**Stage 1 — basic prototype (start here):**
- A WebXR experience running on the Quest (Three.js on top of WebXR)
- A **real 3D sphere** floating ~1.5m ahead, moving left-right in a sine wave
- A simple static skybox background (a single color/image is fine to start)
- Fixed speed hardcoded
- Stereoscopic depth and head tracking active
- Goal: confirm it loads and runs on the headset, and that the ball looks like a 3D object floating in space

**Stage 2 — adding local control:**
- A minimal in-VR interface for controlling speed and start/stop

**Stage 3 — audio and haptics:**
- Adding the bilateral sound and vibration, in full sync

**Stage 4 — separate dashboard + sync:**
- Building the dashboard on a phone/tablet
- A real-time communication layer with the VR client

**Stage 5 — polish:**
- Environments, background music, saving settings

---

## 7. Clinical and safety considerations (very important)

- **Regulation:** clinical use with patients may fall under the definition of a "medical device." It's recommended to consult a legal/regulatory authority (FDA / Ministry of Health) before actual clinical use.
- **Informed consent:** patients need to know this is a self-developed tool, not an approved product.
- **Protocol fit:** make sure the stimulation parameters match the EMDR approach the therapist works with.
- **Physical safety:** account for motion sickness, photosensitive epilepsy (avoid flashing), and a safe physical space for the patient wearing the headset.

---

## 8. Working instructions for Claude Code

- Start with Stage 1 only. Don't try to build everything at once.
- After each stage — explain to the user how to test it on the Quest, step by step.
- Every time you write code, add a short explanation of what it does.
- If installing a tool is needed, explain exactly what to click and where.
- Keep names clear and the file structure simple.
