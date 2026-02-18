import {
  Component, Input, OnChanges, SimpleChanges, Output, EventEmitter,
  ChangeDetectionStrategy, inject, signal, computed, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions, ChartTheme } from '../shared/models/chart.models';
import { ChartService } from '../shared/services/chart.service';
import { LineChartComponent } from './line-chart/line-chart.component';
import { ColumnChartComponent } from './column-chart/column-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { ChartLegendComponent } from './chart-legend/chart-legend.component';

/**
 * io-chart — The main reusable chart component.
 *
 * Usage:
 * ```html
 * <io-chart [chartOptions]="options" theme="dark" [animated]="true"></io-chart>
 * ```
 */
@Component({
  selector: 'io-chart',
  standalone: true,
  imports: [
    CommonModule,
    LineChartComponent,
    ColumnChartComponent,
    PieChartComponent,
    ChartLegendComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-card" [class.chart-card--light]="theme === 'light'" [class.chart-card--error]="hasErrors()">

      <!-- Error / Empty / Content states -->
      @if (hasErrors()) {
        <div class="chart-error">
          <span class="chart-error__icon">⚠️</span>
          <div class="chart-error__messages">
            @for (err of errors(); track err) {
              <p>{{ err }}</p>
            }
          </div>
        </div>
      } @else if (!chartOptions?.series?.length) {
        <div class="chart-empty">
          <span class="chart-empty__icon">📊</span>
          <p>No data to display</p>
        </div>
      } @else {
        <!-- Title -->
        <div class="chart-header">
          <h3 class="chart-title">{{ mergedOptions().title }}</h3>
          <div class="chart-actions">
            <button class="chart-action-btn" (click)="exportPng()" title="Export as PNG" aria-label="Export chart as PNG">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Chart area -->
        <div class="chart-body" #chartBody>
          @switch (mergedOptions().type) {
            @case ('line') {
              <io-line-chart
                [options]="mergedOptions()"
                [width]="chartWidth()"
                [height]="chartHeight()"/>
            }
            @case ('column') {
              <io-column-chart
                [options]="mergedOptions()"
                [width]="chartWidth()"
                [height]="chartHeight()"/>
            }
            @case ('pie') {
              <io-pie-chart
                [options]="mergedOptions()"
                [width]="chartWidth()"
                [height]="chartHeight()"/>
            }
          }
        </div>

        <!-- Legend -->
        @if (mergedOptions().showLegend !== false) {
          <io-chart-legend
            [series]="mergedOptions().series"
            [horizontal]="mergedOptions().type === 'pie'"
            (visibilityChange)="onLegendChange($event)"/>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .chart-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 20px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: box-shadow 0.3s ease, transform 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .chart-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    }
    .chart-card:hover {
      box-shadow: 0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
      transform: translateY(-2px);
    }
    .chart-card--light {
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%);
      border-color: rgba(0,0,0,0.08);
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .chart-card--error { border-color: rgba(239,68,68,0.4); }

    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .chart-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      letter-spacing: 0.3px;
    }
    .chart-card--light .chart-title { color: rgba(0,0,0,0.8); }

    .chart-actions { display: flex; gap: 6px; }
    .chart-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .chart-action-btn:hover {
      background: rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.9);
    }

    .chart-body { width: 100%; }

    .chart-error, .chart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 12px;
      text-align: center;
    }
    .chart-error__icon, .chart-empty__icon { font-size: 32px; }
    .chart-error__messages p {
      margin: 4px 0;
      color: rgba(239,68,68,0.9);
      font-size: 13px;
    }
    .chart-empty p { color: rgba(255,255,255,0.4); font-size: 14px; }
  `]
})
export class ChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  /** The chart configuration object */
  @Input({ required: true }) chartOptions!: ChartOptions;
  /** Visual theme */
  @Input() theme: ChartTheme = 'dark';
  /** Enable/disable animations */
  @Input() animated = true;
  /** Emitted when chart is fully rendered */
  @Output() chartReady = new EventEmitter<void>();

  private readonly svc = inject(ChartService);
  private readonly elRef = inject(ElementRef);
  private resizeObserver?: ResizeObserver;

  readonly errors = signal<string[]>([]);
  readonly hasErrors = computed(() => this.errors().length > 0);
  readonly mergedOptions = signal<ChartOptions>({} as ChartOptions);
  readonly chartWidth = signal(600);
  readonly chartHeight = signal(320);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartOptions'] && this.chartOptions) {
      const errs = this.svc.validateOptions(this.chartOptions);
      this.errors.set(errs);
      if (errs.length === 0) {
        const merged = this.svc.mergeWithDefaults(this.chartOptions);
        this.mergedOptions.set({ ...merged, animated: this.animated });
        this.chartHeight.set(merged.height ?? 320);
      }
    }
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0 && w !== this.chartWidth()) {
          this.chartWidth.set(w);
        }
      }
    });
    const body = this.elRef.nativeElement.querySelector('.chart-body');
    if (body) this.resizeObserver.observe(body);
    this.chartReady.emit();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  onLegendChange(hidden: Set<number>): void {
    // Filter series based on hidden indices
    const original = this.svc.mergeWithDefaults(this.chartOptions);
    const filtered = original.series.filter((_, i) => !hidden.has(i));
    this.mergedOptions.update(o => ({ ...o, series: filtered }));
  }

  exportPng(): void {
    const svgEl = this.elRef.nativeElement.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      canvas.width = svgEl.clientWidth || 600;
      canvas.height = svgEl.clientHeight || 320;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0f0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `${this.chartOptions.title.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  }
}
