"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "./cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Click outside or Escape → close. Defaults to true. */
  dismissible?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Custom label for the dialog (falls back to title). */
  ariaLabel?: string;
}

const SIZE: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const FOCUSABLE =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  size = "md",
  className,
  ariaLabel,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const reduce = useReducedMotion();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Body scroll lock + focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      const root = panelRef.current;
      if (!root) return;
      const first = root.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? root).focus();
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      if (dismissible && e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const root = panelRef.current;
        if (!root) return;
        const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => !el.hasAttribute("data-focus-skip")
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement;
        if (e.shiftKey && activeEl === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [dismissible, onClose, open]
  );

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onKeyDown={onKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
        >
          <motion.div
            key="backdrop"
            onClick={dismissible ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            key="panel"
            ref={panelRef}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
            tabIndex={-1}
            className={cn(
              "relative w-full rounded-2xl outline-none",
              "bg-white dark:bg-gray-900",
              "border border-gray-200 dark:border-white/10",
              "shadow-[0_32px_80px_-20px_rgba(0,0,0,0.45)]",
              SIZE[size],
              className
            )}
          >
            {(title || dismissible) && (
              <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-white/10">
                <div className="min-w-0">
                  {title && (
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  )}
                </div>
                {dismissible && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="-m-1.5 p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="p-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-white/10">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
