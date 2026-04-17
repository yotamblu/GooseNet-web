/**
 * Login Page
 * User authentication with username and password
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";
import { API_BASE_URL } from "../../lib/api-config";
import {
  Button,
  Card,
  Divider,
  Input,
  Spinner,
  fadeUp,
  slideInRight,
  stagger,
} from "../components/ui";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading } = useAuth();
  const reduce = useReducedMotion();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [errorNonce, setErrorNonce] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return <FullPageSpinner label="Loading..." />;
  }

  if (user) {
    return <FullPageSpinner label="Redirecting..." />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      await login(username, password);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred during login";
      setResult({
        type: "error",
        message: errorMessage,
      });
      setErrorNonce((n) => n + 1);
      setIsLoading(false);
    }
  };

  const shakeVariant: Variants = reduce
    ? { shake: { x: 0 } }
    : {
        shake: {
          x: [0, -8, 8, -6, 6, -3, 0],
          transition: { duration: 0.45, ease: "easeInOut" },
        },
      };

  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
      {/* Mobile header (sticky) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/goosenet_logo.png"
              alt="GooseNet"
              width={28}
              height={28}
              className="h-7 w-auto"
              priority
            />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              GooseNet
            </span>
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <div className="relative flex-1 grid md:grid-cols-2">
        <BrandPanel />

        {/* Form side */}
        <main className="relative flex flex-col">
          {/* Desktop top bar */}
          <div className="hidden md:flex items-center justify-end px-8 pt-6">
            <ThemeToggle />
          </div>

          <div className="relative flex-1 flex items-center justify-center px-6 py-10 md:py-16">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="w-full max-w-md"
            >
              <div className="mb-8 text-center md:text-left">
                <h1 className="display-heading text-3xl md:text-4xl text-gray-900 dark:text-gray-50">
                  Welcome{" "}
                  <span className="text-gradient-brand">back</span>
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Sign in to sync training data and keep your flock flying in formation.
                </p>
              </div>

              <Card variant="glass" padding="lg" className="shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    label="Username"
                    placeholder="your.username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    inputSize="lg"
                  />

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    inputSize="lg"
                  />

                  <AnimatePresence mode="wait">
                    {result && (
                      <motion.div
                        key={`${result.type}-${errorNonce}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={["show", "shake"]}
                        exit={{ opacity: 0, y: -4 }}
                        variants={{
                          show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                          ...shakeVariant,
                        }}
                        className={`rounded-xl border p-3 text-sm ${
                          result.type === "success"
                            ? "border-emerald-300/50 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "border-rose-300/50 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                        }`}
                        role={result.type === "error" ? "alert" : "status"}
                      >
                        {result.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <Divider label="or" gradient />

                <GoogleOAuthButton
                  disabled={isLoading || googleLoading}
                  loading={googleLoading}
                  onClick={() => {
                    setGoogleLoading(true);
                    window.location.href = `${API_BASE_URL}/auth/google?role=athlete`;
                  }}
                  label="Continue with Google"
                />

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </Card>

              <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
                By signing in you agree to GooseNet&apos;s Terms of Service &amp; Privacy Policy.
              </p>
            </motion.div>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );

  function BrandPanel() {
    return (
      <motion.aside
        variants={slideInRight}
        initial="hidden"
        animate="show"
        className="relative hidden md:flex md:flex-col md:justify-between bg-aurora overflow-hidden border-r border-white/10"
      >
        <div className="relative z-10 flex items-center gap-3 px-10 pt-10">
          <Image
            src="/logo/goosenet_logo.png"
            alt="GooseNet"
            width={36}
            height={36}
            className="h-9 w-auto drop-shadow-lg"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            GooseNet
          </span>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 px-10 py-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600/80 dark:text-blue-300/80"
          >
            Train together.
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="display-heading mt-4 text-4xl lg:text-5xl text-gray-900 dark:text-white"
          >
            Your flock,{" "}
            <span className="text-gradient-brand">always in sync</span>.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-md text-base text-gray-700 dark:text-gray-300"
          >
            Coaches build workouts. Athletes crush them. Everyone sees the
            same numbers — straight from your Garmin, live on your dashboard.
          </motion.p>
        </motion.div>

        <div className="relative z-10 px-10 pb-10 text-xs text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} GooseNet. Built by runners, for
          runners.
        </div>

        {/* Decorative soft orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-20 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl"
        />
      </motion.aside>
    );
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <Spinner size="lg" variant="brand" className="mx-auto text-blue-600 dark:text-blue-400" />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function GoogleOAuthButton({
  onClick,
  disabled,
  loading,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={reduce || disabled ? undefined : { y: -1 }}
      whileTap={reduce || disabled ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900/60 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition-shadow disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
    >
      {/* Gradient border on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          padding: 1,
          background:
            "linear-gradient(120deg, #3b82f6, #a855f7, #2dd4bf)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {loading ? (
        <Spinner size="sm" variant="brand" />
      ) : (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="relative">{label}</span>
    </motion.button>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading..." />}>
      <LoginPageContent />
    </Suspense>
  );
}
