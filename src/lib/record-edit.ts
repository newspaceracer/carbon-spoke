// Application-record editing — every item in the record (a contact card, a
// narrative, a date tile, a yes/no answer …) carries an Edit button; editing
// happens in ONE shared Carbon modal whose controls are built from that item's
// field list. Saving re-renders the item in place, persists the edit in the
// browser, and notifies listeners (the finalize page feeds title / category / PI /
// organization into the letter).
//
// The server renders, per page:
//   • <script type="application/json" id="record-edit-specs"> — { storageKey,
//     specs: { [itemKey]: EditSpec } } (built in ApplicationReview).
//   • an Edit button per item:   [data-record-edit="<itemKey>"]
//   • the item's display:        [data-edit-scope="<itemKey>"] containing bindings:
//       data-bind="name"            text = display template (spec.display[name]) or values[name]
//       data-bind-hide-empty        … and hide the element when that text is empty
//       data-bind-attr="a={tpl};b={tpl}"  set attributes from templates
//       data-bind-yesno="field" data-yes="…" data-no="…"  cds-icon-indicator kind + label
//       data-bind-lines="field"     rebuild the element's <cds-list-item> children
//       data-bind-initials="field"  avatar initials from a name field
//       data-show-if="field" / data-hide-if="field"       visibility by truthiness
//   • the modal: #record-edit-modal with #record-edit-label, #record-edit-heading,
//     #record-edit-fields, #record-edit-save.
// Templates: {field} or {field|date} (ISO → "Jul 22, 2026") or {field|dash} ("" → "—").

import { initials } from './avatar';

// Controls mirror the APPLICATION's own input patterns (ProjectInfoStep etc.), so an
// item is edited the same way it was entered:
//   daterange   — one range picker (start + end), like Project / Permit dates
//   occurrences — range picker + "Add occurrence" + roster table, like the
//                 application's Field investigation occurrences
export type EditFieldType = 'text' | 'textarea' | 'date' | 'daterange' | 'select' | 'yesno' | 'check' | 'lines' | 'occurrences';

/** One on-site window (ISO dates; `end` omitted for a single day). */
export interface Occurrence { start: string; end?: string }

export interface EditField {
  name: string;
  label: string;
  type: EditFieldType;
  /** select: the option values. */
  options?: string[];
  /** yesno: the two answers phrased as statements (radio labels). */
  yes?: string;
  no?: string;
  helper?: string;
  /** Only show this control while another field is truthy ("field") or falsy ("!field"). */
  showIf?: string;
  /** daterange: the two value fields it reads/writes, and their input labels. */
  startName?: string;
  endName?: string;
  startLabel?: string;
  endLabel?: string;
}

export interface EditSpec {
  /** Modal eyebrow (the record section) and heading (the item). */
  section: string;
  title: string;
  fields: EditField[];
  values: Record<string, unknown>;
  /** Display templates per data-bind name (else the raw field value is shown). */
  display?: Record<string, string>;
  /** Free-form tag for listeners (e.g. 'letter-org', 'letter-pi'). */
  role?: string;
}

type Values = Record<string, unknown>;
type Listener = (key: string, values: Values, spec: EditSpec) => void;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso: unknown) => {
  const m = typeof iso === 'string' ? iso.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : String(iso ?? '');
};
const fmtNum = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : iso;
};
/** "Jul 30, 2026" / "Aug 13 – 15, 2026" / "Dec 30, 2026 – Jan 2, 2027" — the same
 *  labels as data/permit.ts's field-session list. */
const occurrenceLabel = (o: Occurrence) => {
  const p = (iso: string) => iso.split('-').map(Number);
  const [ay, am, ad] = p(o.start);
  if (!o.end || o.end === o.start) return `${MONTHS[am - 1]} ${ad}, ${ay}`;
  const [by, bm, bd] = p(o.end);
  return ay === by && am === bm
    ? `${MONTHS[am - 1]} ${ad} – ${bd}, ${ay}`
    : `${MONTHS[am - 1]} ${ad}, ${ay} – ${MONTHS[bm - 1]} ${bd}, ${by}`;
};
const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const asText = (v: unknown) => (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v));
const truthy = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v));

// ── Specs + persisted overlay ────────────────────────────────────────────────
const specEl = typeof document !== 'undefined' ? document.getElementById('record-edit-specs') : null;
const payload = specEl ? JSON.parse(specEl.textContent || '{}') : {};
const specs: Record<string, EditSpec> = payload.specs || {};
const storageKey: string = payload.storageKey || 'record-edits';
let overlay: Record<string, Values> = {};
try { overlay = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { overlay = {}; }

const listeners: Listener[] = [];
export const onRecordEdit = (fn: Listener) => { listeners.push(fn); };

/** Current values for an item: the spec's seed, overridden by saved edits. */
export const recordValues = (key: string): Values => ({ ...(specs[key]?.values || {}), ...(overlay[key] || {}) });

const tpl = (template: string, v: Values) =>
  template.replace(/\{(\w+)(?:\|(\w+))?\}/g, (_, name: string, filter?: string) => {
    const raw = v[name];
    if (filter === 'date') return fmtDate(raw);
    if (filter === 'dash') return asText(raw).trim() || '—';
    return asText(raw);
  });

// ── Render an item's display from its values ─────────────────────────────────
const render = (key: string) => {
  const spec = specs[key];
  if (!spec) return;
  const v = recordValues(key);
  const textFor = (name: string) => (spec.display?.[name] ? tpl(spec.display[name], v) : asText(v[name]));
  document.querySelectorAll<HTMLElement>(`[data-edit-scope="${key}"]`).forEach((scopeEl) => {
    // Only this item's own bindings — skip any nested item's (an item can contain
    // other editable items, e.g. a section gate wrapping its rows).
    const scope = {
      querySelectorAll: <T extends HTMLElement>(sel: string) =>
        [...scopeEl.querySelectorAll<T>(sel)].filter((el) => el.closest('[data-edit-scope]') === scopeEl),
    };
    scope.querySelectorAll<HTMLElement>('[data-bind]').forEach((el) => {
      const text = textFor(el.dataset.bind!);
      el.textContent = text;
      if (el.hasAttribute('data-bind-hide-empty')) el.hidden = !text.trim();
    });
    scope.querySelectorAll<HTMLElement>('[data-bind-attr]').forEach((el) => {
      for (const pair of el.dataset.bindAttr!.split(';')) {
        const i = pair.indexOf('=');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), tpl(pair.slice(i + 1), v));
      }
    });
    scope.querySelectorAll<HTMLElement>('[data-bind-initials]').forEach((el) => {
      el.textContent = initials(asText(v[el.dataset.bindInitials!]));
    });
    scope.querySelectorAll<HTMLElement>('[data-bind-yesno]').forEach((el) => {
      const yes = truthy(v[el.dataset.bindYesno!]);
      el.setAttribute('kind', yes ? 'succeeded' : 'failed');
      el.setAttribute('label', (yes ? el.dataset.yes : el.dataset.no) || (yes ? 'Yes' : 'No'));
    });
    scope.querySelectorAll<HTMLElement>('[data-bind-lines]').forEach((el) => {
      const items = (v[el.dataset.bindLines!] as Array<string | Occurrence> | undefined) || [];
      el.innerHTML = items
        .map((t) => `<cds-list-item>${escHtml(typeof t === 'string' ? t : occurrenceLabel(t))}</cds-list-item>`)
        .join('');
    });
    scope.querySelectorAll<HTMLElement>('[data-show-if]').forEach((el) => { el.hidden = !truthy(v[el.dataset.showIf!]); });
    scope.querySelectorAll<HTMLElement>('[data-hide-if]').forEach((el) => { el.hidden = truthy(v[el.dataset.hideIf!]); });
  });
};

/** Set values programmatically (e.g. the page syncing its own state into the record). */
export const setRecordValues = (key: string, values: Values, { persist = false } = {}) => {
  if (!specs[key]) return;
  overlay[key] = { ...(overlay[key] || {}), ...values };
  if (persist) localStorage.setItem(storageKey, JSON.stringify(overlay));
  render(key);
};

// ── The modal ────────────────────────────────────────────────────────────────
const controlHtml = (f: EditField, v: unknown) => {
  const id = `rec-${f.name}`;
  const label = escHtml(f.label);
  const helper = f.helper ? ` helper-text="${escHtml(f.helper)}"` : '';
  switch (f.type) {
    case 'textarea':
      return `<cds-textarea id="${id}" data-field-name="${f.name}" label="${label}"${helper} rows="5" value="${escHtml(asText(v))}"></cds-textarea>`;
    case 'lines':
      return `<cds-textarea id="${id}" data-field-name="${f.name}" label="${label}" helper-text="${escHtml(f.helper || 'One per line.')}" rows="8" value="${escHtml(((v as string[]) || []).join('\n'))}"></cds-textarea>`;
    case 'select':
      return `<cds-dropdown id="${id}" data-field-name="${f.name}" title-text="${label}" value="${escHtml(asText(v))}">${(f.options || [])
        .map((o) => `<cds-dropdown-item value="${escHtml(o)}">${escHtml(o)}</cds-dropdown-item>`).join('')}</cds-dropdown>`;
    case 'yesno':
      return `<cds-radio-button-group id="${id}" data-field-name="${f.name}" legend-text="${label}" name="${id}" orientation="vertical" value="${v ? 'yes' : 'no'}">
        <cds-radio-button value="yes" label-text="${escHtml(f.yes || 'Yes')}"></cds-radio-button>
        <cds-radio-button value="no" label-text="${escHtml(f.no || 'No')}"></cds-radio-button>
      </cds-radio-button-group>`;
    case 'check':
      return `<cds-checkbox id="${id}" data-field-name="${f.name}" ${v ? 'checked' : ''}>${label}</cds-checkbox>`;
    case 'date':
      return `<cds-date-picker id="${id}" data-field-name="${f.name}" date-format="m/d/Y" value="${escHtml(asText(v))}">
        <cds-date-picker-input kind="single" label-text="${label}" placeholder="mm/dd/yyyy"></cds-date-picker-input>
      </cds-date-picker>`;
    case 'daterange': {
      const r = v as { start?: string; end?: string } | undefined;
      return `<cds-date-picker id="${id}" data-field-name="${f.name}" date-format="m/d/Y" value="${escHtml(`${r?.start ?? ''}/${r?.end ?? ''}`)}">
        <cds-date-picker-input kind="from" label-text="${escHtml(f.startLabel || 'Start date')}" placeholder="mm/dd/yyyy"></cds-date-picker-input>
        <cds-date-picker-input kind="to" label-text="${escHtml(f.endLabel || 'End date')}" placeholder="mm/dd/yyyy"></cds-date-picker-input>
      </cds-date-picker>`;
    }
    case 'occurrences':
      // The application's pattern: a range picker + "Add occurrence", then a roster
      // (Occurrence N · Start date · End date · Remove) in a stock cds-table. Rows
      // render in wireOccurrences.
      return `<div class="rec-occ" id="${id}" data-field-name="${f.name}">
        ${f.helper ? `<p class="rec-occ__hint">${escHtml(f.helper)}</p>` : ''}
        <div class="rec-occ__add">
          <cds-date-picker class="rec-occ__range" date-format="m/d/Y">
            <cds-date-picker-input kind="from" label-text="Occurrence start date" placeholder="mm/dd/yyyy"></cds-date-picker-input>
            <cds-date-picker-input kind="to" label-text="Occurrence end date" placeholder="mm/dd/yyyy"></cds-date-picker-input>
          </cds-date-picker>
          <cds-button class="rec-occ__addbtn" kind="tertiary" size="md">Add occurrence</cds-button>
        </div>
        <cds-table class="rec-occ__roster">
          <cds-table-head><cds-table-header-row>
            <cds-table-header-cell>Occurrence</cds-table-header-cell>
            <cds-table-header-cell>Start date</cds-table-header-cell>
            <cds-table-header-cell>End date</cds-table-header-cell>
            <cds-table-header-cell>Remove</cds-table-header-cell>
          </cds-table-header-row></cds-table-head>
          <cds-table-body class="rec-occ__body"></cds-table-body>
        </cds-table>
        <p class="rec-occ__empty" hidden>No field investigation occurrences added yet.</p>
      </div>`;
    default:
      return `<cds-text-input id="${id}" data-field-name="${f.name}" label="${label}"${helper} value="${escHtml(asText(v))}"></cds-text-input>`;
  }
};

let wired = false;
let openKey: string | null = null;
const pickedDates: Record<string, string> = {};

const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Working copy of each occurrences roster while the modal is open.
const occDraft: Record<string, Occurrence[]> = {};
const trashIcon = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 12H14V24H12zM18 12H20V24H18z"/><path d="M4 6V8H6V28a2 2 0 002 2H24a2 2 0 002-2V8h2V6zM8 28V8H24V28zM12 2H20V4H12z"/></svg>';

/** Parse a range picker's "YYYY-MM-DD/YYYY-MM-DD" value. */
const parseRange = (raw: unknown) => {
  const [start = '', end = ''] = String(raw || '').split('/');
  const ok = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  return { start: ok(start) ? start : '', end: ok(end) ? end : '' };
};

const wireOccurrences = (host: HTMLElement, name: string, seed: Occurrence[]) => {
  occDraft[name] = seed.map((o) => ({ ...o }));
  const body = host.querySelector<HTMLElement>('.rec-occ__body')!;
  const empty = host.querySelector<HTMLElement>('.rec-occ__empty')!;
  const range = host.querySelector<any>('.rec-occ__range');
  const draw = () => {
    const list = occDraft[name];
    body.innerHTML = list.map((o, i) => `
      <cds-table-row>
        <cds-table-cell>Occurrence ${i + 1}</cds-table-cell>
        <cds-table-cell>${fmtNum(o.start)}</cds-table-cell>
        <cds-table-cell>${fmtNum(o.end || o.start)}</cds-table-cell>
        <cds-table-cell>
          <cds-icon-button kind="ghost" size="sm" align="left" data-occ-remove="${i}">${trashIcon}<span slot="tooltip-content">Remove occurrence</span></cds-icon-button>
        </cds-table-cell>
      </cds-table-row>`).join('');
    empty.hidden = list.length > 0;
  };
  body.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-occ-remove]');
    if (!btn) return;
    occDraft[name].splice(Number(btn.dataset.occRemove), 1);
    draw();
  });
  host.querySelector('.rec-occ__addbtn')?.addEventListener('click', () => {
    const { start, end } = parseRange(range?.value);
    if (!start || !end) { host.querySelector<any>('cds-date-picker-input')?.focus?.(); return; } // both dates required
    occDraft[name].push(end === start ? { start } : { start, end });
    occDraft[name].sort((a, b) => a.start.localeCompare(b.start));
    if (range) range.value = '';
    draw();
  });
  draw();
};

const readControl = (f: EditField, el: any, fallback: unknown): unknown => {
  switch (f.type) {
    case 'occurrences': return occDraft[f.name] ? occDraft[f.name].map((o) => ({ ...o })) : fallback;
    case 'daterange': {
      const r = parseRange(el.value);
      const prev = (fallback as { start?: string; end?: string }) || {};
      return { start: r.start || prev.start, end: r.end || prev.end };
    }
    case 'yesno': return el.value === 'yes';
    case 'check': return Boolean(el.checked);
    case 'lines': return String(el.value || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
    // The picker's value is ISO (picked or typed); the change event is a fallback.
    case 'date': {
      const v = String(el.value || '');
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : pickedDates[f.name] ?? fallback;
    }
    default: return el.value ?? fallback;
  }
};

/** Wire the Edit buttons + modal and render every saved edit. Idempotent. */
export function initRecordEdit() {
  if (wired || !specEl) return;
  wired = true;
  Object.keys(overlay).forEach(render);

  const modal = document.getElementById('record-edit-modal') as (HTMLElement & { open: boolean }) | null;
  const fieldsHost = document.getElementById('record-edit-fields');
  const labelEl = document.getElementById('record-edit-label');
  const headingEl = document.getElementById('record-edit-heading');
  const saveBtn = document.getElementById('record-edit-save');
  if (!modal || !fieldsHost) return;

  // Show/hide dependent controls (showIf) from the current control values.
  const syncDependents = () => {
    const spec = openKey ? specs[openKey] : null;
    if (!spec) return;
    const current: Values = {};
    for (const f of spec.fields) {
      const el = fieldsHost.querySelector<any>(`[data-field-name="${f.name}"]`);
      if (el && (f.type === 'yesno' || f.type === 'check')) current[f.name] = readControl(f, el, spec.values[f.name]);
    }
    fieldsHost.querySelectorAll<HTMLElement>('[data-show-if-field]').forEach((wrap) => {
      const cond = wrap.dataset.showIfField!;
      const neg = cond.startsWith('!');
      const on = truthy(current[neg ? cond.slice(1) : cond]);
      wrap.hidden = neg ? on : !on;
    });
  };

  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-record-edit]');
    if (!btn) return;
    const key = btn.dataset.recordEdit!;
    const spec = specs[key];
    if (!spec) return;
    openKey = key;
    for (const k of Object.keys(pickedDates)) delete pickedDates[k];
    const v = recordValues(key);
    if (labelEl) labelEl.textContent = spec.section;
    if (headingEl) headingEl.textContent = spec.title;
    // A daterange control reads two value fields (start/end); others read their own.
    const valueFor = (f: EditField) =>
      f.type === 'daterange' ? { start: v[f.startName || 'start'], end: v[f.endName || 'end'] } : v[f.name];
    fieldsHost.innerHTML = spec.fields
      .map((f) => `<div class="record-edit__field"${f.showIf ? ` data-show-if-field="${f.showIf}"` : ''}>${controlHtml(f, valueFor(f))}</div>`)
      .join('');
    spec.fields.filter((f) => f.type === 'occurrences').forEach((f) => {
      const host = fieldsHost.querySelector<HTMLElement>(`[data-field-name="${f.name}"]`);
      if (host) wireOccurrences(host, f.name, (v[f.name] as Occurrence[]) || []);
    });
    // Date pickers report the picked day through their change event.
    fieldsHost.querySelectorAll<any>('cds-date-picker').forEach((p) => {
      p.addEventListener('cds-date-picker-changed', (ev: any) => {
        const d: Date | undefined = ev.detail?.selectedDates?.[0];
        if (d) pickedDates[p.dataset.fieldName] = toISO(d);
      });
    });
    syncDependents();
    modal.open = true;
  });

  fieldsHost.addEventListener('cds-radio-button-group-changed', syncDependents);
  fieldsHost.addEventListener('cds-checkbox-changed', syncDependents);

  saveBtn?.addEventListener('click', () => {
    const key = openKey;
    const spec = key ? specs[key] : null;
    if (!key || !spec) return;
    const prev = recordValues(key);
    const next: Values = {};
    for (const f of spec.fields) {
      const el = fieldsHost.querySelector<any>(`[data-field-name="${f.name}"]`);
      if (f.type === 'daterange') {
        const s = f.startName || 'start';
        const e = f.endName || 'end';
        const r = (el ? readControl(f, el, { start: prev[s], end: prev[e] }) : { start: prev[s], end: prev[e] }) as { start: string; end: string };
        next[s] = r.start;
        next[e] = r.end;
      } else {
        next[f.name] = el ? readControl(f, el, prev[f.name]) : prev[f.name];
      }
    }
    overlay[key] = next;
    localStorage.setItem(storageKey, JSON.stringify(overlay));
    render(key);
    listeners.forEach((fn) => fn(key, next, spec));
    modal.open = false;
  });
}
