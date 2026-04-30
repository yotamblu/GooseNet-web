"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "./ui/cn";

export interface WingmanChatPanelProps {
  open: boolean;
  onClose: () => void;
  /** Shown as context under the title (e.g. summary date range). */
  periodLabel?: string;
}

export default function WingmanChatPanel({
  open,
  onClose,
  periodLabel,
}: WingmanChatPanelProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="wingman-chat-title"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 34 }
            }
            className={cn(
              "fixed top-0 right-0 z-[100] flex h-[100dvh] min-h-0 w-full max-w-[min(100vw,26rem)] flex-col shadow-2xl shadow-black/25",
              "border-l border-gray-200/80 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b101a]/95",
              "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-gradient-to-b before:from-blue-500/40 before:via-purple-400/25 before:to-teal-400/35"
            )}
          >
            {/* Header */}
            <header className="flex shrink-0 items-start gap-3 border-b border-gray-200/80 px-4 py-4 dark:border-white/10">
              <span className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 via-purple-500/12 to-teal-400/15 ring-1 ring-white/70 dark:ring-white/10">
                <Image
                  src="/wingman_logo.png"
                  alt=""
                  width={26}
                  height={26}
                  className="h-[26px] w-[26px] object-contain"
                />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
                  <h2
                    id="wingman-chat-title"
                    className="display-heading text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50"
                  >
                    Wingman
                  </h2>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-400/15 dark:text-blue-300">
                    Preview
                  </span>
                </div>
                {periodLabel && (
                  <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Summary ·{" "}
                    <span className="tabular-nums text-gray-700 dark:text-gray-300">{periodLabel}</span>
                  </p>
                )}
                <p className="mt-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
                  Ask anything about this summary — pace, volume, trends, or how workouts fit together.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat"
                className="-m-1 shrink-0 rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/5 dark:hover:text-gray-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            {/* Messages — isolated vertical scroll (wheel targets this pane when hovered) */}
            <div
              data-wingman-scroll="messages"
              className={cn(
                "touch-pan-y min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4",
                "[scrollbar-gutter:stable]"
              )}
            >
              <div className="mx-auto flex max-w-[calc(100%-0rem)] flex-col gap-4 pb-2">
                <div className="flex justify-start">
                  <div
                    className={cn(
                      "max-w-[92%] rounded-2xl rounded-bl-lg px-3.5 py-2.5 text-sm leading-relaxed",
                      "border border-blue-100/80 bg-gradient-to-br from-blue-50/95 to-white text-gray-800 shadow-sm",
                      "dark:border-blue-500/15 dark:from-blue-400/[0.08] dark:to-white/[0.03] dark:text-gray-100"
                    )}
                  >
                    Hey — I&apos;ll sit beside your summary and translate charts into plain language.
                    Try asking how volume compares week to week, or what your hardest stretch was.
                  </div>
                </div>

                <div className="flex justify-center px-2">
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                    Sample conversation
                  </p>
                </div>

                <div className="flex justify-end">
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl rounded-br-lg px-3.5 py-2.5 text-sm leading-relaxed text-gray-900",
                      "bg-gray-100/95 ring-1 ring-gray-200/80 dark:bg-white/10 dark:text-gray-50 dark:ring-white/10"
                    )}
                  >
                    Why did my weekly distance dip in the middle of the block?
                  </div>
                </div>

                <div className="flex justify-start">
                  <div
                    className={cn(
                      "max-w-[92%] rounded-2xl rounded-bl-lg px-3.5 py-2.5 text-sm leading-relaxed",
                      "border border-teal-100/70 bg-gradient-to-br from-teal-50/90 to-white text-gray-800 shadow-sm",
                      "dark:border-teal-500/15 dark:from-teal-400/[0.07] dark:to-white/[0.03] dark:text-gray-100"
                    )}
                  >
                    That&apos;ll be grounded in your actual workouts once replies go live — for now
                    imagine me tying together recovery days, weather, and session mix.
                  </div>
                </div>

                <div className="flex justify-center px-1 pt-1">
                  <p className="max-w-sm text-center text-xs italic leading-relaxed text-gray-500 dark:text-gray-400">
                    You&apos;ll be able to scroll back here anytime while you browse charts below —
                    nothing sends yet; this is the layout-only preview.
                  </p>
                </div>
              </div>
            </div>

            {/* Composer (non-functional) */}
            <footer className="shrink-0 border-t border-gray-200/80 bg-gray-50/90 px-4 py-3 dark:border-white/10 dark:bg-[#070b12]/80">
              <label htmlFor="wingman-chat-input" className="sr-only">
                Message Wingman
              </label>
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-inner ring-1 ring-black/[0.03] dark:border-white/10 dark:bg-gray-900/80 dark:ring-white/[0.04]">
                <textarea
                  id="wingman-chat-input"
                  rows={3}
                  placeholder="Ask Wingman about this summary…"
                  className={cn(
                    "w-full resize-none rounded-2xl bg-transparent px-3.5 py-3 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400",
                    "dark:text-gray-100 dark:placeholder:text-gray-500"
                  )}
                />
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="absolute bottom-2.5 right-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white opacity-40 shadow-md shadow-blue-600/20 dark:from-blue-500 dark:to-purple-500"
                  title="Sending disabled in preview"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-500">
                Messaging is visual-only — hook up AI when you&apos;re ready.
              </p>
            </footer>
          </motion.aside>
      )}
    </AnimatePresence>,
    document.body
  );
}
