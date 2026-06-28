"use client";

import { ArrowLeftRight, Infinity as InfinityIcon } from "lucide-react";
import { FieldSlider } from "@/components/dashboard/field-slider";
import { useLanguage } from "@/lib/language-context";
import type { SessionState } from "@/lib/session-state";

interface MotionSectionProps {
  state: SessionState;
  setField: <K extends keyof SessionState>(key: K, value: SessionState[K]) => void;
  step: <K extends keyof SessionState>(key: K, dir: 1 | -1, min: number, max: number) => void;
  setPattern: (pattern: SessionState["pattern"]) => void;
}

export function MotionSection({ state, setField, step, setPattern }: MotionSectionProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <FieldSlider
        label={t("width")}
        value={state.swing}
        min={1}
        max={9}
        onChange={(v) => setField("swing", v)}
        onStep={(d) => step("swing", d, 1, 9)}
      />
      <FieldSlider
        label={t("height")}
        value={state.height}
        min={-5}
        max={5}
        onChange={(v) => setField("height", v)}
        onStep={(d) => step("height", d, -5, 5)}
        formatValue={(v) => (v > 0 ? `+${v}` : String(v))}
      />
      <div className="flex items-center gap-3 pt-1">
        <span className="w-16 shrink-0 text-sm text-muted-foreground">{t("pattern")}</span>
        <div className="flex flex-1 gap-2">
          {(["horizontal", "figure8"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPattern(p)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                state.pattern === p
                  ? "border-primary bg-primary/10 text-primary shadow-[0_1px_3px_rgba(8,145,178,0.25)]"
                  : "border-border bg-secondary text-muted-foreground hover:bg-secondary/70"
              }`}
            >
              {p === "horizontal" ? (
                <ArrowLeftRight className="size-4" />
              ) : (
                <InfinityIcon className="size-4" />
              )}
              {p === "horizontal" ? t("patternHorizontal") : t("patternFigure8")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
