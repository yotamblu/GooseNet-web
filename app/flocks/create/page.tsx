/**
 * Create Flock Page
 * Form for coaches to create a new flock
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";
import { apiService } from "../../services/api";

export default function CreateFlockPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [flockName, setFlockName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showXAnimation, setShowXAnimation] = useState(false);

  // Require authentication
  useRequireAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flockName.trim()) {
      setError("Flock name is required");
      return;
    }

    if (!user || user.role?.toLowerCase() !== "coach" || !user.apiKey) {
      setError("You must be a coach to create a flock");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiService.createFlock(user.apiKey, flockName.trim());
      
      if (response.status === 200) {
        setSuccess(true);
        // Redirect to flocks page after a short delay
        setTimeout(() => {
          router.push("/flocks");
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to create flock");
      }
    } catch (err) {
      console.error("Failed to create flock:", err);
      
      // Check if error message indicates duplicate flock name
      const errorMessage = err instanceof Error ? err.message : "Failed to create flock. Please try again.";
      
      // Check for the exact error message from the API
      if (errorMessage === "This coach already has a flock with this name" || 
          errorMessage.includes("This coach already has a flock with this name")) {
        // Show X animation
        setShowXAnimation(true);
        // Reset the input field
        setFlockName("");
        setError(null);
        // Hide animation after 2 seconds
        setTimeout(() => {
          setShowXAnimation(false);
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
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

        <div className="relative mx-auto max-w-2xl">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Create New Flock
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Create a new group to organize your athletes
            </p>
          </div>

          {/* Form Card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Flock Created Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Redirecting to flocks page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {/* Flock Name Input */}
                <div className="relative">
                  <label
                    htmlFor="flockName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Flock Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="flockName"
                      value={flockName}
                      onChange={(e) => {
                        setFlockName(e.target.value);
                        setError(null);
                        setShowXAnimation(false);
                      }}
                      placeholder="Enter flock name"
                      className={`w-full rounded-lg border ${
                        showXAnimation 
                          ? "border-red-500 dark:border-red-500 animate-shake" 
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-colors`}
                      required
                      disabled={isSubmitting}
                      autoFocus
                    />
                    {/* X Animation Overlay */}
                    {showXAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="animate-x-popup">
                          <svg
                            className="h-12 w-12 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Choose a descriptive name for your flock (e.g., "Varsity Team", "Marathon Group")
                  </p>
                  {showXAnimation && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
                      This coach already has a flock with this name
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !flockName.trim()}
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
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
                        Create Flock
                      </>
                    )}
                  </button>
                  <Link
                    href="/flocks"
                    className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        @keyframes x-popup {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-x-popup {
          animation: x-popup 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}} />
    </div>
  );
}

