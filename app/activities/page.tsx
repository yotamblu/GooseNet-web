/**
 * Activities Page
 * Displays athlete workouts with date-based fetching and feed pagination
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";
import WorkoutMap from "../components/WorkoutMap";

interface WorkoutSummary {
  workoutName: string;
  workoutId: number;
  workoutDurationInSeconds: number;
  workoutDistanceInMeters: number;
  workoutAvgHR: number;
  workoutAvgPaceInMinKm: number;
  workoutCoordsJsonStr: string;
  workoutDate: string;
  profilePicData: string;
  athleteName: string;
}

interface WorkoutDrill {
  drillName: string;
  drillSets: number;
  drillReps: number;
}

interface WorkoutReview {
  athleteName: string;
  reviewContent: string;
  difficultyLevel: number;
}

interface StrengthWorkout {
  coachName: string;
  workoutName: string;
  workoutDescription: string;
  workoutDate: string;
  workoutDrills: WorkoutDrill[];
  athleteNames: string[];
  workoutReviews: Record<string, WorkoutReview>;
  workoutId: string;
}

interface WorkoutFeedResponse {
  runningWorkouts: WorkoutSummary[];
  strengthWorkouts: StrengthWorkout[];
  runningNextCursor: string | null;
  strengthNextCursor: string | null;
}

export default function ActivitiesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"feed" | "date">("feed");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateInputValue, setDateInputValue] = useState<string>(""); // For HTML date input
  const [athleteName, setAthleteName] = useState<string>("");
  const [runningWorkouts, setRunningWorkouts] = useState<WorkoutSummary[]>([]);
  const [strengthWorkouts, setStrengthWorkouts] = useState<StrengthWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningCursor, setRunningCursor] = useState<string | null>(null);
  const [strengthCursor, setStrengthCursor] = useState<string | null>(null);
  const [hasMoreRunning, setHasMoreRunning] = useState(false);
  const [hasMoreStrength, setHasMoreStrength] = useState(false);

  // Require authentication
  useRequireAuth();

  // Get athlete name from URL params or use current user
  useEffect(() => {
    const athleteParam = searchParams.get("athlete");
    if (athleteParam) {
      setAthleteName(athleteParam);
    } else if (user) {
      setAthleteName(user.userName);
    }
  }, [searchParams, user]);

  // Format date to M/d/yyyy (no leading zeros)
  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Parse workout date string (M/d/yyyy format) to Date object
  const parseWorkoutDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  // Convert date string (YYYY-MM-DD) to M/d/yyyy format
  const parseDateInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return formatDate(date);
  };

  // Fetch workouts by date
  const fetchWorkoutsByDate = async (date: string) => {
    if (!user?.apiKey || !athleteName) {
      setError("Missing required information");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWorkoutSummary<{
        runningWorkouts: WorkoutSummary[];
        strengthWorkouts: StrengthWorkout[];
      }>(athleteName, user.apiKey, date);

      console.log("Workout summary response:", response.data);

      if (response.data) {
        // Ensure we have valid arrays and parse numeric values
        const parseWorkout = (w: any): WorkoutSummary => ({
          workoutName: w.workoutName || w.WorkoutName || "Running",
          workoutId: typeof (w.workoutId || w.WorkoutId) === 'string' ? parseInt(w.workoutId || w.WorkoutId, 10) : (Number(w.workoutId || w.WorkoutId) || 0),
          workoutDurationInSeconds: Number(w.workoutDurationInSeconds || w.WorkoutDurationInSeconds) || 0,
          workoutDistanceInMeters: Number(w.workoutDistanceInMeters || w.WorkoutDistanceInMeters) || 0,
          workoutAvgHR: Number(w.workoutAvgHR || w.WorkoutAvgHR) || 0,
          workoutAvgPaceInMinKm: Number(w.workoutAvgPaceInMinKm || w.WorkoutAvgPaceInMinKm) || 0,
          workoutCoordsJsonStr: w.workoutCoordsJsonStr || w.WorkoutCoordsJsonStr || "",
          workoutDate: w.workoutDate || w.WorkoutDate || "",
          profilePicData: w.profilePicData || w.ProfilePicData || "",
          athleteName: w.athleteName || w.AthleteName || "",
        });
        
        const running = Array.isArray(response.data.runningWorkouts) 
          ? response.data.runningWorkouts.map(parseWorkout)
          : [];
        const strength = Array.isArray(response.data.strengthWorkouts) ? response.data.strengthWorkouts : [];
        setRunningWorkouts(running);
        setStrengthWorkouts(strength);
      }
    } catch (err) {
      console.error("Failed to fetch workouts by date:", err);
      setError(err instanceof Error ? err.message : "Failed to load workouts");
      setRunningWorkouts([]);
      setStrengthWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workout feed
  const fetchWorkoutFeed = async (loadMore = false) => {
    if (!user?.apiKey || !athleteName) {
      setError("Missing required information");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getWorkoutFeed<WorkoutFeedResponse>(
        user.apiKey,
        athleteName,
        loadMore ? runningCursor : null,
        loadMore ? strengthCursor : null
      );

      console.log("Workout feed response:", response.data);
      if (response.data?.runningWorkouts?.[0]) {
        console.log("Sample feed workout fields:", Object.keys(response.data.runningWorkouts[0]));
        console.log("Sample feed workout profile pic:", {
          profilePicData: response.data.runningWorkouts[0].profilePicData,
          ProfilePicData: response.data.runningWorkouts[0].ProfilePicData,
          profilePicString: response.data.runningWorkouts[0].profilePicString,
          ProfilePicString: response.data.runningWorkouts[0].ProfilePicString,
        });
      }

      if (response.data) {
        // Parse and normalize workout data to prevent NaN
        // Note: Feed endpoint may not include ProfilePicData, so we'll need to fetch it separately if missing
        const parseWorkout = (w: any): WorkoutSummary => ({
          workoutName: w.workoutName || w.WorkoutName || "Running",
          workoutId: typeof (w.workoutId || w.WorkoutId) === 'string' ? parseInt(w.workoutId || w.WorkoutId, 10) : (Number(w.workoutId || w.WorkoutId) || 0),
          workoutDurationInSeconds: Number(w.workoutDurationInSeconds || w.WorkoutDurationInSeconds) || 0,
          workoutDistanceInMeters: Number(w.workoutDistanceInMeters || w.WorkoutDistanceInMeters) || 0,
          workoutAvgHR: Number(w.workoutAvgHR || w.WorkoutAvgHR) || 0,
          workoutAvgPaceInMinKm: Number(w.workoutAvgPaceInMinKm || w.WorkoutAvgPaceInMinKm) || 0,
          workoutCoordsJsonStr: w.workoutCoordsJsonStr || w.WorkoutCoordsJsonStr || "",
          workoutDate: w.workoutDate || w.WorkoutDate || "",
          // Try multiple field names for profile pic
          profilePicData: w.profilePicData || w.ProfilePicData || w.profilePicString || w.ProfilePicString || "",
          athleteName: w.athleteName || w.AthleteName || athleteName || "",
        });

        const running = Array.isArray(response.data.runningWorkouts) 
          ? response.data.runningWorkouts.map((w: any) => {
              const parsed = parseWorkout(w);
              // If profile pic is missing in feed response, try to use current user's profile pic if it's their workout
              if (!parsed.profilePicData && parsed.athleteName === athleteName && user?.profilePicString) {
                parsed.profilePicData = user.profilePicString;
              }
              return parsed;
            })
          : [];
        const strength = Array.isArray(response.data.strengthWorkouts) 
          ? response.data.strengthWorkouts 
          : [];

        if (loadMore) {
          setRunningWorkouts((prev) => [...prev, ...running]);
          setStrengthWorkouts((prev) => [...prev, ...strength]);
        } else {
          setRunningWorkouts(running);
          setStrengthWorkouts(strength);
        }

        setRunningCursor(response.data.runningNextCursor);
        setStrengthCursor(response.data.strengthNextCursor);
        setHasMoreRunning(response.data.runningNextCursor !== null);
        setHasMoreStrength(response.data.strengthNextCursor !== null);
      }
    } catch (err) {
      console.error("Failed to fetch workout feed:", err);
      setError(err instanceof Error ? err.message : "Failed to load workouts");
      if (!loadMore) {
        setRunningWorkouts([]);
        setStrengthWorkouts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      fetchWorkoutsByDate(selectedDate);
    }
  };

  // Load feed on mount or when switching to feed mode
  useEffect(() => {
    if (viewMode === "feed" && user?.apiKey && athleteName && !loading) {
      fetchWorkoutFeed(false);
    }
  }, [viewMode, user?.apiKey, athleteName]);

  const handleLogout = async () => {
    await logout();
  };

  // Format duration from seconds to readable format
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Format distance from meters to km
  const formatDistance = (meters: number | null | undefined): string => {
    if (!meters || isNaN(meters) || meters <= 0) return "0.00";
    return (meters / 1000).toFixed(2);
  };

  // Format pace from min/km
  const formatPace = (pace: number | null | undefined): string => {
    if (!pace || isNaN(pace) || pace <= 0) return "0:00";
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Format heart rate
  const formatHR = (hr: number | null | undefined): string => {
    if (!hr || isNaN(hr) || hr <= 0) return "N/A";
    return `${Math.round(hr)}`;
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
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
            {user?.profilePicString && (
              <img
                src={getProfilePicSrc(user.profilePicString)}
                alt={user.userName}
                referrerPolicy="no-referrer"
                className="hidden md:block h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-12 sm:px-6 sm:py-24 overflow-hidden">
        {/* Glowing purple/blue background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 dark:from-purple-500/15 dark:via-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/20 dark:bg-pink-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/25 dark:bg-blue-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
                Activities
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                {athleteName ? `Viewing workouts for ${athleteName}` : "View your workouts"}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => {
                setViewMode("feed");
                setRunningWorkouts([]);
                setStrengthWorkouts([]);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === "feed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => {
                setViewMode("date");
                setRunningWorkouts([]);
                setStrengthWorkouts([]);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === "date"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              By Date
            </button>
          </div>

          {/* Date Picker (for date mode) */}
          {viewMode === "date" && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6">
              <form onSubmit={handleDateSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 w-full">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={dateInputValue}
                    onChange={(e) => {
                      setDateInputValue(e.target.value);
                      const formatted = parseDateInput(e.target.value);
                      setSelectedDate(formatted);
                    }}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  {selectedDate && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: {selectedDate}
                    </p>
                  )}
                </div>
                <div className="flex items-start">
                  <button
                    type="submit"
                    disabled={loading || !selectedDate}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap mt-[1.625rem]"
                  >
                    {loading ? "Loading..." : "Fetch Workouts"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && viewMode === "feed" && runningWorkouts.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workouts...</p>
            </div>
          )}

          {/* Workouts Display */}
          {!loading || runningWorkouts.length > 0 || strengthWorkouts.length > 0 ? (
            <div className="space-y-6">
              {/* Combined Workouts - Chronologically Ordered */}
              {(() => {
                // Combine and sort workouts
                const combinedWorkouts = [
                  ...runningWorkouts.map(w => ({ type: 'running' as const, workout: w, date: parseWorkoutDate(w.workoutDate) })),
                  ...strengthWorkouts.map(w => ({ type: 'strength' as const, workout: w, date: parseWorkoutDate(w.workoutDate) }))
                ].sort((a, b) => {
                  // Sort by date (newest first)
                  const dateDiff = b.date.getTime() - a.date.getTime();
                  if (dateDiff !== 0) return dateDiff;
                  // If dates are equal, running workouts come first
                  if (a.type === 'running' && b.type === 'strength') return -1;
                  if (a.type === 'strength' && b.type === 'running') return 1;
                  return 0;
                });

                return (
                  <div className="space-y-6">
                    {combinedWorkouts.map((item, index) => {
                      if (item.type === 'running') {
                        const workout = item.workout as WorkoutSummary;
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
                          href={`/workout?userName=${encodeURIComponent(workout.athleteName)}&workoutId=${workout.workoutId}`}
                          key={workout.workoutId || `running-${index}`}
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
                                    {workout.workoutName || "Running"}
                                  </h3>
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                                    {workout.workoutDate}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Stats: Labels with values right next to them */}
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
                      } else {
                        const workout = item.workout as StrengthWorkout;
                        const review = workout.workoutReviews && workout.athleteNames && workout.athleteNames.length > 0
                          ? workout.workoutReviews[workout.athleteNames[0]]
                          : null;

                        return (
                          <div
                            key={workout.workoutId || `strength-${index}`}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
                          >
                          {/* Header with icon */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {workout.workoutName || "Strength Workout"}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {workout.workoutDate}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Workout Description */}
                          {workout.workoutDescription && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {workout.workoutDescription}
                            </p>
                          )}

                          {/* Drills */}
                          {workout.workoutDrills && workout.workoutDrills.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Drills:
                              </h4>
                              <div className="space-y-1">
                                {workout.workoutDrills.map((drill, drillIndex) => (
                                  <div key={drillIndex} className="text-sm text-gray-600 dark:text-gray-400">
                                    • {drill.drillName} - {drill.drillSets} sets × {drill.drillReps} reps
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Review */}
                          {review && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  Review
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Difficulty: {review.difficultyLevel}/10
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {review.reviewContent}
                              </p>
                            </div>
                          )}

                          {/* Coach Name */}
                          {workout.coachName && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                              Coach: {workout.coachName}
                            </p>
                          )}
                        </div>
                      );
                      }
                    })}
                  </div>
                );
              })()}

              {/* Empty State */}
              {!loading && runningWorkouts.length === 0 && strengthWorkouts.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    No workouts found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {viewMode === "date"
                      ? "Select a date to view workouts"
                      : "No workouts available yet"}
                  </p>
                </div>
              )}

              {/* Load More Button (Feed Mode) */}
              {viewMode === "feed" && (hasMoreRunning || hasMoreStrength) && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => fetchWorkoutFeed(true)}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

