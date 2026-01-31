/**
 * Athletes Dashboard Page
 * Displays all athletes for coaches
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";

interface AthleteCard {
  athleteName: string;
  imageData: string;
}

export default function AthletesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [athletes, setAthletes] = useState<AthleteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

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

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is a coach
  if (user && user.role?.toLowerCase() !== "coach") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Access denied. This page is for coaches only.</p>
          <Link href="/dashboard" className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
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
            {user?.profilePicString && (
              <img
                src={getProfilePicSrc(user.profilePicString)}
                alt={user.userName}
                referrerPolicy="no-referrer"
                className="hidden md:block h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-12 sm:px-6 sm:py-24 overflow-hidden">
        {/* Glowing purple/blue background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 dark:from-purple-500/15 dark:via-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/20 dark:bg-pink-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/25 dark:bg-blue-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
                My Athletes
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                View and manage all your athletes
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Athletes Grid */}
          {!Array.isArray(athletes) || (athletes.length === 0 && !error) ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No athletes found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by connecting with your first athlete.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.isArray(athletes) && athletes.map((athlete, index) => (
                <div
                  key={index}
                  className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Athlete Image */}
                    <div className="mb-4">
                      {athlete.imageData && !failedImages.has(index) ? (
                        <img
                          src={getProfilePicSrc(athlete.imageData)}
                          alt={athlete.athleteName}
                          referrerPolicy="no-referrer"
                          className="h-24 w-24 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover"
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(index));
                          }}
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Athlete Name */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {athlete.athleteName}
                    </h3>
                    {/* Manage Button */}
                    <button 
                      onClick={() => {
                        const athleteNameEncoded = encodeURIComponent(athlete.athleteName);
                        const imageEncoded = athlete.imageData ? encodeURIComponent(athlete.imageData) : '';
                        const url = `/athlete/${athleteNameEncoded}${imageEncoded ? `?image=${imageEncoded}` : ''}`;
                        router.push(url);
                      }}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

