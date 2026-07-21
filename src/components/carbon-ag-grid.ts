// carbon-checked: AG Grid is the SANCTIONED heavy-data-grid option in this spoke
// (see CLAUDE.md "Grids"). cds-table covers simple/display tables; this wrapper
// covers large / sortable / filterable / virtualized / editable data. It is a
// real, reusable component — not a hand-rolled table primitive.
//
// A <carbon-ag-grid> custom element that renders a Carbon-THEMED AG Grid. Config
// is read from a child <script type="application/json">{ columns, rows }</script>
// so DataGrid.astro can pass server data with no attribute-escaping games.
//
// Because column defs travel as JSON, they can't carry functions. Instead a
// colDef may name a renderer/formatter as a STRING (`cellRenderer: 'status'`,
// `valueFormatter: 'date'`) and this file maps that key to a real function from
// the registries below. Cell renderers emit `cds-*` markup (already registered
// via carbon.ts), so cells stay Carbon-native — not hand-rolled table styling.
//
// It also exposes an imperative API (setBucket / setQuickFilter / column state /
// resetColumns) and events (grid-ready, grid-model-updated, grid-columns-changed)
// so a Carbon toolbar composed AROUND it — segmented scope, search, a column
// manager — can drive the grid. See PermitsGrid.astro.
import {
  createGrid,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type GridApi,
  type GridOptions,
  type ColDef,
  type ICellRendererParams,
  type ValueFormatterParams,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

// Map AG Grid's theme params onto Carbon's --cds-* tokens. Because these are LIVE
// CSS var() references, the grid inherits the current theme ZONE automatically —
// drop it inside .cds--g100 and it goes dark with zero extra work.
const carbonTheme = themeQuartz.withParams({
  accentColor: 'var(--cds-interactive, #0f62fe)',
  backgroundColor: 'var(--cds-layer, #ffffff)',
  foregroundColor: 'var(--cds-text-primary, #161616)',
  cellTextColor: 'var(--cds-text-primary, #161616)',
  borderColor: 'var(--cds-border-subtle, #e0e0e0)',
  chromeBackgroundColor: 'var(--cds-layer-accent-01, #e0e0e0)',
  headerTextColor: 'var(--cds-text-primary, #161616)',
  headerFontWeight: 600,
  oddRowBackgroundColor: 'transparent',
  rowHoverColor: 'var(--cds-layer-hover-01, #e8e8e8)',
  selectedRowBackgroundColor: 'var(--cds-layer-selected-01, #e0e0e0)',
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  fontSize: 14,
  headerHeight: 48,
  rowHeight: 48,
  wrapperBorderRadius: 0,
  borderRadius: 0,
  spacing: 8,
});

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );

// Status glyphs — icon + colour + label, so a state is never signalled by colour
// alone (WCAG 1.4.1). `type` is a Carbon tag colour; the path draws the matching
// Carbon icon. Same map shape as the search prototype, extended with the states
// the register carries.
const statusStyle: Record<string, { type: string; viewBox: string; path: string }> = {
  succeeded:     { type: 'green',     viewBox: '0 0 16 16', path: 'M8,1C4.1,1,1,4.1,1,8c0,3.9,3.1,7,7,7s7-3.1,7-7C15,4.1,11.9,1,8,1z M7,11L4.3,8.3l0.9-0.8L7,9.3l4-3.9l0.9,0.8L7,11z' },
  'in-progress': { type: 'blue',      viewBox: '0 0 32 32', path: 'M16,2A14,14,0,1,0,30,16,14.0158,14.0158,0,0,0,16,2Zm0,26A12,12,0,0,1,16,4V16l8.4812,8.4814A11.9625,11.9625,0,0,1,16,28Z' },
  pending:       { type: 'gray',      viewBox: '0 0 32 32', path: 'M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM8,18a2,2,0,1,1,2-2A2,2,0,0,1,8,18Zm8,0a2,2,0,1,1,2-2A2,2,0,0,1,16,18Zm8,0a2,2,0,1,1,2-2A2,2,0,0,1,24,18Z' },
  amendment:     { type: 'purple',    viewBox: '0 0 32 32', path: 'M2 26h28v2H2zM25.4 9c.8-.8.8-2 0-2.8l-3.6-3.6c-.8-.8-2-.8-2.8 0l-15 15V24h6.4l15-15zM20.4 4L24 7.6l-3 3L17.4 7l3-3zM6 22v-3.6l10-10 3.6 3.6-10 10H6z' },
  failed:        { type: 'red',       viewBox: '0 0 16 16', path: 'M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z' },
  expired:       { type: 'cool-gray', viewBox: '0 0 32 32', path: 'M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z M20.5859,23,15,17.4141V8h2v8.5859l5,5.0009Z' },
};

// Cell renderers — each returns an HTML string of cds-* markup. Referenced by the
// string key a colDef sets in `cellRenderer`.
const RENDERERS: Record<string, (p: ICellRendererParams) => string> = {
  permitLink: (p) =>
    `<a href="/permit" style="color:var(--cds-link-primary,#0f62fe);text-decoration:none;font-weight:500">${esc(p.value)}</a>`,
  status: (p) => {
    const s = statusStyle[p.data?.statusKind] ?? statusStyle.pending;
    return `<cds-tag type="${s.type}" size="sm"><svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="${s.viewBox}" width="16" height="16" aria-hidden="true"><path d="${s.path}"/></svg>${esc(p.value)}</cds-tag>`;
  },
  role: (p) => (p.value ? `<cds-tag type="teal" size="sm">${esc(p.value)}</cds-tag>` : ''),
  // Comma-separated free tags → one quiet gray cds-tag each.
  tags: (p) =>
    String(p.value ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => `<cds-tag type="gray" size="sm">${esc(t)}</cds-tag>`)
      .join(''),
  // Document reference — a link when present, an em dash placeholder when not.
  doc: (p) =>
    p.value
      ? `<a href="/permit" style="color:var(--cds-link-primary,#0f62fe);text-decoration:none;font-weight:500">${esc(p.value)}</a>`
      : `<span style="color:var(--cds-text-secondary,#525252)">&mdash;</span>`,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Value formatters — keyed like renderers. `date` parses an ISO YYYY-MM-DD by hand
// (never new Date on the string — that would shift a day in negative time zones).
const FORMATTERS: Record<string, (p: ValueFormatterParams) => string> = {
  date: (p) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(p.value ?? ''));
    return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : String(p.value ?? '');
  },
};

interface Column {
  colId: string;
  headerName: string;
  visible: boolean;
  pinned: 'left' | 'right' | null;
}

class CarbonAgGrid extends HTMLElement {
  private api?: GridApi;
  private _bucket = 'all';
  private _ready!: Promise<GridApi>;
  private _resolveReady!: (api: GridApi) => void;

  connectedCallback() {
    if (this.api) return;
    this._ready = new Promise((res) => (this._resolveReady = res));
    const { columns = [], rows = [] } = this.readConfig();

    const host = document.createElement('div');
    host.style.height = this.getAttribute('height') || '400px';
    host.style.width = '100%';
    this.appendChild(host);

    // Resolve string renderer/formatter keys to real functions.
    const columnDefs = (columns as ColDef[]).map((c) => {
      const def: ColDef = { ...c };
      if (typeof def.cellRenderer === 'string') def.cellRenderer = RENDERERS[def.cellRenderer];
      if (typeof def.valueFormatter === 'string') def.valueFormatter = FORMATTERS[def.valueFormatter as string];
      return def;
    });

    const options: GridOptions = {
      theme: carbonTheme,
      columnDefs,
      rowData: rows as GridOptions['rowData'],
      defaultColDef: { sortable: true, filter: true, resizable: true, flex: 1, minWidth: 120 },
      animateRows: true,
      // External scope filter: rows carry a `_buckets` array; a bucket other than
      // 'all' keeps only rows tagged with it. Combines (AND) with quick-filter.
      isExternalFilterPresent: () => this._bucket !== 'all',
      doesExternalFilterPass: (node) => {
        const b = (node.data as { _buckets?: string[] } | undefined)?._buckets;
        return Array.isArray(b) ? b.includes(this._bucket) : true;
      },
      onModelUpdated: () =>
        this.emit('grid-model-updated', { count: this.api?.getDisplayedRowCount() ?? 0 }),
      // Any visibility / pin / move / resize change → re-sync the column manager
      // and let the page persist the new state.
      onDisplayedColumnsChanged: () => this.emit('grid-columns-changed', {}),
    };
    this.api = createGrid(host, options);
    this._resolveReady(this.api);
    this.emit('grid-ready', {});
  }

  disconnectedCallback() {
    this.api?.destroy();
    this.api = undefined;
  }

  // ── Public API (the toolbar drives these) ─────────────────────────────────
  whenReady(): Promise<GridApi> {
    return this._ready;
  }

  setBucket(bucket: string) {
    this._bucket = bucket || 'all';
    this.api?.onFilterChanged();
  }

  setQuickFilter(text: string) {
    this.api?.setGridOption('quickFilterText', text ?? '');
  }

  /** All columns with their current visibility + pin state, in display order. */
  getColumns(): Column[] {
    return (this.api?.getColumns() ?? []).map((c) => ({
      colId: c.getColId(),
      headerName: (c.getColDef().headerName as string) ?? c.getColId(),
      visible: c.isVisible(),
      pinned: c.getPinned() ?? null,
    }));
  }

  setColumnVisible(colId: string, visible: boolean) {
    this.api?.setColumnsVisible([colId], visible);
  }

  setColumnPinned(colId: string, pinned: 'left' | 'right' | null) {
    this.api?.setColumnsPinned([colId], pinned);
  }

  getColumnState() {
    return this.api?.getColumnState() ?? [];
  }

  applyColumnState(state: unknown[]) {
    this.api?.applyColumnState({ state: state as never, applyOrder: true });
  }

  /** Restore every column's default visibility / order / pin / width. */
  resetColumns() {
    this.api?.resetColumnState();
  }

  getDisplayedRowCount(): number {
    return this.api?.getDisplayedRowCount() ?? 0;
  }

  private emit(name: string, detail: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private readConfig(): { columns?: unknown[]; rows?: unknown[] } {
    const tag = this.querySelector('script[type="application/json"]');
    try {
      return tag?.textContent ? JSON.parse(tag.textContent) : {};
    } catch {
      return {};
    }
  }
}

if (!customElements.get('carbon-ag-grid')) {
  customElements.define('carbon-ag-grid', CarbonAgGrid);
}
