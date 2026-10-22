"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language-context";
import { ENV_COLORS, type GradientId, envPreviewSrc } from "@/lib/constants";
import type { DeviceMediaItem } from "@/lib/device-media";
import type { SessionState } from "@/lib/session-state";

/**
 * Mini real-time render of what the patient sees in the headset — ported
 * from the POC's `drawPreview()` (dashboard.html) so the therapist can
 * monitor the stimulation visually without putting the headset on.
 * Photo and video backgrounds are drawn as a still image (a video's poster).
 */

const imageCache = new Map<string, HTMLImageElement>();
function getImage(src: string): HTMLImageElement {
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return img;
}

interface LivePreviewProps {
  state: SessionState;
  iwText: string;
  /** Files on the patient's device — their thumbnails stand in for local backgrounds. */
  deviceMedia: DeviceMediaItem[];
}

export function LivePreview({ state, iwText, deviceMedia }: LivePreviewProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const iwTextRef = useRef(iwText);
  const deviceMediaRef = useRef(deviceMedia);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    deviceMediaRef.current = deviceMedia;
  }, [deviceMedia]);

  useEffect(() => {
    iwTextRef.current = iwText;
  }, [iwText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let phase = 0;
    let drawnSinX = 0; // actual drawn sin value — eases to 0 gently when motion isn't running
    let drawnSinY = 0;
    let last = performance.now();
    let raf = 0;
    // Fading motion trail — the ball's recent path, oscilloscope-style. Older
    // points fade out, giving the "command-deck monitor" its live feel.
    const trail: { x: number; y: number }[] = [];
    const TRAIL_MAX = 18;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      fit();
      const s = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const imageSrc = envPreviewSrc(s.env, (id) => deviceMediaRef.current.find((m) => m.id === id)?.thumb);
      if (imageSrc) {
        const img = getImage(imageSrc);
        if (img.complete && img.naturalWidth) {
          const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        } else {
          ctx.fillStyle = "#0a1622";
          ctx.fillRect(0, 0, W, H);
        }
      } else {
        const env = ENV_COLORS[s.env as GradientId] ?? ENV_COLORS.sky;
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, env.top);
        bg.addColorStop(1, env.bottom);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      if (s.running) {
        phase += dt * (0.2 + (s.speed - 1) * 0.15) * Math.PI;
        drawnSinX = Math.sin(phase);
        drawnSinY = Math.sin(phase * 2);
      } else {
        // stop / end of set — slowly return the ball to center, matches index.html
        const kReturn = 1 - Math.pow(0.3, dt); // ~2.5 seconds for a full return
        drawnSinX = drawnSinX * (1 - kReturn);
        drawnSinY = drawnSinY * (1 - kReturn);
      }
      const scaleFactor = H / 120;
      const swing = 0.3 + (s.swing - 1) * 0.175;
      const margin = 34 * scaleFactor;
      const cx = W / 2 + drawnSinX * ((W / 2 - margin) * (swing / 1.7));
      let cy = H / 2 - s.height * 6 * scaleFactor;
      if (s.pattern === "figure8") cy += drawnSinY * (H / 4) * (swing / 1.7);
      const r = (6 + (s.size - 1) * 2.2) * scaleFactor;

      // Fading motion trail — recorded only while running, drawn behind the ball.
      if (s.visual && !reduceMotion) {
        if (s.running) {
          trail.push({ x: cx, y: cy });
          if (trail.length > TRAIL_MAX) trail.shift();
        } else if (trail.length) {
          trail.shift();
        }
        for (let i = 0; i < trail.length; i++) {
          const p = trail[i];
          const f = (i + 1) / trail.length; // older = smaller/fainter
          const tr = r * (0.35 + f * 0.5);
          ctx.globalAlpha = f * 0.4;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, tr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
      glow.addColorStop(0, `${s.color}99`);
      glow.addColorStop(1, `${s.color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (s.visual) {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const text = iwTextRef.current;
      if (text) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = 13 * scaleFactor;
        ctx.font = `700 ${fontSize}px Arial, sans-serif`;
        const pad = 9 * scaleFactor;
        const bw = Math.min(W - 12 * scaleFactor, ctx.measureText(text).width + pad * 2);
        const bh = fontSize + pad;
        const bx = (W - bw) / 2;
        const by = 9 * scaleFactor;
        const radius = 7 * scaleFactor;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, radius);
        else ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(text, W / 2, by + bh / 2);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[#060e16] shadow-elevated glow-signal">
      <canvas ref={canvasRef} className="block h-[128px] w-full lg:h-[168px]" />

      {/* Telemetry overlay — instrument readouts in mono (Latin/numerals only). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2">
        <span
          className={`telemetry flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] ${
            state.running
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-white/10 text-white/70"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              state.running ? "bg-emerald-400 animate-signal-pulse" : "bg-white/50"
            }`}
          />
          {state.running ? "LIVE" : "IDLE"}
        </span>
        <span className="telemetry text-[10px] text-white/70">SPEED {state.speed}</span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 py-1.5 text-[11px] font-medium text-white/90">
        {t("livePreviewTag")}
      </div>
    </div>
  );
}
