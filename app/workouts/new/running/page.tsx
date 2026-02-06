/**
 * Running Workout Form Page
 * Create structured running workouts with intervals, pace targets, and rest periods
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../../../components/ThemeToggle";
import Footer from "../../../components/Footer";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

// Type definitions
type StepType = "run" | "rest";
type DurationType = "time" | "distance";
type DurationUnit = "seconds" | "minutes" | "meters" | "kilometers";
type PaceMode = "specific" | "range";

interface Step {
  id: string;
  type: StepType;
  durationType: DurationType;
  durationUnit?: DurationUnit; // unit for duration input
  durationValue: number; // stored in the selected unit
  paceMode?: PaceMode; // only for run steps
  paceMinPerKm?: number; // only for run steps with specific pace, stored as decimal minutes per km
  paceMinPerKmLow?: number; // only for run steps with pace range, stored as decimal minutes per km
  paceMinPerKmHigh?: number; // only for run steps with pace range, stored as decimal minutes per km
  paceString?: string; // UI display value for specific pace (mm:ss format)
  paceStringLow?: string; // UI display value for pace range low (mm:ss format)
  paceStringHigh?: string; // UI display value for pace range high (mm:ss format)
}

interface IntervalBlock {
  id: string;
  repeatCount: number;
  steps: Step[];
}

// Helper function to convert mm:ss string to decimal minutes
function paceStringToMinutes(paceString: string): number | null {
  if (!paceString || !paceString.trim()) return null;
  
  // Parse mm:ss format
  const parts = paceString.trim().split(':');
  if (parts.length !== 2) return null;
  
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  
  if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
    return null;
  }
  
  return minutes + seconds / 60;
}

// Helper function to convert decimal minutes to mm:ss string
function minutesToPaceString(minutes: number): string {
  if (isNaN(minutes) || minutes < 0) return "";
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to convert duration to normalized units (seconds for time, meters for distance)
function convertDurationToNormalized(value: number, durationType: DurationType, unit: DurationUnit): number {
  if (durationType === "time") {
    // Convert to seconds
    switch (unit) {
      case "seconds":
        return value;
      case "minutes":
        return value * 60;
      default:
        return value;
    }
  } else {
    // Convert to meters
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

// Helper function to convert min/km to meters per second (for Garmin)
function paceMinPerKmToMetersPerSecond(minPerKm: number): number {
  // min/km -> seconds per km: minPerKm * 60
  // m/s = distance (1000m) / time (seconds) = 1000 / (minPerKm * 60)
  return 1000 / (minPerKm * 60);
}

function RunningWorkoutFormPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [blocks, setBlocks] = useState<IntervalBlock[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Add an interval block
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

  // Update an interval block
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

  // Update a step within an interval
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

  // Add step to interval
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

  // Remove step from interval
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

  // Delete a block
  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  // Move block up
  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
  };

  // Move block down
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // Validate form
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

  // Build Garmin-compatible JSON
  const buildGarminJson = () => {
    const garminSteps: any[] = [];

    blocks.forEach((block, blockIndex) => {
      const stepOrder = blockIndex + 1;
      
      // Build WorkoutStep objects for each step in the interval
      const workoutSteps: any[] = block.steps.map((step, stepIndex) => {
        let targetValueLow = 0.0;
        let targetValueHigh = 0.0;
        let targetType = "PACE"; // Use "PACE" for all steps
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
        // For rest steps, targetType is "PACE" with targetValueLow and targetValueHigh both 0.0

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

      // Create WorkoutRepeatStep
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

  // Format date as yyyy-MM-dd
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // Get athlete name and image from URL params, or flock name
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

      // Add apiKey as query parameter
      const apiKey = user?.apiKey || "";
      if (!apiKey) {
        throw new Error("API key is required. Please log in again.");
      }

      const endpoint = `/api/addWorkout?apiKey=${encodeURIComponent(apiKey)}`;
      const response = await apiService.post(endpoint, requestBody);

      if (response.status === 200) {
        setShowSuccess(true);
        // Reset form after a delay and redirect
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/workouts/new" className="cursor-pointer flex items-center gap-2">
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
              href="/workouts/new"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Workout Types
            </Link>
          </div>

          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Create Running Workout
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top-level Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workout Name *
                </label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  placeholder="e.g., Tempo + Repeats"
                />
                {errors.workoutName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.workoutName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workout Date *
                </label>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                />
                {errors.workoutDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.workoutDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workout Description
                </label>
                <textarea
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  placeholder="Optional description of the workout"
                />
              </div>
            </div>

            {/* Workout Blocks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Workout Structure
                </h2>
                <button
                  type="button"
                  onClick={addIntervalBlock}
                  className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Add Interval
                </button>
              </div>

              {errors.blocks && (
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errors.blocks}</p>
              )}

              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-semibold text-white bg-purple-600 rounded">
                            INTERVAL
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Repeat {block.repeatCount} time{block.repeatCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveBlockUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlockDown(index)}
                            disabled={index === blocks.length - 1}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBlock(block.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Repeat:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={block.repeatCount}
                          onChange={(e) =>
                            updateIntervalBlock(block.id, { repeatCount: parseInt(e.target.value) || 1 })
                          }
                          className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                        />
                        {errors[`interval-${block.id}-repeat`] && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {errors[`interval-${block.id}-repeat`]}
                          </p>
                        )}
                      </div>

                      {errors[`interval-${block.id}-steps`] && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors[`interval-${block.id}-steps`]}
                        </p>
                      )}

                      <div className="space-y-3 pl-4 border-l-2 border-purple-300 dark:border-purple-700">
                        {block.steps.map((step) => (
                          <div
                            key={step.id}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                Step {block.steps.indexOf(step) + 1}
                              </span>
                              {block.steps.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeStepFromInterval(block.id, step.id)}
                                  className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
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
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addStepToInterval(block.id)}
                          className="w-full px-3 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          + Add Step to Interval
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {blocks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No intervals yet. Add an interval to get started.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-end gap-4">
              {errors.submit && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              )}
              {showSuccess && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg
                    className="h-5 w-5 animate-check"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-semibold">Workout planned successfully!</span>
                </div>
              )}
              <div className="flex gap-4">
                <Link
                  href="/workouts/new"
                  className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || showSuccess}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
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
                      Creating...
                    </>
                  ) : (
                    "Create Workout"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Step Editor Component
interface StepEditorProps {
  step: Step;
  onUpdate: (updates: Partial<Step>) => void;
  errors: Record<string, string>;
  prefix: string;
}

function StepEditor({ step, onUpdate, errors, prefix }: StepEditorProps) {
  return (
    <div className="space-y-3">
      {/* Step Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <select
          value={step.type}
          onChange={(e) => {
            const newType = e.target.value as StepType;
            if (newType === "run" && step.type === "rest") {
              // When changing from rest to run, set default pace mode
              onUpdate({ type: newType, paceMode: "specific" });
            } else if (newType === "rest") {
              // When changing to rest, clear pace-related fields
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
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
        >
          <option value="run">Run</option>
          <option value="rest">Rest</option>
        </select>
      </div>

      {/* Duration Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Duration Type
        </label>
        <select
          value={step.durationType}
          onChange={(e) => {
            const newType = e.target.value as DurationType;
            // Set default unit when switching duration type
            const defaultUnit = newType === "time" ? "seconds" : "meters";
            onUpdate({
              durationType: newType,
              durationUnit: defaultUnit,
              durationValue: 0, // Reset value when switching type
            });
          }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
        >
          <option value="time">Time</option>
          <option value="distance">Distance</option>
        </select>
      </div>

      {/* Duration Unit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Duration Unit *
        </label>
        <select
          value={step.durationUnit || (step.durationType === "time" ? "seconds" : "meters")}
          onChange={(e) => {
            const newUnit = e.target.value as DurationUnit;
            // Reset value when switching unit to avoid confusion
            onUpdate({
              durationUnit: newUnit,
              durationValue: 0,
            });
          }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
        >
          {step.durationType === "time" ? (
            <>
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
            </>
          ) : (
            <>
              <option value="meters">Meters</option>
              <option value="kilometers">Kilometers</option>
            </>
          )}
        </select>
      </div>

      {/* Duration Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Duration Value *
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={step.durationValue || ""}
          onChange={(e) => onUpdate({ durationValue: parseFloat(e.target.value) || 0 })}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
          placeholder={
            step.durationType === "time"
              ? step.durationUnit === "seconds"
                ? "e.g., 300"
                : "e.g., 5"
              : step.durationUnit === "meters"
              ? "e.g., 1000"
              : "e.g., 1"
          }
        />
        {errors[`${prefix}-duration`] && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`${prefix}-duration`]}</p>
        )}
      </div>

      {/* Pace (only for run steps) */}
      {step.type === "run" && (
        <div className="space-y-3">
          {/* Pace Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pace Target Mode *
            </label>
            <select
              value={step.paceMode || "specific"}
              onChange={(e) => {
                const newMode = e.target.value as PaceMode;
                // Clear pace values when switching modes
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
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
            >
              <option value="specific">Specific Pace</option>
              <option value="range">Pace Range</option>
            </select>
            {errors[`${prefix}-paceMode`] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`${prefix}-paceMode`]}</p>
            )}
          </div>

          {/* Specific Pace Input */}
          {step.paceMode === "specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Pace (min/km) * <span className="text-gray-500 dark:text-gray-400 text-xs">(mm:ss)</span>
              </label>
              <input
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                placeholder="e.g., 4:30"
                pattern="[0-9]+:[0-5][0-9]"
              />
              {errors[`${prefix}-pace`] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`${prefix}-pace`]}</p>
              )}
            </div>
          )}

          {/* Pace Range Inputs */}
          {step.paceMode === "range" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pace Low (min/km) * <span className="text-gray-500 dark:text-gray-400 text-xs">(mm:ss)</span>
                </label>
                <input
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
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  placeholder="e.g., 4:00"
                  pattern="[0-9]+:[0-5][0-9]"
                />
                {errors[`${prefix}-paceLow`] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[`${prefix}-paceLow`]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pace High (min/km) * <span className="text-gray-500 dark:text-gray-400 text-xs">(mm:ss)</span>
                </label>
                <input
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
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                  placeholder="e.g., 5:00"
                  pattern="[0-9]+:[0-5][0-9]"
                />
                {errors[`${prefix}-paceHigh`] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[`${prefix}-paceHigh`]}
                  </p>
                )}
                {errors[`${prefix}-paceRange`] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[`${prefix}-paceRange`]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RunningWorkoutFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <RunningWorkoutFormPageContent />
    </Suspense>
  );
}

