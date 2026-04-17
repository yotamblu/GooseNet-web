/**
 * Connect Coach Confirmation Page
 * Shows coach information and asks for confirmation before connecting.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/auth";
import { API_BASE_URL } from "../../../lib/api-config";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";
import {
  AppShell,
  Button,
  Card,
  Spinner,
  fadeUp,
  stagger,
  scaleIn,
  springSoft,
} from "../../components/ui";

interface CoachNameResponse {
  coachUsername: string;
}

function ConnectionHero({
  leftSrc,
  leftLabel,
  rightSrc,
  rightLabel,
  linked,
  triumphant,
}: {
  leftSrc?: string | null;
  leftLabel: string;
  rightSrc?: string | null;
  rightLabel: string;
  linked: boolean;
  triumphant: boolean;
}) {
  const reduce = useReducedMotion();
  const leftPic = leftSrc ? getProfilePicSrc(leftSrc) : null;
  const rightPic = rightSrc ? getProfilePicSrc(rightSrc) : null;

  return (
    <div className="relative mx-auto flex w-full max-w-md items-center justify-between px-2 py-6">
      {/* Athlete (user) */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="relative">
          <span
            aria-hidden
            className={`absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-blue-500/50 via-purple-500/40 to-teal-400/40 blur-md ${
              triumphant && !reduce ? "animate-pulse-glow" : ""
            }`}
          />
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[3px] border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {leftPic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={leftPic}
                alt={leftLabel}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              leftLabel.slice(0, 1).toUpperCase()
            )}
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{leftLabel}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-500">You</span>
      </div>

      {/* Connecting line */}
      <div className="relative flex-1 mx-2 sm:mx-4">
        <svg
          viewBox="0 0 220 60"
          preserveAspectRatio="none"
          className="h-14 w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          {/* Base dashed track */}
          <path
            d="M8 30 Q 110 0 212 30"
            fill="none"
            stroke="currentColor"
            className="text-gray-300 dark:text-white/10"
            strokeWidth={2}
            strokeDasharray="4 6"
            strokeLinecap="round"
          />
          {/* Animated link forming */}
          <motion.path
            d="M8 30 Q 110 0 212 30"
            fill="none"
            stroke="url(#linkGrad)"
            strokeWidth={triumphant ? 3.5 : 2.5}
            strokeLinecap="round"
            initial={reduce ? { pathLength: linked ? 1 : 0 } : { pathLength: 0 }}
            animate={{ pathLength: linked ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Heart / link icon in the middle when triumphant */}
          {triumphant && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springSoft}
            >
              <circle cx="110" cy="15" r="12" fill="url(#linkGrad)" />
              <path
                d="M105 15l3.5 3.5L115 12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </motion.g>
          )}
        </svg>
      </div>

      {/* Coach */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="relative">
          <span
            aria-hidden
            className={`absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-teal-400/50 via-blue-500/40 to-purple-500/40 blur-md ${
              triumphant && !reduce ? "animate-pulse-glow" : ""
            }`}
          />
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[3px] border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br from-teal-400 via-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {rightPic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rightPic}
                alt={rightLabel}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              rightLabel.slice(0, 1).toUpperCase()
            )}
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{rightLabel}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-500">Coach</span>
      </div>
    </div>
  );
}

function ConnectCoachConfirmPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coachCode, setCoachCode] = useState<string | null>(null);
  const [coachName, setCoachName] = useState<string | null>(null);
  const [coachProfilePic, setCoachProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useRequireAuth();

  useEffect(() => {
    if (!loading && user && user.role?.toLowerCase() === "coach") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCoachInfo = async () => {
      const code = searchParams.get("coachCode");
      if (!code) {
        setError("No coach code provided");
        setIsLoading(false);
        return;
      }

      setCoachCode(code);

      try {
        setIsLoading(true);
        setError(null);

        const coachNameResponse = await apiFetch<CoachNameResponse>(
          `/api/coachConnection/getCoachName?coachId=${encodeURIComponent(code)}`
        );
        const fetchedCoachName = coachNameResponse.coachUsername;
        setCoachName(fetchedCoachName);

        try {
          const profilePicResponse = await apiFetch<string>(
            `/api/ProfilePIc?userName=${encodeURIComponent(fetchedCoachName)}`
          );
          setCoachProfilePic(profilePicResponse);
        } catch (picErr) {
          console.warn("Failed to fetch profile picture:", picErr);
        }
      } catch (err) {
        console.error("Failed to fetch coach information:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load coach information. Please check the code and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchCoachInfo();
    }
  }, [searchParams, user, loading]);

  const handleConfirm = async () => {
    if (!coachCode || !user || !user.apiKey) return;

    try {
      setIsConnecting(true);
      setError(null);
      setSuccess(false);

      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/api/coachConnection/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            apiKey: user.apiKey,
            coachId: coachCode,
          }),
        }
      );

      if (response.status === 401) {
        setError("You cannot connect with the same coach twice.");
        setIsConnecting(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to connect with coach");
      }

      setSuccess(true);
      setIsConnecting(false);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Failed to connect with coach:", err);
      setError(err instanceof Error ? err.message : "Failed to connect with coach. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleCancel = () => {
    router.push("/connect-coach");
  };

  if (loading || isLoading) {
    return (
      <AppShell hidePageHeader>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading coach details…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user || user.role?.toLowerCase() === "coach") {
    return null;
  }

  return (
    <AppShell
      title="Confirm Connection"
      subtitle="Review the coach before pairing your account"
      gradientTitle
      maxWidth="md"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {success ? (
          <motion.div variants={scaleIn}>
            <Card variant="glass" padding="lg" className="text-center">
              <ConnectionHero
                leftSrc={user?.profilePicString}
                leftLabel={user?.userName || "You"}
                rightSrc={coachProfilePic}
                rightLabel={coachName || "Coach"}
                linked
                triumphant
              />
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springSoft}
                className="mx-auto mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15 text-teal-500 animate-pulse-glow"
              >
                <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                You&apos;re connected!
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                You&apos;re now paired with coach{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{coachName}</span>.
                Redirecting to your dashboard…
              </p>
            </Card>
          </motion.div>
        ) : error ? (
          <motion.div variants={fadeUp}>
            <Card variant="glass" padding="lg" className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Connection failed
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-md mx-auto">{error}</p>
              <Button variant="primary" onClick={handleCancel}>
                Go back
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Hero illustration */}
            <motion.div variants={fadeUp}>
              <Card variant="glass" padding="lg">
                <ConnectionHero
                  leftSrc={user?.profilePicString}
                  leftLabel={user?.userName || "You"}
                  rightSrc={coachProfilePic}
                  rightLabel={coachName || "Coach"}
                  linked={!!coachName}
                  triumphant={false}
                />

                {/* Coach details */}
                <div className="text-center mt-2 mb-6">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Pairing with
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Coach{" "}
                    <span className="text-gradient-brand">{coachName || "…"}</span>
                  </h2>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Once connected, this coach can assign structured workouts and training plans
                    straight to your Garmin. You can disconnect at any time from your settings.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={handleCancel}
                    disabled={isConnecting}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="gradient"
                    size="lg"
                    fullWidth
                    onClick={handleConfirm}
                    disabled={isConnecting || !coachName}
                    loading={isConnecting}
                    iconLeft={
                      !isConnecting ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ) : undefined
                    }
                  >
                    {isConnecting ? "Connecting…" : "Confirm connection"}
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="text-center">
              <Link
                href="/connect-coach"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Enter a different code
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>
    </AppShell>
  );
}

export default function ConnectCoachConfirmPage() {
  return (
    <Suspense
      fallback={
        <AppShell hidePageHeader>
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>
            </div>
          </div>
        </AppShell>
      }
    >
      <ConnectCoachConfirmPageContent />
    </Suspense>
  );
}
