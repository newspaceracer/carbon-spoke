// Issues for the researcher, on the REVIEWER side — one card and one add/edit
// dialog, shared by the application-review prototype (review-workspace.ts) and the
// review wizard (final-letter.astro). Data + lifecycle: review-thread.ts. Dialog
// markup: components/IssueModal.astro. Card styles: styles/review-notes.css.
//
// A card shows where the issue stands in the return round trip (issueState), the
// quoted passage, what the reviewer asked for, and — once the researcher has
// resubmitted — their answer. Its actions follow the state: a draft can be edited
// or removed; a resubmitted one can be Resolved or sent back ("Ask again"); a
// resolved one can be reopened.
import { avatarHTML } from './avatar';
import { showToast } from './toast';
import {
  reviewStore, issueState, sectionTitle, todayLabel,
  type ReviewIssue, type IssueState,
} from './review-thread';

const PENCIL = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M2 26H30V28H2zM25.4 9c.8-.8.8-2 0-2.8 0 0 0 0 0 0l-3.6-3.6c-.8-.8-2-.8-2.8 0 0 0 0 0 0 0l-15 15V24h6.4L25.4 9zM20.4 4L24 7.6l-3 3L17.4 7 20.4 4zM6 22v-3.6l10-10 3.6 3.6-10 10H6z"/></svg>';
const TRASH = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 12H14V24H12zM18 12H20V24H18z"/><path d="M4 6V8H6V28a2 2 0 002 2H24a2 2 0 002-2V8h2V6zM8 28V8H24V28zM12 2H20V4H12z"/></svg>';

const STATE: Record<IssueState, { kind: string; label: (i: ReviewIssue) => string }> = {
  draft: { kind: 'caution-minor', label: () => 'For the researcher' },
  sent: { kind: 'pending', label: (i) => `Sent ${i.sentAt} · waiting on the researcher` },
  addressed: { kind: 'informative', label: () => 'Researcher marked addressed' },
  'not-addressed': { kind: 'caution-major', label: () => 'Not addressed by the researcher' },
  resolved: { kind: 'succeeded', label: (i) => `Resolved ${i.resolvedAt}` },
};

const el = (tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  if (text !== undefined) n.textContent = text;
  return n;
};

export interface IssueCardOptions {
  permitId: string;
  /** May this viewer change issues (add / edit / remove / resolve)? */
  canEdit: boolean;
  /** Label the card with its section (for lists that mix sections). */
  withSection?: boolean;
  /** Called after any change, to re-render the host. */
  onChange: () => void;
  /** The author stamped on edits made from the card's dialog. */
  author: string;
}

export function buildIssueCard(i: ReviewIssue, o: IssueCardOptions): HTMLElement {
  const store = reviewStore(o.permitId);
  const state = issueState(i, store.returned());
  const update = (patch: Partial<ReviewIssue>, toast: string) => {
    store.saveIssues(store.issues().map((x) => (x.id === i.id ? { ...x, ...patch } : x)));
    o.onChange();
    showToast(toast);
  };

  const li = el('li', { class: `rw-note rw-issue rw-issue--${state}`, 'data-issue': i.id });
  const head = el('div', { class: 'rw-note__head' });
  head.append(el('cds-icon-indicator', { kind: STATE[state].kind, label: STATE[state].label(i), size: '16' }));
  const av = document.createElement('span');
  av.innerHTML = avatarHTML(i.author, 'sm');
  head.append(av.firstElementChild ?? av);
  const meta = el('p', { class: 'rw-note__meta t-label-01' });
  meta.append(el('b', {}, i.author), document.createTextNode(` · ${i.time}`));
  head.append(meta);
  if (o.withSection) head.append(el('cds-link', { href: `#${i.section}`, size: 'sm' }, sectionTitle(i.section)));

  const tools = el('div', { class: 'rw-note__tools' });
  const iconBtn = (svg: string, tip: string, fn: () => void) => {
    const b = el('cds-icon-button', { kind: 'ghost', size: 'sm', align: 'left' });
    b.innerHTML = `${svg}<span slot="tooltip-content"></span>`;
    b.querySelector('[slot="tooltip-content"]')!.textContent = tip;
    b.addEventListener('click', fn);
    return b;
  };
  const ghost = (label: string, fn: () => void) => {
    const b = el('cds-button', { kind: 'ghost', size: 'sm' }, label);
    b.addEventListener('click', fn);
    return b;
  };
  if (o.canEdit) {
    if (state === 'draft') {
      tools.append(
        iconBtn(PENCIL, 'Edit issue', () => openIssueModal({ permitId: o.permitId, section: i.section, quote: i.quote, issue: i, author: o.author, onSaved: o.onChange })),
        iconBtn(TRASH, 'Remove issue', () => {
          store.saveIssues(store.issues().filter((x) => x.id !== i.id));
          o.onChange();
          showToast('Issue removed');
        }),
      );
    } else if (state === 'addressed' || state === 'not-addressed') {
      tools.append(
        ghost('Resolve', () => update({ resolvedAt: todayLabel() }, 'Issue resolved')),
        // Not fixed yet: back to draft, so it goes out with the next return.
        ghost('Ask again', () => update({ sentAt: undefined, response: undefined }, 'Issue will go out with the next return')),
      );
    } else if (state === 'resolved') {
      tools.append(ghost('Reopen', () => update({ resolvedAt: undefined }, 'Issue reopened')));
    }
  }
  head.append(tools);
  li.append(head);

  if (i.quote) li.append(el('blockquote', { class: 'rw-note__quote t-body-01' }, i.quote));
  li.append(el('p', { class: 'rw-note__text t-body-01' }, i.text));
  if (i.response && (state === 'addressed' || state === 'not-addressed' || state === 'resolved')) {
    const r = el('div', { class: 'rw-issue__response' });
    r.append(el('p', { class: 'rw-issue__response-label t-label-01' }, `Researcher's reply · ${i.response.at}`));
    r.append(el('p', { class: 't-body-01' }, i.response.note || (i.response.addressed ? 'Marked addressed, no note.' : 'No reply.')));
    li.append(r);
  }
  return li;
}

// ── Add / edit dialog ───────────────────────────────────────────────────────
interface OpenOptions {
  permitId: string;
  section: string;
  quote?: string;
  issue?: ReviewIssue;
  author: string;
  onSaved: () => void;
}
let current: OpenOptions | null = null;
let wired = false;

export function openIssueModal(o: OpenOptions): void {
  const modal = document.querySelector('[data-issue-modal]') as any;
  if (!modal) return;
  const q = <T extends Element = HTMLElement>(s: string) => modal.querySelector(s) as T | null;
  const input = q('[data-issue-input]') as any;
  if (!wired) {
    wired = true;
    document.body.append(modal); // never trapped by a sticky / scrolling host
    q('[data-issue-save]')?.addEventListener('click', () => {
      if (!current) return;
      const text = (input.value ?? '').trim();
      if (!text) { input.invalid = true; input.focus?.(); return; }
      const store = reviewStore(current.permitId);
      const list = store.issues();
      if (current.issue) {
        const it = list.find((x) => x.id === current!.issue!.id);
        if (it) it.text = text;
      } else {
        list.push({ id: `iss-${Date.now().toString(36)}`, section: current.section, quote: current.quote, text, author: current.author, time: todayLabel() });
      }
      store.saveIssues(list);
      modal.open = false;
      showToast(current.issue ? 'Issue updated' : 'Issue added', `${sectionTitle(current.section)} · sent when the application is returned.`);
      current.onSaved();
      current = null;
    });
  }
  current = o;
  q('[data-issue-label]')!.textContent = sectionTitle(o.section);
  q('[data-issue-heading]')!.textContent = o.issue ? 'Edit issue' : 'Add an issue for the researcher';
  const quote = q('[data-issue-quote]')!;
  quote.hidden = !o.quote;
  q('[data-issue-quote-text]')!.textContent = o.quote ?? '';
  input.value = o.issue?.text ?? '';
  input.invalid = false;
  const save = q('[data-issue-save]');
  if (save) save.textContent = o.issue ? 'Save issue' : 'Add issue';
  modal.open = true;
  setTimeout(() => input.focus?.(), 60);
}
