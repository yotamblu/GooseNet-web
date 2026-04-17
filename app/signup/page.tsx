/**
 * Sign Up Page
 * User registration with full name, username, email, role, and password
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";
import { hashPassword } from "../../lib/crypto-utils";
import { API_BASE_URL } from "../../lib/api-config";
import {
  Button,
  Card,
  Divider,
  Input,
  Spinner,
  Tabs,
  fadeUp,
  slideInRight,
  stagger,
} from "../components/ui";

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const reduce = useReducedMotion();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("coach");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [errorNonce, setErrorNonce] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullPageSpinner label="Loading..." />;
  }

  if (user) {
    return <FullPageSpinner label="Redirecting to dashboard..." />;
  }

  const validateUsername = (value: string): boolean => {
    const invalidChars = /[\s.\$#\[\]\/]/;
    return !invalidChars.test(value);
  };

  const validatePassword = (value: string): boolean => value.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setValidationErrors({});

    const usernameValid = validateUsername(username);
    const passwordValid = validatePassword(password);

    if (!usernameValid) {
      setValidationErrors({
        username: "Username cannot contain spaces or the characters: . $ # [ ] /",
      });
      setResult({
        type: "error",
        message: "Please fix the validation errors above.",
      });
      setErrorNonce((n) => n + 1);
      setIsLoading(false);
      return;
    }

    if (!passwordValid) {
      setValidationErrors({
        password: "Password must be at least 8 characters long.",
      });
      setResult({
        type: "error",
        message: "Please fix the validation errors above.",
      });
      setErrorNonce((n) => n + 1);
      setIsLoading(false);
      return;
    }

    try {
      const hashedPassword = await hashPassword(password);
      console.log(
        "🔐 Registration - Password hashed with SHA-256:",
        hashedPassword.substring(0, 20) + "..."
      );

      const registrationBody = {
        UserName: username,
        FullName: fullName,
        Role: role.toLowerCase(),
        Email: email,
        Password: hashedPassword,
      };
      console.log("📤 Registration request body:", {
        ...registrationBody,
        Password: "***",
      });

      const response = await fetch(`${API_BASE_URL}/api/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationBody),
      });

      if (response.status === 400) {
        setResult({
          type: "error",
          message:
            "This username or email is already taken. Please choose a different one.",
        });
        setErrorNonce((n) => n + 1);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          `Registration failed: ${response.status} ${response.statusText}`;
        setResult({
          type: "error",
          message: errorMessage,
        });
        setErrorNonce((n) => n + 1);
        setIsLoading(false);
        return;
      }

      setResult({
        type: "success",
        message: "Account created successfully! Logging you in...",
      });

      try {
        await login(username, password);
        router.push("/dashboard");
      } catch (loginError) {
        const loginErrorMessage =
          loginError instanceof Error
            ? loginError.message
            : "Failed to log in after registration";
        setResult({
          type: "error",
          message: `Account created but login failed: ${loginErrorMessage}. Please log in manually.`,
        });
        setErrorNonce((n) => n + 1);
        setIsLoading(false);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred during registration";
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
      {/* Mobile header */}
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

      <div className="relative flex-1 grid md:grid-cols-2 min-w-0">
        <BrandPanel />

        {/* Form side */}
        <main className="relative flex flex-col min-w-0">
          <div className="hidden md:flex items-center justify-end px-8 pt-6">
            <ThemeToggle />
          </div>

          <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-10 md:py-14">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="w-full max-w-md"
            >
              <AnimatePresence mode="wait">
                {!selectedRole ? (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8 text-center md:text-left">
                      <h1 className="display-heading text-2xl sm:text-3xl md:text-4xl text-gray-900 dark:text-gray-50">
                        Join <span className="text-gradient-brand">GooseNet</span>
                      </h1>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Pick your role to get started — you can always add the
                        other later.
                      </p>
                    </div>

                    <Card variant="glass" padding="lg">
                      <div className="flex flex-col gap-3">
                        <RoleCard
                          title="Coach"
                          description="Create and manage structured workouts for your athletes."
                          icon={
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          }
                          onClick={() => {
                            setSelectedRole("coach");
                            setRole("coach");
                          }}
                        />
                        <RoleCard
                          title="Athlete"
                          description="Receive workouts from your coach and track your performance."
                          icon={
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          }
                          onClick={() => {
                            setSelectedRole("athlete");
                            setRole("athlete");
                          }}
                        />
                      </div>

                      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link
                          href="/login"
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6 text-center md:text-left">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole(null);
                          setResult(null);
                          setValidationErrors({});
                        }}
                        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Back to role selection
                      </button>
                      <h1 className="display-heading text-2xl sm:text-3xl md:text-4xl text-gray-900 dark:text-gray-50">
                        Create your{" "}
                        <span className="text-gradient-brand">
                          {selectedRole === "coach" ? "coach" : "athlete"}
                        </span>{" "}
                        account
                      </h1>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        A few details and you&apos;re training.
                      </p>
                    </div>

                    <Card variant="glass" padding="lg">
                      <div className="mb-5">
                        <Tabs
                          items={[
                            { value: "coach", label: "Coach" },
                            { value: "athlete", label: "Athlete" },
                          ]}
                          value={selectedRole}
                          onChange={(v) => {
                            setSelectedRole(v);
                            setRole(v);
                          }}
                          variant="pills"
                          fullWidth
                          ariaLabel="Select role"
                        />
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          autoComplete="name"
                          required
                          label="Full name"
                          placeholder="Jane Runner"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          inputSize="md"
                        />

                        <Input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          required
                          label="Username"
                          placeholder="your.username"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            if (validationErrors.username) {
                              setValidationErrors({
                                ...validationErrors,
                                username: undefined,
                              });
                            }
                          }}
                          error={validationErrors.username}
                          inputSize="md"
                        />

                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          label="Email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          inputSize="md"
                        />

                        {/* Role display + hidden for form integrity */}
                        <input type="hidden" name="role" value={role} />

                        <Input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          required
                          label="Password"
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (validationErrors.password) {
                              setValidationErrors({
                                ...validationErrors,
                                password: undefined,
                              });
                            }
                          }}
                          error={validationErrors.password}
                          helperText={
                            !validationErrors.password
                              ? "Use at least 8 characters."
                              : undefined
                          }
                          inputSize="md"
                        />

                        <AnimatePresence mode="wait">
                          {result && (
                            <motion.div
                              key={`${result.type}-${errorNonce}`}
                              initial={{ opacity: 0, y: -6 }}
                              animate={["show", "shake"]}
                              exit={{ opacity: 0, y: -4 }}
                              variants={{
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  transition: { duration: 0.2 },
                                },
                                ...shakeVariant,
                              }}
                              className={`rounded-xl border p-3 text-sm ${
                                result.type === "success"
                                  ? "border-emerald-300/50 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                  : "border-rose-300/50 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                              }`}
                              role={
                                result.type === "error" ? "alert" : "status"
                              }
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
                          {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                      </form>

                      <Divider label="or" gradient />

                      <GoogleOAuthButton
                        disabled={isLoading || googleLoading}
                        loading={googleLoading}
                        onClick={() => {
                          const r = selectedRole || "athlete";
                          setGoogleLoading(true);
                          window.location.href = `${API_BASE_URL}/auth/google?role=${r}`;
                        }}
                        label="Continue with Google"
                      />

                      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link
                          href="/login"
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

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
          Fly in formation.
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="display-heading mt-4 text-4xl lg:text-5xl text-gray-900 dark:text-white"
        >
          Start training with{" "}
          <span className="text-gradient-brand">real data</span>.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-md text-base text-gray-700 dark:text-gray-300"
        >
          Connect your Garmin, get workouts from your coach, and see every
          split and heart rate zone in one polished dashboard.
        </motion.p>
      </motion.div>

      <div className="relative z-10 px-10 pb-10 text-xs text-gray-600 dark:text-gray-400">
        &copy; {new Date().getFullYear()} GooseNet. Built by runners, for
        runners.
      </div>

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

function RoleCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="group relative w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5 text-left hover:border-transparent hover:shadow-glow-brand transition-[border-color,box-shadow] overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 text-blue-600 dark:text-blue-300 ring-1 ring-inset ring-blue-500/20">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <svg
          className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-[transform,color]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </motion.button>
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
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          padding: 1,
          background: "linear-gradient(120deg, #3b82f6, #a855f7, #2dd4bf)",
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

function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <Spinner
          size="lg"
          variant="brand"
          className="mx-auto text-blue-600 dark:text-blue-400"
        />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
