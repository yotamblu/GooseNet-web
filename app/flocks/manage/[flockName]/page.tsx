/**
 * Flock Management Page
 * Displays flock details and athletes in the flock
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
import { getProfilePicSrc } from "../../../../lib/profile-pic-utils";
import { apiService } from "../../../services/api";
import {
  AppShell,
  Badge,
  Button,
  Card,
  CardTitle,
  Modal,
  Skeleton,
  Spinner,
  StatTile,
  Tabs,
  fadeUp,
  staggerTight,
} from "../../../components/ui";

interface FlockAthlete {
  athleteName: string;
  imageData?: string;
  imageLoading?: boolean;
}

interface AllAthlete {
  athleteName: string;
  imageData: string;
}

type ManageTab = "members" | "settings";

const IconUsers = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconSettings = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconTrash = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconPlus = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconUserAvatar = (
  <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function FlockManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const flockName = params?.flockName as string;
  const [athletes, setAthletes] = useState<FlockAthlete[]>([]);
  const [allAthletes, setAllAthletes] = useState<AllAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingAthlete, setAddingAthlete] = useState<string | null>(null);
  const [removingAthlete, setRemovingAthlete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ManageTab>("members");

  // Require authentication
  useRequireAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role?.toLowerCase() !== "coach" || !user.apiKey || !flockName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch flock athletes and all athletes in parallel
        const [flockResponse, allAthletesResponse] = await Promise.all([
          apiService.getFlockAthletes<{ athletes: FlockAthlete[] } | FlockAthlete[] | string[]>(user.apiKey, decodeURIComponent(flockName)),
          apiService.getAthletes<{ athletesData: AllAthlete[] } | AllAthlete[]>(user.apiKey)
        ]);

        console.log("Flock athletes API response:", flockResponse);
        console.log("All athletes API response:", allAthletesResponse);
        console.log("All athletes response.data:", allAthletesResponse.data);
        console.log("Type of response.data:", typeof allAthletesResponse.data);

        // Extract flock athletes array from response
        // Response structure: ["YotamBlumenkranz", ...] - just an array of strings
        let athletesData: FlockAthlete[] = [];
        if (Array.isArray(flockResponse.data)) {
          // Response is an array of athlete names (strings) or FlockAthlete objects
          athletesData = flockResponse.data.map((item: string | FlockAthlete) =>
            typeof item === 'string'
              ? { athleteName: item, imageData: undefined, imageLoading: true }
              : { ...item, imageLoading: true }
          );
        } else if (flockResponse.data && typeof flockResponse.data === 'object') {
          const data = flockResponse.data as any;
          if (Array.isArray(data.athletes)) {
            // If it's an array of strings, map them
            athletesData = data.athletes.map((item: string | FlockAthlete) =>
              typeof item === 'string'
                ? { athleteName: item, imageData: undefined, imageLoading: true }
                : { ...item, imageLoading: true }
            );
          } else if (Array.isArray(data.athletesData)) {
            athletesData = data.athletesData.map((item: string | FlockAthlete) =>
              typeof item === 'string'
                ? { athleteName: item, imageData: undefined, imageLoading: true }
                : { ...item, imageLoading: true }
            );
          }
        }

        // Fetch profile pics for each athlete
        if (athletesData.length > 0 && user?.apiKey) {
          const profilePicPromises = athletesData.map(async (athlete, index) => {
            try {
              const picResponse = await apiService.getProfilePic(athlete.athleteName);
              if (picResponse.data && typeof picResponse.data === 'string') {
                athletesData[index].imageData = picResponse.data;
              }
            } catch (err) {
              console.error(`Failed to fetch profile pic for ${athlete.athleteName}:`, err);
            } finally {
              athletesData[index].imageLoading = false;
            }
          });
          await Promise.all(profilePicPromises);
        }

        // Extract all athletes array from response
        // Response structure: { athletesData: [...] }
        let allAthletesData: AllAthlete[] = [];
        if (allAthletesResponse.data) {
          const data = allAthletesResponse.data as any;
          console.log("Checking data.athletesData:", data.athletesData);
          console.log("Is array?", Array.isArray(data.athletesData));

          // Check for athletesData first (the correct structure)
          if (data.athletesData && Array.isArray(data.athletesData)) {
            allAthletesData = data.athletesData;
          } else if (data.athletes && Array.isArray(data.athletes)) {
            allAthletesData = data.athletes;
          } else if (Array.isArray(data)) {
            allAthletesData = data;
          }
        } else if (Array.isArray(allAthletesResponse.data)) {
          allAthletesData = allAthletesResponse.data;
        }

        console.log("Parsed all athletes:", allAthletesData);
        console.log("Number of athletes:", allAthletesData.length);

        setAthletes(athletesData);
        setAllAthletes(allAthletesData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setAthletes([]);
        setAllAthletes([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && flockName) {
      fetchData();
    }
  }, [user, authLoading, flockName]);

  // Helper function to get the first character of a string (for profile pic)
  const getFirstChar = (name: string): string => {
    if (!name || name.length === 0) return "?";
    return name.charAt(0).toUpperCase();
  };

  // Get athletes not in the flock
  const getAvailableAthletes = (): AllAthlete[] => {
    const flockAthleteNames = new Set(athletes.map(a => a.athleteName.toLowerCase()));
    const available = allAthletes.filter(athlete =>
      !flockAthleteNames.has(athlete.athleteName.toLowerCase())
    );
    console.log("Flock athletes:", athletes);
    console.log("All athletes:", allAthletes);
    console.log("Available athletes:", available);
    return available;
  };

  // Handle adding athlete to flock
  const handleAddAthlete = async (athleteUserName: string) => {
    if (!user?.apiKey || !flockName) return;

    setAddingAthlete(athleteUserName);
    try {
      const response = await apiService.addToFlock(
        user.apiKey,
        athleteUserName,
        decodeURIComponent(flockName)
      );

      if (response.status === 200) {
        // Refresh the flock athletes list
        const flockResponse = await apiService.getFlockAthletes<string[]>(
          user.apiKey,
          decodeURIComponent(flockName)
        );

        let athletesData: FlockAthlete[] = [];
        if (Array.isArray(flockResponse.data)) {
          // Response is an array of athlete names (strings)
          athletesData = flockResponse.data.map((name: string) => ({
            athleteName: name,
            imageData: undefined,
            imageLoading: true,
          }));
        }

        // Fetch profile pics for each athlete
        if (athletesData.length > 0) {
          const profilePicPromises = athletesData.map(async (athlete, index) => {
            try {
              const picResponse = await apiService.getProfilePic(athlete.athleteName);
              if (picResponse.data && typeof picResponse.data === 'string') {
                athletesData[index].imageData = picResponse.data;
              }
            } catch (err) {
              console.error(`Failed to fetch profile pic for ${athlete.athleteName}:`, err);
            } finally {
              athletesData[index].imageLoading = false;
            }
          });
          await Promise.all(profilePicPromises);
        }

        setAthletes(athletesData);
        setShowAddModal(false);
      } else {
        throw new Error(response.message || "Failed to add athlete to flock");
      }
    } catch (err) {
      console.error("Failed to add athlete to flock:", err);
      setError(err instanceof Error ? err.message : "Failed to add athlete to flock");
    } finally {
      setAddingAthlete(null);
    }
  };

  // Handle removing athlete from flock
  const handleRemoveAthlete = async (athleteName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.apiKey || !flockName) return;

    if (!confirm(`Are you sure you want to remove ${athleteName} from this flock?`)) {
      return;
    }

    setRemovingAthlete(athleteName);
    try {
      const response = await apiService.removeAthleteFromFlock(
        user.apiKey,
        decodeURIComponent(flockName),
        athleteName
      );

      if (response.status === 200) {
        // Refresh the flock athletes list
        const flockResponse = await apiService.getFlockAthletes<string[]>(
          user.apiKey,
          decodeURIComponent(flockName)
        );

        let athletesData: FlockAthlete[] = [];
        if (Array.isArray(flockResponse.data)) {
          // Response is an array of athlete names (strings)
          athletesData = flockResponse.data.map((name: string) => ({
            athleteName: name,
            imageData: undefined,
            imageLoading: true,
          }));
        }

        // Fetch profile pics for each athlete
        if (athletesData.length > 0) {
          const profilePicPromises = athletesData.map(async (athlete, index) => {
            try {
              const picResponse = await apiService.getProfilePic(athlete.athleteName);
              if (picResponse.data && typeof picResponse.data === 'string') {
                athletesData[index].imageData = picResponse.data;
              }
            } catch (err) {
              console.error(`Failed to fetch profile pic for ${athlete.athleteName}:`, err);
            } finally {
              athletesData[index].imageLoading = false;
            }
          });
          await Promise.all(profilePicPromises);
        }

        setAthletes(athletesData);
      } else {
        throw new Error(response.message || "Failed to remove athlete from flock");
      }
    } catch (err) {
      console.error("Failed to remove athlete from flock:", err);
      setError(err instanceof Error ? err.message : "Failed to remove athlete from flock");
    } finally {
      setRemovingAthlete(null);
    }
  };

  const decodedFlockName = flockName ? decodeURIComponent(flockName) : "";

  if (authLoading || loading) {
    return (
      <AppShell title={decodedFlockName || "Flock"} subtitle="Flock management" maxWidth="xl">
        <div className="space-y-4">
          <Skeleton h={120} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} h={96} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} h={180} />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (user && user.role?.toLowerCase() !== "coach") {
    return (
      <AppShell title="Flock" maxWidth="md">
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

  const memberCount = Array.isArray(athletes) ? athletes.length : 0;
  const availableCount = getAvailableAthletes().length;

  return (
    <AppShell
      title={decodedFlockName || "Flock"}
      subtitle="Flock management"
      gradientTitle
      maxWidth="xl"
      hidePageHeader
    >
      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/flocks"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Flocks
        </Link>
      </div>

      {/* Hero */}
      <Card variant="glass" padding="lg" className="overflow-hidden">
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-teal-400/20 blur-3xl"
          />
          <div className="relative shrink-0">
            <span
              aria-hidden
              className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-tr from-blue-500/70 via-purple-500/60 to-teal-400/60 blur-md"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/80 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 dark:border-gray-900 sm:h-28 sm:w-28">
              <span className="text-3xl font-bold text-white sm:text-4xl">
                {getFirstChar(decodedFlockName)}
              </span>
            </div>
          </div>

          <div className="relative min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
              Flock
            </div>
            <h1 className="mt-1 text-2xl sm:text-4xl lg:text-5xl display-heading font-bold tracking-tight text-gradient-brand break-words">
              {decodedFlockName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="brand" dot>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </Badge>
              <Badge variant="neutral" className="min-w-0 break-words">
                Coached by {user?.userName ?? "you"}
              </Badge>
            </div>
          </div>

          <div className="relative flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={`/workouts/new?flock=${encodeURIComponent(decodedFlockName)}`}
              className="block w-full sm:w-auto"
            >
              <Button variant="secondary" className="w-full sm:w-auto">
                Add workout
              </Button>
            </Link>
            <Button
              variant="gradient"
              iconLeft={IconPlus}
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto"
            >
              Add to Flock
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card
          padding="md"
          className="mt-4 border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100 dark:border-rose-400/30"
        >
          <p className="text-sm">{error}</p>
        </Card>
      )}

      {/* KPI */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <StatTile label="Members" value={memberCount} accent="brand" compact />
        <StatTile label="Available" value={availableCount} accent="teal" compact />
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="-mx-4 overflow-x-auto scrollbar-thin px-4 sm:mx-0 sm:px-0">
          <Tabs<ManageTab>
            items={[
              { value: "members", label: "Members", icon: IconUsers },
              { value: "settings", label: "Settings", icon: IconSettings },
            ]}
            value={activeTab}
            onChange={(v) => setActiveTab(v)}
            variant="underline"
            ariaLabel="Flock sections"
          />
        </div>

        <div className="mt-6">
          {/* MEMBERS */}
          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!Array.isArray(athletes) || athletes.length === 0 ? (
                <Card padding="lg" className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-teal-400/15 ring-1 ring-inset ring-white/20">
                    <span className="text-blue-500 dark:text-blue-300">{IconUsers}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    No athletes in this flock yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
                    Add athletes from your roster to start planning together.
                  </p>
                  <div className="mt-5">
                    <Button
                      variant="gradient"
                      iconLeft={IconPlus}
                      onClick={() => setShowAddModal(true)}
                    >
                      Add athletes
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
                  {athletes.map((athlete, index) => (
                    <motion.div key={`${athlete.athleteName}-${index}`} variants={fadeUp}>
                      <Card
                        variant="default"
                        padding="md"
                        interactive
                        className="relative flex flex-col items-center gap-3 text-center"
                      >
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAthlete(athlete.athleteName, e)}
                          disabled={removingAthlete === athlete.athleteName}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                          title="Remove from flock"
                          aria-label={`Remove ${athlete.athleteName} from flock`}
                        >
                          {removingAthlete === athlete.athleteName ? (
                            <Spinner size="xs" />
                          ) : (
                            IconTrash
                          )}
                        </button>

                        <Link
                          href={`/athlete/${encodeURIComponent(athlete.athleteName)}${athlete.imageData ? `?image=${encodeURIComponent(athlete.imageData)}` : ''}`}
                          className="flex flex-col items-center gap-3 text-center focus-visible:outline-none"
                        >
                          <div className="relative">
                            <span
                              aria-hidden
                              className="absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-blue-500/60 via-purple-500/50 to-teal-400/50 opacity-50 blur-md"
                            />
                            {athlete.imageLoading ? (
                              <Skeleton circle w={80} h={80} />
                            ) : athlete.imageData && !failedImages.has(index) ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={getProfilePicSrc(athlete.imageData)}
                                alt={athlete.athleteName}
                                referrerPolicy="no-referrer"
                                className="relative h-20 w-20 rounded-full border-2 border-white/80 object-cover dark:border-gray-900"
                                onError={() => {
                                  setFailedImages((prev) => new Set(prev).add(index));
                                }}
                              />
                            ) : (
                              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-teal-400/20 dark:border-gray-900">
                                {IconUserAvatar}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="break-words text-base font-semibold text-gray-900 dark:text-gray-100">
                              {athlete.athleteName}
                            </h3>
                            <div className="mt-1.5 flex items-center justify-center gap-1.5">
                              <Badge variant="brand" size="sm" dot>
                                Athlete
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="lg">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-inset ring-blue-500/20 dark:text-blue-300">
                    {IconSettings}
                  </span>
                  <CardTitle>Flock details</CardTitle>
                </div>
                <dl className="mt-4 divide-y divide-gray-200 text-sm dark:divide-white/10">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="shrink-0 text-gray-500 dark:text-gray-400">Name</dt>
                    <dd className="min-w-0 break-words text-right font-medium text-gray-900 dark:text-gray-100">
                      {decodedFlockName}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="shrink-0 text-gray-500 dark:text-gray-400">Owner</dt>
                    <dd className="min-w-0 break-words text-right font-medium text-gray-900 dark:text-gray-100">
                      {user?.userName ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="shrink-0 text-gray-500 dark:text-gray-400">Members</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                      {memberCount}
                    </dd>
                  </div>
                </dl>
              </Card>
            </motion.div>
          )}

        </div>
      </div>

      {/* Add Athlete Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add athlete to flock"
        description={`Pick from athletes not already in ${decodedFlockName || "this flock"}.`}
        size="xl"
      >
        {getAvailableAthletes().length === 0 ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-teal-400/15 ring-1 ring-inset ring-white/20">
              <span className="text-blue-500 dark:text-blue-300">{IconUsers}</span>
            </div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              No athletes available
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              All your athletes are already in this flock.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerTight}
            initial="hidden"
            animate="show"
            className="grid max-h-[55vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 scrollbar-thin"
          >
            {getAvailableAthletes().map((athlete, index) => {
              const isAdding = addingAthlete === athlete.athleteName;
              return (
                <motion.button
                  key={`${athlete.athleteName}-${index}`}
                  type="button"
                  variants={fadeUp}
                  onClick={() => handleAddAthlete(athlete.athleteName)}
                  disabled={isAdding}
                  className="group relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-gray-900/60"
                >
                  <div className="relative shrink-0">
                    {athlete.imageData ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getProfilePicSrc(athlete.imageData)}
                        alt={athlete.athleteName}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-full border-2 border-white/80 object-cover dark:border-gray-900"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-teal-400/20 dark:border-gray-900">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {athlete.athleteName}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Click to add
                    </div>
                  </div>
                  <div className="shrink-0 text-blue-600 dark:text-blue-400">
                    {isAdding ? <Spinner size="sm" /> : IconPlus}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </Modal>
    </AppShell>
  );
}
