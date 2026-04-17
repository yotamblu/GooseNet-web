"use client";

import { useCallback, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./cn";

export interface TabItem<V extends string = string> {
  value: V;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps<V extends string = string> {
  items: TabItem<V>[];
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  /** Visual style. */
  variant?: "underline" | "pills";
  /** Tabs take up full width of container. */
  fullWidth?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

const SIZE: Record<NonNullable<TabsProps["size"]>, string> = {
  sm: "text-xs px-3 h-8",
  md: "text-sm px-4 h-10",
};

export default function Tabs<V extends string = string>({
  items,
  value,
  defaultValue,
  onChange,
  variant = "underline",
  fullWidth = false,
  size = "md",
  className,
  ariaLabel,
}: TabsProps<V>) {
  const reactId = useId();
  const layoutId = `tabs-indicator-${reactId}`;
  const [internal, setInternal] = useState<V | undefined>(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const reduce = useReducedMotion();

  const handleClick = useCallback(
    (v: V) => {
      if (value === undefined) setInternal(v);
      onChange?.(v);
    },
    [onChange, value]
  );

  const isPills = variant === "pills";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex gap-1",
        isPills
          ? "p-1 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200 dark:border-white/10"
          : "border-b border-gray-200 dark:border-white/10",
        fullWidth && "w-full",
        className
      )}
    >
      {items.map((item) => {
        const selected = item.value === active;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-disabled={item.disabled || undefined}
            disabled={item.disabled}
            onClick={() => !item.disabled && handleClick(item.value)}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 font-medium",
              "transition-colors duration-200 focus-visible:outline-none",
              SIZE[size],
              fullWidth && "flex-1",
              isPills ? "rounded-lg" : "rounded-none",
              selected
                ? isPills
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100",
              item.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 34 }
                }
                aria-hidden
                className={cn(
                  "absolute",
                  isPills
                    ? "inset-0 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-white/10"
                    : "-bottom-px left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                )}
              />
            )}
            <span className="relative z-[1] inline-flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
