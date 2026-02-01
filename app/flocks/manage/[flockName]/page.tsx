/**
 * Flock Management Page
 * Displays flock details and athletes in the flock
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
import ThemeToggle from "../../../components/ThemeToggle";
import Footer from "../../../components/Footer";
import { getProfilePicSrc } from "../../../../lib/profile-pic-utils";
import { apiService } from "../../../services/api";

interface FlockAthlete {
  athleteName: string;
  imageData?: string;
  imageLoading?: boolean;
}

interface AllAthlete {
  athleteName: string;
  imageData: string;
}

export default function FlockManagementPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
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
          apiService.getFlockAthletes<{ athletes: FlockAthlete[] } | FlockAthlete[]>(user.apiKey, decodeURIComponent(flockName)),
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
          // Response is an array of athlete names (strings)
          athletesData = flockResponse.data.map((name: string) => ({
            athleteName: name,
            imageData: undefined,
            imageLoading: true,
          }));
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

  const handleLogout = async () => {
    await logout();
  };

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
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/goosenet_logo.png"
              alt="GooseNet"
              width={32}
              height={32}
              className="h-6 w-auto sm:h-8"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">GooseNet</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
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
              className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:py-24 overflow-hidden">
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
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-4">
                {/* Flock Profile Pic */}
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {getFirstChar(decodedFlockName)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 lg:text-5xl">
                    {decodedFlockName}
                  </h1>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Flock Management
                  </p>
                </div>
              </div>
              <Link
                href="/flocks"
                className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back to Flocks
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4">
              <p className="text-sm sm:text-base text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Athletes Section */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Flock Athletes
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add to Flock
              </button>
            </div>

            {/* Athletes Grid */}
            {!Array.isArray(athletes) || athletes.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
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
                <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">No athletes in this flock</h3>
                <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">
                  This flock doesn't have any athletes yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.isArray(athletes) && athletes.map((athlete, index) => (
                  <div
                    key={index}
                    className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleRemoveAthlete(athlete.athleteName, e)}
                      disabled={removingAthlete === athlete.athleteName}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from flock"
                    >
                      {removingAthlete === athlete.athleteName ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                    <Link
                      href={`/athlete/${encodeURIComponent(athlete.athleteName)}${athlete.imageData ? `?image=${encodeURIComponent(athlete.imageData)}` : ''}`}
                      className="flex flex-col items-center text-center"
                    >
                      {/* Athlete Image */}
                      <div className="mb-3 sm:mb-4">
                        {athlete.imageData && !failedImages.has(index) ? (
                          <img
                            src={getProfilePicSrc(athlete.imageData)}
                            alt={athlete.athleteName}
                            referrerPolicy="no-referrer"
                            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover"
                            onError={() => {
                              setFailedImages((prev) => new Set(prev).add(index));
                            }}
                          />
                        ) : (
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <svg
                              className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
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
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
                        {athlete.athleteName}
                      </h3>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Add Athlete Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Add Athlete to Flock
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {getAvailableAthletes().length === 0 ? (
                <div className="text-center py-8">
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
                  <h4 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No athletes available
                  </h4>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    All athletes are already in this flock.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getAvailableAthletes().map((athlete, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddAthlete(athlete.athleteName)}
                      disabled={addingAthlete === athlete.athleteName}
                      className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div className="flex items-center gap-4">
                        {/* Athlete Image */}
                        <div className="flex-shrink-0">
                          {athlete.imageData ? (
                            <img
                              src={getProfilePicSrc(athlete.imageData)}
                              alt={athlete.athleteName}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-400"
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
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {athlete.athleteName}
                          </h4>
                        </div>
                        {/* Add Icon */}
                        {addingAthlete === athlete.athleteName ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

