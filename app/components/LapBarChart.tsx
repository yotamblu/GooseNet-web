/**
 * LapBarChart Component
 *
 * Each lap is rendered as a bar whose width encodes distance (relative to the
 * total workout) and height encodes pace (faster laps → taller bars). Bars are
 * filled with a smooth brand→accent gradient, with rounded tops. Bars animate
 * grow-from-bottom on mount with a tight stagger and show a tooltip on hover.
 *
 * Exported props are unchanged from the previous version so external consumers
 * (workout detail page, planned workout pages) continue to work as-is.
 */

"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./ui/cn";

interface Lap {
  lapDistanceInKilometers: number;
  lapDurationInSeconds: number;
  lapPaceInMinKm: number;
  avgHeartRate: number;
}

interface LapBarChartProps {
  laps: Lap[];
  className?: string;
  selectedLapIndex?: number | null;
  onLapClick?: (index: number | null) => void;
}

function formatPace(pace: number): string {
  if (!pace || !isFinite(pace) || pace <= 0) return "0:00";
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LapBarChart({
  laps,
  className = "",
  selectedLapIndex = null,
  onLapClick,
}: LapBarChartProps) {
  const reduce = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (laps.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-gray-200 dark:border-white/10",
          "bg-white dark:bg-gray-900/60 p-6",
          className
        )}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Lap Performance</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No lap data available</p>
      </div>
    );
  }

  const totalDistance = laps.reduce((sum, lap) => sum + lap.lapDistanceInKilometers, 0) || 1;
  const paces = laps.map((lap) => lap.lapPaceInMinKm);
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const paceRange = maxPace - minPace || 1;

  // Normalize 0..1 where 0 = slowest, 1 = fastest
  const getPaceIntensity = (pace: number): number =>
    (maxPace - pace) / paceRange;

  const bars = laps.map((lap, index) => {
    const intensity = getPaceIntensity(lap.lapPaceInMinKm);
    const heightPct = Math.max(intensity * 100, 12);
    const widthPct = (lap.lapDistanceInKilometers / totalDistance) * 100;
    return { index, lap, intensity, heightPct, widthPct };
  });

  const chartHeight = 220;
  const chartPadding = 16;
  const activeIndex = hoverIndex ?? selectedLapIndex ?? null;
  const activeBar = activeIndex != null ? bars[activeIndex] : null;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onLapClick?.(null);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 dark:border-white/10",
        "bg-white dark:bg-gray-900/60 p-6",
        "shadow-sm",
        className
      )}
    >
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Lap Performance
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Width · distance · &nbsp;Height · pace (taller = faster)
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Fastest {formatPace(minPace)}/km
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Slowest {formatPace(maxPace)}/km
          </span>
        </div>
      </div>

      {/* SVG defs for the gradient stops — shared across bars via fill=url(#…) */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={`fast-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={`mid-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={`slow-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="relative cursor-pointer select-none"
        onClick={handleContainerClick}
      >
        {/* Horizontal grid lines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0"
          style={{ top: chartPadding, height: chartHeight - chartPadding * 2 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-gray-200/70 dark:border-white/5"
              style={{ top: `${(i / 3) * 100}%` }}
            />
          ))}
        </div>

        <div
          className="relative flex items-end gap-0.5"
          style={{
            height: `${chartHeight}px`,
            padding: `${chartPadding}px 0`,
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {bars.map((bar) => {
            const isSelected = selectedLapIndex === bar.index;
            const isHovered = hoverIndex === bar.index;
            const dim = activeIndex != null && !isSelected && !isHovered;

            // Pick gradient by pace bucket
            const gradientUrl =
              bar.intensity >= 0.66
                ? `url(#fast-${gradientId})`
                : bar.intensity >= 0.33
                  ? `url(#mid-${gradientId})`
                  : `url(#slow-${gradientId})`;

            return (
              <div
                key={bar.index}
                role="button"
                aria-label={`Lap ${bar.index + 1}: ${bar.lap.lapDistanceInKilometers.toFixed(2)} km at ${formatPace(bar.lap.lapPaceInMinKm)} per km`}
                className="relative flex h-full items-end"
                style={{ width: `${bar.widthPct}%`, minWidth: "6px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onLapClick?.(isSelected ? null : bar.index);
                }}
                onMouseEnter={() => setHoverIndex(bar.index)}
                onFocus={() => setHoverIndex(bar.index)}
                tabIndex={0}
              >
                {/* The bar itself */}
                <motion.div
                  className={cn(
                    "relative mx-[1px] w-[calc(100%-2px)] origin-bottom overflow-hidden",
                    "rounded-t-md transition-[filter,opacity] duration-200",
                    dim ? "opacity-55" : "opacity-100",
                    (isSelected || isHovered) && "shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                  )}
                  initial={reduce ? false : { scaleY: 0, opacity: 0 }}
                  animate={reduce ? undefined : { scaleY: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 24,
                    delay: Math.min(bar.index * 0.025, 0.6),
                  }}
                  style={{
                    height: `${bar.heightPct}%`,
                    minHeight: "6px",
                  }}
                >
                  {/* Gradient via inline SVG to match the lap pace bucket */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 10 10"
                    aria-hidden
                  >
                    <rect x="0" y="0" width="10" height="10" fill={gradientUrl} />
                  </svg>
                  {/* Subtle inner highlight */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent"
                  />
                  {/* Selected ring pulse */}
                  {isSelected && !reduce && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-t-md ring-2 ring-blue-500/70 dark:ring-blue-400/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>
              </div>
            );
          })}

          {/* Tooltip */}
          {activeBar && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "pointer-events-none absolute z-10 min-w-[140px] -translate-x-1/2",
                "rounded-lg border border-gray-200/80 dark:border-white/10",
                "bg-white/95 dark:bg-gray-900/90 backdrop-blur-md",
                "px-3 py-2 text-xs shadow-lg"
              )}
              style={{
                // Position near the middle of the bar horizontally
                left: `calc(${bars
                  .slice(0, activeBar.index)
                  .reduce((sum, b) => sum + b.widthPct, 0) + activeBar.widthPct / 2}% )`,
                top: 0,
              }}
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                Lap {activeBar.index + 1}
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-gray-600 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">Distance</span>
                <span className="text-right tabular-nums">{activeBar.lap.lapDistanceInKilometers.toFixed(2)} km</span>
                <span className="text-gray-500 dark:text-gray-400">Duration</span>
                <span className="text-right tabular-nums">{formatDuration(activeBar.lap.lapDurationInSeconds)}</span>
                <span className="text-gray-500 dark:text-gray-400">Pace</span>
                <span className="text-right tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                  {formatPace(activeBar.lap.lapPaceInMinKm)} /km
                </span>
                {activeBar.lap.avgHeartRate > 0 && (
                  <>
                    <span className="text-gray-500 dark:text-gray-400">Avg HR</span>
                    <span className="text-right tabular-nums">{Math.round(activeBar.lap.avgHeartRate)} bpm</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Lap axis (numbers underneath, densified automatically) */}
        <div className="mt-2 flex gap-0.5">
          {bars.map((bar) => (
            <div
              key={bar.index}
              className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500"
              style={{ width: `${bar.widthPct}%`, minWidth: "6px" }}
            >
              {bars.length <= 20 || (bar.index + 1) % Math.ceil(bars.length / 10) === 0
                ? bar.index + 1
                : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile legend */}
      <div className="mt-3 flex sm:hidden items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Fastest {formatPace(minPace)}/km
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          Slowest {formatPace(maxPace)}/km
        </span>
      </div>
    </div>
  );
}
