"use client";

import type { CSSProperties } from "react";

export type Petal = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  color: string;
  centerColor?: string;
  delay: number;
  duration: number;
  rotate: number;
  opacity?: number;
};

/**
 * A handful of small four-petal blossoms, absolutely positioned and
 * gently bobbing/rotating in place. Purely decorative — aria-hidden,
 * pointer-events disabled, and motion is skipped under
 * prefers-reduced-motion so it never distracts from real content.
 */
export function FloatingPetals({
  petals,
  className = "",
}: {
  petals: Petal[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {petals.map((petal, index) => (
        <span
          key={index}
          className="sp-petal absolute"
          style={
            {
              top: petal.top,
              bottom: petal.bottom,
              left: petal.left,
              right: petal.right,
              opacity: petal.opacity ?? 0.85,
              "--sp-rotate": `${petal.rotate}deg`,
              "--sp-duration": `${petal.duration}s`,
              "--sp-delay": `${petal.delay}s`,
            } as CSSProperties
          }
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            style={{ transform: `rotate(${petal.rotate}deg)` }}
          >
            <circle cx="12" cy="6.5" r="4.4" fill={petal.color} />
            <circle cx="12" cy="17.5" r="4.4" fill={petal.color} />
            <circle cx="6.5" cy="12" r="4.4" fill={petal.color} />
            <circle cx="17.5" cy="12" r="4.4" fill={petal.color} />
            <circle
              cx="12"
              cy="12"
              r="3.1"
              fill={petal.centerColor ?? "#FFFBEF"}
            />
          </svg>
        </span>
      ))}

      <style>{`
        .sp-petal {
          animation: sp-petal-float var(--sp-duration) var(--sp-delay)
            ease-in-out infinite;
          will-change: transform;
        }

        @keyframes sp-petal-float {
          0%,
          100% {
            transform: translateY(0) rotate(var(--sp-rotate));
          }
          50% {
            transform: translateY(-12px) rotate(calc(var(--sp-rotate) + 10deg));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sp-petal {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}