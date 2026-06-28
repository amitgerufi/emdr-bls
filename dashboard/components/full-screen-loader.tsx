"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

/** Centered loading state used while auth resolves / redirects happen. */
export function FullScreenLoader({ label }: { label?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
        <span className="text-sm">{label ?? t("loading")}</span>
      </div>
    </div>
  );
}
