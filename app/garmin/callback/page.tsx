/**
 * Garmin OAuth Callback Page
 * Handles the OAuth callback from Garmin and completes the connection
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { setToken } from "../../../lib/auth";
import { apiService } from "../../services/api";
import {
  Button,
  Card,
  PageContainer,
  Spinner,
  fadeUp,
  transitionQuick,
} from "../../components/ui";

function GarminCallbackPageContent() {
  const { user, loading, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [success, setSuccess] = useState(false);
  const reduce = useReducedMotion();

  // Don't use useRequireAuth here - we'll handle auth check manually
  // to allow redirect to login with returnUrl

  // Process OAuth callback
  useEffect(() => {
    const processCallback = async () => {
      // Wait for auth check to complete
      if (loading) {
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);
        setSuccess(false);

        // Extract parameters from URL
        const oauth_token = searchParams.get("oauth_token");
        const oauth_verifier = searchParams.get("oauth_verifier");
        const stateToken = searchParams.get("stateToken");
        const urlTheme = searchParams.get("theme");

        // Get OAuth params from URL (for mobile localStorage issues) or localStorage
        const urlTokenSecret = searchParams.get("token_secret");
        const urlApiKey = searchParams.get("apiKey");
        const urlTimestamp = searchParams.get("timestamp");

        // Apply theme if provided and not default (default is dark)
        if (urlTheme && urlTheme !== "dark" && theme !== urlTheme) {
          setTheme(urlTheme);
        }

        if (!oauth_token || !oauth_verifier) {
          throw new Error("Missing OAuth parameters from Garmin");
        }

        // Get stored token_secret and apiKey - prefer URL params (for mobile) over localStorage
        const token_secret = urlTokenSecret || localStorage.getItem("garmin_token_secret");
        const apiKey = urlApiKey || localStorage.getItem("garmin_api_key");
        const tokenTimestamp = urlTimestamp || localStorage.getItem("garmin_token_timestamp");

        // Check if session is expired (using URL timestamp or localStorage timestamp)
        let sessionExpired = false;
        if (tokenTimestamp) {
          const age = Date.now() - parseInt(tokenTimestamp, 10);
          const maxAge = 10 * 60 * 1000; // 10 minutes
          if (age > maxAge) {
            sessionExpired = true;
          }
        }

        // If we got params from URL, also store them in localStorage for consistency
        if (urlTokenSecret && !localStorage.getItem("garmin_token_secret")) {
          localStorage.setItem("garmin_token_secret", urlTokenSecret);
        }
        if (urlApiKey && !localStorage.getItem("garmin_api_key")) {
          localStorage.setItem("garmin_api_key", urlApiKey);
        }
        if (urlTimestamp && !localStorage.getItem("garmin_token_timestamp")) {
          localStorage.setItem("garmin_token_timestamp", urlTimestamp);
        }

        // If session expired or user not authenticated, try to use stateToken to re-authenticate
        if ((sessionExpired || !user) && stateToken) {
          try {
            const jwtResponse = await apiService.getJwtFromStateToken<{ token: string } | { message: string }>(stateToken);

            if (jwtResponse.data && "token" in jwtResponse.data && jwtResponse.data.token) {
              // Store JWT token and refresh user
              setToken(jwtResponse.data.token);
              await refreshUser();
              // The useEffect will re-run when user changes, so exit here
              // and let the next run handle the authenticated user
              setIsProcessing(false);
              return;
            } else if (jwtResponse.data && "message" in jwtResponse.data) {
              throw new Error(jwtResponse.data.message || "State token expired or invalid");
            } else {
              throw new Error("Invalid response from state token endpoint");
            }
          } catch (stateTokenError) {
            // If state token fails, clear everything and throw error
            localStorage.removeItem("garmin_token_secret");
            localStorage.removeItem("garmin_api_key");
            localStorage.removeItem("garmin_token_timestamp");
            throw new Error(stateTokenError instanceof Error ? stateTokenError.message : "Failed to authenticate with state token");
          }
        }

        // Check if user is authenticated now (after potential re-auth)
        if (!user) {
          // If still not authenticated and no stateToken, redirect to login
          const returnUrl = `/garmin/callback?oauth_token=${encodeURIComponent(oauth_token)}&oauth_verifier=${encodeURIComponent(oauth_verifier)}${stateToken ? `&stateToken=${encodeURIComponent(stateToken)}` : ''}${urlTheme ? `&theme=${encodeURIComponent(urlTheme)}` : ''}`;
          router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        // Check if user is an athlete
        if (user.role?.toLowerCase() !== "athlete") {
          setIsProcessing(false);
          router.push("/dashboard");
          return;
        }

        // Use token_secret for OAuth completion (stateless flow)
        if (!token_secret) {
          throw new Error("OAuth session expired. Please try connecting again.");
        }

        // Get apiKey - prefer URL param, then user object, then localStorage
        const userApiKey = apiKey || user.apiKey;
        if (!userApiKey) {
          throw new Error("User API key not found. Please log in again.");
        }

        // Complete OAuth flow using stateless method with apiKey
        await apiService.getGarminAccessTokenStateless(
          oauth_token,
          oauth_verifier,
          token_secret,
          userApiKey
        );

        // Clear localStorage
        localStorage.removeItem("garmin_token_secret");
        localStorage.removeItem("garmin_api_key");
        localStorage.removeItem("garmin_token_timestamp");

        // Show success
        setSuccess(true);
        setIsProcessing(false);

        // Redirect to dashboard after showing success animation
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        // Create detailed error information
        const errorMessage = err instanceof Error ? err.message : "Failed to connect to Garmin. Please try again.";
        const errorStack = err instanceof Error ? err.stack : String(err);
        const errorDetailsObj = {
          message: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          searchParams: Object.fromEntries(searchParams.entries()),
          userAgent: navigator.userAgent,
          localStorage: {
            hasTokenSecret: !!localStorage.getItem("garmin_token_secret"),
            hasApiKey: !!localStorage.getItem("garmin_api_key"),
            hasTimestamp: !!localStorage.getItem("garmin_token_timestamp"),
          },
        };

        const errorDetailsString = JSON.stringify(errorDetailsObj, null, 2);

        // Log to console
        console.error("Failed to complete Garmin connection:", err);
        console.error("Error details:", errorDetailsObj);

        // Store error in localStorage for debugging (keep last 5 errors)
        try {
          const errorLog = JSON.parse(localStorage.getItem("garmin_error_log") || "[]");
          errorLog.unshift({
            ...errorDetailsObj,
            id: Date.now(),
          });
          // Keep only last 5 errors
          if (errorLog.length > 5) {
            errorLog.pop();
          }
          localStorage.setItem("garmin_error_log", JSON.stringify(errorLog));
        } catch (e) {
          console.error("Failed to save error to localStorage:", e);
        }

        setError(errorMessage);
        setErrorDetails(errorDetailsString);
        setIsProcessing(false);

        // Clear localStorage on error
        localStorage.removeItem("garmin_token_secret");
        localStorage.removeItem("garmin_api_key");
        localStorage.removeItem("garmin_token_timestamp");
      }
    };

    if (!loading) {
      processCallback();
    }
  }, [searchParams, user, loading, router, theme, setTheme, refreshUser]);

  // Loading / processing flash state
  if (loading || isProcessing) {
    return (
      <HeroLayout>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          <div className="relative mx-auto mb-6 h-24 w-24">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/60 via-purple-500/60 to-teal-400/60 blur-xl animate-pulse-glow"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/60 dark:border-white/10 bg-white/80 dark:bg-gray-950/70 backdrop-blur-xl shadow-glow-brand">
              <Image
                src="/logo/goosenet_logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Connecting your <span className="text-gradient-brand">Garmin</span>…
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Hang tight — we&apos;re finalizing the handshake.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Spinner size="sm" variant="brand" />
            <span>Completing OAuth</span>
          </div>
        </motion.div>
      </HeroLayout>
    );
  }

  // Don't render if not an athlete (redirect will happen)
  if (!user || user.role?.toLowerCase() !== "athlete") {
    return null;
  }

  return (
    <HeroLayout>
      {success ? (
        <motion.div
          key="success"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <Card variant="glass" padding="lg" className="text-center">
            <div className="relative mx-auto mb-5 h-20 w-20 sm:h-24 sm:w-24">
              <motion.span
                aria-hidden
                initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400/60 via-emerald-400/60 to-blue-500/60 blur-lg"
              />
              <motion.div
                initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/15 border border-teal-400/40"
              >
                <motion.svg
                  className="h-10 w-10 sm:h-12 sm:w-12 text-teal-600 dark:text-teal-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden
                  initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
                  animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    initial={reduce ? undefined : { pathLength: 0 }}
                    animate={reduce ? undefined : { pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                  />
                </motion.svg>
              </motion.div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Garmin connected!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your account is linked. Redirecting you to the dashboard…
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Spinner size="xs" />
              <span>Redirecting</span>
            </div>
          </Card>
        </motion.div>
      ) : error ? (
        <motion.div
          key="error"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <Card variant="glass" padding="lg" className="text-center">
            <div className="relative mx-auto mb-5 h-20 w-20 sm:h-24 sm:w-24">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-rose-400/30 blur-lg"
              />
              <motion.div
                initial={reduce ? { opacity: 0 } : { scale: 0.7, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-400/40"
              >
                <svg className="h-10 w-10 sm:h-12 sm:w-12 text-rose-600 dark:text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Connection failed
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words px-2">
              {error}
            </p>

            {errorDetails && (
              <div className="mt-4">
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  type="button"
                >
                  {showErrorDetails ? "Hide" : "Show"} error details
                </button>
                {showErrorDetails && (
                  <motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                    transition={transitionQuick}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-950/60 border border-gray-200 dark:border-white/10 text-left">
                      <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words overflow-x-auto max-h-64">
                        {errorDetails}
                      </pre>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(errorDetails).catch(() => {});
                          alert("Error details copied to clipboard!");
                        }}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Copy to clipboard
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
              <Button
                variant="gradient"
                onClick={() => router.push("/dashboard")}
              >
                Return to dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const errorLog = JSON.parse(localStorage.getItem("garmin_error_log") || "[]");
                  const logText = JSON.stringify(errorLog, null, 2);
                  navigator.clipboard.writeText(logText).catch(() => {});
                  alert("Error log copied to clipboard!");
                }}
              >
                Copy error log
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </HeroLayout>
  );
}

function HeroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-aurora-subtle bg-white dark:bg-[#0b0f17] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-blue-500/20 dark:bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-500/20 dark:bg-purple-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[28rem] rounded-full bg-gradient-to-r from-teal-400/15 via-blue-500/15 to-purple-500/15 blur-3xl" />
      </div>
      <PageContainer width="sm" padded={false} className="relative py-12 sm:py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center">
          {children}
        </div>
      </PageContainer>
    </div>
  );
}

export default function GarminCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen flex items-center justify-center bg-aurora-subtle bg-white dark:bg-[#0b0f17]">
          <div className="text-center">
            <Spinner size="lg" variant="brand" className="mx-auto" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading…</p>
          </div>
        </div>
      }
    >
      <GarminCallbackPageContent />
    </Suspense>
  );
}
