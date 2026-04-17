/**
 * Strength Workout Detail Page
 * Displays detailed analysis of a strength workout with reviews
 */

"use client";

import Link from "next/link";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { apiService } from "../../services/api";
import { useAuth } from "../../../context/AuthContext";
import {
  AppShell,
  Badge,
  Button,
  Card,
  Label,
  SectionHeading,
  Skeleton,
  Spinner,
  StatTile,
  Textarea,
  fadeUp,
  stagger,
  inViewOnce,
} from "../../components/ui";

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
  const { user } = useAuth();
  const params = useParams();
  const workoutId = params?.id as string;
  const reduce = useReducedMotion();

  const isCoach = user?.role?.toLowerCase() === "coach";
  const isAthlete = user?.role?.toLowerCase() === "athlete";

  const backUrl = "/dashboard";

  const [workoutData, setWorkoutData] = useState<StrengthWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  const totals = useMemo(() => {
    if (!workoutData?.workoutDrills) return { drills: 0, sets: 0, reps: 0 };
    const drills = workoutData.workoutDrills.length;
    const sets = workoutData.workoutDrills.reduce((s, d) => s + (d.drillSets || 0), 0);
    const reps = workoutData.workoutDrills.reduce((s, d) => s + (d.drillSets || 0) * (d.drillReps || 0), 0);
    return { drills, sets, reps };
  }, [workoutData]);

  if (loading) {
    return (
      <AppShell title="Strength Workout" subtitle="Loading…" maxWidth="lg">
        <div className="space-y-6">
          <Card padding="lg" className="space-y-4">
            <Skeleton h={28} w="60%" />
            <Skeleton h={14} w="30%" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Skeleton h={96} />
              <Skeleton h={96} />
              <Skeleton h={96} />
            </div>
          </Card>
          <Card padding="md" className="space-y-3">
            <Skeleton h={14} w="80%" />
            <Skeleton h={14} w="70%" />
            <Skeleton h={14} w="60%" />
          </Card>
        </div>
      </AppShell>
    );
  }

  if (error && !workoutData) {
    return (
      <AppShell title="Workout unavailable" maxWidth="md">
        <Card padding="lg" className="text-center">
          <p className="text-rose-600 dark:text-rose-400 mb-4">{error}</p>
          <Link href={backUrl}>
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  if (!workoutData) {
    return null;
  }

  const reviews = workoutData.workoutReviews || {};
  const reviewEntries = Object.entries(reviews);

  return (
    <AppShell
      eyebrow={workoutData.workoutDate || undefined}
      title={workoutData.workoutName || "Strength Workout"}
      subtitle={workoutData.workoutDescription || undefined}
      actions={
        <Link href={backUrl}>
          <Button variant="ghost" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </span>
          </Button>
        </Link>
      }
      maxWidth="lg"
    >
      {/* Error */}
      {error && (
        <Card padding="sm" className="mb-6 border-rose-200 dark:border-rose-400/30 bg-rose-50 dark:bg-rose-500/5">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      )}

      {/* Success toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-2xl border border-teal-200 dark:border-teal-400/30 bg-teal-50 dark:bg-teal-500/10 p-4 flex items-center gap-2"
          >
            <svg className="h-5 w-5 text-teal-600 dark:text-teal-300 animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-200">Review saved successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <Card variant="glass" padding="lg" className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Badge variant="info" dot>
            Strength
          </Badge>
          {workoutData.coachName && (
            <Badge variant="neutral">Coach: {workoutData.coachName}</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Drills" value={totals.drills} accent="purple" />
          <StatTile label="Total Sets" value={totals.sets} accent="brand" />
          <StatTile label="Total Reps" value={totals.reps} accent="teal" />
        </div>
      </Card>

      {/* Drills */}
      <section className="mb-10">
        <SectionHeading title="Exercises" description="Each drill with its set × rep prescription" />
        {workoutData.workoutDrills && workoutData.workoutDrills.length > 0 ? (
          <motion.div
            variants={reduce ? undefined : stagger}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={inViewOnce}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {workoutData.workoutDrills.map((drill, idx) => (
              <motion.div key={idx} variants={reduce ? undefined : fadeUp}>
                <Card padding="md" interactive>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-300 font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {drill.drillName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{drill.drillSets}</span> sets
                        <span className="mx-1.5 text-gray-400">×</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{drill.drillReps}</span> reps
                      </p>
                    </div>
                  </div>

                  {/* Per-set grid — visual completion tracker (display-only, no logic changes) */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {Array.from({ length: Math.min(drill.drillSets, 20) }).map((_, setIdx) => (
                      <span
                        key={setIdx}
                        className="inline-flex items-center justify-center h-7 min-w-[2rem] px-2 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                      >
                        {setIdx + 1}×{drill.drillReps}
                      </span>
                    ))}
                    {drill.drillSets > 20 && (
                      <span className="inline-flex items-center justify-center h-7 px-2 rounded-lg text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        +{drill.drillSets - 20} more
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card padding="md">
            <p className="text-sm text-gray-500 dark:text-gray-400">No drills available.</p>
          </Card>
        )}
      </section>

      {/* Athletes (coach) */}
      {isCoach && workoutData.athleteNames && workoutData.athleteNames.length > 0 && (
        <section className="mb-10">
          <SectionHeading title="Athletes" description="Assigned to this session" />
          <Card padding="md">
            <div className="flex flex-wrap gap-2">
              {workoutData.athleteNames.map((athlete, index) => (
                <Badge key={index} variant="brand" size="md" dot>
                  {athlete}
                </Badge>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Reviews */}
      <section>
        <SectionHeading title="Reviews" description={isAthlete ? "Share how this session felt." : "Feedback from athletes."} />

        {isCoach ? (
          <div className="space-y-3">
            {reviewEntries.length > 0 ? (
              reviewEntries.map(([athleteName, review]) => (
                <Card key={athleteName} padding="md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{athleteName}</h3>
                    <Badge variant="outline" size="sm">
                      Difficulty: {review.difficultyLevel}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{review.reviewContent}</p>
                </Card>
              ))
            ) : (
              <Card padding="lg" className="text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-500/10 text-gray-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Review Pending</p>
              </Card>
            )}
          </div>
        ) : isAthlete ? (
          <div>
            {hasExistingReview && !isEditingReview ? (
              <Card padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Your Review</h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" size="sm">
                      Difficulty: {difficultyLevel}/10
                    </Badge>
                    <Button size="sm" variant="secondary" onClick={handleEditReview}>
                      Edit
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{reviewContent}</p>
              </Card>
            ) : (
              <Card padding="md" className="space-y-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {hasExistingReview ? "Edit Your Review" : "Write a Review"}
                </h3>

                <div>
                  <Label htmlFor="difficulty-range" className="mb-2 block">
                    Difficulty Level:{" "}
                    <span className="ml-1 font-semibold text-gray-900 dark:text-gray-100">
                      {difficultyLevel}/10
                    </span>
                  </Label>
                  <input
                    type="range"
                    id="difficulty-range"
                    min="1"
                    max="10"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
                  />
                  <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    <span>1 · Easy</span>
                    <span>10 · Crushed me</span>
                  </div>
                </div>

                <Textarea
                  label="Review Content"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts about this workout..."
                />

                <div className="flex items-center justify-end gap-2">
                  {hasExistingReview && (
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditingReview(false)}
                      disabled={isSubmittingReview}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="gradient"
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !reviewContent.trim()}
                    loading={isSubmittingReview}
                  >
                    {hasExistingReview ? "Save changes" : "Submit Review"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

export default function StrengthWorkoutDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f17]">
          <Spinner size="lg" />
        </div>
      }
    >
      <StrengthWorkoutDetailPageContent />
    </Suspense>
  );
}
