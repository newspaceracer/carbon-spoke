// The special-conditions editor — ONE implementation shared by every surface that
// curates a permit's conditions (markup: components/ConditionsEditor.astro):
// the review wizard's working panel (final-letter.astro) and the application-review
// prototype. Lifted verbatim from final-letter's builder.
//
// A condition is fundamentally the TEXT that prints — the title is only a catalog
// label. Each owner scope (Headquarters, then each district) is a collapsible
// accordion section with its applied conditions, numbered per section (mirroring
// the letter), each with Move up / Move down / Edit / Remove, and an "Add
// condition" button. Add opens one dialog with two paths, one at a time: pull
// saved conditions from that scope's catalog, or write one (optionally saving it
// to the catalog). Edit changes the text only.
//
// The host owns the data: `get` returns the applied list, `set` persists a new one
// (the shared permit-conditions-${id} store), `onChange` lets it refresh what
// depends on the list (a tab badge, the letter preview).
import {
  ownerLabel, loadInventory, saveInventory, newConditionId, plainText,
  type ConditionOwner, type PermitCondition,
} from '../data/conditions';

export interface ConditionsEditorOptions {
  owners: ConditionOwner[];
  get: () => PermitCondition[];
  set: (list: PermitCondition[]) => void;
  currentUser: string;
  /** Stamped on added conditions (the review stage they were added in). */
  addedAt?: string;
  /** The HTML a condition displays — lets a host resolve placeholders. */
  displayHtml?: (c: PermitCondition) => string;
  onChange?: () => void;
  /** False → read-only: no add / edit / remove / reorder controls. */
  canEdit?: () => boolean;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const chevronUp = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5 13 10 12.3 10.7 8 6.4 3.7 10.7 3 10z"/></svg>';
const chevronDown = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 11 3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"/></svg>';
const editIcon = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M2 26H30V28H2zM25.4 9c.8-.8.8-2 0-2.8l-3.6-3.6c-.8-.8-2-.8-2.8 0l-15 15V24h6.4L25.4 9zM20.4 4L24 7.6l-3 3L17.4 7zM8 22v-3.6l10-10L21.6 12l-10 10z"/></svg>';
const trashIcon = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 12H14V24H12zM18 12H20V24H18z"/><path d="M4 6V8H6V28a2 2 0 002 2H24a2 2 0 002-2V8h2V6zM8 28V8H24V28zM12 2H20V4H12z"/></svg>';

export function mountConditionsEditor(root: HTMLElement, opts: ConditionsEditorOptions): { render: () => void } {
  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
  const groupsHost = q('[data-ce-groups]')!;
  const tools = q('[data-ce-tools]');
  const modal = q('[data-ce-modal]') as any;
  // The dialog must escape any sticky / scrolling host's stacking context.
  if (modal) document.body.append(modal);
  const m = <T extends Element = HTMLElement>(sel: string) => (modal as HTMLElement | null)?.querySelector<T>(sel) ?? null;

  const canEdit = () => opts.canEdit?.() ?? true;
  const display = (c: PermitCondition) => opts.displayHtml?.(c) ?? c.body;
  // Which scope sections are expanded — survives rebuilds so a collapse sticks.
  const openGroups = new Set(opts.owners);
  const commit = (list: PermitCondition[]) => { opts.set(list); render(); opts.onChange?.(); };

  function render() {
    const list = opts.get();
    const editable = canEdit();
    if (tools) tools.style.display = '';
    groupsHost.innerHTML = `<cds-accordion>${opts.owners.map((owner) => {
      const applied = list.filter((c) => c.owner === owner);
      const cards = applied.map((c, i) => `
        <li class="cond">
          <div class="cond__bar">
            <span class="cond__num">${i + 1}</span>
            ${editable ? `<div class="cond__actions">
              <cds-icon-button kind="ghost" size="sm" data-move-cond="${c.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>
                ${chevronUp}<span slot="tooltip-content">Move up</span>
              </cds-icon-button>
              <cds-icon-button kind="ghost" size="sm" data-move-cond="${c.id}" data-dir="1" ${i === applied.length - 1 ? 'disabled' : ''}>
                ${chevronDown}<span slot="tooltip-content">Move down</span>
              </cds-icon-button>
              <cds-icon-button kind="ghost" size="sm" data-edit-cond="${c.id}">
                ${editIcon}<span slot="tooltip-content">Edit condition</span>
              </cds-icon-button>
              <cds-icon-button kind="ghost" size="sm" data-remove-cond="${c.id}">
                ${trashIcon}<span slot="tooltip-content">Remove condition</span>
              </cds-icon-button>
            </div>` : ''}
          </div>
          <p class="cond__text t-body-01">${esc(plainText(display(c)))}</p>
        </li>`).join('');
      return `
        <cds-accordion-item data-cond-group="${owner}" ${openGroups.has(owner) ? 'open' : ''}>
          <div slot="title" class="cond-acc__title">
            <span class="cond-acc__name t-heading-compact-01">${esc(ownerLabel(owner))}</span>
            <cds-tag type="gray" size="sm">${applied.length}</cds-tag>
          </div>
          <ul class="cond-list">${cards || '<li class="cond cond--empty t-label-01">No conditions applied.</li>'}</ul>
          ${editable ? `<cds-button kind="tertiary" size="md" data-add-cond="${owner}">Add condition</cds-button>` : ''}
        </cds-accordion-item>`;
    }).join('')}</cds-accordion>`;
  }

  // Reorder WITHIN an owner scope (a district condition can't jump into HQ).
  const move = (id: string, dir: number) => {
    const list = opts.get();
    const item = list.find((c) => c.id === id);
    if (!item) return;
    const group = list.filter((c) => c.owner === item.owner);
    const gi = group.findIndex((c) => c.id === id);
    const ni = gi + dir;
    if (ni < 0 || ni >= group.length) return;
    [group[gi], group[ni]] = [group[ni], group[gi]];
    let g = 0;
    commit(list.map((c) => (c.owner === item.owner ? group[g++] : c)));
  };

  // ── Add / edit dialog ────────────────────────────────────────────────────
  let modalOwner: ConditionOwner = 'hq';
  let editingId: string | null = null;
  const modeEl = () => m('[data-ce-mode]') as any;
  const pickEl = () => m('[data-ce-pick]') as any;
  const bodyEl = () => m('[data-ce-body]') as any;
  const saveCatalogEl = () => m('[data-ce-save-catalog]') as any;
  const currentMode = (): 'catalog' | 'manual' => (modeEl()?.value === 'manual' ? 'manual' : 'catalog');
  const setShown = (sel: string, on: boolean) => { const x = m<HTMLElement>(sel); if (x) x.hidden = !on; };
  const applyMode = () => {
    setShown('[data-ce-catalog]', currentMode() === 'catalog');
    setShown('[data-ce-manual]', currentMode() === 'manual');
  };
  const previewText = (html: string) => { const s = plainText(html); return s.length > 90 ? `${s.slice(0, 89)}…` : s; };

  // The owner's saved catalog items not already applied to this permit.
  const buildPicker = (owner: ConditionOwner) => {
    const el = pickEl();
    if (!el) return;
    const applied = new Set(opts.get().filter((c) => c.inventoryId).map((c) => c.inventoryId));
    const available = loadInventory(owner)
      .filter((it) => !applied.has(it.id))
      .sort((a, b) => plainText(a.body).localeCompare(plainText(b.body)));
    el.innerHTML = available.map((it) => `<cds-multi-select-item value="${esc(it.id)}">${esc(previewText(it.body))}</cds-multi-select-item>`).join('');
  };

  const openModal = (owner: ConditionOwner, id: string | null) => {
    modalOwner = owner;
    editingId = id;
    const editing = id !== null;
    const c = editing ? opts.get().find((x) => x.id === id) ?? null : null;
    const heading = m('[data-ce-heading]');
    const label = m('[data-ce-owner]');
    if (heading) heading.textContent = editing ? 'Edit condition' : 'Add condition';
    if (label) label.textContent = ownerLabel(owner);
    if (editing) {
      // Editing: text only — no catalog path, no switcher.
      setShown('[data-ce-mode-wrap]', false);
      setShown('[data-ce-catalog]', false);
      setShown('[data-ce-manual]', true);
      if (saveCatalogEl()) saveCatalogEl().hidden = true;
    } else {
      setShown('[data-ce-mode-wrap]', true);
      if (modeEl()) modeEl().value = 'catalog';
      buildPicker(owner);
      if (saveCatalogEl()) { saveCatalogEl().hidden = false; saveCatalogEl().checked = false; }
      applyMode();
    }
    if (bodyEl()) bodyEl().value = c?.body ?? '';
    if (modal) modal.open = true;
  };

  const selectedInventoryIds = (): string[] =>
    Array.from(pickEl()?.querySelectorAll('cds-multi-select-item') ?? [])
      .filter((i: any) => i.selected)
      .map((i: any) => i.getAttribute('value') || '')
      .filter(Boolean);

  const save = () => {
    const body = (bodyEl()?.value ?? '').toString().trim();
    const list = opts.get();
    if (editingId !== null) {
      if (body) commit(list.map((c) => (c.id === editingId ? { ...c, body } : c)));
      if (modal) modal.open = false;
      return;
    }
    const prefix = modalOwner === 'hq' ? 'hq' : modalOwner;
    const additions: PermitCondition[] = [];
    if (currentMode() === 'catalog') {
      const inventory = loadInventory(modalOwner);
      selectedInventoryIds().forEach((invId) => {
        const it = inventory.find((x) => x.id === invId);
        if (it && !list.some((c) => c.inventoryId === invId)) {
          additions.push({ id: newConditionId(prefix), owner: modalOwner, source: 'inventory', inventoryId: it.id,
            body: it.body, addedBy: opts.currentUser, addedAt: opts.addedAt ?? 'In review' });
        }
      });
    } else if (body) {
      additions.push({ id: newConditionId(prefix), owner: modalOwner, source: 'custom', body,
        addedBy: opts.currentUser, addedAt: opts.addedAt ?? 'In review' });
      if (saveCatalogEl()?.checked) {
        const inv = loadInventory(modalOwner);
        inv.push({ id: newConditionId(prefix), owner: modalOwner, body, isDefault: false });
        saveInventory(modalOwner, inv);
      }
    }
    if (!additions.length) return;
    commit([...list, ...additions]);
    if (modal) modal.open = false;
  };
  m('[data-ce-save]')?.addEventListener('click', save);
  modeEl()?.addEventListener('cds-content-switcher-selected', applyMode);

  groupsHost.addEventListener('click', (e) => {
    if (!canEdit()) return;
    const t = e.target as HTMLElement;
    const rm = t.closest?.<HTMLElement>('[data-remove-cond]');
    if (rm) { commit(opts.get().filter((c) => c.id !== rm.dataset.removeCond)); return; }
    const mv = t.closest?.<HTMLElement>('[data-move-cond]');
    if (mv) { move(mv.dataset.moveCond!, Number(mv.dataset.dir)); return; }
    const ed = t.closest?.<HTMLElement>('[data-edit-cond]');
    if (ed) { const c = opts.get().find((x) => x.id === ed.dataset.editCond); if (c) openModal(c.owner, c.id); return; }
    const ad = t.closest?.<HTMLElement>('[data-add-cond]');
    if (ad) openModal(ad.dataset.addCond!, null);
  });

  // Remember which scope sections are collapsed so a rebuild doesn't reopen them.
  groupsHost.addEventListener('cds-accordion-item-toggled', (e: any) => {
    const owner = (e.target as HTMLElement)?.dataset?.condGroup;
    if (!owner) return;
    if (e.detail.open) openGroups.add(owner); else openGroups.delete(owner);
  });

  // Collapse all / Expand all.
  const setAll = (open: boolean) => {
    groupsHost.querySelectorAll<HTMLElement>('cds-accordion-item[data-cond-group]').forEach((it) => {
      const owner = it.dataset.condGroup;
      if (owner) { if (open) openGroups.add(owner); else openGroups.delete(owner); }
      (it as any).open = open;
    });
  };
  q('[data-ce-collapse]')?.addEventListener('click', () => setAll(false));
  q('[data-ce-expand]')?.addEventListener('click', () => setAll(true));

  return { render };
}
