/**
 * Workout Type Selection Page
 * Allows user to select between Running and Strength workout types
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AppShell,
  Card,
  Spinner,
  fadeUp,
  stagger,
  inViewOnce,
} from "../../components/ui";

function WorkoutTypeSelectionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flockName = searchParams?.get("flock") || "";
  const athleteName = searchParams?.get("athlete") || "";
  const athleteImage = searchParams?.get("image") || "";
  const reduce = useReducedMotion();

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (flockName) {
      params.append("flock", flockName);
    }
    if (athleteName) {
      params.append("athlete", athleteName);
    }
    if (athleteImage) {
      params.append("image", athleteImage);
    }
    return params.toString();
  };

  const queryString = buildQueryString();
  const runningHref = `/workouts/new/running${queryString ? `?${queryString}` : ""}`;
  const strengthHref = `/workouts/new/strength${queryString ? `?${queryString}` : ""}`;

  const backHref = flockName
    ? `/flocks/manage/${encodeURIComponent(flockName)}`
    : athleteName
      ? `/athlete/${encodeURIComponent(athleteName)}`
      : "/dashboard";
  const backLabel = flockName
    ? "Back to Flock"
    : athleteName
      ? "Back to Athlete"
      : "Back to Dashboard";

  return (
    <AppShell
      eyebrow="New Session"
      title="Create a new workout"
      subtitle="Pick the kind of workout you'd like to plan."
      gradientTitle
      maxWidth="lg"
    >
      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Link>
      </div>

      <motion.div
        variants={reduce ? undefined : stagger}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={inViewOnce}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        <motion.div variants={reduce ? undefined : fadeUp}>
          <Card
            interactive
            padding="lg"
            role="button"
            tabIndex={0}
            onClick={() => router.push(runningHref)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(runningHref);
              }
            }}
            className="w-full text-left group relative overflow-hidden cursor-pointer"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-teal-400/20 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="relative flex flex-col items-start text-left">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-glow-brand">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="display-heading text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                Running Workout
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                Structured intervals with pace targets, distance or time steps, and rest periods. Pushes to Garmin.
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                Plan a run
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={reduce ? undefined : fadeUp}>
          <Card
            interactive
            padding="lg"
            role="button"
            tabIndex={0}
            onClick={() => router.push(strengthHref)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(strengthHref);
              }
            }}
            className="w-full text-left group relative overflow-hidden cursor-pointer"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-amber-400/20 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="relative flex flex-col items-start text-left">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-glow-brand">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="display-heading text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                Strength Workout
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                Drill-based sessions with exercises, sets, and reps. Perfect for gym sessions and mobility days.
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400">
                Plan a lift
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}

export default function WorkoutTypeSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f17]">
          <Spinner size="lg" />
        </div>
      }
    >
      <WorkoutTypeSelectionPageContent />
    </Suspense>
  );
}
