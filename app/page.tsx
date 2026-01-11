/**
 * GooseNet Landing Page
 * Running-focused platform connecting athletes and coaches
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AnimatedDemoSection from "./components/AnimatedDemoSection";
import ForCoaches from "./components/ForCoaches";
import HowItWorks from "./components/HowItWorks";
import WhyGooseNet from "./components/WhyGooseNet";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page if user is logged in (redirect is in progress)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Only render landing page if user is not logged in
  return (
    <main className="min-h-screen min-h-[100dvh] bg-white dark:bg-gray-900">
      <Header />
      <Hero />
      <AnimatedDemoSection />
      <ForCoaches />
      <HowItWorks />
      <WhyGooseNet />
      <FinalCTA />
      <Footer />
    </main>
  );
}
