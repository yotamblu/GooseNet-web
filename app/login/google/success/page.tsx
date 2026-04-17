/**
 * Google OAuth Success Page
 * Handles JWT token from query string and logs user in
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useAuth } from "../../../../context/AuthContext";
import { setToken } from "../../../../lib/auth";
import ThemeToggle from "../../../components/ThemeToggle";
import {
  Button,
  Card,
  Spinner,
  fadeUp,
  stagger,
} from "../../../components/ui";

const PARTICLE_COLORS = [
  "#3b82f6",
  "#a855f7",
  "#2dd4bf",
  "#f59e0b",
  "#f43f5e",
];

function GoogleSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser, user, loading } = useAuth();
  const reduce = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      left: number;
      delay: number;
      duration: number;
      size: number;
      color: string;
      rotate: number;
    }>
  >([]);

  useEffect(() => {
    const jwt = searchParams.get("jwt");

    if (!jwt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial URL check; auth flow needs to surface error once on mount.
      setError("No JWT token provided in the URL");
      setIsProcessing(false);
      return;
    }

    const handleLogin = async () => {
      try {
        setToken(jwt);
        console.log("✅ JWT Token received from query string and saved");

        await refreshUser();

        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } catch (err) {
        console.error("❌ Failed to process Google login:", err);
        setError(err instanceof Error ? err.message : "Failed to process login");
        setIsProcessing(false);
      }
    };

    handleLogin();
  }, [searchParams, refreshUser, router]);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Generate particle positions on mount (side effect — avoids hydration mismatch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random particle layout must be generated client-side after hydration.
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.6,
        size: 6 + Math.random() * 8,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        rotate: Math.random() * 360,
      }))
    );
  }, []);

  const showCelebrate = !isProcessing && !error;

  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
      <header className="relative z-40 sticky top-0 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/goosenet_logo.png"
              alt="GooseNet"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              GooseNet
            </span>
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-12 bg-aurora">
        {/* Confetti particles — only on success */}
        {showCelebrate && !reduce && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ y: -40, opacity: 0, rotate: 0 }}
                animate={{
                  y: "110vh",
                  opacity: [0, 1, 1, 0],
                  rotate: p.rotate + 360,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeIn",
                  repeat: 1,
                  repeatDelay: 0.2,
                }}
                style={{
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.size * 0.4,
                  backgroundColor: p.color,
                  borderRadius: 2,
                }}
                className="absolute top-0 shadow-[0_0_8px_rgba(0,0,0,0.15)]"
              />
            ))}
          </div>
        )}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-md"
        >
          <Card variant="glass" padding="lg" className="shadow-glow-brand">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6"
                >
                  <Spinner
                    size="lg"
                    variant="brand"
                    className="mx-auto text-blue-600 dark:text-blue-400"
                  />
                  <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Completing sign in…
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Hold tight, we&apos;re getting your dashboard ready.
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15 ring-1 ring-inset ring-rose-500/20">
                    <svg
                      className="h-7 w-7 text-rose-600 dark:text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Sign in failed
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {error}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Link href="/login">
                      <Button variant="primary" size="md">
                        Return to login
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <motion.div
                    variants={fadeUp}
                    className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 ring-1 ring-inset ring-emerald-500/30 animate-pulse-glow"
                  >
                    <svg
                      className="h-10 w-10 text-emerald-500 dark:text-emerald-400"
                      viewBox="0 0 52 52"
                      fill="none"
                      aria-hidden
                    >
                      <circle
                        cx="26"
                        cy="26"
                        r="24"
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth="3"
                      />
                      <motion.path
                        d="M14 27 L23 36 L39 18"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: reduce ? 0 : 0.6,
                          ease: "easeOut",
                        }}
                      />
                    </svg>
                  </motion.div>

                  <motion.h3
                    variants={fadeUp}
                    className="display-heading mt-6 text-2xl md:text-3xl text-gray-900 dark:text-gray-50"
                  >
                    Welcome to{" "}
                    <span className="text-gradient-brand">GooseNet</span>
                  </motion.h3>
                  <motion.p
                    variants={fadeUp}
                    className="mt-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    Signed in successfully. Taking you to your dashboard…
                  </motion.p>
                  <motion.div
                    variants={fadeUp}
                    className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500"
                  >
                    <Spinner size="xs" variant="brand" />
                    Redirecting…
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
          <div className="text-center">
            <Spinner
              size="lg"
              variant="brand"
              className="mx-auto text-blue-600 dark:text-blue-400"
            />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  );
}
