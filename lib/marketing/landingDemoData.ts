/**
 * Canonical sample data for marketing demos — matches product vocabulary
 * (training summary stats, Garmin device names, interval zones).
 */

export const DEMO_PRIMARY_ATHLETE = {
  name: "Maya Chen",
  initial: "M",
} as const;

export const DEMO_ROSTER = [
  { name: "Maya Chen", initial: "M", status: "synced" as const },
  { name: "Jordan Park", initial: "J", status: "queued" as const },
  { name: "Sam Okonkwo", initial: "S", status: "synced" as const },
];

export const DEMO_WORKOUT = {
  name: "Tempo + Repeats",
  assignDateLabel: "Wed, Apr 23",
  device: "Forerunner 265",
} as const;

export type DemoIntervalZone = "warmup" | "work" | "recovery" | "cooldown";

export const DEMO_INTERVAL_ROWS: {
  zone: DemoIntervalZone;
  title: string;
  detail: string;
}[] = [
  { zone: "warmup", title: "Warm-up", detail: "12:00 easy build" },
  { zone: "work", title: "Tempo", detail: "2 × 12:00 @ ~4:05/km" },
  { zone: "recovery", title: "Recovery", detail: "400 m jog between" },
  { zone: "work", title: "Repeats", detail: "6 × 400 m @ 3:48–4:02/km" },
  { zone: "cooldown", title: "Cool-down", detail: "10:00 easy spin" },
];

export const DEMO_SESSION = {
  distanceKm: 10.82,
  durationLabel: "47:52",
  avgPace: "4:25/km",
  avgHr: 166,
} as const;

/** Mini-chart series (min/km) — post-tempo roll-off */
export const DEMO_PACE_SERIES = [
  5.1, 4.9, 4.6, 4.35, 4.22, 4.18, 4.2, 4.15, 4.12, 4.08, 4.1, 4.35, 4.5, 4.7,
];

export const DEMO_HR_SERIES = [
  118, 132, 148, 158, 162, 165, 168, 170, 169, 167, 166, 155, 142, 128,
];

export const DEMO_LAP_PACE_MIN_KM = [4.05, 4.02, 3.98, 4.01, 3.96, 4.0];

/** One week of daily km for dashboard preview — spread for a readable chart */
export const DEMO_DAILY_KM: { label: string; km: number }[] = [
  { label: "Mon", km: 6.4 },
  { label: "Tue", km: 11.2 },
  { label: "Wed", km: 0 },
  { label: "Thu", km: 12.8 },
  { label: "Fri", km: 5.1 },
  { label: "Sat", km: 16.4 },
  { label: "Sun", km: 7.9 },
];

export const DEMO_SUMMARY_TOTALS = {
  totalKm: 52.42,
  avgDailyKm: 7.49,
  totalTimeLabel: "4h 38m",
  avgDailyTimeLabel: "39:43",
  startLabel: "4/21/2026",
  endLabel: "4/27/2026",
  workoutCount: 6,
} as const;
