/**
 * MarketingShinyCard
 *
 * Glass card with a pointer-tracked radial spotlight + gradient border that
 * brightens on hover. Same public API as before (children, className,
 * innerClassName) so existing callers keep working.
 */

"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "./ui/cn";

type MarketingShinyCardProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

type SpotlightStyle = CSSProperties & {
  "--spot-x"?: string;
  "--spot-y"?: string;
  "--spot-opacity"?: number;
};

export default function MarketingShinyCard({
  children,
  className = "",
  innerClassName = "",
}: MarketingShinyCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<SpotlightStyle>({
    "--spot-x": "50%",
    "--spot-y": "0%",
    "--spot-opacity": 0,
  });

  const handleMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStyle({
      "--spot-x": `${x}%`,
      "--spot-y": `${y}%`,
      "--spot-opacity": 1,
    });
  }, []);

  const handleLeave = useCallback(() => {
    setStyle((prev) => ({ ...prev, "--spot-opacity": 0 }));
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={style}
      className={cn(
        "group relative w-full max-w-full min-w-0 rounded-2xl p-[1px] transition-shadow duration-300",
        "shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-purple-500/15",
        "dark:shadow-blue-500/10 dark:hover:shadow-purple-500/20",
        className,
      )}
    >
      {/* Gradient border glow (static, brightens on hover) */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/40 via-purple-500/30 to-teal-400/30 opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/30 dark:via-purple-400/25 dark:to-teal-400/20"
      />

      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl",
          "border border-white/60 bg-white/90 backdrop-blur-md",
          "dark:border-white/10 dark:bg-gray-950/80",
          innerClassName,
        )}
      >
        {/* Base soft wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-blue-50/40 opacity-80 dark:from-white/5 dark:via-transparent dark:to-purple-950/30"
        />

        {/* Pointer-tracked spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: "var(--spot-opacity, 0)",
            background:
              "radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(99,102,241,0.18), rgba(168,85,247,0.10) 30%, transparent 60%)",
          }}
        />

        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}
