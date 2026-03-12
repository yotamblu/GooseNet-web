import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/dashboard/", "/settings", "/settings/", "/athletes", "/athlete/", "/flocks", "/flocks/", "/workouts", "/workouts/", "/planned-workouts", "/planned-workout/", "/activities", "/training-summary", "/workout", "/connect-coach/confirm", "/garmin/callback", "/login/google/success"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
