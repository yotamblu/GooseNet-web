"use client";

/**ad
 * Dashboard Page
 * Main dashboard after successful login
 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
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
      const currentTheme = theme || "light";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="cursor-pointer flex items-center gap-2">
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
                className="cursor-pointer hidden md:block h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                onError={(e) => {
                  // Fallback: hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Welcome to <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">GooseNet</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {user ? `Hello, ${user.userName}!` : "Your running training dashboard"}
            </p>
          </div>

          {/* Dashboard Options */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user?.role?.toLowerCase() === "coach" ? (
              <>
                {/* Athletes Card */}
                <Link href="/athletes" className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Athletes</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    View and manage your athletes
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    View Athletes
                  </button>
                </Link>

                {/* Flocks Card */}
                <Link href="/flocks" className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Flocks</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Manage your athlete groups and flocks
                  </p>
                  <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    View Flocks
                  </button>
                </Link>

                {/* Connect Athlete Card */}
                <Link href="/connect-athlete" className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Connect Athlete</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Add and connect with new athletes
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    Connect Athlete
                  </button>
                </Link>

                {/* Settings Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Change your profile data and settings in the dashboard
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    Open Settings
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Workouts Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Workouts</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    View and manage your structured running workouts
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    View Workouts
                  </button>
                </div>

                {/* Activities Card */}
                <Link href="/activities" className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Activities</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Track your performance and progress over time
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    View Activities
                  </button>
                </Link>

                {/* Planned Workouts Card */}
                <Link href="/planned-workouts" className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Planned Workouts</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    View your upcoming planned workouts
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    View Planned Workouts
                  </button>
                </Link>

                {/* Garmin Sync Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Garmin Sync</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Connect and sync with your Garmin account
                  </p>
                  <button 
                    onClick={handleGarminSync}
                    disabled={isCheckingConnection}
                    className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCheckingConnection ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
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
                        Checking...
                      </>
                    ) : (
                      "Connect Garmin"
                    )}
                  </button>
                  
                  {/* Toast Notification */}
                  <AnimatePresence>
                    {showToast && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-2 px-3 py-2 text-xs rounded-lg flex items-center gap-2 ${
                          toastType === "error"
                            ? "text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50"
                            : "text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50"
                        }`}
                      >
                        {toastType === "error" ? (
                          <svg
                            className="h-4 w-4 flex-shrink-0"
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
                        ) : (
                          <svg
                            className="h-4 w-4 flex-shrink-0"
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
                        )}
                        <span>{toastMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Coach Connection Card */}
                <Link href="/connect-coach" className="cursor-pointer relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Coach</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Connect with your coach and view assigned workouts
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    Connect with Coach
                  </button>
                </Link>

                {/* Sleep Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sleep</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Track your sleep patterns and recovery
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    View Sleep
                  </button>
                </div>

                {/* Settings Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    Change your profile data and settings in the dashboard
                  </p>
                  <button className="cursor-pointer w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-auto">
                    Open Settings
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

