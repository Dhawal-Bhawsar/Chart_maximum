import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from './chart/chart.component';
import { ChartOptions, ChartTheme } from './shared/models/chart.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartComponent],
  template: `
    <div class="app" [class.app--light]="theme() === 'light'">

      <!-- Animated background -->
      <div class="bg-orbs">
        <div class="orb orb--1"></div>
        <div class="orb orb--2"></div>
        <div class="orb orb--3"></div>
      </div>

      <!-- Header -->
      <header class="header">
        <div class="header__brand">
          <div class="header__logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logo-grad)"/>
              <path d="M7 18 L11 12 L15 15 L19 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="19" cy="8" r="2" fill="white"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stop-color="#6366f1"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 class="header__title">io-chart</h1>
            <p class="header__subtitle">Custom Angular Chart Library</p>
          </div>
        </div>
        <div class="header__controls">
          <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="'Switch to ' + (theme() === 'dark' ? 'light' : 'dark') + ' mode'">
            @if (theme() === 'dark') {
              ☀️ Light
            } @else {
              🌙 Dark
            }
          </button>
        </div>
      </header>

      <!-- Hero section -->
      <section class="hero">
        <div class="hero__badge">✨ Production-Ready Angular Charts</div>
        <h2 class="hero__title">Beautiful charts, zero dependencies</h2>
        <p class="hero__desc">
          A fully custom Angular chart component built with pure SVG — no external libraries.
          Supports Line, Column, and Pie charts with animations, tooltips, legends, and more.
        </p>
        <!-- Type switcher tabs -->
        <div class="type-tabs">
          @for (t of chartTypes; track t.value) {
            <button
              class="type-tab"
              [class.type-tab--active]="activeType() === t.value"
              (click)="setType(t.value)">
              <span class="type-tab__icon">{{ t.icon }}</span>
              {{ t.label }}
            </button>
          }
        </div>
      </section>

      <!-- Main chart showcase -->
      <section class="showcase">
        <div class="showcase__chart">
          <io-chart
            [chartOptions]="activeOptions()"
            [theme]="theme()"
            [animated]="true"
            (chartReady)="onChartReady()"/>
        </div>
        <div class="showcase__editor">
          <div class="editor-card">
            <div class="editor-header">
              <span class="editor-title">⚡ Live Editor</span>
              <button class="editor-reset" (click)="resetEditor()">Reset</button>
            </div>
            <textarea
              class="editor-textarea"
              [value]="editorJson()"
              (input)="onEditorInput($event)"
              spellcheck="false"
              aria-label="Chart options JSON editor">
            </textarea>
            @if (editorError()) {
              <p class="editor-error">{{ editorError() }}</p>
            }
          </div>
        </div>
      </section>

      <!-- All charts grid -->
      <section class="charts-grid-section">
        <h2 class="section-title">All Chart Types</h2>
        <p class="section-desc">Every chart type rendered side by side with different datasets</p>
        <div class="charts-grid">
          @for (demo of demoCharts; track demo.options.title) {
            <div class="grid-chart">
              <io-chart [chartOptions]="demo.options" [theme]="theme()" [animated]="true"/>
            </div>
          }
        </div>
      </section>

      <!-- Features section -->
      <section class="features">
        <h2 class="section-title">Features</h2>
        <div class="features-grid">
          @for (feat of features; track feat.title) {
            <div class="feature-card">
              <span class="feature-icon">{{ feat.icon }}</span>
              <h3 class="feature-title">{{ feat.title }}</h3>
              <p class="feature-desc">{{ feat.desc }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Usage code section -->
      <section class="usage-section">
        <h2 class="section-title">Usage</h2>
        <div class="code-block">
          <pre><code>{{ usageCode }}</code></pre>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p>Built with ❤️ using Angular 17 · Pure SVG · Zero dependencies</p>
        <p class="footer__sub">Frontend Intern Assignment — io-chart Component Library</p>
      </footer>
    </div>
  `,
  styles: [`
    /* ===== Layout ===== */
    .app {
      min-height: 100vh;
      background: #0a0a14;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      position: relative;
      overflow-x: hidden;
    }
    .app--light {
      background: #f8fafc;
      color: #1e293b;
    }

    /* ===== Animated BG Orbs ===== */
    .bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
      animation: drift 20s ease-in-out infinite;
    }
    .orb--1 { width: 500px; height: 500px; background: #6366f1; top: -100px; left: -100px; animation-delay: 0s; }
    .orb--2 { width: 400px; height: 400px; background: #8b5cf6; bottom: 100px; right: -100px; animation-delay: -7s; }
    .orb--3 { width: 300px; height: 300px; background: #06b6d4; top: 50%; left: 50%; animation-delay: -14s; }
    @keyframes drift {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.95); }
    }

    /* ===== Header ===== */
    .header {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 40px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      backdrop-filter: blur(20px);
    }
    .app--light .header { border-bottom-color: rgba(0,0,0,0.06); }
    .header__brand { display: flex; align-items: center; gap: 12px; }
    .header__logo { display: flex; }
    .header__title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .header__subtitle { margin: 0; font-size: 11px; color: rgba(255,255,255,0.4); }
    .app--light .header__subtitle { color: rgba(0,0,0,0.4); }

    .theme-toggle {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .theme-toggle:hover { background: rgba(255,255,255,0.12); }
    .app--light .theme-toggle {
      border-color: rgba(0,0,0,0.12);
      background: rgba(0,0,0,0.04);
      color: rgba(0,0,0,0.7);
    }

    /* ===== Hero ===== */
    .hero {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 60px 40px 40px;
    }
    .hero__badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 100px;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      color: #a5b4fc;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .hero__title {
      margin: 0 0 16px;
      font-size: clamp(28px, 5vw, 48px);
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }
    .app--light .hero__title {
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }
    .hero__desc {
      margin: 0 auto 32px;
      max-width: 560px;
      font-size: 15px;
      color: rgba(255,255,255,0.5);
      line-height: 1.7;
    }
    .app--light .hero__desc { color: rgba(0,0,0,0.5); }

    /* ===== Type Tabs ===== */
    .type-tabs {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .type-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .type-tab:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
    .type-tab--active {
      background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3));
      border-color: rgba(99,102,241,0.5);
      color: #a5b4fc;
    }
    .type-tab__icon { font-size: 16px; }

    /* ===== Showcase ===== */
    .showcase {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      padding: 0 40px 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    @media (max-width: 900px) {
      .showcase { grid-template-columns: 1fr; }
    }

    /* ===== Editor ===== */
    .editor-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .editor-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); }
    .editor-reset {
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.1);
      background: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      font-size: 11px;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .editor-reset:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
    .editor-textarea {
      flex: 1;
      min-height: 300px;
      padding: 16px;
      background: none;
      border: none;
      color: #a5b4fc;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      resize: vertical;
      outline: none;
    }
    .editor-error {
      margin: 0;
      padding: 8px 16px;
      background: rgba(239,68,68,0.1);
      color: rgba(239,68,68,0.9);
      font-size: 11px;
      border-top: 1px solid rgba(239,68,68,0.2);
    }

    /* ===== Charts Grid ===== */
    .charts-grid-section {
      position: relative;
      z-index: 1;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-title {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, rgba(255,255,255,0.6));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .app--light .section-title {
      background: linear-gradient(135deg, #1e293b, #475569);
      -webkit-background-clip: text;
      background-clip: text;
    }
    .section-desc { margin: 0 0 28px; color: rgba(255,255,255,0.4); font-size: 14px; }
    .app--light .section-desc { color: rgba(0,0,0,0.4); }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 20px;
    }

    /* ===== Features ===== */
    .features {
      position: relative;
      z-index: 1;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .feature-card {
      padding: 20px;
      border-radius: 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      transition: all 0.2s ease;
    }
    .feature-card:hover {
      background: rgba(255,255,255,0.06);
      transform: translateY(-2px);
    }
    .feature-icon { font-size: 24px; display: block; margin-bottom: 10px; }
    .feature-title { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9); }
    .app--light .feature-title { color: rgba(0,0,0,0.8); }
    .feature-desc { margin: 0; font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }
    .app--light .feature-desc { color: rgba(0,0,0,0.4); }

    /* ===== Usage Code ===== */
    .usage-section {
      position: relative;
      z-index: 1;
      padding: 0 40px 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .code-block {
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      overflow: auto;
    }
    .code-block pre {
      margin: 0;
      padding: 24px;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.7;
      color: #a5b4fc;
    }

    /* ===== Footer ===== */
    .footer {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 32px 40px;
      border-top: 1px solid rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.3);
      font-size: 13px;
    }
    .footer p { margin: 4px 0; }
    .footer__sub { font-size: 11px; }
    .app--light .footer { border-top-color: rgba(0,0,0,0.06); color: rgba(0,0,0,0.3); }
  `]
})
export class AppComponent implements OnInit {
  readonly theme = signal<ChartTheme>('dark');
  readonly activeType = signal<'line' | 'column' | 'pie'>('line');
  readonly editorJson = signal('');
  readonly editorError = signal('');

  readonly chartTypes = [
    { value: 'line' as const, label: 'Line Chart', icon: '📈' },
    { value: 'column' as const, label: 'Column Chart', icon: '📊' },
    { value: 'pie' as const, label: 'Pie Chart', icon: '🥧' },
  ];

  readonly features = [
    { icon: '🎨', title: 'Pure SVG', desc: 'No canvas libraries, no external dependencies — just clean SVG.' },
    { icon: '✨', title: 'Animations', desc: 'Smooth entry animations on load with CSS keyframes.' },
    { icon: '🖱️', title: 'Hover Tooltips', desc: 'Interactive tooltips showing name, value, and percentage.' },
    { icon: '📐', title: 'Responsive', desc: 'ResizeObserver ensures charts adapt to any container width.' },
    { icon: '🌙', title: 'Dark / Light', desc: 'Full dark and light theme support via CSS custom properties.' },
    { icon: '💾', title: 'Export PNG', desc: 'Download any chart as a PNG image with one click.' },
    { icon: '🔄', title: 'Live Editor', desc: 'Edit chart JSON in real-time and see changes instantly.' },
    { icon: '♿', title: 'Accessible', desc: 'ARIA labels, keyboard navigation, and semantic roles.' },
    { icon: '🛡️', title: 'Validated', desc: 'Input validation with clear error messages for bad data.' },
    { icon: '🧩', title: 'Reusable', desc: 'Single component, infinite configurations via ChartOptions.' },
  ];

  readonly usageCode = `// 1. Import the component
import { ChartComponent } from './chart/chart.component';
import { ChartOptions } from './shared/models/chart.models';

// 2. Define your options
chartOptions: ChartOptions = {
  type: 'line',          // 'line' | 'column' | 'pie'
  title: 'Sales Report',
  series: [
    { name: 'Offline', value: 30, color: '#6366f1' },
    { name: 'Online',  value: 70, color: '#8b5cf6' },
  ],
  showLegend: true,      // optional
  animated: true,        // optional
  donut: false,          // optional (pie only)
};

// 3. Use in template
// <io-chart [chartOptions]="chartOptions" theme="dark"></io-chart>`;

  private readonly defaultOptions: Record<string, ChartOptions> = {
    line: {
      type: 'line',
      title: 'Monthly Revenue',
      series: [
        { name: 'Jan', value: 42, color: '#6366f1' },
        { name: 'Feb', value: 58, color: '#6366f1' },
        { name: 'Mar', value: 35, color: '#6366f1' },
        { name: 'Apr', value: 72, color: '#6366f1' },
        { name: 'May', value: 89, color: '#6366f1' },
        { name: 'Jun', value: 65, color: '#6366f1' },
      ],
      showLegend: true,
      animated: true,
    },
    column: {
      type: 'column',
      title: 'Sales by Region',
      series: [
        { name: 'North', value: 85, color: '#06b6d4' },
        { name: 'South', value: 62, color: '#8b5cf6' },
        { name: 'East', value: 94, color: '#10b981' },
        { name: 'West', value: 71, color: '#f59e0b' },
        { name: 'Central', value: 48, color: '#ef4444' },
      ],
      showLegend: true,
      animated: true,
    },
    pie: {
      type: 'pie',
      title: 'Market Share',
      series: [
        { name: 'Offline', value: 30, color: '#6366f1' },
        { name: 'Online', value: 45, color: '#8b5cf6' },
        { name: 'Mobile', value: 15, color: '#06b6d4' },
        { name: 'Other', value: 10, color: '#10b981' },
      ],
      showLegend: true,
      animated: true,
      donut: true,
    },
  };

  readonly activeOptions = computed(() => {
    return this.currentOptions()[this.activeType()];
  });

  private readonly currentOptions = signal<Record<string, ChartOptions>>({ ...this.defaultOptions });

  readonly demoCharts: { options: ChartOptions }[] = [
    {
      options: {
        type: 'line',
        title: 'Website Traffic',
        series: [
          { name: 'Mon', value: 1200, color: '#6366f1' },
          { name: 'Tue', value: 1800, color: '#6366f1' },
          { name: 'Wed', value: 1400, color: '#6366f1' },
          { name: 'Thu', value: 2200, color: '#6366f1' },
          { name: 'Fri', value: 2800, color: '#6366f1' },
          { name: 'Sat', value: 900, color: '#6366f1' },
          { name: 'Sun', value: 700, color: '#6366f1' },
        ],
        animated: true,
      }
    },
    {
      options: {
        type: 'column',
        title: 'Quarterly Performance',
        series: [
          { name: 'Q1', value: 320, color: '#10b981' },
          { name: 'Q2', value: 480, color: '#06b6d4' },
          { name: 'Q3', value: 390, color: '#f59e0b' },
          { name: 'Q4', value: 560, color: '#8b5cf6' },
        ],
        animated: true,
      }
    },
    {
      options: {
        type: 'pie',
        title: 'Revenue Sources',
        series: [
          { name: 'Product', value: 55, color: '#6366f1' },
          { name: 'Services', value: 25, color: '#8b5cf6' },
          { name: 'Licensing', value: 12, color: '#06b6d4' },
          { name: 'Other', value: 8, color: '#10b981' },
        ],
        animated: true,
        donut: false,
      }
    },
    {
      options: {
        type: 'pie',
        title: 'User Demographics (Donut)',
        series: [
          { name: '18-24', value: 28, color: '#f59e0b' },
          { name: '25-34', value: 35, color: '#ef4444' },
          { name: '35-44', value: 22, color: '#8b5cf6' },
          { name: '45+', value: 15, color: '#06b6d4' },
        ],
        animated: true,
        donut: true,
      }
    },
    {
      options: {
        type: 'line',
        title: 'Stock Price',
        series: [
          { name: 'W1', value: 142, color: '#10b981' },
          { name: 'W2', value: 158, color: '#10b981' },
          { name: 'W3', value: 149, color: '#10b981' },
          { name: 'W4', value: 172, color: '#10b981' },
          { name: 'W5', value: 165, color: '#10b981' },
          { name: 'W6', value: 188, color: '#10b981' },
        ],
        animated: true,
      }
    },
    {
      options: {
        type: 'column',
        title: 'Department Budget',
        series: [
          { name: 'Eng', value: 450, color: '#6366f1' },
          { name: 'Mkt', value: 280, color: '#f59e0b' },
          { name: 'HR', value: 180, color: '#10b981' },
          { name: 'Ops', value: 320, color: '#ef4444' },
          { name: 'R&D', value: 520, color: '#8b5cf6' },
        ],
        animated: true,
      }
    },
  ];

  ngOnInit(): void {
    this.syncEditor();
  }

  setType(type: 'line' | 'column' | 'pie'): void {
    this.activeType.set(type);
    this.syncEditor();
  }

  toggleTheme(): void {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }

  onChartReady(): void {
    // Chart rendered
  }

  onEditorInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.editorJson.set(val);
    try {
      const parsed = JSON.parse(val) as ChartOptions;
      this.editorError.set('');
      this.currentOptions.update(opts => ({
        ...opts,
        [this.activeType()]: parsed,
      }));
    } catch {
      this.editorError.set('Invalid JSON — fix syntax to update chart');
    }
  }

  resetEditor(): void {
    this.currentOptions.update(opts => ({
      ...opts,
      [this.activeType()]: this.defaultOptions[this.activeType()],
    }));
    this.syncEditor();
    this.editorError.set('');
  }

  private syncEditor(): void {
    const opts = this.currentOptions()[this.activeType()];
    this.editorJson.set(JSON.stringify(opts, null, 2));
  }
}
