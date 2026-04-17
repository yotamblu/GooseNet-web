"use client";

import { cn } from "./cn";

export interface SectionHeadingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  /** Center align text (for marketing sections). */
  center?: boolean;
  /** Apply gradient coloring to the title. */
  gradient?: boolean;
  as?: "h2" | "h3";
  className?: string;
}

export default function SectionHeading({
  title,
  description,
  eyebrow,
  actions,
  center = false,
  gradient = false,
  as = "h2",
  className,
}: SectionHeadingProps) {
  const Heading = as;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 mb-6",
        center
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("min-w-0", center && "max-w-3xl")}>
        {eyebrow && (
          <div
            className={cn(
              "mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400",
              center && "mx-auto"
            )}
          >
            {eyebrow}
          </div>
        )}
        <Heading
          className={cn(
            "display-heading font-bold tracking-tight",
            as === "h2"
              ? "text-2xl sm:text-3xl lg:text-4xl"
              : "text-xl sm:text-2xl",
            gradient
              ? "text-gradient-brand"
              : "text-gray-900 dark:text-gray-50"
          )}
        >
          {title}
        </Heading>
        {description && (
          <p
            className={cn(
              "mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400",
              center ? "mx-auto max-w-2xl" : "max-w-2xl"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && !center && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
