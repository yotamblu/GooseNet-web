/**
 * FAQSection
 *
 * Accordion with smooth height + opacity animation via `AnimatePresence`.
 * Consumes `FAQ_ITEMS` from `lib/json-ld` (visible copy matches FAQ schema).
 */

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQ_ITEMS } from "../../lib/json-ld";
import { SectionHeading, fadeUp, inViewOnce, stagger } from "./ui";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative w-full max-w-full overflow-hidden bg-white py-24 sm:py-32 lg:py-44 dark:bg-gray-900"
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
              variant="marketing"
              eyebrow="FAQ"
              title="Frequently asked questions"
              description="Straight answers about Garmin sync, coaching workflows, and why GooseNet stays free for coaches."
            />
          </motion.div>

          <motion.dl
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={inViewOnce}
            className="mx-auto mt-10 sm:mt-12 w-full max-w-3xl space-y-3"
          >
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const questionId = `faq-question-${index}`;

              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="group relative rounded-2xl p-[1px] transition-shadow duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/15"
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/25 to-teal-400/25 opacity-70 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-teal-400/15"
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/80">
                    <dt>
                      <button
                        type="button"
                        id={questionId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggle(index)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-white/60 dark:hover:bg-white/5 sm:gap-4 sm:px-6 sm:py-5"
                      >
                        <span className="text-base font-semibold leading-snug text-gray-900 break-words min-w-0 sm:text-lg md:text-xl dark:text-gray-100">
                          {item.question}
                        </span>
                        <motion.span
                          aria-hidden
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/25"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.25}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </motion.span>
                      </button>
                    </dt>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.dd
                          id={panelId}
                          role="region"
                          aria-labelledby={questionId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                            opacity: { duration: 0.2 },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-200/70 px-4 pb-5 pt-4 dark:border-white/10 sm:px-6 sm:pb-6">
                            <p className="text-sm sm:text-base md:text-lg leading-7 text-gray-600 dark:text-gray-400 break-words">
                              {item.answer}
                            </p>
                          </div>
                        </motion.dd>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.dl>
        </motion.div>
      </div>
    </section>
  );
}
