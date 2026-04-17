/**
 * Sleep Data Page
 * Displays sleep data in feed or by date mode
 */

"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { apiService } from "../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import SleepPieChart from "../components/SleepPieChart";
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
  Tabs,
  Skeleton,
  fadeUp,
  stagger,
} from "../components/ui";

interface SleepScore {
  key: string;
  value: {
    qualifierKey: string;
    value: string | null;
  };
}

interface SleepDataItem {
  summaryID: string;
  sleepDurationInSeconds: number;
  sleepStartTimeInSeconds: number;
  sleepTimeOffsetInSeconds: number;
  sleepDate: string;
  deepSleepDurationInSeconds: number;
  lightSleepDurationInSeconds: number;
  remSleepInSeconds: number;
  awakeDurationInSeconds: number;
  sleepScores: SleepScore[];
  overallSleepScore: {
    qualifierKey: string;
    value: string;
  };
}

interface SleepFeedResponse {
  items: SleepDataItem[];
  nextCursor: string | null;
}

type ViewMode = "feed" | "date";

function SleepDataPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const [sleepData, setSleepData] = useState<SleepDataItem[]>([]);
  const [singleSleepData, setSingleSleepData] = useState<SleepDataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loadingDate, setLoadingDate] = useState(false);
  const [noAccess, setNoAccess] = useState(false);

  // Refs so the intersection-observer callback always sees fresh values
  // without forcing us to re-subscribe on every render.
  const loadingMoreRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);
  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  // Get athlete name from query params (for coaches) or use current user (for athletes)
  const athleteNameParam = searchParams?.get("athlete");
  const athleteName = athleteNameParam || user?.userName || "";

  // Determine back URL
  const backUrl = athleteNameParam ? `/athlete/${encodeURIComponent(athleteNameParam)}` : "/dashboard";

  // Check if coach is trying to access without athlete parameter
  useEffect(() => {
    if (user && user.role?.toLowerCase() === "coach" && !athleteNameParam) {
      setNoAccess(true);
      setLoading(false);
      return;
    }
  }, [user, athleteNameParam]);

  useEffect(() => {
    if (!user?.apiKey || !athleteName || noAccess) {
      if (!noAccess) {
        setError("Missing required information");
        setLoading(false);
      }
      return;
    }

    const mode = searchParams?.get("mode") as ViewMode | null;
    if (mode === "date") {
      setViewMode("date");
      const date = searchParams?.get("date");
      if (date) {
        setSelectedDate(date);
        fetchSleepByDate(date);
      } else {
        setLoading(false);
      }
    } else {
      setViewMode("feed");
      fetchSleepFeed();
    }
  }, [user?.apiKey, athleteName, searchParams]);

  const fetchSleepFeed = useCallback(async (cursor?: string | null) => {
    if (!user?.apiKey || !athleteName) return;
    // Guard against overlapping load-more requests triggered by the
    // intersection observer firing multiple times in quick succession.
    if (cursor && loadingMoreRef.current) return;

    try {
      if (!cursor) {
        setLoading(true);
        setError(null);
      } else {
        loadingMoreRef.current = true;
        setLoadingMore(true);
      }

      const response = await apiService.getSleepFeed<SleepFeedResponse>(
        user.apiKey,
        athleteName,
        cursor
      );

      // Check if response contains an error message about invalid API key
      if (response.message && (
        response.message.toLowerCase().includes("no user with this apikey") ||
        response.message.toLowerCase().includes("there is no user with this apikey") ||
        response.message.toLowerCase().includes("invalid api key")
      )) {
        setNoAccess(true);
        return;
      }

      if (response.data) {
        if (cursor) {
          // Filter out duplicates by checking summaryID and sleepDate
          setSleepData((prev) => {
            const existingIds = new Set(prev.map(item => item.summaryID));
            const existingDates = new Set(prev.map(item => item.sleepDate));

            const newItems = response.data.items.filter(item =>
              !existingIds.has(item.summaryID) && !existingDates.has(item.sleepDate)
            );

            return [...prev, ...newItems];
          });
        } else {
          setSleepData(response.data.items);
        }
        setNextCursor(response.data.nextCursor);
      } else {
        throw new Error("Failed to load sleep data");
      }
    } catch (err) {
      console.error("Failed to fetch sleep feed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load sleep data";

      // Check if error indicates no access (invalid API key or user)
      if (errorMessage.toLowerCase().includes("no user with this apikey") ||
          errorMessage.toLowerCase().includes("there is no user with this apikey") ||
          errorMessage.toLowerCase().includes("invalid api key")) {
        setNoAccess(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [user?.apiKey, athleteName]);

  const fetchSleepByDate = async (date: string) => {
    if (!user?.apiKey || !athleteName) return;

    try {
      setLoadingDate(true);
      setError(null);

      // Ensure date is in YYYY-MM-DD format with leading zeroes
      // HTML date input provides this format, but we'll validate it
      const dateParts = date.split("-");
      if (dateParts.length === 3) {
        const year = dateParts[0];
        const month = dateParts[1].padStart(2, "0");
        const day = dateParts[2].padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        const response = await apiService.getSleepByDate<SleepDataItem>(
          user.apiKey,
          athleteName,
          formattedDate
        );

        // Check if response contains an error message about invalid API key
        if (response.message && (
          response.message.toLowerCase().includes("no user with this apikey") ||
          response.message.toLowerCase().includes("there is no user with this apikey") ||
          response.message.toLowerCase().includes("invalid api key")
        )) {
          setNoAccess(true);
          return;
        }

        if (response.data) {
          setSingleSleepData(response.data);
        } else {
          throw new Error("No sleep data found for this date");
        }
      } else {
        throw new Error("Invalid date format");
      }
    } catch (err) {
      console.error("Failed to fetch sleep by date:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load sleep data";

      // Check if error indicates no access (invalid API key or user)
      if (errorMessage.toLowerCase().includes("no user with this apikey") ||
          errorMessage.toLowerCase().includes("there is no user with this apikey") ||
          errorMessage.toLowerCase().includes("invalid api key")) {
        setNoAccess(true);
      } else {
        setError(errorMessage);
      }
      setSingleSleepData(null);
    } finally {
      setLoadingDate(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (nextCursorRef.current && !loadingMoreRef.current) {
      fetchSleepFeed(nextCursorRef.current);
    }
  }, [fetchSleepFeed]);

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
          if (loadingMoreRef.current) return;
          if (!nextCursorRef.current) return;
          fetchSleepFeed(nextCursorRef.current);
        },
        { rootMargin: "600px 0px 600px 0px", threshold: 0 }
      );
      io.observe(node);
      observerRef.current = io;
    },
    [fetchSleepFeed]
  );
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      // Ensure date is in YYYY-MM-DD format with leading zeroes (HTML date input already provides this)
      const formattedDate = date; // HTML date input already provides YYYY-MM-DD format
      // Update URL with date
      const params = new URLSearchParams();
      params.set("mode", "date");
      params.set("date", formattedDate);
      if (athleteNameParam) {
        params.set("athlete", athleteNameParam);
      }
      router.push(`/sleep?${params.toString()}`);
    }
  };

  const switchToFeedMode = () => {
    setViewMode("feed");
    setSingleSleepData(null);
    const params = new URLSearchParams();
    if (athleteNameParam) {
      params.set("athlete", athleteNameParam);
    }
    router.push(`/sleep?${params.toString()}`);
  };

  const switchToDateMode = () => {
    setViewMode("date");
    setSleepData([]);
    const params = new URLSearchParams();
    params.set("mode", "date");
    if (athleteNameParam) {
      params.set("athlete", athleteNameParam);
    }
    router.push(`/sleep?${params.toString()}`);
  };

  // -- Formatters ---------------------------------------------------------
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const scoreVariant = (q: string) => {
    switch (q) {
      case "EXCELLENT":
        return "success" as const;
      case "GOOD":
        return "brand" as const;
      case "FAIR":
        return "warning" as const;
      case "POOR":
        return "danger" as const;
      default:
        return "neutral" as const;
    }
  };

  // -- Derived metrics ----------------------------------------------------
  const featured: SleepDataItem | null =
    viewMode === "date" ? singleSleepData : sleepData[0] ?? null;

  const deepPct = (item: SleepDataItem) => {
    const total =
      item.deepSleepDurationInSeconds +
      item.lightSleepDurationInSeconds +
      item.remSleepInSeconds +
      item.awakeDurationInSeconds;
    return total > 0 ? (item.deepSleepDurationInSeconds / total) * 100 : 0;
  };
  const remPct = (item: SleepDataItem) => {
    const total =
      item.deepSleepDurationInSeconds +
      item.lightSleepDurationInSeconds +
      item.remSleepInSeconds +
      item.awakeDurationInSeconds;
    return total > 0 ? (item.remSleepInSeconds / total) * 100 : 0;
  };

  const scoreNumber = (item: SleepDataItem | null) => {
    if (!item) return 0;
    const raw = item.overallSleepScore?.value;
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) ? n : 0;
  };

  // Last 7 nights of bars (most recent first in feed -> reverse for chrono order)
  const trend = useMemo(() => {
    const source = viewMode === "feed" ? sleepData : [];
    const recent = source.slice(0, 7).slice().reverse();
    const max = Math.max(1, ...recent.map((i) => i.sleepDurationInSeconds));
    return { recent, max };
  }, [sleepData, viewMode]);

  // -- No access ----------------------------------------------------------
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
              ? "Please select an athlete to view their sleep data."
              : "You do not have access to view this sleep data."}
          </p>
          <div className="mt-6">
            <Link href={backUrl}>
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  // -- Render a per-night card (feed mode) --------------------------------
  const renderSleepCard = (item: SleepDataItem, index: number) => (
    <motion.div
      key={item.summaryID || item.sleepDate}
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card variant="glass" padding="md" interactive>
        <div className="flex w-full min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex w-full max-w-full shrink-0 justify-center overflow-hidden sm:w-auto sm:self-center">
            <SleepPieChart
              deepSleepSeconds={item.deepSleepDurationInSeconds}
              lightSleepSeconds={item.lightSleepDurationInSeconds}
              remSleepSeconds={item.remSleepInSeconds}
              awakeSeconds={item.awakeDurationInSeconds}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                  {index === 0 ? "Most recent" : "Night"}
                </div>
                <h3 className="display-heading break-words text-base font-semibold text-gray-900 dark:text-gray-50 sm:text-lg">
                  {formatDateLong(item.sleepDate)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total sleep {formatTime(item.sleepDurationInSeconds)}
                </p>
              </div>
              <Badge variant={scoreVariant(item.overallSleepScore.qualifierKey)} dot>
                {item.overallSleepScore.value} · {item.overallSleepScore.qualifierKey}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Deep", value: item.deepSleepDurationInSeconds, hint: "text-blue-600 dark:text-blue-300" },
                { label: "Light", value: item.lightSleepDurationInSeconds, hint: "text-purple-600 dark:text-purple-300" },
                { label: "REM", value: item.remSleepInSeconds, hint: "text-teal-600 dark:text-teal-300" },
                { label: "Awake", value: item.awakeDurationInSeconds, hint: "text-amber-600 dark:text-amber-300" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-gray-200/70 bg-white/60 px-3 py-2 text-center dark:border-white/5 dark:bg-white/5"
                >
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${s.hint}`}>
                    {s.label}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                    {formatTime(s.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // -- KPI row ------------------------------------------------------------
  const kpis = featured ? (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <motion.div variants={fadeUp}>
        <StatTile
          label="Total sleep"
          value={
            Math.round((featured.sleepDurationInSeconds / 3600) * 10) / 10
          }
          unit="h"
          accent="brand"
          decimals={1}
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatTile
          label="Deep sleep"
          value={Math.round(deepPct(featured))}
          unit="%"
          accent="purple"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatTile
          label="REM sleep"
          value={Math.round(remPct(featured))}
          unit="%"
          accent="teal"
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <StatTile
          label="Sleep score"
          value={scoreNumber(featured)}
          unit={featured.overallSleepScore?.qualifierKey
            ?.toLowerCase()
            .replace(/^./, (c) => c.toUpperCase())}
          accent={
            featured.overallSleepScore?.qualifierKey === "EXCELLENT"
              ? "teal"
              : featured.overallSleepScore?.qualifierKey === "POOR"
                ? "rose"
                : "amber"
          }
        />
      </motion.div>
    </motion.div>
  ) : null;

  // -- Featured (big pie) + trend + tips ----------------------------------
  const featuredBlock = featured && (
    <Card
      variant="glass"
      padding="lg"
      className="relative overflow-hidden shadow-glow-brand"
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />

      <CardHeader className="relative">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            {viewMode === "date" ? "Selected night" : "Most recent night"}
          </div>
          <CardTitle className="text-xl">
            {formatDateLong(featured.sleepDate)}
          </CardTitle>
          <CardDescription>
            {formatTime(featured.sleepDurationInSeconds)} total · score{" "}
            {featured.overallSleepScore.value}
          </CardDescription>
        </div>
        <Badge variant={scoreVariant(featured.overallSleepScore.qualifierKey)} dot>
          {featured.overallSleepScore.qualifierKey}
        </Badge>
      </CardHeader>

      <div className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex min-w-0 justify-center lg:justify-start">
          <div className="w-full max-w-full overflow-hidden">
            <SleepPieChart
              deepSleepSeconds={featured.deepSleepDurationInSeconds}
              lightSleepSeconds={featured.lightSleepDurationInSeconds}
              remSleepSeconds={featured.remSleepInSeconds}
              awakeSeconds={featured.awakeDurationInSeconds}
            />
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <SectionHeading
            as="h3"
            title="Stage breakdown"
            description="Hover any slice to focus on a stage."
            className="mb-2"
          />
          <div className="grid grid-cols-2 gap-3">
            <StageRow label="Deep" color="bg-blue-500" seconds={featured.deepSleepDurationInSeconds} total={featured.sleepDurationInSeconds + featured.awakeDurationInSeconds} />
            <StageRow label="Light" color="bg-purple-400" seconds={featured.lightSleepDurationInSeconds} total={featured.sleepDurationInSeconds + featured.awakeDurationInSeconds} />
            <StageRow label="REM" color="bg-teal-400" seconds={featured.remSleepInSeconds} total={featured.sleepDurationInSeconds + featured.awakeDurationInSeconds} />
            <StageRow label="Awake" color="bg-amber-500" seconds={featured.awakeDurationInSeconds} total={featured.sleepDurationInSeconds + featured.awakeDurationInSeconds} />
          </div>
        </div>
      </div>
    </Card>
  );

  const trendBlock = viewMode === "feed" && trend.recent.length > 1 && (
    <Card variant="default" padding="lg">
      <CardHeader>
        <div>
          <CardTitle>Last {trend.recent.length} nights</CardTitle>
          <CardDescription>Total sleep per night</CardDescription>
        </div>
      </CardHeader>
      <div className="flex w-full min-w-0 max-w-full items-stretch gap-1.5 sm:gap-3">
        {trend.recent.map((item, i) => {
          const heightPct = Math.max(
            2,
            (item.sleepDurationInSeconds / trend.max) * 100
          );
          return (
            <div
              key={item.summaryID || item.sleepDate}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              {/* Bar area: owns its own fixed height so % heights resolve reliably. */}
              <div className="relative flex h-40 w-full items-end">
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: `${heightPct}%`, opacity: 1 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          duration: 0.7,
                          delay: 0.05 * i,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                  className="min-h-[4px] w-full rounded-t-lg bg-gradient-to-t from-blue-500/80 via-indigo-500/70 to-purple-500/70 shadow-glow-brand"
                  title={`${formatTime(item.sleepDurationInSeconds)} on ${item.sleepDate}`}
                />
              </div>
              <div className="w-full truncate text-center text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {formatDateShort(item.sleepDate)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );

  // -- Main shell ---------------------------------------------------------
  return (
    <AppShell
      title="Sleep"
      subtitle={
        athleteNameParam
          ? `Recovery insights for ${athleteName}`
          : "Recovery insights"
      }
      eyebrow="Overnight recovery"
      gradientTitle
      maxWidth="xl"
      actions={
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      }
    >
      {/* Mode + (conditional) date picker */}
      <div className="mb-6 flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="w-max sm:w-auto">
            <Tabs
              variant="pills"
              size="sm"
              items={[
                { value: "feed", label: "Feed" },
                { value: "date", label: "By date" },
              ]}
              value={viewMode}
              onChange={(v) => (v === "feed" ? switchToFeedMode() : switchToDateMode())}
              ariaLabel="Sleep view mode"
            />
          </div>
        </div>

        {viewMode === "date" && (
          <div className="flex min-w-0 items-center gap-2">
            <label htmlFor="sleep-date" className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
              Date
            </label>
            <input
              id="sleep-date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="h-10 w-full min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/30 sm:w-auto sm:flex-none"
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card variant="default" padding="md" className="mb-6 border-rose-200 dark:border-rose-500/30">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      )}

      {/* Loading state */}
      {((loading && viewMode === "feed") || (loadingDate && viewMode === "date")) && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} h={108} className="rounded-2xl" />
            ))}
          </div>
          <Skeleton h={320} className="rounded-2xl" />
          <div className="flex items-center justify-center py-6">
            <Spinner size="lg" variant="brand" />
          </div>
        </div>
      )}

      {/* Feed / Date content */}
      {!loading && viewMode === "feed" && !error && (
        <>
          {sleepData.length > 0 ? (
            <div className="space-y-8">
              {kpis}
              <div className="space-y-6">
                {featuredBlock}
                {trendBlock}
              </div>

              <div>
                <SectionHeading
                  as="h2"
                  title="All nights"
                  description="Scroll through each night's breakdown."
                />
                <div className="space-y-4">
                  {sleepData.map((item, idx) => renderSleepCard(item, idx))}
                </div>

                {/* Auto-load sentinel + inline "loading more" feedback */}
                {nextCursor && (
                  <>
                    <div
                      ref={sentinelRef}
                      aria-hidden
                      className="h-1 w-full"
                    />
                    <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {loadingMore ? (
                        <>
                          <Spinner size="sm" variant="brand" />
                          <span>Loading more nights…</span>
                        </>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleLoadMore}
                        >
                          Load more
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {/* End-of-feed marker */}
                {!nextCursor && sleepData.length > 0 && (
                  <div className="py-6 text-center text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    You&apos;re all caught up
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="No sleep data yet" description="Once data syncs it will show up here." />
          )}
        </>
      )}

      {!loading && viewMode === "date" && !error && (
        <>
          {loadingDate ? null : singleSleepData ? (
            <div className="space-y-8">
              {kpis}
              {featuredBlock}
              <div>
                <SectionHeading as="h2" title="Night detail" description="Full breakdown for the selected date." />
                <div className="space-y-4">
                  {renderSleepCard(singleSleepData, 0)}
                </div>
              </div>
            </div>
          ) : !selectedDate ? (
            <EmptyState title="Pick a date" description="Choose a date above to view sleep data for that night." />
          ) : null}
        </>
      )}
    </AppShell>
  );
}

// -- Small helper components (local) ---------------------------------------

function StageRow({
  label,
  color,
  seconds,
  total,
}: {
  label: string;
  color: string;
  seconds: number;
  total: number;
}) {
  const pct = total > 0 ? (seconds / total) * 100 : 0;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const reduce = useReducedMotion();
  return (
    <div className="rounded-xl border border-gray-200/70 bg-white/60 p-3 dark:border-white/5 dark:bg-white/5">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
          {label}
        </span>
        <span className="tabular-nums text-gray-500 dark:text-gray-400">
          {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-white/10">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card variant="default" padding="lg" className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
      <h3 className="display-heading text-lg font-semibold text-gray-900 dark:text-gray-50">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Card>
  );
}

export default function SleepDataPage() {
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
      <SleepDataPageContent />
    </Suspense>
  );
}
