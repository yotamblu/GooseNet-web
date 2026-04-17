"use client";

/**
 * Dashboard Page
 * Main dashboard after successful login
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";
import {
  AppShell,
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  SectionHeading,
  Skeleton,
  fadeUp,
  inViewOnce,
  stagger,
  transitionQuick,
} from "../components/ui";

type TileAccent = "brand" | "teal" | "amber" | "rose" | "purple" | "neutral";

interface NavTile {
  href: string;
  title: string;
  description: string;
  cta: string;
  accent: TileAccent;
  badge?: { label: string; variant: "brand" | "success" | "warning" | "info" | "neutral" };
  icon: React.ReactNode;
}

const ICON_CLASS = "h-6 w-6";

const IconUsers = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconFlocks = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const IconPlus = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
  </svg>
);

const IconSettings = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconActivities = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconPlanned = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const IconSleep = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconGarmin = (
  <svg className={ICON_CLASS} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const ACCENT_ICON_BG: Record<TileAccent, string> = {
  brand: "bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-300 ring-1 ring-inset ring-blue-500/30",
  teal: "bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-600 dark:text-teal-300 ring-1 ring-inset ring-teal-500/30",
  amber: "bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30",
  rose: "bg-gradient-to-br from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-300 ring-1 ring-inset ring-rose-500/30",
  purple: "bg-gradient-to-br from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-300 ring-1 ring-inset ring-purple-500/30",
  neutral: "bg-gradient-to-br from-gray-500/15 to-gray-500/5 text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/25",
};

const ACCENT_HALO: Record<TileAccent, string> = {
  brand: "from-blue-500/25 to-blue-500/0",
  teal: "from-teal-500/25 to-teal-500/0",
  amber: "from-amber-500/25 to-amber-500/0",
  rose: "from-rose-500/25 to-rose-500/0",
  purple: "from-purple-500/25 to-purple-500/0",
  neutral: "from-gray-500/15 to-gray-500/0",
};

function getGreeting(hours: number) {
  if (hours < 5) return "Still up";
  if (hours < 12) return "Good morning";
  if (hours < 17) return "Good afternoon";
  if (hours < 22) return "Good evening";
  return "Winding down";
}

function getDayOfYear(now: Date) {
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"error" | "success">("error");
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  const handleLogout = async () => {
    await logout();
  };

  const showToastMessage = (message: string, type: "error" | "success" = "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleGarminSync = async () => {
    if (!user || user.role?.toLowerCase() !== "athlete") {
      return;
    }

    try {
      setIsCheckingConnection(true);

      // First check if already connected - validate connection status
      if (!user.apiKey) {
        throw new Error("API key not found. Please log in again.");
      }

      const connectionResponse = await apiService.validateGarminConnection<{ isConnected: boolean }>(user.apiKey);

      // Validate response structure
      if (!connectionResponse.data || typeof connectionResponse.data !== "object") {
        throw new Error("Invalid response from connection validation");
      }

      const isConnected = (connectionResponse.data as { isConnected: boolean }).isConnected;

      // Check if athlete is already connected
      if (isConnected === true) {
        setIsCheckingConnection(false);
        // Show toast that they're already connected
        showToastMessage("You're already connected to Garmin", "error");
        return;
      }

      // If not connected (isConnected === false), proceed with OAuth flow
      if (isConnected !== false) {
        // Handle unexpected response
        console.warn("Unexpected connection status:", isConnected);
      }

      // Request OAuth token - always pass apiKey as query string
      const tokenResponse = await apiService.requestGarminToken<{
        stateToken: string;
        oauth_token: string;
        oauth_token_secret: string;
      }>(user.apiKey);

      if (!tokenResponse.data?.oauth_token || !tokenResponse.data?.stateToken) {
        throw new Error("Failed to get OAuth token or state token");
      }

      // Store token_secret and stateToken for callback
      const tokenTimestamp = Date.now().toString();
      localStorage.setItem("garmin_token_secret", tokenResponse.data.oauth_token_secret);
      localStorage.setItem("garmin_api_key", user.apiKey);
      localStorage.setItem("garmin_token_timestamp", tokenTimestamp);

      // Build callback URL with stateToken, theme, and OAuth params (for mobile localStorage issues)
      const currentTheme = theme || "dark";
      const callbackUrl = `${window.location.origin}/garmin/callback?stateToken=${encodeURIComponent(tokenResponse.data.stateToken)}&theme=${encodeURIComponent(currentTheme)}&token_secret=${encodeURIComponent(tokenResponse.data.oauth_token_secret)}&apiKey=${encodeURIComponent(user.apiKey)}&timestamp=${encodeURIComponent(tokenTimestamp)}`;
      const encodedCallback = encodeURIComponent(callbackUrl);

      // Redirect to Garmin OAuth - ensure it opens in the same browser window/tab
      // Using window.location.replace ensures it stays in the same browser and doesn't open the app
      const garminOAuthUrl = `https://connect.garmin.com/oauthConfirm?oauth_token=${tokenResponse.data.oauth_token}&oauth_callback=${encodedCallback}`;

      // Use window.location.replace to navigate in the same window/tab
      // This ensures the OAuth flow happens in the browser, not in the Garmin mobile app
      // replace() is used instead of href to replace the current page in history
      window.location.replace(garminOAuthUrl);
    } catch (error) {
      setIsCheckingConnection(false);
      console.error("Failed to initiate Garmin sync:", error);

      // Handle specific error cases
      if (error instanceof Error && error.message.includes("401")) {
        showToastMessage("Authentication failed. Please log in again.", "error");
      } else {
        showToastMessage(error instanceof Error ? error.message : "Failed to connect to Garmin. Please try again.", "error");
      }
    }
  };

  // Compute time-aware derivations once per render (no side effects).
  const now = useMemo(() => new Date(), []);
  const greeting = useMemo(() => getGreeting(now.getHours()), [now]);
  const dayOfYear = useMemo(() => getDayOfYear(now), [now]);
  const weekOfYear = useMemo(() => Math.max(1, Math.ceil(dayOfYear / 7)), [dayOfYear]);
  const dayLabel = useMemo(
    () => now.toLocaleDateString(undefined, { weekday: "long" }),
    [now]
  );

  const role = user?.role?.toLowerCase() ?? "";
  const isCoach = role === "coach";
  const isAthlete = role === "athlete";
  const roleDisplay = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : "Member";

  const coachTiles: NavTile[] = [
    {
      href: "/athletes",
      title: "Athletes",
      description: "View and manage every athlete in your roster.",
      cta: "Open roster",
      accent: "brand",
      icon: IconUsers,
    },
    {
      href: "/flocks",
      title: "Flocks",
      description: "Organize athletes into training groups.",
      cta: "Manage flocks",
      accent: "purple",
      icon: IconFlocks,
    },
    {
      href: "/connect-athlete",
      title: "Connect Athlete",
      description: "Invite and pair a new athlete to your program.",
      cta: "Send invite",
      accent: "teal",
      badge: { label: "New", variant: "success" },
      icon: IconPlus,
    },
    {
      href: "/settings",
      title: "Settings",
      description: "Update your profile and coaching preferences.",
      cta: "Open settings",
      accent: "neutral",
      icon: IconSettings,
    },
  ];

  const athleteTiles: NavTile[] = [
    {
      href: "/activities",
      title: "Activities",
      description: "Track your performance and progress over time.",
      cta: "View activities",
      accent: "brand",
      icon: IconActivities,
    },
    {
      href: "/planned-workouts",
      title: "Planned Workouts",
      description: "See what's on the schedule this week.",
      cta: "View plan",
      accent: "teal",
      icon: IconPlanned,
    },
    {
      href: "/connect-coach",
      title: "My Coach",
      description: "Connect with your coach and view assigned workouts.",
      cta: "Open coach",
      accent: "purple",
      icon: IconUsers,
    },
    {
      href: "/sleep",
      title: "Sleep",
      description: "Track your sleep patterns and recovery.",
      cta: "View sleep",
      accent: "amber",
      icon: IconSleep,
    },
    {
      href: "/training-summary",
      title: "Training Summary",
      description: "Comprehensive training statistics and insights.",
      cta: "Open summary",
      accent: "rose",
      icon: IconActivities,
    },
    {
      href: "/settings",
      title: "Settings",
      description: "Update your profile and account preferences.",
      cta: "Open settings",
      accent: "neutral",
      icon: IconSettings,
    },
  ];

  const tiles = isCoach ? coachTiles : athleteTiles;

  const subtitle = user?.userName
    ? `${greeting}, ${user.userName}. Here's your training command center.`
    : `${greeting}. Here's your training command center.`;

  // Loading state — skeletons shaped like the final layout.
  if (loading) {
    return (
      <AppShell
        title="Dashboard"
        subtitle="Loading your training hub…"
        gradientTitle
      >
        <Skeleton h={128} className="rounded-2xl" />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} h={190} className="rounded-2xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  // Unauthenticated fallback (useRequireAuth will redirect, this keeps render valid).
  if (!user) {
    return (
      <AppShell title="Dashboard" subtitle="Redirecting to sign in…" gradientTitle>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Skeleton h={160} className="w-full max-w-lg rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle={subtitle}
      gradientTitle
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {isAthlete && (
            <Button
              variant="gradient"
              onClick={handleGarminSync}
              loading={isCheckingConnection}
              iconLeft={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114.906-3M20 14a8 8 0 01-14.906 3" />
                </svg>
              }
            >
              {isCheckingConnection ? "Connecting…" : "Sync Garmin"}
            </Button>
          )}
          <Button variant="secondary" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      }
    >
      {/* Welcome / identity band */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card variant="glass" padding="md" className="overflow-hidden">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-teal-400/20 blur-3xl"
            />
            <div className="relative flex items-center gap-4 min-w-0">
              {user.profilePicString ? (
                <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-teal-400 opacity-70 blur-sm scale-110"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getProfilePicSrc(user.profilePicString)}
                    alt={user.userName}
                    referrerPolicy="no-referrer"
                    className="relative h-14 w-14 rounded-full border-2 border-white/80 dark:border-gray-900 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/25 to-teal-400/25 text-lg font-bold text-gray-900 dark:text-white ring-1 ring-inset ring-white/20"
                >
                  {user.userName?.charAt(0)?.toUpperCase() ?? "G"}
                </span>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
                  <span>{dayLabel}</span>
                  <span aria-hidden className="text-gray-300 dark:text-white/20">•</span>
                  <span>Week {weekOfYear}</span>
                </div>
                <h2 className="mt-1 truncate text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Welcome back,{" "}
                  <span className="text-gradient-brand">{user.userName}</span>
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={isCoach ? "brand" : "success"} dot>
                    {roleDisplay}
                  </Badge>
                  {user.apiKey && (
                    <Badge variant="info" dot>
                      API connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="relative hidden min-w-0 items-center gap-3 sm:flex">
              <div className="rounded-xl border border-gray-200/70 bg-white/60 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  Local time
                </div>
                <div className="mt-0.5 font-semibold tabular-nums text-gray-900 dark:text-white">
                  {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action grid */}
      <div className="mt-10">
        <SectionHeading
          eyebrow={isCoach ? "Coach hub" : "Your training"}
          title={isCoach ? "Manage your program" : "Jump back in"}
          description={
            isCoach
              ? "Everything you need to keep your flock moving in the right direction."
              : "Pick up where you left off, or explore a new view of your training."
          }
        />

        {tiles.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center">
            <CardTitle className="text-lg">Nothing to show yet</CardTitle>
            <CardDescription className="mt-2">
              Your dashboard will populate as you connect data sources.
            </CardDescription>
            <div className="mt-4 flex justify-center">
              <Link href="/settings">
                <Button variant="primary">Open settings</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <motion.div
            variants={stagger}
            initial={reduce ? false : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={inViewOnce}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tiles.map((tile) => (
              <motion.div key={tile.href} variants={fadeUp}>
                <Link href={tile.href} className="group block focus:outline-none">
                  <Card
                    variant="glass"
                    padding="md"
                    interactive
                    className="h-full flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-blue-500"
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${ACCENT_HALO[tile.accent]} blur-3xl opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <div
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${ACCENT_ICON_BG[tile.accent]}`}
                      >
                        {tile.icon}
                      </div>
                      {tile.badge && (
                        <Badge variant={tile.badge.variant} size="sm" dot>
                          {tile.badge.label}
                        </Badge>
                      )}
                    </div>

                    <div className="relative mt-4 flex-1">
                      <CardTitle className="text-lg">{tile.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {tile.description}
                      </CardDescription>
                    </div>

                    <div className="relative mt-5 flex items-center justify-between text-sm font-semibold text-blue-600 dark:text-blue-300">
                      <span>{tile.cta}</span>
                      <span
                        aria-hidden
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 transition-transform duration-300 group-hover:translate-x-0.5 dark:bg-blue-400/10"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Garmin sync featured card — athletes only */}
      {isAthlete && (
        <motion.div
          variants={fadeUp}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={inViewOnce}
          className="mt-10"
        >
          <Card variant="gradient-border" padding="lg" className="overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-teal-400/20 blur-3xl"
            />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ACCENT_ICON_BG.brand}`}
                >
                  {IconGarmin}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">Garmin Sync</CardTitle>
                    <Badge variant="info" size="sm" dot>
                      Integration
                    </Badge>
                  </div>
                  <CardDescription className="mt-1.5 max-w-xl">
                    Connect your Garmin account so workouts, sleep, and planned sessions flow into
                    GooseNet automatically.
                  </CardDescription>

                  <AnimatePresence>
                    {showToast && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={transitionQuick}
                        role="status"
                        className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                          toastType === "error"
                            ? "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-700/50 dark:bg-rose-900/30 dark:text-rose-300"
                            : "border border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-700/50 dark:bg-teal-900/30 dark:text-teal-300"
                        }`}
                      >
                        {toastType === "error" ? (
                          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.062 19h13.876a2 2 0 001.789-2.894l-6.938-13.87a2 2 0 00-3.578 0L3.273 16.106A2 2 0 005.062 19z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>{toastMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleGarminSync}
                  loading={isCheckingConnection}
                  disabled={isCheckingConnection}
                  className="w-full sm:w-auto"
                >
                  {isCheckingConnection ? "Checking…" : "Connect Garmin"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AppShell>
  );
}
