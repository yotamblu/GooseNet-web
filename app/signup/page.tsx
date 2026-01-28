/**
 * Sign Up Page
 * User registration with full name, username, email, role, and password
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Footer from "../components/Footer";
import ThemeToggle from "../components/ThemeToggle";
import { hashPassword } from "../../lib/crypto-utils";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("coach");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render signup form if user is already logged in (redirect will happen)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Validate username (no spaces, ., $, #, [, ], /)
  const validateUsername = (value: string): boolean => {
    const invalidChars = /[\s.\$#\[\]\/]/;
    return !invalidChars.test(value);
  };

  // Validate password (at least 8 characters)
  const validatePassword = (value: string): boolean => {
    return value.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setValidationErrors({});
    
    // Client-side validation
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
      setIsLoading(false);
      return;
    }

    try {
      // Hash password with SHA-256 before sending to API (same as login flow)
      const hashedPassword = await hashPassword(password);
      console.log("🔐 Registration - Password hashed with SHA-256:", hashedPassword.substring(0, 20) + "...");

      // Call registration endpoint
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://gooseapi.ddns.net";
      const registrationBody = {
        UserName: username,
        FullName: fullName,
        Role: role.toLowerCase(),
        Email: email,
        Password: hashedPassword, // Send SHA-256 hashed password to API
      };
      console.log("📤 Registration request body:", { ...registrationBody, Password: "***" });
      
      const response = await fetch(`${API_BASE_URL}/api/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationBody),
      });

      // Handle 400 - user already exists
      if (response.status === 400) {
        setResult({
          type: "error",
          message: "This username or email is already taken. Please choose a different one.",
        });
        setIsLoading(false);
        return;
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || `Registration failed: ${response.status} ${response.statusText}`;
        setResult({
          type: "error",
          message: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // Success (200) - login with the credentials
      setResult({
        type: "success",
        message: "Account created successfully! Logging you in...",
      });

      // Login with the credentials
      try {
        await login(username, password);
        // Login successful - AuthContext will update user state
        // Redirect to dashboard
        router.push("/dashboard");
      } catch (loginError) {
        // If login fails after registration, redirect to login page
        const loginErrorMessage = loginError instanceof Error ? loginError.message : "Failed to log in after registration";
        setResult({
          type: "error",
          message: `Account created but login failed: ${loginErrorMessage}. Please log in manually.`,
        });
        setIsLoading(false);
        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during registration";
      setResult({
        type: "error",
        message: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
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
            {!loading && user && user.profilePicString && (
              <Link href="/dashboard" className="hidden md:flex items-center">
                <img
                  src={getProfilePicSrc(user.profilePicString)}
                  alt={user.userName}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                  onError={(e) => {
                    // Fallback: hide image if it fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-center px-6 py-12 sm:px-6 sm:py-24 overflow-hidden">
        {/* Glowing purple/blue background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Upper left purple glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          {/* Upper right blue glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 dark:from-purple-500/15 dark:via-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"></div>
          {/* Lower right purple-pink glow */}
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/20 dark:bg-pink-500/15 rounded-full blur-3xl"></div>
          {/* Lower left blue glow */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/25 dark:bg-blue-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md md:max-w-2xl lg:max-w-4xl">
          {!selectedRole ? (
            // Role Selection Step
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Join GooseNet
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Choose your role to get started
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-8">
                <div className="flex flex-col md:flex-row md:space-y-0 md:space-x-4 space-y-4">
                  <button
                    onClick={() => {
                      setSelectedRole("coach");
                      setRole("coach");
                    }}
                    className="w-full md:w-1/2 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-left hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Coach</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Create and manage structured workouts for your athletes
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRole("athlete");
                      setRole("athlete");
                    }}
                    className="w-full md:w-1/2 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-left hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Athlete</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Receive workouts from your coach and track your performance
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            // Registration Form Step
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setResult(null);
                    setValidationErrors({});
                  }}
                  className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to role selection
                </button>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Register Here
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Create your {selectedRole === "coach" ? "Coach" : "Athlete"} account
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 sm:text-sm sm:leading-6"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (validationErrors.username) {
                        setValidationErrors({ ...validationErrors, username: undefined });
                      }
                    }}
                    className={`block w-full rounded-lg border-0 py-2 px-3 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ${
                      validationErrors.username
                        ? "ring-red-300 dark:ring-red-600 focus:ring-red-600 dark:focus:ring-red-500"
                        : "ring-gray-300 dark:ring-gray-600 focus:ring-blue-600 dark:focus:ring-blue-500"
                    } placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset bg-white dark:bg-gray-700 sm:text-sm sm:leading-6`}
                    placeholder="Enter your username"
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Role Display (read-only, pre-selected from previous step) */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Role
                </label>
                <div className="mt-2">
                  <div className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-gray-50 dark:bg-gray-700/50 sm:text-sm sm:leading-6">
                    {selectedRole === "coach" ? "Coach" : "Athlete"}
                  </div>
                  <input type="hidden" name="role" value={role} />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: undefined });
                      }
                    }}
                    className={`block w-full rounded-lg border-0 py-2 px-3 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ${
                      validationErrors.password
                        ? "ring-red-300 dark:ring-red-600 focus:ring-red-600 dark:focus:ring-red-500"
                        : "ring-gray-300 dark:ring-gray-600 focus:ring-blue-600 dark:focus:ring-blue-500"
                    } placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset bg-white dark:bg-gray-700 sm:text-sm sm:leading-6`}
                    placeholder="Enter your password (at least 8 characters)"
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                  )}
                </div>
              </div>

              {/* Result Message */}
              {result && (
                <div
                  className={`rounded-lg p-4 ${
                    result.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.type === "success" ? (
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          result.type === "success"
                            ? "text-green-800 dark:text-green-300"
                            : "text-red-800 dark:text-red-300"
                        }`}
                      >
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Creating account..." : "Register"}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  const role = selectedRole || "athlete"; // Default to athlete if somehow no role is selected
                  window.location.href = `https://gooseapi.ddns.net/auth/google?role=${role}`;
                }}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                Continue with Google
              </button>
            </div>

                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

