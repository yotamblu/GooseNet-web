/**
 * WhyGooseNet — coach-specific benefits; avoid generic "platform" language.
 */

"use client";

import { motion } from "framer-motion";
import { SectionHeading, fadeUp, inViewOnce, stagger } from "./ui";

type Point = {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: "blue" | "purple" | "teal" | "amber" | "rose";
};

const POINTS: Point[] = [
  {
    title: "Built for high school mileage reality",
    description:
      "Budgets are zero, kids forget to text, and Sunday night is when you actually look at the roster. GooseNet meets you there.",
    accent: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: "Injury signal before the DNF",
    description:
      "Volume jumps show up next to pace and HR — the same warning lights you’d squint at on a spreadsheet, without building one.",
    accent: "rose",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
        />
      </svg>
    ),
  },
  {
    title: "Garmin-native, not CSV theatre",
    description:
      "We read what already came off the watch — repeats, lap splits, heart rate — and park it beside what you assigned.",
    accent: "teal",
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
    title: "Free for coaches. Full stop.",
    description:
      "No trial cliff, no “coach tier”. If you’re leading a team, you get the same dashboard as everyone else.",
    accent: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
      </svg>
    ),
  },
];

const ACCENT_ICON_BG: Record<Point["accent"], string> = {
  blue: "from-blue-500 to-indigo-500 shadow-blue-500/30",
  purple: "from-purple-500 to-fuchsia-500 shadow-purple-500/30",
  teal: "from-teal-400 to-cyan-500 shadow-teal-500/30",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/30",
  rose: "from-rose-500 to-pink-500 shadow-rose-500/30",
};

export default function WhyGooseNet() {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-gray-50 py-24 sm:py-32 lg:py-44 dark:bg-gray-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-28 right-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -bottom-20 -left-16 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl dark:bg-purple-500/10" />
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
              variant="marketing"
              eyebrow="Why coaches care"
              title="Because screenshots don’t bend when a kid doubles their mileage."
              description="GooseNet isn’t another fitness feed. It’s the place you go when you need the honest file — from Garmin, for every athlete you coach."
            />
          </motion.div>

          <motion.ul
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={inViewOnce}
            className="mx-auto mt-10 sm:mt-14 grid w-full max-w-2xl grid-cols-1 gap-5 sm:max-w-none sm:grid-cols-2"
          >
            {POINTS.map((p) => (
              <motion.li key={p.title} variants={fadeUp}>
                <article className="group relative h-full rounded-2xl p-[1px] transition-shadow duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/15">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/70 via-white/50 to-white/70 opacity-100 transition-opacity duration-300 group-hover:opacity-0 dark:from-white/10 dark:via-white/5 dark:to-white/10"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/60 via-purple-500/50 to-teal-400/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="relative flex h-full flex-col rounded-2xl bg-white/90 p-6 backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-gray-900/80">
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENT_ICON_BG[p.accent]} text-white shadow-md`}
                      aria-hidden
                    >
                      <span className="h-6 w-6">{p.icon}</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base sm:leading-8 dark:text-gray-400">
                      {p.description}
                    </p>
                  </div>
                </article>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
