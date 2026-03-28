/**
 * Animated Product Demo Section
 * Shows GooseNet workflow with animated demo panel
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function AnimatedDemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    {
      id: "connect",
      title: "Connect Garmin",
      description: "Sync your Garmin device in seconds",
    },
    {
      id: "assign",
      title: "Workout Assigned",
      description: "Coach assigns structured intervals",
    },
    {
      id: "review",
      title: "Workout Review",
      description: "Analyze pace, HR, and performance",
    },
  ];

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 4000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, steps.length]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000); // Resume after 6 seconds
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          {/* Left Column: Copy + Lead Capture */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              See GooseNet in Action
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300">
              Structured workouts, coach athlete collaboration, and Garmin-powered insights. Preview the flow in 30 seconds.
            </p>

            {/* Bullets */}
            <ul role="list" className="mt-8 space-y-4">
              <li className="flex gap-x-3">
                <svg
                  className="h-6 w-5 flex-none text-blue-600 dark:text-blue-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-base leading-7 text-gray-700 dark:text-gray-300">
                  Assign structured running workouts
                </span>
              </li>
              <li className="flex gap-x-3">
                <svg
                  className="h-6 w-5 flex-none text-blue-600 dark:text-blue-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-base leading-7 text-gray-700 dark:text-gray-300">
                  Sync and execute on Garmin
                </span>
              </li>
              <li className="flex gap-x-3">
                <svg
                  className="h-6 w-5 flex-none text-blue-600 dark:text-blue-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-base leading-7 text-gray-700 dark:text-gray-300">
                  Review pace, heart rate, elevation, laps
                </span>
              </li>
              <li className="flex gap-x-3">
                <svg
                  className="h-6 w-5 flex-none text-blue-600 dark:text-blue-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-base leading-7 text-gray-700 dark:text-gray-300">
                  Share clean summaries with your coach/athletes
                </span>
              </li>
            </ul>

          </div>

          {/* Right Column: Animated Demo Panel */}
          <div className="lg:pl-8">
            <div
              className="relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{ minHeight: "500px" }}
            >
              {/* App Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo/goosenet_logo.png"
                    alt="GooseNet"
                    width={24}
                    height={24}
                    className="h-6 w-auto"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">GooseNet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                </div>
              </div>

              {/* Sidebar (hidden on mobile) */}
              <div className="hidden lg:block absolute left-6 top-24 bottom-6 w-16 border-r border-gray-200 dark:border-gray-700">
                <div className="space-y-4 pt-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
                  <div className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                  <div className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                  <div className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:ml-20">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="connect"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Connect Garmin</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sync your device</p>
                          </div>
                          <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50">
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">Garmin Forerunner 945 Connected</p>
                              <p className="text-xs text-green-600 dark:text-green-400/80 mt-0.5">Last synced: Just now</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="assign"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Workout Assigned</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Interval Training - 5x1km</p>
                        </div>
                        <div className="space-y-3">
                          <div className="rounded-lg bg-blue-600/20 border border-blue-500/30 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-300">Warm-up</span>
                              <span className="text-xs text-blue-400">10 min</span>
                            </div>
                            <div className="h-2 bg-blue-500/30 rounded-full"></div>
                          </div>
                          <div className="rounded-lg bg-blue-600/20 border border-blue-500/30 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-300">Interval 1</span>
                              <span className="text-xs text-blue-400">4:00/km pace</span>
                            </div>
                            <div className="h-2 bg-blue-500/30 rounded-full"></div>
                          </div>
                          <div className="rounded-lg bg-gray-700/50 border border-gray-600/50 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-300">Recovery</span>
                              <span className="text-xs text-gray-400">2 min</span>
                            </div>
                            <div className="h-2 bg-gray-600/30 rounded-full"></div>
                          </div>
                          <div className="rounded-lg bg-blue-600/20 border border-blue-500/30 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-300">Interval 2</span>
                              <span className="text-xs text-blue-400">4:00/km pace</span>
                            </div>
                            <div className="h-2 bg-blue-500/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 mb-1">Workout Review</h3>
                          <p className="text-sm text-gray-400">Completed: Interval Training</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                          <div className="flex items-end justify-around h-32 gap-2">
                            {[60, 75, 85, 70, 90, 80, 95].map((height, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-blue-600 rounded-t transition-all"
                                style={{ height: `${height}%` }}
                                aria-label={`Bar ${i + 1}: ${height}%`}
                              ></div>
                            ))}
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">4:12</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Pace</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">165</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Avg HR</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">5.2km</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Distance</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleStepClick(index)}
                    className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      currentStep === index
                        ? "w-8 bg-blue-600"
                        : "w-2 bg-gray-600 hover:bg-gray-500"
                    }`}
                    aria-label={`Go to step ${index + 1}: ${steps[index].title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

