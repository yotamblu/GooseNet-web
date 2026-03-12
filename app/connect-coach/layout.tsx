import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect with Your Coach | GooseNet",
  description:
    "Enter your coach code to connect with your coach on GooseNet. Receive and sync structured workouts to your Garmin.",
};

export default function ConnectCoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
