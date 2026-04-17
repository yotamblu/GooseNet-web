"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./cn";
import Spinner from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "gradient";

export type ButtonSize = "sm" | "md" | "lg";

type MotionButtonProps = Omit<HTMLMotionProps<"button">, "children">;

export interface ButtonProps extends MotionButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition-colors duration-200 select-none max-w-full " +
  "disabled:opacity-50 disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900";

const SIZES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 h-8",
  md: "text-sm px-4 h-10",
  lg: "text-base px-6 h-12",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 " +
    "dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white " +
    "shadow-blue-600/20",
  secondary:
    "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 " +
    "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700/80",
  ghost:
    "bg-transparent text-gray-800 hover:bg-gray-100 " +
    "dark:text-gray-200 dark:hover:bg-white/5",
  outline:
    "bg-transparent text-blue-600 border border-blue-600/60 hover:bg-blue-600/10 " +
    "dark:text-blue-400 dark:border-blue-400/50 dark:hover:bg-blue-400/10",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 " +
    "dark:bg-rose-500 dark:hover:bg-rose-400",
  gradient:
    // Gradient with a subtle animated shine + brand glow.
    "text-white shadow-glow-brand " +
    "bg-[linear-gradient(120deg,#3b82f6_0%,#6366f1_35%,#a855f7_70%,#3b82f6_100%)] " +
    "bg-[length:200%_100%] animate-gradient hover:brightness-110",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    iconLeft,
    iconRight,
    fullWidth,
    className,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref
) {
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? {}
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring" as const, stiffness: 400, damping: 28 },
      };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        BASE,
        SIZES[size],
        VARIANTS[variant],
        fullWidth && "w-full",
        className
      )}
      {...motionProps}
      {...props}
    >
      {loading && (
        <Spinner
          size={size === "lg" ? "md" : "sm"}
          className="-ml-0.5"
          aria-hidden
        />
      )}
      {!loading && iconLeft && (
        <span className="shrink-0 -ml-0.5" aria-hidden>
          {iconLeft}
        </span>
      )}
      {children && (
        <span className="inline-flex items-center min-w-0 truncate">{children}</span>
      )}
      {!loading && iconRight && (
        <span className="shrink-0 -mr-0.5" aria-hidden>
          {iconRight}
        </span>
      )}
    </motion.button>
  );
});

export default Button;
