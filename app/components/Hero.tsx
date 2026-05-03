/**
 * Hero — pain-first headline, free model above the fold, value-before-commitment CTA.
 * Flow layout (no fixed min-height + center) so content is never clipped; scroll invite always visible.
 */

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, springSoft, stagger, staggerTight } from "./ui";

const VALUE_CHIPS: { label: string }[] = [
  { label: "Spot risky load jumps before they become injuries" },
  { label: "Athletes know you can see their Garmin data" },
  { label: "Sunday night without chasing screenshots" },
];

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-aurora relative isolate w-full max-w-full overflow-x-hidden pb-6 pt-6 sm:pb-10 sm:pt-10 md:pb-14 md:pt-14 lg:pb-16 lg:pt-16">
      {!reduce && (
        <>
          <div
            aria-hidden
            className="animate-float pointer-events-none absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/15"
          />
          <div
            aria-hidden
            className="animate-float pointer-events-none absolute top-28 right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/12"
            style={{ animationDelay: "-3s", animationDuration: "8s" }}
          />
        </>
      )}

      {reduce && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-28 right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/12"
          />
        </>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
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

      {/* Bottom fade: hints there is more below without clipping content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-white/25 to-transparent dark:from-gray-900/40"
      />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl text-center xl:max-w-6xl"
        >
          <motion.div variants={fadeUp} className="flex justify-center px-1">
            <span className="inline-flex max-w-2xl flex-col gap-1 rounded-2xl border border-emerald-500/25 bg-emerald-50/80 px-5 py-3.5 text-xs font-semibold leading-snug text-emerald-900 shadow-sm backdrop-blur-md sm:px-6 sm:py-4 sm:text-sm md:text-base dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <span>
                Free for coaches, forever. No credit card. No trial. No paywall.
              </span>
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="display-heading mt-6 text-balance text-3xl font-bold tracking-tight text-gray-900 sm:mt-8 sm:text-4xl md:mt-10 md:text-5xl lg:text-6xl xl:text-7xl dark:text-gray-50"
          >
            Stop chasing your athletes for Garmin screenshots.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-snug text-gray-700 sm:mt-6 sm:max-w-4xl sm:text-lg sm:leading-relaxed md:mt-7 md:text-xl dark:text-gray-300"
          >
            GooseNet shows you every athlete&apos;s load automatically — no
            logins, no screenshots, no nagging. Free for coaches, forever.
          </motion.p>

          <motion.div
            variants={staggerTight}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3"
          >
            {VALUE_CHIPS.map((chip) => (
              <motion.span
                key={chip.label}
                variants={fadeUp}
                className="inline-flex max-w-[min(100%,380px)] rounded-full border border-white/55 bg-white/65 px-4 py-2.5 text-left text-xs font-medium text-gray-700 shadow-sm backdrop-blur-md sm:max-w-[420px] sm:px-5 sm:py-3 sm:text-sm md:text-base dark:border-white/10 dark:bg-white/5 dark:text-gray-200 md:max-w-none"
              >
                {chip.label}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-8 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:gap-4 md:mt-12"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ ...springSoft, delay: 0.2 }}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/signup"
                className="shadow-glow-brand animate-gradient relative inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(120deg,#3b82f6_0%,#6366f1_35%,#a855f7_70%,#3b82f6_100%)] bg-[length:200%_100%] px-7 py-4 text-sm font-semibold text-white transition-[filter] hover:brightness-110 sm:w-auto sm:px-10 sm:py-5 sm:text-base md:text-lg"
              >
                <span className="md:hidden">See your team&apos;s data</span>
                <span className="hidden md:inline">
                  See your team&apos;s data — no account needed
                </span>
                <svg
                  className="ml-2 h-5 w-5 shrink-0 md:h-6 md:w-6"
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
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ ...springSoft, delay: 0.28 }}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="#dashboard-preview"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-300 bg-white/80 px-7 py-4 text-sm font-semibold text-gray-800 backdrop-blur-md transition-colors hover:border-gray-400 hover:bg-white sm:w-auto sm:px-10 sm:py-5 sm:text-base md:text-lg dark:border-white/15 dark:bg-white/5 dark:text-gray-100 dark:hover:border-white/25 dark:hover:bg-white/10"
              >
                Preview the dashboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll invitation — always visible, never hidden behind viewport */}
          <motion.div
            variants={fadeUp}
            className="mx-auto mt-10 flex max-w-md flex-col items-center gap-2 sm:mt-12 md:mt-14"
          >
            <span className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 sm:text-xs">
              There&apos;s more below
            </span>
            <motion.a
              href="#dashboard-preview"
              aria-label="Scroll to dashboard preview"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.45 }}
              className="group flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <span className="text-xs font-semibold underline-offset-4 group-hover:underline sm:text-sm">
                See sample data &amp; how Garmin sync works
              </span>
              <motion.span
                aria-hidden
                animate={
                  reduce ? undefined : { y: [0, 6, 0], opacity: [0.7, 1, 0.7] }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex flex-col items-center text-current"
              >
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.span>
            </motion.a>
            <a
              href="#demo"
              className="text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200 sm:text-xs"
            >
              Or jump to the step-by-step demo →
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
