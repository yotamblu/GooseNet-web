/**
 * Planned Workouts Page
 * Displays planned workouts (running and strength) with date-based fetching and feed pagination
 */

"use client";

import Link from "next/link";
import { useState, useEffect, Suspense, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiService } from "../services/api";
import LapBarChart from "../components/LapBarChart";
import {
  AppShell,
  Badge,
  Button,
  Card,
  Input,
  Skeleton,
  Spinner,
  Tabs,
} from "../components/ui";

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

type FilterKey = "all" | "running" | "strength";
type GroupKey = "today" | "tomorrow" | "thisWeek" | "later" | "past";

const GROUP_LABELS: Record<GroupKey, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  thisWeek: "This Week",
  later: "Later",
  past: "Past",
};

function PlannedWorkoutsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const [viewMode, setViewMode] = useState<"feed" | "date">("feed");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateInputValue, setDateInputValue] = useState<string>("");
  const [athleteName, setAthleteName] = useState<string>("");
  const [runningWorkouts, setRunningWorkouts] = useState<PlannedRunningWorkout[]>([]);
  const [strengthWorkouts, setStrengthWorkouts] = useState<PlannedStrengthWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningCursor, setRunningCursor] = useState<string | null>(null);
  const [strengthCursor, setStrengthCursor] = useState<string | null>(null);
  const [hasMoreRunning, setHasMoreRunning] = useState(false);
  const [hasMoreStrength, setHasMoreStrength] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  // Refs so the intersection-observer callback always sees fresh values
  // without forcing us to re-subscribe on every render.
  const loadingRef = useRef(false);
  const runningCursorRef = useRef<string | null>(null);
  const strengthCursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(false);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    runningCursorRef.current = runningCursor;
  }, [runningCursor]);
  useEffect(() => {
    strengthCursorRef.current = strengthCursor;
  }, [strengthCursor]);
  useEffect(() => {
    hasMoreRef.current = hasMoreRunning || hasMoreStrength;
  }, [hasMoreRunning, hasMoreStrength]);

  useRequireAuth();

  useEffect(() => {
    const athleteParam = searchParams.get("athlete");
    if (athleteParam) {
      setAthleteName(athleteParam);
    } else if (user) {
      setAthleteName(user.userName);
    }
  }, [searchParams, user]);

  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const parseWorkoutDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  const parseDateInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return formatDate(date);
  };

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

  const fetchPlannedWorkoutFeed = useCallback(async (loadMore = false) => {
    if (!user?.apiKey || !athleteName) {
      setError("Missing required information");
      return;
    }
    // Guard against overlapping requests (intersection observer can fire
    // multiple times in quick succession).
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await apiService.getPlannedWorkoutFeed<PlannedWorkoutFeedResponse>(
        user.apiKey,
        athleteName,
        loadMore ? runningCursorRef.current : null,
        loadMore ? strengthCursorRef.current : null
      );

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
      loadingRef.current = false;
      setLoading(false);
    }
  }, [user?.apiKey, athleteName]);

  const metersPerSecondToMinPerKm = (mps: number): number => {
    if (!mps || mps <= 0) return 10;
    const kmPerHour = mps * 3.6;
    const minPerKm = 60 / kmPerHour;
    return minPerKm;
  };

  const convertIntervalsToLaps = (intervals: WorkoutInterval[]): Lap[] => {
    const laps: Lap[] = [];

    const processStep = (step: WorkoutInterval) => {
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
        if (!step.targetValueLow && !step.targetValueHigh) {
          return;
        }

        const avgSpeedMps = (step.targetValueLow + step.targetValueHigh) / 2;
        if (!avgSpeedMps || avgSpeedMps <= 0) {
          return;
        }
        lapPace = metersPerSecondToMinPerKm(avgSpeedMps);

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
      if (interval.steps && interval.steps.length > 0) {
        const repeatCount = interval.repeatValue || 1;
        for (let i = 0; i < repeatCount; i++) {
          interval.steps.forEach((step) => {
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
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      fetchPlannedWorkoutsByDate(selectedDate);
    }
  };

  useEffect(() => {
    if (viewMode === "feed" && user?.apiKey && athleteName) {
      fetchPlannedWorkoutFeed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, user?.apiKey, athleteName]);

  // Infinite-scroll sentinel — auto-load when scrolled near the bottom.
  // Uses a callback ref so the observer attaches/detaches as the sentinel node
  // mounts/unmounts (e.g. when the list first renders or view mode changes).
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;
      if (typeof IntersectionObserver === "undefined") return;

      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;
          if (loadingRef.current) return;
          if (!hasMoreRef.current) return;
          fetchPlannedWorkoutFeed(true);
        },
        { rootMargin: "600px 0px 600px 0px", threshold: 0 }
      );
      io.observe(node);
      observerRef.current = io;
    },
    [fetchPlannedWorkoutFeed]
  );
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  // Group workouts by temporal bucket (today / tomorrow / this week / later / past)
  type WorkoutItem =
    | { type: "running"; workout: PlannedRunningWorkout; date: Date; id: string }
    | { type: "strength"; workout: PlannedStrengthWorkout; date: Date; id: string };

  const groupedWorkouts = useMemo(() => {
    const filtered: WorkoutItem[] = [];

    if (filter === "all" || filter === "running") {
      runningWorkouts.forEach((w, i) => {
        filtered.push({
          type: "running",
          workout: w,
          date: parseWorkoutDate(w.date),
          id: w.workoutId || `running-${i}`,
        });
      });
    }

    if (filter === "all" || filter === "strength") {
      strengthWorkouts.forEach((w, i) => {
        filtered.push({
          type: "strength",
          workout: w,
          date: parseWorkoutDate(w.workoutDate),
          id: (w.workoutId ? String(w.workoutId) : `strength-${i}`),
        });
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const groups: Record<GroupKey, WorkoutItem[]> = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      past: [],
    };

    filtered.forEach((item) => {
      const d = new Date(item.date);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) groups.today.push(item);
      else if (d.getTime() === tomorrow.getTime()) groups.tomorrow.push(item);
      else if (d > today && d <= weekEnd) groups.thisWeek.push(item);
      else if (d > weekEnd) groups.later.push(item);
      else groups.past.push(item);
    });

    // Sort each group (upcoming ascending, past descending)
    groups.today.sort((a, b) => a.date.getTime() - b.date.getTime());
    groups.tomorrow.sort((a, b) => a.date.getTime() - b.date.getTime());
    groups.thisWeek.sort((a, b) => a.date.getTime() - b.date.getTime());
    groups.later.sort((a, b) => a.date.getTime() - b.date.getTime());
    groups.past.sort((a, b) => b.date.getTime() - a.date.getTime());

    return groups;
  }, [runningWorkouts, strengthWorkouts, filter]);

  const totalShown =
    groupedWorkouts.today.length +
    groupedWorkouts.tomorrow.length +
    groupedWorkouts.thisWeek.length +
    groupedWorkouts.later.length +
    groupedWorkouts.past.length;

  const newWorkoutQuery = athleteName && user?.userName !== athleteName
    ? `?athlete=${encodeURIComponent(athleteName)}`
    : "";

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f17]">
        <Spinner size="lg" />
      </div>
    );
  }

  const athleteParam = searchParams.get("athlete");
  if (user && user.role?.toLowerCase() === "coach" && !athleteParam) {
    return (
      <AppShell title="No Access" subtitle="Select an athlete to view their planned workouts." maxWidth="md">
        <Card padding="lg" className="text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Please choose an athlete from your dashboard to see their plan.
          </p>
          <Link href="/dashboard">
            <Button variant="gradient">Return to Dashboard</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const renderSkeletonList = () => (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <Card key={i} padding="md" className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton circle w={48} h={48} />
            <div className="flex-1 space-y-2">
              <Skeleton h={16} w="40%" />
              <Skeleton h={12} w="25%" />
            </div>
          </div>
          <Skeleton h={12} w="90%" />
          <Skeleton h={12} w="75%" />
        </Card>
      ))}
    </div>
  );

  const renderRunningCard = (workout: PlannedRunningWorkout, laps: Lap[], workoutIdStr: string | null) => (
    <Card padding="md" interactive={!!workoutIdStr} className={!workoutIdStr ? "opacity-60" : ""}>
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/30 text-blue-600 dark:text-blue-300 flex-shrink-0">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="brand" dot>Running</Badge>
            {workout.coachName && (
              <Badge variant="neutral">Coach: {workout.coachName}</Badge>
            )}
          </div>
          <h3 className="display-heading text-lg font-semibold text-gray-900 dark:text-gray-50 tracking-tight truncate">
            {workout.workoutName || "Running Workout"}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {workout.date}
          </p>
        </div>
      </div>
      {workout.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {workout.description}
        </p>
      )}
      {laps.length > 0 && (
        <div className="mb-2 w-full max-w-full overflow-hidden">
          <LapBarChart laps={laps} className="border-0 shadow-none p-0" />
        </div>
      )}
    </Card>
  );

  const renderStrengthCard = (workout: PlannedStrengthWorkout) => {
    const review = workout.workoutReviews && workout.athleteNames && workout.athleteNames.length > 0
      ? workout.workoutReviews[workout.athleteNames[0]]
      : null;
    const workoutIdStr = workout.workoutId ? String(workout.workoutId) : null;

    return (
      <Card padding="md" interactive={!!workoutIdStr} className={!workoutIdStr ? "opacity-60" : ""}>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 dark:from-purple-500/30 dark:to-fuchsia-500/30 text-purple-600 dark:text-purple-300 flex-shrink-0">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="info" dot>Strength</Badge>
              {review && (
                <Badge variant="success">Reviewed</Badge>
              )}
              {workout.coachName && (
                <Badge variant="neutral">Coach: {workout.coachName}</Badge>
              )}
            </div>
            <h3 className="display-heading text-lg font-semibold text-gray-900 dark:text-gray-50 tracking-tight truncate">
              {workout.workoutName || "Strength Workout"}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {workout.workoutDate}
            </p>
          </div>
        </div>

        {workout.workoutDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {workout.workoutDescription}
          </p>
        )}

        {workout.workoutDrills && workout.workoutDrills.length > 0 && (
          <div className="space-y-1">
            {workout.workoutDrills.slice(0, 4).map((drill, di) => (
              <div key={di} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500/70" aria-hidden />
                <span className="truncate">
                  {drill.drillName} · {drill.drillSets} × {drill.drillReps}
                </span>
              </div>
            ))}
            {workout.workoutDrills.length > 4 && (
              <div className="text-xs text-gray-500 dark:text-gray-500 pt-1">
                +{workout.workoutDrills.length - 4} more
              </div>
            )}
          </div>
        )}

        {review && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Review</span>
              <span className="text-gray-500 dark:text-gray-400">
                Difficulty: {review.difficultyLevel}/10
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {review.reviewContent}
            </p>
          </div>
        )}
      </Card>
    );
  };

  const filterItems: { value: FilterKey; label: string }[] = [
    { value: "all", label: "All" },
    { value: "running", label: "Running" },
    { value: "strength", label: "Strength" },
  ];

  const groupKeys: GroupKey[] = ["today", "tomorrow", "thisWeek", "later", "past"];

  return (
    <AppShell
      eyebrow={athleteName ? `Plan for ${athleteName}` : undefined}
      title="Planned Workouts"
      subtitle="Upcoming sessions"
      actions={
        <Link href={`/workouts/new${newWorkoutQuery}`}>
          <Button
            variant="gradient"
            iconLeft={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Workout
          </Button>
        </Link>
      }
    >
      {/* View mode + filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 -mx-1 overflow-x-auto scrollbar-thin px-1">
          <Tabs
            variant="pills"
            size="sm"
            items={[
              { value: "feed", label: "Feed" },
              { value: "date", label: "By Date" },
            ]}
            value={viewMode}
            onChange={(v) => {
              setViewMode(v as "feed" | "date");
              setRunningWorkouts([]);
              setStrengthWorkouts([]);
            }}
          />
        </div>
        <div className="min-w-0 -mx-1 overflow-x-auto scrollbar-thin px-1 sm:ml-auto">
          <Tabs
            variant="underline"
            size="sm"
            items={filterItems}
            value={filter}
            onChange={(v) => setFilter(v as FilterKey)}
          />
        </div>
      </div>

      {/* Date picker for date mode */}
      {viewMode === "date" && (
        <Card padding="md" className="mb-6">
          <form onSubmit={handleDateSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="min-w-0 flex-1 w-full">
              <Input
                type="date"
                label="Select Date"
                id="date"
                value={dateInputValue}
                onChange={(e) => {
                  setDateInputValue(e.target.value);
                  const formatted = parseDateInput(e.target.value);
                  setSelectedDate(formatted);
                }}
                helperText={selectedDate ? `Selected: ${selectedDate}` : undefined}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !selectedDate}
              loading={loading}
              className="w-full sm:w-auto"
            >
              Fetch Workouts
            </Button>
          </form>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card padding="sm" className="mb-6 border-rose-200 dark:border-rose-400/30 bg-rose-50 dark:bg-rose-500/5">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      )}

      {/* Loading - feed initial */}
      {loading && totalShown === 0 && renderSkeletonList()}

      {/* Content */}
      {(!loading || totalShown > 0) && (
        <div className="space-y-10">
          {groupKeys.map((gk) => {
            const items = groupedWorkouts[gk];
            if (items.length === 0) return null;
            return (
              <section key={gk}>
                <div className="sticky top-16 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 mb-4 bg-white/70 dark:bg-[#0b0f17]/70 backdrop-blur-md border-b border-gray-200/60 dark:border-white/5">
                  <h2 className="display-heading text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    {GROUP_LABELS[gk]}
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      {items.length} {items.length === 1 ? "session" : "sessions"}
                    </span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {items.map((item) => {
                    if (item.type === "running") {
                      const workout = item.workout;
                      const laps = convertIntervalsToLaps(workout.intervals || []);
                      const workoutIdStr = workout.workoutId ? String(workout.workoutId) : null;
                      const href = workoutIdStr ? `/planned-workout/${workoutIdStr}` : "#";

                      return (
                        <motion.div
                          key={item.id}
                          layout={!reduce}
                          initial={reduce ? false : { opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {workoutIdStr ? (
                            <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl">
                              {renderRunningCard(workout, laps, workoutIdStr)}
                            </Link>
                          ) : (
                            renderRunningCard(workout, laps, workoutIdStr)
                          )}
                        </motion.div>
                      );
                    } else {
                      const workout = item.workout;
                      const workoutIdStr = workout.workoutId ? String(workout.workoutId) : null;
                      const href = workoutIdStr ? `/strength-workout/${workoutIdStr}` : "#";

                      return (
                        <motion.div
                          key={item.id}
                          layout={!reduce}
                          initial={reduce ? false : { opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {workoutIdStr ? (
                            <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl">
                              {renderStrengthCard(workout)}
                            </Link>
                          ) : (
                            renderStrengthCard(workout)
                          )}
                        </motion.div>
                      );
                    }
                  })}
                </div>
              </section>
            );
          })}

          {/* Empty state */}
          {!loading && totalShown === 0 && (
            <Card padding="lg" className="text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 text-blue-600 dark:text-blue-300">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="display-heading text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                No planned workouts yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {viewMode === "date"
                  ? "Pick a date above to look up a specific session."
                  : "Start planning your first session."}
              </p>
              <Link href={`/workouts/new${newWorkoutQuery}`}>
                <Button variant="gradient">Create a workout</Button>
              </Link>
            </Card>
          )}

          {/* Auto-load sentinel + inline "loading more" feedback */}
          {viewMode === "feed" && (hasMoreRunning || hasMoreStrength) && totalShown > 0 && (
            <>
              <div
                ref={sentinelRef}
                aria-hidden
                className="h-1 w-full"
              />
              <div className="py-4 flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {loading ? (
                  <>
                    <Spinner size="sm" variant="brand" />
                    <span>Loading more workouts…</span>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchPlannedWorkoutFeed(true)}
                  >
                    Load more
                  </Button>
                )}
              </div>
            </>
          )}

          {/* End-of-feed marker */}
          {viewMode === "feed" &&
            !hasMoreRunning &&
            !hasMoreStrength &&
            totalShown > 0 && (
              <div className="py-6 text-center text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                You&apos;re all caught up
              </div>
            )}
        </div>
      )}
    </AppShell>
  );
}

export default function PlannedWorkoutsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f17]">
          <Spinner size="lg" />
        </div>
      }
    >
      <PlannedWorkoutsPageContent />
    </Suspense>
  );
}
