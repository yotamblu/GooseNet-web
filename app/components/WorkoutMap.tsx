/**
 * WorkoutMap Component
 * Displays workout route using Leaflet (non-interactive thumbnail variant).
 *
 * Keeps all Leaflet logic identical to previous version; only the outer
 * presentation (rounded glass frame, fade-in mount animation, shimmer loading
 * state, small north indicator) has been modernized.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./ui/cn";

// Dynamically import Leaflet to avoid SSR issues
let L: any = null;

interface WorkoutMapProps {
  coordinates: [number, number][];
  className?: string;
}

export default function WorkoutMap({ coordinates, className = "h-48" }: WorkoutMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setIsClient(true);

    // Load Leaflet only on client side
    if (typeof window !== "undefined") {
      L = require("leaflet");
    }
  }, []);

  useEffect(() => {
    if (!isClient || !L || !mapContainerRef.current || coordinates.length === 0) return;

    // Initialize map
    if (!mapRef.current) {
      try {
        // Fix for default marker icon issue in Next.js
        if (L.Icon && L.Icon.Default && L.Icon.Default.prototype && typeof L.Icon.Default.prototype === 'object') {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
        }

        // Use CDN for marker icons (allowed in Next.js image domains)
        if (L.Icon && typeof L.Icon.extend === 'function') {
          const DefaultIcon = L.Icon.extend({
            options: {
              iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            },
          });

          L.Icon.Default = new DefaultIcon();
        }

        // Calculate bounds
        if (!L.latLng || !L.latLngBounds || !L.map || !L.tileLayer || !L.polyline || !L.marker || !L.icon) {
          console.error("Leaflet is not properly loaded");
          return;
        }

        const latLngs = coordinates.map((coord) => L.latLng(coord[0], coord[1]));
        const bounds = L.latLngBounds(latLngs);

        // Create map with all interactions disabled
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
          attributionControl: false,
        });

        // Set z-index on map container to ensure it stays below nav bar (z-50)
        const mapContainer = mapRef.current.getContainer();
        if (mapContainer) {
          mapContainer.style.zIndex = '0';
          mapContainer.style.position = 'relative';
        }

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);

        // Fit map to bounds
        mapRef.current.fitBounds(bounds, { padding: [16, 16] });

        // Add polyline for the route
        L.polyline(latLngs, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.9,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(mapRef.current);
      } catch (error) {
        console.error("Error initializing Leaflet map:", error);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, isClient]);

  if (!isClient || !L) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10",
          "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/5 dark:to-white/[0.02]",
          className
        )}
      >
        <div className="shimmer absolute inset-0 opacity-70" aria-hidden />
        <div className="relative flex h-full w-full items-center justify-center">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Loading map…</p>
        </div>
      </div>
    );
  }

  if (coordinates.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10",
          "bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-teal-400/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-teal-400/10",
          "flex items-center justify-center",
          className
        )}
      >
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No route data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        "border border-gray-200/70 dark:border-white/10",
        "shadow-sm ring-1 ring-inset ring-white/40 dark:ring-white/5",
        className
      )}
    >
      <div ref={mapContainerRef} className="h-full w-full relative z-0" />

      {/* North indicator */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-2 right-2 z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm border border-white/60 dark:border-white/10 shadow-sm"
      >
        <span className="text-[9px] font-bold tracking-wide text-blue-600 dark:text-blue-400">N</span>
        <span
          className="absolute left-1/2 top-0.5 h-1.5 w-0.5 -translate-x-1/2 rounded-full bg-blue-500"
        />
      </div>
    </motion.div>
  );
}
