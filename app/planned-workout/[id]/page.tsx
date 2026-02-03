/**
 * Planned Workout Detail Page
 * Displays detailed information about a planned running workout
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";
import { apiService } from "../../services/api";
import LapBarChart from "../../components/LapBarChart";

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

interface PlannedWorkoutResponse {
  worokutObject: {
    date: string;
    workoutName: string;
    description: string;
    intervals: WorkoutInterval[];
    coachName: string;
    athleteNames: string[];
    workoutId: string | null;
  };
  plannedWorkoutJson: string;
}

interface Lap {
  lapDistanceInKilometers: number;
  lapDurationInSeconds: number;
  lapPaceInMinKm: number;
  avgHeartRate: number;
}

export default function PlannedWorkoutDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const workoutId = params?.id as string;
  
  const [workoutData, setWorkoutData] = useState<PlannedWorkoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!workoutId) {
        setError("Missing workout ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getPlannedWorkoutById<PlannedWorkoutResponse>(workoutId);

        if (response.data) {
          setWorkoutData(response.data);
        } else {
          setError("Failed to load workout data");
        }
      } catch (err) {
        console.error("Failed to fetch planned workout:", err);
        setError(err instanceof Error ? err.message : "Failed to load workout");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [workoutId]);

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

    const processInterval = (interval: WorkoutInterval, repeatCount: number = 1) => {
      // If interval has nested steps, process them
      if (interval.steps && interval.steps.length > 0) {
        const actualRepeat = interval.repeatValue || 1;
        for (let i = 0; i < actualRepeat * repeatCount; i++) {
          interval.steps.forEach(step => processInterval(step, 1));
        }
      } else {
        // This is a leaf interval - convert to lap
        // Skip if it's a rest interval
        if (interval.intensity === "REST" || interval.intensity === "rest") {
          return;
        }

        const actualRepeat = (interval.repeatValue || 1) * repeatCount;
        
        for (let i = 0; i < actualRepeat; i++) {
          let lapDistance = 0;
          let lapDuration = 0;
          
          // Convert pace from m/s to min/km
          const avgSpeedMps = (interval.targetValueLow + interval.targetValueHigh) / 2;
          const lapPace = metersPerSecondToMinPerKm(avgSpeedMps);
          
          // Calculate distance and duration based on durationType
          if (interval.durationType === "DISTANCE" || interval.durationType === "distance") {
            // Distance in meters, convert to km
            lapDistance = interval.durationValue / 1000;
            // Calculate duration from distance and pace: time = distance * pace
            lapDuration = lapDistance * lapPace * 60; // pace in min/km, convert to seconds
          } else if (interval.durationType === "TIME" || interval.durationType === "time") {
            // Duration in seconds
            lapDuration = interval.durationValue;
            // Calculate distance from duration and pace: distance = time / (pace * 60)
            lapDistance = lapDuration / (lapPace * 60); // distance in km
          } else {
            // Default: assume time-based if durationType is null or unknown
            lapDuration = interval.durationValue || 60; // default 60 seconds
            lapDistance = lapDuration / (lapPace * 60);
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
        }
      }
    };

    // Process all intervals
    intervals.forEach(interval => processInterval(interval, 1));

    return laps;
  };

  // Build back URL
  const backUrl = user 
    ? (user.role?.toLowerCase() === "coach" && workoutData?.worokutObject.athleteNames?.[0]
        ? `/planned-workouts?athlete=${encodeURIComponent(workoutData.worokutObject.athleteNames[0])}`
        : "/planned-workouts")
    : "/";

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (error || !workoutData) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
            <Link href={user ? backUrl : "/"} className="flex items-center gap-2">
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
              {user ? (
                <Link
                  href={backUrl}
                  className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </Link>
              ) : (
                <>
                  <a
                    href="/login"
                    className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                  >
                    Join GooseNet
                  </a>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1 px-6 py-12 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error || "Failed to load workout"}</p>
              <Link
                href={backUrl}
                className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
              >
                Go Back
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const workout = workoutData.worokutObject;
  const laps = convertIntervalsToLaps(workout.intervals || []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href={user ? backUrl : "/"} className="flex items-center gap-2">
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
            {user ? (
              <>
                {user.profilePicString && (
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
                <Link
                  href={backUrl}
                  className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </Link>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  Join GooseNet
                </a>
              </>
            )}
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
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {workout.workoutName || "Planned Workout"}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                  {workout.date && (
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{workout.date}</span>
                    </div>
                  )}
                  {workout.coachName && (
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Coach: {workout.coachName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Workout Description */}
            {workout.description && (
              <p className="text-base text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {workout.description}
              </p>
            )}

            {/* Interval Text */}
            {workoutData.plannedWorkoutJson && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Workout Structure
                </h2>
                <p className="text-base font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  {workoutData.plannedWorkoutJson}
                </p>
              </div>
            )}
          </div>

          {/* Lap Bar Chart */}
          {laps.length > 0 && (
            <div className="mb-8">
              <LapBarChart laps={laps} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

