/**
 * Connect Athlete Page
 * Displays the coach code for pairing with athletes.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { apiFetch } from "../../lib/api";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import {
  AppShell,
  Button,
  Card,
  Spinner,
  fadeUp,
  stagger,
  springSoft,
  transitionQuick,
} from "../components/ui";

interface CoachIdResponse {
  coachId: string;
}

function AvatarLink({
  leftSrc,
  leftLabel,
  rightLabel,
  active,
}: {
  leftSrc?: string | null;
  leftLabel: string;
  rightLabel: string;
  active: boolean;
}) {
  const reduce = useReducedMotion();
  const leftPic = leftSrc ? getProfilePicSrc(leftSrc) : null;

  return (
    <div className="relative mx-auto flex w-full max-w-sm items-center justify-between px-2 py-6">
      {/* LEFT avatar (coach / you) */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-blue-500/50 via-purple-500/40 to-teal-400/40 blur-md"
          />
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
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
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{leftLabel}</span>
      </div>

      {/* DASHED CONNECTING LINE */}
      <div className="relative flex-1 mx-3 sm:mx-4">
        <svg
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          className="h-10 w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="bondGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          <motion.path
            d="M5 20 Q 100 -10 195 20"
            fill="none"
            stroke="url(#bondGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="6 8"
            initial={reduce ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
            animate={
              reduce
                ? { pathLength: 1, opacity: 0.8 }
                : { pathLength: 1, opacity: 0.9 }
            }
            transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          {!reduce && (
            <motion.circle
              r="3.5"
              fill="#a855f7"
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0.6 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <animateMotion
                path="M5 20 Q 100 -10 195 20"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </motion.circle>
          )}
        </svg>
      </div>

      {/* RIGHT avatar (athlete placeholder) */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="relative">
          <span
            aria-hidden
            className={`absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-teal-400/50 via-blue-500/40 to-purple-500/40 blur-md ${
              active && !reduce ? "animate-pulse-glow" : ""
            }`}
          />
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br from-teal-400 via-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
            <svg className="h-7 w-7 sm:h-9 sm:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{rightLabel}</span>
      </div>
    </div>
  );
}

export default function ConnectAthletePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [coachCode, setCoachCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useRequireAuth();

  useEffect(() => {
    if (!loading && user && user.role?.toLowerCase() !== "coach") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCoachCode = async () => {
      if (!user || user.role?.toLowerCase() !== "coach") {
        return;
      }

      try {
        setIsLoadingCode(true);
        setError(null);
        const coachName = user.userName;
        const url = `/api/CoachConnection/getCoachId${coachName ? `?coachName=${encodeURIComponent(coachName)}` : ''}`;
        const response = await apiFetch<CoachIdResponse>(url);
        setCoachCode(response.coachId);
      } catch (err) {
        console.error("Failed to fetch coach code:", err);
        setError(err instanceof Error ? err.message : "Failed to load coach code");
      } finally {
        setIsLoadingCode(false);
      }
    };

    if (!loading && user) {
      fetchCoachCode();
    }
  }, [user, loading]);

  const handleCopy = async () => {
    if (!coachCode) return;

    try {
      await navigator.clipboard.writeText(coachCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async () => {
    if (!coachCode || !user) return;

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const shareLink = `${baseUrl}/connect-coach?coachCode=${encodeURIComponent(coachCode)}`;
      const shareMessage = `Coach ${user.userName} has Invited you to connect with them on GooseNet! Press this link to Pair: ${shareLink}`;

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       (typeof window !== 'undefined' && window.innerWidth <= 768);

      if (isMobile && navigator.share) {
        try {
          await navigator.share({
            title: 'Connect with Coach on GooseNet',
            text: shareMessage,
            url: shareLink,
          });
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        } catch (shareErr) {
          if ((shareErr as Error).name !== 'AbortError') {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
          }
        }
      } else {
        await navigator.clipboard.writeText(shareLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to share/copy link:", err);
    }
  };

  if (loading || isLoadingCode) {
    return (
      <AppShell hidePageHeader>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading your coach code…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user || user.role?.toLowerCase() !== "coach") {
    return null;
  }

  const activeBond = Boolean(coachCode) && (copied || linkCopied);

  return (
    <AppShell
      title="Invite Athlete"
      subtitle="Add a runner to your roster"
      gradientTitle
      maxWidth="md"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {error ? (
          <motion.div variants={fadeUp}>
            <Card variant="glass" padding="lg" className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Couldn&apos;t load your coach code
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp}>
            <Card
              variant="glass"
              padding="lg"
              className="shadow-glow-brand/10"
            >
              {/* Illustration */}
              <AvatarLink
                leftSrc={user?.profilePicString}
                leftLabel={user?.userName ? `Coach ${user.userName}` : "You"}
                rightLabel="Athlete"
                active={activeBond}
              />

              {/* Intro copy */}
              <div className="text-center mb-6 px-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                  Your unique coach code
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share this code (or a pairing link) with any athlete you want on your roster. When
                  they enter it, you&apos;ll be able to assign workouts and track progress.
                </p>
              </div>

              {/* Coach code display */}
              <div className="mb-5">
                <label
                  htmlFor="coachCode"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Coach code
                </label>
                <div
                  id="coachCode"
                  className="relative rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-gray-900/60 px-4 py-3.5 overflow-hidden"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-400/5"
                  />
                  <code className="relative block text-base sm:text-xl font-mono font-bold tracking-wider text-gray-900 dark:text-gray-100 break-all sm:break-normal overflow-x-auto">
                    {coachCode || "Loading..."}
                  </code>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="gradient"
                  size="lg"
                  fullWidth
                  onClick={handleCopy}
                  disabled={!coachCode || copied}
                  iconLeft={
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.svg
                          key="check"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={springSoft}
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          key="copy"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={transitionQuick}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  }
                >
                  {copied ? "Copied!" : "Copy code"}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleCopyLink}
                  disabled={!coachCode || linkCopied}
                  iconLeft={
                    <AnimatePresence mode="wait" initial={false}>
                      {linkCopied ? (
                        <motion.svg
                          key="linkcheck"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={springSoft}
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          key="share"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={transitionQuick}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  }
                >
                  {linkCopied ? "Link copied!" : "Share link"}
                </Button>
              </div>

              {/* Inline success card on copy */}
              <AnimatePresence>
                {(copied || linkCopied) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 4, height: 0 }}
                    transition={transitionQuick}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 flex items-start gap-3 text-teal-900 dark:text-teal-100">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div className="flex-1 text-sm">
                        <div className="font-semibold">Invitation ready!</div>
                        <div className="text-xs opacity-80">
                          {linkCopied
                            ? "Pairing link sent / copied — share it with your athlete."
                            : "Coach code copied to your clipboard."}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* How-to steps */}
        {!error && (
          <motion.div variants={fadeUp}>
            <Card variant="default" padding="md" className="bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-teal-400/5 border-blue-500/20 dark:border-blue-400/15">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                How athletes connect
              </h3>
              <ol className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
                  Send them your coach code or pairing link.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">2</span>
                  They paste the code in their GooseNet app and confirm.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">3</span>
                  Once paired, assign workouts and track progress.
                </li>
              </ol>
            </Card>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </Link>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
