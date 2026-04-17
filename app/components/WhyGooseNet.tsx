/**
 * WhyGooseNet
 *
 * Benefit grid with icon cards. Hover lifts + gradient-border highlight.
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
    title: "Running-only focus",
    description:
      "No gyms, no generic tracking — every feature is designed around how runners actually train.",
    accent: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="7" cy="5" r="2" strokeLinecap="round" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 22l3-6 4 1 2-5m0 0l4 3 3-5M10 12l-3-4"
        />
      </svg>
    ),
  },
  {
    title: "Built around real coaching workflows",
    description:
      "Designed with coaches who write training, not software designers guessing.",
    accent: "purple",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7h16M4 12h10M4 17h16"
        />
      </svg>
    ),
  },
  {
    title: "Garmin-native data",
    description:
      "Not a CSV import, not a third-party fetch — a direct, two-way Garmin integration.",
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
    title: "Performance, not general fitness",
    description:
      "Pace, HR, consistency, lap analysis — metrics that actually drive improvement.",
    accent: "rose",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8V3m0 0L9 6m3-3l3 3M4 12h16M6 20h12a2 2 0 002-2v-4H4v4a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Clean, shareable insights",
    description:
      "Every session ends with a crisp summary — the kind worth sharing with your coach or squad.",
    accent: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 100 2.684m0-5.368l6.632-3.316m-6.632 8.684l6.632 3.316m0-11a3 3 0 106 0 3 3 0 00-6 0zm0 11a3 3 0 106 0 3 3 0 00-6 0z"
        />
      </svg>
    ),
  },
  {
    title: "Private by design",
    description:
      "Your training is yours. Share deliberately with your coach and selected athletes — nothing public by default.",
    accent: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m0 0v2m0-2h2m-2 0h-2m6-8V7a4 4 0 10-8 0v2M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
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
    <section className="relative w-full max-w-full overflow-hidden bg-gray-50 py-16 sm:py-24 lg:py-32 dark:bg-gray-950">
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
              eyebrow="Why GooseNet"
              title="A platform built for runners who take training seriously."
              description="Every decision in the app — from workout authoring to post-run breakdowns — is made for the way coaches and athletes actually work."
            />
          </motion.div>

          <motion.ul
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={inViewOnce}
            className="mx-auto mt-10 sm:mt-14 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3"
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
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
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
