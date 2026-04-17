/**
 * SleepPieChart Component
 * Animated donut chart showing sleep stage breakdown (deep, light, REM, awake).
 * Public API (props) is kept identical to previous versions so callers don't break.
 */

"use client";

import { useState, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface SleepPieChartProps {
  deepSleepSeconds: number;
  lightSleepSeconds: number;
  remSleepSeconds: number;
  awakeSeconds: number;
  className?: string;
}

interface Segment {
  key: "deep" | "light" | "rem" | "awake";
  label: string;
  seconds: number;
  percent: number;
  fraction: number;
  color: string;
  glow: string;
  dotClass: string;
  textClass: string;
}

const SIZE = 180;
const STROKE = 22;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - STROKE / 2 - 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function SleepPieChart({
  deepSleepSeconds,
  lightSleepSeconds,
  remSleepSeconds,
  awakeSeconds,
  className = "",
}: SleepPieChartProps) {
  const reduceMotion = useReducedMotion();
  const gradId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<Segment["key"] | null>(null);

  const total =
    deepSleepSeconds + lightSleepSeconds + remSleepSeconds + awakeSeconds;

  if (total === 0) {
    return (
      <div
        className={`flex h-44 w-44 items-center justify-center rounded-full border border-dashed border-gray-300/70 dark:border-white/10 ${className}`}
        role="img"
        aria-label="No sleep data"
      >
        <p className="text-xs text-gray-500 dark:text-gray-400">No sleep data</p>
      </div>
    );
  }

  const rawSegments: Omit<Segment, "percent" | "fraction">[] = [
    {
      key: "deep",
      label: "Deep",
      seconds: deepSleepSeconds,
      color: "#3b82f6", // brand blue
      glow: "rgba(59,130,246,0.55)",
      dotClass: "bg-blue-500",
      textClass: "text-blue-600 dark:text-blue-300",
    },
    {
      key: "light",
      label: "Light",
      seconds: lightSleepSeconds,
      color: "#a78bfa", // soft purple
      glow: "rgba(167,139,250,0.55)",
      dotClass: "bg-purple-400",
      textClass: "text-purple-600 dark:text-purple-300",
    },
    {
      key: "rem",
      label: "REM",
      seconds: remSleepSeconds,
      color: "#2dd4bf", // teal accent
      glow: "rgba(45,212,191,0.55)",
      dotClass: "bg-teal-400",
      textClass: "text-teal-600 dark:text-teal-300",
    },
    {
      key: "awake",
      label: "Awake",
      seconds: awakeSeconds,
      color: "#f59e0b", // amber
      glow: "rgba(245,158,11,0.55)",
      dotClass: "bg-amber-500",
      textClass: "text-amber-600 dark:text-amber-300",
    },
  ];

  const segments: Segment[] = rawSegments.map((s) => {
    const fraction = s.seconds / total;
    return { ...s, fraction, percent: fraction * 100 };
  });

  // Render slices in stable order, but lift hovered on top by re-ordering.
  const renderOrder = [...segments].sort((a, b) => {
    if (a.key === hovered) return 1;
    if (b.key === hovered) return -1;
    return 0;
  });

  let cumulative = 0;
  const slicesWithOffset = segments.map((seg) => {
    const offset = -cumulative * CIRCUMFERENCE;
    cumulative += seg.fraction;
    return { seg, offset };
  });
  const offsetByKey = new Map(
    slicesWithOffset.map((s) => [s.seg.key, s.offset] as const)
  );

  const sleepTotal =
    deepSleepSeconds + lightSleepSeconds + remSleepSeconds;

  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      role="img"
      aria-label={`Sleep breakdown: deep ${segments[0].percent.toFixed(
        0
      )}%, light ${segments[1].percent.toFixed(0)}%, REM ${segments[2].percent.toFixed(
        0
      )}%, awake ${segments[3].percent.toFixed(0)}%`}
    >
      <div className="relative">
        {/* Soft ambient glow behind the ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-60 blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.25), rgba(167,139,250,0.2) 45%, transparent 70%)",
          }}
        />

        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          <defs>
            {segments.map((s) => (
              <radialGradient
                key={s.key}
                id={`${gradId}-${s.key}`}
                cx="50%"
                cy="50%"
                r="65%"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.75} />
              </radialGradient>
            ))}
          </defs>

          {/* Track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            className="stroke-gray-200/80 dark:stroke-white/5"
            strokeWidth={STROKE}
          />

          {renderOrder.map((seg) => {
            const isHover = hovered === seg.key;
            const dashLen = seg.fraction * CIRCUMFERENCE;
            const offset = offsetByKey.get(seg.key) ?? 0;

            return (
              <motion.circle
                key={seg.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={`url(#${gradId}-${seg.key})`}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                strokeDasharray={`${dashLen} ${CIRCUMFERENCE - dashLen}`}
                initial={
                  reduceMotion
                    ? { strokeDashoffset: offset, opacity: 1 }
                    : { strokeDashoffset: offset + dashLen, opacity: 0 }
                }
                animate={{
                  strokeDashoffset: offset,
                  opacity: 1,
                  filter: isHover
                    ? `drop-shadow(0 0 6px ${seg.glow})`
                    : "drop-shadow(0 0 0px rgba(0,0,0,0))",
                  // subtle enlargement on hover via strokeWidth
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        strokeDashoffset: {
                          duration: 0.9,
                          ease: [0.22, 1, 0.36, 1],
                        },
                        opacity: { duration: 0.3 },
                        filter: { duration: 0.2 },
                      }
                }
                onMouseEnter={() => setHovered(seg.key)}
                onMouseLeave={() =>
                  setHovered((h) => (h === seg.key ? null : h))
                }
                style={{ cursor: "pointer" }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduceMotion ? { duration: 0 } : { delay: 0.55, duration: 0.4 }
          }
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          {hovered ? (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                {segments.find((s) => s.key === hovered)?.label}
              </div>
              <div className="mt-0.5 text-xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
                {formatTime(
                  segments.find((s) => s.key === hovered)?.seconds ?? 0
                )}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                {(segments.find((s) => s.key === hovered)?.percent ?? 0).toFixed(
                  0
                )}
                %
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                Asleep
              </div>
              <div className="mt-0.5 text-xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
                {formatTime(sleepTotal)}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                of {formatTime(total)}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Legend */}
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {segments.map((seg) => {
          const isHover = hovered === seg.key;
          return (
            <motion.button
              type="button"
              key={seg.key}
              onMouseEnter={() => setHovered(seg.key)}
              onMouseLeave={() =>
                setHovered((h) => (h === seg.key ? null : h))
              }
              onFocus={() => setHovered(seg.key)}
              onBlur={() => setHovered(null)}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundColor: isHover
                  ? "rgba(148,163,184,0.12)"
                  : "rgba(148,163,184,0)",
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { delay: 0.35 + segments.indexOf(seg) * 0.05 }
              }
              className="flex items-center gap-2 rounded-md px-1.5 py-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            >
              <span
                aria-hidden
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${seg.dotClass}`}
                style={{
                  boxShadow: isHover ? `0 0 0 3px ${seg.glow}` : undefined,
                  transition: "box-shadow 160ms ease",
                }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {seg.label}
              </span>
              <span
                className={`ml-auto tabular-nums font-medium ${
                  isHover ? seg.textClass : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {seg.percent.toFixed(0)}%
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
