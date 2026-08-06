// ONE renderer for a "contact" table cell — a person's name over a mailto link
// plus the house copy-email icon button (the same `data-copy-email` affordance
// AnalysisTeam / ContactCard use, handled by lib/email-copy.ts).
//
// It returns an HTML STRING because the surface that needs it (permit.astro's
// Authorized-parks table) renders the same cell twice: server-side in Astro
// markup (`set:html`) and again client-side after re-hydrating the contacts
// recorded on the finalize wizard. Sharing the string keeps the two identical.
export interface CellContact {
  id: string;
  name: string;
  email: string;
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Slotted into cds-icon-button, which colors the glyph with `color:` only —
// hence the explicit fill="currentColor" so it tracks the theme zone.
const copyIcon =
  '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M28,10V28H10V10H28m0-2H10a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2Z"/><path d="M4,18H2V4A2,2,0,0,1,4,2H18V4H4Z"/></svg>';

const personHtml = (c: CellContact) =>
  `<span class="contact-cell__person"><span class="contact-cell__name">${esc(c.name)}</span>` +
  (c.email
    ? `<span class="contact-cell__email">` +
      `<cds-link href="mailto:${esc(c.email)}">${esc(c.email)}</cds-link>` +
      // autoalign: Floating UI positions the tooltip with `position: fixed`, so it
      // renders OVER any scroll container it sits in rather than inside it. Without
      // it, a tooltip inside the Authorized-parks table's overflow wrapper extends
      // that wrapper's scrollable area — hovering a copy button made the section
      // scroll. (Note `overflow-x: auto` alone does it: per spec, a non-visible
      // value on one axis computes the other to `auto` too, so the wrapper scrolls
      // vertically as well.)
      `<cds-icon-button class="contact-cell__copy" kind="ghost" size="sm" align="bottom" autoalign data-copy-email="${esc(c.email)}">` +
      `${copyIcon}<span slot="tooltip-content">Copy ${esc(c.name)}’s email</span>` +
      `</cds-icon-button></span>`
    : '') +
  '</span>';

/**
 * Render a list of contacts as cell content. `empty` is the fallback markup when
 * there are none — pass '' to leave the cell blank (the Park-contact column) or a
 * span of quiet text when the absence needs explaining.
 */
export function contactCellHtml(contacts: CellContact[], empty = ''): string {
  if (!contacts.length) return empty;
  return contacts.map(personHtml).join('');
}

/** Dedupe resolved people by id, dropping anything that didn't resolve. */
export function dedupeContacts<T extends { id: string }>(arr: (T | null | undefined)[]): T[] {
  const seen = new Set<string>();
  return arr.filter((c): c is T => Boolean(c) && !seen.has(c!.id) && Boolean(seen.add(c!.id)));
}
