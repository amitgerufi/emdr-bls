"use client";

import { Check, Play } from "lucide-react";
import { FieldSlider } from "@/components/dashboard/field-slider";
import { useLanguage } from "@/lib/language-context";
import { ENV_COLORS, GRADIENT_IDS, MUSIC, PHOTOS, VIDEOS, envName, isMediaEnv, videoEnv } from "@/lib/constants";
import type { BgProjection, SessionState } from "@/lib/session-state";

interface AmbianceSectionProps {
  env: string;
  music: string;
  musicVolume: number;
  bgVolume: number;
  setEnv: (id: string, projection?: BgProjection) => void;
  setMusic: (id: string) => void;
  setField: <K extends keyof SessionState>(key: K, value: SessionState[K]) => void;
  step: <K extends keyof SessionState>(key: K, dir: 1 | -1, min: number, max: number) => void;
}

export function AmbianceSection({
  env,
  music,
  musicVolume,
  bgVolume,
  setEnv,
  setMusic,
  setField,
  step,
}: AmbianceSectionProps) {
  const { t, lang } = useLanguage();
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2.5 text-xs text-muted-foreground">{t("background")}</p>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_IDS.map((id) => {
            const c = ENV_COLORS[id];
            const selected = env === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setEnv(id)}
                style={{ backgroundImage: `linear-gradient(180deg, ${c.top}, ${c.bottom})` }}
                className={`relative flex h-[60px] items-end justify-center overflow-hidden rounded-xl border-2 ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                <span className="w-full bg-gradient-to-t from-black/70 to-transparent px-1 pb-1 text-[11px] font-semibold text-white">
                  {envName(id, lang)}
                </span>
                {selected && <Check className="absolute top-1 right-1.5 size-3.5 text-white drop-shadow" />}
              </button>
            );
          })}
          {PHOTOS.map((p) => {
            const selected = env === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setEnv(p.id)}
                style={{ backgroundImage: `url(/backgrounds/${p.id}.jpg)` }}
                className={`relative flex h-[60px] items-end justify-center overflow-hidden rounded-xl border-2 bg-muted bg-cover bg-center ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                <span className="w-full bg-gradient-to-t from-black/70 to-transparent px-1 pb-1 text-[10.5px] leading-tight font-semibold text-white">
                  {p.label[lang]}
                </span>
                {selected && <Check className="absolute top-1 right-1.5 size-3.5 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs text-muted-foreground">{t("backgroundVideo")}</p>
        <div className="grid grid-cols-3 gap-2">
          {VIDEOS.map((v) => {
            const selected = env === videoEnv(v.id);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setEnv(videoEnv(v.id), v.projection)}
                style={{ backgroundImage: `url(/backgrounds/${v.id}.jpg)` }}
                className={`relative flex h-[60px] items-end justify-center overflow-hidden rounded-xl border-2 bg-muted bg-cover bg-center ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                <span className="absolute top-1 left-1.5 flex size-4 items-center justify-center rounded-full bg-black/55">
                  <Play className="size-2.5 fill-white text-white" aria-hidden />
                </span>
                <span className="w-full bg-gradient-to-t from-black/70 to-transparent px-1 pb-1 text-[10.5px] leading-tight font-semibold text-white">
                  {v.label[lang]}
                </span>
                {selected && <Check className="absolute top-1 right-1.5 size-3.5 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
        {isMediaEnv(env) && (
          <div className="pt-3">
            <FieldSlider
              label={t("bgSound")}
              value={bgVolume}
              min={0}
              max={9}
              onChange={(v) => setField("bgVolume", v)}
              onStep={(d) => step("bgVolume", d, 0, 9)}
            />
          </div>
        )}
      </div>

      <div>
        <p className="mb-2.5 text-xs text-muted-foreground">{t("backgroundMusic")}</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMusic("off")}
            className={`min-h-[54px] rounded-xl border px-2 py-2 text-xs font-semibold ${
              music === "off"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary text-secondary-foreground"
            }`}
          >
            {t("none")}
          </button>
          {MUSIC.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMusic(m.id)}
              className={`min-h-[54px] rounded-xl border px-2 py-2 text-xs font-semibold ${
                music === m.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-secondary-foreground"
              }`}
            >
              {m.label[lang]}
              <span className="mt-0.5 block text-[9.5px] font-medium tabular-nums opacity-60">{m.dur}</span>
            </button>
          ))}
        </div>
      </div>

      <FieldSlider
        label={t("volume")}
        value={musicVolume}
        min={0}
        max={9}
        onChange={(v) => setField("musicVolume", v)}
        onStep={(d) => step("musicVolume", d, 0, 9)}
      />

      <p className="text-[11.5px] leading-relaxed text-muted-foreground">{t("musicLoopHint")}</p>
    </div>
  );
}
