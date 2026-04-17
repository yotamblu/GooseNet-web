"use client";

import { forwardRef } from "react";
import { cn } from "./cn";

export type PageContainerWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "main" | "article";
  /** Controls max-width. Defaults to `xl` (≈ 1280px). */
  width?: PageContainerWidth;
  /** Adds vertical padding by default. */
  padded?: boolean;
}

const WIDTHS: Record<PageContainerWidth, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[88rem]",
  full: "max-w-none",
};

const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(function PageContainer(
  { as = "div", width = "xl", padded = true, className, children, ...props },
  ref
) {
  const Comp = as as React.ElementType;
  return (
    <Comp
      ref={ref}
      className={cn(
        "mx-auto w-full min-w-0 max-w-full px-4 sm:px-6 lg:px-8",
        WIDTHS[width],
        padded && "py-6 sm:py-8 lg:py-10",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});

export default PageContainer;
