/**
 * Core chart models and interfaces for the io-chart component library.
 * Supports Line, Column, and Pie chart types with full TypeScript safety.
 */

export type ChartType = 'line' | 'column' | 'pie';
export type ChartTheme = 'dark' | 'light';

/** A single data series entry */
export interface ChartSeries {
  name: string;
  value: number;
  color: string;
}

/** Main configuration interface for the io-chart component */
export interface ChartOptions {
  type: ChartType;
  title: string;
  series: ChartSeries[];
  /** Optional: show/hide legend (default: true) */
  showLegend?: boolean;
  /** Optional: enable animations (default: true) */
  animated?: boolean;
  /** Optional: show tooltips (default: true) */
  showTooltips?: boolean;
  /** Optional: show grid lines (default: true) */
  showGrid?: boolean;
  /** Optional: donut mode for pie chart (default: false) */
  donut?: boolean;
  /** Optional: number of Y-axis ticks (default: 5) */
  yAxisTicks?: number;
  /** Optional: custom height in px (default: 320) */
  height?: number;
}

/** Computed SVG coordinate point */
export interface ChartPoint {
  x: number;
  y: number;
  value: number;
  name: string;
  color: string;
  index: number;
}

/** Computed pie/donut slice data */
export interface PieSlice {
  name: string;
  value: number;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
  /** SVG path `d` attribute string */
  pathD: string;
  /** Label position (center of arc) */
  labelX: number;
  labelY: number;
  /** Exploded (hover) path */
  explodedPathD: string;
  index: number;
}

/** Computed bar/column data */
export interface BarData {
  name: string;
  value: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  labelX: number;
  labelY: number;
  index: number;
}

/** Grid line data for axes */
export interface GridLine {
  value: number;
  label: string;
  y: number;
}

/** Tooltip state */
export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  name: string;
  value: number;
  percentage?: number;
  color: string;
}

/** Chart dimension configuration */
export interface ChartDimensions {
  width: number;
  height: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  innerWidth: number;
  innerHeight: number;
}

/** Default chart options */
export const DEFAULT_CHART_OPTIONS: Partial<ChartOptions> = {
  showLegend: true,
  animated: true,
  showTooltips: true,
  showGrid: true,
  donut: false,
  yAxisTicks: 5,
  height: 320,
};
