/**
 * Strength Workout Form Page
 * Create strength training workouts with drills, sets, and reps
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import {
  AppShell,
  Badge,
  Button,
  Card,
  Input,
  SectionHeading,
  Spinner,
  Textarea,
  fadeUp,
  stagger,
  inViewOnce,
} from "../../../components/ui";

interface Drill {
  id: string;
  drillName: string;
  drillSets: number;
  drillReps: number;
}

function StrengthWorkoutFormPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [drills, setDrills] = useState<Drill[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addDrill = () => {
    const newDrill: Drill = {
      id: generateId(),
      drillName: "",
      drillSets: 1,
      drillReps: 1,
    };
    setDrills([...drills, newDrill]);
  };

  const updateDrill = (drillId: string, updates: Partial<Drill>) => {
    setDrills(
      drills.map((drill) => {
        if (drill.id === drillId) {
          return { ...drill, ...updates };
        }
        return drill;
      })
    );
  };

  const removeDrill = (drillId: string) => {
    setDrills(drills.filter((drill) => drill.id !== drillId));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!workoutName.trim()) {
      newErrors.workoutName = "Workout name is required";
    }

    if (!workoutDate) {
      newErrors.workoutDate = "Workout date is required";
    }

    if (drills.length === 0) {
      newErrors.drills = "At least one drill is required";
    }

    drills.forEach((drill) => {
      if (!drill.drillName.trim()) {
        newErrors[`drill-${drill.id}-name`] = "Drill name is required";
      }
      if (drill.drillSets < 1) {
        newErrors[`drill-${drill.id}-sets`] = "Number of sets must be at least 1";
      }
      if (drill.drillReps < 1) {
        newErrors[`drill-${drill.id}-reps`] = "Reps per set must be at least 1";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildStrengthJson = () => {
    return {
      WorkoutName: workoutName,
      WorkoutDescription: workoutDescription || "",
      WorkoutDate: formatDate(workoutDate),
      WorkoutDrills: drills.map((drill) => ({
        DrillName: drill.drillName,
        DrillSets: drill.drillSets,
        DrillReps: drill.drillReps,
      })),
    };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      const athleteName = searchParams?.get("athlete") || "";
      const athleteImage = searchParams?.get("image") || "";
      const flockName = searchParams?.get("flock") || "";

      const isFlock = !!flockName;
      const targetName = isFlock ? flockName : athleteName;

      if (!targetName) {
        throw new Error(isFlock ? "Flock name is required" : "Athlete name is required");
      }

      const strengthJson = buildStrengthJson();
      const jsonBody = JSON.stringify(strengthJson);
      const formattedDate = formatDate(workoutDate);

      const requestBody = {
        targetName: targetName,
        isFlock: isFlock,
        jsonBody: jsonBody,
        date: formattedDate,
      };

      const apiKey = user?.apiKey || "";
      if (!apiKey) {
        throw new Error("API key is required. Please log in again.");
      }

      const endpoint = `/api/strength/addWorkout?apiKey=${encodeURIComponent(apiKey)}`;
      const response = await apiService.post(endpoint, requestBody);

      if (response.status === 200) {
        setShowSuccess(true);
        setTimeout(() => {
          if (isFlock) {
            router.push(`/flocks/manage/${encodeURIComponent(flockName)}`);
          } else {
            const athleteUrl = athleteImage
              ? `/athlete/${encodeURIComponent(athleteName)}?image=${encodeURIComponent(athleteImage)}`
              : `/athlete/${encodeURIComponent(athleteName)}`;
            router.push(athleteUrl);
          }
        }, 2000);
      } else {
        throw new Error(`Failed to create workout: ${response.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to create workout:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create workout. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSets = drills.reduce((s, d) => s + (d.drillSets || 0), 0);

  return (
    <AppShell
      eyebrow="New Workout"
      title="Create Strength Workout"
      subtitle="Stack drills with sets and reps."
      gradientTitle
      maxWidth="lg"
      hideFooter
    >
      <div className="mb-6">
        <Link
          href="/workouts/new"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workout Types
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Top-level fields */}
        <Card padding="md" className="space-y-5">
          <Input
            label="Workout Name"
            id="workoutName"
            name="workoutName"
            type="text"
            required
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Leg Day, Push Day, Upper Body..."
            error={errors.workoutName}
          />

          <Textarea
            label="Workout Description"
            id="workoutDescription"
            name="workoutDescription"
            value={workoutDescription}
            onChange={(e) => setWorkoutDescription(e.target.value)}
            rows={3}
            placeholder="Short explanation of the workout"
          />

          <Input
            label="Workout Date"
            id="workoutDate"
            name="workoutDate"
            type="date"
            required
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            error={errors.workoutDate}
          />
        </Card>

        {/* Drills */}
        <Card padding="md">
          <SectionHeading
            as="h3"
            title="Drills"
            description="Add exercises with sets and reps."
            actions={
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={addDrill}
                iconLeft={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Drill
              </Button>
            }
          />

          {errors.drills && (
            <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{errors.drills}</p>
          )}

          <motion.div
            variants={reduce ? undefined : stagger}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={inViewOnce}
            className="space-y-4"
          >
            <AnimatePresence initial={false}>
              {drills.map((drill, idx) => (
                <motion.div
                  key={drill.id}
                  layout
                  variants={reduce ? undefined : fadeUp}
                  initial={reduce ? undefined : { opacity: 0, y: 12 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" dot>
                        Drill {idx + 1}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDrill(drill.id)}
                      aria-label="Remove drill"
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Drill Name"
                      required
                      id={`drill-${drill.id}-name`}
                      name={`drill-${drill.id}-name`}
                      type="text"
                      value={drill.drillName}
                      onChange={(e) => updateDrill(drill.id, { drillName: e.target.value })}
                      placeholder="Bench Press, Squats, etc"
                      error={errors[`drill-${drill.id}-name`]}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Number of Sets"
                        required
                        id={`drill-${drill.id}-sets`}
                        name={`drill-${drill.id}-sets`}
                        type="number"
                        min="1"
                        value={drill.drillSets || ""}
                        onChange={(e) => updateDrill(drill.id, { drillSets: parseInt(e.target.value) || 1 })}
                        placeholder="3"
                        error={errors[`drill-${drill.id}-sets`]}
                      />
                      <Input
                        label="Reps Per Set"
                        required
                        id={`drill-${drill.id}-reps`}
                        name={`drill-${drill.id}-reps`}
                        type="number"
                        min="1"
                        value={drill.drillReps || ""}
                        onChange={(e) => updateDrill(drill.id, { drillReps: parseInt(e.target.value) || 1 })}
                        placeholder="10"
                        error={errors[`drill-${drill.id}-reps`]}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {drills.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] text-center py-10 px-4">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No drills yet — add one to start building the session.
                </p>
              </div>
            )}
          </motion.div>
        </Card>

        {/* Sticky save bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-[#0b0f17]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
            <div className="min-w-0 flex items-center gap-3">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex items-center gap-2 text-teal-600 dark:text-teal-300"
                  >
                    <svg
                      className="h-5 w-5 animate-check"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-semibold">Workout planned!</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {!showSuccess && errors.submit && (
                <span className="text-sm text-rose-600 dark:text-rose-400 truncate">{errors.submit}</span>
              )}
              {!showSuccess && !errors.submit && drills.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {drills.length} drill{drills.length === 1 ? "" : "s"} · {totalSets} set
                  {totalSets === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/workouts/new">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting || showSuccess}
                loading={isSubmitting}
              >
                {showSuccess ? "Saved" : "Create Workout"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

export default function StrengthWorkoutFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f17]">
          <Spinner size="lg" />
        </div>
      }
    >
      <StrengthWorkoutFormPageContent />
    </Suspense>
  );
}
