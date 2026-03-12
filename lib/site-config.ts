/**
 * Public site URL for canonical links, Open Graph, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in .env.local to override (e.g. http://localhost:3000).
 */

const DEFAULT_SITE_URL = "https://goosenet.space";

export const SITE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
  DEFAULT_SITE_URL;

/** Base URL for use in Metadata (must be URL object for Next.js metadataBase). */
export function getMetadataBase(): URL {
  return new URL(SITE_URL);
}
