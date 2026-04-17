import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | GooseNet",
  description:
    "Sign in to your GooseNet account to access your dashboard, workouts, and coaching tools.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-aurora-subtle min-h-screen">
      {children}
    </div>
  );
}
