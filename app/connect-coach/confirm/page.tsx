/**
 * Connect Coach Confirmation Page
 * Shows coach information and asks for confirmation before connecting
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/auth";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";

interface CoachNameResponse {
  coachUsername: string;
}

function ConnectCoachConfirmPageContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coachCode, setCoachCode] = useState<string | null>(null);
  const [coachName, setCoachName] = useState<string | null>(null);
  const [coachProfilePic, setCoachProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Require authentication
  useRequireAuth();

  // Check if user is an athlete and redirect if not
  useEffect(() => {
    if (!loading && user && user.role?.toLowerCase() === "coach") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Fetch coach information
  useEffect(() => {
    const fetchCoachInfo = async () => {
      const code = searchParams.get("coachCode");
      if (!code) {
        setError("No coach code provided");
        setIsLoading(false);
        return;
      }

      setCoachCode(code);

      try {
        setIsLoading(true);
        setError(null);

        // Fetch coach name
        const coachNameResponse = await apiFetch<CoachNameResponse>(
          `/api/coachConnection/getCoachName?coachId=${encodeURIComponent(code)}`
        );
        const fetchedCoachName = coachNameResponse.coachUsername;
        setCoachName(fetchedCoachName);

        // Fetch coach profile picture
        try {
          const profilePicResponse = await apiFetch<string>(
            `/api/ProfilePIc?userName=${encodeURIComponent(fetchedCoachName)}`
          );
          setCoachProfilePic(profilePicResponse);
        } catch (picErr) {
          console.warn("Failed to fetch profile picture:", picErr);
          // Profile pic is optional, continue without it
        }
      } catch (err) {
        console.error("Failed to fetch coach information:", err);
        setError(err instanceof Error ? err.message : "Failed to load coach information. Please check the code and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchCoachInfo();
    }
  }, [searchParams, user, loading]);

  const handleConfirm = async () => {
    if (!coachCode || !user || !user.apiKey) return;

    try {
      setIsConnecting(true);
      setError(null);
      setSuccess(false);

      // Call API to connect with coach
      const token = getToken();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gooseapi.ddns.net";
      const response = await fetch(
        `${API_BASE_URL}/api/coachConnection/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            apiKey: user.apiKey,
            coachId: coachCode,
          }),
        }
      );

      if (response.status === 401) {
        setError("You cannot connect with the same coach twice.");
        setIsConnecting(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to connect with coach");
      }

      // Show success animation
      setSuccess(true);
      setIsConnecting(false);

      // Redirect to dashboard after showing success animation
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Failed to connect with coach:", err);
      setError(err instanceof Error ? err.message : "Failed to connect with coach. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleCancel = () => {
    router.push("/connect-coach");
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not an athlete (redirect will happen)
  if (!user || user.role?.toLowerCase() === "coach") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
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
                  // Fallback: hide image if it fails to load
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

        <div className="relative mx-auto max-w-3xl">
          {/* Page Title */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 lg:text-5xl">
              Confirm Connection
            </h1>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 px-2">
              Review the coach information before connecting
            </p>
          </div>

          {/* Confirmation Card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 lg:p-8">
            {success ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center transition-all duration-300 animate-[bounce_0.6s_ease-in-out]">
                    <svg
                      className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Connection Successful!
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-2">
                  You've been successfully connected with coach {coachName}. Redirecting to dashboard...
                </p>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center transition-all duration-300 animate-[bounce_0.6s_ease-in-out]">
                    <svg
                      className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Connection Failed
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-2">{error}</p>
                <button
                  onClick={handleCancel}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <>
                {/* Coach Information */}
                <div className="text-center mb-8">
                  {coachProfilePic && (
                    <div className="mb-6 flex justify-center">
                      <img
                        src={getProfilePicSrc(coachProfilePic) || ""}
                        alt={coachName || "Coach"}
                        referrerPolicy="no-referrer"
                        className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-blue-600 dark:border-blue-400 object-cover shadow-lg"
                        onError={(e) => {
                          // Fallback: hide image if it fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Are you sure you want to connect with coach{" "}
                    <span className="text-blue-600 dark:text-blue-400">{coachName || "..."}</span>?
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Once connected, you'll be able to receive structured workouts and training plans from this coach.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleCancel}
                    disabled={isConnecting}
                    className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isConnecting || !coachName}
                    className="flex-1 rounded-lg bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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
                        Connecting...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Back to Connect Coach */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/connect-coach"
              className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Enter Code
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ConnectCoachConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ConnectCoachConfirmPageContent />
    </Suspense>
  );
}

