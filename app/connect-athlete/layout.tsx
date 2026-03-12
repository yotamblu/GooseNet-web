import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite Athlete | GooseNet",
  description:
    "Share your coach code or link so athletes can connect with you on GooseNet and receive structured workouts.",
};

export default function ConnectAthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
