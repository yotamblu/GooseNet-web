/**
 * ForAthletes — what athletes get; reinforces coach visibility + Garmin path.
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Badge,
  SectionHeading,
  StatTile,
  fadeUp,
  inViewOnce,
  stagger,
} from "./ui";
import { DEMO_PRIMARY_ATHLETE, DEMO_WORKOUT } from "../../lib/marketing/landingDemoData";
import { GarminLogoMark } from "./MarketingBrandLogos";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Your coach’s plan, on your wrist",
    description:
      "Intervals land in Garmin the way they were written — no retyping into a watch menu.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
        />
      </svg>
    ),
  },
  {
    title: "One Garmin link",
    description:
      "Connect once. After that, completed runs show up for your coach without extra uploads.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    ),
  },
  {
    title: "They see what you see",
    description:
      "Heart rate, pace, laps — the same post-run view your coach uses in meetings.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 15l3-4 3 3 5-6" />
      </svg>
    ),
  },
  {
    title: "No screenshot homework",
    description:
      "If the watch recorded it, GooseNet already has it. That’s the deal.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582A8 8 0 0119 11M20 20v-5h-.581A8 8 0 015 13"
        />
      </svg>
    ),
  },
];

export default function ForAthletes() {
  return (
    <section
      id="for-athletes"
      className="relative w-full max-w-full overflow-hidden bg-gray-50 py-24 sm:py-32 lg:py-44 dark:bg-gray-950"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <motion.div variants={fadeUp} className="order-2 lg:order-1">
            <Badge variant="success" size="sm" className="mb-4">
              For athletes
            </Badge>

            <SectionHeading
              as="h2"
              variant="marketing"
              title="Run the plan. Let the file speak for itself."
              description="Your coach isn’t waiting on a camera roll of watch faces — they’re watching real distance, effort, and consistency from Garmin, the same way you do."
            />

            <motion.ul
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={inViewOnce}
              className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {FEATURES.map((f) => (
                <motion.li
                  key={f.title}
                  variants={fadeUp}
                  className="group relative rounded-2xl border border-gray-200/80 bg-white/60 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-400/10 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-teal-300/40"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 text-white shadow-md shadow-teal-500/25">
                    <span className="h-5 w-5">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8 dark:text-gray-400">
                    {f.description}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="order-1 lg:order-2 lg:pl-4"
          >
            <AthleteDashboardMock />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function AthleteDashboardMock() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass-surface relative w-full max-w-full min-w-0 overflow-hidden rounded-2xl p-4 shadow-2xl sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 sm:text-xs dark:text-gray-400">
            This week · {DEMO_PRIMARY_ATHLETE.name}
          </p>
          <h3 className="mt-1 text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
            Training volume
          </h3>
        </div>
        <Badge variant="success" size="sm" dot>
          Synced
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <GarminLogoMark height={16} className="opacity-90" />
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
          Data source
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatTile
          label="Distance"
          value={48.2}
          unit="km"
          accent="brand"
          compact
          sparkline={[32, 36, 38, 41, 44, 46, 48]}
        />
        <StatTile
          label="Avg pace"
          value="4:31"
          unit="/km"
          accent="purple"
          compact
        />
        <StatTile
          label="Avg HR"
          value={154}
          unit="bpm"
          accent="rose"
          compact
          sparkline={[148, 151, 150, 153, 155, 154, 154]}
        />
        <StatTile
          label="Sessions"
          value={5}
          unit="this week"
          accent="teal"
          compact
        />
      </div>

      <div className="mt-5 rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 sm:text-xs dark:text-gray-400">
            Next up · {DEMO_WORKOUT.assignDateLabel}
          </span>
          <Badge variant="brand" size="sm">
            From coach
          </Badge>
        </div>
        <div className="space-y-2">
          {[
            { label: "Warm-up", pct: 32, tone: "muted" as const },
            { label: "Tempo + repeats", pct: 94, tone: "brand" as const },
            { label: "Recovery", pct: 38, tone: "muted" as const },
            { label: "Cool-down", pct: 42, tone: "muted" as const },
          ].map((seg, i) => (
            <div key={seg.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
                <span>{seg.label}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200/70 dark:bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${
                    seg.tone === "brand"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gray-400 dark:bg-white/25"
                  }`}
                  initial={reduce ? false : { width: 0 }}
                  whileInView={reduce ? undefined : { width: `${seg.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i, duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
