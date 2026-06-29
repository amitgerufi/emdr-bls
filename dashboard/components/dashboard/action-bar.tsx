"use client";

import { CheckCircle2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

interface ActionBarProps {
  running: boolean;
  endSetDisabled: boolean;
  onTogglePlay: () => void;
  onEndSet: () => void;
}

export function ActionBar({ running, endSetDisabled, onTogglePlay, onEndSet }: ActionBarProps) {
  const { t } = useLanguage();
  // A set is "in progress" once it has started, even while paused mid-set —
  // in that state the main button's job is to end the set, since that's
  // what therapists mean by "stop" in practice. True mid-set pausing is the
  // rare case and lives in the small secondary button instead.
  const setInProgress = !endSetDisabled;

  return (
    <div className="glass fixed inset-x-0 bottom-0 z-30 rounded-none border-x-0 border-b-0 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-elevated-lg">
      <div className="mx-auto flex max-w-3xl gap-2.5 lg:max-w-6xl lg:px-2">
        <Button
          type="button"
          onClick={setInProgress ? onEndSet : onTogglePlay}
          className={`h-14 flex-1 gap-2 text-base font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${
            setInProgress
              ? "bg-gradient-to-b from-primary to-primary/90 shadow-primary/25 hover:from-primary/90 hover:to-primary/80"
              : "bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-emerald-600/25 hover:from-emerald-500/90 hover:to-emerald-600/90 animate-signal-pulse"
          }`}
        >
          {setInProgress ? <CheckCircle2 className="size-5" /> : <Play className="size-5" />}
          {setInProgress ? t("endSet") : t("start")}
        </Button>

        {setInProgress && (
          <Button
            type="button"
            variant="outline"
            onClick={onTogglePlay}
            aria-label={running ? t("pauseMidSet") : t("resume")}
            title={running ? t("pauseMidSet") : t("resume")}
            className="h-14 w-14 shrink-0 border-border text-muted-foreground shadow-sm transition-transform hover:bg-secondary active:scale-[0.98]"
          >
            {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
