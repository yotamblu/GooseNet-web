/**
 * Athlete Dashboard Page
 * Coach view for managing a specific athlete
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";

export default function AthleteDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [athleteName, setAthleteName] = useState<string>("");
  const [athleteImage, setAthleteImage] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  useEffect(() => {
    // Get athlete name from URL params
    const name = params?.athleteName as string;
    if (name) {
      setAthleteName(decodeURIComponent(name));
    }

    // Get athlete image from query params
    const image = searchParams?.get("image");
    if (image) {
      setAthleteImage(image);
    }
  }, [params, searchParams]);

  // Check if user is a coach
  useEffect(() => {
    if (!authLoading && user && user.role?.toLowerCase() !== "coach") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is a coach
  if (user && user.role?.toLowerCase() !== "coach") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Access denied. This page is for coaches only.</p>
          <Link href="/dashboard" className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 lg:px-8">
          <Link href="/" className="cursor-pointer flex items-center gap-2">
            <Image
              src="/logo/goosenet_logo.png"
              alt="GooseNet"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">GooseNet</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {user?.profilePicString && (
              <img
                src={getProfilePicSrc(user.profilePicString)}
                alt={user.userName}
                referrerPolicy="no-referrer"
                className="cursor-pointer hidden md:block h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-4 sm:px-6 py-8 sm:py-12 lg:py-24 overflow-hidden">
        {/* Glowing purple/blue background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 dark:from-purple-500/15 dark:via-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/20 dark:bg-pink-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/25 dark:bg-blue-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/athletes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Athletes
            </Link>
          </div>

          {/* Athlete Profile Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex flex-col items-center gap-4">
              {/* Athlete Profile Picture */}
              <div className="mb-2">
                {athleteImage && !imageError ? (
                  <img
                    src={getProfilePicSrc(athleteImage)}
                    alt={athleteName}
                    referrerPolicy="no-referrer"
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-gray-300 dark:border-gray-700 object-cover shadow-lg"
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-lg">
                    <svg
                      className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {/* Athlete Name */}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {athleteName || "Athlete"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Athlete Dashboard
              </p>
            </div>
          </div>

          {/* Dashboard Options */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Planned Workouts Card */}
            <div className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Planned Workouts</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                View and manage scheduled workouts for this athlete
              </p>
              <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                View Planned
              </button>
            </div>

            {/* Add Workout Card */}
            <Link 
              href={`/workouts/new/running?athlete=${encodeURIComponent(athleteName)}${athleteImage ? `&image=${encodeURIComponent(athleteImage)}` : ''}`}
              className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Workout</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                Create and assign a new workout to this athlete
              </p>
              <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                Add Workout
              </button>
            </Link>

            {/* Completed Workouts Card */}
            <Link 
              href={`/activities?athlete=${encodeURIComponent(athleteName)}`}
              className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Completed Workouts</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                Review completed workouts and performance data
              </p>
              <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                View Completed
              </button>
            </Link>

            {/* Sleep Data Card */}
            <div className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sleep Data</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                Monitor sleep patterns and recovery metrics
              </p>
              <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                View Sleep Data
              </button>
            </div>

            {/* Training Summary Card */}
            <div className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Training Summary</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                View comprehensive training statistics and insights
              </p>
              <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                View Summary
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

