/**
 * AnimatedDemoSection
 *
 * Side-by-side "Coach assigns workout → Athlete syncs from Garmin → Both
 * review analysis" flow. Coach panel on the left, phone-framed athlete view
 * on the right, an animated data-flow pipe down the middle.
 *
 * The three steps auto-rotate (pause on hover/focus). Respects reduced motion.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Badge,
  SectionHeading,
  fadeUp,
  inViewOnce,
  stagger,
} from "./ui";
import {
  DEMO_PRIMARY_ATHLETE,
  DEMO_ROSTER,
  DEMO_SESSION,
  DEMO_WORKOUT,
} from "../../lib/marketing/landingDemoData";
import { GarminLogoMark, GoogleGLogo } from "./MarketingBrandLogos";

type StepId = "assign" | "sync" | "analyze";

type Step = {
  id: StepId;
  index: number;
  coachLabel: string;
  athleteLabel: string;
  summary: string;
};

const STEPS: Step[] = [
  {
    id: "assign",
    index: 1,
    coachLabel: "Coach assigns",
    athleteLabel: "Workout lands in GooseNet",
    summary:
      "Intervals, paces, and rest go out once — no PDFs, no copy-paste into group chat.",
  },
  {
    id: "sync",
    index: 2,
    coachLabel: "Garmin queue",
    athleteLabel: "On the watch",
    summary:
      "Same Connect link as production: plan hits the wrist when athletes are paired.",
  },
  {
    id: "analyze",
    index: 3,
    coachLabel: "Review the load",
    athleteLabel: "Session logged",
    summary:
      "Pace, HR, laps — pulled from Garmin automatically. No screenshots to hunt down.",
  },
];

const PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AnimatedDemoSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || reduce) return;
    timer.current = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 4200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduce]);

  const handleStep = useCallback((idx: number) => {
    setActive(idx);
    setPaused(true);
    window.setTimeout(() => setPaused(false), 6000);
  }, []);

  const step = STEPS[active];

  return (
    <section
      id="demo"
      className="relative isolate w-full max-w-full scroll-mt-24 overflow-hidden bg-gray-50 py-24 sm:py-32 lg:py-44 dark:bg-gray-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[min(100%,900px)] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-teal-400/10 blur-3xl dark:from-blue-500/10 dark:via-purple-500/10 dark:to-teal-400/5"
      />

      <div className="relative mx-auto max-w-7xl w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
        >
          <motion.div variants={fadeUp}>
            <SectionHeading
              center
              variant="marketing"
              eyebrow="How sync works"
              title="From your laptop to their Garmin — then back with the full file."
              description="Assign once, see the completed run with the same charts your athletes see in the app. Zero screenshot threads."
            />
          </motion.div>

          {/* Flow */}
          <div
            className="relative mt-10 sm:mt-12 grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* COACH */}
            <motion.div variants={fadeUp} className="relative">
              <PanelFrame label="Coach" accent="blue">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    variants={PANEL_VARIANTS}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <CoachScene step={step} />
                  </motion.div>
                </AnimatePresence>
              </PanelFrame>
            </motion.div>

            {/* DATA PIPE */}
            <motion.div
              variants={fadeUp}
              className="relative hidden items-center justify-center lg:flex"
            >
              <DataPipe reduce={!!reduce} activeId={step.id} />
            </motion.div>

            {/* ATHLETE */}
            <motion.div variants={fadeUp} className="relative">
              <PhoneFrame>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    variants={PANEL_VARIANTS}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <AthleteScene step={step} />
                  </motion.div>
                </AnimatePresence>
              </PhoneFrame>
            </motion.div>
          </div>

          {/* Step indicators + caption */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Demo steps">
              {STEPS.map((s, idx) => {
                const isActive = idx === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleStep(idx)}
                    className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/30"
                        : "bg-white/70 text-gray-600 ring-1 ring-inset ring-gray-200 hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10 dark:hover:text-gray-100"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-700 group-hover:bg-gray-300 dark:bg-white/10 dark:text-gray-300"
                      }`}
                    >
                      {s.index}
                    </span>
                    <span className="hidden sm:inline">{s.coachLabel}</span>
                  </button>
                );
              })}
            </div>
            <p
              key={step.id + "-cap"}
              className="max-w-2xl text-center text-sm text-gray-600 sm:text-base md:max-w-3xl md:text-lg dark:text-gray-400"
            >
              {step.summary}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- */
/* Shared frames                                                          */
/* --------------------------------------------------------------------- */

function PanelFrame({
  label,
  accent,
  children,
}: {
  label: string;
  accent: "blue" | "purple";
  children: React.ReactNode;
}) {
  const dot =
    accent === "blue"
      ? "bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
      : "bg-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.15)]";

  return (
    <div className="glass-surface relative h-full min-h-[420px] w-full max-w-full min-w-0 mx-auto overflow-hidden rounded-2xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/40 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-gray-200">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1" aria-hidden>
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/15" />
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-full min-h-[420px] w-full max-w-[320px]">
      <div className="relative h-full rounded-[2.2rem] bg-gradient-to-b from-gray-900 to-black p-2 shadow-2xl ring-1 ring-white/10">
        <div className="relative h-full overflow-hidden rounded-[1.7rem] bg-white dark:bg-gray-950">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black/80" />
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-gray-900 dark:text-gray-100">
            <span>9:41</span>
            <span className="flex items-center gap-1 opacity-60">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </span>
          </div>
          <div className="px-4 pb-5 pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Data pipe (middle)                                                     */
/* --------------------------------------------------------------------- */

function DataPipe({ reduce, activeId }: { reduce: boolean; activeId: StepId }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative h-64 w-px overflow-visible">
        <div className="absolute inset-0 w-px bg-gradient-to-b from-blue-500/0 via-blue-500/60 to-purple-500/0 dark:via-blue-400/50" />
        {!reduce &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i + activeId}
              aria-hidden
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: 256, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2.2,
                delay: i * 0.55,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <span className="block h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />
            </motion.span>
          ))}
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 5l7 7-7 7M4 12h16"
          />
        </svg>
        Live sync
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Scene content                                                          */
/* --------------------------------------------------------------------- */

function CoachScene({ step }: { step: Step }) {
  if (step.id === "assign") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Planned workout
            </p>
            <h4 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
              {DEMO_WORKOUT.name}
            </h4>
          </div>
          <Badge variant="brand" size="sm">
            Structured
          </Badge>
        </div>
        <ul className="space-y-2 rounded-xl border border-gray-200/80 bg-white/70 p-3 text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="text-gray-400">1.</span>Warm-up 12:00 easy build
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">2.</span>
            Tempo 2 × 12:00 + 6 × 400 m repeats
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">3.</span>Cool-down 10:00
          </li>
        </ul>
        <motion.div
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/25"
          animate={{ opacity: [0.92, 1, 0.92] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span>
            Assign to {DEMO_PRIMARY_ATHLETE.name} · {DEMO_WORKOUT.assignDateLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            Send
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 5l7 7-7 7"
              />
            </svg>
          </span>
        </motion.div>
      </div>
    );
  }

  if (step.id === "sync") {
    return (
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Delivery queue
        </p>
        <div className="space-y-2">
          {DEMO_ROSTER.map((row) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center justify-between rounded-xl border border-gray-200/70 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                  {row.initial}
                </span>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {row.name}
                </span>
              </div>
              <Badge
                variant={row.status === "synced" ? "success" : "brand"}
                size="sm"
                dot
              >
                {row.status === "synced" ? "Synced" : "Queued"}
              </Badge>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-50/60 px-3 py-2 text-xs font-medium text-teal-700 dark:border-teal-400/20 dark:bg-teal-500/10 dark:text-teal-300">
          <GarminLogoMark height={16} className="scale-90 opacity-90" />
          <span className="leading-snug">
            Workouts handed off to Garmin Connect for on-watch execution
          </span>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Session · {DEMO_PRIMARY_ATHLETE.name}
            </p>
            <h4 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
              {DEMO_WORKOUT.name}
            </h4>
          </div>
          <Badge variant="success" size="sm" dot>
            Completed
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Distance", v: String(DEMO_SESSION.distanceKm), u: "km" },
            { k: "Avg pace", v: DEMO_SESSION.avgPace.replace("/km", ""), u: "/km" },
            { k: "Avg HR", v: String(DEMO_SESSION.avgHr), u: "bpm" },
          ].map((m) => (
            <div
              key={m.k}
              className="rounded-xl border border-gray-200/80 bg-white/70 p-2.5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">
                {m.k}
              </div>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {m.v}
                </span>
                <span className="text-[10px] text-gray-500">{m.u}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            <span>Pace</span>
            <span>min/km</span>
          </div>
          <svg className="h-8 w-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="paceGradDemo" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <motion.polyline
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              points="0,18 12,14 24,10 36,16 48,8 60,12 72,6 84,10 100,4"
              fill="none"
              stroke="url(#paceGradDemo)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
  );
}

function AthleteScene({ step }: { step: Step }) {
  if (step.id === "assign") {
    return (
      <div className="space-y-3">
        <Badge variant="brand" size="sm" dot>
          New from Coach
        </Badge>
        <div className="rounded-2xl border border-gray-200/80 p-3 dark:border-white/10">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            {DEMO_WORKOUT.assignDateLabel} · {DEMO_WORKOUT.name}
          </p>
          <div className="mt-3 space-y-2">
            {[
              { label: "Warm-up", pct: 30, tone: "gray" as const },
              { label: "Interval 1", pct: 90, tone: "blue" as const },
              { label: "Recovery", pct: 25, tone: "gray" as const },
              { label: "Interval 2", pct: 90, tone: "blue" as const },
              { label: "Cool-down", pct: 35, tone: "gray" as const },
            ].map((seg) => (
              <div key={seg.label} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                  <span>{seg.label}</span>
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-1.5 origin-left rounded-full ${
                    seg.tone === "blue"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gray-300 dark:bg-white/10"
                  }`}
                  style={{ width: `${seg.pct}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <motion.button
          type="button"
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/30"
          whileTap={{ scale: 0.98 }}
        >
          Send to Garmin
        </motion.button>
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
          <GoogleGLogo size={16} />
          <span>Google sign-in · no new password for athletes</span>
        </div>
      </div>
    );
  }

  if (step.id === "sync") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 blur-2xl"
          />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
              <svg
                className="h-9 w-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <GarminLogoMark height={18} />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Synced to {DEMO_WORKOUT.device}
          </p>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Workout on wrist · ready when you are
          </p>
        </div>
        <Badge variant="success" size="sm" dot>
          Garmin connected
        </Badge>
      </div>
    );
  }

  return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
              Activity
            </p>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {DEMO_WORKOUT.assignDateLabel}
            </h4>
          </div>
          <Badge variant="success" size="sm">
            PR
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { k: "Pace", v: DEMO_SESSION.avgPace.split("/")[0] ?? DEMO_SESSION.avgPace },
            { k: "HR", v: String(DEMO_SESSION.avgHr) },
            { k: "Dist", v: `${DEMO_SESSION.distanceKm}km` },
            { k: "Time", v: DEMO_SESSION.durationLabel },
          ].map((m) => (
          <div
            key={m.k}
            className="rounded-xl border border-gray-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5"
          >
            <div className="text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">
              {m.k}
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {m.v}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-end gap-1 pt-1" aria-hidden>
          {[55, 70, 82, 65, 90, 78, 95, 72].map((h, i) => (
            <motion.span
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{
                duration: 0.6,
                delay: i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block w-full rounded-sm bg-gradient-to-t from-blue-500 to-purple-500"
              style={{ minHeight: 6, maxHeight: 48 }}
            />
          ))}
        </div>
        <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
          Lap pace consistency
        </p>
      </div>
    </div>
  );
}
