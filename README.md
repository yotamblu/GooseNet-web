# GooseNet Web

The web frontend for **GooseNet**, a running-focused platform that connects athletes and coaches through structured workouts, Garmin integration, and performance-driven analytics.

This repository contains the **Next.js (App Router)** web experience for GooseNet, including the public landing page, animated product demos, and future coach/athlete dashboards.

---

## 🏃 What is GooseNet?

GooseNet is built specifically for **running training**.

It helps coaches plan and assign structured workouts, allows athletes to execute them on their Garmin devices, and provides both sides with clean, actionable performance data after each session.

GooseNet is **not** a generic fitness app and **not** a social network. It is a focused training platform built around real coaching workflows.

---

## 🎯 Core Principles

* **Running-only** – no multi-sport clutter
* **Coach ↔ Athlete collaboration**
* **Structured workouts** (intervals, repeats, pace targets)
* **Garmin-native data**
* **Performance over aesthetics**
* **Data, not screenshots**

---

## ✨ Features (Current & Planned)

### Public Web

* Marketing and product landing pages
* Animated product demos (coach workflows, workout review)
* Lead capture and onboarding flows

### Coach Experience (Planned)

* Create structured running workouts
* Assign workouts to athletes
* Review completed sessions with real metrics
* Analyze pace consistency, heart rate trends, and laps
* Provide targeted feedback based on execution

### Athlete Experience (Planned)

* Receive structured workouts from a coach
* Sync workouts directly with Garmin
* Execute workouts on watch
* View detailed workout summaries
* Share results automatically with coach

---

## 🧠 Tech Stack

* **Next.js** (App Router)
* **TypeScript**
* **Tailwind CSS**
* **Dark / Light mode** (next-themes)
* **Framer Motion** (for UI demos and transitions, where applicable)

This repo focuses on the **web UI and experience** only.

---

## 📁 Project Structure (High Level)

```
app/                # Next.js App Router
components/         # Reusable UI components
sections/           # Landing page sections (Hero, Coaches, Athletes, Demo, etc.)
lib/                # Utilities and helpers
public/             # Static assets
```

---

## 🚧 Project Status

This project is under active development.

The current focus is:

* Building a strong product-first landing page
* Creating realistic animated demos of GooseNet workflows
* Establishing a clean design system for future dashboards

Backend services, mobile apps, and Garmin integrations live in separate repositories.

---

## 🔒 What This Repo Is / Is Not

### This repo **IS**:

* GooseNet’s web presence
* A foundation for future web dashboards
* A place to prototype and showcase product workflows

### This repo **IS NOT**:

* The API backend
* The mobile app
* A generic fitness or AI workout generator

---

## 🧩 Related Projects

* GooseNet API (backend services)
* GooseNet Mobile (React Native / native clients)

Links will be added as projects become public.

---

## 📌 Notes

* No pricing or monetization logic lives here (by design)
* Copy and UI prioritize clarity and performance credibility
* All demos are illustrative and designed to reflect real workflows

---

## 📬 Contact

If you’re a coach, athlete, or partner interested in GooseNet, the best entry point is the public site and early access forms.

More documentation will be added as the platform evolves.
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
