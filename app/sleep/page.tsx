/**
 * Sleep Data Page
 * Displays sleep data in feed or by date mode
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { apiService } from "../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { motion, AnimatePresence } from "framer-motion";
import SleepPieChart from "../components/SleepPieChart";

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

export default function SleepDataPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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

  const fetchSleepFeed = async (cursor?: string | null) => {
    if (!user?.apiKey || !athleteName) return;

    try {
      if (!cursor) {
        setLoading(true);
        setError(null);
      } else {
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
      setLoadingMore(false);
    }
  };

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

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchSleepFeed(nextCursor);
    }
  };

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getScoreColor = (qualifierKey: string) => {
    switch (qualifierKey) {
      case "EXCELLENT":
        return "text-green-600 dark:text-green-400";
      case "GOOD":
        return "text-blue-600 dark:text-blue-400";
      case "FAIR":
        return "text-yellow-600 dark:text-yellow-400";
      case "POOR":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getScoreBgColor = (qualifierKey: string) => {
    switch (qualifierKey) {
      case "EXCELLENT":
        return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "GOOD":
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "FAIR":
        return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
      case "POOR":
        return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  // Show no access page if access is denied
  if (noAccess) {
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
            {user?.role?.toLowerCase() === "coach" 
              ? "Please select an athlete to view their sleep data."
              : "You do not have access to view this sleep data."}
          </p>
          <Link
            href={backUrl}
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const renderSleepCard = (item: SleepDataItem) => (
    <motion.div
      key={item.summaryID}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => {
        // Future: Navigate to detailed sleep page
        // router.push(`/sleep/${item.summaryID}`);
      }}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Left side: Pie chart */}
        <div className="flex-shrink-0">
          <SleepPieChart
            deepSleepSeconds={item.deepSleepDurationInSeconds}
            lightSleepSeconds={item.lightSleepDurationInSeconds}
            remSleepSeconds={item.remSleepInSeconds}
            awakeSeconds={item.awakeDurationInSeconds}
          />
        </div>

        {/* Right side: Details */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {formatDate(item.sleepDate)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Sleep: {formatTime(item.sleepDurationInSeconds)}
            </p>
          </div>

          {/* Overall Score */}
          <div className={`rounded-lg border p-3 ${getScoreBgColor(item.overallSleepScore.qualifierKey)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Sleep Score
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getScoreColor(item.overallSleepScore.qualifierKey)}`}>
                  {item.overallSleepScore.value}
                </span>
                <span className={`text-xs font-medium ${getScoreColor(item.overallSleepScore.qualifierKey)}`}>
                  {item.overallSleepScore.qualifierKey}
                </span>
              </div>
            </div>
          </div>

          {/* Sleep Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deep Sleep</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(item.deepSleepDurationInSeconds)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Light Sleep</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(item.lightSleepDurationInSeconds)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">REM Sleep</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(item.remSleepInSeconds)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Awake</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(item.awakeDurationInSeconds)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading && viewMode === "feed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sleep data...</p>
        </div>
      </div>
    );
  }

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
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-12 sm:px-6 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Sleep Data
            </h1>
            {athleteNameParam && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {athleteName}
              </p>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={switchToFeedMode}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === "feed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Feed
            </button>
            <button
              onClick={switchToDateMode}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === "date"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              By Date
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Date Picker (for date mode) */}
          {viewMode === "date" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
              />
            </div>
          )}

          {/* Content */}
          {viewMode === "feed" ? (
            <>
              {sleepData.length > 0 ? (
                <div className="space-y-6">
                  {sleepData.map((item) => renderSleepCard(item))}
                  
                  {/* Load More Button */}
                  {nextCursor && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loadingMore ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No sleep data available</p>
                </div>
              )}
            </>
          ) : (
            <>
              {loadingDate ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sleep data...</p>
                </div>
              ) : singleSleepData ? (
                <div>{renderSleepCard(singleSleepData)}</div>
              ) : !selectedDate ? (
                <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Please select a date to view sleep data</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

