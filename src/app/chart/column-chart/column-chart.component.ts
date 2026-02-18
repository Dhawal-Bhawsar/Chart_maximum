import {
    Component, Input, OnChanges, SimpleChanges,
    ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions, BarData, GridLine, TooltipState, ChartDimensions } from '../../shared/models/chart.models';
import { ChartService } from '../../shared/services/chart.service';

@Component({
    selector: 'io-column-chart',
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
      [attr.aria-label]="options.title + ' column chart'"
      (mouseleave)="hideTooltip()">

      <defs>
        @for (bar of bars(); track bar.index) {
          <linearGradient [attr.id]="'bar-grad-' + bar.index + '-' + uniqueId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="bar.color" stop-opacity="1"/>
            <stop offset="100%" [attr.stop-color]="bar.color" stop-opacity="0.6"/>
          </linearGradient>
        }
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

      <!-- Axes -->
      <line
        [attr.x1]="dims().marginLeft"
        [attr.y1]="dims().marginTop"
        [attr.x2]="dims().marginLeft"
        [attr.y2]="dims().marginTop + dims().innerHeight"
        class="axis-line"/>
      <line
        [attr.x1]="dims().marginLeft"
        [attr.y1]="dims().marginTop + dims().innerHeight"
        [attr.x2]="dims().marginLeft + dims().innerWidth"
        [attr.y2]="dims().marginTop + dims().innerHeight"
        class="axis-line"/>

      <!-- Bars -->
      @for (bar of bars(); track bar.index) {
        <g class="bar-group"
           (mouseenter)="showTooltip($event, bar)"
           (mouseleave)="hideTooltip()">
          <!-- Bar shadow -->
          <rect
            [attr.x]="bar.x + 3"
            [attr.y]="bar.y + 3"
            [attr.width]="bar.width"
            [attr.height]="bar.height"
            rx="4"
            class="bar-shadow"/>
          <!-- Bar body -->
          <rect
            [attr.x]="bar.x"
            [attr.y]="bar.y"
            [attr.width]="bar.width"
            [attr.height]="bar.height"
            rx="4"
            [attr.fill]="'url(#bar-grad-' + bar.index + '-' + uniqueId + ')'"
            class="bar-rect"
            [class.animated]="options.animated !== false"
            [attr.style]="'animation-delay: ' + (bar.index * 100) + 'ms; transform-origin: ' + (bar.x + bar.width/2) + 'px ' + (dims().marginTop + dims().innerHeight) + 'px'"
            [attr.aria-label]="bar.name + ': ' + bar.value"/>
          <!-- Value label -->
          <text
            [attr.x]="bar.labelX"
            [attr.y]="bar.labelY"
            class="bar-label"
            [class.animated]="options.animated !== false"
            [attr.style]="'animation-delay: ' + (bar.index * 100 + 200) + 'ms'">
            {{ svc.formatValue(bar.value) }}
          </text>
          <!-- X-axis label -->
          <text
            [attr.x]="bar.labelX"
            [attr.y]="dims().marginTop + dims().innerHeight + 20"
            class="axis-label axis-label--x">
            {{ bar.name }}
          </text>
        </g>
      }

      <!-- Tooltip -->
      @if (tooltip().visible) {
        <g class="tooltip-group">
          <rect
            [attr.x]="tooltipX()"
            [attr.y]="tooltipY()"
            width="130"
            height="54"
            rx="8"
            class="tooltip-bg"/>
          <circle [attr.cx]="tooltipX() + 14" [attr.cy]="tooltipY() + 16" r="5" [attr.fill]="tooltip().color"/>
          <text [attr.x]="tooltipX() + 24" [attr.y]="tooltipY() + 20" class="tooltip-name">
            {{ tooltip().name }}
          </text>
          <text [attr.x]="tooltipX() + 10" [attr.y]="tooltipY() + 40" class="tooltip-value">
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

    .bar-shadow { fill: rgba(0,0,0,0.3); }
    .bar-rect {
      cursor: pointer;
      transition: filter 0.2s ease, opacity 0.2s ease;
    }
    .bar-rect:hover { filter: brightness(1.3); }
    .bar-rect.animated {
      animation: growUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    }
    .bar-label {
      fill: rgba(255,255,255,0.85);
      font-size: 11px;
      font-weight: 600;
      font-family: inherit;
      text-anchor: middle;
    }
    .bar-label.animated { animation: fadeIn 0.4s ease backwards; }

    .tooltip-bg { fill: rgba(15,15,25,0.92); stroke: rgba(255,255,255,0.15); stroke-width: 1; }
    .tooltip-name { fill: rgba(255,255,255,0.7); font-size: 11px; font-family: inherit; }
    .tooltip-value { fill: #fff; font-size: 14px; font-weight: 700; font-family: inherit; }

    @keyframes growUp {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ColumnChartComponent implements OnChanges {
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
    readonly bars = signal<BarData[]>([]);
    readonly gridLines = signal<GridLine[]>([]);
    readonly tooltip = signal<TooltipState>({ visible: false, x: 0, y: 0, name: '', value: 0, color: '' });

    tooltipX(): number {
        const t = this.tooltip();
        return t.x + 140 > this.dims().width ? t.x - 140 : t.x + 10;
    }
    tooltipY(): number {
        const t = this.tooltip();
        return t.y - 60 < 0 ? t.y + 10 : t.y - 60;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['options'] || changes['width'] || changes['height']) {
            this.recompute();
        }
    }

    private recompute(): void {
        const d = this.svc.computeDimensions(this.width, this.height, 'column');
        this.dims.set(d);
        const merged = this.svc.mergeWithDefaults(this.options);
        this.bars.set(this.svc.computeBarData(merged.series, d));
        this.gridLines.set(this.svc.computeGridLines(merged.series, d, merged.yAxisTicks ?? 5));
    }

    showTooltip(event: MouseEvent, bar: BarData): void {
        this.tooltip.set({
            visible: true,
            x: bar.labelX,
            y: bar.y,
            name: bar.name,
            value: bar.value,
            color: bar.color,
        });
    }

    hideTooltip(): void {
        this.tooltip.update(t => ({ ...t, visible: false }));
    }
}
