/**
 * Strength Workout Detail Page
 * Displays detailed analysis of a strength workout with reviews
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import ThemeToggle from "../../components/ThemeToggle";
import Footer from "../../components/Footer";
import { apiService } from "../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface WorkoutDrill {
  drillName: string;
  drillSets: number;
  drillReps: number;
}

interface WorkoutReview {
  athleteName: string;
  reviewContent: string;
  difficultyLevel: number;
}

interface StrengthWorkoutData {
  coachName: string;
  workoutName: string;
  workoutDescription: string;
  workoutDate: string;
  workoutDrills: WorkoutDrill[];
  athleteNames: string[];
  workoutReviews: Record<string, WorkoutReview>;
  workoutId: string | null;
}

function StrengthWorkoutDetailPageContent() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const workoutId = params?.id as string;
  
  const isCoach = user?.role?.toLowerCase() === "coach";
  const isAthlete = user?.role?.toLowerCase() === "athlete";
  
  // Build back URL - always go to dashboard
  const backUrl = "/dashboard";

  const [workoutData, setWorkoutData] = useState<StrengthWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Review state for athletes
  const [reviewContent, setReviewContent] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(5);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!workoutId) {
        setError("Missing workout ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getStrengthWorkout<StrengthWorkoutData>(workoutId);

        if (response.data) {
          setWorkoutData(response.data);
          
          // If athlete, check if they have an existing review
          if (isAthlete && user?.userName && response.data.workoutReviews) {
            const existingReview = response.data.workoutReviews[user.userName];
            if (existingReview) {
              setReviewContent(existingReview.reviewContent);
              setDifficultyLevel(existingReview.difficultyLevel);
              setHasExistingReview(true);
            }
          }
        } else {
          setError("Failed to load workout data");
        }
      } catch (err) {
        console.error("Failed to fetch strength workout:", err);
        setError(err instanceof Error ? err.message : "Failed to load workout data");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [workoutId, isAthlete, user?.userName]);

  const handleSubmitReview = async () => {
    if (!user?.apiKey || !workoutId || !user?.userName) {
      setError("Missing required information");
      return;
    }

    if (!reviewContent.trim()) {
      setError("Review content is required");
      return;
    }

    setIsSubmittingReview(true);
    setError(null);

    try {
      const review = {
        athleteName: user.userName,
        reviewContent: reviewContent.trim(),
        difficultyLevel: difficultyLevel,
      };

      const response = await apiService.submitStrengthWorkoutReview(
        user.apiKey,
        workoutId,
        review
      );

      if (response.status === 200) {
        setShowSuccessToast(true);
        setIsEditingReview(false);
        setHasExistingReview(true);
        
        // Refresh workout data to get updated reviews
        const refreshResponse = await apiService.getStrengthWorkout<StrengthWorkoutData>(workoutId);
        if (refreshResponse.data) {
          setWorkoutData(refreshResponse.data);
        }
        
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 3000);
      } else {
        throw new Error(response.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = () => {
    setIsEditingReview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (error && !workoutData) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
            <Link href={backUrl} className="flex items-center gap-2">
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
            </div>
          </nav>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!workoutData) {
    return null;
  }

  const reviews = workoutData.workoutReviews || {};
  const reviewEntries = Object.entries(reviews);
  const athleteReview = isAthlete && user?.userName ? reviews[user.userName] : null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href={backUrl} className="flex items-center gap-2">
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
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-12 sm:px-6 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Success Toast */}
          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center gap-2"
              >
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 dark:text-green-200">Review edited successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Workout Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {workoutData.workoutName}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workoutData.workoutDate}
                  {workoutData.coachName && ` • Coach: ${workoutData.coachName}`}
                </p>
              </div>
            </div>

            {workoutData.workoutDescription && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {workoutData.workoutDescription}
                </p>
              </div>
            )}
          </div>

          {/* Drills Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Drills
            </h2>
            <div className="space-y-3">
              {workoutData.workoutDrills && workoutData.workoutDrills.length > 0 ? (
                workoutData.workoutDrills.map((drill, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {drill.drillName}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {drill.drillSets} sets × {drill.drillReps} reps
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No drills available</p>
              )}
            </div>
          </div>

          {/* Athletes Section (for coaches) */}
          {isCoach && workoutData.athleteNames && workoutData.athleteNames.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Athletes
              </h2>
              <div className="flex flex-wrap gap-2">
                {workoutData.athleteNames.map((athlete, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium"
                  >
                    {athlete}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Reviews
            </h2>

            {isCoach ? (
              /* Coach View: Show all reviews or "Review Pending" */
              <div className="space-y-4">
                {reviewEntries.length > 0 ? (
                  reviewEntries.map(([athleteName, review]) => (
                    <div
                      key={athleteName}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {athleteName}
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Difficulty: {review.difficultyLevel}/10
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.reviewContent}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Review Pending</p>
                  </div>
                )}
              </div>
            ) : isAthlete ? (
              /* Athlete View: Show/edit own review */
              <div className="space-y-4">
                {hasExistingReview && !isEditingReview ? (
                  /* Display existing review with edit button */
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Your Review</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Difficulty: {difficultyLevel}/10
                        </span>
                        <button
                          onClick={handleEditReview}
                          className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{reviewContent}</p>
                  </div>
                ) : (
                  /* Review form (new or editing) */
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {hasExistingReview ? "Edit Your Review" : "Write a Review"}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Difficulty Level Slider */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Difficulty Level: {difficultyLevel}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={difficultyLevel}
                          onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>1</span>
                          <span>10</span>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Review Content
                        </label>
                        <textarea
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          rows={4}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                          placeholder="Share your thoughts about this workout..."
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || !reviewContent.trim()}
                        className="w-full px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmittingReview ? (
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
                            Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function StrengthWorkoutDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <StrengthWorkoutDetailPageContent />
    </Suspense>
  );
}

