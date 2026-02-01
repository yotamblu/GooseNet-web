/**
 * Workout Detail Page
 * Displays detailed analysis of a running workout
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";
import { useAuth } from "../../context/AuthContext";
import ZoomableWorkoutMap from "../components/ZoomableWorkoutMap";
import WorkoutChart from "../components/WorkoutChart";
import LapBarChart from "../components/LapBarChart";

interface WorkoutLap {
  lapDistanceInKilometers: number;
  lapDurationInSeconds: number;
  lapPaceInMinKm: number;
  avgHeartRate: number;
}

interface DataSample {
  timerDurationInSeconds: number;
  heartRate: number;
  speedMetersPerSecond: number;
  elevationInMeters: number;
}

interface WorkoutDataResponse {
  workoutLaps: WorkoutLap[];
  dataSamples: DataSample[];
}

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

export default function WorkoutDetailPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName");
  const workoutId = searchParams.get("workoutId");
  
  // Determine if user is a coach
  const isCoach = user?.role?.toLowerCase() === "coach";
  
  // Build back URL - include athlete query param for coaches
  // This needs to be calculated early so it's available in error states
  const backUrl = isCoach && userName 
    ? `/activities?athlete=${encodeURIComponent(userName)}`
    : "/activities";

  const [workoutData, setWorkoutData] = useState<WorkoutDataResponse | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [profilePicData, setProfilePicData] = useState<string>("");
  const [selectedLapIndex, setSelectedLapIndex] = useState<number | null>(null);
  const lapRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Handle lap selection with scroll
  const handleLapSelection = (index: number) => {
    setSelectedLapIndex(index);
    // Scroll to the corresponding table row
    if (lapRowRefs.current[index]) {
      setTimeout(() => {
        lapRowRefs.current[index]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100); // Small delay to ensure DOM is updated
    }
  };

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!userName || !workoutId) {
        setError("Missing userName or workoutId");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch workout summary data (laps and samples)
        const dataResponse = await apiService.getWorkoutData<WorkoutDataResponse>(
          workoutId,
          userName
        );

        if (dataResponse.data) {
          setWorkoutData(dataResponse.data);
        }

        // Try to fetch workout summary to get basic info (name, date, coordinates, profile pic)
        let summaryProfilePic = "";
        try {
          const summaryResponse = await apiService.getWorkout<WorkoutSummary>(
            userName,
            workoutId
          );

          if (summaryResponse.data) {
            const summary = summaryResponse.data as any;
            summaryProfilePic = summary.profilePicData || summary.ProfilePicData || summary.profilePicString || summary.ProfilePicString || "";
            
            setWorkoutSummary({
              workoutName: summary.workoutName || summary.WorkoutName || "Running",
              workoutId: typeof (summary.workoutId || summary.WorkoutId) === 'string' 
                ? parseInt(summary.workoutId || summary.WorkoutId, 10) 
                : (Number(summary.workoutId || summary.WorkoutId) || 0),
              workoutDurationInSeconds: Number(summary.workoutDurationInSeconds || summary.WorkoutDurationInSeconds) || 0,
              workoutDistanceInMeters: Number(summary.workoutDistanceInMeters || summary.WorkoutDistanceInMeters) || 0,
              workoutAvgHR: Number(summary.workoutAvgHR || summary.WorkoutAvgHR) || 0,
              workoutAvgPaceInMinKm: Number(summary.workoutAvgPaceInMinKm || summary.WorkoutAvgPaceInMinKm) || 0,
              workoutCoordsJsonStr: summary.workoutCoordsJsonStr || summary.WorkoutCoordsJsonStr || "",
              workoutDate: summary.workoutDate || summary.WorkoutDate || "",
              profilePicData: summaryProfilePic,
              athleteName: summary.athleteName || summary.AthleteName || userName || "",
            });

            // Set profile pic if present in summary
            if (summaryProfilePic) {
              setProfilePicData(summaryProfilePic);
            }

            // Parse coordinates
            try {
              if (summary.workoutCoordsJsonStr || summary.WorkoutCoordsJsonStr) {
                const coordsStr = summary.workoutCoordsJsonStr || summary.WorkoutCoordsJsonStr;
                const parsed = JSON.parse(coordsStr);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setCoords(parsed);
                }
              }
            } catch (e) {
              console.error("Failed to parse coordinates:", e);
            }
          }
        } catch (summaryErr) {
          console.warn("Failed to fetch workout summary, using data from samples only:", summaryErr);
          // Continue without summary data
        }

        // Fetch profile picture if not present in workout summary
        if (!summaryProfilePic && userName) {
          try {
            const profilePicResponse = await apiService.getProfilePic(userName);
            if (profilePicResponse.data && typeof profilePicResponse.data === 'string') {
              setProfilePicData(profilePicResponse.data);
            }
          } catch (profilePicErr) {
            console.warn("Failed to fetch profile picture:", profilePicErr);
            // Continue without profile picture
          }
        }
        
      } catch (err) {
        console.error("Failed to fetch workout data:", err);
        setError(err instanceof Error ? err.message : "Failed to load workout data");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [userName, workoutId]);

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

  // Convert speed (m/s) to pace (min/km)
  const speedToPace = (speedMetersPerSecond: number): number => {
    if (!speedMetersPerSecond || speedMetersPerSecond <= 0) return 10; // Default to 10 min/km for stopped/very slow
    const speedKmPerHour = speedMetersPerSecond * 3.6;
    const paceMinPerKm = 60 / speedKmPerHour; // min/km
    // Cap pace at 10 min/km (very slow running/walking) to avoid huge numbers from near-zero speeds
    // This keeps the chart readable while still showing all data points
    return paceMinPerKm > 10 ? 10 : paceMinPerKm;
  };

  // Prepare chart data
  const heartRateData = workoutData?.dataSamples.map((s) => s.heartRate) || [];
  const paceData = workoutData?.dataSamples.map((s) => speedToPace(s.speedMetersPerSecond)) || [];
  const elevationData = workoutData?.dataSamples.map((s) => s.elevationInMeters) || [];
  const timeData = workoutData?.dataSamples.map((s) => s.timerDurationInSeconds) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workout data...</p>
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
                  Back to Activities
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                  >
                    Join GooseNet
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1 px-6 py-12 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error || "Failed to load workout data"}</p>
              {user ? (
                <Link
                  href={backUrl}
                  className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Back to Activities
                </Link>
              ) : (
                <Link
                  href="/"
                  className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Go to Home
                </Link>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate workout summary from data
  const totalDistance = workoutData.workoutLaps.reduce((sum, lap) => sum + lap.lapDistanceInKilometers, 0) * 1000;
  const totalDuration = workoutData.workoutLaps.reduce((sum, lap) => sum + lap.lapDurationInSeconds, 0);
  const avgPace = totalDistance > 0 ? (totalDuration / 60) / (totalDistance / 1000) : 0;
  const avgHR = workoutData.dataSamples.length > 0
    ? workoutData.dataSamples.reduce((sum, s) => sum + s.heartRate, 0) / workoutData.dataSamples.length
    : 0;

  // Use workout summary data if available, otherwise use calculated values
  const displayDistance = workoutSummary?.workoutDistanceInMeters || totalDistance;
  const displayDuration = workoutSummary?.workoutDurationInSeconds || totalDuration;
  const displayPace = workoutSummary?.workoutAvgPaceInMinKm || avgPace;
  const displayHR = workoutSummary?.workoutAvgHR || avgHR;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
            <Link href={backUrl} className="flex items-center gap-2">
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
                // Logged in users see "Back to Activities" button
                <Link
                  href={backUrl}
                  className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back to Activities
                </Link>
              ) : (
                // Non-logged in users see landing page nav buttons
                <>
                  <Link
                    href="/login"
                    className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                  >
                    Join GooseNet
                  </Link>
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
          {/* Header Section with Athlete Info */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              {profilePicData && (
                <img
                  src={profilePicData}
                  alt={userName || "Athlete"}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {workoutSummary?.workoutName || "Running Workout"}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  {userName || "Athlete"}
                </p>
                {workoutSummary?.workoutDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {workoutSummary.workoutDate}
                  </p>
                )}
              </div>
            </div>

            {/* Workout Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Distance</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatDistance(displayDistance)} <span className="text-base font-semibold text-gray-500 dark:text-gray-400">km</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Duration</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatDuration(displayDuration)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Pace</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatPace(displayPace)} <span className="text-base font-semibold text-gray-500 dark:text-gray-400">/km</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg HR</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatHR(displayHR)} <span className="text-base font-semibold text-gray-500 dark:text-gray-400">bpm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          {coords.length > 0 && (
            <div className="mb-8">
              <ZoomableWorkoutMap coordinates={coords} className="h-96 w-full" />
            </div>
          )}

          {/* Lap Bar Chart and Table */}
          <div className="space-y-6 mb-8">
            {/* Lap Bar Chart */}
            {workoutData && workoutData.workoutLaps.length > 0 && (
              <LapBarChart 
                laps={workoutData.workoutLaps} 
                selectedLapIndex={selectedLapIndex}
                onLapClick={handleLapSelection}
              />
            )}

            {/* Laps Table */}
            {workoutData && workoutData.workoutLaps.length > 0 && (
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 cursor-pointer"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  // If clicking on the container, title, or empty table area (not on a row), deselect
                  if (target === e.currentTarget || 
                      target.tagName === 'H2' || 
                      target.tagName === 'DIV' && target.classList.contains('overflow-x-auto') ||
                      target.tagName === 'TABLE' || 
                      target.tagName === 'THEAD' ||
                      target.tagName === 'TH') {
                    setSelectedLapIndex(null);
                  }
                }}
              >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Laps</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Lap</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Distance</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Pace</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Avg HR</th>
                  </tr>
                </thead>
                <tbody>
                  {workoutData.workoutLaps.map((lap, index) => {
                    const isSelected = selectedLapIndex === index;
                    return (
                    <tr
                      key={index}
                      ref={(el) => {
                        lapRowRefs.current[index] = el;
                      }}
                      className={`border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent container click
                        handleLapSelection(index);
                      }}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                        {lap.lapDistanceInKilometers.toFixed(2)} km
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                        {formatDuration(lap.lapDurationInSeconds)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                        {formatPace(lap.lapPaceInMinKm)} /km
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                        {formatHR(lap.avgHeartRate)} bpm
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="space-y-6 mb-8">
            <WorkoutChart
              data={heartRateData}
              title="Heart Rate"
              unit="bpm"
              color="#ef4444"
              minValue={Math.min(...heartRateData, 0)}
              maxValue={Math.max(...heartRateData, 200)}
              timeData={timeData}
            />
            <WorkoutChart
              data={paceData}
              title="Pace"
              unit="min/km"
              color="#3b82f6"
              minValue={0}
              maxValue={Math.max(...paceData, 10)}
              timeData={timeData}
              invertYAxis={true}
              formatValue={(value) => {
                // Format pace as mm:ss
                const minutes = Math.floor(value);
                const seconds = Math.round((value - minutes) * 60);
                return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
              }}
            />
            <WorkoutChart
              data={elevationData}
              title="Elevation"
              unit="m"
              color="#10b981"
              minValue={Math.min(...elevationData, 0)}
              maxValue={Math.max(...elevationData, 1000)}
              timeData={timeData}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

