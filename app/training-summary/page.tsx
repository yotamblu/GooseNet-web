/**
 * Training Summary Page
 * Displays comprehensive training statistics for a date range
 */

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef, Suspense } from "react";
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
  cn,
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
  /** Only offered when the selected range spans more than four weeks (see `rangeSpansMoreThanFourWeeks`). */
  const [distanceChartMode, setDistanceChartMode] = useState<"daily" | "weekly">("daily");
  /** Match LapBarChart: one tooltip + dim siblings while hovering. */
  const [distanceBarHoverIndex, setDistanceBarHoverIndex] = useState<number | null>(null);
  const [distanceTooltipCenterX, setDistanceTooltipCenterX] = useState<number | null>(null);
  const distanceChartPlotRef = useRef<HTMLDivElement>(null);

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

  /**
   * Days spanned for the Weekly/Daily chart toggle. Prefer the **loaded summary**
   * dates (what the chart actually reflects) so the control still appears after
   * refresh/session restore when inputs hydrate late or use a different shape
   * than YYYY-MM-DD. Fall back to the date pickers before the first fetch.
   */
  const rangeInclusiveDaysForWeeklyToggle = useMemo(() => {
    if (summary?.startDate && summary?.endDate) {
      const n = inclusiveDayCountBetween(summary.startDate, summary.endDate);
      if (n > 0) return n;
    }
    return inclusiveDayCountBetween(startDate, endDate);
  }, [summary?.startDate, summary?.endDate, startDate, endDate]);

  /** At least four full weeks (28 inclusive calendar days). */
  const rangeSpansMoreThanFourWeeks = rangeInclusiveDaysForWeeklyToggle >= 28;

  useEffect(() => {
    if (!rangeSpansMoreThanFourWeeks && distanceChartMode === "weekly") {
      setDistanceChartMode("daily");
    }
  }, [rangeSpansMoreThanFourWeeks, distanceChartMode]);

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

  /** Monday-start weeks from range start through range end; includes weeks with 0 km. */
  const byWeek = useMemo(() => {
    if (!summary?.allWorkouts?.length || !startDate || !endDate) {
      return [] as { date: string; km: number; label: string }[];
    }
    const rangeStart = new Date(`${startDate}T12:00:00`);
    const rangeEnd = new Date(`${endDate}T12:00:00`);
    if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime()) || rangeStart > rangeEnd) {
      return [];
    }

    const map = new Map<string, number>();
    for (const w of summary.allWorkouts) {
      const key = weekStartKeyFromWorkoutDate(w.workoutDate);
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + w.workoutDistanceInMeters / 1000);
    }

    const rows: { date: string; km: number; label: string }[] = [];
    let w = startOfWeekMonday(rangeStart);
    const lastWeekStart = startOfWeekMonday(rangeEnd);
    while (w <= lastWeekStart) {
      const key = toIsoDateLocal(w);
      const km = map.get(key) ?? 0;
      rows.push({
        date: key,
        km,
        label: w.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
      const next = new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7);
      w = next;
    }
    return rows;
  }, [summary, startDate, endDate]);

  const distanceChartData = distanceChartMode === "weekly" ? byWeek : byDay;
  const distChartMax = distanceChartData.reduce((m, d) => Math.max(m, d.km), 0) || 1;
  const distanceYScaleMax = useMemo(() => niceCeilForAxis(distChartMax), [distChartMax]);
  const distanceYAxisTicks = useMemo(
    () => [0, 0.25, 0.5, 0.75, 1].map((t) => t * distanceYScaleMax),
    [distanceYScaleMax]
  );

  useEffect(() => {
    setDistanceBarHoverIndex(null);
    setDistanceTooltipCenterX(null);
  }, [distanceChartMode, summary]);

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
          <div className="mt-4 rounded-lg border border-rose-300/60 bg-rose-50/70 p-3 text-sm text-rose-700 break-words dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}
      </Card>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
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
            <Card variant="glass" padding="lg" className="min-w-0">
              <CardHeader>
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle>
                      {distanceChartMode === "weekly" ? "Distance by week" : "Distance by day"}
                    </CardTitle>
                    <CardDescription>
                      {distanceChartMode === "weekly"
                        ? "Kilometres per week (Monday–Sunday), summed across the selected range"
                        : "Kilometres per day across the selected range"}
                    </CardDescription>
                  </div>
                  {rangeSpansMoreThanFourWeeks && (
                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-gray-200/80 bg-white/50 p-1 dark:border-white/10 dark:bg-white/5">
                      <button
                        type="button"
                        onClick={() => setDistanceChartMode("daily")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          distanceChartMode === "daily"
                            ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                        }`}
                      >
                        Daily
                      </button>
                      <button
                        type="button"
                        onClick={() => setDistanceChartMode("weekly")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          distanceChartMode === "weekly"
                            ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                        }`}
                      >
                        Weekly
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>
              {distanceChartData.length > 0 ? (
                <div
                  className="w-full max-w-full overflow-hidden rounded-xl border border-gray-200/50 bg-gray-50/30 dark:border-white/10 dark:bg-white/[0.02]"
                  aria-label="Distance chart, vertical axis in kilometres"
                >
                  <div className="flex min-w-0 gap-0">
                    <div className="flex w-11 shrink-0 flex-col border-r border-gray-200/60 dark:border-white/10 sm:w-12">
                      <div className="relative h-44 w-full pr-1">
                        {distanceYAxisTicks.map((tick, ti) => {
                          const pct =
                            distanceYScaleMax > 0 ? (tick / distanceYScaleMax) * 100 : 0;
                          return (
                            <span
                              key={`y-tick-${ti}-${tick}`}
                              className="absolute right-1 -translate-y-1/2 text-[10px] font-medium tabular-nums text-gray-500 dark:text-gray-400"
                              style={{ bottom: `${pct}%` }}
                            >
                              {formatKmAxisLabel(tick)}
                            </span>
                          );
                        })}
                      </div>
                      <div className="pt-1 text-center text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        km
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 overflow-x-auto scrollbar-thin">
                      <div className="w-max min-w-full px-1 pb-1">
                        <div ref={distanceChartPlotRef} className="relative h-44">
                          <div className="pointer-events-none absolute inset-0" aria-hidden>
                            {distanceYAxisTicks.map((tick, ti) => {
                              const pct =
                                distanceYScaleMax > 0 ? (tick / distanceYScaleMax) * 100 : 0;
                              return (
                                <div
                                  key={`grid-${ti}-${tick}`}
                                  className="absolute left-0 right-0 h-px bg-gray-200/70 dark:bg-white/10"
                                  style={{ bottom: `${pct}%` }}
                                />
                              );
                            })}
                          </div>

                          {distanceBarHoverIndex != null &&
                            distanceTooltipCenterX != null &&
                            distanceChartData[distanceBarHoverIndex] && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                className={cn(
                                  "pointer-events-none absolute z-10 min-w-[150px] max-w-[min(240px,calc(100vw-4rem))] -translate-x-1/2",
                                  "rounded-lg border border-gray-200/80 dark:border-white/10",
                                  "bg-white/95 dark:bg-gray-900/90 backdrop-blur-md",
                                  "px-3 py-2 text-xs shadow-lg"
                                )}
                                style={{
                                  left: distanceTooltipCenterX,
                                  top: 0,
                                }}
                                role="tooltip"
                              >
                                {(() => {
                                  const d = distanceChartData[distanceBarHoverIndex]!;
                                  return (
                                    <>
                                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        {distanceChartMode === "weekly"
                                          ? `Week of ${d.label}`
                                          : d.label}
                                      </div>
                                      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-gray-600 dark:text-gray-300">
                                        <span className="text-gray-500 dark:text-gray-400">
                                          Distance
                                        </span>
                                        <span className="text-right tabular-nums font-semibold text-blue-600 dark:text-blue-400">
                                          {d.km.toFixed(2)} km
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                          Period
                                        </span>
                                        <span className="text-right tabular-nums">
                                          {distanceChartMode === "weekly"
                                            ? "Weekly total"
                                            : "Daily total"}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                          Chart scale
                                        </span>
                                        <span className="text-right tabular-nums">
                                          {formatKmAxisLabel(distanceYScaleMax)} km max
                                        </span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </motion.div>
                            )}

                          <div
                            className="relative z-[1] flex h-44 cursor-pointer select-none items-end gap-1.5"
                            onMouseLeave={() => {
                              setDistanceBarHoverIndex(null);
                              setDistanceTooltipCenterX(null);
                            }}
                          >
                            {distanceChartData.map((d, i) => {
                              const barKey = `${distanceChartMode}-${d.date}`;
                              const colMin =
                                distanceChartMode === "weekly" ? "min-w-[40px]" : "min-w-[28px]";
                              const h =
                                d.km > 0
                                  ? Math.max(2, (d.km / distanceYScaleMax) * 100)
                                  : 0;
                              const isHovered = distanceBarHoverIndex === i;
                              const dim =
                                distanceBarHoverIndex != null && !isHovered;
                              return (
                                <div
                                  key={barKey}
                                  tabIndex={0}
                                  aria-label={`${distanceChartMode === "weekly" ? "Week" : "Day"} ${d.label}: ${d.km.toFixed(2)} kilometres`}
                                  className={cn(
                                    "flex h-full flex-col items-stretch justify-end outline-none",
                                    "focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
                                    colMin
                                  )}
                                  onMouseEnter={(e) => {
                                    const plot = distanceChartPlotRef.current;
                                    if (!plot) return;
                                    const tr = e.currentTarget.getBoundingClientRect();
                                    const pr = plot.getBoundingClientRect();
                                    setDistanceBarHoverIndex(i);
                                    setDistanceTooltipCenterX(
                                      tr.left - pr.left + tr.width / 2
                                    );
                                  }}
                                  onFocus={(e) => {
                                    const plot = distanceChartPlotRef.current;
                                    if (!plot) return;
                                    const tr = e.currentTarget.getBoundingClientRect();
                                    const pr = plot.getBoundingClientRect();
                                    setDistanceBarHoverIndex(i);
                                    setDistanceTooltipCenterX(
                                      tr.left - pr.left + tr.width / 2
                                    );
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "relative flex w-full flex-1 flex-col justify-end transition-opacity duration-200",
                                      dim && "opacity-55"
                                    )}
                                  >
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
                                      className={cn(
                                        "w-full min-h-[2px] rounded-t-md bg-gradient-to-t from-blue-500/80 via-indigo-500/70 to-purple-500/70",
                                        "origin-bottom overflow-hidden transition-[filter] duration-200",
                                        isHovered &&
                                          "shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                                      )}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          {distanceChartData.map((d) => {
                            const barKey = `${distanceChartMode}-${d.date}`;
                            const colMin =
                              distanceChartMode === "weekly" ? "min-w-[40px]" : "min-w-[28px]";
                            return (
                              <div
                                key={`${barKey}-x`}
                                className={`max-w-[52px] truncate text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 ${colMin}`}
                              >
                                {d.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
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
                            <div className="flex min-w-0 flex-1 flex-col p-6">
                              <div className="mb-5 flex min-w-0 items-center gap-3">
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

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

/**
 * Inclusive calendar-day count between two date strings (YYYY-MM-DD, M/d/yyyy, or Date-parsable).
 */
function inclusiveDayCountBetween(startStr: string, endStr: string): number {
  if (!startStr?.trim() || !endStr?.trim()) return 0;
  const parseLocalDay = (s: string): Date | null => {
    const t = s.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
      const d = new Date(`${t}T12:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  };
  const a = parseLocalDay(startStr);
  const b = parseLocalDay(endStr);
  if (!a || !b || a > b) return 0;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / 86400000) + 1;
}

/** Upper bound for bar chart Y-axis: at least the data max, rounded to a readable step (1–2–5–10 × 10ⁿ). */
function niceCeilForAxis(maxKm: number): number {
  if (!maxKm || maxKm <= 0) return 1;
  const padded = maxKm * 1.05;
  const exp = Math.floor(Math.log10(padded));
  const pow = 10 ** exp;
  const n = padded / pow;
  let nice: number;
  if (n <= 1) nice = 1;
  else if (n <= 2) nice = 2;
  else if (n <= 5) nice = 5;
  else nice = 10;
  return nice * pow;
}

function formatKmAxisLabel(km: number): string {
  if (km <= 0) return "0";
  if (km < 1) return km.toFixed(2);
  if (km < 10) return km.toFixed(1);
  return String(Math.round(km));
}

/** Monday 00:00 local of the week containing `d`. */
function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD Monday of the week for a workout date string. */
function weekStartKeyFromWorkoutDate(workoutDate: string): string | null {
  const parsed = new Date(workoutDate);
  if (isNaN(parsed.getTime())) return null;
  return toIsoDateLocal(startOfWeekMonday(parsed));
}

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
    <div className="min-w-0">
      <div className="mb-1.5 flex min-w-0 items-baseline justify-between gap-2 text-sm">
        <span className="truncate font-medium text-gray-700 dark:text-gray-200">
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
