import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | GooseNet",
  description:
    "Create your GooseNet account as a runner or coach. Connect Garmin, get structured workouts, and train with real performance data.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
