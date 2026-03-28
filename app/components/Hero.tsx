/**
 * Hero — headline + athlete/coach preview toggle with embedded demos
 */

"use client";

import { useState } from "react";
import AthleteDemoPanel from "./AthleteDemoPanel";
import CoachDemoPanel from "./CoachDemoPanel";

type Role = "athlete" | "coach";

const ATHLETE_BULLETS = [
  "Assign structured running workouts",
  "Sync and execute on Garmin",
  "Review pace, heart rate, elevation, laps",
  "Share clean summaries with your coach",
];

const COACH_BULLETS = [
  "Create structured running workouts",
  "Assign workouts to athletes",
  "Review completed sessions with real metrics",
  "Analyze pace consistency, heart rate trends, and laps",
  "Coach using data, not screenshots",
];

export default function Hero() {
  const [role, setRole] = useState<Role>("athlete");

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900 pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pb-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl dark:bg-purple-500/20"></div>
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl dark:bg-blue-500/20"></div>
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 blur-3xl dark:from-purple-500/15 dark:via-blue-500/15 dark:to-purple-500/15"></div>
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl dark:bg-pink-500/15"></div>
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl dark:bg-blue-500/15"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="relative text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl lg:text-7xl">
            Train Smarter. Run Stronger.{" "}
            <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-400">
              Together.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300 sm:text-xl">
            GooseNet connects runners and coaches through structured workouts, real performance data, and seamless Garmin
            integration.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Structured running workouts</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Coach–athlete collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Garmin-powered insights</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="min-w-0 lg:pt-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Preview the product</p>
              <div
                className="inline-flex shrink-0 rounded-xl border border-gray-200 bg-gray-100/90 p-1 shadow-inner dark:border-gray-700 dark:bg-gray-800/90"
                role="tablist"
                aria-label="Choose athlete or coach preview"
              >
                <button
                  type="button"
                  role="tab"
                  id="hero-tab-athlete"
                  aria-selected={role === "athlete"}
                  aria-controls="hero-demo-panel"
                  onClick={() => setRole("athlete")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 sm:px-5 ${
                    role === "athlete"
                      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/30"
                      : "text-gray-600 hover:bg-gray-200/90 dark:text-gray-400 dark:hover:bg-gray-700/80"
                  }`}
                >
                  Athlete
                </button>
                <button
                  type="button"
                  role="tab"
                  id="hero-tab-coach"
                  aria-selected={role === "coach"}
                  aria-controls="hero-demo-panel"
                  onClick={() => setRole("coach")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 sm:px-5 ${
                    role === "coach"
                      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/30"
                      : "text-gray-600 hover:bg-gray-200/90 dark:text-gray-400 dark:hover:bg-gray-700/80"
                  }`}
                >
                  Coach
                </button>
              </div>
            </div>

            <div className="mt-6 text-left" aria-live="polite">
              {role === "athlete" ? (
                <>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
                    For athletes
                  </h2>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Connect Garmin, receive workouts, and review your sessions with pace, heart rate, and laps.
                  </p>
                  <ul role="list" className="mt-6 space-y-3">
                    {ATHLETE_BULLETS.map((item) => (
                      <li key={item} className="flex gap-x-3">
                        <svg
                          className="mt-0.5 h-6 w-5 flex-none text-blue-600 dark:text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-base leading-7 text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
                    For coaches
                  </h2>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Plan, assign, and analyze with real performance data—see how workouts were executed and give targeted
                    feedback.
                  </p>
                  <ul role="list" className="mt-6 space-y-3">
                    {COACH_BULLETS.map((item) => (
                      <li key={item} className="flex gap-x-3">
                        <svg
                          className="mt-0.5 h-6 w-5 flex-none text-blue-600 dark:text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-base leading-7 text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="/signup"
                className="inline-flex justify-center rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:px-10 sm:py-4 sm:text-lg"
              >
                Join GooseNet
              </a>
              <a
                href="#how-it-works"
                className="inline-flex justify-center rounded-lg border-2 border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600 dark:focus:ring-offset-gray-900 sm:px-10 sm:py-4 sm:text-lg"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div id="hero-demo-panel" className="min-w-0" role="tabpanel" aria-labelledby={role === "athlete" ? "hero-tab-athlete" : "hero-tab-coach"}>
            <div key={role} className="lg:pl-2">
              {role === "athlete" ? <AthleteDemoPanel /> : <CoachDemoPanel showFooterCta={false} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
