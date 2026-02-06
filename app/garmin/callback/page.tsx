/**
 * Garmin OAuth Callback Page
 * Handles the OAuth callback from Garmin and completes the connection
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";
import { setToken } from "../../../lib/auth";
import { apiService } from "../../services/api";

function GarminCallbackPageContent() {
  const { user, loading, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [success, setSuccess] = useState(false);

  // Don't use useRequireAuth here - we'll handle auth check manually
  // to allow redirect to login with returnUrl

  // Process OAuth callback
  useEffect(() => {
    const processCallback = async () => {
      // Wait for auth check to complete
      if (loading) {
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);
        setSuccess(false);

        // Extract parameters from URL
        const oauth_token = searchParams.get("oauth_token");
        const oauth_verifier = searchParams.get("oauth_verifier");
        const stateToken = searchParams.get("stateToken");
        const urlTheme = searchParams.get("theme");
        
        // Get OAuth params from URL (for mobile localStorage issues) or localStorage
        const urlTokenSecret = searchParams.get("token_secret");
        const urlApiKey = searchParams.get("apiKey");
        const urlTimestamp = searchParams.get("timestamp");

        // Apply theme if provided and not default
        if (urlTheme && urlTheme !== "light" && theme !== urlTheme) {
          setTheme(urlTheme);
        }

        if (!oauth_token || !oauth_verifier) {
          throw new Error("Missing OAuth parameters from Garmin");
        }

        // Get stored token_secret and apiKey - prefer URL params (for mobile) over localStorage
        const token_secret = urlTokenSecret || localStorage.getItem("garmin_token_secret");
        const apiKey = urlApiKey || localStorage.getItem("garmin_api_key");
        const tokenTimestamp = urlTimestamp || localStorage.getItem("garmin_token_timestamp");

        // Check if session is expired (using URL timestamp or localStorage timestamp)
        let sessionExpired = false;
        if (tokenTimestamp) {
          const age = Date.now() - parseInt(tokenTimestamp, 10);
          const maxAge = 10 * 60 * 1000; // 10 minutes
          if (age > maxAge) {
            sessionExpired = true;
          }
        }
        
        // If we got params from URL, also store them in localStorage for consistency
        if (urlTokenSecret && !localStorage.getItem("garmin_token_secret")) {
          localStorage.setItem("garmin_token_secret", urlTokenSecret);
        }
        if (urlApiKey && !localStorage.getItem("garmin_api_key")) {
          localStorage.setItem("garmin_api_key", urlApiKey);
        }
        if (urlTimestamp && !localStorage.getItem("garmin_token_timestamp")) {
          localStorage.setItem("garmin_token_timestamp", urlTimestamp);
        }

        // If session expired or user not authenticated, try to use stateToken to re-authenticate
        if ((sessionExpired || !user) && stateToken) {
          try {
            const jwtResponse = await apiService.getJwtFromStateToken<{ token: string } | { message: string }>(stateToken);
            
            if (jwtResponse.data && "token" in jwtResponse.data && jwtResponse.data.token) {
              // Store JWT token and refresh user
              setToken(jwtResponse.data.token);
              await refreshUser();
              // The useEffect will re-run when user changes, so exit here
              // and let the next run handle the authenticated user
              setIsProcessing(false);
              return;
            } else if (jwtResponse.data && "message" in jwtResponse.data) {
              throw new Error(jwtResponse.data.message || "State token expired or invalid");
            } else {
              throw new Error("Invalid response from state token endpoint");
            }
          } catch (stateTokenError) {
            // If state token fails, clear everything and throw error
            localStorage.removeItem("garmin_token_secret");
            localStorage.removeItem("garmin_api_key");
            localStorage.removeItem("garmin_token_timestamp");
            throw new Error(stateTokenError instanceof Error ? stateTokenError.message : "Failed to authenticate with state token");
          }
        }

        // Check if user is authenticated now (after potential re-auth)
        if (!user) {
          // If still not authenticated and no stateToken, redirect to login
          const returnUrl = `/garmin/callback?oauth_token=${encodeURIComponent(oauth_token)}&oauth_verifier=${encodeURIComponent(oauth_verifier)}${stateToken ? `&stateToken=${encodeURIComponent(stateToken)}` : ''}${urlTheme ? `&theme=${encodeURIComponent(urlTheme)}` : ''}`;
          router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        // Check if user is an athlete
        if (user.role?.toLowerCase() !== "athlete") {
          setIsProcessing(false);
          router.push("/dashboard");
          return;
        }

        // Use token_secret for OAuth completion (stateless flow)
        if (!token_secret) {
          throw new Error("OAuth session expired. Please try connecting again.");
        }

        // Get apiKey - prefer URL param, then user object, then localStorage
        const userApiKey = apiKey || user.apiKey;
        if (!userApiKey) {
          throw new Error("User API key not found. Please log in again.");
        }

        // Complete OAuth flow using stateless method with apiKey
        await apiService.getGarminAccessTokenStateless(
          oauth_token,
          oauth_verifier,
          token_secret,
          userApiKey
        );

        // Clear localStorage
        localStorage.removeItem("garmin_token_secret");
        localStorage.removeItem("garmin_api_key");
        localStorage.removeItem("garmin_token_timestamp");

        // Show success
        setSuccess(true);
        setIsProcessing(false);

        // Redirect to dashboard after showing success animation
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        // Create detailed error information
        const errorMessage = err instanceof Error ? err.message : "Failed to connect to Garmin. Please try again.";
        const errorStack = err instanceof Error ? err.stack : String(err);
        const errorDetailsObj = {
          message: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          searchParams: Object.fromEntries(searchParams.entries()),
          userAgent: navigator.userAgent,
          localStorage: {
            hasTokenSecret: !!localStorage.getItem("garmin_token_secret"),
            hasApiKey: !!localStorage.getItem("garmin_api_key"),
            hasTimestamp: !!localStorage.getItem("garmin_token_timestamp"),
          },
        };
        
        const errorDetailsString = JSON.stringify(errorDetailsObj, null, 2);
        
        // Log to console
        console.error("Failed to complete Garmin connection:", err);
        console.error("Error details:", errorDetailsObj);
        
        // Store error in localStorage for debugging (keep last 5 errors)
        try {
          const errorLog = JSON.parse(localStorage.getItem("garmin_error_log") || "[]");
          errorLog.unshift({
            ...errorDetailsObj,
            id: Date.now(),
          });
          // Keep only last 5 errors
          if (errorLog.length > 5) {
            errorLog.pop();
          }
          localStorage.setItem("garmin_error_log", JSON.stringify(errorLog));
        } catch (e) {
          console.error("Failed to save error to localStorage:", e);
        }
        
        setError(errorMessage);
        setErrorDetails(errorDetailsString);
        setIsProcessing(false);
        
        // Clear localStorage on error
        localStorage.removeItem("garmin_token_secret");
        localStorage.removeItem("garmin_api_key");
        localStorage.removeItem("garmin_token_timestamp");
      }
    };

    if (!loading) {
      processCallback();
    }
  }, [searchParams, user, loading, router, theme, setTheme, refreshUser]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Completing Garmin connection...</p>
        </div>
      </div>
    );
  }

  // Don't render if not an athlete (redirect will happen)
  if (!user || user.role?.toLowerCase() !== "athlete") {
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
          {/* Status Card */}
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
                  Garmin Connected Successfully!
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-2">
                  Your Garmin account has been connected. Redirecting to dashboard...
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
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-2 break-words">{error}</p>
                
                {/* Error Details Toggle */}
                {errorDetails && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowErrorDetails(!showErrorDetails)}
                      className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
                    >
                      {showErrorDetails ? "Hide" : "Show"} Error Details
                    </button>
                    {showErrorDetails && (
                      <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-left">
                        <pre className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words overflow-x-auto">
                          {errorDetails}
                        </pre>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(errorDetails).catch(() => {});
                            alert("Error details copied to clipboard!");
                          }}
                          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Copy to Clipboard
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      const errorLog = JSON.parse(localStorage.getItem("garmin_error_log") || "[]");
                      const logText = JSON.stringify(errorLog, null, 2);
                      navigator.clipboard.writeText(logText).catch(() => {});
                      alert("Error log copied to clipboard!");
                    }}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Copy Error Log
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function GarminCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <GarminCallbackPageContent />
    </Suspense>
  );
}

