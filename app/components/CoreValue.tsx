/**
 * CoreValue
 *
 * Manifesto / pull-quote block. Large elegant typography with a gradient
 * signature line and subtle aurora backdrop.
 */

"use client";

import { motion } from "framer-motion";
import { fadeUp, inViewOnce, stagger } from "./ui";

export default function CoreValue() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-32 dark:bg-gray-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[min(100%,860px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-teal-400/10 blur-3xl dark:from-blue-500/10 dark:via-purple-500/10 dark:to-teal-400/5" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400"
          >
            Our manifesto
          </motion.p>

          <motion.blockquote
            variants={fadeUp}
            className="display-heading mt-5 text-3xl leading-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-gray-50"
          >
            <span
              aria-hidden
              className="select-none text-gradient-brand mr-2 align-[-0.1em] text-5xl sm:text-6xl"
            >
              &ldquo;
            </span>
            Real training doesn&apos;t live in screenshots, chat threads, or
            generic fitness apps. It lives in{" "}
            <span className="text-gradient-brand animate-gradient bg-[length:200%_100%]">
              structure, data, and trust
            </span>{" "}
            — between an athlete and their coach.
          </motion.blockquote>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span
              aria-hidden
              className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            />
            <span className="text-sm font-medium uppercase tracking-[0.16em] text-gray-600 dark:text-gray-400">
              Built for real running training
            </span>
            <span
              aria-hidden
              className="h-px w-12 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
