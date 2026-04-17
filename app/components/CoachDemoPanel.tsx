/**
 * CoachDemoPanel
 *
 * Animated coach workflow: Create → Assign → Review. Auto-advances, pauses on
 * hover, and lets users click step indicators to jump. Consumed by
 * ForCoaches as the embedded visual.
 */

"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Badge } from "./ui";

type StepId = "create" | "assign" | "review";

const STEPS: { id: StepId; title: string }[] = [
  { id: "create", title: "Create Structured Workout" },
  { id: "assign", title: "Assign to Athlete" },
  { id: "review", title: "Review Completed Session" },
];

const SCENE_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
};

const PACE_DATA = [4.2, 3.9, 3.8, 3.9, 4.0, 3.8, 3.9, 4.1, 3.8, 4.0];
const HR_DATA = [145, 160, 165, 162, 168, 165, 163, 170, 165, 168];
const LAP_DATA = [3.8, 3.9, 3.7, 3.8, 3.9, 3.8, 3.7, 3.9];

export default function CoachDemoPanel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || reduce) return;
    timer.current = setInterval(() => {
      setActive((p) => (p + 1) % STEPS.length);
      setToast(false);
    }, 4500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduce]);

  const go = useCallback((idx: number) => {
    setActive(idx);
    setToast(false);
    setPaused(true);
    window.setTimeout(() => setPaused(false), 6000);
  }, []);

  const handleAssign = useCallback(() => {
    setToast(true);
    window.setTimeout(() => setToast(false), 3000);
  }, []);

  return (
    <div
      className="glass-surface relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
      style={{ minHeight: 540 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Chrome */}
      <div className="flex items-center justify-between border-b border-white/40 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/goosenet_logo.png"
            alt="GooseNet"
            width={20}
            height={20}
            className="h-5 w-auto"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-800 dark:text-gray-200">
            GooseNet Coach
          </span>
        </div>
        <div className="flex items-center gap-1" aria-hidden>
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/15" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-14 shrink-0 border-r border-white/40 p-3 dark:border-white/10 sm:block">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-md shadow-purple-500/25" />
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Scene */}
        <div className="relative min-h-[440px] flex-1 p-5">
          <AnimatePresence mode="wait">
            {active === 0 && (
              <motion.div
                key="create"
                variants={SCENE_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                      Workout builder
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                      Tempo + Repeats
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="brand" size="sm">
                      Structured
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      Running
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400">1.</span>
                      <span>Warmup 10:00 easy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400">2.</span>
                      <span>5 × (400m @ 3:45–4:00/km, 200m jog)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400">3.</span>
                      <span>Cooldown 10:00</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/30 transition-[filter] hover:brightness-110"
                >
                  Send to Athlete
                </button>
              </motion.div>
            )}

            {active === 1 && (
              <motion.div
                key="assign"
                variants={SCENE_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-4"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                    Assign workout
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                    Schedule &amp; sync to Garmin
                  </h3>
                </div>

                <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Athlete
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] font-bold text-white">
                        N
                      </span>
                      Noa Levi
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      Date
                    </label>
                    <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100">
                      Tue, Jan 14
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200/70 pt-3 dark:border-white/10">
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      Sync to Garmin
                    </span>
                    <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-inner">
                      <span className="absolute right-1 block h-3 w-3 rounded-full bg-white" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAssign}
                    className="mt-1 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/30 transition-[filter] hover:brightness-110"
                  >
                    Assign Workout
                  </button>
                  <AnimatePresence>
                    {toast && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-50/70 px-3 py-2 text-xs font-medium text-teal-700 dark:border-teal-400/20 dark:bg-teal-500/10 dark:text-teal-300"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Assigned and queued for Garmin sync
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {active === 2 && (
              <motion.div
                key="review"
                variants={SCENE_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-4"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                    Session review
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                    Tempo + Repeats · Noa
                  </h3>
                </div>

                <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: "Distance", v: "5.2 km" },
                      { k: "Duration", v: "22:15" },
                      { k: "Avg Pace", v: "4:17/km" },
                      { k: "Avg HR", v: "165 bpm" },
                    ].map((m) => (
                      <div key={m.k}>
                        <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">
                          {m.k}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {m.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-gray-200/70 pt-3 dark:border-white/10">
                    <Spark
                      label="Pace"
                      unit="min/km"
                      color="#3b82f6"
                      data={PACE_DATA}
                      min={3.7}
                      max={4.3}
                    />
                    <Spark
                      label="Heart rate"
                      unit="bpm"
                      color="#f43f5e"
                      data={HR_DATA}
                      min={140}
                      max={175}
                    />
                  </div>

                  <div className="border-t border-gray-200/70 pt-3 dark:border-white/10">
                    <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">
                      Lap consistency
                    </div>
                    <div className="flex items-end gap-1 h-14">
                      {LAP_DATA.map((lap, i) => {
                        const min = Math.min(...LAP_DATA);
                        const height = ((lap - 3.6) / 0.35) * 100;
                        const isFastest = lap === min;
                        return (
                          <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                              duration: 0.5,
                              delay: i * 0.05,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`w-full origin-bottom rounded-t ${
                              isFastest
                                ? "bg-gradient-to-t from-blue-500 to-purple-500"
                                : "bg-gray-300 dark:bg-white/15"
                            }`}
                            style={{ height: `${Math.max(22, Math.min(100, height))}%` }}
                            aria-label={`Lap ${i + 1}: ${lap} min/km`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm" dot>
                      Data from Garmin
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between gap-3 border-t border-white/40 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Coach demo step">
          {STEPS.map((s, idx) => {
            const isActive = idx === active;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => go(idx)}
                className={`h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? "w-8 bg-gradient-to-r from-blue-500 to-purple-500"
                    : "w-3 bg-gray-300 hover:bg-gray-400 dark:bg-white/15 dark:hover:bg-white/25"
                }`}
                aria-label={`Go to step ${idx + 1}: ${s.title}`}
              />
            );
          })}
        </div>
        <a
          href="#cta"
          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-purple-500/25 transition-[filter] hover:brightness-110"
        >
          Join as coach
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M13 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

function Spark({
  label,
  unit,
  color,
  data,
  min,
  max,
}: {
  label: string;
  unit: string;
  color: string;
  data: number[];
  min: number;
  max: number;
}) {
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 28 - 1;
      return `${x},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">
        <span>{label}</span>
        <span>{unit}</span>
      </div>
      <svg className="h-8 w-full" viewBox="0 0 100 30" preserveAspectRatio="none">
        <motion.polyline
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
