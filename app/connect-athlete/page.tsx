/**
 * Connect Athlete Page
 * Displays the coach code for pairing with athletes
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";

interface CoachIdResponse {
  coachId: string;
}

export default function ConnectAthletePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [coachCode, setCoachCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Require authentication
  useRequireAuth();

  // Check if user is a coach and redirect if not
  useEffect(() => {
    if (!loading && user && user.role?.toLowerCase() !== "coach") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Fetch coach code
  useEffect(() => {
    const fetchCoachCode = async () => {
      if (!user || user.role?.toLowerCase() !== "coach") {
        return;
      }

      try {
        setIsLoadingCode(true);
        setError(null);
        const coachName = user.userName;
        const url = `/api/CoachConnection/getCoachId${coachName ? `?coachName=${encodeURIComponent(coachName)}` : ''}`;
        const response = await apiFetch<CoachIdResponse>(url);
        setCoachCode(response.coachId);
      } catch (err) {
        console.error("Failed to fetch coach code:", err);
        setError(err instanceof Error ? err.message : "Failed to load coach code");
      } finally {
        setIsLoadingCode(false);
      }
    };

    if (!loading && user) {
      fetchCoachCode();
    }
  }, [user, loading]);

  const handleCopy = async () => {
    if (!coachCode) return;

    try {
      await navigator.clipboard.writeText(coachCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async () => {
    if (!coachCode || !user) return;

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const shareLink = `${baseUrl}/connect-coach?coachCode=${encodeURIComponent(coachCode)}`;
      const shareMessage = `Coach ${user.userName} has Invited you to connect with them on GooseNet! Press this link to Pair: ${shareLink}`;

      // Check if it's a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       (typeof window !== 'undefined' && window.innerWidth <= 768);

      // Only use Web Share API on mobile devices
      if (isMobile && navigator.share) {
        try {
          await navigator.share({
            title: 'Connect with Coach on GooseNet',
            text: shareMessage,
            url: shareLink,
          });
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        } catch (shareErr) {
          // User cancelled or share failed, fall back to clipboard
          if ((shareErr as Error).name !== 'AbortError') {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
          }
        }
      } else {
        // On non-mobile devices, just copy the link
        await navigator.clipboard.writeText(shareLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to share/copy link:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading || isLoadingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not a coach (redirect will happen)
  if (!user || user.role?.toLowerCase() !== "coach") {
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
              Connect Athlete
            </h1>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 px-2">
              Share your coach code with athletes to pair with them
            </p>
          </div>

          {/* Coach Code Card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 lg:p-8">
            {error ? (
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Error Loading Coach Code
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Explanation */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        What is this code?
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Your coach code is a unique identifier that allows athletes to connect with you on GooseNet. 
                        Share this code with your athletes so they can pair their accounts with yours and start receiving 
                        structured workouts and training plans.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coach Code Display */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Coach Code
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 overflow-x-auto">
                      <code className="text-lg sm:text-xl lg:text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider break-all sm:break-normal">
                        {coachCode || "Loading..."}
                      </code>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={handleCopy}
                        disabled={!coachCode || copied}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {copied ? (
                          <>
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
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
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCopyLink}
                        disabled={!coachCode || linkCopied}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500/40 to-purple-500/40 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:from-pink-500/60 hover:to-purple-500/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border border-pink-500/20 dark:border-purple-500/20"
                      >
                        {linkCopied ? (
                          <>
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Link Copied!
                          </>
                        ) : (
                          <>
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
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                            Share Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    How to use your coach code:
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                    <li>Share your coach code with your athletes</li>
                    <li>Athletes will enter this code in their GooseNet account</li>
                    <li>Once paired, you can assign workouts and track their progress</li>
                  </ol>
                </div>
              </>
            )}
          </div>

          {/* Back to Dashboard */}
          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/dashboard"
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
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

