import {
    Component, Input, Output, EventEmitter,
    ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartSeries } from '../../shared/models/chart.models';

@Component({
    selector: 'io-chart-legend',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="legend" [class.legend--horizontal]="horizontal">
      @for (item of series; track item.name; let i = $index) {
        <button
          class="legend-item"
          [class.legend-item--hidden]="hiddenSeries().has(i)"
          (click)="toggleSeries(i)"
          [attr.aria-pressed]="!hiddenSeries().has(i)"
          [attr.aria-label]="'Toggle ' + item.name">
          <span class="legend-dot" [style.background]="item.color"></span>
          <span class="legend-name">{{ item.name }}</span>
          <span class="legend-value">{{ item.value }}</span>
        </button>
      }
    </div>
  `,
    styles: [`
    .legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 0;
    }
    .legend--horizontal {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px 16px;
      justify-content: center;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.2s ease, opacity 0.2s ease;
      color: rgba(255,255,255,0.8);
      font-size: 12px;
      font-family: inherit;
    }
    .legend-item:hover { background: rgba(255,255,255,0.06); }
    .legend-item--hidden { opacity: 0.35; }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 6px currentColor;
    }
    .legend-name { flex: 1; text-align: left; white-space: nowrap; }
    .legend-value {
      font-weight: 700;
      color: rgba(255,255,255,0.6);
      font-size: 11px;
    }
  `]
})
export class ChartLegendComponent {
    @Input({ required: true }) series: ChartSeries[] = [];
    @Input() horizontal = false;
    @Output() visibilityChange = new EventEmitter<Set<number>>();

    readonly hiddenSeries = signal<Set<number>>(new Set());

    toggleSeries(index: number): void {
        this.hiddenSeries.update(set => {
            const next = new Set(set);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            this.visibilityChange.emit(next);
            return next;
        });
    }
}
