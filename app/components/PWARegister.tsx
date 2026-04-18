/**
 * PWA Service Worker Registration Component
 * Registers the service worker for offline functionality.
 *
 * On each production deploy, NEXT_PUBLIC_BUILD_ID changes. If the stored id
 * differs, we clear Cache Storage, unregister old workers, and reload once
 * so users are not stuck on a cache-first shell from an older sw.js.
 */

"use client";

import { useEffect } from "react";

const BUILD_STORAGE_KEY = "goosenet-build-id";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const buildId = process.env.NEXT_PUBLIC_BUILD_ID || "development";

    const run = async () => {
      const previous = localStorage.getItem(BUILD_STORAGE_KEY);

      if (previous && previous !== buildId) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((reg) => reg.unregister()));
        } catch (e) {
          console.warn("GooseNet: cache / SW cleanup before reload failed", e);
        }
        localStorage.setItem(BUILD_STORAGE_KEY, buildId);
        window.location.reload();
        return;
      }

      if (!previous) {
        localStorage.setItem(BUILD_STORAGE_KEY, buildId);
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        if (process.env.NODE_ENV === "development") {
          console.log("Service Worker registered:", registration.scope);
        }

        setInterval(() => {
          registration.update();
        }, 60_000);
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    void run();

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}



