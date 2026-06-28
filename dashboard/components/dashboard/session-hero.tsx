"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { StatTile } from "@/components/dashboard/stat-tile";
import { useLanguage } from "@/lib/language-context";
import type { DictKey } from "@/lib/i18n";
import type { SessionPhase } from "@/lib/use-session-panel";

const PHASE_LABEL_KEY: Record<SessionPhase, DictKey> = {
  ready: "phaseReady",
  active: "phaseActive",
  paused: "phasePaused",
  between: "phaseBetween",
};

const PHASE_CLASS: Record<SessionPhase, string> = {
  ready: "border-border bg-muted text-muted-foreground",
  active: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  paused: "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  between: "border-primary/30 bg-primary/10 text-primary",
};

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

interface SessionHeroProps {
  phase: SessionPhase;
  sets: number;
  reps: number;
  setSecs: number;
  totalSecs: number;
  speed: number;
  onNewSession: () => void;
  onSpeedChange: (value: number) => void;
  onSpeedStep: (dir: 1 | -1) => void;
}

export function SessionHero({
  phase,
  sets,
  reps,
  setSecs,
  totalSecs,
  speed,
  onNewSession,
  onSpeedChange,
  onSpeedStep,
}: SessionHeroProps) {
  const { t } = useLanguage();
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-elevated-lg">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/8 to-accent/8 px-4 py-3">
        <span className={`rounded-full border px-3.5 py-1.5 text-[13px] font-bold shadow-sm ${PHASE_CLASS[phase]}`}>
          {t(PHASE_LABEL_KEY[phase])}
        </span>
        <button
          type="button"
          onClick={onNewSession}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground active:bg-muted"
        >
          <RotateCcw className="size-3.5" /> {t("newSession")}
        </button>
      </div>

      <div className="p-4">
        <div className="flex gap-2">
          <StatTile label={t("statSets")} value={String(sets)} />
          <StatTile label={t("statReps")} value={String(reps)} />
          <StatTile label={t("statSetTime")} value={fmt(setSecs)} />
          <StatTile label={t("statTotalTime")} value={fmt(totalSecs)} />
        </div>

        <div className="mt-3.5 rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary to-secondary/40 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[15px] font-bold">{t("speed")}</span>
            <span className="text-3xl font-extrabold tabular-nums text-primary">{speed}</span>
          </div>
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => onSpeedStep(-1)}
              aria-label={`${t("decrease")} ${t("speed")}`}
              className="flex size-[50px] flex-none items-center justify-center rounded-2xl border border-border bg-card text-2xl shadow-[0_1px_2px_rgba(16,42,54,0.06),0_4px_10px_-2px_rgba(16,42,54,0.1)] transition-shadow hover:shadow-md active:scale-95 active:shadow-inner"
            >
              −
            </button>
            <Slider
              min={1}
              max={9}
              step={1}
              value={[speed]}
              onValueChange={([v]) => onSpeedChange(v)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => onSpeedStep(1)}
              aria-label={`${t("increase")} ${t("speed")}`}
              className="flex size-[50px] flex-none items-center justify-center rounded-2xl border border-border bg-card text-2xl shadow-[0_1px_2px_rgba(16,42,54,0.06),0_4px_10px_-2px_rgba(16,42,54,0.1)] transition-shadow hover:shadow-md active:scale-95 active:shadow-inner"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
