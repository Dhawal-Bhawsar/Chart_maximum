<div align="center">

# 📊 io-chart

### Custom Angular Chart Component Library

**A production-ready, zero-dependency Angular 17 chart library built with pure SVG**

[![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![SVG](https://img.shields.io/badge/Rendering-Pure%20SVG-FFB13B?logo=svg&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/SVG)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

> **Frontend Intern Assignment** — Build a Custom Chart Component (Angular)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Live Demo](#-live-demo)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [ChartOptions API](#-chartoptions-api)
- [Project Structure](#-project-structure)
- [Chart Types](#-chart-types)
- [Architecture](#-architecture)
- [Running Tests](#-running-tests)
- [Evaluation Criteria](#-evaluation-criteria)
- [Technical Rules](#-technical-rules)

---

## 🎯 Overview

`io-chart` is a fully custom Angular 17 standalone component that renders **Line**, **Column**, and **Pie** charts dynamically based on a configuration input — with **no external chart libraries**.

```html
<io-chart [chartOptions]="options"></io-chart>
```

Every pixel is drawn with **pure SVG math** — bezier curves, arc paths, coordinate mapping — all computed in a testable Angular service.

---

## ✨ Features

### Assignment Requirements ✅
| Requirement | Status |
|---|---|
| `<io-chart [chartOptions]="options">` selector | ✅ |
| Line Chart — connected points with axes | ✅ |
| Column Chart — vertical bars | ✅ |
| Pie Chart — circular segments | ✅ |
| Display title | ✅ |
| Centered, responsive layout | ✅ |
| Clean styling | ✅ |

### Bonus Features ✅
| Bonus | Status |
|---|---|
| Hover effects | ✅ |
| Legend | ✅ |
| Animations | ✅ |

### Beyond Scope 🚀
| Extra Feature | Description |
|---|---|
| **Smooth bezier curves** | Cubic bezier line path instead of straight segments |
| **Area fill** | Gradient-filled area under line chart |
| **Donut chart** | Pie variant with configurable inner radius |
| **Explode on hover** | Pie slices pop out on mouse-over |
| **Animated entry** | CSS keyframe animations on chart load |
| **Responsive** | `ResizeObserver` adapts to any container width |
| **Dark / Light theme** | Full theme support via CSS custom properties |
| **Export PNG** | Download any chart as PNG with one click |
| **Live JSON editor** | Edit `ChartOptions` in real-time |
| **Error states** | Validation with clear error messages |
| **Empty states** | Graceful fallback for missing data |
| **Accessibility** | ARIA labels, keyboard navigation, roles |
| **Unit tests** | 20+ tests covering all computation methods |

---

## 🚀 Live Demo

The demo dashboard at `http://localhost:4200` includes:

- **Type switcher** — toggle between Line, Column, and Pie
- **Live JSON editor** — edit chart options and see changes instantly
- **Theme toggle** — switch between dark and light mode
- **6 demo charts** — different datasets across all chart types
- **Feature showcase** — all capabilities listed with descriptions

---

## 🏁 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/io-chart.git
cd io-chart

# Install dependencies
npm install
```

### Development Server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Production Build

```bash
npm run build
```

Output is in `dist/io-chart-app/`.

---

## 📖 Usage

### 1. Import the component

```typescript
import { ChartComponent } from './chart/chart.component';
import { ChartOptions } from './shared/models/chart.models';
```

### 2. Define your options

```typescript
@Component({ /* ... */ })
export class MyComponent {
  chartOptions: ChartOptions = {
    type: 'line',           // 'line' | 'column' | 'pie'
    title: 'Sales Report',
    series: [
      { name: 'Offline', value: 30, color: '#6366f1' },
      { name: 'Online',  value: 70, color: '#8b5cf6' },
    ],
    showLegend: true,
    animated: true,
  };
}
```

### 3. Use in template

```html
<!-- Basic usage -->
<io-chart [chartOptions]="chartOptions"></io-chart>

<!-- With theme and event binding -->
<io-chart
  [chartOptions]="chartOptions"
  theme="dark"
  [animated]="true"
  (chartReady)="onReady()">
</io-chart>
```

---

## 🔧 ChartOptions API

### `ChartOptions` Interface

```typescript
interface ChartOptions {
  // Required
  type:   'line' | 'column' | 'pie';
  title:  string;
  series: ChartSeries[];

  // Optional
  showLegend?:   boolean;   // Default: true
  animated?:     boolean;   // Default: true
  showTooltips?: boolean;   // Default: true
  showGrid?:     boolean;   // Default: true
  donut?:        boolean;   // Default: false  (pie only)
  yAxisTicks?:   number;    // Default: 5
  height?:       number;    // Default: 320 (px)
}
```

### `ChartSeries` Interface

```typescript
interface ChartSeries {
  name:  string;   // Label shown on axis / legend / tooltip
  value: number;   // Numeric value (must be ≥ 0)
  color: string;   // Any valid CSS color (#hex, rgb, hsl, named)
}
```

### Component Inputs & Outputs

| Input / Output | Type | Default | Description |
|---|---|---|---|
| `[chartOptions]` | `ChartOptions` | — | **Required.** Chart configuration |
| `[theme]` | `'dark' \| 'light'` | `'dark'` | Visual theme |
| `[animated]` | `boolean` | `true` | Enable entry animations |
| `(chartReady)` | `EventEmitter<void>` | — | Fires when chart is rendered |

---

## 📁 Project Structure

```
c:\frontend\
├── src/
│   ├── app/
│   │   ├── chart/
│   │   │   ├── chart.component.ts              ← <io-chart> main wrapper
│   │   │   ├── line-chart/
│   │   │   │   └── line-chart.component.ts     ← SVG line chart
│   │   │   ├── column-chart/
│   │   │   │   └── column-chart.component.ts   ← SVG column chart
│   │   │   ├── pie-chart/
│   │   │   │   └── pie-chart.component.ts      ← SVG pie / donut chart
│   │   │   └── chart-legend/
│   │   │       └── chart-legend.component.ts   ← Interactive legend
│   │   ├── shared/
│   │   │   ├── models/
│   │   │   │   └── chart.models.ts             ← All TypeScript interfaces
│   │   │   └── services/
│   │   │       ├── chart.service.ts            ← Pure SVG math service
│   │   │       └── chart.service.spec.ts       ← Unit tests (20+)
│   │   ├── app.component.ts                    ← Demo dashboard
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles.scss                             ← Global styles + Inter font
│   └── index.html                             ← SEO meta tags + favicon
├── .gitignore
├── README.md
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 📈 Chart Types

### Line Chart

```typescript
{
  type: 'line',
  title: 'Monthly Revenue',
  series: [
    { name: 'Jan', value: 42, color: '#6366f1' },
    { name: 'Feb', value: 58, color: '#6366f1' },
    { name: 'Mar', value: 35, color: '#6366f1' },
  ]
}
```

- Smooth cubic bezier path
- Gradient area fill below the line
- Animated `stroke-dashoffset` drawing
- Data point circles with hover tooltips
- X/Y axes with grid lines

### Column Chart

```typescript
{
  type: 'column',
  title: 'Sales by Region',
  series: [
    { name: 'North', value: 85, color: '#06b6d4' },
    { name: 'South', value: 62, color: '#8b5cf6' },
    { name: 'East',  value: 94, color: '#10b981' },
  ]
}
```

- Gradient-filled `<rect>` bars
- Animated `scaleY` grow-up effect
- Value labels above each bar
- Hover highlight + tooltip

### Pie / Donut Chart

```typescript
{
  type: 'pie',
  title: 'Market Share',
  donut: true,          // ← enables donut mode
  series: [
    { name: 'Offline', value: 30, color: '#6366f1' },
    { name: 'Online',  value: 45, color: '#8b5cf6' },
    { name: 'Mobile',  value: 25, color: '#06b6d4' },
  ]
}
```

- SVG arc paths computed with trigonometry
- Slice explode on hover
- Percentage labels on slices > 8%
- Donut center shows total value
- Drop-shadow filter per slice

---

## 🏗️ Architecture

### `ChartService` — Pure Computation

All SVG math lives in `ChartService` — **no DOM access**, fully unit-testable:

| Method | Description |
|---|---|
| `computeLinePoints()` | Maps series values → SVG (x, y) coordinates |
| `buildSmoothPath()` | Generates cubic bezier SVG path string |
| `buildAreaPath()` | Generates closed area fill path |
| `computeBarData()` | Maps series values → rect dimensions |
| `computePieSlices()` | Computes arc paths via trigonometry |
| `computeGridLines()` | Generates Y-axis tick values |
| `validateOptions()` | Returns array of validation error strings |
| `formatValue()` | Formats numbers (1500 → "1.5K") |

### Angular 17 Patterns Used

- **Standalone components** — no NgModules
- **Signals** — reactive state with `signal()` and `computed()`
- **New control flow** — `@if`, `@else`, `@for`, `@switch`
- **`inject()`** — functional dependency injection
- **`ResizeObserver`** — responsive chart width
- **`ChangeDetectionStrategy.OnPush`** — performance optimized

---

## 🧪 Running Tests

```bash
# Interactive (watch mode)
npm test

# Headless CI mode
npm test -- --watch=false --browsers=ChromeHeadless
```

### Test Coverage

| Area | Tests |
|---|---|
| `validateOptions()` | Valid input, bad type, empty title, empty series, negative value |
| `computeLinePoints()` | Count, x-positions, y-positions, edge cases |
| `computePieSlices()` | Count, percentages sum to 100, angles span 2π, zero total |
| `computeBarData()` | Count, max height, positive width |
| `formatValue()` | Integer, thousands, millions, decimals |
| `buildSmoothPath()` | Single point, multiple points, empty array |

---

## 📊 Evaluation Criteria

| Criterion | Max | Implementation |
|---|---|---|
| **Angular Usage** | 20 | Standalone, signals, computed, ResizeObserver, OnPush CD |
| **Chart Logic** | 25 | Pure SVG: bezier, arc paths, coordinate mapping, grid lines |
| **Reusability** | 20 | Single `<io-chart>` selector, full `ChartOptions` API |
| **UI / CSS** | 15 | Glassmorphism, keyframe animations, dark/light theme |
| **Code Quality** | 10 | JSDoc, strict interfaces, pure service, error handling |
| **Documentation** | 10 | This README + inline comments |
| **Total** | **100** | |

---

## ✅ Technical Rules

| Rule | Status |
|---|---|
| Angular components | ✅ Used throughout |
| HTML / CSS / SVG | ✅ Pure SVG rendering |
| TypeScript | ✅ Strict interfaces everywhere |
| ❌ External chart libraries | ✅ None used |
| ❌ Copy-paste packages | ✅ None used |

---

## 📸 Screenshots

> Run `npm start` and open [http://localhost:4200](http://localhost:4200) to see:
> - Dark dashboard with animated background
> - Live JSON editor updating charts in real-time
> - All 3 chart types with hover tooltips
> - Theme toggle (dark ↔ light)
> - 6 demo charts in a responsive grid

---

## 📄 License

MIT © 2026 — Frontend Intern Assignment Submission
