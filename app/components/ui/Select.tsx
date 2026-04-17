"use client";

import { forwardRef, useId } from "react";
import { cn } from "./cn";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  /** If provided, will render these options — otherwise provide `children`. */
  options?: SelectOption[];
  placeholder?: string;
  selectSize?: "sm" | "md" | "lg";
}

const SIZE: Record<NonNullable<SelectProps["selectSize"]>, string> = {
  sm: "h-9 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    error,
    options,
    placeholder,
    className,
    id,
    selectSize = "md",
    required,
    children,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `select-${autoId}`;
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
      <div className="relative w-full max-w-full min-w-0">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={invalid || undefined}
          aria-describedby={describedById}
          required={required}
          className={cn(
            "w-full max-w-full min-w-0 appearance-none rounded-xl pl-3 pr-9 transition-colors",
            "bg-white dark:bg-gray-900/60",
            "text-gray-900 dark:text-gray-100",
            "border outline-none",
            invalid
              ? "border-rose-500/70 focus:border-rose-500"
              : "border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400",
            "focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30",
            SIZE[selectSize],
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {/* Chevron */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
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

export default Select;
