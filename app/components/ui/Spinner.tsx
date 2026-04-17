"use client";

import { cn } from "./cn";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: SpinnerSize;
  /** Use currentColor for the arc (default) or brand gradient. */
  variant?: "current" | "brand";
}

const SIZE_MAP: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function Spinner({
  size = "md",
  variant = "current",
  className,
  ...props
}: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin", SIZE_MAP[size], className)}
      {...props}
    >
      {variant === "brand" ? (
        <>
          <defs>
            <linearGradient id="gn-spinner-grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="url(#gn-spinner-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
