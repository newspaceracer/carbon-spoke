// Small form-feedback helpers shared by the permit application's inline "add"
// forms (participant / specimen modals, the occurrence picker) and rosters.
// Carbon owns the look; these only drive its `invalid` / focus state.

/** Flag a cds-* field invalid with a message, focus it, and clear the flag the
 *  moment the user edits it ("punish late, reward early"). */
export function flagField(field: any, message: string, clearOn = 'input'): void {
  if (!field) return;
  field.invalid = true;
  field.invalidText = message;
  field.addEventListener(
    clearOn,
    () => {
      field.invalid = false;
      field.invalidText = '';
    },
    { once: true },
  );
  field.focus?.();
}

/** Run `action` when Enter is pressed inside `container`'s single-line fields.
 *  Textareas keep Enter for newlines; Cmd/Ctrl+Enter runs the action there. */
export function submitOnEnter(container: HTMLElement | null, action: () => void): void {
  container?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    const inTextarea = e.composedPath().some((n) => (n as HTMLElement).tagName === 'TEXTAREA');
    if (inTextarea && !(e.metaKey || e.ctrlKey)) return;
    // Combo-box / dropdown menus use Enter to pick an option — leave those alone.
    const inMenu = e.composedPath().some((n) => /^CDS-(COMBO-BOX|DROPDOWN)$/.test((n as HTMLElement).tagName ?? ''));
    if (inMenu) return;
    e.preventDefault();
    action();
  });
}

/** Before removing a roster row, pick where focus should land next: the next
 *  row's remove button, else the previous row's, else `fallback`. Call it BEFORE
 *  the row is removed, then focus the returned element afterwards. */
export function focusTargetAfterRemove(row: Element, fallback: HTMLElement | null): HTMLElement | null {
  const sibling = row.nextElementSibling ?? row.previousElementSibling;
  return (sibling?.querySelector('.row-remove') as HTMLElement | null) ?? fallback;
}

/** Parse the date pickers' mm/dd/yyyy text into a comparable timestamp. */
export function parseUsDate(s: string): number {
  const [m, d, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d).getTime();
}
