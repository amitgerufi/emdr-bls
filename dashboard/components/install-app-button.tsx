"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's pre-standard flag — not in the DOM lib types.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Header control that lets a therapist install the dashboard to their phone's
// home screen. Chrome/Edge/Android expose a native "beforeinstallprompt" we
// can trigger programmatically; Safari/iOS never fires it, so we fall back to
// a one-line "Share → Add to Home Screen" hint there (and everywhere else the
// deferred prompt hasn't arrived yet, since criteria/timing vary by browser).
export function InstallAppButton() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      // One-time sync from a browser API unavailable during SSR — mirrors
      // the mount-guard pattern in ThemeToggle.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads navigator/matchMedia, unavailable at render time
      setHidden(true);
      return;
    }
    setIos(isIOS());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installed = () => setHidden(true);
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (hidden) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setHidden(true);
      setDeferred(null);
      return;
    }
    toast.info(t("installAppTitle"), {
      description: ios ? t("installIOSHint") : t("installAndroidHint"),
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 rounded-full"
      onClick={handleClick}
      aria-label={t("installApp")}
      title={t("installApp")}
    >
      <Download className="size-4" />
    </Button>
  );
}
