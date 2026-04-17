/**
 * ForCoaches
 *
 * Two-column feature section for coaches. Coach demo panel on the left,
 * headline + icon-feature list on the right. Scroll-triggered fade-up with
 * staggered children.
 */

"use client";

import { motion } from "framer-motion";
import CoachDemoPanel from "./CoachDemoPanel";
import {
  Badge,
  SectionHeading,
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
    title: "Build structured workouts",
    description:
      "Author intervals, pace zones, and rest in a clean, reusable workout library.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Assign to any athlete",
    description:
      "One click to deliver the session. Syncs straight to their Garmin.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14M13 5l7 7-7 7"
        />
      </svg>
    ),
  },
  {
    title: "Review real performance",
    description:
      "Pace, HR, laps, elevation — not screenshots. See exactly how it was executed.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Coach with data, not guesses",
    description:
      "Surface consistency, effort, and trends to give feedback that actually lands.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l3-3 4 4 5-5 6 6"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 8h7v7"
        />
      </svg>
    ),
  },
];

export default function ForCoaches() {
  return (
    <section
      id="for-coaches"
      className="relative w-full max-w-full overflow-hidden bg-white py-16 sm:py-24 lg:py-32 dark:bg-gray-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/10"
      />

      <div className="relative mx-auto max-w-7xl w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          {/* Visual (left) */}
          <motion.div variants={fadeUp} className="lg:pr-4">
            <CoachDemoPanel />
          </motion.div>

          {/* Copy (right) */}
          <motion.div variants={fadeUp}>
            <Badge variant="brand" size="sm" className="mb-4">
              For coaches
            </Badge>

            <SectionHeading
              as="h2"
              title="Plan, assign, and analyze — all in one place."
              description="Stop triangulating between Excel, chat threads, and screenshots. Build structured sessions, ship them to your athletes' Garmins, and review real performance data side-by-side."
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
                  className="group relative rounded-2xl border border-gray-200/80 bg-white/60 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-400/40 dark:hover:shadow-blue-400/5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md shadow-purple-500/25">
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
        </motion.div>
      </div>
    </section>
  );
}
