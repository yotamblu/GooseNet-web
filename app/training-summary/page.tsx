/**
 * Training Summary Page
 * Displays comprehensive training statistics for a date range
 */

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiService } from "../services/api";
import WorkoutMap from "../components/WorkoutMap";
import {
  AppShell,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  StatTile,
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
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
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

      // Persist selected range + a *trimmed* copy of the summary.
      // The raw API response contains per-workout time-series (dataSamples),
      // GPS coordinate strings and laps arrays that can easily blow past
      // sessionStorage's ~5MB quota for longer ranges. We drop those heavy
      // fields for persistence and wrap the writes in their own try/catch so
      // a quota error can never surface as a user-facing error banner.
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(getStorageKey("startDate"), startDate);
          sessionStorage.setItem(getStorageKey("endDate"), endDate);
        } catch {
          /* ignore — non-fatal */
        }
        if (response.data) {
          const light: TrainingSummary = {
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            distanceInKilometers: response.data.distanceInKilometers,
            averageDailyInKilometers: response.data.averageDailyInKilometers,
            timeInSeconds: response.data.timeInSeconds,
            averageDailyInSeconds: response.data.averageDailyInSeconds,
            allWorkouts: (response.data.allWorkouts ?? []).map((w) => ({
              ...w,
              workoutLaps: [],
              workoutCoordsJsonStr: "",
              workoutMapCenterJsonStr: "",
              userAccessToken: "",
              dataSamples: [],
            })),
          };
          try {
            sessionStorage.setItem(
              getStorageKey("summary"),
              JSON.stringify(light)
            );
          } catch {
            // Still too large (or storage disabled / full) — clear any stale
            // entry so we don't hydrate a partial one next visit.
            try {
              sessionStorage.removeItem(getStorageKey("summary"));
            } catch {
              /* ignore */
            }
          }
        }
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

  // -- Formatters ---------------------------------------------------------
  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km.toFixed(2);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPace = (paceInMinKm: number): string => {
    if (!paceInMinKm || isNaN(paceInMinKm) || paceInMinKm <= 0) return "N/A";
    const minutes = Math.floor(paceInMinKm);
    const seconds = Math.round((paceInMinKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatHR = (hr: number): string => {
    if (!hr || isNaN(hr) || hr <= 0) return "N/A";
    return Math.round(hr).toString();
  };

  // -- Quick-range presets (UI affordance only; calls existing handlers)
  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    const iso = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    setStartDate(iso(start));
    setEndDate(iso(end));
    if (error && error.includes("date")) setError(null);
  };

  // -- Derived charts from allWorkouts -----------------------------------
  const byDay = useMemo(() => {
    if (!summary?.allWorkouts?.length) return [] as { date: string; km: number; label: string }[];
    const map = new Map<string, number>();
    for (const w of summary.allWorkouts) {
      const key = w.workoutDate;
      const prev = map.get(key) ?? 0;
      map.set(key, prev + w.workoutDistanceInMeters / 1000);
    }
    const entries = Array.from(map.entries())
      .map(([date, km]) => {
        const parsed = new Date(date);
        const label = isNaN(parsed.getTime())
          ? date
          : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return { date, km, label };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    return entries;
  }, [summary]);

  const distByDayMax = byDay.reduce((m, d) => Math.max(m, d.km), 0) || 1;

  const paceStats = useMemo(() => {
    const pts = (summary?.allWorkouts ?? [])
      .map((w) => w.workoutAvgPaceInMinKm)
      .filter((p) => Number.isFinite(p) && p > 0);
    if (pts.length === 0) return null;
    const sorted = [...pts].sort((a, b) => a - b);
    const avg = pts.reduce((s, x) => s + x, 0) / pts.length;
    return { min: sorted[0], max: sorted[sorted.length - 1], avg };
  }, [summary]);

  const hrStats = useMemo(() => {
    const pts = (summary?.allWorkouts ?? [])
      .map((w) => w.workoutAvgHR)
      .filter((p) => Number.isFinite(p) && p > 0);
    if (pts.length === 0) return null;
    const sorted = [...pts].sort((a, b) => a - b);
    const avg = pts.reduce((s, x) => s + x, 0) / pts.length;
    return { min: sorted[0], max: sorted[sorted.length - 1], avg };
  }, [summary]);

  // -- Guards -------------------------------------------------------------
  if (authLoading) {
    return (
      <AppShell hidePageHeader maxWidth="xl">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" variant="brand" />
        </div>
      </AppShell>
    );
  }

  if (noAccess) {
    return (
      <AppShell hidePageHeader maxWidth="md">
        <Card variant="glass" padding="lg" className="mt-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="display-heading text-2xl font-bold text-gray-900 dark:text-gray-50">
            No Access
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {user?.role?.toLowerCase() === "coach"
              ? "Please select an athlete to view their training summary."
              : "You do not have access to view this training summary."}
          </p>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  // -- Render -------------------------------------------------------------
  return (
    <AppShell
      title="Training Summary"
      subtitle={
        athleteName
          ? user?.role?.toLowerCase() === "coach"
            ? `Training insights for ${athleteName}`
            : "Your training at a glance"
          : "Training insights"
      }
      eyebrow="Performance"
      gradientTitle
      maxWidth="xl"
    >
      {/* Date selector card */}
      <Card variant="glass" padding="lg" className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            Quick range
          </span>
          <button
            type="button"
            onClick={() => applyPreset(7)}
            className="rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-blue-400"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => applyPreset(30)}
            className="rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-blue-400"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => applyPreset(90)}
            className="rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-blue-400"
          >
            Last 90 days
          </button>
          <button
            type="button"
            onClick={() => applyPreset(365)}
            className="rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:text-blue-400"
          >
            Last year
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Start date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (error && error.includes("date")) setError(null);
              }}
              className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:ring-2 dark:bg-gray-900/60 dark:text-gray-100 ${
                startDate && endDate && !areDatesValid()
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 dark:border-white/10 dark:focus:border-blue-400 dark:focus:ring-blue-400/30"
              }`}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
              End date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (error && error.includes("date")) setError(null);
              }}
              className={`h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:ring-2 dark:bg-gray-900/60 dark:text-gray-100 ${
                startDate && endDate && !areDatesValid()
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 dark:border-white/10 dark:focus:border-blue-400 dark:focus:ring-blue-400/30"
              }`}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="gradient"
              fullWidth
              loading={loading}
              onClick={fetchTrainingSummary}
              disabled={loading || !startDate || !endDate || !areDatesValid()}
            >
              {loading ? "Loading" : "Get summary"}
            </Button>
          </div>
        </div>

        {startDate && endDate && !areDatesValid() && (
          <div className="mt-4 rounded-lg border border-rose-300/60 bg-rose-50/70 p-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            Start date must be before or equal to end date.
          </div>
        )}
        {error && !error.includes("date") && (
          <div className="mt-4 rounded-lg border border-rose-300/60 bg-rose-50/70 p-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}
      </Card>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} h={108} className="rounded-2xl" />
            ))}
          </div>
          <Skeleton h={280} className="rounded-2xl" />
          <Skeleton h={320} className="rounded-2xl" />
        </div>
      )}

      {/* Hero stats */}
      {!loading && summary && (
        <>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4"
          >
            <motion.div variants={fadeUp}>
              <StatTile
                label="Total distance"
                value={Math.round(summary.distanceInKilometers * 100) / 100}
                unit="km"
                accent="brand"
                decimals={2}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatTile
                label="Avg daily distance"
                value={
                  Math.round(summary.averageDailyInKilometers * 100) / 100
                }
                unit="km"
                accent="teal"
                decimals={2}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatTile
                label="Total time"
                value={formatDuration(summary.timeInSeconds)}
                accent="purple"
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatTile
                label="Avg daily time"
                value={formatDuration(Math.round(summary.averageDailyInSeconds))}
                accent="amber"
              />
            </motion.div>
          </motion.div>

          {/* Period */}
          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Badge variant="brand" dot>
              {summary.startDate} → {summary.endDate}
            </Badge>
            <Badge variant="neutral">
              {summary.allWorkouts?.length ?? 0} workouts
            </Badge>
          </div>

          {/* Charts row */}
          <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Distance by day */}
            <Card variant="glass" padding="lg">
              <CardHeader>
                <div>
                  <CardTitle>Distance by day</CardTitle>
                  <CardDescription>
                    Kilometres per day across the selected range
                  </CardDescription>
                </div>
              </CardHeader>
              {byDay.length > 0 ? (
                <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {byDay.map((d, i) => {
                    const h = d.km > 0 ? Math.max(2, (d.km / distByDayMax) * 100) : 0;
                    return (
                      <div
                        key={d.date}
                        className="flex min-w-[28px] flex-1 flex-col items-center gap-2"
                      >
                        {/* Bar area: owns its own fixed height so % heights
                            resolve reliably (items-stretch won't help here
                            because we may overflow horizontally). */}
                        <div className="relative flex h-44 w-full items-end">
                          <motion.div
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: `${h}%`, opacity: 1 }}
                            transition={
                              reduce
                                ? { duration: 0 }
                                : {
                                    duration: 0.7,
                                    delay: Math.min(0.5, 0.015 * i),
                                    ease: [0.22, 1, 0.36, 1],
                                  }
                            }
                            className="w-full rounded-t-md bg-gradient-to-t from-blue-500/80 via-indigo-500/70 to-purple-500/70"
                            title={`${d.km.toFixed(2)} km — ${d.label}`}
                          />
                        </div>
                        <div className="truncate text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          {d.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No distance data.
                </p>
              )}
            </Card>

            {/* Pace / HR distribution */}
            <Card variant="default" padding="lg">
              <CardHeader>
                <div>
                  <CardTitle>Pace &amp; heart rate</CardTitle>
                  <CardDescription>Across workouts in range</CardDescription>
                </div>
              </CardHeader>
              <div className="space-y-4">
                <RangeRow
                  label="Avg pace"
                  colorClass="from-blue-500 to-indigo-500"
                  minLabel={paceStats ? formatPace(paceStats.min) : "—"}
                  maxLabel={paceStats ? formatPace(paceStats.max) : "—"}
                  avgLabel={paceStats ? formatPace(paceStats.avg) : "—"}
                  lo={paceStats?.min ?? 0}
                  hi={paceStats?.max ?? 1}
                  value={paceStats?.avg ?? 0}
                  unit="/km"
                />
                <RangeRow
                  label="Avg HR"
                  colorClass="from-rose-500 to-amber-500"
                  minLabel={hrStats ? formatHR(hrStats.min) : "—"}
                  maxLabel={hrStats ? formatHR(hrStats.max) : "—"}
                  avgLabel={hrStats ? formatHR(hrStats.avg) : "—"}
                  lo={hrStats?.min ?? 0}
                  hi={hrStats?.max ?? 1}
                  value={hrStats?.avg ?? 0}
                  unit="bpm"
                />
              </div>
            </Card>
          </div>

          {/* Workouts */}
          {summary.allWorkouts && summary.allWorkouts.length > 0 ? (
            <div>
              <SectionHeading
                as="h2"
                title={`Workouts (${summary.allWorkouts.length})`}
                description="Each session with its map and headline stats."
              />

              <div className="grid gap-6">
                {summary.allWorkouts.map((workout, index) => {
                  let coords: [number, number][] = [];
                  try {
                    if (workout.workoutCoordsJsonStr) {
                      coords = JSON.parse(workout.workoutCoordsJsonStr);
                    }
                  } catch (e) {
                    console.error("Failed to parse coordinates:", e);
                  }

                  return (
                    <motion.div
                      key={workout.workoutId || `workout-${index}`}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={`/workout?userName=${encodeURIComponent(athleteName)}&workoutId=${workout.workoutId}`}
                        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-2xl"
                      >
                        <Card variant="glass" padding="none" interactive className="overflow-hidden">
                          <div className="flex flex-col lg:flex-row">
                            <div className="flex flex-1 flex-col p-6">
                              <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-sm">
                                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="display-heading truncate text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                                    {workout.wokroutName || "Running"}
                                  </h3>
                                  <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                                    {workout.workoutDate}
                                  </p>
                                </div>
                                {workout.workoutDeviceName && (
                                  <Badge variant="outline" size="sm">
                                    {workout.workoutDeviceName}
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <StatPill
                                  label="Distance"
                                  value={formatDistance(workout.workoutDistanceInMeters)}
                                  unit="km"
                                />
                                <StatPill
                                  label="Duration"
                                  value={formatDuration(workout.workoutDurationInSeconds)}
                                />
                                {workout.workoutAvgPaceInMinKm > 0 &&
                                  !isNaN(workout.workoutAvgPaceInMinKm) && (
                                    <StatPill
                                      label="Avg pace"
                                      value={formatPace(workout.workoutAvgPaceInMinKm)}
                                      unit="/km"
                                    />
                                  )}
                                {workout.workoutAvgHR > 0 &&
                                  !isNaN(workout.workoutAvgHR) && (
                                    <StatPill
                                      label="Avg HR"
                                      value={formatHR(workout.workoutAvgHR)}
                                      unit="bpm"
                                    />
                                  )}
                              </div>
                            </div>

                            {coords.length > 0 && (
                              <div className="relative h-64 w-full overflow-hidden border-t border-gray-200/70 dark:border-white/5 lg:h-auto lg:w-1/2 lg:border-l lg:border-t-0">
                                <WorkoutMap coordinates={coords} className="h-full w-full" />
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card variant="default" padding="lg" className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No workouts found for the selected date range.
              </p>
            </Card>
          )}
        </>
      )}

      {/* Empty state before first fetch */}
      {!loading && !summary && !error && (
        <Card variant="default" padding="lg" className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h12M3 18h8" />
            </svg>
          </div>
          <h3 className="display-heading text-lg font-semibold text-gray-900 dark:text-gray-50">
            Pick a range to get started
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Choose a quick preset or select start and end dates above.
          </p>
        </Card>
      )}
    </AppShell>
  );
}

// -- Helpers ---------------------------------------------------------------

function StatPill({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200/70 bg-white/70 px-3 py-2 dark:border-white/5 dark:bg-white/5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-base font-bold tabular-nums text-gray-900 dark:text-gray-50">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function RangeRow({
  label,
  colorClass,
  minLabel,
  maxLabel,
  avgLabel,
  lo,
  hi,
  value,
  unit,
}: {
  label: string;
  colorClass: string;
  minLabel: string;
  maxLabel: string;
  avgLabel: string;
  lo: number;
  hi: number;
  value: number;
  unit?: string;
}) {
  const span = hi - lo || 1;
  const pct = Math.max(0, Math.min(100, ((value - lo) / span) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {label}
        </span>
        <span className="tabular-nums font-semibold text-gray-900 dark:text-gray-50">
          {avgLabel}
          {unit && (
            <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          )}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-gray-200/70 dark:bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colorClass}`}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
        <span>min {minLabel}</span>
        <span>max {maxLabel}</span>
      </div>
    </div>
  );
}

export default function TrainingSummaryPage() {
  return (
    <Suspense
      fallback={
        <AppShell hidePageHeader maxWidth="xl">
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner size="lg" variant="brand" />
          </div>
        </AppShell>
      }
    >
      <TrainingSummaryPageContent />
    </Suspense>
  );
}
