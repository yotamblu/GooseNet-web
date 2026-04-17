/**
 * ZoomableWorkoutMap Component
 * Displays workout route using Leaflet with zoom and pan enabled.
 *
 * Leaflet logic is identical to the previous version. Only the wrapping
 * presentation — rounded glass border, fade-in mount, improved reset button,
 * and subtle legend — has been modernized.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./ui/cn";

// Dynamically import Leaflet to avoid SSR issues
let L: any = null;

interface ZoomableWorkoutMapProps {
  coordinates: [number, number][];
  className?: string;
}

export default function ZoomableWorkoutMap({ coordinates, className = "h-96" }: ZoomableWorkoutMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      L = require("leaflet");
    }
  }, []);

  useEffect(() => {
    if (!isClient || !L || !mapContainerRef.current || coordinates.length === 0) return;

    if (!mapRef.current) {
      try {
        if (L.Icon && L.Icon.Default && L.Icon.Default.prototype && typeof L.Icon.Default.prototype === 'object') {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
        }

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

        if (!L.latLng || !L.latLngBounds || !L.map || !L.tileLayer || !L.polyline || !L.marker || !L.icon) {
          console.error("Leaflet is not properly loaded");
          return;
        }

        const latLngs = coordinates.map((coord) => L.latLng(coord[0], coord[1]));
        const bounds = L.latLngBounds(latLngs);
        boundsRef.current = bounds;

        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true,
        });

        const mapContainer = mapRef.current.getContainer();
        if (mapContainer) {
          mapContainer.style.zIndex = '0';
          mapContainer.style.position = 'relative';
        }

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(bounds, { padding: [20, 20] });

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
          "relative w-full overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10",
          "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/5 dark:to-white/[0.02]",
          className
        )}
      >
        <div className="shimmer absolute inset-0 opacity-70" aria-hidden />
        <div className="relative flex h-full w-full items-center justify-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading map…</p>
        </div>
      </div>
    );
  }

  if (coordinates.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10",
          "bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-teal-400/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-teal-400/10",
          "flex items-center justify-center",
          className
        )}
      >
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No route data available</p>
      </div>
    );
  }

  const handleResetZoom = () => {
    if (mapRef.current && boundsRef.current) {
      mapRef.current.fitBounds(boundsRef.current, { padding: [20, 20] });
    }
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        ref={mapContainerRef}
        className={cn(
          "w-full relative z-0 overflow-hidden rounded-2xl",
          "border border-gray-200/70 dark:border-white/10",
          "shadow-md ring-1 ring-inset ring-white/40 dark:ring-white/5",
          className
        )}
      />

      {/* Reset View button */}
      <button
        type="button"
        onClick={handleResetZoom}
        className={cn(
          "absolute top-3 right-3 z-[1] inline-flex items-center gap-2 rounded-xl px-3 h-9 text-xs font-semibold",
          "bg-white/85 dark:bg-gray-900/75 backdrop-blur-md",
          "border border-gray-200/80 dark:border-white/10",
          "text-gray-800 dark:text-gray-100 shadow-sm",
          "transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-white dark:hover:bg-gray-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        )}
        title="Reset zoom"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Reset view
      </button>

      {/* North indicator */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-3 z-[1] flex h-9 w-9 flex-col items-center justify-center rounded-full bg-white/85 dark:bg-gray-900/75 backdrop-blur-md border border-gray-200/80 dark:border-white/10 shadow-sm"
      >
        <span
          className="absolute left-1/2 top-1 h-2 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"
        />
        <span className="mt-1 text-[9px] font-bold tracking-wide text-gray-700 dark:text-gray-200">N</span>
      </div>

      {/* Route legend */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-3 z-[1] inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-medium text-gray-700 dark:text-gray-200 bg-white/85 dark:bg-gray-900/75 backdrop-blur-md border border-gray-200/80 dark:border-white/10 shadow-sm"
      >
        <span className="h-0.5 w-4 rounded-full bg-blue-500" />
        Route
      </div>
    </motion.div>
  );
}
