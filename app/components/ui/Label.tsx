"use client";

import { forwardRef } from "react";
import { cn } from "./cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, children, required, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-gray-800 dark:text-gray-200 select-none",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-rose-500" aria-hidden>
          *
        </span>
      )}
    </label>
  );
});

export default Label;
