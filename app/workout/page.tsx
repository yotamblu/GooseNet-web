/**
 * Workout Detail Page
 * Displays detailed analysis of a running workout.
 *
 * All data fetching, calculations, refs and state management are preserved
 * from the previous implementation. Only the presentation layer (AppShell,
 * hero, glassy cards, tabs, stagger animations) is rebuilt on top of the new
 * design system.
 */

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { apiService } from "../services/api";
import { useAuth } from "../../context/AuthContext";
import ZoomableWorkoutMap from "../components/ZoomableWorkoutMap";
import WorkoutChart from "../components/WorkoutChart";
import LapBarChart from "../components/LapBarChart";
import {
  AppShell,
  Button,
  Card,
  Badge,
  StatTile,
  Tabs,
  SectionHeading,
  Spinner,
  Skeleton,
  fadeUp,
  stagger,
} from "../components/ui";

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

type DetailTab = "overview" | "splits" | "map" | "analysis";

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatDistance(meters: number | null | undefined): string {
  if (!meters || isNaN(meters) || meters <= 0) return "0.00";
  return (meters / 1000).toFixed(2);
}

function formatPace(pace: number | null | undefined): string {
  if (!pace || isNaN(pace) || pace <= 0) return "0:00";
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatHR(hr: number | null | undefined): string {
  if (!hr || isNaN(hr) || hr <= 0) return "N/A";
  return `${Math.round(hr)}`;
}

function speedToPace(speedMetersPerSecond: number): number {
  if (!speedMetersPerSecond || speedMetersPerSecond <= 0) return 10;
  const speedKmPerHour = speedMetersPerSecond * 3.6;
  const paceMinPerKm = 60 / speedKmPerHour;
  return paceMinPerKm > 10 ? 10 : paceMinPerKm;
}

function WorkoutDetailPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const userName = searchParams.get("userName");
  const workoutId = searchParams.get("workoutId");
  const reduce = useReducedMotion();

  const isCoach = user?.role?.toLowerCase() === "coach";
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
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const lapRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const handleLapSelection = (index: number | null) => {
    setSelectedLapIndex(index);
    if (index !== null && lapRowRefs.current[index]) {
      setTimeout(() => {
        lapRowRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
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

        const dataResponse = await apiService.getWorkoutData<WorkoutDataResponse>(
          workoutId,
          userName
        );

        if (dataResponse.data) {
          setWorkoutData(dataResponse.data);
        }

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
              workoutId: typeof (summary.workoutId || summary.WorkoutId) === "string"
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

            if (summaryProfilePic) {
              setProfilePicData(summaryProfilePic);
            }

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
        }

        if (!summaryProfilePic && userName) {
          try {
            const profilePicResponse = await apiService.getProfilePic(userName);
            if (profilePicResponse.data && typeof profilePicResponse.data === "string") {
              setProfilePicData(profilePicResponse.data);
            }
          } catch (profilePicErr) {
            console.warn("Failed to fetch profile picture:", profilePicErr);
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

  // Chart data
  const { heartRateData, paceData, elevationData, timeData } = useMemo(() => {
    return {
      heartRateData: workoutData?.dataSamples.map((s) => s.heartRate) || [],
      paceData: workoutData?.dataSamples.map((s) => speedToPace(s.speedMetersPerSecond)) || [],
      elevationData: workoutData?.dataSamples.map((s) => s.elevationInMeters) || [],
      timeData: workoutData?.dataSamples.map((s) => s.timerDurationInSeconds) || [],
    };
  }, [workoutData]);

  if (loading) {
    return (
      <AppShell hidePageHeader>
        <div className="space-y-6 py-6">
          <div className="flex items-center gap-4">
            <Skeleton circle w={64} h={64} />
            <div className="flex-1 space-y-2">
              <Skeleton h={28} w="40%" />
              <Skeleton h={14} w="25%" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} h={96} className="rounded-2xl" />
            ))}
          </div>
          <Skeleton h={384} className="rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (error || !workoutData) {
    return (
      <AppShell hidePageHeader>
        <div className="py-16 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            {error || "Failed to load workout data"}
          </p>
          <div className="mt-4">
            <Link href={user ? backUrl : "/"}>
              <Button variant="secondary">
                {user ? "Back to activities" : "Go home"}
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Aggregate stats from data if summary unavailable
  const totalDistance = workoutData.workoutLaps.reduce((sum, lap) => sum + lap.lapDistanceInKilometers, 0) * 1000;
  const totalDuration = workoutData.workoutLaps.reduce((sum, lap) => sum + lap.lapDurationInSeconds, 0);
  const avgPace = totalDistance > 0 ? (totalDuration / 60) / (totalDistance / 1000) : 0;
  const avgHR = workoutData.dataSamples.length > 0
    ? workoutData.dataSamples.reduce((sum, s) => sum + s.heartRate, 0) / workoutData.dataSamples.length
    : 0;

  const displayDistance = workoutSummary?.workoutDistanceInMeters || totalDistance;
  const displayDuration = workoutSummary?.workoutDurationInSeconds || totalDuration;
  const displayPace = workoutSummary?.workoutAvgPaceInMinKm || avgPace;
  const displayHR = workoutSummary?.workoutAvgHR || avgHR;

  const hasMap = coords.length > 0;
  const hasLaps = workoutData.workoutLaps.length > 0;
  const hasCharts = heartRateData.length > 0 || paceData.length > 0 || elevationData.length > 0;

  const tabs = [
    { value: "overview" as const, label: "Overview" },
    ...(hasLaps ? [{ value: "splits" as const, label: "Splits" }] : []),
    ...(hasMap ? [{ value: "map" as const, label: "Map" }] : []),
    ...(hasCharts ? [{ value: "analysis" as const, label: "Analysis" }] : []),
  ];

  return (
    <AppShell hidePageHeader maxWidth="xl">
      {/* Hero header */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <Card variant="glass" padding="lg" className="overflow-hidden">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              {profilePicData && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePicData}
                  alt={userName || "Athlete"}
                  referrerPolicy="no-referrer"
                  className="relative h-14 w-14 rounded-full border-2 border-white/80 dark:border-gray-900 object-cover shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="brand" dot>Running</Badge>
                  {workoutSummary?.workoutDate && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {workoutSummary.workoutDate}
                    </span>
                  )}
                </div>
                <h1 className="display-heading text-3xl font-bold tracking-tight text-gradient-brand sm:text-4xl">
                  {workoutSummary?.workoutName || "Running Workout"}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {userName || "Athlete"}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Link href={backUrl}>
                <Button variant="secondary" size="sm">
                  Back to activities
                </Button>
              </Link>
            </div>
          </div>

          {/* Primary metrics — render only tiles we actually have data for */}
          {(() => {
            const hasPace = displayPace > 0;
            const hasHR = displayHR > 0;
            const tileCount = 2 + (hasPace ? 1 : 0) + (hasHR ? 1 : 0);
            const gridCols =
              tileCount === 2
                ? "sm:grid-cols-2"
                : tileCount === 3
                ? "sm:grid-cols-3"
                : "sm:grid-cols-4";
            return (
              <div className={`mt-6 grid grid-cols-2 gap-3 ${gridCols}`}>
                <StatTile
                  label="Distance"
                  value={Number(formatDistance(displayDistance))}
                  decimals={2}
                  unit="km"
                  accent="brand"
                />
                <StatTile
                  label="Duration"
                  value={formatDuration(displayDuration)}
                  accent="purple"
                />
                {hasPace && (
                  <StatTile
                    label="Avg pace"
                    value={`${formatPace(displayPace)}`}
                    unit="/km"
                    accent="teal"
                  />
                )}
                {hasHR && (
                  <StatTile
                    label="Avg HR"
                    value={Math.round(displayHR)}
                    unit="bpm"
                    accent="rose"
                  />
                )}
              </div>
            );
          })()}
        </Card>
      </motion.section>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="mb-6">
          <Tabs<DetailTab>
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            variant="pills"
            size="md"
            ariaLabel="Workout sections"
          />
        </div>
      )}

      <motion.div
        key={activeTab}
        variants={reduce ? undefined : stagger}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : "show"}
        className="space-y-6"
      >
        {/* MAP */}
        {(activeTab === "overview" || activeTab === "map") && hasMap && (
          <motion.div variants={reduce ? undefined : fadeUp}>
            <Card variant="glass" padding="none" className="overflow-hidden">
              <div className="p-4 sm:p-5 pb-0">
                <SectionHeading
                  as="h3"
                  title="Route"
                  description="Click and drag to explore the course."
                />
              </div>
              <div className="p-4 sm:p-5 pt-2">
                <ZoomableWorkoutMap
                  coordinates={coords}
                  className={activeTab === "map" ? "h-[32rem]" : "h-96"}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {/* SPLITS */}
        {(activeTab === "overview" || activeTab === "splits") && hasLaps && (
          <motion.div variants={reduce ? undefined : fadeUp}>
            <LapBarChart
              laps={workoutData.workoutLaps}
              selectedLapIndex={selectedLapIndex}
              onLapClick={handleLapSelection}
            />
          </motion.div>
        )}

        {/* Splits table (shown on overview + splits) */}
        {(activeTab === "overview" || activeTab === "splits") && hasLaps && (
          <motion.div variants={reduce ? undefined : fadeUp}>
            <Card
              variant="default"
              padding="md"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (
                  target === e.currentTarget ||
                  target.tagName === "H2" ||
                  (target.tagName === "DIV" && target.classList.contains("overflow-x-auto")) ||
                  target.tagName === "TABLE" ||
                  target.tagName === "THEAD" ||
                  target.tagName === "TH"
                ) {
                  setSelectedLapIndex(null);
                }
              }}
            >
              <SectionHeading as="h3" title="Laps" description="Tap a row to highlight it on the bar chart." />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Lap</th>
                      <th className="text-right py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Distance</th>
                      <th className="text-right py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Duration</th>
                      <th className="text-right py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pace</th>
                      <th className="text-right py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg HR</th>
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
                          className={`border-b border-gray-100 dark:border-white/5 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-500/10 ring-1 ring-blue-500/40"
                              : "hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLapSelection(isSelected ? null : index);
                          }}
                        >
                          <td className="py-2.5 px-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3 text-sm text-right text-gray-700 dark:text-gray-300 tabular-nums">
                            {lap.lapDistanceInKilometers.toFixed(2)} km
                          </td>
                          <td className="py-2.5 px-3 text-sm text-right text-gray-700 dark:text-gray-300 tabular-nums">
                            {formatDuration(lap.lapDurationInSeconds)}
                          </td>
                          <td className="py-2.5 px-3 text-sm text-right text-gray-900 dark:text-gray-100 font-semibold tabular-nums">
                            {formatPace(lap.lapPaceInMinKm)} /km
                          </td>
                          <td className="py-2.5 px-3 text-sm text-right text-gray-700 dark:text-gray-300 tabular-nums">
                            {lap.avgHeartRate > 0 ? `${formatHR(lap.avgHeartRate)} bpm` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ANALYSIS / CHARTS */}
        {(activeTab === "overview" || activeTab === "analysis") && hasCharts && (
          <>
            <motion.div variants={reduce ? undefined : fadeUp}>
              <WorkoutChart
                data={heartRateData}
                title="Heart rate"
                unit="bpm"
                color="#ef4444"
                minValue={Math.min(...heartRateData, 0)}
                maxValue={Math.max(...heartRateData, 200)}
                timeData={timeData}
              />
            </motion.div>
            <motion.div variants={reduce ? undefined : fadeUp}>
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
                  const minutes = Math.floor(value);
                  const seconds = Math.round((value - minutes) * 60);
                  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
                }}
              />
            </motion.div>
            <motion.div variants={reduce ? undefined : fadeUp}>
              <WorkoutChart
                data={elevationData}
                title="Elevation"
                unit="m"
                color="#10b981"
                minValue={Math.min(...elevationData, 0)}
                maxValue={Math.max(...elevationData, 1000)}
                timeData={timeData}
              />
            </motion.div>
          </>
        )}
      </motion.div>
    </AppShell>
  );
}

export default function WorkoutDetailPage() {
  return (
    <Suspense
      fallback={
        <AppShell hidePageHeader>
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Spinner size="lg" variant="brand" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
          </div>
        </AppShell>
      }
    >
      <WorkoutDetailPageContent />
    </Suspense>
  );
}
