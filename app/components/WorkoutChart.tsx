/**
 * WorkoutChart Component
 * Displays a line chart for workout data over time with hover tooltips
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface WorkoutChartProps {
  data: number[];
  labels?: string[];
  title: string;
  unit: string;
  color?: string;
  className?: string;
  minValue?: number;
  maxValue?: number;
  timeData?: number[]; // Time in seconds for each data point
  formatValue?: (value: number) => string; // Custom formatter for tooltip value
  invertYAxis?: boolean; // If true, invert Y-axis (for pace where lower is better)
}

export default function WorkoutChart({
  data,
  labels,
  title,
  unit,
  color = "#3b82f6",
  className = "",
  minValue,
  maxValue,
  timeData,
  formatValue,
  invertYAxis = false,
}: WorkoutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  // Calculate min and max values
  const dataMin = minValue !== undefined ? minValue : (data.length > 0 ? Math.min(...data) : 0);
  const dataMax = maxValue !== undefined ? maxValue : (data.length > 0 ? Math.max(...data) : 100);
  const range = dataMax - dataMin || 1; // Avoid division by zero

  // Chart dimensions
  const width = 800;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate points for the line
  const points = data.length > 1
    ? data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        // Invert Y-axis if needed (for pace: lower values at top, higher at bottom)
        const normalizedValue = invertYAxis 
          ? ((value - dataMin) / range) * chartHeight
          : chartHeight - ((value - dataMin) / range) * chartHeight;
        const y = padding + normalizedValue;
        return { x, y, value, index };
      })
    : data.length === 1
    ? (() => {
        const normalizedValue = invertYAxis
          ? ((data[0] - dataMin) / range) * chartHeight
          : chartHeight - ((data[0] - dataMin) / range) * chartHeight;
        return [{ x: padding + chartWidth / 2, y: padding + normalizedValue, value: data[0], index: 0 }];
      })()
    : [];

  const pointsString = points.map(p => `${p.x},${p.y}`).join(" ");

  // Generate grid lines
  const gridLines = [];
  const numGridLines = 5;
  for (let i = 0; i <= numGridLines; i++) {
    const y = padding + (chartHeight / numGridLines) * i;
    // Invert value calculation if Y-axis is inverted
    const value = invertYAxis
      ? dataMin + (range / numGridLines) * i
      : dataMax - (range / numGridLines) * i;
    gridLines.push({ y, value });
  }

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !containerRef.current || points.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to SVG coordinates
    const svgX = (mouseX / rect.width) * width;
    const svgY = (mouseY / rect.height) * height;

    // Find the closest data point
    let closestIndex = 0;
    let minDistance = Infinity;

    points.forEach((point, index) => {
      const distance = Math.sqrt(Math.pow(point.x - svgX, 2) + Math.pow(point.y - svgY, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Only show tooltip if mouse is near the line (within reasonable distance)
    const threshold = 50; // pixels
    const closestPoint = points[closestIndex];
    const distance = Math.sqrt(
      Math.pow((closestPoint.x / width) * rect.width - mouseX, 2) +
      Math.pow((closestPoint.y / height) * rect.height - mouseY, 2)
    );

    if (distance < threshold) {
      setHoveredIndex(closestIndex);
      setTooltipPosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      });
    } else {
      setHoveredIndex(null);
      setTooltipPosition(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPosition(null);
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 relative ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
      </div>
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full cursor-crosshair"
          preserveAspectRatio="none"
          style={{ minHeight: `${height}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          {gridLines.map((grid, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={grid.y}
                x2={width - padding}
                y2={grid.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200 dark:text-gray-700"
                opacity="0.5"
              />
              <text
                x={padding - 10}
                y={grid.y + 4}
                textAnchor="end"
                fontSize="10"
                className="fill-gray-500 dark:fill-gray-400"
              >
                {grid.value.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Chart line */}
          <polyline
            points={pointsString}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area fill */}
          {data.length > 0 && (
            <polygon
              points={`${padding},${padding + chartHeight} ${pointsString} ${width - padding},${padding + chartHeight}`}
              fill={color}
              opacity="0.1"
            />
          )}

          {/* Hover indicator line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padding}
              x2={hoveredPoint.x}
              y2={padding + chartHeight}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
            />
          )}

          {/* Hover indicator point */}
          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="5"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="dark:stroke-gray-800"
            />
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredPoint && tooltipPosition && (
        <div
          className="absolute z-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
          style={{
            left: `${Math.min(tooltipPosition.x + 10, (containerRef.current?.offsetWidth || 0) - 200)}px`,
            top: `${tooltipPosition.y - 50}px`,
            transform: tooltipPosition.y < 50 ? 'translateY(0)' : 'translateY(-100%)',
          }}
        >
          <div className="font-semibold mb-1">{title}</div>
          <div className="text-xs opacity-90">
            {timeData && timeData[hoveredPoint.index] !== undefined
              ? `Time: ${formatTime(timeData[hoveredPoint.index])}`
              : `Index: ${hoveredPoint.index + 1}`}
          </div>
          <div className="text-lg font-bold mt-1">
            {formatValue ? formatValue(hoveredPoint.value) : `${hoveredPoint.value.toFixed(2)} ${unit}`}
          </div>
        </div>
      )}
    </div>
  );
}

