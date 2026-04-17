/**
 * Activities Page
 * Displays athlete workouts with date-based fetching and feed pagination.
 *
 * The data-fetching logic (fetchWorkoutFeed / fetchWorkoutsByDate), state,
 * cursor management and workout normalisation is intentionally preserved
 * verbatim from the previous implementation — only the presentation layer is
 * rebuilt on top of the new design system.
 */

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiService } from "../services/api";
import WorkoutMap from "../components/WorkoutMap";
import {
  AppShell,
  Button,
  Card,
  Badge,
  Tabs,
  Skeleton,
  Spinner,
  Input,
} from "../components/ui";

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
  workoutId: string | null;
}

interface WorkoutFeedResponse {
  runningWorkouts: WorkoutSummary[];
  strengthWorkouts: StrengthWorkout[];
  runningNextCursor: string | null;
  strengthNextCursor: string | null;
}

type ViewMode = "feed" | "date";
type TypeFilter = "all" | "running" | "strength";

function RunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 4a2 2 0 100 4 2 2 0 000-4zM7 20l3-4-2-3 4-3 3 3 3-1" />
      <path d="M11 13l2 3-1 4" />
    </svg>
  );
}

function DumbbellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4v16M2 8v8M18 4v16M22 8v8M6 12h12" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function parseWorkoutDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split("/");
  if (parts.length !== 3) return new Date(0);
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

function parseDateInput(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return formatDate(date);
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
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

function ActivitiesPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateInputValue, setDateInputValue] = useState<string>("");
  const [athleteName, setAthleteName] = useState<string>("");
  const [runningWorkouts, setRunningWorkouts] = useState<WorkoutSummary[]>([]);
  const [strengthWorkouts, setStrengthWorkouts] = useState<StrengthWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningCursor, setRunningCursor] = useState<string | null>(null);
  const [strengthCursor, setStrengthCursor] = useState<string | null>(null);
  const [hasMoreRunning, setHasMoreRunning] = useState(false);
  const [hasMoreStrength, setHasMoreStrength] = useState(false);

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

      if (response.data) {
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
        const strength = Array.isArray(response.data.strengthWorkouts)
          ? response.data.strengthWorkouts.map((w: any) => ({
              coachName: w.coachName || w.CoachName || "",
              workoutName: w.workoutName || w.WorkoutName || "Strength Workout",
              workoutDescription: w.workoutDescription || w.WorkoutDescription || "",
              workoutDate: w.workoutDate || w.WorkoutDate || "",
              workoutDrills: w.workoutDrills || w.WorkoutDrills || [],
              athleteNames: w.athleteNames || w.AthleteNames || [],
              workoutReviews: w.workoutReviews || w.WorkoutReviews || {},
              workoutId: w.workoutId || w.WorkoutId || null,
            }))
          : [];
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

  const fetchWorkoutFeed = useCallback(async (loadMore = false) => {
    if (!user?.apiKey || !athleteName) {
      setError("Missing required information");
      return;
    }
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await apiService.getWorkoutFeed<WorkoutFeedResponse>(
        user.apiKey,
        athleteName,
        loadMore ? runningCursorRef.current : null,
        loadMore ? strengthCursorRef.current : null
      );

      if (response.data) {
        const parseWorkout = (w: any): WorkoutSummary => ({
          workoutName: w.workoutName || w.WorkoutName || "Running",
          workoutId: typeof (w.workoutId || w.WorkoutId) === 'string' ? parseInt(w.workoutId || w.WorkoutId, 10) : (Number(w.workoutId || w.WorkoutId) || 0),
          workoutDurationInSeconds: Number(w.workoutDurationInSeconds || w.WorkoutDurationInSeconds) || 0,
          workoutDistanceInMeters: Number(w.workoutDistanceInMeters || w.WorkoutDistanceInMeters) || 0,
          workoutAvgHR: Number(w.workoutAvgHR || w.WorkoutAvgHR) || 0,
          workoutAvgPaceInMinKm: Number(w.workoutAvgPaceInMinKm || w.WorkoutAvgPaceInMinKm) || 0,
          workoutCoordsJsonStr: w.workoutCoordsJsonStr || w.WorkoutCoordsJsonStr || "",
          workoutDate: w.workoutDate || w.WorkoutDate || "",
          profilePicData: w.profilePicData || w.ProfilePicData || w.profilePicString || w.ProfilePicString || "",
          athleteName: w.athleteName || w.AthleteName || athleteName || "",
        });

        const running = Array.isArray(response.data.runningWorkouts)
          ? response.data.runningWorkouts.map((w: any) => {
              const parsed = parseWorkout(w);
              if (!parsed.profilePicData && parsed.athleteName === athleteName && user?.profilePicString) {
                parsed.profilePicData = user.profilePicString;
              }
              return parsed;
            })
          : [];
        const strength = Array.isArray(response.data.strengthWorkouts)
          ? response.data.strengthWorkouts.map((w: any) => ({
              coachName: w.coachName || w.CoachName || "",
              workoutName: w.workoutName || w.WorkoutName || "Strength Workout",
              workoutDescription: w.workoutDescription || w.WorkoutDescription || "",
              workoutDate: w.workoutDate || w.WorkoutDate || "",
              workoutDrills: w.workoutDrills || w.WorkoutDrills || [],
              athleteNames: w.athleteNames || w.AthleteNames || [],
              workoutReviews: w.workoutReviews || w.WorkoutReviews || {},
              workoutId: w.workoutId || w.WorkoutId || null,
            }))
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
      loadingRef.current = false;
      setLoading(false);
    }
  }, [user?.apiKey, user?.profilePicString, athleteName]);

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      fetchWorkoutsByDate(selectedDate);
    }
  };

  useEffect(() => {
    if (viewMode === "feed" && user?.apiKey && athleteName) {
      fetchWorkoutFeed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, user?.apiKey, athleteName]);

  // Infinite-scroll sentinel — auto-load when scrolled near the bottom.
  // Use a callback ref so the observer attaches/detaches as the sentinel node
  // is mounted / unmounted (e.g. when the results list first renders, or when
  // the user switches view modes).
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
          fetchWorkoutFeed(true);
        },
        { rootMargin: "600px 0px 600px 0px", threshold: 0 }
      );
      io.observe(node);
      observerRef.current = io;
    },
    [fetchWorkoutFeed]
  );
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  const combinedWorkouts = useMemo(() => {
    const all = [
      ...runningWorkouts.map((w) => ({
        type: "running" as const,
        workout: w,
        date: parseWorkoutDate(w.workoutDate),
      })),
      ...strengthWorkouts.map((w) => ({
        type: "strength" as const,
        workout: w,
        date: parseWorkoutDate(w.workoutDate),
      })),
    ].sort((a, b) => {
      const dateDiff = b.date.getTime() - a.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.type === "running" && b.type === "strength") return -1;
      if (a.type === "strength" && b.type === "running") return 1;
      return 0;
    });

    if (typeFilter === "all") return all;
    return all.filter((it) => it.type === typeFilter);
  }, [runningWorkouts, strengthWorkouts, typeFilter]);

  // If the active type filter currently shows zero items but more data is
  // available from the server, auto-fetch the next page so the user actually
  // sees results for the type they asked for. (Fixes the "switching to
  // Running/Strength doesn't reload" case when the first page happened to
  // contain only the other type.)
  useEffect(() => {
    if (viewMode !== "feed") return;
    if (loading) return;
    if (typeFilter === "all") return;
    if (combinedWorkouts.length > 0) return;
    const canLoadRunning = typeFilter === "running" && hasMoreRunning;
    const canLoadStrength = typeFilter === "strength" && hasMoreStrength;
    if (canLoadRunning || canLoadStrength) {
      fetchWorkoutFeed(true);
    }
  }, [
    viewMode,
    typeFilter,
    combinedWorkouts.length,
    hasMoreRunning,
    hasMoreStrength,
    loading,
    fetchWorkoutFeed,
  ]);

  if (authLoading) {
    return (
      <AppShell hidePageHeader>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Spinner size="lg" variant="brand" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        </div>
      </AppShell>
    );
  }

  const athleteParam = searchParams.get("athlete");
  if (user && user.role?.toLowerCase() === "coach" && !athleteParam) {
    return (
      <AppShell hidePageHeader>
        <div className="mx-auto max-w-xl text-center py-24">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
            <LockIcon className="h-7 w-7" />
          </div>
          <h2 className="display-heading text-2xl font-bold text-gray-900 dark:text-gray-50">
            No access
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please select an athlete to view their activities.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => router.push("/dashboard")}>
              Return to dashboard
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const title = "Activities";
  const subtitle = athleteName
    ? `Your training history for ${athleteName}`
    : "Your training history";

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      gradientTitle
      actions={
        <Link href="/dashboard">
          <Button variant="secondary" size="sm">
            Back to dashboard
          </Button>
        </Link>
      }
    >
      {/* Filter / view bar */}
      <div className="mb-6 flex w-full max-w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="w-max sm:w-auto">
            <Tabs<ViewMode>
              items={[
                { value: "feed", label: "Feed" },
                { value: "date", label: "By date" },
              ]}
              value={viewMode}
              onChange={(v) => {
                setViewMode(v);
                setRunningWorkouts([]);
                setStrengthWorkouts([]);
              }}
              variant="pills"
              size="sm"
              ariaLabel="View mode"
            />
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="w-max sm:w-auto">
            <Tabs<TypeFilter>
              items={[
                { value: "all", label: "All" },
                { value: "running", label: "Running", icon: <RunIcon className="h-3.5 w-3.5" /> },
                { value: "strength", label: "Strength", icon: <DumbbellIcon className="h-3.5 w-3.5" /> },
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              variant="pills"
              size="sm"
              ariaLabel="Activity type"
            />
          </div>
        </div>
      </div>

      {/* Date picker */}
      {viewMode === "date" && (
        <Card variant="glass" padding="md" className="mb-6">
          <form
            onSubmit={handleDateSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1">
              <Input
                type="date"
                label="Select date"
                value={dateInputValue}
                onChange={(e) => {
                  setDateInputValue(e.target.value);
                  setSelectedDate(parseDateInput(e.target.value));
                }}
                helperText={selectedDate ? `Selected: ${selectedDate}` : "Pick a date to see workouts"}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !selectedDate}
              className="w-full sm:w-auto"
            >
              Fetch workouts
            </Button>
          </form>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Loading skeletons (only for initial load, not load-more) */}
      {loading && runningWorkouts.length === 0 && strengthWorkouts.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} variant="default" padding="md">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton w={44} h={44} className="rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton h={16} w="40%" />
                      <Skeleton h={12} w="25%" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton h={10} w="60%" />
                        <Skeleton h={20} w="80%" />
                      </div>
                    ))}
                  </div>
                </div>
                <Skeleton w="100%" h={160} className="rounded-xl lg:w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Results list */}
      {(!loading || runningWorkouts.length > 0 || strengthWorkouts.length > 0) && (
        <div className="space-y-4">
          {combinedWorkouts.map((item, index) => {
            if (item.type === "running") {
              const workout = item.workout as WorkoutSummary;
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
                  key={workout.workoutId || `running-${index}`}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/workout?userName=${encodeURIComponent(workout.athleteName)}&workoutId=${workout.workoutId}`}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
                  >
                    <Card
                      variant="default"
                      padding="none"
                      interactive
                      className="overflow-hidden"
                    >
                      <div className="flex w-full min-w-0 flex-col lg:flex-row">
                        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
                          <div className="mb-5 flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20">
                              <RunIcon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <h3 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-lg">
                                  {workout.workoutName || "Running"}
                                </h3>
                                <Badge variant="brand" size="sm">Run</Badge>
                              </div>
                              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                {workout.workoutDate}
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4 sm:grid-cols-4">
                            <RunningStat label="Distance" value={formatDistance(workout.workoutDistanceInMeters)} unit="km" />
                            <RunningStat label="Duration" value={formatDuration(workout.workoutDurationInSeconds)} />
                            {workout.workoutAvgPaceInMinKm && workout.workoutAvgPaceInMinKm > 0 && !isNaN(workout.workoutAvgPaceInMinKm) ? (
                              <RunningStat label="Avg pace" value={formatPace(workout.workoutAvgPaceInMinKm)} unit="/km" />
                            ) : null}
                            {workout.workoutAvgHR && workout.workoutAvgHR > 0 && !isNaN(workout.workoutAvgHR) ? (
                              <RunningStat label="Avg HR" value={formatHR(workout.workoutAvgHR)} unit="bpm" />
                            ) : null}
                          </div>
                        </div>

                        <div className="h-56 w-full min-w-0 overflow-hidden p-3 lg:h-auto lg:w-[45%] lg:min-h-[200px] lg:p-4">
                          {coords.length > 0 ? (
                            <WorkoutMap coordinates={coords} className="h-full w-full" />
                          ) : (
                            <div className="relative h-full w-full overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-teal-400/10">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  No route data
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            }

            const workout = item.workout as StrengthWorkout;
            const review = workout.workoutReviews && workout.athleteNames && workout.athleteNames.length > 0
              ? workout.workoutReviews[workout.athleteNames[0]]
              : null;
            const workoutIdStr = workout.workoutId ? String(workout.workoutId) : null;

            const inner = (
              <Card
                variant="default"
                padding="md"
                interactive={!!workoutIdStr}
                className={!workoutIdStr ? "opacity-70" : undefined}
              >
                <div className="mb-3 flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-rose-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-inset ring-purple-500/20">
                    <DumbbellIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-lg">
                        {workout.workoutName || "Strength Workout"}
                      </h3>
                      <Badge variant="info" size="sm">Strength</Badge>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {workout.workoutDate}
                    </p>
                  </div>
                </div>

                {workout.workoutDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {workout.workoutDescription}
                  </p>
                )}

                {workout.workoutDrills && workout.workoutDrills.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Drills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {workout.workoutDrills.map((drill, drillIndex) => (
                        <Badge key={drillIndex} variant="neutral" size="sm">
                          {drill.drillName} · {drill.drillSets}×{drill.drillReps}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {review && (
                  <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Review
                      </span>
                      <Badge variant="warning" size="sm">
                        Difficulty {review.difficultyLevel}/10
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {review.reviewContent}
                    </p>
                  </div>
                )}

                {workout.coachName && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-3">
                    Coach · {workout.coachName}
                  </p>
                )}
              </Card>
            );

            return (
              <motion.div
                key={workoutIdStr || `strength-${index}`}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {workoutIdStr ? (
                  <Link
                    href={`/strength-workout/${workoutIdStr}`}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="cursor-not-allowed">{inner}</div>
                )}
              </motion.div>
            );
          })}

          {/* Empty state */}
          {!loading && combinedWorkouts.length === 0 && (
            <Card variant="glass" padding="lg" className="text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-teal-400/15 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
                No workouts yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {viewMode === "date"
                  ? "Select a date above to look up workouts."
                  : "Connect your Garmin to start syncing runs, or log a strength workout."}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Link href="/settings">
                  <Button variant="primary" size="sm">Connect Garmin</Button>
                </Link>
                <Link href="/planned-workouts">
                  <Button variant="secondary" size="sm">Log a workout</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Auto-load sentinel + inline "loading more" feedback */}
          {viewMode === "feed" && (hasMoreRunning || hasMoreStrength) && combinedWorkouts.length > 0 && (
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
                    <span>Loading more activities…</span>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchWorkoutFeed(true)}
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
            combinedWorkouts.length > 0 && (
              <div className="py-6 text-center text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                You&apos;re all caught up
              </div>
            )}
        </div>
      )}
    </AppShell>
  );
}

function RunningStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-1 truncate text-base font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-50 sm:text-lg">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
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
      <ActivitiesPageContent />
    </Suspense>
  );
}
