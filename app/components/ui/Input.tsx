"use client";

import { forwardRef, useId } from "react";
import { cn } from "./cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Size label distinct from native `size` attribute. */
  inputSize?: "sm" | "md" | "lg";
}

const SIZE: Record<NonNullable<InputProps["inputSize"]>, string> = {
  sm: "h-9 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    iconLeft,
    iconRight,
    className,
    id,
    inputSize = "md",
    required,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `input-${autoId}`;
  const describedById = helperText || error ? `${inputId}-desc` : undefined;
  const invalid = Boolean(error);

  return (
    <div className="w-full max-w-full min-w-0">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-500" aria-hidden>*</span>}
        </label>
      )}

      <div
        className={cn(
          "group relative flex items-center w-full max-w-full min-w-0 rounded-xl transition-colors",
          "bg-white dark:bg-gray-900/60",
          "border",
          invalid
            ? "border-rose-500/70 focus-within:border-rose-500"
            : "border-gray-300 dark:border-white/10 focus-within:border-blue-500 dark:focus-within:border-blue-400",
          "focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-400/30"
        )}
      >
        {iconLeft && (
          <span className="pl-3 text-gray-400 dark:text-gray-500" aria-hidden>
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={invalid || undefined}
          aria-describedby={describedById}
          required={required}
          className={cn(
            "w-full min-w-0 bg-transparent outline-none",
            "text-gray-900 dark:text-gray-100",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "px-3",
            iconLeft && "pl-2",
            iconRight && "pr-2",
            SIZE[inputSize],
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="pr-3 text-gray-400 dark:text-gray-500" aria-hidden>
            {iconRight}
          </span>
        )}
      </div>

      {(helperText || error) && (
        <p
          id={describedById}
          className={cn(
            "mt-1.5 text-xs",
            invalid ? "text-rose-500" : "text-gray-500 dark:text-gray-400"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
