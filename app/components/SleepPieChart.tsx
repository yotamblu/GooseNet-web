/**
 * SleepPieChart Component
 * Displays a pie chart for sleep data breakdown (deep, light, REM, awake)
 */

"use client";

interface SleepPieChartProps {
  deepSleepSeconds: number;
  lightSleepSeconds: number;
  remSleepSeconds: number;
  awakeSeconds: number;
  className?: string;
}

export default function SleepPieChart({
  deepSleepSeconds,
  lightSleepSeconds,
  remSleepSeconds,
  awakeSeconds,
  className = "",
}: SleepPieChartProps) {
  const total = deepSleepSeconds + lightSleepSeconds + remSleepSeconds + awakeSeconds;

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No sleep data</p>
      </div>
    );
  }

  // Calculate percentages
  const deepPercent = (deepSleepSeconds / total) * 100;
  const lightPercent = (lightSleepSeconds / total) * 100;
  const remPercent = (remSleepSeconds / total) * 100;
  const awakePercent = (awakeSeconds / total) * 100;

  // Chart dimensions
  const size = 120;
  const radius = size / 2 - 5;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate angles for pie slices
  let currentAngle = -90; // Start at top

  const deepAngle = (deepPercent / 100) * 360;
  const lightAngle = (lightPercent / 100) * 360;
  const remAngle = (remPercent / 100) * 360;
  const awakeAngle = (awakePercent / 100) * 360;

  // Helper function to create path for pie slice
  const createSlice = (angle: number, color: string) => {
    if (angle === 0) return null;
    
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const result = { pathData, color, startAngle: currentAngle };
    currentAngle += angle;
    return result;
  };

  const deepSlice = createSlice(deepAngle, "#3b82f6"); // blue-600
  const lightSlice = createSlice(lightAngle, "#8b5cf6"); // purple-500
  const remSlice = createSlice(remAngle, "#ec4899"); // pink-500
  const awakeSlice = createSlice(awakeAngle, "#ef4444"); // red-500

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {deepSlice && (
            <path
              d={deepSlice.pathData}
              fill={deepSlice.color}
              className="transition-opacity hover:opacity-80"
            />
          )}
          {lightSlice && (
            <path
              d={lightSlice.pathData}
              fill={lightSlice.color}
              className="transition-opacity hover:opacity-80"
            />
          )}
          {remSlice && (
            <path
              d={remSlice.pathData}
              fill={remSlice.color}
              className="transition-opacity hover:opacity-80"
            />
          )}
          {awakeSlice && (
            <path
              d={awakeSlice.pathData}
              fill={awakeSlice.color}
              className="transition-opacity hover:opacity-80"
            />
          )}
        </svg>
        {/* Center text showing total sleep time */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {formatTime(deepSleepSeconds + lightSleepSeconds + remSleepSeconds)}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">sleep</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs w-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300">Deep</span>
          <span className="text-gray-500 dark:text-gray-400 ml-auto">
            {deepPercent.toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Light</span>
          <span className="text-gray-500 dark:text-gray-400 ml-auto">
            {lightPercent.toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-pink-500"></div>
          <span className="text-gray-700 dark:text-gray-300">REM</span>
          <span className="text-gray-500 dark:text-gray-400 ml-auto">
            {remPercent.toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Awake</span>
          <span className="text-gray-500 dark:text-gray-400 ml-auto">
            {awakePercent.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

