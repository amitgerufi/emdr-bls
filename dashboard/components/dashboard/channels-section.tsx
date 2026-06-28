"use client";

import { Eye, Vibrate, Volume2 } from "lucide-react";
import { ChannelToggle } from "@/components/dashboard/channel-toggle";
import { FieldSlider } from "@/components/dashboard/field-slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";
import { COLOR_PRESETS } from "@/lib/constants";
import type { SessionState } from "@/lib/session-state";

interface ChannelsSectionProps {
  state: SessionState;
  setField: <K extends keyof SessionState>(key: K, value: SessionState[K]) => void;
  step: <K extends keyof SessionState>(key: K, dir: 1 | -1, min: number, max: number) => void;
  toggle: (key: "visual" | "audio" | "haptic" | "hapticOnly") => void;
  setColor: (hex: string) => void;
}

export function ChannelsSection({ state, setField, step, toggle, setColor }: ChannelsSectionProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <ChannelToggle icon={<Eye className="size-4" />} name={t("channelVisual")} on={state.visual} onToggle={() => toggle("visual")}>
        <FieldSlider
          label={t("size")}
          value={state.size}
          min={1}
          max={9}
          onChange={(v) => setField("size", v)}
          onStep={(d) => step("size", d, 1, 9)}
        />
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {COLOR_PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => setColor(hex)}
              aria-label={hex}
              style={{ background: hex }}
              className={`size-9 rounded-full border-[3px] transition-transform active:scale-90 ${
                state.color === hex ? "border-foreground" : "border-transparent"
              }`}
            />
          ))}
          <input
            type="color"
            value={state.color}
            onChange={(e) => setColor(e.target.value)}
            title={t("freeColor")}
            className="size-9 cursor-pointer rounded-full border-2 border-border bg-transparent p-0.5"
          />
        </div>
      </ChannelToggle>

      <Separator />

      <ChannelToggle icon={<Volume2 className="size-4" />} name={t("channelAudio")} on={state.audio} onToggle={() => toggle("audio")}>
        <FieldSlider
          label={t("volume")}
          value={state.audioVolume}
          min={0}
          max={9}
          onChange={(v) => setField("audioVolume", v)}
          onStep={(d) => step("audioVolume", d, 0, 9)}
        />
      </ChannelToggle>

      <Separator />

      <ChannelToggle icon={<Vibrate className="size-4" />} name={t("channelHaptic")} on={state.haptic} onToggle={() => toggle("haptic")}>
        <FieldSlider
          label={t("strength")}
          value={state.hapticStrength}
          min={1}
          max={9}
          onChange={(v) => setField("hapticStrength", v)}
          onStep={(d) => step("hapticStrength", d, 1, 9)}
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[13.5px] text-muted-foreground">{t("hapticOnly")}</span>
          <Switch checked={state.hapticOnly} onCheckedChange={() => toggle("hapticOnly")} />
        </div>
        {state.hapticOnly && (
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">{t("hapticOnlyHelp")}</p>
        )}
      </ChannelToggle>
    </div>
  );
}
