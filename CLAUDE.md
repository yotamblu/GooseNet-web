# GooseNet Web — CLAUDE.md

## What this project is

GooseNet is a **running-only** training platform that connects coaches and athletes through structured workouts, Garmin integration, and performance analytics. This repository is the **Next.js web frontend** (`goosenet-2`). The backend API lives at `https://api.goosenet.space`. There are separate repos for the API and the mobile app.

## Tech stack

- **Next.js 14+ (App Router)** — all routing is file-based under `app/`
- **TypeScript** throughout
- **Tailwind CSS** for styling; design tokens via CSS variables in `app/globals.css`
- **Framer Motion** for animation; always gate on `useReducedMotion()`
- **next-themes** for dark/light mode (default: dark)
- **Vercel Analytics** — already wired in `layout.tsx`
- **PWA** — manifest + service worker via `PWARegister`

## App structure

```
app/
  (marketing)/        # Public landing page (auth-aware → redirects to /dashboard if signed in)
  dashboard/          # Main hub after login
  athletes/           # Coach view: list + individual athlete profiles
  athlete/            # Athlete self-view
  workouts/           # Workout feed + detail + creation (new/running, new/strength)
  planned-workouts/   # Planned workout feed + detail
  planned-workout/    # Single planned workout view
  workout/            # Completed workout detail
  flocks/             # Coach group management (create, manage)
  garmin/             # Garmin OAuth callback
  activities/         # Activity feed
  sleep/              # Sleep data
  training-summary/   # Training summary view
  strength-workout/   # Strength workout detail
  settings/           # User settings
  login/              # Login page
  signup/             # Signup page
  connect-athlete/    # Coach→athlete connection flow
  connect-coach/      # Athlete→coach connection flow
  components/         # Shared UI components (marketing + app)
  components/ui/      # Design system primitives (Button, Card, StatTile, etc.)
  services/api.ts     # Centralized API service class (use this, not raw fetch)
  AuthContext.tsx      # Auth context (in app/context/ or app/)
context/
  AuthContext.tsx      # React context for auth state
hooks/
  useRequireAuth.ts   # Redirect hook for protected pages
lib/
  api.ts              # Low-level apiFetch() with JWT + 401 handling
  api-config.ts       # API_BASE_URL constant (https://api.goosenet.space)
  auth.ts             # getToken / clearToken (localStorage JWT)
  api-helpers.ts      # Convenience wrappers
  site-config.ts      # Metadata base URL helper
  profile-pic-utils.ts
  theme-storage.ts    # THEME_STORAGE_KEY constant
```

## Auth

- JWT stored in `localStorage` under key `authToken`
- `AuthContext` provides `user`, `token`, `login()`, `logout()`, `isLoading`
- `useRequireAuth()` hook redirects unauthenticated users to `/login`
- `apiFetch()` in `lib/api.ts` auto-attaches the JWT and handles 401→redirect
- `apiService` in `app/services/api.ts` is the preferred higher-level service class

## Design system (see COLOR_GUIDELINES.md for full detail)

**Colors:** Brand blue `#3b82f6` / `#2563eb`, brand purple `#a855f7` / `#9333ea`. Data accents: teal (positive), amber (streaks/PRs), rose (errors), cyan (info). Dark page bg `#0b0f17`.

**Surfaces:** Glass card = `bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10` or `.glass-surface`. Use `<Card variant="glass">`.

**Components (import from `../components/ui`):**
`Button`, `Card`, `Input`, `Textarea`, `Select`, `Label`, `Badge`, `Divider`, `Spinner`, `Skeleton`, `StatTile`, `SectionHeading`, `PageHeader`, `PageContainer`, `Tabs`, `Modal`, `Toast/useToast`, `AppShell`

**Motion presets** in `app/components/ui/MotionPresets.ts`: `fadeUp`, `fadeIn`, `scaleIn`, `slideInRight`, `stagger`, `hoverLift`, `tapScale`, `inViewOnce`, etc.

**Layout:** Authenticated pages use `<AppShell>`. Marketing pages use `<PageContainer>`.

## API service methods (app/services/api.ts)

Key methods on `apiService`:
- `login(username, password)` — hashes password SHA-256 before sending
- `getCurrentUser()` — GET /me equivalent
- `getAthletes(apiKey)`, `getFlocks(apiKey)`, `createFlock(...)`, `addToFlock(...)`, `removeAthleteFromFlock(...)`
- `validateGarminConnection(apiKey)`, `requestGarminToken(apiKey)`, `getGarminAccessToken*(...)`
- `getWorkoutSummary(...)`, `getWorkoutFeed(...)`, `getWorkout(userName, id)`, `getWorkoutData(...)`
- `getPlannedWorkoutFeed(...)`, `getPlannedWorkoutsByDate(...)`
- `getStrengthWorkout(workoutId)`, `submitStrengthWorkoutReview(...)`
- `getProfilePic(userName)`, `getWorkoutData(...)` with lap/sample data

## Key conventions

- All pages are `"use client"` (no RSC data fetching patterns yet)
- Protected pages call `useRequireAuth()` at the top
- Never hardcode colors — use Tailwind utilities or CSS vars
- Always pass `useReducedMotion()` check before animating
- Use the UI primitives barrel (`../components/ui`) not raw Tailwind stacks for new pages
- No mock data in production pages

## Running locally

```bash
npm run dev     # starts on http://localhost:3000
npm run build   # production build
npm run lint    # ESLint check
```

Override API URL for local backend: set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` in `.env.local`.

## What this repo is NOT

- Not the API backend (separate repo, deployed at `api.goosenet.space`)
- Not the mobile app (separate React Native / native repo)
- Not a generic fitness app or AI workout generator
