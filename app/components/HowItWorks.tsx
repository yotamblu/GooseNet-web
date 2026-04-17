/**
 * HowItWorks
 *
 * Numbered 3-step process rendered as MarketingShinyCard with a connecting
 * rail on desktop. Scroll-staggered fade-up.
 */

"use client";

import { motion } from "framer-motion";
import MarketingShinyCard from "./MarketingShinyCard";
import { SectionHeading, fadeUp, inViewOnce, stagger } from "./ui";

type Step = {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Connect Garmin",
    description:
      "Link your Garmin account to sync workouts and performance data automatically.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Build or receive a workout",
    description:
      "Coaches author detailed plans. Athletes receive them instantly, ready to sync.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Train, sync, analyze",
    description:
      "Run it on your Garmin, then review the full breakdown together in GooseNet.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full max-w-full overflow-hidden bg-white py-16 sm:py-24 lg:py-32 dark:bg-gray-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/12" />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/12" />
      </div>

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
              eyebrow="How it works"
              title="Three steps. Nothing extra."
              description="A clean loop designed for serious training, not distractions."
            />
          </motion.div>

          <div className="relative mx-auto mt-10 sm:mt-16 w-full max-w-6xl">
            {/* Desktop connector rail */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[16%] right-[16%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent dark:via-blue-400/30 lg:block"
            />

            <motion.ol
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={inViewOnce}
              className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8"
            >
              {STEPS.map((step) => (
                <motion.li key={step.number} variants={fadeUp} className="h-full">
                  <MarketingShinyCard className="h-full">
                    <div className="flex h-full flex-col items-center px-6 pb-8 pt-8 text-center">
                      <div
                        className="animate-pulse-glow shadow-glow-brand relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        aria-hidden
                      >
                        <span className="text-lg font-bold tabular-nums">
                          {step.number}
                        </span>
                      </div>

                      <div
                        className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/20 text-blue-600 dark:from-blue-400/10 dark:to-purple-400/15 dark:text-blue-300"
                        aria-hidden
                      >
                        <span className="h-7 w-7">{step.icon}</span>
                      </div>

                      <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </MarketingShinyCard>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
