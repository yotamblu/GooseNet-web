/**
 * ForAthletes
 *
 * Two-column feature section for athletes. Icon/feature list on the left,
 * StatTile-driven visual on the right (reverse of ForCoaches).
 */

"use client";

import { motion } from "framer-motion";
import {
  Badge,
  SectionHeading,
  StatTile,
  fadeUp,
  inViewOnce,
  stagger,
} from "./ui";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Workouts delivered, not invented",
    description:
      "Receive structured sessions from your coach — no more deciphering notes.",
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
    title: "One tap to your Garmin",
    description:
      "Syncs directly to your watch. Warmups, intervals, and rest on your wrist.",
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
    title: "Clear post-run breakdowns",
    description:
      "See pace consistency, heart rate zones, and lap splits in a glance.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3v18h18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 15l3-4 3 3 5-6"
        />
      </svg>
    ),
  },
  {
    title: "Progress, shared automatically",
    description:
      "Your coach sees what you see. No uploading, no screenshots, no lag.",
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
      className="relative w-full max-w-full overflow-hidden bg-gray-50 py-16 sm:py-24 lg:py-32 dark:bg-gray-950"
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
          {/* Copy (left) */}
          <motion.div variants={fadeUp} className="order-2 lg:order-1">
            <Badge variant="success" size="sm" className="mb-4">
              For athletes
            </Badge>

            <SectionHeading
              as="h2"
              title="Execute the plan. Own the data."
              description="Every workout your coach designs lands on your Garmin, ready to run. Afterwards, the full breakdown is already waiting — no manual syncing, no screenshots."
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
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {f.description}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Visual (right) */}
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
  return (
    <div className="glass-surface relative w-full max-w-full min-w-0 overflow-hidden rounded-2xl p-4 shadow-2xl sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            This week
          </p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your training load
          </h3>
        </div>
        <Badge variant="success" size="sm" dot>
          On plan
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatTile
          label="Distance"
          value={38.6}
          unit="km"
          accent="brand"
          compact
          sparkline={[22, 28, 34, 30, 35, 38, 39]}
        />
        <StatTile
          label="Avg pace"
          value="4:22"
          unit="/km"
          accent="purple"
          compact
        />
        <StatTile
          label="Avg HR"
          value={152}
          unit="bpm"
          accent="rose"
          compact
          sparkline={[148, 150, 149, 153, 151, 154, 152]}
        />
        <StatTile
          label="Sessions"
          value={4}
          unit="this week"
          accent="teal"
          compact
        />
      </div>

      <div className="mt-5 rounded-xl border border-gray-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            Next workout · Tue
          </span>
          <Badge variant="brand" size="sm">
            Structured
          </Badge>
        </div>
        <div className="space-y-2">
          {[
            { label: "Warm-up", pct: 30, tone: "muted" as const },
            { label: "5 × 400m @ 3:50/km", pct: 92, tone: "brand" as const },
            { label: "Recovery", pct: 35, tone: "muted" as const },
            { label: "Cool-down", pct: 40, tone: "muted" as const },
          ].map((seg) => (
            <div key={seg.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
                <span>{seg.label}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200/70 dark:bg-white/10">
                <div
                  className={`h-full rounded-full ${
                    seg.tone === "brand"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500"
                      : "bg-gray-400 dark:bg-white/25"
                  }`}
                  style={{ width: `${seg.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
