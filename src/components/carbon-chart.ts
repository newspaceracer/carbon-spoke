// carbon-checked: @carbon/charts is the SANCTIONED charting dependency in this
// spoke — the direct analog of AG Grid for data grids (see CLAUDE.md "Grids" and
// carbon-ag-grid.ts). Charts are NOT part of the @carbon/web-components (cds-*)
// catalog; they live in @carbon/charts, a real, Carbon-native library that ships
// its own accessible SVG charts, IBM Plex type, Carbon token colours, a built-in
// tabular data alternative, and CVD patterns. This is a reusable wrapper, not a
// hand-rolled chart primitive.
//
// A <carbon-chart> custom element that renders a Carbon chart. Its config
// ({ type, data, options }) is read from a child
//   <script type="application/json">…</script>
// exactly like <carbon-ag-grid>, so CarbonChart.astro can pass server data with
// no attribute-escaping games.
//
// It exposes an imperative API — setData / setOptions / update — so a page that
// owns a shared filter state (e.g. the admin dashboard) can recompute the data
// and push it into every chart on the page when a filter changes.
import {
  SimpleBarChart,
  GroupedBarChart,
  StackedBarChart,
  ComboChart,
  DonutChart,
  LineChart,
  type ChartTabularData,
} from '@carbon/charts';
import '@carbon/charts/styles.min.css';

// The chart types this spoke composes. Add a line here to allow a new one — the
// same "register what you use" discipline as src/carbon.ts.
const CHART_TYPES = {
  'simple-bar': SimpleBarChart,
  'grouped-bar': GroupedBarChart,
  'stacked-bar': StackedBarChart,
  combo: ComboChart, // grouped bars + a line series (see comboChartTypes in options)
  donut: DonutChart,
  line: LineChart,
} as const;
type ChartType = keyof typeof CHART_TYPES;

// Carbon charts are themed by NAME (white / g10 / g90 / g100), not by reading
// live CSS vars the way the AG Grid wrapper does. So the chart can't inherit a
// theme zone purely through the cascade — walk up to the nearest Carbon zone
// class and map it to the matching chart theme, so a chart dropped inside
// .cds--g100 renders dark to match. Falls back to the element's `theme` attribute,
// then to the default light zone.
const ZONE_TO_THEME: Record<string, string> = {
  'cds--white': 'white',
  'cds--g10': 'g10',
  'cds--g90': 'g90',
  'cds--g100': 'g100',
};
function resolveTheme(el: HTMLElement): string {
  let node: HTMLElement | null = el;
  while (node) {
    for (const [cls, theme] of Object.entries(ZONE_TO_THEME)) {
      if (node.classList.contains(cls)) return theme;
    }
    node = node.parentElement;
  }
  return el.getAttribute('theme') || 'white';
}

interface ChartConfig {
  type: ChartType;
  data: ChartTabularData;
  options: Record<string, unknown>;
}

// The chart instance type is deliberately loose — every @carbon/charts class
// shares the same model.setData / model.setOptions / update / destroy surface
// (see dist/chart.d.ts), but they don't share a single exported base type here.
interface ChartDatum {
  group?: string;
  data?: { group?: string };
}
interface ChartInstance {
  model: { setData(d: ChartTabularData): void; setOptions(o: object): void };
  services: {
    events: { addEventListener(type: string, cb: (e: CustomEvent) => void): void };
  };
  update(animate?: boolean): void;
  destroy(): void;
}

class CarbonChart extends HTMLElement {
  private chart?: ChartInstance;
  private holder?: HTMLDivElement;

  connectedCallback() {
    if (this.chart) return;
    const config = this.readConfig();
    if (!config) return;

    const Ctor = CHART_TYPES[config.type];
    if (!Ctor) {
      console.warn(`[carbon-chart] unknown type "${config.type}"`);
      return;
    }

    const height = this.getAttribute('height') || '320px';
    this.holder = document.createElement('div');
    this.holder.style.height = height;
    this.holder.style.width = '100%';
    this.appendChild(this.holder);

    // @carbon/charts sizes some chart types (notably horizontal bars) from their
    // own content and ignores the container height unless `height` is an explicit
    // option — without it the SVG grows to thousands of px. Inject it from the
    // `height` attribute so every chart is bounded; a per-chart options.height wins.
    const options = { theme: resolveTheme(this), height, ...config.options };
    this.chart = new Ctor(this.holder, { data: config.data, options }) as unknown as ChartInstance;

    // Forward a bar/slice click as a plain bubbling DOM event carrying the clicked
    // group, so a page can turn "click the North Coast bar" into a drill-through to
    // the register — without reaching into @carbon/charts' internals itself.
    const forward = (e: CustomEvent) => {
      const datum = e.detail?.datum as ChartDatum | undefined;
      const group = datum?.data?.group ?? datum?.group;
      if (group != null) {
        this.dispatchEvent(
          new CustomEvent('carbon-chart-select', { detail: { group }, bubbles: true, composed: true }),
        );
      }
    };
    this.chart.services.events.addEventListener('bar-click', forward);
    this.chart.services.events.addEventListener('pie-slice-click', forward);
  }

  disconnectedCallback() {
    this.chart?.destroy();
    this.chart = undefined;
  }

  // ── Public API (a page's filter script drives these) ───────────────────────
  /** Replace the chart's data and re-render. */
  setData(data: ChartTabularData) {
    this.chart?.model.setData(data);
  }

  /** Merge-in new options (e.g. a changed title) and re-render. */
  setOptions(options: object) {
    this.chart?.model.setOptions(options);
    this.chart?.update();
  }

  private readConfig(): ChartConfig | null {
    const tag = this.querySelector('script[type="application/json"]');
    try {
      return tag?.textContent ? JSON.parse(tag.textContent) : null;
    } catch {
      return null;
    }
  }
}

if (!customElements.get('carbon-chart')) {
  customElements.define('carbon-chart', CarbonChart);
}

export type { ChartType };
