"use client";

import { cn } from "./cn";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Optional label rendered on top of a horizontal divider. */
  label?: React.ReactNode;
  gradient?: boolean;
}

export default function Divider({
  orientation = "horizontal",
  label,
  gradient,
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "self-stretch w-px",
          gradient
            ? "bg-gradient-to-b from-transparent via-blue-500/40 to-transparent"
            : "bg-gray-200 dark:bg-white/10",
          className
        )}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div className={cn("relative my-6 flex items-center", className)} role="separator" {...props}>
        <div
          className={cn(
            "flex-grow h-px",
            gradient
              ? "bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
              : "bg-gray-200 dark:bg-white/10"
          )}
        />
        <span className="mx-3 text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div
          className={cn(
            "flex-grow h-px",
            gradient
              ? "bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"
              : "bg-gray-200 dark:bg-white/10"
          )}
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "w-full h-px my-4",
        gradient
          ? "bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
          : "bg-gray-200 dark:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
