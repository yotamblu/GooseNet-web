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
