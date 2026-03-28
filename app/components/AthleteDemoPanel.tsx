/**
 * Animated athlete-side demo (Garmin connect → workout → review)
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function AthleteDemoPanel() {
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

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 4000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
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
    setTimeout(() => setIsPaused(false), 6000);
  };

  return (
    <div
      className="relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ minHeight: "500px" }}
    >
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

      <div className="hidden lg:block absolute left-6 top-24 bottom-6 w-16 border-r border-gray-200 dark:border-gray-700">
        <div className="space-y-4 pt-4">
          <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
          <div className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>

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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
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

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {steps.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleStepClick(index)}
            className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              currentStep === index ? "w-8 bg-blue-600" : "w-2 bg-gray-600 hover:bg-gray-500"
            }`}
            aria-label={`Go to step ${index + 1}: ${steps[index].title}`}
          />
        ))}
      </div>
    </div>
  );
}
