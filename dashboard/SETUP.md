# Dashboard setup (Milestone 1)

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

> No Firestore or Realtime Database security rules are needed for Milestone 1
> (sign-in only). Rules are added in Milestone 4.

## 3. Environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local` with the web config values from step 2 (at minimum
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and
`NEXT_PUBLIC_FIREBASE_APP_ID` — the rest are pre-filled for this project).

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`. Click
**התחברות עם Google**, choose your account, and you'll land on `/dashboard`.

## What's here so far (Milestone 1)

- Premium clinical sign-in page (`app/login`).
- Google-only Firebase Auth + auth context (`lib/auth-context.tsx`).
- Auth-guarded dashboard shell placeholder (`app/dashboard`).
- Clinical design system (cyan + health-green on slate) in `app/globals.css`.
- The preserved session payload type (`lib/session-state.ts`) and all POC media
  catalogs (`lib/constants.ts`), plus room-scoped data helpers (`lib/room.ts`),
  ready for the Milestone 2 control panel.
