"use client";

import { Minus, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/lib/language-context";

interface FieldSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  onStep: (dir: 1 | -1) => void;
  formatValue?: (value: number) => string;
}

export function FieldSlider({
  label,
  value,
  min,
  max,
  onChange,
  onStep,
  formatValue,
}: FieldSliderProps) {
  const { t } = useLanguage();
  const display = formatValue ? formatValue(value) : String(value);
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-1 items-center gap-2.5">
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label={`${t("decrease")} ${label}`}
          className="flex size-9 flex-none items-center justify-center rounded-lg border border-border bg-secondary text-foreground shadow-sm transition-shadow hover:shadow active:scale-95 active:shadow-inner"
        >
          <Minus className="size-4" />
        </button>
        <Slider
          min={min}
          max={max}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label={`${t("increase")} ${label}`}
          className="flex size-9 flex-none items-center justify-center rounded-lg border border-border bg-secondary text-foreground shadow-sm transition-shadow hover:shadow active:scale-95 active:shadow-inner"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <span className="w-9 shrink-0 text-center text-base font-bold tabular-nums">{display}</span>
    </div>
  );
}
