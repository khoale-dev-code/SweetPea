import type { ReactNode } from "react";

type MotionBlockProps = {
  children: ReactNode;
  className?: string;
  /**
   * Kept for backward compatibility with existing call sites
   * (e.g. `<ContactHoverCard delay={index * 0.05}>`), but intentionally
   * unused now — there is no animation left to delay.
   */
  delay?: number;
};

/**
 * These used to wrap children in `motion.div` for scroll-reveal /
 * hover / floating animations. That dependency kept causing problems
 * (a console warning baked into the library, then a hydration
 * mismatch, then broken rendering) tied to `prefers-reduced-motion`
 * handling. Removing the animation library entirely — rendering a
 * plain `div` with the same className — removes every one of those
 * failure points at the source. No "use client" is needed anymore
 * since there are no hooks or browser APIs involved.
 */

export function ContactReveal({ children, className = "" }: MotionBlockProps) {
  return (
    <div data-contact-motion-version="4.7" className={className}>
      {children}
    </div>
  );
}

export function ContactHoverCard({ children, className = "" }: MotionBlockProps) {
  return <div className={className}>{children}</div>;
}

export function ContactFloat({ children, className = "" }: MotionBlockProps) {
  return <div className={className}>{children}</div>;
}