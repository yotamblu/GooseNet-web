/**
 * Running Workout Form Page
 * Create structured running workouts with intervals, pace targets, and rest periods
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
  Label,
  SectionHeading,
  Select,
  Spinner,
  Textarea,
  fadeUp,
  stagger,
  inViewOnce,
} from "../../../components/ui";

type StepType = "run" | "rest";
type DurationType = "time" | "distance";
type DurationUnit = "seconds" | "minutes" | "meters" | "kilometers";
type PaceMode = "specific" | "range";

interface Step {
  id: string;
  type: StepType;
  durationType: DurationType;
  durationUnit?: DurationUnit;
  durationValue: number;
  paceMode?: PaceMode;
  paceMinPerKm?: number;
  paceMinPerKmLow?: number;
  paceMinPerKmHigh?: number;
  paceString?: string;
  paceStringLow?: string;
  paceStringHigh?: string;
}

interface IntervalBlock {
  id: string;
  repeatCount: number;
  steps: Step[];
}

function paceStringToMinutes(paceString: string): number | null {
  if (!paceString || !paceString.trim()) return null;
  const parts = paceString.trim().split(":");
  if (parts.length !== 2) return null;
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
    return null;
  }
  return minutes + seconds / 60;
}

function minutesToPaceString(minutes: number): string {
  if (isNaN(minutes) || minutes < 0) return "";
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function convertDurationToNormalized(value: number, durationType: DurationType, unit: DurationUnit): number {
  if (durationType === "time") {
    switch (unit) {
      case "seconds":
        return value;
      case "minutes":
        return value * 60;
      default:
        return value;
    }
  } else {
    switch (unit) {
      case "meters":
        return value;
      case "kilometers":
        return value * 1000;
      default:
        return value;
    }
  }
}

function paceMinPerKmToMetersPerSecond(minPerKm: number): number {
  return 1000 / (minPerKm * 60);
}

function RunningWorkoutFormPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [blocks, setBlocks] = useState<IntervalBlock[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addIntervalBlock = () => {
    const newInterval: IntervalBlock = {
      id: generateId(),
      repeatCount: 1,
      steps: [
        {
          id: generateId(),
          type: "run",
          durationType: "time",
          durationValue: 0,
          paceMode: "specific",
          paceMinPerKm: undefined,
        },
      ],
    };
    setBlocks([...blocks, newInterval]);
  };

  const updateIntervalBlock = (intervalId: string, updates: Partial<IntervalBlock>) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === intervalId) {
          return { ...block, ...updates };
        }
        return block;
      })
    );
  };

  const updateStepInInterval = (
    intervalId: string,
    stepId: string,
    updates: Partial<Step>
  ) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === intervalId) {
          return {
            ...block,
            steps: block.steps.map((step) =>
              step.id === stepId ? { ...step, ...updates } : step
            ),
          };
        }
        return block;
      })
    );
  };

  const addStepToInterval = (intervalId: string) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === intervalId) {
          const newStep: Step = {
            id: generateId(),
            type: "run",
            durationType: "time",
            durationUnit: "seconds",
            durationValue: 0,
            paceMode: "specific",
            paceMinPerKm: undefined,
          };
          return {
            ...block,
            steps: [...block.steps, newStep],
          };
        }
        return block;
      })
    );
  };

  const removeStepFromInterval = (intervalId: string, stepId: string) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === intervalId) {
          return {
            ...block,
            steps: block.steps.filter((step) => step.id !== stepId),
          };
        }
        return block;
      })
    );
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!workoutName.trim()) {
      newErrors.workoutName = "Workout name is required";
    }

    if (!workoutDate) {
      newErrors.workoutDate = "Workout date is required";
    }

    if (blocks.length === 0) {
      newErrors.blocks = "At least one workout block is required";
    }

    blocks.forEach((block) => {
      if (block.repeatCount < 1) {
        newErrors[`interval-${block.id}-repeat`] = "Repeat count must be at least 1";
      }
      if (block.steps.length === 0) {
        newErrors[`interval-${block.id}-steps`] = "Interval must have at least one step";
      }
      block.steps.forEach((step) => {
        if (step.durationValue <= 0) {
          newErrors[`interval-${block.id}-step-${step.id}-duration`] = "Duration must be greater than 0";
        }
        if (step.type === "run") {
          if (!step.paceMode) {
            newErrors[`interval-${block.id}-step-${step.id}-paceMode`] = "Pace mode is required for run steps";
          } else if (step.paceMode === "specific") {
            if (step.paceMinPerKm === undefined || step.paceMinPerKm <= 0) {
              newErrors[`interval-${block.id}-step-${step.id}-pace`] = "Pace must be greater than 0";
            }
          } else if (step.paceMode === "range") {
            if (step.paceMinPerKmLow === undefined || step.paceMinPerKmLow <= 0) {
              newErrors[`interval-${block.id}-step-${step.id}-paceLow`] = "Low pace must be greater than 0";
            }
            if (step.paceMinPerKmHigh === undefined || step.paceMinPerKmHigh <= 0) {
              newErrors[`interval-${block.id}-step-${step.id}-paceHigh`] = "High pace must be greater than 0";
            }
            if (
              step.paceMinPerKmLow !== undefined &&
              step.paceMinPerKmHigh !== undefined &&
              step.paceMinPerKmLow > step.paceMinPerKmHigh
            ) {
              newErrors[`interval-${block.id}-step-${step.id}-paceRange`] = "Low pace must be less than or equal to high pace";
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildGarminJson = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const garminSteps: any[] = [];

    blocks.forEach((block, blockIndex) => {
      const stepOrder = blockIndex + 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workoutSteps: any[] = block.steps.map((step, stepIndex) => {
        let targetValueLow = 0.0;
        let targetValueHigh = 0.0;
        const targetType = "PACE";
        let intensity = "REST";

        if (step.type === "run") {
          intensity = "INTERVAL";

          if (step.paceMode === "specific" && step.paceMinPerKm !== undefined) {
            const metersPerSecond = paceMinPerKmToMetersPerSecond(step.paceMinPerKm);
            targetValueLow = metersPerSecond;
            targetValueHigh = metersPerSecond;
          } else if (step.paceMode === "range" && step.paceMinPerKmLow !== undefined && step.paceMinPerKmHigh !== undefined) {
            targetValueLow = paceMinPerKmToMetersPerSecond(step.paceMinPerKmLow);
            targetValueHigh = paceMinPerKmToMetersPerSecond(step.paceMinPerKmHigh);
          }
        }

        return {
          targetType: targetType,
          stepOrder: stepIndex + 1,
          repeatValue: 0,
          type: "WorkoutStep",
          steps: null,
          description: step.type === "run" ? "run" : "rest",
          durationType: step.durationType === "time" ? "TIME" : "DISTANCE",
          durationValue: convertDurationToNormalized(
            step.durationValue,
            step.durationType,
            step.durationUnit || (step.durationType === "time" ? "seconds" : "meters")
          ),
          intensity: intensity,
          targetValueLow: targetValueLow,
          targetValueHigh: targetValueHigh,
          repeatType: null,
        };
      });

      const repeatStep = {
        targetType: "PACE",
        stepOrder: stepOrder,
        repeatValue: block.repeatCount,
        type: "WorkoutRepeatStep",
        steps: workoutSteps,
        description: "Run",
        durationType: null,
        durationValue: 0.0,
        intensity: "INTERVAL",
        targetValueLow: 0.0,
        targetValueHigh: 0.0,
        repeatType: "REPEAT_UNTIL_STEPS_CMPLT",
      };

      garminSteps.push(repeatStep);
    });

    return {
      sport: "RUNNING",
      steps: garminSteps,
      workoutName: workoutName,
      description: workoutDescription || "",
    };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

      const garminJson = buildGarminJson();
      const jsonBody = JSON.stringify(garminJson);
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

      const endpoint = `/api/addWorkout?apiKey=${encodeURIComponent(apiKey)}`;
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

  return (
    <AppShell
      eyebrow="New Workout"
      title="Create Running Workout"
      subtitle="Build structured intervals with pace targets and rest."
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
            placeholder="e.g., Tempo + Repeats"
            error={errors.workoutName}
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

          <Textarea
            label="Workout Description"
            id="workoutDescription"
            name="workoutDescription"
            value={workoutDescription}
            onChange={(e) => setWorkoutDescription(e.target.value)}
            rows={3}
            placeholder="Optional description of the workout"
          />
        </Card>

        {/* Workout structure */}
        <Card padding="md">
          <SectionHeading
            as="h3"
            title="Workout Structure"
            description="Each block is an interval that can repeat. Add run or rest steps inside."
            actions={
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={addIntervalBlock}
                iconLeft={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Interval
              </Button>
            }
          />

          {errors.blocks && (
            <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{errors.blocks}</p>
          )}

          <motion.div
            variants={reduce ? undefined : stagger}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={inViewOnce}
            className="space-y-4"
          >
            <AnimatePresence initial={false}>
              {blocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  layout
                  variants={reduce ? undefined : fadeUp}
                  initial={reduce ? undefined : { opacity: 0, y: 12 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="brand" dot>
                        Interval {index + 1}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        Repeats {block.repeatCount}×
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlockUp(index)}
                        disabled={index === 0}
                        aria-label="Move interval up"
                        className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlockDown(index)}
                        disabled={index === blocks.length - 1}
                        aria-label="Move interval down"
                        className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        aria-label="Delete interval"
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Label htmlFor={`repeat-${block.id}`} className="text-sm">
                      Repeat:
                    </Label>
                    <input
                      id={`repeat-${block.id}`}
                      name={`repeat-${block.id}`}
                      type="number"
                      min="1"
                      value={block.repeatCount}
                      onChange={(e) =>
                        updateIntervalBlock(block.id, { repeatCount: parseInt(e.target.value) || 1 })
                      }
                      className="w-24 h-10 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900/60 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    />
                    {errors[`interval-${block.id}-repeat`] && (
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        {errors[`interval-${block.id}-repeat`]}
                      </p>
                    )}
                  </div>

                  {errors[`interval-${block.id}-steps`] && (
                    <p className="mb-3 text-sm text-rose-600 dark:text-rose-400">
                      {errors[`interval-${block.id}-steps`]}
                    </p>
                  )}

                  <div className="space-y-3 pl-4 border-l-2 border-purple-300/60 dark:border-purple-400/40">
                    <AnimatePresence initial={false}>
                      {block.steps.map((step, stepIdx) => (
                        <motion.div
                          key={step.id}
                          layout
                          initial={reduce ? undefined : { opacity: 0, y: 8 }}
                          animate={reduce ? undefined : { opacity: 1, y: 0 }}
                          exit={reduce ? undefined : { opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 p-3 sm:p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={step.type === "run" ? "brand" : "success"}
                                size="sm"
                                dot
                              >
                                Step {stepIdx + 1}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {step.type === "run" ? "Run" : "Rest"}
                              </span>
                            </div>
                            {block.steps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeStepFromInterval(block.id, step.id)}
                                aria-label="Remove step"
                                className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <StepEditor
                            step={step}
                            onUpdate={(updates) => updateStepInInterval(block.id, step.id, updates)}
                            errors={errors}
                            prefix={`interval-${block.id}-step-${step.id}`}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={() => addStepToInterval(block.id)}
                      className="w-full h-10 px-3 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-300 border border-dashed border-purple-300/70 dark:border-purple-400/40 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                    >
                      + Add Step to Interval
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {blocks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] text-center py-10 px-4">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No intervals yet — add one to start building the session.
                </p>
              </div>
            )}
          </motion.div>
        </Card>

        {/* Sticky save bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-[#0b0f17]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3">
            <div className="min-w-0 flex-1 flex items-center gap-3">
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
              {!showSuccess && !errors.submit && blocks.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                  {blocks.length} interval{blocks.length === 1 ? "" : "s"} ·{" "}
                  {blocks.reduce((s, b) => s + b.steps.length * b.repeatCount, 0)} steps total
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/workouts/new" className="shrink-0">
                <Button variant="ghost" type="button" size="sm" className="sm:h-10 sm:text-sm sm:px-4">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="gradient"
                size="sm"
                className="sm:h-10 sm:text-sm sm:px-4 shrink-0"
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

interface StepEditorProps {
  step: Step;
  onUpdate: (updates: Partial<Step>) => void;
  errors: Record<string, string>;
  prefix: string;
}

function StepEditor({ step, onUpdate, errors, prefix }: StepEditorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Select
        label="Type"
        id={`${prefix}-type`}
        name={`${prefix}-type`}
        value={step.type}
        onChange={(e) => {
          const newType = e.target.value as StepType;
          if (newType === "run" && step.type === "rest") {
            onUpdate({ type: newType, paceMode: "specific" });
          } else if (newType === "rest") {
            onUpdate({
              type: newType,
              paceMode: undefined,
              paceMinPerKm: undefined,
              paceMinPerKmLow: undefined,
              paceMinPerKmHigh: undefined,
              paceString: undefined,
              paceStringLow: undefined,
              paceStringHigh: undefined,
            });
          } else {
            onUpdate({ type: newType });
          }
        }}
        options={[
          { label: "Run", value: "run" },
          { label: "Rest", value: "rest" },
        ]}
      />

      <Select
        label="Duration Type"
        id={`${prefix}-durationType`}
        name={`${prefix}-durationType`}
        value={step.durationType}
        onChange={(e) => {
          const newType = e.target.value as DurationType;
          const defaultUnit = newType === "time" ? "seconds" : "meters";
          onUpdate({
            durationType: newType,
            durationUnit: defaultUnit,
            durationValue: 0,
          });
        }}
        options={[
          { label: "Time", value: "time" },
          { label: "Distance", value: "distance" },
        ]}
      />

      <Select
        label="Duration Unit"
        required
        id={`${prefix}-durationUnit`}
        name={`${prefix}-durationUnit`}
        value={step.durationUnit || (step.durationType === "time" ? "seconds" : "meters")}
        onChange={(e) => {
          const newUnit = e.target.value as DurationUnit;
          onUpdate({
            durationUnit: newUnit,
            durationValue: 0,
          });
        }}
        options={
          step.durationType === "time"
            ? [
                { label: "Seconds", value: "seconds" },
                { label: "Minutes", value: "minutes" },
              ]
            : [
                { label: "Meters", value: "meters" },
                { label: "Kilometers", value: "kilometers" },
              ]
        }
      />

      <Input
        label="Duration Value"
        required
        id={`${prefix}-duration`}
        name={`${prefix}-duration`}
        type="number"
        min="0"
        step="0.1"
        value={step.durationValue || ""}
        onChange={(e) => onUpdate({ durationValue: parseFloat(e.target.value) || 0 })}
        placeholder={
          step.durationType === "time"
            ? step.durationUnit === "seconds"
              ? "e.g., 300"
              : "e.g., 5"
            : step.durationUnit === "meters"
              ? "e.g., 1000"
              : "e.g., 1"
        }
        error={errors[`${prefix}-duration`]}
      />

      {step.type === "run" && (
        <>
          <Select
            label="Pace Target Mode"
            required
            id={`${prefix}-paceMode`}
            name={`${prefix}-paceMode`}
            value={step.paceMode || "specific"}
            onChange={(e) => {
              const newMode = e.target.value as PaceMode;
              if (newMode === "specific") {
                onUpdate({
                  paceMode: newMode,
                  paceMinPerKmLow: undefined,
                  paceMinPerKmHigh: undefined,
                  paceMinPerKm: undefined,
                  paceStringLow: undefined,
                  paceStringHigh: undefined,
                  paceString: undefined,
                });
              } else {
                onUpdate({
                  paceMode: newMode,
                  paceMinPerKm: undefined,
                  paceString: undefined,
                });
              }
            }}
            options={[
              { label: "Specific Pace", value: "specific" },
              { label: "Pace Range", value: "range" },
            ]}
            error={errors[`${prefix}-paceMode`]}
            className="sm:col-span-2"
          />

          {step.paceMode === "specific" && (
            <div className="sm:col-span-2">
              <Input
                label="Target Pace (min/km)"
                required
                id={`${prefix}-pace`}
                name={`${prefix}-pace`}
                type="text"
                value={step.paceString || (step.paceMinPerKm ? minutesToPaceString(step.paceMinPerKm) : "")}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const minutes = paceStringToMinutes(inputValue);
                  onUpdate({
                    paceString: inputValue,
                    paceMinPerKm: minutes !== null ? minutes : undefined,
                  });
                }}
                placeholder="e.g., 4:30"
                pattern="[0-9]+:[0-5][0-9]"
                helperText="Format mm:ss"
                error={errors[`${prefix}-pace`]}
              />
            </div>
          )}

          {step.paceMode === "range" && (
            <>
              <Input
                label="Pace Low (min/km)"
                required
                id={`${prefix}-paceLow`}
                name={`${prefix}-paceLow`}
                type="text"
                value={step.paceStringLow || (step.paceMinPerKmLow ? minutesToPaceString(step.paceMinPerKmLow) : "")}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const minutes = paceStringToMinutes(inputValue);
                  onUpdate({
                    paceStringLow: inputValue,
                    paceMinPerKmLow: minutes !== null ? minutes : undefined,
                  });
                }}
                placeholder="e.g., 4:00"
                pattern="[0-9]+:[0-5][0-9]"
                helperText="Format mm:ss"
                error={errors[`${prefix}-paceLow`]}
              />
              <Input
                label="Pace High (min/km)"
                required
                id={`${prefix}-paceHigh`}
                name={`${prefix}-paceHigh`}
                type="text"
                value={step.paceStringHigh || (step.paceMinPerKmHigh ? minutesToPaceString(step.paceMinPerKmHigh) : "")}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const minutes = paceStringToMinutes(inputValue);
                  onUpdate({
                    paceStringHigh: inputValue,
                    paceMinPerKmHigh: minutes !== null ? minutes : undefined,
                  });
                }}
                placeholder="e.g., 5:00"
                pattern="[0-9]+:[0-5][0-9]"
                helperText="Format mm:ss"
                error={errors[`${prefix}-paceHigh`] || errors[`${prefix}-paceRange`]}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function RunningWorkoutFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f17]">
          <Spinner size="lg" />
        </div>
      }
    >
      <RunningWorkoutFormPageContent />
    </Suspense>
  );
}
