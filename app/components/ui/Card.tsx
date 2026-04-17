"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./cn";

export type CardVariant = "default" | "glass" | "gradient-border" | "elevated";
export type CardPadding = "none" | "sm" | "md" | "lg";

type MotionDivProps = HTMLMotionProps<"div">;

export interface CardProps extends MotionDivProps {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  children?: React.ReactNode;
}

const PADDING: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const BASE = "relative rounded-2xl transition-[transform,box-shadow,background-color] duration-300";

const VARIANTS: Record<CardVariant, string> = {
  default:
    "bg-white border border-gray-200 shadow-sm " +
    "dark:bg-gray-900/60 dark:border-white/10",
  glass:
    "bg-white/70 backdrop-blur-xl border border-white/60 shadow-md " +
    "dark:bg-gray-900/60 dark:border-white/10",
  elevated:
    "bg-white shadow-lg border border-gray-100 " +
    "dark:bg-gray-900 dark:border-white/5 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)]",
  // gradient-border uses a layered trick: outer gradient + inner solid
  "gradient-border":
    "bg-[linear-gradient(var(--bg),var(--bg))_padding-box,linear-gradient(120deg,#3b82f6,#a855f7,#2dd4bf)_border-box] " +
    "border border-transparent " +
    "[--bg:#ffffff] dark:[--bg:#0f172a] " +
    "shadow-md",
};

const INTERACTIVE =
  "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900";

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "default",
    padding = "md",
    interactive = false,
    className,
    children,
    ...props
  },
  ref
) {
  const reduce = useReducedMotion();

  const motionProps =
    interactive && !reduce
      ? {
          whileHover: { y: -2 },
          transition: { type: "spring" as const, stiffness: 300, damping: 24 },
        }
      : {};

  return (
    <motion.div
      ref={ref}
      className={cn(
        BASE,
        VARIANTS[variant],
        PADDING[padding],
        interactive && INTERACTIVE,
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export default Card;

// Semantic sub-parts for convenience
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-600 dark:text-gray-400", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-center justify-end gap-2", className)} {...props} />;
}
