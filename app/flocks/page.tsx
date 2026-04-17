/**
 * Flocks Dashboard Page
 * Displays all flocks for coaches
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiService } from "../services/api";
import {
  AppShell,
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  Skeleton,
  Spinner,
  fadeUp,
  staggerTight,
} from "../components/ui";

const IconPlus = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconFlocks = (
  <svg className="h-10 w-10 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

export default function FlocksPage() {
  const { user, loading: authLoading } = useAuth();
  const [flocks, setFlocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  useEffect(() => {
    const fetchFlocks = async () => {
      if (!user || user.role?.toLowerCase() !== "coach" || !user.apiKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getFlocks<{ flocks: string[] }>(user.apiKey);
        console.log("Flocks API response:", response);

        // Extract flocks array from response
        // Response structure: { flocks: [...] }
        let flocksData: string[] = [];
        if (response.data && typeof response.data === 'object') {
          const data = response.data as any;
          if (Array.isArray(data.flocks)) {
            flocksData = data.flocks;
          } else if (Array.isArray(data)) {
            // Fallback: if data itself is an array
            flocksData = data;
          }
        } else if (Array.isArray(response.data)) {
          // Direct array response
          flocksData = response.data;
        }

        setFlocks(flocksData);
      } catch (err) {
        console.error("Failed to fetch flocks:", err);
        setError(err instanceof Error ? err.message : "Failed to load flocks");
        setFlocks([]); // Ensure flocks is always an array
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchFlocks();
    }
  }, [user, authLoading]);

  // Helper function to get the first character of a string (for profile pic)
  const getFirstChar = (name: string): string => {
    if (!name || name.length === 0) return "?";
    return name.charAt(0).toUpperCase();
  };

  // Gradients cycle to give each flock a distinct header strip.
  const gradients = [
    "from-blue-500 via-indigo-500 to-purple-500",
    "from-teal-400 via-cyan-500 to-blue-500",
    "from-purple-500 via-pink-500 to-rose-500",
    "from-amber-400 via-orange-500 to-rose-500",
    "from-emerald-400 via-teal-500 to-cyan-500",
    "from-fuchsia-500 via-purple-500 to-blue-500",
  ];

  if (authLoading) {
    return (
      <AppShell title="Flocks" subtitle="Your training groups" maxWidth="xl">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" variant="brand" />
        </div>
      </AppShell>
    );
  }

  if (user && user.role?.toLowerCase() !== "coach") {
    return (
      <AppShell title="Flocks" maxWidth="md">
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

  const flocksArray = Array.isArray(flocks) ? flocks : [];

  return (
    <AppShell
      title="Flocks"
      subtitle="Organize athletes into training groups"
      actions={
        <Link href="/flocks/create" aria-label="Create flock">
          <Button variant="gradient" iconLeft={IconPlus}>
            Create Flock
          </Button>
        </Link>
      }
      maxWidth="xl"
    >
      {error && (
        <Card
          padding="md"
          className="mb-6 border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100 dark:border-rose-400/30"
        >
          <p className="text-sm">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} padding="none" className="overflow-hidden">
              <Skeleton h={80} className="rounded-none" />
              <div className="flex flex-col items-center gap-2 p-5">
                <Skeleton circle w={56} h={56} className="-mt-12 border-4 border-white dark:border-gray-900" />
                <Skeleton h={16} className="w-2/3" />
                <Skeleton h={12} className="w-1/3" />
                <Skeleton h={34} className="mt-3 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : flocksArray.length === 0 && !error ? (
        <Card padding="lg" className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-teal-400/15 ring-1 ring-inset ring-white/20">
            {IconFlocks}
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No flocks yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
            Create your first flock to organize athletes into training groups.
          </p>
          <div className="mt-5">
            <Link href="/flocks/create">
              <Button variant="gradient" iconLeft={IconPlus}>
                Create your first flock
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <motion.div
          variants={staggerTight}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-full"
        >
          {flocksArray.map((flock, index) => {
            const gradient = gradients[index % gradients.length];
            return (
              <motion.div key={`${flock}-${index}`} variants={fadeUp}>
                <Link
                  href={`/flocks/manage/${encodeURIComponent(flock)}`}
                  className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                >
                  <Card
                    variant="default"
                    padding="none"
                    interactive
                    className="flex h-full flex-col overflow-hidden"
                  >
                    {/* Gradient header strip */}
                    <div
                      className={`h-16 bg-gradient-to-r ${gradient}`}
                      aria-hidden
                    />
                    <div className="flex flex-1 flex-col items-center px-5 pb-5 text-center">
                      <div className="relative -mt-10 mb-3">
                        <span
                          aria-hidden
                          className={`absolute inset-0 -m-1 rounded-full bg-gradient-to-br ${gradient} opacity-60 blur-md`}
                        />
                        <div
                          className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br ${gradient} dark:border-gray-900`}
                        >
                          <span className="text-2xl font-bold text-white">
                            {getFirstChar(flock)}
                          </span>
                        </div>
                      </div>

                      <CardTitle className="break-words text-base sm:text-lg">
                        {flock}
                      </CardTitle>

                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Badge variant="brand" dot size="sm">
                          Coach
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          Flock
                        </Badge>
                      </div>

                      <CardDescription className="mt-2">
                        Tap to manage members &amp; assign workouts.
                      </CardDescription>

                      <div className="mt-4 w-full text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Manage flock →
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AppShell>
  );
}
