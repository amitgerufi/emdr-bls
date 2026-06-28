"use client";

import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn("flex items-center rounded-full border border-border bg-secondary p-1 shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors",
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("he")}
        className={cn(
          "rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors",
          lang === "he" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        עב
      </button>
    </div>
  );
}
