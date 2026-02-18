import {
    Component, Input, OnChanges, SimpleChanges,
    ChangeDetectionStrategy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions, PieSlice, TooltipState } from '../../shared/models/chart.models';
import { ChartService } from '../../shared/services/chart.service';

@Component({
    selector: 'io-pie-chart',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <svg
      [attr.width]="width"
      [attr.height]="height"
      [attr.viewBox]="'0 0 ' + width + ' ' + height"
      class="chart-svg"
      role="img"
      [attr.aria-label]="options.title + ' pie chart'"
      (mouseleave)="hideTooltip()">

      <defs>
        @for (slice of slices(); track slice.index) {
          <filter [attr.id]="'slice-shadow-' + slice.index + '-' + uniqueId">
            <feDropShadow dx="0" dy="2" stdDeviation="4" [attr.flood-color]="slice.color" flood-opacity="0.5"/>
          </filter>
        }
      </defs>

      <!-- Pie slices -->
      @for (slice of slices(); track slice.index) {
        <path
          [attr.d]="hoveredIndex() === slice.index ? slice.explodedPathD : slice.pathD"
          [attr.fill]="slice.color"
          class="pie-slice"
          [class.animated]="options.animated !== false"
          [attr.style]="'animation-delay: ' + (slice.index * 80) + 'ms; filter: url(#slice-shadow-' + slice.index + '-' + uniqueId + ')'"
          (mouseenter)="onSliceHover(slice)"
          (mouseleave)="hideTooltip()"
          [attr.aria-label]="slice.name + ': ' + svc.formatValue(slice.value) + ' (' + slice.percentage.toFixed(1) + '%)'"
          role="button"/>
      }

      <!-- Donut center label -->
      @if (options.donut) {
        <circle [attr.cx]="cx" [attr.cy]="cy" [attr.r]="innerRadius - 4" class="donut-center"/>
        <text [attr.x]="cx" [attr.y]="cy - 8" class="donut-total-label">Total</text>
        <text [attr.x]="cx" [attr.y]="cy + 14" class="donut-total-value">{{ svc.formatValue(total()) }}</text>
      }

      <!-- Percentage labels on slices (only if slice is big enough) -->
      @for (slice of slices(); track slice.index) {
        @if (slice.percentage > 8) {
          <text
            [attr.x]="slice.labelX"
            [attr.y]="slice.labelY + 4"
            class="slice-label"
            [class.animated]="options.animated !== false"
            [attr.style]="'animation-delay: ' + (slice.index * 80 + 300) + 'ms'">
            {{ slice.percentage.toFixed(0) }}%
          </text>
        }
      }

      <!-- Tooltip -->
      @if (tooltip().visible) {
        <g class="tooltip-group">
          <rect
            [attr.x]="tooltipX()"
            [attr.y]="tooltipY()"
            width="150"
            height="62"
            rx="8"
            class="tooltip-bg"/>
          <circle [attr.cx]="tooltipX() + 14" [attr.cy]="tooltipY() + 16" r="5" [attr.fill]="tooltip().color"/>
          <text [attr.x]="tooltipX() + 24" [attr.y]="tooltipY() + 20" class="tooltip-name">{{ tooltip().name }}</text>
          <text [attr.x]="tooltipX() + 10" [attr.y]="tooltipY() + 40" class="tooltip-value">{{ svc.formatValue(tooltip().value) }}</text>
          <text [attr.x]="tooltipX() + 10" [attr.y]="tooltipY() + 56" class="tooltip-pct">{{ tooltip().percentage?.toFixed(1) }}%</text>
        </g>
      }
    </svg>
  `,
    styles: [`
    :host { display: block; width: 100%; }
    .chart-svg { overflow: visible; }

    .pie-slice {
      cursor: pointer;
      transition: d 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease;
    }
    .pie-slice.animated { animation: popIn 0.5s ease backwards; }
    .pie-slice:hover { filter: brightness(1.2) !important; }

    .donut-center { fill: #0f0f19; }
    .donut-total-label { fill: rgba(255,255,255,0.5); font-size: 12px; font-family: inherit; text-anchor: middle; }
    .donut-total-value { fill: #fff; font-size: 18px; font-weight: 700; font-family: inherit; text-anchor: middle; }

    .slice-label {
      fill: #fff;
      font-size: 11px;
      font-weight: 700;
      font-family: inherit;
      text-anchor: middle;
      pointer-events: none;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
    .slice-label.animated { animation: fadeIn 0.4s ease backwards; }

    .tooltip-bg { fill: rgba(15,15,25,0.92); stroke: rgba(255,255,255,0.15); stroke-width: 1; }
    .tooltip-name { fill: rgba(255,255,255,0.7); font-size: 11px; font-family: inherit; }
    .tooltip-value { fill: #fff; font-size: 14px; font-weight: 700; font-family: inherit; }
    .tooltip-pct { fill: rgba(255,255,255,0.5); font-size: 11px; font-family: inherit; }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.5); transform-origin: center; }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class PieChartComponent implements OnChanges {
    @Input({ required: true }) options!: ChartOptions;
    @Input() width = 400;
    @Input() height = 320;

    readonly svc = inject(ChartService);
    readonly uniqueId = Math.random().toString(36).slice(2, 8);

    get cx(): number { return this.width / 2; }
    get cy(): number { return this.height / 2; }
    get radius(): number { return Math.min(this.width, this.height) / 2 - 20; }
    get innerRadius(): number { return this.options.donut ? this.radius * 0.5 : 0; }

    readonly slices = signal<PieSlice[]>([]);
    readonly hoveredIndex = signal<number>(-1);
    readonly tooltip = signal<TooltipState>({ visible: false, x: 0, y: 0, name: '', value: 0, color: '' });

    readonly total = computed(() =>
        this.slices().reduce((sum, s) => sum + s.value, 0)
    );

    readonly tooltipX = computed(() => {
        const t = this.tooltip();
        return t.x + 160 > this.width ? t.x - 160 : t.x + 10;
    });
    readonly tooltipY = computed(() => {
        const t = this.tooltip();
        return t.y - 70 < 0 ? t.y + 10 : t.y - 70;
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['options'] || changes['width'] || changes['height']) {
            this.recompute();
        }
    }

    private recompute(): void {
        const merged = this.svc.mergeWithDefaults(this.options);
        this.slices.set(
            this.svc.computePieSlices(
                merged.series,
                this.cx, this.cy,
                this.radius,
                this.innerRadius,
                12
            )
        );
    }

    onSliceHover(slice: PieSlice): void {
        this.hoveredIndex.set(slice.index);
        const midAngle = (slice.startAngle + slice.endAngle) / 2;
        const r = this.radius * 0.75;
        this.tooltip.set({
            visible: true,
            x: this.cx + Math.cos(midAngle) * r,
            y: this.cy + Math.sin(midAngle) * r,
            name: slice.name,
            value: slice.value,
            percentage: slice.percentage,
            color: slice.color,
        });
    }

    hideTooltip(): void {
        this.hoveredIndex.set(-1);
        this.tooltip.update(t => ({ ...t, visible: false }));
    }
}
