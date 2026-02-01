/**
 * ZoomableWorkoutMap Component
 * Displays workout route using Leaflet with zoom and pan enabled
 */

"use client";

import { useEffect, useRef, useState } from "react";

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
        boundsRef.current = bounds; // Store bounds for reset

        // Create map with all interactions enabled for zooming
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true,
        });

        // Set z-index on map container
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
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });

        // Add polyline for the route
        const polyline = L.polyline(latLngs, {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.8,
        }).addTo(mapRef.current);
      } catch (error) {
        console.error("Error initializing Leaflet map:", error);
      }
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, isClient]);

  if (!isClient || !L) {
    return (
      <div className={`${className} w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map...</p>
      </div>
    );
  }

  if (coordinates.length === 0) {
    return (
      <div className={`${className} w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No route data available</p>
      </div>
    );
  }

  const handleResetZoom = () => {
    if (mapRef.current && boundsRef.current) {
      mapRef.current.fitBounds(boundsRef.current, { padding: [20, 20] });
    }
  };

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={`${className} w-full rounded-lg relative z-0`} />
      <button
        onClick={handleResetZoom}
        className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
        title="Reset zoom"
      >
        <svg
          className="w-4 h-4"
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
        Reset View
      </button>
    </div>
  );
}

