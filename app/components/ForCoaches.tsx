/**
 * ForCoaches — coach value props ordered: injury signal, accountability, time saved.
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
    title: "Catch load spikes early",
    description:
      "When weekly volume jumps, you see it in the same charts as pace and HR — before a kid texts you that something hurts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
      </svg>
    ),
  },
  {
    title: "Accountability without nagging",
    description:
      "Athletes know you can open their Garmin-backed file anytime. Compliance stops being a personality contest.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    title: "Structured workouts to Garmin",
    description:
      "Build tempo, repeats, and recovery the way you already think — then sync straight to their watch.",
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
    title: "Reclaim Sunday nights",
    description:
      "No more screenshot scavenger hunt after the group long run. The data is already in GooseNet.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export default function ForCoaches() {
  return (
    <section
      id="for-coaches"
      className="relative w-full max-w-full overflow-hidden bg-white py-24 sm:py-32 lg:py-44 dark:bg-gray-900"
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
          <motion.div variants={fadeUp} className="lg:pr-4">
            <CoachDemoPanel />
          </motion.div>

          <motion.div variants={fadeUp}>
            <Badge variant="brand" size="sm" className="mb-4">
              For XC &amp; track coaches
            </Badge>

            <SectionHeading
              as="h2"
              variant="marketing"
              title="Stop guessing what your athletes actually ran."
              description="GooseNet is the free dashboard that pulls Garmin sessions automatically — so you can spot red flags, hold the line on training, and skip the weekly screenshot chase."
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
        </motion.div>
      </div>
    </section>
  );
}
