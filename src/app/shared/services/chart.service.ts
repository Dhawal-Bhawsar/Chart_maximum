import { Injectable } from '@angular/core';
import {
    ChartOptions,
    ChartSeries,
    ChartPoint,
    PieSlice,
    BarData,
    GridLine,
    ChartDimensions,
    DEFAULT_CHART_OPTIONS,
} from '../models/chart.models';

/**
 * ChartService — pure computation service for chart data transformations.
 * No DOM access; all methods are pure functions for testability.
 */
@Injectable({ providedIn: 'root' })
export class ChartService {

    /**
     * Merges user options with defaults and validates required fields.
     */
    mergeWithDefaults(options: ChartOptions): ChartOptions {
        return { ...DEFAULT_CHART_OPTIONS, ...options };
    }

    /**
     * Validates chart options and returns an array of error messages.
     */
    validateOptions(options: ChartOptions): string[] {
        const errors: string[] = [];
        if (!options) { errors.push('ChartOptions is required'); return errors; }
        if (!['line', 'column', 'pie'].includes(options.type)) {
            errors.push(`Invalid chart type: "${options.type}". Must be 'line', 'column', or 'pie'.`);
        }
        if (!options.title || options.title.trim() === '') {
            errors.push('Chart title is required');
        }
        if (!options.series || options.series.length === 0) {
            errors.push('At least one series item is required');
        } else {
            options.series.forEach((s, i) => {
                if (s.value < 0) errors.push(`Series[${i}] "${s.name}" has negative value`);
                if (!s.color) errors.push(`Series[${i}] "${s.name}" is missing a color`);
            });
        }
        return errors;
    }

    /**
     * Computes SVG coordinate points for a line chart.
     */
    computeLinePoints(series: ChartSeries[], dims: ChartDimensions): ChartPoint[] {
        if (!series || series.length === 0) return [];
        const maxValue = Math.max(...series.map(s => s.value), 0);
        const safeMax = maxValue === 0 ? 1 : maxValue;
        const count = series.length;

        return series.map((s, i) => {
            const x = count === 1
                ? dims.marginLeft + dims.innerWidth / 2
                : dims.marginLeft + (i / (count - 1)) * dims.innerWidth;
            const y = dims.marginTop + dims.innerHeight - (s.value / safeMax) * dims.innerHeight;
            return { x, y, value: s.value, name: s.name, color: s.color, index: i };
        });
    }

    /**
     * Builds an SVG polyline points string from chart points.
     */
    buildPolylinePoints(points: ChartPoint[]): string {
        return points.map(p => `${p.x},${p.y}`).join(' ');
    }

    /**
     * Builds a smooth SVG path (cubic bezier) through chart points.
     */
    buildSmoothPath(points: ChartPoint[]): string {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpX = (prev.x + curr.x) / 2;
            d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
        }
        return d;
    }

    /**
     * Builds an SVG area path (closed shape below the line).
     */
    buildAreaPath(points: ChartPoint[], dims: ChartDimensions): string {
        if (points.length === 0) return '';
        const bottomY = dims.marginTop + dims.innerHeight;
        const linePath = this.buildSmoothPath(points);
        return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
    }

    /**
     * Computes bar dimensions for a column chart.
     */
    computeBarData(series: ChartSeries[], dims: ChartDimensions): BarData[] {
        if (!series || series.length === 0) return [];
        const maxValue = Math.max(...series.map(s => s.value), 0);
        const safeMax = maxValue === 0 ? 1 : maxValue;
        const count = series.length;
        const totalPadding = dims.innerWidth * 0.3;
        const barWidth = (dims.innerWidth - totalPadding) / count;
        const gap = totalPadding / (count + 1);

        return series.map((s, i) => {
            const barHeight = (s.value / safeMax) * dims.innerHeight;
            const x = dims.marginLeft + gap + i * (barWidth + gap);
            const y = dims.marginTop + dims.innerHeight - barHeight;
            return {
                name: s.name,
                value: s.value,
                color: s.color,
                x,
                y,
                width: barWidth,
                height: barHeight,
                labelX: x + barWidth / 2,
                labelY: y - 6,
                index: i,
            };
        });
    }

    /**
     * Computes pie/donut slice data with SVG arc paths.
     */
    computePieSlices(
        series: ChartSeries[],
        cx: number,
        cy: number,
        radius: number,
        innerRadius: number = 0,
        explodeOffset: number = 10
    ): PieSlice[] {
        if (!series || series.length === 0) return [];
        const total = series.reduce((sum, s) => sum + s.value, 0);
        if (total === 0) return [];

        let currentAngle = -Math.PI / 2; // start at top
        return series.map((s, i) => {
            const percentage = s.value / total;
            const angle = percentage * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const midAngle = (startAngle + endAngle) / 2;
            const pathD = this.buildArcPath(cx, cy, radius, innerRadius, startAngle, endAngle);
            const explodedCx = cx + Math.cos(midAngle) * explodeOffset;
            const explodedCy = cy + Math.sin(midAngle) * explodeOffset;
            const explodedPathD = this.buildArcPath(explodedCx, explodedCy, radius, innerRadius, startAngle, endAngle);

            const labelR = innerRadius > 0 ? (radius + innerRadius) / 2 : radius * 0.65;
            return {
                name: s.name,
                value: s.value,
                color: s.color,
                percentage: percentage * 100,
                startAngle,
                endAngle,
                pathD,
                labelX: cx + Math.cos(midAngle) * labelR,
                labelY: cy + Math.sin(midAngle) * labelR,
                explodedPathD,
                index: i,
            };
        });
    }

    /**
     * Builds an SVG arc path string for a pie/donut slice.
     */
    private buildArcPath(
        cx: number, cy: number,
        outerR: number, innerR: number,
        startAngle: number, endAngle: number
    ): string {
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
        const x1 = cx + outerR * Math.cos(startAngle);
        const y1 = cy + outerR * Math.sin(startAngle);
        const x2 = cx + outerR * Math.cos(endAngle);
        const y2 = cy + outerR * Math.sin(endAngle);

        if (innerR <= 0) {
            return [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');
        }

        const ix1 = cx + innerR * Math.cos(endAngle);
        const iy1 = cy + innerR * Math.sin(endAngle);
        const ix2 = cx + innerR * Math.cos(startAngle);
        const iy2 = cy + innerR * Math.sin(startAngle);

        return [
            `M ${x1} ${y1}`,
            `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${ix1} ${iy1}`,
            `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
            'Z'
        ].join(' ');
    }

    /**
     * Generates Y-axis grid line data.
     */
    computeGridLines(series: ChartSeries[], dims: ChartDimensions, tickCount: number = 5): GridLine[] {
        const maxValue = Math.max(...series.map(s => s.value), 0);
        const niceMax = this.niceNumber(maxValue, tickCount);
        const step = niceMax / tickCount;
        const lines: GridLine[] = [];

        for (let i = 0; i <= tickCount; i++) {
            const value = i * step;
            const y = dims.marginTop + dims.innerHeight - (value / niceMax) * dims.innerHeight;
            lines.push({ value, label: this.formatValue(value), y });
        }
        return lines;
    }

    /**
     * Rounds a number up to a "nice" value for axis labels.
     */
    private niceNumber(value: number, ticks: number): number {
        if (value === 0) return ticks;
        const rough = value / ticks;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
        const normalized = rough / magnitude;
        let nice: number;
        if (normalized <= 1) nice = 1;
        else if (normalized <= 2) nice = 2;
        else if (normalized <= 5) nice = 5;
        else nice = 10;
        return nice * magnitude * ticks;
    }

    /**
     * Formats a numeric value for display.
     */
    formatValue(value: number): string {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
        return value % 1 === 0 ? value.toString() : value.toFixed(1);
    }

    /**
     * Computes chart dimensions with margins.
     */
    computeDimensions(
        containerWidth: number,
        containerHeight: number,
        type: string
    ): ChartDimensions {
        const marginTop = 20;
        const marginRight = type === 'pie' ? 20 : 30;
        const marginBottom = type === 'pie' ? 20 : 50;
        const marginLeft = type === 'pie' ? 20 : 60;

        return {
            width: containerWidth,
            height: containerHeight,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
            innerWidth: containerWidth - marginLeft - marginRight,
            innerHeight: containerHeight - marginTop - marginBottom,
        };
    }
}
