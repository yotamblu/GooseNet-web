/**
 * Workout Type Selection Page
 * Allows user to select between Running and Strength workout types
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";

export default function WorkoutTypeSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flockName = searchParams?.get("flock") || "";
  const athleteName = searchParams?.get("athlete") || "";
  const athleteImage = searchParams?.get("image") || "";
  
  // Build query string for navigation
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
            <Image
              src="/logo/goosenet_logo.png"
              alt="GooseNet"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">GooseNet</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-12 sm:px-6 sm:py-24 overflow-hidden">
        {/* Glowing purple/blue background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            {flockName ? (
              <Link
                href={`/flocks/manage/${encodeURIComponent(flockName)}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Flock
              </Link>
            ) : athleteName ? (
              <Link
                href={`/athlete/${encodeURIComponent(athleteName)}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Athlete
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            )}
          </div>

          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Create New Workout
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Select the type of workout you want to create
            </p>
          </div>

          {/* Workout Type Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Running Workout Card */}
            <button
              onClick={() => router.push(`/workouts/new/running${queryString ? `?${queryString}` : ''}`)}
              className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 hover:shadow-xl hover:border-blue-600 dark:hover:border-blue-400 transition-all flex flex-col items-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Running Workout
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create structured running workouts with intervals, pace targets, and rest periods
              </p>
            </button>

            {/* Strength Workout Card */}
            <button
              onClick={() => router.push(`/workouts/new/strength${queryString ? `?${queryString}` : ''}`)}
              className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg p-8 hover:shadow-xl hover:border-blue-600 dark:hover:border-blue-400 transition-all flex flex-col items-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Strength Workout
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create strength training workouts with exercises, sets, and reps
              </p>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

