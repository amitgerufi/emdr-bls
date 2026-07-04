"use client";

import { useEffect } from "react";

// Fire-and-forget registration — this is what makes the dashboard eligible
// for "Install app" / "Add to Home Screen" across Chrome, Edge, and Android.
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
