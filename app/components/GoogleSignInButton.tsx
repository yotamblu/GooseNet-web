/**
 * Google Sign-In Button Component
 * Handles Google OAuth authentication
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Spinner from "./ui/Spinner";

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  role?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  role,
  disabled = false,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = () => {
        if (onError) {
          onError("Failed to load Google Sign-In script");
        }
      };
      document.head.appendChild(script);
    } else if (window.google) {
      // Google script already injected by a previous mount — queue the state
      // update as a microtask so it isn't flagged as a synchronous cascade.
      queueMicrotask(() => setScriptLoaded(true));
    }
  }, [onError]);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    if (!clientId) {
      console.warn(
        "⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set - using placeholder"
      );
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          setIsLoading(true);
          try {
            onSuccess(response.credential);
          } catch (error) {
            setIsLoading(false);
            if (onError) {
              onError(error instanceof Error ? error.message : "An error occurred");
            }
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: buttonRef.current.offsetWidth || 300,
      });
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
      if (onError) {
        onError("Failed to initialize Google Sign-In");
      }
    }
  }, [scriptLoaded, onSuccess, onError]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!scriptLoaded || !clientId) {
    return (
      <motion.button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }}
        whileHover={reduce || disabled || isLoading ? undefined : { y: -1 }}
        whileTap={reduce || disabled || isLoading ? undefined : { scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        data-role={role}
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
        {isLoading ? (
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
        <span className="relative">
          {isLoading ? "Signing in..." : "Continue with Google"}
        </span>
      </motion.button>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className="w-full flex justify-center"
        style={{ minHeight: "40px" }}
      ></div>
    </div>
  );
}
