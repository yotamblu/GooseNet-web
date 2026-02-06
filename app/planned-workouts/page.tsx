/**
 * Planned Workouts Page
 * Displays planned workouts (running and strength) with date-based fetching and feed pagination
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
import LapBarChart from "../components/LapBarChart";

interface WorkoutInterval {
  stepOrder: number;
  repeatValue: number;
  type: string;
  steps: WorkoutInterval[] | null;
  description: string;
  durationType: string | null;
  durationValue: number;
  intensity: string;
  targetValueLow: number;
  targetValueHigh: number;
  repeatType: string | null;
}

interface PlannedRunningWorkout {
  date: string;
  workoutName: string;
  description: string;
  intervals: WorkoutInterval[];
  coachName: string;
  athleteNames: string[];
  workoutId: string;
}

interface WorkoutDrill {
  drillName: string;
  drillSets: number;
  drillReps: number;
}

interface PlannedStrengthWorkout {
  coachName: string;
  workoutName: string;
  workoutDescription: string;
  workoutDate: string;
  workoutDrills: WorkoutDrill[];
  athleteNames: string[];
  workoutReviews: Record<string, { athleteName: string; reviewContent: string; difficultyLevel: number }> | null;
  workoutId: string | null;
}

interface PlannedWorkoutFeedResponse {
  runningWorkouts: PlannedRunningWorkout[];
  strengthWorkouts: PlannedStrengthWorkout[];
  runningNextCursor: string | null;
  strengthNextCursor: string | null;
}

interface PlannedWorkoutByDateResponse {
  runningWorkouts: PlannedRunningWorkout[];
  strengthWorkouts: PlannedStrengthWorkout[];
}

interface Lap {
  lapDistanceInKilometers: number;
  lapDurationInSeconds: number;
  lapPaceInMinKm: number;
  avgHeartRate: number;
}

function PlannedWorkoutsPageContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"feed" | "date">("feed");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateInputValue, setDateInputValue] = useState<string>(""); // For HTML date input
  const [athleteName, setAthleteName] = useState<string>("");
  const [runningWorkouts, setRunningWorkouts] = useState<PlannedRunningWorkout[]>([]);
  const [strengthWorkouts, setStrengthWorkouts] = useState<PlannedStrengthWorkout[]>([]);
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

  // Fetch planned workouts by date
  const fetchPlannedWorkoutsByDate = async (date: string) => {
    if (!user?.apiKey || !athleteName) {
      setError("Missing required information");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPlannedWorkoutsByDate<PlannedWorkoutByDateResponse>(
        user.apiKey,
        athleteName,
        date
      );

      console.log("Planned workout by date response:", response.data);

      if (response.data) {
        const running = Array.isArray(response.data.runningWorkouts) 
          ? response.data.runningWorkouts
          : [];
        const strength = Array.isArray(response.data.strengthWorkouts) 
          ? response.data.strengthWorkouts
          : [];
        setRunningWorkouts(running);
        setStrengthWorkouts(strength);
      }
    } catch (err) {
      console.error("Failed to fetch planned workouts by date:", err);
      setError(err instanceof Error ? err.message : "Failed to load planned workouts");
      setRunningWorkouts([]);
      setStrengthWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch planned workout feed
  const fetchPlannedWorkoutFeed = async (loadMore = false) => {
    if (!user?.apiKey || !athleteName) {
      setError("Missing required information");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPlannedWorkoutFeed<PlannedWorkoutFeedResponse>(
        user.apiKey,
        athleteName,
        loadMore ? runningCursor : null,
        loadMore ? strengthCursor : null
      );

      console.log("Planned workout feed response:", response.data);

      if (response.data) {
        const running = Array.isArray(response.data.runningWorkouts) 
          ? response.data.runningWorkouts
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
      console.error("Failed to fetch planned workout feed:", err);
      setError(err instanceof Error ? err.message : "Failed to load planned workouts");
      if (!loadMore) {
        setRunningWorkouts([]);
        setStrengthWorkouts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Convert meters per second to min/km pace
  const metersPerSecondToMinPerKm = (mps: number): number => {
    if (!mps || mps <= 0) return 10; // Default slow pace
    const kmPerHour = mps * 3.6;
    const minPerKm = 60 / kmPerHour;
    return minPerKm;
  };

  // Convert intervals to lap data for the chart
  const convertIntervalsToLaps = (intervals: WorkoutInterval[]): Lap[] => {
    const laps: Lap[] = [];

    const processStep = (step: WorkoutInterval) => {
      const isRest = step.intensity === "REST" || step.intensity === "rest";
      
      let lapDistance = 0;
      let lapDuration = 0;
      let lapPace = 0;
      
      // For rest intervals, use a consistent slow pace (10 min/km) so they all appear at the same height
      if (isRest) {
        lapPace = 10; // Consistent slow pace for all rest intervals
        
        // Calculate distance and duration based on durationType
        if (step.durationType === "DISTANCE" || step.durationType === "distance") {
          // Distance in meters, convert to km
          lapDistance = step.durationValue / 1000;
          // Calculate duration from distance and pace: time = distance * pace
          lapDuration = lapDistance * lapPace * 60; // pace in min/km, convert to seconds
        } else if (step.durationType === "TIME" || step.durationType === "time") {
          // Duration in seconds
          lapDuration = step.durationValue;
          // Calculate distance from duration and pace: distance = time / (pace * 60)
          lapDistance = lapDuration / (lapPace * 60); // distance in km
        } else {
          // Skip if no duration type
          return;
        }
      } else {
        // For running intervals, use actual pace data
        // Skip if no valid pace data
        if (!step.targetValueLow && !step.targetValueHigh) {
          return;
        }

        // Convert pace from m/s to min/km
        const avgSpeedMps = (step.targetValueLow + step.targetValueHigh) / 2;
        if (!avgSpeedMps || avgSpeedMps <= 0) {
          return;
        }
        lapPace = metersPerSecondToMinPerKm(avgSpeedMps);
        
        // Calculate distance and duration based on durationType
        if (step.durationType === "DISTANCE" || step.durationType === "distance") {
          // Distance in meters, convert to km
          lapDistance = step.durationValue / 1000;
          // Calculate duration from distance and pace: time = distance * pace
          lapDuration = lapDistance * lapPace * 60; // pace in min/km, convert to seconds
        } else if (step.durationType === "TIME" || step.durationType === "time") {
          // Duration in seconds
          lapDuration = step.durationValue;
          // Calculate distance from duration and pace: distance = time / (pace * 60)
          lapDistance = lapDuration / (lapPace * 60); // distance in km
        } else {
          // Skip if no duration type
          return;
        }
      }
      
      // Only add lap if it has valid data
      if (lapDistance > 0 && lapDuration > 0 && lapPace > 0) {
        laps.push({
          lapDistanceInKilometers: lapDistance,
          lapDurationInSeconds: lapDuration,
          lapPaceInMinKm: lapPace,
          avgHeartRate: 0, // Not available in planned workouts
        });
      }
    };

    const processInterval = (interval: WorkoutInterval) => {
      // If interval has nested steps (WorkoutRepeatStep)
      if (interval.steps && interval.steps.length > 0) {
        const repeatCount = interval.repeatValue || 1;
        // Repeat the entire block of steps
        for (let i = 0; i < repeatCount; i++) {
          // Process each step in the block
          interval.steps.forEach(step => {
            // If step has nested steps, process recursively
            if (step.steps && step.steps.length > 0) {
              processInterval(step);
            } else {
              // This is a leaf step - process it
              processStep(step);
            }
          });
        }
      } else {
        // This is a leaf interval without nested steps - process it directly
        processStep(interval);
      }
    };

    // Process all top-level intervals
    intervals.forEach(interval => processInterval(interval));

    return laps;
  };

  // Handle date selection
  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      fetchPlannedWorkoutsByDate(selectedDate);
    }
  };

  // Load feed on mount or when switching to feed mode
  useEffect(() => {
    if (viewMode === "feed" && user?.apiKey && athleteName && !loading) {
      fetchPlannedWorkoutFeed(false);
    }
  }, [viewMode, user?.apiKey, athleteName]);

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

  // Check if user is a coach and no athlete parameter is provided
  const athleteParam = searchParams.get("athlete");
  if (user && user.role?.toLowerCase() === "coach" && !athleteParam) {
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
            Please select an athlete to view their planned workouts.
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
                Planned Workouts
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                {athleteName ? `Viewing planned workouts for ${athleteName}` : "View your planned workouts"}
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
          {loading && viewMode === "feed" && runningWorkouts.length === 0 && strengthWorkouts.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading planned workouts...</p>
            </div>
          )}

          {/* Workouts Display */}
          {!loading || runningWorkouts.length > 0 || strengthWorkouts.length > 0 ? (
            <div className="space-y-6">
              {/* Combined Workouts - Chronologically Ordered */}
              {(() => {
                // Combine and sort workouts
                const combinedWorkouts = [
                  ...runningWorkouts.map(w => ({ type: 'running' as const, workout: w, date: parseWorkoutDate(w.date) })),
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
                        const workout = item.workout as PlannedRunningWorkout;
                        const laps = convertIntervalsToLaps(workout.intervals || []);
                        const workoutIdStr = workout.workoutId ? String(workout.workoutId) : null;
                        
                        return (
                          <Link
                            href={workoutIdStr ? `/planned-workout/${workoutIdStr}` : '#'}
                            key={workout.workoutId || `running-${index}`}
                            onClick={(e) => {
                              if (!workoutIdStr) {
                                e.preventDefault();
                              }
                            }}
                            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden p-6 block ${workoutIdStr ? 'hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex-shrink-0 shadow-sm">
                                <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                  {workout.workoutName || "Running Workout"}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                                  {workout.date}
                                </p>
                              </div>
                            </div>
                            {workout.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {workout.description}
                              </p>
                            )}
                            
                            {/* Lap Bar Chart */}
                            {laps.length > 0 && (
                              <div className="mb-4">
                                <LapBarChart 
                                  laps={laps} 
                                  className="border-0 shadow-none p-0"
                                />
                              </div>
                            )}
                            
                            {workout.coachName && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                                Coach: {workout.coachName}
                              </p>
                            )}
                          </Link>
                        );
                      } else {
                        const workout = item.workout as PlannedStrengthWorkout;
                        const review = workout.workoutReviews && workout.athleteNames && workout.athleteNames.length > 0
                          ? workout.workoutReviews[workout.athleteNames[0]]
                          : null;

                        // Convert workoutId to string if it exists, handle null/undefined
                        const workoutIdStr = workout.workoutId ? String(workout.workoutId) : null;

                        return (
                          <Link
                            href={workoutIdStr ? `/strength-workout/${workoutIdStr}` : '#'}
                            key={workoutIdStr || `strength-${index}`}
                            onClick={(e) => {
                              if (!workoutIdStr) {
                                e.preventDefault();
                              }
                            }}
                            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden p-6 block ${workoutIdStr ? 'hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                          >
                            {/* Header with icon */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 flex-shrink-0 shadow-sm">
                                  <svg className="h-7 w-7 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                    {workout.workoutName || "Strength Workout"}
                                  </h3>
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
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
                          </Link>
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
                    No planned workouts found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {viewMode === "date"
                      ? "Select a date to view planned workouts"
                      : "No planned workouts available yet"}
                  </p>
                </div>
              )}

              {/* Load More Button (Feed Mode) */}
              {viewMode === "feed" && (hasMoreRunning || hasMoreStrength) && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => fetchPlannedWorkoutFeed(true)}
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

export default function PlannedWorkoutsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PlannedWorkoutsPageContent />
    </Suspense>
  );
}

