/**
 * Create Flock Page
 * Form for coaches to create a new flock
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiService } from "../../services/api";
import {
  AppShell,
  Button,
  Card,
  CardDescription,
  CardTitle,
  Spinner,
  Textarea,
} from "../../components/ui";

const IconPlus = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconCheck = (
  <svg className="h-12 w-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function CreateFlockPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [flockName, setFlockName] = useState("");
  const [flockDescription, setFlockDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showXAnimation, setShowXAnimation] = useState(false);
  const reduce = useReducedMotion();

  // Require authentication
  useRequireAuth();

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
      <AppShell title="Create Flock" maxWidth="lg">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" variant="brand" />
        </div>
      </AppShell>
    );
  }

  if (user && user.role?.toLowerCase() !== "coach") {
    return (
      <AppShell title="Create Flock" maxWidth="md">
        <Card padding="lg" className="text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Access denied. This page is for coaches only.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to Dashboard
          </Link>
        </Card>
      </AppShell>
    );
  }

  const previewName = flockName.trim() || "Your flock name";
  const previewDescription = flockDescription.trim() || "Describe what this flock is for — training block, squad, camp, etc.";
  const firstChar = (flockName.trim() || "F").charAt(0).toUpperCase();

  return (
    <AppShell
      title="Create Flock"
      subtitle="Group athletes together to plan and assign workouts as one unit."
      gradientTitle
      maxWidth="lg"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <Card variant="default" padding="lg">
            {success ? (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="py-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10 ring-1 ring-inset ring-teal-500/30">
                  {IconCheck}
                </div>
                <h3 className="display-heading text-2xl font-bold tracking-tight text-gradient-brand">
                  Flock created!
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Redirecting you to your flocks…
                </p>
                <div className="mt-4 flex justify-center">
                  <Spinner size="sm" variant="brand" />
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100">
                    {error}
                  </div>
                )}

                {/* Flock name */}
                <div>
                  <label
                    htmlFor="flockName"
                    className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    Flock name
                    <span className="ml-0.5 text-rose-500" aria-hidden>*</span>
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
                      className={`w-full rounded-xl border bg-white px-3 h-10 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 dark:bg-gray-900/60 dark:text-gray-100 dark:placeholder:text-gray-500 ${
                        showXAnimation
                          ? "border-rose-500 animate-shake focus:ring-rose-500/30"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 dark:border-white/10 dark:focus:border-blue-400 dark:focus:ring-blue-400/30"
                      }`}
                      required
                      disabled={isSubmitting}
                      autoFocus
                    />
                    {/* X Animation Overlay */}
                    <AnimatePresence>
                      {showXAnimation && (
                        <motion.div
                          key="x-overlay"
                          initial={{ scale: 0, rotate: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.2, 1], rotate: [0, 180, 360], opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: reduce ? 0 : 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
                          className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                          <svg
                            className="h-10 w-10 text-rose-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Choose a descriptive name (e.g., &quot;Varsity Team&quot;, &quot;Marathon Group&quot;).
                  </p>
                  {showXAnimation && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                    >
                      This coach already has a flock with this name
                    </motion.p>
                  )}
                </div>

                {/* Description (UI-only preview) */}
                <Textarea
                  id="flockDescription"
                  label="Description (optional)"
                  placeholder="What's this flock for? Training block, squad, camp, etc."
                  value={flockDescription}
                  onChange={(e) => setFlockDescription(e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                  helperText="Visible only in your preview — can be added to the flock later."
                />

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Link href="/flocks" className="block w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full sm:w-auto"
                    loading={isSubmitting}
                    disabled={isSubmitting || !flockName.trim()}
                    iconLeft={!isSubmitting ? IconPlus : undefined}
                  >
                    {isSubmitting ? "Creating…" : "Create Flock"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              Live preview
            </div>
            <motion.div
              layout
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card variant="glass" padding="none" className="overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" aria-hidden />
                <div className="flex flex-col items-center px-5 pb-5 text-center">
                  <div className="relative -mt-10 mb-3">
                    <span
                      aria-hidden
                      className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 opacity-60 blur-md"
                    />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 dark:border-gray-900">
                      <motion.span
                        key={firstChar}
                        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                        animate={reduce ? undefined : { scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                        className="text-2xl font-bold text-white"
                      >
                        {firstChar}
                      </motion.span>
                    </div>
                  </div>
                  <CardTitle className="break-words text-lg">
                    <motion.span
                      key={previewName}
                      initial={reduce ? false : { opacity: 0, y: 4 }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {previewName}
                    </motion.span>
                  </CardTitle>
                  <CardDescription className="mt-2 break-words">
                    {previewDescription}
                  </CardDescription>
                  <div className="mt-4 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                    You&apos;ll be able to add athletes after creating.
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Keyframe for the shake animation (kept inline because it's only used here). */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-shake {
            animation: none;
          }
        }
      `}</style>
    </AppShell>
  );
}
