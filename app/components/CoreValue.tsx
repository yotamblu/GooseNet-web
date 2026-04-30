/**
 * CoreValue — founder-voice manifesto; injury + trust framing.
 */

"use client";

import { motion } from "framer-motion";
import { fadeUp, inViewOnce, stagger } from "./ui";

export default function CoreValue() {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-white py-24 sm:py-32 lg:py-44 dark:bg-gray-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[min(100%,860px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-teal-400/10 blur-3xl dark:from-blue-500/10 dark:via-purple-500/10 dark:to-teal-400/5" />
      </div>

      <div className="relative mx-auto max-w-5xl w-full min-w-0 px-4 sm:px-6 lg:px-8 text-center xl:max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 sm:text-sm dark:text-blue-400"
          >
            What we believe
          </motion.p>

          <motion.blockquote
            variants={fadeUp}
            className="display-heading mt-6 text-2xl leading-tight text-gray-900 sm:mt-8 sm:text-3xl md:text-4xl lg:text-5xl break-words dark:text-gray-50"
          >
            <span
              aria-hidden
              className="select-none text-gradient-brand mr-2 align-[-0.1em] text-5xl sm:text-6xl md:text-7xl"
            >
              &ldquo;
            </span>
            The worst Sunday isn&apos;t the long run — it&apos;s explaining to a
            kid that their season is over. The honest Garmin file should show up{" "}
            <span className="text-gradient-brand animate-gradient bg-[length:200%_100%]">
              before
            </span>{" "}
            that conversation, not buried in your camera roll.
          </motion.blockquote>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <span
              aria-hidden
              className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            />
            <span className="text-sm font-medium uppercase tracking-[0.16em] text-gray-600 sm:text-base dark:text-gray-400">
              Free for coaches who hold the line
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
