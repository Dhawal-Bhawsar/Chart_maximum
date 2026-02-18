import {
    Component, Input, OnChanges, SimpleChanges,
    ChangeDetectionStrategy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions, ChartPoint, GridLine, TooltipState, ChartDimensions } from '../../shared/models/chart.models';
import { ChartService } from '../../shared/services/chart.service';

@Component({
    selector: 'io-line-chart',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <svg
      [attr.width]="dims().width"
      [attr.height]="dims().height"
      [attr.viewBox]="'0 0 ' + dims().width + ' ' + dims().height"
      class="chart-svg"
      role="img"
      [attr.aria-label]="options.title + ' line chart'"
      (mouseleave)="hideTooltip()">

      <!-- Gradient defs -->
      <defs>
        @for (point of points(); track point.color + point.index) {
          <linearGradient [attr.id]="'area-grad-' + point.index + '-' + uniqueId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="point.color" stop-opacity="0.35"/>
            <stop offset="100%" [attr.stop-color]="point.color" stop-opacity="0.02"/>
          </linearGradient>
        }
        <linearGradient id="line-grad-main" x1="0" y1="0" x2="1" y2="0">
          @if (points().length > 0) {
            <stop offset="0%" [attr.stop-color]="points()[0].color"/>
            <stop offset="100%" [attr.stop-color]="points()[points().length - 1].color"/>
          }
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      @if (options.showGrid !== false) {
        @for (line of gridLines(); track line.value) {
          <line
            [attr.x1]="dims().marginLeft"
            [attr.y1]="line.y"
            [attr.x2]="dims().marginLeft + dims().innerWidth"
            [attr.y2]="line.y"
            class="grid-line"/>
          <text
            [attr.x]="dims().marginLeft - 8"
            [attr.y]="line.y + 4"
            class="axis-label axis-label--y">
            {{ line.label }}
          </text>
        }
      }

      <!-- X-axis labels -->
      @for (point of points(); track point.index) {
        <text
          [attr.x]="point.x"
          [attr.y]="dims().marginTop + dims().innerHeight + 20"
          class="axis-label axis-label--x">
          {{ point.name }}
        </text>
      }

      <!-- Y-axis line -->
      <line
        [attr.x1]="dims().marginLeft"
        [attr.y1]="dims().marginTop"
        [attr.x2]="dims().marginLeft"
        [attr.y2]="dims().marginTop + dims().innerHeight"
        class="axis-line"/>

      <!-- X-axis line -->
      <line
        [attr.x1]="dims().marginLeft"
        [attr.y1]="dims().marginTop + dims().innerHeight"
        [attr.x2]="dims().marginLeft + dims().innerWidth"
        [attr.y2]="dims().marginTop + dims().innerHeight"
        class="axis-line"/>

      <!-- Area fill -->
      @if (points().length > 1) {
        <path
          [attr.d]="areaPath()"
          [attr.fill]="'url(#area-grad-0-' + uniqueId + ')'"
          class="area-path"
          [class.animated]="options.animated !== false"/>
      }

      <!-- Line path -->
      @if (points().length > 1) {
        <path
          [attr.d]="linePath()"
          class="line-path"
          [class.animated]="options.animated !== false"
          [attr.stroke]="points()[0].color"
          fill="none"/>
      }

      <!-- Data point circles -->
      @for (point of points(); track point.index) {
        <circle
          [attr.cx]="point.x"
          [attr.cy]="point.y"
          r="5"
          [attr.fill]="point.color"
          class="data-point"
          [class.animated]="options.animated !== false"
          [attr.style]="'animation-delay: ' + (point.index * 80) + 'ms'"
          (mouseenter)="showTooltip($event, point)"
          (mousemove)="moveTooltip($event)"
          role="button"
          [attr.aria-label]="point.name + ': ' + point.value"/>
        <!-- Hover ring -->
        <circle
          [attr.cx]="point.x"
          [attr.cy]="point.y"
          r="10"
          [attr.fill]="point.color"
          class="data-point-ring"
          (mouseenter)="showTooltip($event, point)"
          (mousemove)="moveTooltip($event)"
          (mouseleave)="hideTooltip()"/>
      }

      <!-- Tooltip -->
      @if (tooltip().visible) {
        <g class="tooltip-group">
          <rect
            [attr.x]="tooltipX()"
            [attr.y]="tooltipY()"
            width="120"
            height="50"
            rx="8"
            class="tooltip-bg"/>
          <text [attr.x]="tooltipX() + 10" [attr.y]="tooltipY() + 18" class="tooltip-name">
            {{ tooltip().name }}
          </text>
          <text [attr.x]="tooltipX() + 10" [attr.y]="tooltipY() + 36" class="tooltip-value">
            {{ svc.formatValue(tooltip().value) }}
          </text>
        </g>
      }
    </svg>
  `,
    styles: [`
    :host { display: block; width: 100%; }
    .chart-svg { overflow: visible; }

    .grid-line { stroke: rgba(255,255,255,0.08); stroke-width: 1; stroke-dasharray: 4 4; }
    .axis-line { stroke: rgba(255,255,255,0.2); stroke-width: 1.5; }
    .axis-label { fill: rgba(255,255,255,0.5); font-size: 11px; font-family: inherit; text-anchor: middle; }
    .axis-label--y { text-anchor: end; }

    .area-path { opacity: 0.6; }
    .area-path.animated { animation: fadeIn 0.8s ease forwards; }

    .line-path {
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
    }
    .line-path.animated {
      stroke-dasharray: 2000;
      stroke-dashoffset: 2000;
      animation: drawLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .data-point {
      cursor: pointer;
      transition: r 0.2s ease, filter 0.2s ease;
      filter: drop-shadow(0 0 4px currentColor);
    }
    .data-point.animated { animation: popIn 0.4s ease backwards; }
    .data-point:hover { r: 8; }

    .data-point-ring {
      opacity: 0;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .data-point-ring:hover { opacity: 0.2; }

    .tooltip-bg { fill: rgba(15, 15, 25, 0.92); stroke: rgba(255,255,255,0.15); stroke-width: 1; }
    .tooltip-name { fill: rgba(255,255,255,0.7); font-size: 11px; font-family: inherit; }
    .tooltip-value { fill: #fff; font-size: 14px; font-weight: 700; font-family: inherit; }

    @keyframes drawLine {
      to { stroke-dashoffset: 0; }
    }
    @keyframes popIn {
      from { r: 0; opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 0.6; }
    }
  `]
})
export class LineChartComponent implements OnChanges {
    @Input({ required: true }) options!: ChartOptions;
    @Input() width = 600;
    @Input() height = 320;

    readonly svc = inject(ChartService);
    readonly uniqueId = Math.random().toString(36).slice(2, 8);

    readonly dims = signal<ChartDimensions>({
        width: 600, height: 320,
        marginTop: 20, marginRight: 30, marginBottom: 50, marginLeft: 60,
        innerWidth: 510, innerHeight: 250
    });

    readonly points = signal<ChartPoint[]>([]);
    readonly gridLines = signal<GridLine[]>([]);
    readonly tooltip = signal<TooltipState>({ visible: false, x: 0, y: 0, name: '', value: 0, color: '' });

    readonly linePath = computed(() => this.svc.buildSmoothPath(this.points()));
    readonly areaPath = computed(() => this.svc.buildAreaPath(this.points(), this.dims()));

    readonly tooltipX = computed(() => {
        const t = this.tooltip();
        return t.x + 140 > this.dims().width ? t.x - 130 : t.x + 10;
    });
    readonly tooltipY = computed(() => {
        const t = this.tooltip();
        return t.y - 60 < 0 ? t.y + 10 : t.y - 60;
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['options'] || changes['width'] || changes['height']) {
            this.recompute();
        }
    }

    private recompute(): void {
        const d = this.svc.computeDimensions(this.width, this.height, 'line');
        this.dims.set(d);
        const merged = this.svc.mergeWithDefaults(this.options);
        this.points.set(this.svc.computeLinePoints(merged.series, d));
        this.gridLines.set(this.svc.computeGridLines(merged.series, d, merged.yAxisTicks ?? 5));
    }

    showTooltip(event: MouseEvent, point: ChartPoint): void {
        const svg = (event.target as SVGElement).closest('svg')!;
        const rect = svg.getBoundingClientRect();
        this.tooltip.set({
            visible: true,
            x: point.x,
            y: point.y,
            name: point.name,
            value: point.value,
            color: point.color,
        });
    }

    moveTooltip(event: MouseEvent): void {
        // tooltip follows the fixed point, not cursor — no-op
    }

    hideTooltip(): void {
        this.tooltip.update(t => ({ ...t, visible: false }));
    }
}
