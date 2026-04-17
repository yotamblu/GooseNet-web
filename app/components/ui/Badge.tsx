"use client";

import { forwardRef } from "react";
import { cn } from "./cn";

export type BadgeVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Small dot indicator on the left. */
  dot?: boolean;
}

const VARIANTS: Record<BadgeVariant, string> = {
  neutral:
    "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 " +
    "dark:bg-white/5 dark:text-gray-300 dark:ring-white/10",
  brand:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 " +
    "dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/30",
  success:
    "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20 " +
    "dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/30",
  warning:
    "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/25 " +
    "dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
  danger:
    "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/25 " +
    "dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/30",
  info:
    "bg-cyan-50 text-cyan-800 ring-1 ring-inset ring-cyan-600/25 " +
    "dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/30",
  outline:
    "bg-transparent text-gray-700 ring-1 ring-inset ring-gray-300 " +
    "dark:text-gray-200 dark:ring-white/15",
};

const DOT_COLOR: Record<BadgeVariant, string> = {
  neutral: "bg-gray-400",
  brand: "bg-blue-500",
  success: "bg-teal-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-cyan-500",
  outline: "bg-gray-400",
};

const SIZES: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "neutral", size = "md", dot, className, children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-wide",
        SIZES[size],
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 rounded-full", DOT_COLOR[variant])}
        />
      )}
      {children}
    </span>
  );
});

export default Badge;
