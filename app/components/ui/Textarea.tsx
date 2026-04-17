"use client";

import { forwardRef, useId } from "react";
import { cn } from "./cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, error, className, id, required, rows = 4, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `textarea-${autoId}`;
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={describedById}
        required={required}
        className={cn(
          "w-full max-w-full min-w-0 rounded-xl px-3 py-2.5 text-sm transition-colors resize-y",
          "bg-white dark:bg-gray-900/60",
          "text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "border outline-none",
          invalid
            ? "border-rose-500/70 focus:border-rose-500"
            : "border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400",
          "focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30",
          className
        )}
        {...props}
      />
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

export default Textarea;
