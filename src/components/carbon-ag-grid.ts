// carbon-checked: AG Grid is the SANCTIONED heavy-data-grid option in this spoke
// (see CLAUDE.md "Grids"). cds-table covers simple/display tables; this wrapper
// covers large / sortable / filterable / virtualized / editable data. It is a
// real, reusable component — not a hand-rolled table primitive.
//
// A <carbon-ag-grid> custom element that renders a Carbon-THEMED AG Grid. Config
// is read from a child <script type="application/json">{ columns, rows }</script>
// so DataGrid.astro can pass server data with no attribute-escaping games.
import {
  createGrid,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type GridApi,
  type GridOptions,
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

class CarbonAgGrid extends HTMLElement {
  private api?: GridApi;

  connectedCallback() {
    if (this.api) return;
    const { columns = [], rows = [] } = this.readConfig();

    const host = document.createElement('div');
    host.style.height = this.getAttribute('height') || '400px';
    host.style.width = '100%';
    this.appendChild(host);

    const options: GridOptions = {
      theme: carbonTheme,
      columnDefs: columns as GridOptions['columnDefs'],
      rowData: rows as GridOptions['rowData'],
      defaultColDef: { sortable: true, filter: true, resizable: true, flex: 1 },
      animateRows: true,
    };
    this.api = createGrid(host, options);
  }

  disconnectedCallback() {
    this.api?.destroy();
    this.api = undefined;
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
