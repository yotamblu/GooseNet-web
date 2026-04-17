"use client";

import { cn } from "./cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Convenience: round as a circle (for avatars). */
  circle?: boolean;
  /** Convenience width/height; you can also pass arbitrary classes. */
  w?: string | number;
  h?: string | number;
}

export default function Skeleton({ circle, w, h, className, style, ...props }: SkeletonProps) {
  const mergedStyle: React.CSSProperties = { ...style };
  if (w != null) mergedStyle.width = typeof w === "number" ? `${w}px` : w;
  if (h != null) mergedStyle.height = typeof h === "number" ? `${h}px` : h;

  return (
    <div
      aria-hidden
      style={mergedStyle}
      className={cn(
        "shimmer",
        circle ? "rounded-full" : "rounded-md",
        "bg-gray-200/60 dark:bg-white/5",
        className
      )}
      {...props}
    />
  );
}
