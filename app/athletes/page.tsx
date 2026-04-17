/**
 * Athletes Dashboard Page
 * Displays all athletes for coaches
 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";
import {
  AppShell,
  Badge,
  Button,
  Card,
  Input,
  Skeleton,
  Spinner,
  fadeUp,
  staggerTight,
} from "../components/ui";

interface AthleteCard {
  athleteName: string;
  imageData: string;
}

const IconSearch = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
  </svg>
);

const IconPlus = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconChevronRight = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
  </svg>
);

const IconUser = (
  <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function AthletesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [athletes, setAthletes] = useState<AthleteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  useEffect(() => {
    const fetchAthletes = async () => {
      if (!user || user.role?.toLowerCase() !== "coach" || !user.apiKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getAthletes<{ athletesData: AthleteCard[] }>(user.apiKey);
        console.log("Athletes API response:", response);

        // Extract athletes array from response
        // Response structure: { athletesData: [...] }
        let athletesData: AthleteCard[] = [];
        if (response.data && typeof response.data === 'object') {
          const data = response.data as any;
          if (Array.isArray(data.athletesData)) {
            athletesData = data.athletesData;
          } else if (Array.isArray(data)) {
            // Fallback: if data itself is an array
            athletesData = data;
          } else if (Array.isArray(data.athletes)) {
            // Another fallback
            athletesData = data.athletes;
          }
        } else if (Array.isArray(response.data)) {
          // Direct array response
          athletesData = response.data;
        }

        setAthletes(athletesData);
      } catch (err) {
        console.error("Failed to fetch athletes:", err);
        setError(err instanceof Error ? err.message : "Failed to load athletes");
        setAthletes([]); // Ensure athletes is always an array
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchAthletes();
    }
  }, [user, authLoading]);

  const filteredAthletes = useMemo(() => {
    if (!Array.isArray(athletes)) return [] as AthleteCard[];
    const q = search.trim().toLowerCase();
    if (!q) return athletes;
    return athletes.filter((a) => a.athleteName?.toLowerCase().includes(q));
  }, [athletes, search]);

  // Auth / role gating screens
  if (authLoading) {
    return (
      <AppShell title="Athletes" subtitle="Your roster" maxWidth="xl">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" variant="brand" />
        </div>
      </AppShell>
    );
  }

  if (user && user.role?.toLowerCase() !== "coach") {
    return (
      <AppShell title="Athletes" subtitle="Your roster" maxWidth="md">
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

  const athletesArray = Array.isArray(athletes) ? athletes : [];
  const totalCount = athletesArray.length;
  const visibleCount = filteredAthletes.length;

  return (
    <AppShell
      title="Athletes"
      subtitle="Your roster"
      actions={
        <Link href="/connect-athlete" aria-label="Add athlete">
          <Button variant="gradient" iconLeft={IconPlus}>
            Add Athlete
          </Button>
        </Link>
      }
      maxWidth="xl"
    >
      {/* Search + counter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full min-w-0 sm:max-w-md">
          <Input
            type="search"
            placeholder="Search athletes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={IconSearch}
            aria-label="Search athletes"
          />
        </div>
        {!loading && totalCount > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {search.trim()
              ? `${visibleCount} of ${totalCount} athletes`
              : `${totalCount} ${totalCount === 1 ? "athlete" : "athletes"}`}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card
          padding="md"
          className="mb-6 border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100 dark:border-rose-400/30"
        >
          <p className="text-sm">{error}</p>
        </Card>
      )}

      {/* Loading skeleton grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} padding="md" className="flex flex-col items-center gap-3">
              <Skeleton circle w={80} h={80} />
              <Skeleton h={18} className="w-3/4" />
              <Skeleton h={12} className="w-1/2" />
              <Skeleton h={34} className="w-full" />
            </Card>
          ))}
        </div>
      ) : athletesArray.length === 0 && !error ? (
        /* Empty state */
        <Card padding="lg" className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-teal-400/15 ring-1 ring-inset ring-white/20">
            <svg
              className="h-10 w-10 text-blue-500 dark:text-blue-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No athletes yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
            Invite your first athlete to start tracking workouts, activity, and recovery together.
          </p>
          <div className="mt-5">
            <Link href="/connect-athlete">
              <Button variant="gradient" iconLeft={IconPlus}>
                Invite an athlete
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredAthletes.length === 0 ? (
        /* Filtered-empty */
        <Card padding="lg" className="text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No matches for “{search.trim()}”
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Try a different name or clear the search.
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        </Card>
      ) : (
        <motion.div
          variants={staggerTight}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredAthletes.map((athlete, index) => {
            const idx = athletesArray.indexOf(athlete);
            const onClick = () => {
              const athleteNameEncoded = encodeURIComponent(athlete.athleteName);
              const imageEncoded = athlete.imageData ? encodeURIComponent(athlete.imageData) : '';
              const url = `/athlete/${athleteNameEncoded}${imageEncoded ? `?image=${imageEncoded}` : ''}`;
              router.push(url);
            };
            return (
              <motion.div key={`${athlete.athleteName}-${index}`} variants={fadeUp}>
                <Card
                  variant="default"
                  padding="md"
                  interactive
                  role="button"
                  tabIndex={0}
                  onClick={onClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onClick();
                    }
                  }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="relative">
                    <span
                      aria-hidden
                      className="absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-blue-500/60 via-purple-500/50 to-teal-400/50 opacity-60 blur-md"
                    />
                    {athlete.imageData && !failedImages.has(idx) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getProfilePicSrc(athlete.imageData)}
                        alt={athlete.athleteName}
                        referrerPolicy="no-referrer"
                        className="relative h-20 w-20 rounded-full border-2 border-white/80 dark:border-gray-900 object-cover"
                        onError={() => {
                          setFailedImages((prev) => new Set(prev).add(idx));
                        }}
                      />
                    ) : (
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/80 dark:border-gray-900 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-teal-400/20">
                        {IconUser}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                      {athlete.athleteName}
                    </h3>
                    <div className="mt-1.5 flex items-center justify-center gap-1.5">
                      <Badge variant="brand" size="sm" dot>
                        Athlete
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-1 flex w-full items-center justify-between gap-2 border-t border-gray-200/70 pt-3 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">View</span>
                      <span>profile</span>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">{IconChevronRight}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AppShell>
  );
}
