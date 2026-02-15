/**
 * Single source of truth for the API base URL.
 * Override with NEXT_PUBLIC_API_BASE_URL in .env.local if needed (e.g. local dev).
 */

const DEFAULT_API_BASE_URL = "https://api.goosenet.space";

export const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  DEFAULT_API_BASE_URL;
