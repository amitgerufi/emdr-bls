"use client";

import { Activity } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

/** Product wordmark + clinical mark. Used on the sign-in and app shells. */
export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground glow-signal",
          compact ? "size-8" : "size-10",
        )}
      >
        <Activity className={compact ? "size-4" : "size-5"} strokeWidth={2.25} aria-hidden />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-display font-semibold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent",
            compact ? "text-[15px]" : "text-lg",
          )}
        >
          EMDR BLS
        </span>
        {!compact && (
          <span className="text-xs font-medium tracking-wide text-muted-foreground">{t("appTagline")}</span>
        )}
      </span>
    </div>
  );
}
