/**
 * Shared data for JSON-LD and FAQ section.
 * Single source of truth so visible content and schema match.
 */

import { SITE_URL } from "./site-config";

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GooseNet",
  url: SITE_URL,
  logo: `${SITE_URL}/logo/goosenet_logo.png`,
  sameAs: ["https://github.com/yotamblu/GooseNet-web"],
  description:
    "GooseNet connects runners and coaches through structured workouts, real performance data, and seamless Garmin integration.",
} as const;

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GooseNet",
  url: SITE_URL,
  description:
    "GooseNet connects runners and coaches through structured workouts, real performance data, and seamless Garmin integration. Built for real running training.",
} as const;

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is GooseNet?",
    answer:
      "GooseNet is a running platform that connects runners and coaches through structured workouts, real performance data from Garmin devices, and tools to assign, sync, and analyze training.",
  },
  {
    question: "How does Garmin integration work?",
    answer:
      "You link your Garmin account once. Workouts assigned by your coach sync to your Garmin, and when you complete them, your activity data (pace, heart rate, laps) syncs back to GooseNet for review.",
  },
  {
    question: "Who is GooseNet for?",
    answer:
      "GooseNet is for runners and running coaches who want structured training with real data: coaches who assign workouts and review execution, and athletes who train with a plan and sync from Garmin.",
  },
  {
    question: "How do I connect with my coach?",
    answer:
      "Sign up as an athlete, then use the coach connection page or the link/code your coach shares. Once connected, you can receive and sync assigned workouts and share completed sessions.",
  },
  {
    question: "What kind of workouts can coaches create?",
    answer:
      "Coaches can create structured running workouts with intervals, distances, paces, and rest. Workouts sync to athletes' Garmin devices and completed sessions show pace, heart rate, and lap-by-lap data.",
  },
  {
    question: "Is GooseNet free?",
    answer:
      "GooseNet offers a focused running and coaching experience. Check the signup and dashboard for current plans and features.",
  },
];

export const HOWTO_STEPS = [
  {
    name: "Connect Garmin",
    text: "Link your Garmin account to sync workouts and performance data automatically.",
  },
  {
    name: "Create or receive structured workouts",
    text: "Coaches build detailed workout plans. Athletes receive them instantly, ready to sync.",
  },
  {
    name: "Train, sync, and analyze performance",
    text: "Execute workouts on your Garmin, then review detailed metrics and share insights with your coach.",
  },
] as const;

export function getFAQPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getHowToJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to train with GooseNet",
    description:
      "A straightforward workflow for runners and coaches: connect Garmin, create or receive structured workouts, then train, sync, and analyze performance.",
    step: HOWTO_STEPS.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
