"use client";

/**
 * Athlete Dashboard Page
 * Coach view for managing a specific athlete
 */

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";
import {
  AppShell,
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  Spinner,
  Tabs,
  fadeUp,
  staggerTight,
} from "../../components/ui";

const IconUserPlaceholder = (
  <svg className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconBack = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconPlanned = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconPlus = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
  </svg>
);

const IconCompleted = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconSleep = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconSummary = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

type AthleteTab = "overview" | "planned" | "activity";

interface ActionTile {
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  accent: "brand" | "teal" | "amber" | "purple" | "rose" | "neutral";
}

function AthleteDashboardPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [athleteName, setAthleteName] = useState<string>("");
  const [athleteImage, setAthleteImage] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<AthleteTab>("overview");

  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  useEffect(() => {
    // Get athlete name from URL params
    const name = params?.athleteName as string;
    if (name) {
      setAthleteName(decodeURIComponent(name));
    }

    // Get athlete image from query params
    const image = searchParams?.get("image");
    if (image) {
      setAthleteImage(image);
    }
  }, [params, searchParams]);

  // Check if user is a coach
  useEffect(() => {
    if (!authLoading && user && user.role?.toLowerCase() !== "coach") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <AppShell title="Athlete" maxWidth="xl">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" variant="brand" />
        </div>
      </AppShell>
    );
  }

  if (user && user.role?.toLowerCase() !== "coach") {
    return (
      <AppShell title="Athlete" maxWidth="md">
        <Card padding="lg" className="text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Access denied. This page is for coaches only.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to Dashboard
          </Link>
        </Card>
      </AppShell>
    );
  }

  const displayName = athleteName || "Athlete";

  const plannedHref = `/planned-workouts?athlete=${encodeURIComponent(athleteName)}`;
  const addWorkoutHref = `/workouts/new?athlete=${encodeURIComponent(athleteName)}${athleteImage ? `&image=${encodeURIComponent(athleteImage)}` : ''}`;
  const activitiesHref = `/activities?athlete=${encodeURIComponent(athleteName)}`;
  const sleepHref = `/sleep?athlete=${encodeURIComponent(athleteName)}`;
  const summaryHref = `/training-summary?athlete=${encodeURIComponent(athleteName)}`;

  const overviewTiles: ActionTile[] = [
    {
      href: plannedHref,
      title: "Planned Workouts",
      description: "View and manage scheduled workouts for this athlete.",
      cta: "View planned",
      icon: IconPlanned,
      accent: "brand",
    },
    {
      href: addWorkoutHref,
      title: "Add Workout",
      description: "Create and assign a new workout to this athlete.",
      cta: "Add workout",
      icon: IconPlus,
      accent: "teal",
    },
    {
      href: activitiesHref,
      title: "Completed Workouts",
      description: "Review completed workouts and performance data.",
      cta: "View completed",
      icon: IconCompleted,
      accent: "purple",
    },
    {
      href: sleepHref,
      title: "Sleep Data",
      description: "Monitor sleep patterns and recovery metrics.",
      cta: "View sleep",
      icon: IconSleep,
      accent: "amber",
    },
    {
      href: summaryHref,
      title: "Training Summary",
      description: "Comprehensive training statistics and insights.",
      cta: "View summary",
      icon: IconSummary,
      accent: "rose",
    },
  ];

  const accentRing: Record<ActionTile["accent"], string> = {
    brand: "text-blue-600 dark:text-blue-300 bg-blue-500/10 ring-blue-500/20",
    teal: "text-teal-600 dark:text-teal-300 bg-teal-500/10 ring-teal-500/20",
    amber: "text-amber-600 dark:text-amber-300 bg-amber-500/10 ring-amber-500/20",
    purple: "text-purple-600 dark:text-purple-300 bg-purple-500/10 ring-purple-500/20",
    rose: "text-rose-600 dark:text-rose-300 bg-rose-500/10 ring-rose-500/20",
    neutral: "text-gray-600 dark:text-gray-300 bg-gray-500/10 ring-gray-500/20",
  };

  return (
    <AppShell title={displayName} subtitle="Athlete workspace" gradientTitle maxWidth="xl" hidePageHeader>
      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/athletes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
        >
          {IconBack}
          Back to Athletes
        </Link>
      </div>

      {/* Hero */}
      <Card variant="glass" padding="lg" className="overflow-hidden">
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-teal-400/20 blur-3xl"
          />
          <div className="relative">
            <span
              aria-hidden
              className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-tr from-blue-500/70 via-purple-500/60 to-teal-400/60 blur-md"
            />
            {athleteImage && !imageError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getProfilePicSrc(athleteImage)}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="relative h-24 w-24 rounded-full border-4 border-white/80 dark:border-gray-900 object-cover sm:h-28 sm:w-28"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/80 dark:border-gray-900 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-teal-400/20 sm:h-28 sm:w-28">
                {IconUserPlaceholder}
              </div>
            )}
          </div>

          <div className="relative min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
              Athlete profile
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl lg:text-5xl display-heading font-bold tracking-tight text-gradient-brand">
              {displayName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="brand" dot>
                Athlete
              </Badge>
              <Badge variant="neutral">Coached by {user?.userName ?? "you"}</Badge>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-2">
            <Link href={plannedHref}>
              <Button variant="secondary">Planned</Button>
            </Link>
            <Link href={addWorkoutHref}>
              <Button variant="gradient">Add workout</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs<AthleteTab>
          items={[
            { value: "overview", label: "Overview" },
            { value: "planned", label: "Planned" },
            { value: "activity", label: "Activity" },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(v)}
          variant="underline"
          ariaLabel="Athlete sections"
        />

        <div className="mt-6">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              variants={staggerTight}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {overviewTiles.map((tile) => (
                <motion.div key={tile.href} variants={fadeUp}>
                  <Link href={tile.href} className="block h-full">
                    <Card
                      variant="default"
                      padding="md"
                      interactive
                      className="flex h-full flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${accentRing[tile.accent]}`}
                          aria-hidden
                        >
                          {tile.icon}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <CardTitle>{tile.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {tile.description}
                        </CardDescription>
                      </div>
                      <div className="mt-auto pt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {tile.cta} →
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "planned" && (
            <motion.div
              key="planned"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card padding="lg" className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-inset ring-blue-500/20 dark:text-blue-300">
                    {IconPlanned}
                  </span>
                  <CardTitle>Planned workouts</CardTitle>
                </div>
                <CardDescription>
                  Open the planning view to review, reorder and assign workouts for {displayName}.
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Link href={plannedHref}>
                    <Button variant="primary">Open planner</Button>
                  </Link>
                  <Link href={addWorkoutHref}>
                    <Button variant="secondary" iconLeft={IconPlus}>
                      New workout
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card padding="lg" className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 ring-1 ring-inset ring-purple-500/20 dark:text-purple-300">
                    {IconCompleted}
                  </span>
                  <CardTitle>Recent activity</CardTitle>
                </div>
                <CardDescription>
                  Completed workouts, sleep, and training trends live in dedicated views.
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Link href={activitiesHref}>
                    <Button variant="primary">Open activities</Button>
                  </Link>
                  <Link href={sleepHref}>
                    <Button variant="secondary">Sleep</Button>
                  </Link>
                  <Link href={summaryHref}>
                    <Button variant="secondary">Training summary</Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function AthleteDashboardPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Athlete" maxWidth="xl">
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" variant="brand" />
          </div>
        </AppShell>
      }
    >
      <AthleteDashboardPageContent />
    </Suspense>
  );
}
