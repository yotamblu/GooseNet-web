"use client";

/**
 * Lightweight toast system.
 *
 * Usage:
 *   <ToastProvider>...app...</ToastProvider>
 *   const { toast } = useToast();
 *   toast({ title: "Saved", description: "Your changes were saved.", variant: "success" });
 *
 * Kept intentionally minimal — a richer replacement can be swapped in later.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "./cn";

export type ToastVariant = "default" | "success" | "warning" | "danger" | "info";

export interface ToastInput {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** Auto dismiss after ms. Defaults to 4000. Pass 0 to disable. */
  duration?: number;
}

export interface ToastItem extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (t: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default:
    "border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-gray-900 dark:text-gray-100",
  success:
    "border-teal-500/30 bg-teal-50 text-teal-900 dark:bg-teal-500/10 dark:text-teal-100 dark:border-teal-400/30",
  warning:
    "border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100 dark:border-amber-400/30",
  danger:
    "border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100 dark:border-rose-400/30",
  info:
    "border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-100 dark:border-blue-400/30",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const reduce = useReducedMotion();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (t: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = t.duration ?? 4000;
      setToasts((prev) => [...prev, { ...t, id }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="region"
            aria-label="Notifications"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex flex-col items-center gap-2 p-4 sm:items-end sm:right-4 sm:left-auto sm:p-6"
          >
            <AnimatePresence initial={false}>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 28 }}
                  className={cn(
                    "pointer-events-auto w-full max-w-sm rounded-xl border shadow-lg px-4 py-3",
                    "backdrop-blur-xl",
                    VARIANT_STYLES[t.variant ?? "default"]
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      {t.title && (
                        <div className="text-sm font-semibold leading-tight">{t.title}</div>
                      )}
                      {t.description && (
                        <div className="mt-0.5 text-xs opacity-80">{t.description}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => dismiss(t.id)}
                      className="-m-1 p-1 rounded-md opacity-60 hover:opacity-100"
                      aria-label="Dismiss notification"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
