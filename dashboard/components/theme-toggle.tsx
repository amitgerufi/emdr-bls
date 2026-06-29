"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

// Light/dark segmented pill — mirrors LanguageToggle so the header chrome reads
// as one consistent control cluster. Renders a stable placeholder until mounted
// to avoid a theme/hydration mismatch (resolvedTheme is unknown server-side).
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mount guard is the documented next-themes pattern: resolvedTheme is unknown
  // during SSR, so we render a stable default until the client knows the theme,
  // avoiding a hydration mismatch. The one-time set is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate mount flag, runs once
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className={cn("flex items-center rounded-full border border-border bg-secondary p-1 shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label={t("lightMode")}
        aria-pressed={mounted && !isDark}
        className={cn(
          "grid place-items-center rounded-full p-1.5 transition-colors",
          mounted && !isDark ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        <Sun className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label={t("darkMode")}
        aria-pressed={mounted && isDark}
        className={cn(
          "grid place-items-center rounded-full p-1.5 transition-colors",
          mounted && isDark ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        <Moon className="size-3.5" />
      </button>
    </div>
  );
}
