"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";

export function ConnectionBadge({ connected }: { connected: boolean }) {
  const { t } = useLanguage();
  return (
    <Badge
      variant="outline"
      className={
        connected
          ? "h-7 gap-1.5 px-2.5 border-emerald-600/30 bg-emerald-600/10 text-emerald-700 shadow-sm dark:text-emerald-400"
          : "h-7 gap-1.5 px-2.5 border-destructive/30 bg-destructive/10 text-destructive shadow-sm"
      }
    >
      <span className={`size-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-destructive"}`} />
      {connected ? t("headsetConnected") : t("disconnected")}
    </Badge>
  );
}
