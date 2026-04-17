/**
 * FinalCTA
 *
 * Large gradient banner wrapped in the brand aurora. Single clear gradient
 * CTA + secondary "Login" link.
 */

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, inViewOnce, stagger } from "./ui";

export default function FinalCTA() {
  const reduce = useReducedMotion();

  return (
    <section
      id="cta"
      className="relative w-full max-w-full overflow-hidden bg-white py-16 sm:py-24 lg:py-32 dark:bg-gray-900"
    >
      <div className="mx-auto max-w-7xl w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="relative"
        >
          {/* Outer gradient border */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-teal-400 p-[1.5px] opacity-90"
          />
          <div className="bg-aurora relative w-full max-w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-5 py-12 shadow-2xl ring-1 ring-white/10 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            {/* Subtle dot grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
                maskImage:
                  "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, black 40%, transparent 80%)",
              }}
            />

            {/* Floating accent orbs */}
            {!reduce && (
              <>
                <div
                  aria-hidden
                  className="animate-float pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl"
                />
                <div
                  aria-hidden
                  className="animate-float pointer-events-none absolute -right-16 bottom-8 h-44 w-44 rounded-full bg-purple-500/30 blur-3xl"
                  style={{ animationDelay: "-3s", animationDuration: "7.5s" }}
                />
              </>
            )}

            <div className="relative mx-auto max-w-3xl text-center">
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300"
              >
                Ready to train with purpose?
              </motion.p>

              <motion.h2
                variants={fadeUp}
                className="display-heading mt-4 text-3xl text-white sm:text-4xl md:text-5xl lg:text-6xl break-words"
              >
                Stop guessing. Start{" "}
                <span className="text-gradient-brand animate-gradient bg-[length:200%_100%]">
                  training with signal.
                </span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-300 sm:text-lg"
              >
                Join runners and coaches who are using GooseNet to elevate their
                training. Free to get started.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 sm:mt-10 flex w-full max-w-md mx-auto flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-6"
              >
                <motion.div
                  whileHover={reduce ? undefined : { scale: 1.03 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                  }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    href="/signup"
                    className="shadow-glow-brand animate-gradient inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-[linear-gradient(120deg,#3b82f6_0%,#6366f1_35%,#a855f7_70%,#3b82f6_100%)] bg-[length:200%_100%] px-6 py-3.5 text-base font-semibold text-white transition-[filter] hover:brightness-110 sm:px-10 sm:py-5 sm:text-lg"
                  >
                    Get started with GooseNet
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

                <Link
                  href="/login"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 transition-colors hover:text-white"
                >
                  Already have an account?
                  <span className="text-blue-300 underline-offset-4 group-hover:underline">
                    Log in
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
