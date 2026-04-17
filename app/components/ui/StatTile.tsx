"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { cn } from "./cn";

export type StatAccent = "brand" | "teal" | "amber" | "rose" | "purple" | "neutral";
export type StatTrendDirection = "up" | "down" | "flat";

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  /** Numeric value (will animate from 0) or a string (rendered as-is). */
  value: number | string;
  /** Unit rendered beside value (e.g. "km", "bpm"). */
  unit?: React.ReactNode;
  /** Trend label like "+8%" or "-2 min". */
  trend?: string;
  trendDirection?: StatTrendDirection;
  /** Optional inline sparkline (nodes of numbers). */
  sparkline?: number[];
  /** Accent color theme. */
  accent?: StatAccent;
  /** Decimal places used when animating numeric values (default: inferred). */
  decimals?: number;
  /** Icon rendered in the top right. */
  icon?: React.ReactNode;
  /** Compact density. */
  compact?: boolean;
}

const ACCENT_TEXT: Record<StatAccent, string> = {
  brand: "text-blue-600 dark:text-blue-400",
  teal: "text-teal-600 dark:text-teal-300",
  amber: "text-amber-600 dark:text-amber-300",
  rose: "text-rose-600 dark:text-rose-300",
  purple: "text-purple-600 dark:text-purple-300",
  neutral: "text-gray-700 dark:text-gray-200",
};

const ACCENT_SPARK: Record<StatAccent, string> = {
  brand: "stroke-blue-500",
  teal: "stroke-teal-500",
  amber: "stroke-amber-500",
  rose: "stroke-rose-500",
  purple: "stroke-purple-500",
  neutral: "stroke-gray-400",
};

const ACCENT_GLOW: Record<StatAccent, string> = {
  brand: "before:bg-blue-500/15",
  teal: "before:bg-teal-500/15",
  amber: "before:bg-amber-500/15",
  rose: "before:bg-rose-500/15",
  purple: "before:bg-purple-500/15",
  neutral: "before:bg-gray-500/10",
};

function formatNumber(n: number, decimals: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const w = 100;
  const h = 28;
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("w-full h-7 overflow-visible", className)}
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatTile({
  label,
  value,
  unit,
  trend,
  trendDirection,
  sparkline,
  accent = "brand",
  decimals,
  icon,
  compact,
  className,
  ...rest
}: StatTileProps) {
  const isNumber = typeof value === "number";
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState<string>(() =>
    isNumber ? formatNumber(0, decimals ?? 0) : String(value)
  );
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();

  const inferredDecimals =
    decimals ??
    (isNumber && !Number.isInteger(value) ? Math.min(2, String(value).split(".")[1]?.length ?? 1) : 0);

  useEffect(() => {
    if (!isNumber) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(String(value));
      return;
    }
    if (reduce) {
      setDisplay(formatNumber(value as number, inferredDecimals));
      return;
    }
    if (!inView) return;

    const unsubscribe = mv.on("change", (latest) => {
      setDisplay(formatNumber(latest, inferredDecimals));
    });
    const controls = animate(mv, value as number, {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [inView, inferredDecimals, isNumber, mv, reduce, value]);

  const trendDir =
    trendDirection ??
    (trend?.trim().startsWith("-") ? "down" : trend?.trim().startsWith("+") ? "up" : "flat");

  const trendColor =
    trendDir === "up"
      ? "text-teal-600 dark:text-teal-400"
      : trendDir === "down"
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500 dark:text-gray-400";

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={reduce ? undefined : inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl w-full max-w-full min-w-0",
        "bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl",
        "border border-gray-200/80 dark:border-white/10",
        "shadow-sm",
        "transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md",
        "before:absolute before:-inset-24 before:-z-10 before:blur-3xl before:opacity-60 before:pointer-events-none",
        ACCENT_GLOW[accent],
        compact ? "p-4" : "p-5",
        className
      )}
      {...(rest as Record<string, unknown>)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 break-words min-w-0">
          {label}
        </div>
        {icon && (
          <div className={cn("shrink-0", ACCENT_TEXT[accent])} aria-hidden>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5 min-w-0">
        <span
          className={cn(
            "display-heading font-bold tabular-nums text-gray-900 dark:text-white min-w-0 truncate",
            compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl lg:text-4xl"
          )}
        >
          {display}
        </span>
        {unit && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{unit}</span>
        )}
      </div>

      {(trend || sparkline?.length) && (
        <div className="mt-3 flex items-end justify-between gap-3">
          {trend && (
            <span className={cn("text-xs font-semibold", trendColor)}>
              {trendDir === "up" && "▲ "}
              {trendDir === "down" && "▼ "}
              {trend}
            </span>
          )}
          {sparkline?.length ? (
            <Sparkline data={sparkline} className={ACCENT_SPARK[accent]} />
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
