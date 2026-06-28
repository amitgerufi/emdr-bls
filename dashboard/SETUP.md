# Dashboard setup

The therapist dashboard — Next.js (App Router) + Tailwind v4 + shadcn/ui + Firebase.

## Prerequisites

- Node.js 20.9+ and npm.

## 1. Install dependencies

```bash
cd dashboard
npm install
```

## 2. Firebase Console steps (only you can do these)

In the [Firebase Console](https://console.firebase.google.com/) for project **`emdr-bls-b9cd1`**:

1. **Enable Google Sign-In** — Build → Authentication → Sign-in method → add **Google** and enable it.
2. **Authorized domains** — under the same Authentication settings, make sure
   `localhost` is listed (it is by default). Add your Vercel domain later when you deploy.
3. **Get the web config** — Project settings (gear icon) → *General* → *Your apps*.
   If there's no Web app yet, create one (`</>` icon). Copy the config values.

## 3. Database rules (required for Milestone 2 + Milestone 3)

Milestone 1 (sign-in only) needed no rules. Milestone 2 writes live session
data, so the dashboard needs read/write access. Paste these **minimal**
rules now — they're tightened further (rate limits, schema validation) in
Milestone 4.

**Realtime Database → Rules:**

```json
{
  "rules": {
    "sessions": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null && auth.uid === $roomId"
      }
    },
    "status": {
      "$roomId": {
        ".read": "auth != null && auth.uid === $roomId",
        ".write": true
      }
    },
    "pins": {
      "$pin": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

**Firestore → Rules:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /therapists/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /presets/{presetId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

(`sessions` read is open so the unauthenticated patient/headset client —
wired up in Milestone 3 — can stream live state via `EventSource`; it
contains no patient-identifying data, only BLS parameters like speed/color/
environment. `status` write is left open so that same client can send its
heartbeat. `pins` read is open so a patient can resolve a PIN to a room
without signing in. Writing to `sessions` always stays restricted to the
owning therapist.)

> **⚠️ If you applied the Milestone 2 version of these rules before
> 2026-06-28:** the old `sessions.$roomId.read` rule required
> `auth.uid === $roomId`, which silently blocks the Milestone 3 headset from
> ever reading session state (confirmed live via `curl` — returns
> `"Permission denied"`). Open **Firebase Console → emdr-bls-b9cd1 →
> Realtime Database → Rules**, change that one line to `".read": true`, and
> click **Publish**. Nothing else in the ruleset needs to change.

## 4. Environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local` with the web config values from step 2 (at minimum
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and
`NEXT_PUBLIC_FIREBASE_APP_ID` — the rest are pre-filled for this project).

## 5. Run

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`. Click
**התחברות עם Google**, choose your account, and you'll land on `/dashboard`
with your room's PIN and the full control panel.

## What's here so far

**Milestone 1** — premium clinical sign-in (`app/login`), Google-only Firebase
Auth + context (`lib/auth-context.tsx`), clinical design system (cyan +
health-green on slate) in `app/globals.css`.

**Milestone 2** — the full control panel (`app/dashboard`, `components/dashboard/`):
- Every therapist gets one permanent room (`roomId === uid`) and a 4-digit PIN,
  created on first login and shown in the header (`lib/room.ts` `ensureRoom`).
- Live writes to `/sessions/{roomId}` for every control: speed, swing/height/
  pattern, visual/audio/haptic channels + their volumes, background + music,
  color, hapticOnly — sliders throttled, everything else immediate
  (`lib/use-session-panel.ts`).
- Three-tier session control (play/pause · end set · new session), dual
  timers, set/reps counters, connection badge driven by `/status/{roomId}`.
- Interweave: 10 preset phrases + free text, with the same fade timing as the
  POC.
- Saved presets (name + sensory/environment settings) under
  `therapists/{uid}/presets` in Firestore (`lib/presets.ts`).

**Milestone 3** — the headset client (`index.html`, repo root) now pairs with
a specific therapist's room instead of one global, shared session:
- PIN-entry screen on load; resolves the 4-digit PIN to a `roomId` via
  `/pins/{pin}`, then streams `/sessions/{roomId}` and reports its heartbeat
  to `/status/{roomId}` — replacing the POC's global `/emdr.json` and
  `/status.json` paths.
- The resolved `roomId` is cached in `localStorage` so the same headset
  reconnects automatically next time, with a small "החלפת קוד PIN" link to
  re-pair.
- Requires the `sessions.$roomId.read: true` rule above — see the warning
  callout if you set up rules before this milestone landed.
