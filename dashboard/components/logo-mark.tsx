"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * VR headset (contour) with the bilateral ball mid-swing, cyan → green.
 * Same artwork as the PWA app icon (see branding-src/icon.svg) — this is
 * the in-app rendering, as an inline SVG so it stays crisp at any size.
 */
export function LogoMark({ className }: { className?: string }) {
  const uid = useId();
  const bg = `logo-bg-${uid}`;
  const halo = `logo-halo-${uid}`;
  const mark = `logo-mark-${uid}`;
  const soft = `logo-soft-${uid}`;

  return (
    <svg viewBox="0 0 512 512" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={bg} x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#122334" />
          <stop offset="1" stopColor="#070d14" />
        </linearGradient>
        <radialGradient id={halo} cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.14" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={mark} x1="106" y1="260" x2="406" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2cd8f0" />
          <stop offset="1" stopColor="#35df9f" />
        </linearGradient>
        <filter id={soft} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <rect width="512" height="512" rx="114" fill={`url(#${bg})`} />
      <rect width="512" height="512" rx="114" fill={`url(#${halo})`} />
      <rect x="1.5" y="1.5" width="509" height="509" rx="112.5" fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="3" />

      {/* soft grounding shadow */}
      <path
        d="M 172 184 L 340 184 C 376.5 184 406 213.5 406 250 L 406 270 C 406 306.5 376.5 336 340 336 L 318 336 C 310 302 285 284 256 284 C 227 284 202 302 194 336 L 172 336 C 135.5 336 106 306.5 106 270 L 106 250 C 106 213.5 135.5 184 172 184 Z"
        transform="translate(0 16)"
        fill="none"
        stroke="#000000"
        strokeWidth="28"
        opacity="0.4"
        filter={`url(#${soft})`}
      />

      {/* VR headset as contour */}
      <path
        d="M 172 184 L 340 184 C 376.5 184 406 213.5 406 250 L 406 270 C 406 306.5 376.5 336 340 336 L 318 336 C 310 302 285 284 256 284 C 227 284 202 302 194 336 L 172 336 C 135.5 336 106 306.5 106 270 L 106 250 C 106 213.5 135.5 184 172 184 Z"
        fill="none"
        stroke={`url(#${mark})`}
        strokeWidth="28"
        strokeLinejoin="round"
      />

      {/* the ball, mid-swing toward the right, with a fading trail behind it */}
      <circle cx="330" cy="244" r="17" fill="#f2fffb" />
      <circle cx="291" cy="244" r="10" fill="#f2fffb" opacity="0.4" />
      <circle cx="263" cy="244" r="6.5" fill="#f2fffb" opacity="0.18" />
    </svg>
  );
}
