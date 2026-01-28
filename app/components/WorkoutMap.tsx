/**
 * WorkoutMap Component
 * Displays workout route using Leaflet
 */

"use client";

import { useEffect, useRef, useState } from "react";

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
      <div className={`${className} w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map...</p>
      </div>
    );
  }

  if (coordinates.length === 0) {
    return (
      <div className={`${className} w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No route data available</p>
      </div>
    );
  }

  return <div ref={mapContainerRef} className={`${className} w-full rounded-b-lg relative z-0`} />;
}

