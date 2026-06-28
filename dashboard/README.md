# EMDR BLS — Therapist Dashboard

Next.js (App Router) SaaS dashboard for the EMDR BLS bilateral-stimulation
system. Each therapist signs in with Google, gets a permanent room + 4-digit
PIN, and controls the VR headset client (`../index.html`) live via Firebase.

See [SETUP.md](SETUP.md) for Firebase Console steps, security rules, and
environment variables — start there before running anything locally.

```bash
npm install
npm run dev   # http://localhost:3000
```

Production: deployed to Vercel manually via `vercel --prod` (no Git auto-deploy
configured for this monorepo subdirectory — see project memory / SETUP.md).
