/**
 * FAQ — expandable cards aligned with marketing page polish (gradients, glows)
 */

"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "../../lib/json-ld";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white dark:bg-gray-900 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl dark:bg-purple-500/15" />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute top-1/2 left-1/2 h-[420px] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-blue-500/15 blur-3xl dark:from-blue-500/10 dark:via-purple-500/10 dark:to-blue-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-700 dark:text-gray-300">
            Quick answers about GooseNet and how it works.
          </p>
        </div>

        <dl className="mx-auto mt-14 max-w-3xl space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const questionId = `faq-question-${index}`;

            return (
              <div
                key={index}
                className="group relative rounded-2xl p-[1px] shadow-lg shadow-blue-500/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:shadow-blue-500/10 dark:hover:shadow-purple-500/15"
              >
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/35 via-purple-500/25 to-blue-500/35 opacity-90 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/25 dark:via-purple-400/20 dark:to-blue-400/25"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/80">
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-blue-50/40 opacity-80 dark:from-white/5 dark:via-transparent dark:to-purple-950/30"
                    aria-hidden
                  />
                  <div className="relative">
                    <dt>
                      <button
                        type="button"
                        id={questionId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggle(index)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/60 dark:hover:bg-white/5 sm:px-6 sm:py-5"
                      >
                        <span className="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100 sm:text-lg">
                          {item.question}
                        </span>
                        <span
                          className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/30 transition-transform duration-300 dark:from-blue-500 dark:to-purple-500 dark:shadow-purple-500/25 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.25}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      </button>
                    </dt>
                    <dd
                      id={panelId}
                      role="region"
                      aria-labelledby={questionId}
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="border-t border-gray-200/80 px-5 pb-5 pt-0 dark:border-gray-700/80 sm:px-6 sm:pb-6">
                          <p className="pt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
