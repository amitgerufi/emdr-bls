"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/language-context";
import { INTERWEAVES } from "@/lib/constants";

interface InterweaveSectionProps {
  iwStatusText: string;
  onSend: (text: string) => void;
  onHide: () => void;
}

export function InterweaveSection({ iwStatusText, onSend, onHide }: InterweaveSectionProps) {
  const { t, lang } = useLanguage();
  const [value, setValue] = useState("");
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  const sendPreset = (text: string, index: number) => {
    onSend(text);
    setFlashIndex(index);
    setTimeout(() => setFlashIndex((i) => (i === index ? null : i)), 350);
  };

  const sendFree = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2.5 text-xs text-muted-foreground">{t("presetPhrasesHint")}</p>
        <div className="grid grid-cols-2 gap-2">
          {INTERWEAVES.map((label, i) => (
            <button
              key={label.en}
              type="button"
              onClick={() => sendPreset(label[lang], i)}
              className={`min-h-[50px] rounded-xl border px-2 py-2.5 text-center text-[13px] font-semibold leading-snug transition-all active:scale-95 ${
                flashIndex === i
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-secondary-foreground"
              }`}
            >
              {label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs text-muted-foreground">{t("freeText")}</p>
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendFree()}
            placeholder={t("freeTextPlaceholder")}
            autoComplete="off"
          />
          <Button type="button" onClick={sendFree}>
            {t("send")}
          </Button>
        </div>
      </div>

      <Button type="button" variant="outline" disabled={!iwStatusText} onClick={onHide} className="w-full gap-2">
        <X className="size-4" /> {t("hideTextFromPatient")}
      </Button>

      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
        {iwStatusText
          ? `${t("iwStatusShowingPrefix")} "${iwStatusText}" — ${t("iwStatusShowingSuffix")}`
          : t("iwStatusNone")}
      </p>
    </div>
  );
}
