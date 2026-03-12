import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site-config";

const now = new Date().toISOString();

const publicRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/connect-coach`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE_URL}/connect-athlete`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes;
}
