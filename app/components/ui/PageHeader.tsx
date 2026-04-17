"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./cn";

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional breadcrumb/eyebrow rendered above the title. */
  eyebrow?: React.ReactNode;
  /** Right-aligned action slot, e.g. a group of Buttons. */
  actions?: React.ReactNode;
  /** Apply gradient styling to the title text. */
  gradient?: boolean;
  /** Optional bottom spacing; true by default. */
  spaced?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  gradient = false,
  spaced = true,
  className,
}: PageHeaderProps) {
  const reduce = useReducedMotion();

  const enter = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };

  return (
    <motion.header
      {...enter}
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        spaced && "mb-6 sm:mb-8",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </div>
        )}
        <h1
          className={cn(
            "display-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight",
            gradient
              ? "text-gradient-brand"
              : "text-gray-900 dark:text-gray-50"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </motion.header>
  );
}
