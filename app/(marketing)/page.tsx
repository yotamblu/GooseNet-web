/**
 * GooseNet Landing Page
 *
 * Auth-aware marketing surface. If a user is already signed in we redirect
 * to /dashboard — that behavior is preserved exactly. Only the loading /
 * redirecting fallbacks have been restyled, and the section composition has
 * been refreshed to consume the Agent 1 design system.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Header from "../components/Header";
import Hero from "../components/Hero";
import AnimatedDemoSection from "../components/AnimatedDemoSection";
import ForCoaches from "../components/ForCoaches";
import ForAthletes from "../components/ForAthletes";
import HowItWorks from "../components/HowItWorks";
import WhyGooseNet from "../components/WhyGooseNet";
import CoreValue from "../components/CoreValue";
import FinalCTA from "../components/FinalCTA";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";
import { Spinner } from "../components/ui";

function FullBleedFallback({ label }: { label: string }) {
  return (
    <div className="bg-aurora-subtle relative flex min-h-screen min-h-[100dvh] items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return <FullBleedFallback label="Loading GooseNet…" />;
  }

  if (user) {
    return <FullBleedFallback label="Redirecting to your dashboard…" />;
  }

  return (
    <main className="min-h-screen min-h-[100dvh] w-full max-w-full min-w-0 overflow-x-hidden bg-white dark:bg-gray-900">
      <Header />
      <Hero />
      <AnimatedDemoSection />
      <ForCoaches />
      <ForAthletes />
      <HowItWorks />
      <WhyGooseNet />
      <CoreValue />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
