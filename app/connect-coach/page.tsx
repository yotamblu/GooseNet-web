/**
 * Connect Coach Page
 * Allows athletes to input a coach code to pair with their coach.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import {
  AppShell,
  Button,
  Card,
  Spinner,
  fadeUp,
  stagger,
  transitionQuick,
} from "../components/ui";

function CoachInfoAccordion() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="whats-a-coach-panel"
        className="group w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          What&apos;s a coach?
        </span>
        <motion.svg
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={reduce ? undefined : { rotate: open ? 180 : 0 }}
          transition={transitionQuick}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="whats-a-coach-panel"
            key="accordion"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transitionQuick}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                A coach is a running coach or training buddy who creates structured workouts for
                you on GooseNet. Once connected, they can assign sessions straight to your Garmin
                device and track your progress.
              </p>
              <p>
                Ask your coach for their unique <span className="font-semibold text-gray-900 dark:text-gray-100">coach code</span>.
                They can find it in the <em>Invite Athlete</em> section of their dashboard, or send
                you a pairing link.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConnectCoachPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coachCode, setCoachCode] = useState("");
  const [error] = useState<string | null>(null);

  useRequireAuth();

  useEffect(() => {
    if (!loading && user && user.role?.toLowerCase() === "coach") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const codeFromUrl = searchParams.get("coachCode");
    if (codeFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoachCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachCode.trim()) return;

    router.push(`/connect-coach/confirm?coachCode=${encodeURIComponent(coachCode.trim())}`);
  };

  if (loading) {
    return (
      <AppShell hidePageHeader>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user || user.role?.toLowerCase() === "coach") {
    return null;
  }

  return (
    <AppShell
      title="Connect with Coach"
      subtitle="Enter your coach’s code to pair your account and start receiving workouts"
      gradientTitle
      maxWidth="md"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <Card variant="glass" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="coachCode"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Coach code
                </label>
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 7a2 2 0 012 2m2 0a4 4 0 01-5.08 3.86L9 17H7v2H5v2H2v-3l8.14-8.14A4 4 0 1115 7z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="coachCode"
                    name="coachCode"
                    value={coachCode}
                    onChange={(e) => setCoachCode(e.target.value)}
                    placeholder="Paste or type your coach’s code"
                    required
                    autoFocus
                    className="block w-full min-w-0 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900/60 pl-10 pr-4 py-3 text-base sm:text-lg font-mono tracking-wider text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-sans placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Received a link from your coach? The code will be filled in automatically.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-start gap-3 text-rose-900 dark:text-rose-100">
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                fullWidth
                disabled={!coachCode.trim()}
                iconLeft={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                }
              >
                Connect with coach
              </Button>
            </form>

            <div className="mt-6">
              <CoachInfoAccordion />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </Link>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}

export default function ConnectCoachPage() {
  return (
    <Suspense
      fallback={
        <AppShell hidePageHeader>
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>
            </div>
          </div>
        </AppShell>
      }
    >
      <ConnectCoachPageContent />
    </Suspense>
  );
}
