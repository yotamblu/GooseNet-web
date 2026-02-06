/**
 * Training Summary Page
 * Displays comprehensive training statistics for a date range
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";
import WorkoutMap from "../components/WorkoutMap";

interface WorkoutLap {
  lapDistanceInKilometers: number;
  lapDurationInSeconds: number;
  lapPaceInMinKm: number;
  avgHeartRate: number;
}

interface Workout {
  workoutId: number;
  wokroutName: string;
  workoutDurationInSeconds: number;
  workoutDistanceInMeters: number;
  workoutAvgHR: number;
  workoutAvgPaceInMinKm: number;
  workoutLaps: WorkoutLap[];
  workoutCoordsJsonStr: string;
  workoutMapCenterJsonStr: string;
  workoutMapZoom: number;
  workoutDeviceName: string;
  userAccessToken: string;
  dataSamples: Array<{
    timerDurationInSeconds: number;
    heartRate: number;
    speedMetersPerSecond: number;
    elevationInMeters: number;
  }>;
  workoutDate: string;
}

interface TrainingSummary {
  startDate: string;
  endDate: string;
  distanceInKilometers: number;
  averageDailyInKilometers: number;
  timeInSeconds: number;
  averageDailyInSeconds: number;
  allWorkouts: Workout[];
}

function TrainingSummaryPageContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [athleteName, setAthleteName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [summary, setSummary] = useState<TrainingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noAccess, setNoAccess] = useState(false);

  // Require authentication
  useRequireAuth();

  // Get storage key for this athlete
  const getStorageKey = (key: string) => {
    if (!athleteName) return `trainingSummary_${key}`;
    return `trainingSummary_${athleteName}_${key}`;
  };

  // Load saved data from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined" || !athleteName) return;

    const savedStartDate = sessionStorage.getItem(getStorageKey("startDate"));
    const savedEndDate = sessionStorage.getItem(getStorageKey("endDate"));
    const savedSummary = sessionStorage.getItem(getStorageKey("summary"));

    if (savedStartDate) setStartDate(savedStartDate);
    if (savedEndDate) setEndDate(savedEndDate);
    if (savedSummary) {
      try {
        const parsed = JSON.parse(savedSummary);
        setSummary(parsed);
      } catch (e) {
        console.error("Failed to parse saved summary:", e);
      }
    }
  }, [athleteName]);

  // Get athlete name from URL params or use current user
  useEffect(() => {
    const athleteParam = searchParams.get("athlete");
    if (athleteParam) {
      setAthleteName(decodeURIComponent(athleteParam));
    } else if (user && user.role?.toLowerCase() === "athlete") {
      setAthleteName(user.userName);
    } else if (user && user.role?.toLowerCase() === "coach" && !athleteParam) {
      setNoAccess(true);
    }
  }, [searchParams, user]);

  // Format date to M/d/yyyy (no leading zeros)
  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Convert date string (YYYY-MM-DD) to M/d/yyyy format
  const parseDateInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return formatDate(date);
  };

  // Check if dates are valid (start before end)
  const areDatesValid = (): boolean => {
    if (!startDate || !endDate) return false;
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    return startDateObj <= endDateObj;
  };

  // Fetch training summary
  const fetchTrainingSummary = async () => {
    if (!user || !user.apiKey || !athleteName || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNoAccess(false);

      const startDateFormatted = parseDateInput(startDate);
      const endDateFormatted = parseDateInput(endDate);

      if (!startDateFormatted || !endDateFormatted) {
        setError("Invalid date format");
        setLoading(false);
        return;
      }

      // Validate that start date is before end date
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      if (startDateObj > endDateObj) {
        setError("Start date must be before end date");
        setLoading(false);
        return;
      }

      const response = await apiService.getTrainingSummary<TrainingSummary>(
        user.apiKey,
        athleteName,
        startDateFormatted,
        endDateFormatted
      );

      setSummary(response.data);

      // Save to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem(getStorageKey("startDate"), startDate);
        sessionStorage.setItem(getStorageKey("endDate"), endDate);
        sessionStorage.setItem(getStorageKey("summary"), JSON.stringify(response.data));
      }
    } catch (err) {
      console.error("Failed to fetch training summary:", err);
      if (err instanceof Error && (err as any).status === 401) {
        setNoAccess(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load training summary");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km.toFixed(2);
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Format pace
  const formatPace = (paceInMinKm: number): string => {
    if (!paceInMinKm || isNaN(paceInMinKm) || paceInMinKm <= 0) return "N/A";
    const minutes = Math.floor(paceInMinKm);
    const seconds = Math.round((paceInMinKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Format HR
  const formatHR = (hr: number): string => {
    if (!hr || isNaN(hr) || hr <= 0) return "N/A";
    return Math.round(hr).toString();
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

  // Show no access page if access is denied
  if (noAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Access
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {user?.role?.toLowerCase() === "coach"
              ? "Please select an athlete to view their training summary."
              : "You do not have access to view this training summary."}
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
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
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Training Summary
            </h1>
            {athleteName && (
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                {user?.role?.toLowerCase() === "coach" ? `Athlete: ${athleteName}` : "Your training statistics"}
              </p>
            )}
          </div>

          {/* Date Input Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    // Clear error when user changes dates
                    if (error && error.includes("date")) {
                      setError(null);
                    }
                  }}
                  className={`w-full rounded-lg border ${
                    startDate && endDate && !areDatesValid()
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    // Clear error when user changes dates
                    if (error && error.includes("date")) {
                      setError(null);
                    }
                  }}
                  className={`w-full rounded-lg border ${
                    startDate && endDate && !areDatesValid()
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchTrainingSummary}
                  disabled={loading || !startDate || !endDate || !areDatesValid()}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Get Summary"}
                </button>
              </div>
            </div>
            {startDate && endDate && !areDatesValid() && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Start date must be before or equal to end date.
                </p>
              </div>
            )}
            {error && !error.includes("date") && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Total Distance
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.distanceInKilometers.toFixed(2)} <span className="text-lg text-gray-500 dark:text-gray-400">km</span>
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Average Daily Distance
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.averageDailyInKilometers.toFixed(2)} <span className="text-lg text-gray-500 dark:text-gray-400">km</span>
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Total Time
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDuration(summary.timeInSeconds)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Average Daily Time
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDuration(Math.round(summary.averageDailyInSeconds))}
                </p>
              </div>
            </div>
          )}

          {/* Date Range Display */}
          {summary && (
            <div className="mb-6 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Period: <span className="font-semibold text-gray-900 dark:text-gray-100">{summary.startDate}</span> to{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{summary.endDate}</span>
              </p>
            </div>
          )}

          {/* Workouts List */}
          {summary && summary.allWorkouts && summary.allWorkouts.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Workouts ({summary.allWorkouts.length})
              </h2>
              {summary.allWorkouts.map((workout, index) => {
                // Parse coordinates for map
                let coords: [number, number][] = [];
                try {
                  if (workout.workoutCoordsJsonStr) {
                    coords = JSON.parse(workout.workoutCoordsJsonStr);
                  }
                } catch (e) {
                  console.error("Failed to parse coordinates:", e);
                }

                return (
                  <Link
                    href={`/workout?userName=${encodeURIComponent(athleteName)}&workoutId=${workout.workoutId}`}
                    key={workout.workoutId || `workout-${index}`}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer block"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Left Side: All Data */}
                      <div className="flex-1 p-6 flex flex-col">
                        {/* Header with icon */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex-shrink-0 shadow-sm">
                            <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                              {workout.wokroutName || "Running"}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                              {workout.workoutDate}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Distance</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 ml-4 tracking-tight">
                              {formatDistance(workout.workoutDistanceInMeters)} <span className="text-base font-semibold text-gray-500 dark:text-gray-400">km</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 ml-4 tracking-tight">
                              {formatDuration(workout.workoutDurationInSeconds)}
                            </span>
                          </div>
                          {(workout.workoutAvgPaceInMinKm && workout.workoutAvgPaceInMinKm > 0 && !isNaN(workout.workoutAvgPaceInMinKm)) && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Pace</span>
                              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 ml-4 tracking-tight">
                                {formatPace(workout.workoutAvgPaceInMinKm)} <span className="text-base font-semibold text-gray-500 dark:text-gray-400">/km</span>
                              </span>
                            </div>
                          )}
                          {(workout.workoutAvgHR && workout.workoutAvgHR > 0 && !isNaN(workout.workoutAvgHR)) && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg HR</span>
                              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 ml-4 tracking-tight">
                                {formatHR(workout.workoutAvgHR)} <span className="text-base font-semibold text-gray-500 dark:text-gray-400">bpm</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Map (full height) */}
                      {coords.length > 0 && (
                        <div className="w-full lg:w-1/2 h-64 lg:h-[400px] min-h-[250px]">
                          <WorkoutMap coordinates={coords} className="h-full w-full" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* No Workouts Message */}
          {summary && summary.allWorkouts && summary.allWorkouts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No workouts found for the selected date range.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TrainingSummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <TrainingSummaryPageContent />
    </Suspense>
  );
}

