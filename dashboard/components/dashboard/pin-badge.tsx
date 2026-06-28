"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function PinBadge({ pin }: { pin: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — non-critical, PIN is still visible on screen
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={t("copyPin")}
      className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[13px] font-bold tracking-wider text-secondary-foreground shadow-sm transition-shadow hover:shadow"
    >
      PIN {pin}
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}
