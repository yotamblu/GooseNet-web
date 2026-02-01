/**
 * LapBarChart Component
 * Displays laps as bars with height based on pace, width based on distance, and color based on pace
 */

"use client";

interface Lap {
  lapDistanceInKilometers: number;
  lapDurationInSeconds: number;
  lapPaceInMinKm: number;
  avgHeartRate: number;
}

interface LapBarChartProps {
  laps: Lap[];
  className?: string;
  selectedLapIndex?: number | null;
  onLapClick?: (index: number) => void;
}

export default function LapBarChart({ laps, className = "", selectedLapIndex = null, onLapClick }: LapBarChartProps) {
  if (laps.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Lap Performance</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No lap data available</p>
      </div>
    );
  }

  // Calculate total distance for relative widths
  const totalDistance = laps.reduce((sum, lap) => sum + lap.lapDistanceInKilometers, 0);

  // Find min and max pace for color gradient and height normalization
  const paces = laps.map(lap => lap.lapPaceInMinKm);
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const paceRange = maxPace - minPace || 1; // Avoid division by zero

  // Color gradient function: faster (lower pace) = blue/purple, slower (higher pace) = red/orange
  // Using GooseNet color scheme: blue-600 to purple-600 for fast, purple-600 to red-500 for slow
  const getColorForPace = (pace: number): string => {
    // Normalize pace to 0-1 range (0 = fastest, 1 = slowest)
    const normalized = (pace - minPace) / paceRange;
    
    // Split into two gradients:
    // Fast laps (0-0.5): Blue to Purple (blue-600 -> purple-600)
    // Slow laps (0.5-1): Purple to Red (purple-600 -> red-500)
    
    if (normalized <= 0.5) {
      // Fast: Blue to Purple gradient
      const ratio = normalized * 2; // 0 to 1
      // Interpolate between blue-600 (#2563eb) and purple-600 (#9333ea)
      const r = Math.round(37 + (147 - 37) * ratio);
      const g = Math.round(99 + (51 - 99) * ratio);
      const b = Math.round(235 + (234 - 235) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Slow: Purple to Red gradient
      const ratio = (normalized - 0.5) * 2; // 0 to 1
      // Interpolate between purple-600 (#9333ea) and red-500 (#ef4444)
      const r = Math.round(147 + (239 - 147) * ratio);
      const g = Math.round(51 + (68 - 51) * ratio);
      const b = Math.round(234 + (68 - 234) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Calculate bar dimensions
  const bars = laps.map((lap, index) => {
    // Height: Inverted pace (lower pace = faster = higher bar)
    // Normalize to 0-1 range where 0 = slowest (lowest bar), 1 = fastest (highest bar)
    const normalizedPace = (maxPace - lap.lapPaceInMinKm) / paceRange;
    const height = Math.max(normalizedPace * 100, 10); // Min 10% height, max 100%

    // Width: Relative to total distance
    const width = (lap.lapDistanceInKilometers / totalDistance) * 100;

    return {
      index,
      lap,
      height,
      width,
      color: getColorForPace(lap.lapPaceInMinKm),
    };
  });

  // Chart dimensions
  const chartHeight = 200;
  const chartPadding = 20;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking directly on the container div (not on a bar), deselect
    const target = e.target as HTMLElement;
    if (target === e.currentTarget || target.classList.contains('flex') || target.classList.contains('relative')) {
      onLapClick?.(null);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Lap Performance</h2>
      <div className="relative cursor-pointer" onClick={handleContainerClick}>
        <div
          className="flex items-end"
          style={{
            height: `${chartHeight}px`,
            padding: `${chartPadding}px 0`,
          }}
        >
          {bars.map((bar, index) => {
            const isSelected = selectedLapIndex === index;
            return (
              <div
                key={index}
                className="relative group cursor-pointer"
                style={{
                  width: `${bar.width}%`,
                  height: `${chartHeight - chartPadding * 2}px`,
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent container click
                  onLapClick?.(index);
                }}
              >
                <div
                  className={`w-full transition-all hover:opacity-80 ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-400 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{
                    height: `${bar.height}%`,
                    backgroundColor: bar.color,
                    minHeight: '4px', // Ensure very small bars are visible
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isSelected ? 10 : 1,
                    borderWidth: 'clamp(1px, 0.15vw, 2px)',
                    borderStyle: 'solid',
                    boxShadow: isSelected 
                      ? `0 0 0 clamp(1px, 0.15vw, 2px) rgba(59, 130, 246, 0.5), 0 0 0 clamp(2px, 0.3vw, 4px) rgba(59, 130, 246, 0.3)` 
                      : 'none',
                  }}
                  title={`Lap ${bar.index + 1}: ${bar.lap.lapDistanceInKilometers.toFixed(2)} km, Pace: ${Math.floor(bar.lap.lapPaceInMinKm)}:${Math.round((bar.lap.lapPaceInMinKm - Math.floor(bar.lap.lapPaceInMinKm)) * 60).toString().padStart(2, '0')} /km`}
                />
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels (pace range) */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Fastest: {Math.floor(minPace)}:{Math.round((minPace - Math.floor(minPace)) * 60).toString().padStart(2, '0')} /km</span>
          <span>Slowest: {Math.floor(maxPace)}:{Math.round((maxPace - Math.floor(maxPace)) * 60).toString().padStart(2, '0')} /km</span>
        </div>
      </div>
    </div>
  );
}

