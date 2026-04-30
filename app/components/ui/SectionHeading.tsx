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
  /** Larger type for landing / marketing blocks only. */
  variant?: "default" | "marketing";
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
  variant = "default",
  as = "h2",
  className,
}: SectionHeadingProps) {
  const Heading = as;
  const marketing = variant === "marketing";

  return (
    <div
      className={cn(
        marketing
          ? "mb-8 flex flex-col gap-4 sm:mb-10 sm:gap-5"
          : "mb-6 flex flex-col gap-3",
        center
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div
        className={cn(
          "min-w-0",
          center && marketing && "max-w-4xl xl:max-w-5xl",
          center && !marketing && "max-w-3xl"
        )}
      >
        {eyebrow && (
          <div
            className={cn(
              "font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400",
              marketing
                ? "mb-1 text-xs sm:text-sm"
                : "mb-2 text-xs",
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
              ? marketing
                ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                : "text-2xl sm:text-3xl lg:text-4xl"
              : marketing
                ? "text-xl sm:text-2xl md:text-3xl"
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
              "text-gray-600 dark:text-gray-400",
              marketing
                ? "mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base sm:leading-relaxed md:text-lg md:leading-snug"
                : "mt-2 text-sm sm:text-base",
              center
                ? marketing
                  ? "mx-auto max-w-3xl md:max-w-4xl"
                  : "mx-auto max-w-2xl"
                : marketing
                  ? "max-w-3xl md:max-w-4xl"
                  : "max-w-2xl"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && !center && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
