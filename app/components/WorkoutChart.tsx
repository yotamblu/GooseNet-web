/**
 * WorkoutChart Component
 *
 * Renders a workout time-series (heart rate / pace / elevation / etc.) as a
 * smooth spline with a gradient area fill, animated stroke draw on mount, a
 * subtle dashed grid, and a glassy hover crosshair tooltip.
 *
 * The exported props shape is identical to the previous implementation —
 * external pages can keep passing the same data.
 */

"use client";

import { useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./ui/cn";

interface WorkoutChartProps {
  data: number[];
  labels?: string[];
  title: string;
  unit: string;
  color?: string;
  className?: string;
  minValue?: number;
  maxValue?: number;
  timeData?: number[];
  formatValue?: (value: number) => string;
  invertYAxis?: boolean;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Build a smooth SVG path (Catmull-Rom-style) through the given points.
 * Keeps line visually smooth while still going through every data point.
 */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export default function WorkoutChart({
  data,
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
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const gradId = `wc-grad-${uid}`;
  const glowId = `wc-glow-${uid}`;

  const width = 800;
  const height = 220;
  const padding = { top: 16, right: 24, bottom: 24, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { points, dataMin, dataMax, range } = useMemo(() => {
    if (data.length === 0) {
      return { points: [] as { x: number; y: number; value: number; index: number }[], dataMin: 0, dataMax: 1, range: 1 };
    }
    const _min = minValue !== undefined ? minValue : Math.min(...data);
    const _max = maxValue !== undefined ? maxValue : Math.max(...data);
    const _range = _max - _min || 1;

    const mapPoint = (value: number, index: number) => {
      const x = data.length > 1
        ? padding.left + (index / (data.length - 1)) * chartWidth
        : padding.left + chartWidth / 2;
      const normalized = invertYAxis
        ? ((value - _min) / _range) * chartHeight
        : chartHeight - ((value - _min) / _range) * chartHeight;
      const y = padding.top + normalized;
      return { x, y, value, index };
    };

    return {
      points: data.map(mapPoint),
      dataMin: _min,
      dataMax: _max,
      range: _range,
    };
  }, [data, minValue, maxValue, invertYAxis, chartWidth, chartHeight, padding.left, padding.top]);

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "w-full max-w-full min-w-0 rounded-2xl border border-gray-200 dark:border-white/10",
          "bg-white dark:bg-gray-900/60 p-4 sm:p-6",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(padding.top + chartHeight).toFixed(2)} L ${points[0].x.toFixed(2)} ${(padding.top + chartHeight).toFixed(2)} Z`
      : "";

  // Grid lines
  const gridLines: { y: number; value: number }[] = [];
  const numGridLines = 4;
  for (let i = 0; i <= numGridLines; i++) {
    const y = padding.top + (chartHeight / numGridLines) * i;
    const value = invertYAxis
      ? dataMin + (range / numGridLines) * i
      : dataMax - (range / numGridLines) * i;
    gridLines.push({ y, value });
  }

  const handlePointerPosition = (clientX: number, clientY: number) => {
    if (!svgRef.current || !containerRef.current || points.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const pointerX = clientX - rect.left;

    const svgX = (pointerX / rect.width) * width;
    // Map x to nearest data index (linear spacing)
    const idxRaw = ((svgX - padding.left) / chartWidth) * (points.length - 1);
    const closestIndex = Math.round(Math.max(0, Math.min(points.length - 1, idxRaw)));

    if (svgX < padding.left - 10 || svgX > padding.left + chartWidth + 10) {
      setHoveredIndex(null);
      setTooltipPosition(null);
      return;
    }

    setHoveredIndex(closestIndex);
    setTooltipPosition({
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) =>
    handlePointerPosition(e.clientX, e.clientY);

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const t = e.touches[0];
      handlePointerPosition(t.clientX, t.clientY);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPosition(null);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setHoveredIndex(null);
      setTooltipPosition(null);
    }, 1500);
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-full min-w-0 rounded-2xl border border-gray-200 dark:border-white/10",
        "bg-white dark:bg-gray-900/60 p-4 sm:p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {unit}
        </span>
      </div>

      <div className="w-full max-w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-w-full cursor-crosshair touch-none"
          preserveAspectRatio="none"
          style={{ aspectRatio: `${width} / ${height}`, touchAction: "none" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="60%" stopColor={color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((grid, index) => (
            <g key={index}>
              <line
                x1={padding.left}
                y1={grid.y}
                x2={width - padding.right}
                y2={grid.y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 4"
                className="text-gray-300/80 dark:text-white/10"
              />
              <text
                x={padding.left - 8}
                y={grid.y + 3}
                textAnchor="end"
                fontSize="10"
                className="fill-gray-400 dark:fill-gray-500"
              >
                {grid.value.toFixed(grid.value > 99 ? 0 : 1)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          {areaPath && (
            <motion.path
              d={areaPath}
              fill={`url(#${gradId})`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Smooth line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3 },
            }}
          />

          {/* Crosshair */}
          {hoveredPoint && (
            <>
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={padding.top + chartHeight}
                stroke={color}
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.55"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6"
                fill={color}
                opacity="0.18"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="3.5"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                className="dark:stroke-gray-900"
              />
            </>
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredPoint && tooltipPosition && (
        <div
          className={cn(
            "absolute z-10 pointer-events-none",
            "rounded-xl px-3 py-2 text-xs",
            "bg-white/90 dark:bg-gray-900/85 backdrop-blur-md",
            "border border-gray-200/80 dark:border-white/10",
            "shadow-lg"
          )}
          style={{
            left: `${Math.min(
              Math.max(tooltipPosition.x + 12, 8),
              (containerRef.current?.offsetWidth || 0) - 180
            )}px`,
            top: `${Math.max(tooltipPosition.y - 64, 8)}px`,
          }}
        >
          <div className="font-semibold text-gray-900 dark:text-gray-100">{title}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {timeData && timeData[hoveredPoint.index] !== undefined
              ? `Time · ${formatTime(timeData[hoveredPoint.index])}`
              : `Point · ${hoveredPoint.index + 1}`}
          </div>
          <div
            className="mt-1 text-base font-bold tabular-nums"
            style={{ color }}
          >
            {formatValue ? formatValue(hoveredPoint.value) : `${hoveredPoint.value.toFixed(2)} ${unit}`}
          </div>
        </div>
      )}
    </div>
  );
}
