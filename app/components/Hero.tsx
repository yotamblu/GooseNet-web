/**
 * Hero Section
 *
 * Dramatic but elegant landing hero:
 *  - `.bg-aurora` backdrop + slow-floating brand orbs
 *  - Headline fades up with a light letter stagger; "Together." painted in
 *    `text-gradient-brand`
 *  - Feature chips fade-up stagger
 *  - Primary gradient CTA + secondary outline CTA (spring in)
 *  - Subtle scroll-down indicator
 */

"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  fadeUp,
  springSoft,
  stagger,
  staggerTight,
} from "./ui";

const CHIPS: { label: string; icon: React.ReactNode }[] = [
  {
    label: "Structured running workouts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h3"
        />
      </svg>
    ),
  },
  {
    label: "Coach–athlete collaboration",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    label: "Garmin-powered insights",
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
];

const WORDS = ["Train", "Smarter.", "Run", "Stronger."];

/** Each word fades up quickly; the gradient final word handles itself. */
const wordVariants: Variants = {
  hidden: { opacity: 0, y: "50%" },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-aurora relative isolate overflow-hidden py-16 sm:py-24 md:py-32 lg:py-40 w-full max-w-full">
      {/* Floating brand orbs (decorative) */}
      {!reduce && (
        <>
          <div
            aria-hidden
            className="animate-float pointer-events-none absolute -top-28 -left-28 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl dark:bg-blue-500/25"
          />
          <div
            aria-hidden
            className="animate-float pointer-events-none absolute top-20 right-[-6rem] h-72 w-72 rounded-full bg-purple-500/30 blur-3xl dark:bg-purple-500/25"
            style={{ animationDelay: "-2.5s", animationDuration: "7s" }}
          />
          <div
            aria-hidden
            className="animate-float pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-400/20"
            style={{ animationDelay: "-5s", animationDuration: "9s" }}
          />
        </>
      )}

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Eyebrow pill */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              Built for runners. Loved by coaches.
            </span>
          </motion.div>

          {/* Headline with word stagger */}
          <motion.h1
            variants={staggerTight}
            className="display-heading mt-6 text-3xl text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl break-words dark:text-gray-50"
          >
            <span className="inline-block align-baseline">
              {WORDS.map((w, i) => (
                <span
                  key={i}
                  className="inline-block overflow-hidden align-baseline"
                >
                  <motion.span
                    variants={wordVariants}
                    className="inline-block pr-3"
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
            <span className="inline-block overflow-hidden align-baseline">
              <motion.span
                variants={wordVariants}
                className="text-gradient-brand animate-gradient inline-block bg-[length:200%_100%] pr-1"
              >
                Together.
              </motion.span>
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg sm:leading-8 md:text-xl dark:text-gray-300"
          >
            GooseNet connects runners and coaches through structured workouts,
            real performance data, and seamless Garmin integration.
          </motion.p>

          {/* Feature chips */}
          <motion.div
            variants={staggerTight}
            className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          >
            {CHIPS.map((chip) => (
              <motion.span
                key={chip.label}
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-md transition-colors hover:border-blue-500/40 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-blue-400/40 dark:hover:bg-white/10"
              >
                <span className="flex h-4 w-4 items-center justify-center text-blue-600 dark:text-blue-400">
                  {chip.icon}
                </span>
                {chip.label}
              </motion.span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex w-full max-w-md mx-auto flex-col items-stretch justify-center gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ ...springSoft, delay: 0.35 }}
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/signup"
                className="shadow-glow-brand animate-gradient relative inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-[linear-gradient(120deg,#3b82f6_0%,#6366f1_35%,#a855f7_70%,#3b82f6_100%)] bg-[length:200%_100%] px-6 sm:px-8 py-3.5 sm:py-4 text-base font-semibold text-white transition-[filter] hover:brightness-110 sm:text-lg"
              >
                Join GooseNet
                <svg
                  className="ml-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ ...springSoft, delay: 0.45 }}
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="#how-it-works"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-gray-300 bg-white/80 px-6 sm:px-8 py-3.5 sm:py-4 text-base font-semibold text-gray-800 backdrop-blur-md transition-colors hover:border-gray-400 hover:bg-white sm:text-lg dark:border-white/15 dark:bg-white/5 dark:text-gray-100 dark:hover:border-white/25 dark:hover:bg-white/10"
              >
                See how it works
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.a
          href="#demo"
          aria-label="Scroll to demo"
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mx-auto mt-16 hidden w-fit items-center justify-center text-gray-500 hover:text-gray-900 sm:flex dark:text-gray-400 dark:hover:text-gray-100"
        >
          <span className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Scroll
            </span>
            <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-current">
              <motion.span
                aria-hidden
                animate={
                  reduce
                    ? undefined
                    : { y: [2, 14, 2], opacity: [0.2, 1, 0.2] }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mt-1 block h-1.5 w-1 rounded-full bg-current"
              />
            </span>
          </span>
        </motion.a>
      </div>
    </section>
  );
}
