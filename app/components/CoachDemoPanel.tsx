/**
 * Coach Demo Panel
 * Animated coach workflow demonstration
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CoachDemoPanel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    { id: "create", title: "Create Structured Workout" },
    { id: "assign", title: "Assign to Athlete" },
    { id: "review", title: "Review Completed Session" },
  ];

  // Auto-advance every 4.5 seconds
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
        setShowToast(false);
      }, 4500);
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
    setShowToast(false);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const handleAssign = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Sparkline data for pace and HR
  const paceData = [4.2, 3.9, 3.8, 3.9, 4.0, 3.8, 3.9, 4.1, 3.8, 4.0];
  const hrData = [145, 160, 165, 162, 168, 165, 163, 170, 165, 168];
  const lapData = [3.8, 3.9, 3.7, 3.8, 3.9, 3.8, 3.7, 3.9];

  return (
    <div
      className="relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ minHeight: "500px" }}
    >
      {/* App Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/goosenet_logo.png"
            alt="GooseNet"
            width={20}
            height={20}
            className="h-5 w-auto"
          />
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">GooseNet Coach</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
        </div>
      </div>

      {/* Sidebar (hidden on mobile) */}
      <div className="hidden lg:block absolute left-6 top-20 bottom-24 w-12 border-r border-gray-200 dark:border-gray-700">
        <div className="space-y-3 pt-3">
          <div className="h-7 w-7 rounded-lg bg-blue-600"></div>
          <div className="h-7 w-7 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-7 w-7 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-7 w-7 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-16">
        <AnimatePresence mode="wait">
          {/* State A: Create Structured Workout */}
          {currentStep === 0 && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Create Structured Workout</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Build interval training plans</p>
              </div>

              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <input
                    type="text"
                    value="Tempo + Repeats"
                    readOnly
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none flex-shrink-0"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-600/20 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 dark:border-blue-500/30 whitespace-nowrap">
                      STRUCTURED
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 whitespace-nowrap">
                      RUNNING
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-500">1.</span>
                    <span>Warmup 10:00 easy</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-500">2.</span>
                    <span>5 x (400m @ 3:45–4:00/km, 200m jog)</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-500">3.</span>
                    <span>Cooldown 10:00</span>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Send to Athlete
                </button>
              </div>
            </motion.div>
          )}

          {/* State B: Assign to Athlete */}
          {currentStep === 1 && (
            <motion.div
              key="assign"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Assign to Athlete</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Schedule and sync to Garmin</p>
              </div>

              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">Athlete</label>
                  <select className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Noa Levi</option>
                    <option>Sarah Chen</option>
                    <option>Mike Johnson</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5">Date</label>
                  <div className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                    Tue, Jan 14
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-xs text-gray-700 dark:text-gray-300">Sync to Garmin</label>
                  <div className="relative inline-flex items-center h-5 w-9 bg-blue-600 rounded-full cursor-pointer">
                    <span className="absolute right-1 h-3 w-3 bg-white rounded-full transition-transform"></span>
                  </div>
                </div>

                <button
                  onClick={handleAssign}
                  className="w-full mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Workout
                </button>

                {/* Toast Notification */}
                <AnimatePresence>
                  {showToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 px-3 py-2 text-xs text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-lg"
                    >
                      ✓ Assigned and queued for Garmin sync
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* State C: Review Completed Session */}
          {currentStep === 2 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Review Completed Session</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Analyze performance metrics</p>
              </div>

              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Distance</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">5.2 km</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Duration</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">22:15</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Avg Pace</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">4:17/km</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Avg HR</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">165 bpm</div>
                  </div>
                </div>

                {/* Sparklines */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Pace</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">min/km</span>
                    </div>
                    <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <polyline
                        points={paceData.map((val, i) => `${(i * 100) / (paceData.length - 1)},${30 - (val - 3.7) * 20}`).join(" ")}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Heart Rate</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">bpm</span>
                    </div>
                    <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <polyline
                        points={hrData.map((val, i) => `${(i * 100) / (hrData.length - 1)},${30 - ((val - 140) / 30) * 30}`).join(" ")}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Lap Consistency Chart */}
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Lap Consistency</div>
                  <div className="flex items-end justify-between h-16 gap-1">
                    {lapData.map((lap, i) => {
                      const height = ((lap - 3.7) / 0.3) * 100;
                      const isFastest = lap === Math.min(...lapData);
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-t transition-all ${
                            isFastest
                              ? "bg-blue-600 border-2 border-blue-400"
                              : "bg-gray-300 dark:bg-gray-700 border border-gray-400 dark:border-gray-600"
                          }`}
                          style={{ height: `${Math.max(20, Math.min(100, height))}%` }}
                          aria-label={`Lap ${i + 1}: ${lap} min/km`}
                        ></div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">Fastest: 3.7 min/km</div>
                </div>

                {/* Coach Note */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Coach Note</div>
                  <div className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded border border-gray-300 dark:border-gray-600/50">
                    Strong pacing on reps 2–4. Next week increase rep count to 6.
                  </div>
                </div>

                {/* Garmin Badge */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700/50 flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Data from Garmin
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step Indicators */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {steps.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleStepClick(index)}
            className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              currentStep === index
                ? "w-6 bg-blue-600"
                : "w-1.5 bg-gray-600 hover:bg-gray-500"
            }`}
            aria-label={`Go to step ${index + 1}: ${steps[index].title}`}
          />
        ))}
      </div>

      {/* CTA Row */}
      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between px-4 py-2.5 bg-gray-100/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700">
        <span className="text-xs text-gray-700 dark:text-gray-300">Want this for your team?</span>
        <a
          href="#cta"
          className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Join as Coach
        </a>
      </div>
    </div>
  );
}

