/**
 * GooseNet Design System — primitives barrel export.
 *
 * Usage (from anywhere):
 *   import { Button, Card, StatTile, fadeUp, stagger } from "@/app/components/ui";
 *   // or
 *   import { Button, Card } from "../components/ui";
 */

export { default as Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { default as Card, CardHeader, CardTitle, CardDescription, CardFooter } from "./Card";
export type { CardProps, CardVariant, CardPadding } from "./Card";

export { default as Input } from "./Input";
export type { InputProps } from "./Input";

export { default as Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

export { default as Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";

export { default as Label } from "./Label";
export type { LabelProps } from "./Label";

export { default as Badge } from "./Badge";
export type { BadgeProps, BadgeVariant, BadgeSize } from "./Badge";

export { default as Spinner } from "./Spinner";
export type { SpinnerProps, SpinnerSize } from "./Spinner";

export { default as Skeleton } from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";

export { default as StatTile } from "./StatTile";
export type { StatTileProps, StatAccent, StatTrendDirection } from "./StatTile";

export { default as SectionHeading } from "./SectionHeading";
export type { SectionHeadingProps } from "./SectionHeading";

export { default as PageContainer } from "./PageContainer";
export type { PageContainerProps, PageContainerWidth } from "./PageContainer";

export { default as PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";

export { default as Divider } from "./Divider";
export type { DividerProps } from "./Divider";

export { default as Tabs } from "./Tabs";
export type { TabsProps, TabItem } from "./Tabs";

export { default as Modal } from "./Modal";
export type { ModalProps } from "./Modal";

export { ToastProvider, useToast } from "./Toast";
export type { ToastInput, ToastItem, ToastVariant } from "./Toast";

export { default as AppShell } from "./AppShell";
export type { AppShellProps, AppShellNavItem } from "./AppShell";

export * from "./MotionPresets";

export { cn } from "./cn";
export type { ClassValue } from "./cn";
