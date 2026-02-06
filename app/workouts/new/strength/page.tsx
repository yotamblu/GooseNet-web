/**
 * Strength Workout Form Page
 * Create strength training workouts with drills, sets, and reps
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
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [drills, setDrills] = useState<Drill[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Add a drill
  const addDrill = () => {
    const newDrill: Drill = {
      id: generateId(),
      drillName: "",
      drillSets: 1,
      drillReps: 1,
    };
    setDrills([...drills, newDrill]);
  };

  // Update a drill
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

  // Remove a drill
  const removeDrill = (drillId: string) => {
    setDrills(drills.filter((drill) => drill.id !== drillId));
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

  // Build strength workout JSON
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

  // Format date as MM/DD/YYYY with leading zeroes
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
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

      const strengthJson = buildStrengthJson();
      const jsonBody = JSON.stringify(strengthJson);
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

      const endpoint = `/api/strength/addWorkout?apiKey=${encodeURIComponent(apiKey)}`;
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
              Create Strength Workout
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
                  placeholder="Leg Day, Push Day, Upper Body..."
                />
                {errors.workoutName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.workoutName}</p>
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
                  placeholder="Short explanation of the workout"
                />
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
            </div>

            {/* Drills Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Drills
                </h2>
                <button
                  type="button"
                  onClick={addDrill}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Add Drill
                </button>
              </div>

              {errors.drills && (
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errors.drills}</p>
              )}

              <div className="space-y-4">
                {drills.map((drill) => (
                  <div
                    key={drill.id}
                    className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Drill {drills.indexOf(drill) + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeDrill(drill.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Drill Name *
                        </label>
                        <input
                          type="text"
                          value={drill.drillName}
                          onChange={(e) => updateDrill(drill.id, { drillName: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                          placeholder="Bench Press, Squats, etc"
                        />
                        {errors[`drill-${drill.id}-name`] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors[`drill-${drill.id}-name`]}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Number of Sets *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={drill.drillSets || ""}
                            onChange={(e) => updateDrill(drill.id, { drillSets: parseInt(e.target.value) || 1 })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                            placeholder="3"
                          />
                          {errors[`drill-${drill.id}-sets`] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors[`drill-${drill.id}-sets`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reps Per Set *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={drill.drillReps || ""}
                            onChange={(e) => updateDrill(drill.id, { drillReps: parseInt(e.target.value) || 1 })}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                            placeholder="10"
                          />
                          {errors[`drill-${drill.id}-reps`] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors[`drill-${drill.id}-reps`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {drills.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No drills yet. Add a drill to get started.</p>
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

export default function StrengthWorkoutFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <StrengthWorkoutFormPageContent />
    </Suspense>
  );
}

