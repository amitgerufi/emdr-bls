"use client";

import { Activity } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

/** Product wordmark + clinical mark. Used on the sign-in and app shells. */
export function Brand({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Activity className="size-5" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-bold tracking-tight">EMDR BLS</span>
        <span className="text-xs font-medium text-muted-foreground">{t("appTagline")}</span>
      </span>
    </div>
  );
}
