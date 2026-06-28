/**
 * Firebase client initialization (project: emdr-bls-b9cd1).
 *
 * Config comes from NEXT_PUBLIC_FIREBASE_* env vars (see .env.example). These
 * are client-exposed by design — Firebase web config is not a secret; access
 * is governed by Auth + Security Rules (rules land in Milestone 4).
 *
 * Initialization is LAZY and client-side: the service getters are only called
 * from client effects / event handlers, never during server render or build
 * prerender. This keeps `next build` from needing real credentials and avoids
 * spinning up Firebase on the server, where it isn't used.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let authInstance: Auth | undefined;
let dbInstance: Database | undefined;
let firestoreInstance: Firestore | undefined;

export function getFirebaseAuth(): Auth {
  return (authInstance ??= getAuth(getFirebaseApp()));
}

export function getFirebaseDb(): Database {
  return (dbInstance ??= getDatabase(getFirebaseApp()));
}

export function getFirebaseFirestore(): Firestore {
  return (firestoreInstance ??= getFirestore(getFirebaseApp()));
}

// Google-only sign-in (per product spec). Constructing a provider is safe on
// any environment (no credential validation). Always show the account chooser.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
