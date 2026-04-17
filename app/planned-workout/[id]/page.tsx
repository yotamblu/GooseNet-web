/**
 * Planned Workout Detail Page
 * Displays detailed information about a planned running workout
 */

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../services/api";
import LapBarChart from "../../components/LapBarChart";
import {
  AppShell,
  Badge,
  Button,
  Card,
  StatTile,
  SectionHeading,
  Skeleton,
} from "../../components/ui";

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

type IntensityZone = "warmup" | "work" | "recovery" | "cooldown" | "rest" | "other";

interface FlatIntervalRow {
  key: string;
  label: string;
  description: string;
  zone: IntensityZone;
  durationLabel: string;
  paceLabel: string | null;
  repeatIndex?: number;
  repeatCount?: number;
  depth: number;
}

const ZONE_STYLE: Record<IntensityZone, { ring: string; bg: string; dot: string; text: string; label: string }> = {
  warmup: {
    ring: "ring-blue-500/30",
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    label: "Warm-up",
  },
  work: {
    ring: "ring-purple-500/30",
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    dot: "bg-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    label: "Work",
  },
  recovery: {
    ring: "ring-teal-500/30",
    bg: "bg-teal-500/10 dark:bg-teal-500/15",
    dot: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-300",
    label: "Recovery",
  },
  cooldown: {
    ring: "ring-gray-400/30",
    bg: "bg-gray-500/10 dark:bg-white/5",
    dot: "bg-gray-400",
    text: "text-gray-700 dark:text-gray-300",
    label: "Cool-down",
  },
  rest: {
    ring: "ring-teal-500/30",
    bg: "bg-teal-500/10 dark:bg-teal-500/15",
    dot: "bg-teal-400",
    text: "text-teal-700 dark:text-teal-300",
    label: "Rest",
  },
  other: {
    ring: "ring-purple-500/30",
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    dot: "bg-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    label: "Interval",
  },
};

function classifyIntensity(step: WorkoutInterval): IntensityZone {
  const i = (step.intensity || "").toUpperCase();
  const d = (step.description || "").toLowerCase();
  if (i.includes("WARM") || d.includes("warm")) return "warmup";
  if (i.includes("COOL") || d.includes("cool")) return "cooldown";
  if (i.includes("RECOV")) return "recovery";
  if (i === "REST" || d === "rest") return "rest";
  return "work";
}

function formatSeconds(total: number): string {
  if (!total || total <= 0) return "0:00";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.round(total % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDistance(km: number): string {
  if (km >= 1) return `${km.toFixed(km < 10 ? 2 : 1)} km`;
  return `${Math.round(km * 1000)} m`;
}

function mpsToMinPerKm(mps: number): number {
  if (!mps || mps <= 0) return 0;
  return 1000 / (mps * 60);
}

function formatPace(minPerKm: number): string {
  if (!minPerKm || minPerKm <= 0) return "";
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

function describeStep(step: WorkoutInterval): { durationLabel: string; paceLabel: string | null } {
  const dt = (step.durationType || "").toUpperCase();
  let durationLabel = "—";
  if (dt === "TIME" && step.durationValue) {
    durationLabel = formatSeconds(step.durationValue);
  } else if (dt === "DISTANCE" && step.durationValue) {
    durationLabel = formatDistance(step.durationValue / 1000);
  }

  const isRest = step.intensity === "REST" || step.intensity?.toLowerCase() === "rest";
  if (isRest) return { durationLabel, paceLabel: null };

  const low = step.targetValueLow;
  const high = step.targetValueHigh;
  if (low && high && low > 0 && high > 0) {
    if (Math.abs(low - high) < 1e-6) {
      return { durationLabel, paceLabel: formatPace(mpsToMinPerKm(low)) };
    }
    return {
      durationLabel,
      paceLabel: `${formatPace(mpsToMinPerKm(Math.max(low, high)))} – ${formatPace(mpsToMinPerKm(Math.min(low, high)))}`.replace(/ \/km – /, " – ").replace(/$/, " /km"),
    };
  }
  return { durationLabel, paceLabel: null };
}

/** Cap expanded repeat blocks so pathological plans cannot freeze the main thread. */
const MAX_STRUCTURE_ROWS = 800;

function flattenIntervals(
  intervals: WorkoutInterval[],
  parentKey = "",
  depth = 0,
  rows: FlatIntervalRow[] = [],
  truncatedRef: { current: boolean } = { current: false }
): { rows: FlatIntervalRow[]; truncated: boolean } {
  const push = (row: FlatIntervalRow) => {
    if (rows.length >= MAX_STRUCTURE_ROWS) {
      truncatedRef.current = true;
      return;
    }
    rows.push(row);
  };

  intervals.forEach((interval, idx) => {
    if (rows.length >= MAX_STRUCTURE_ROWS) return;

    const key = `${parentKey}${idx}`;
    if (interval.steps && interval.steps.length > 0) {
      const repeatCount = interval.repeatValue || 1;
      for (let r = 0; r < repeatCount; r++) {
        if (rows.length >= MAX_STRUCTURE_ROWS) return;
        interval.steps.forEach((step, si) => {
          if (rows.length >= MAX_STRUCTURE_ROWS) return;
          const skey = `${key}-r${r}-s${si}`;
          if (step.steps && step.steps.length > 0) {
            flattenIntervals([step], `${skey}-`, depth + 1, rows, truncatedRef);
          } else {
            const zone = classifyIntensity(step);
            const { durationLabel, paceLabel } = describeStep(step);
            push({
              key: skey,
              label: ZONE_STYLE[zone].label,
              description:
                step.description && step.description.trim().length > 0
                  ? step.description
                  : ZONE_STYLE[zone].label,
              zone,
              durationLabel,
              paceLabel,
              repeatIndex: repeatCount > 1 ? r + 1 : undefined,
              repeatCount: repeatCount > 1 ? repeatCount : undefined,
              depth,
            });
          }
        });
      }
    } else {
      const zone = classifyIntensity(interval);
      const { durationLabel, paceLabel } = describeStep(interval);
      push({
        key,
        label: ZONE_STYLE[zone].label,
        description:
          interval.description && interval.description.trim().length > 0
            ? interval.description
            : ZONE_STYLE[zone].label,
        zone,
        durationLabel,
        paceLabel,
        depth,
      });
    }
  });

  return { rows, truncated: truncatedRef.current };
}

const MAX_LAPS_FOR_CHART = 500;

function convertIntervalsToLaps(intervals: WorkoutInterval[]): Lap[] {
  const laps: Lap[] = [];

  const processStep = (step: WorkoutInterval) => {
    if (laps.length >= MAX_LAPS_FOR_CHART) return;
    const isRest = step.intensity === "REST" || step.intensity === "rest";
    let lapDistance = 0;
    let lapDuration = 0;
    let lapPace = 0;

    if (isRest) {
      lapPace = 10;
      if (step.durationType === "DISTANCE" || step.durationType === "distance") {
        lapDistance = step.durationValue / 1000;
        lapDuration = lapDistance * lapPace * 60;
      } else if (step.durationType === "TIME" || step.durationType === "time") {
        lapDuration = step.durationValue;
        lapDistance = lapDuration / (lapPace * 60);
      } else {
        return;
      }
    } else {
      if (!step.targetValueLow && !step.targetValueHigh) return;
      const avgSpeedMps = (step.targetValueLow + step.targetValueHigh) / 2;
      if (!avgSpeedMps || avgSpeedMps <= 0) return;
      lapPace = 1000 / (avgSpeedMps * 60);
      if (step.durationType === "DISTANCE" || step.durationType === "distance") {
        lapDistance = step.durationValue / 1000;
        lapDuration = lapDistance * lapPace * 60;
      } else if (step.durationType === "TIME" || step.durationType === "time") {
        lapDuration = step.durationValue;
        lapDistance = lapDuration / (lapPace * 60);
      } else {
        return;
      }
    }

    if (lapDistance > 0 && lapDuration > 0 && lapPace > 0) {
      laps.push({
        lapDistanceInKilometers: lapDistance,
        lapDurationInSeconds: lapDuration,
        lapPaceInMinKm: lapPace,
        avgHeartRate: 0,
      });
    }
  };

  const processInterval = (interval: WorkoutInterval) => {
    if (laps.length >= MAX_LAPS_FOR_CHART) return;
    if (interval.steps && interval.steps.length > 0) {
      const repeatCount = interval.repeatValue || 1;
      for (let i = 0; i < repeatCount; i++) {
        if (laps.length >= MAX_LAPS_FOR_CHART) return;
        interval.steps.forEach((step) => {
          if (laps.length >= MAX_LAPS_FOR_CHART) return;
          if (step.steps && step.steps.length > 0) {
            processInterval(step);
          } else {
            processStep(step);
          }
        });
      }
    } else {
      processStep(interval);
    }
  };

  intervals.forEach((interval) => processInterval(interval));
  return laps;
}

export default function PlannedWorkoutDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const workoutId = params?.id as string;
  const reduce = useReducedMotion();

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

  const backUrl = user
    ? user.role?.toLowerCase() === "coach" && workoutData?.worokutObject.athleteNames?.[0]
      ? `/planned-workouts?athlete=${encodeURIComponent(workoutData.worokutObject.athleteNames[0])}`
      : "/planned-workouts"
    : "/";

  const { flatRows, structureTruncated, laps, totals } = useMemo(() => {
    if (!workoutData) {
      return {
        flatRows: [] as FlatIntervalRow[],
        structureTruncated: false,
        laps: [] as Lap[],
        totals: { distance: 0, duration: 0, intervals: 0 },
      };
    }
    const intervals = workoutData.worokutObject.intervals || [];
    const { rows, truncated: structureTruncated } = flattenIntervals(intervals);
    const ls = convertIntervalsToLaps(intervals);
    const totalDistance = ls.reduce((acc, l) => acc + l.lapDistanceInKilometers, 0);
    const totalDuration = ls.reduce((acc, l) => acc + l.lapDurationInSeconds, 0);
    return {
      flatRows: rows,
      structureTruncated,
      laps: ls,
      totals: {
        distance: totalDistance,
        duration: totalDuration,
        intervals: rows.length,
      },
    };
  }, [workoutData]);

  if (loading || authLoading) {
    return (
      <AppShell title="Planned Workout" subtitle="Loading…" maxWidth="lg">
        <div className="space-y-6">
          <Card padding="lg" className="space-y-4">
            <Skeleton h={28} w="60%" />
            <Skeleton h={16} w="30%" />
            <div className="grid grid-cols-3 gap-3 pt-2 sm:gap-4">
              <Skeleton h={96} />
              <Skeleton h={96} />
              <Skeleton h={96} />
            </div>
          </Card>
          <Card padding="md" className="space-y-3">
            <Skeleton h={20} w="25%" />
            <Skeleton h={14} w="80%" />
            <Skeleton h={14} w="70%" />
            <Skeleton h={14} w="60%" />
          </Card>
        </div>
      </AppShell>
    );
  }

  if (error || !workoutData) {
    return (
      <AppShell title="Workout unavailable" maxWidth="md">
        <Card padding="lg" className="text-center">
          <p className="text-rose-600 dark:text-rose-400 mb-4">{error || "Failed to load workout"}</p>
          <Link href={backUrl}>
            <Button variant="secondary">Go Back</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const workout = workoutData.worokutObject;

  return (
    <AppShell
      eyebrow={workout.date || undefined}
      title={workout.workoutName || "Planned Workout"}
      subtitle={workout.description || undefined}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm">
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </span>
            </Button>
          </Link>
        </div>
      }
      maxWidth="lg"
    >
      {/* Hero — meta + stats */}
      <Card variant="glass" padding="lg" className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Badge variant="brand" dot>
            Running
          </Badge>
          {workout.coachName && (
            <Badge variant="neutral">
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Coach: {workout.coachName}
              </span>
            </Badge>
          )}
          {workout.athleteNames?.slice(0, 3).map((a) => (
            <Badge key={a} variant="outline">
              {a}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatTile
            label="Total Distance"
            value={Number(totals.distance.toFixed(2))}
            unit="km"
            accent="brand"
            decimals={totals.distance >= 10 ? 1 : 2}
          />
          <StatTile
            label="Total Duration"
            value={formatSeconds(Math.round(totals.duration))}
            accent="purple"
          />
          <StatTile
            label="Steps"
            value={totals.intervals}
            unit={totals.intervals === 1 ? "step" : "steps"}
            accent="teal"
          />
        </div>
      </Card>

      {/* Intervals track */}
      {flatRows.length > 0 && (
        <section className="mb-10">
          <SectionHeading
            title="Workout Structure"
            description="Color-coded intensity zones — swipe through each step of your session."
          />
          {structureTruncated && (
            <p className="mb-3 text-sm text-amber-700 dark:text-amber-300/90">
              Showing the first {MAX_STRUCTURE_ROWS} steps of this plan. The full structure is available in the workout
              plan JSON below.
            </p>
          )}
          <div className="relative pl-6">
            <span
              aria-hidden
              className="absolute left-2 top-3 bottom-3 w-px bg-gradient-to-b from-blue-500/40 via-purple-500/40 to-teal-400/40"
            />
            <ol className="space-y-3">
              {flatRows.map((row, i) => {
                const style = ZONE_STYLE[row.zone];
                return (
                  <motion.li
                    key={row.key}
                    layout={!reduce}
                    className="relative"
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={reduce ? undefined : { opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                      delay: reduce ? 0 : Math.min(i * 0.018, 0.36),
                    }}
                  >
                    <span
                      aria-hidden
                      className={`absolute -left-5 top-5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-[#0b0f17] ${style.dot}`}
                    />
                    <div
                      className={`rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-5 ${style.bg} ring-1 ring-inset ${style.ring}`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
                            >
                              {style.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              #{i + 1}
                            </span>
                            {row.repeatIndex && row.repeatCount && (
                              <Badge variant="outline" size="sm">
                                Rep {row.repeatIndex}/{row.repeatCount}
                              </Badge>
                            )}
                          </div>
                          <div className="text-base font-semibold text-gray-900 dark:text-gray-50 break-words">
                            {row.description}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                            {row.durationLabel}
                          </span>
                          {row.paceLabel && (
                            <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                              {row.paceLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* Lap chart */}
      {laps.length > 0 && (
        <section className="mb-10">
          <SectionHeading title="Pace Breakdown" description="Per-step pace visualization" />
          <Card variant="glass" padding="md" className="min-w-0">
            <div className="w-full max-w-full overflow-hidden">
              <LapBarChart laps={laps} className="border-0 shadow-none p-0" />
            </div>
          </Card>
        </section>
      )}

      {/* Raw JSON detail */}
      {workoutData.plannedWorkoutJson && (
        <section className="mb-10">
          <SectionHeading title="Workout Plan" description="Garmin-style serialized plan" />
          <Card variant="glass" padding="md" className="min-w-0">
            <div className="w-full max-w-full overflow-x-auto scrollbar-thin">
              <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                {workoutData.plannedWorkoutJson}
              </pre>
            </div>
          </Card>
        </section>
      )}

      {/* Action bar */}
      <div className="sticky bottom-4 z-20">
        <Card variant="glass" padding="sm" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0 text-sm text-gray-600 dark:text-gray-300 break-words">
            {workout.date && <span className="font-medium">{workout.date}</span>}
            {workout.athleteNames?.length ? ` · ${workout.athleteNames.join(", ")}` : ""}
          </div>
          <div className="flex items-center gap-2">
            <Link href={backUrl} className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                Back
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
