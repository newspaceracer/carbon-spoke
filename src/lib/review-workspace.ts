// The review workspace for the application-record prototype (markup:
// components/record/ReviewWorkspace.astro). Two modes, from the root's data-mode:
//
//   • view (the DETAIL page) — read-only: the status notice, the gated sections,
//     the comments as a read-only list, and the header's Start review / Open
//     review action that leads to the review page.
//   • review (the REVIEW page) — everything below.
//
// On the review page, a reviewer can:
//
//   • mark ISSUES for the researcher — from a section's "Add" menu, or on a
//     selected passage — which stay drafts until the application is returned;
//   • leave COMMENTS for other reviewers, reply to them, and resolve them;
//   • decide: Approve (continues to the permit-letter step, the app's approval
//     path), Return to researcher (sends the issues), or Reject (with a reason).
//
// Who can do what follows the app's model: comments are open to every internal
// identity (always allowed); issues need a started review and a role on the
// permit (Responsible or Supporting) or Admin; decisions are the Responsible
// analyst's / Admin's (permissions.ts `approve`). A decision is persisted to the
// same permit-status-${id} the rest of the app reads, and notifies the researcher
// through the simulated email service, like PermitHeader's decision actions.
import { readIdentity } from './maintenance';
import { activeUser } from '../data/user';
import { avatarHTML, initials } from './avatar';
import { showToast } from './toast';
import { renderMentionText, wireMentionTypeahead, type MentionUser } from './comment-mentions';
import { sectionAccessor, normalizeStatus, readPermitRole } from './permissions';
import { sendEmail } from './notifications';
import {
  reviewStore, RECORD_SECTIONS, sectionTitle, sectionOf, commentKey, todayLabel,
  type ReviewComment, type ReviewIssue,
} from './review-thread';

const INTERNAL = ['admin', 'hq-technical', 'district-lead', 'district-assistant'];
const APPROVED = ['out-for-signature', 'waiting-for-annual-report', 'active', 'expired'];
const STATUS_KIND: Record<string, string> = {
  'Waiting for review': 'not-started', 'Under review': 'in-progress',
  'Changes requested': 'caution-minor', 'Returned to submitter': 'caution-minor',
  'Out for signature': 'pending', 'Waiting for annual report': 'pending',
  'Active': 'succeeded', 'Expired': 'unknown', 'Rejected': 'failed', 'Withdrawn': 'undefined',
};

const PENCIL = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M2 26H30V28H2zM25.4 9c.8-.8.8-2 0-2.8 0 0 0 0 0 0l-3.6-3.6c-.8-.8-2-.8-2.8 0 0 0 0 0 0 0l-15 15V24h6.4L25.4 9zM20.4 4L24 7.6l-3 3L17.4 7 20.4 4zM6 22v-3.6l10-10 3.6 3.6-10 10H6z"/></svg>';
const TRASH = '<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 12H14V24H12zM18 12H20V24H18z"/><path d="M4 6V8H6V28a2 2 0 002 2H24a2 2 0 002-2V8h2V6zM8 28V8H24V28zM12 2H20V4H12z"/></svg>';

const el = <K extends string>(tag: K, attrs: Record<string, string> = {}, text?: string): HTMLElement => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  if (text !== undefined) n.textContent = text;
  return n;
};
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function initReviewWorkspace(): void {
  const root = document.querySelector<HTMLElement>('[data-review-workspace]');
  if (!root || root.dataset.rwReady) return;
  root.dataset.rwReady = 'true';

  const permitId = root.dataset.permitId!;
  const store = reviewStore(permitId);
  const parse = <T>(sel: string, fallback: T): T => {
    try { return JSON.parse(root.querySelector(sel)?.textContent || '') as T; } catch { return fallback; }
  };
  const seeds = parse<ReviewComment[]>('[data-rw-seed-comments]', []);
  const dir = parse<MentionUser[]>('[data-rw-directory]', []);

  const reviewMode = root.dataset.mode === 'review';
  const identity = readIdentity();
  const me = activeUser(identity)?.name || 'You';
  const isInternal = INTERNAL.includes(identity);

  // ── Status ────────────────────────────────────────────────────────────────
  // `?status=…` previews another status on this page without saving it.
  const preview = new URLSearchParams(location.search).get('status');
  const statusKey = `permit-status-${permitId}`;
  const startedKey = `permit-review-started-${permitId}`;
  const ls = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
  let previewStatus = preview;
  const status = () => previewStatus || ls(statusKey) || root.dataset.seedStatus || 'Waiting for review';
  const phase = () => normalizeStatus(status());
  const access = () => sectionAccessor(identity, permitId, root.dataset.permitType, status());
  const inReview = () => phase() === 'under-review';
  const canStart = () => phase() === 'waiting-for-review' && (identity === 'admin' || readPermitRole(permitId) === 'responsible');
  const canDecide = () => inReview() && access()('approve') === 'update';
  const canFlag = () => reviewMode && inReview() && (canDecide() || readPermitRole(permitId) === 'supporting');
  const canComment = () => reviewMode && isInternal;

  const setStatus = (s: string) => {
    previewStatus = null; // a real decision ends any preview
    try { localStorage.setItem(statusKey, s); } catch {}
    window.dispatchEvent(new CustomEvent('permit-status-changed', { detail: { status: s } }));
    render();
  };
  const emailVars = () => ({ 'Permit #': permitId, 'Project title': root.dataset.permitName || '', 'Status': status() });

  // ── Data views ────────────────────────────────────────────────────────────
  const allComments = (): ReviewComment[] => [...store.comments(), ...seeds];
  const draftIssues = () => store.issues().filter((i) => !i.sentAt);
  const openComments = () => { const done = store.resolved(); return allComments().filter((c) => !done.has(commentKey(c))); };

  // ── Building notes ────────────────────────────────────────────────────────
  const openThreads = new Set<string>(); // sections whose comment list is expanded

  const head = (author: string, time: string): HTMLElement => {
    const h = el('div', { class: 'rw-note__head' });
    const av = document.createElement('span');
    av.innerHTML = avatarHTML(author, 'sm');
    h.append(av.firstElementChild ?? av);
    const meta = el('p', { class: 'rw-note__meta t-label-01' });
    meta.append(el('b', {}, author), document.createTextNode(` · ${time}`));
    h.append(meta);
    return h;
  };
  const quoteEl = (q?: string) => (q ? el('blockquote', { class: 'rw-note__quote t-body-01' }, q) : null);
  const textEl = (text: string, mentions: string[] = []) => {
    const p = el('p', { class: 'rw-note__text t-body-01' });
    p.append(renderMentionText(text, mentions));
    return p;
  };
  const iconButton = (svg: string, tip: string, onClick: () => void) => {
    const b = el('cds-icon-button', { kind: 'ghost', size: 'sm', align: 'left' });
    b.innerHTML = `${svg}<span slot="tooltip-content"></span>`;
    b.querySelector('[slot="tooltip-content"]')!.textContent = tip;
    b.addEventListener('click', onClick);
    return b;
  };
  const ghost = (label: string, onClick: () => void) => {
    const b = el('cds-button', { kind: 'ghost', size: 'sm' }, label);
    b.addEventListener('click', onClick);
    return b;
  };

  const buildIssue = (i: ReviewIssue, withSection = false): HTMLElement => {
    const li = el('li', { class: 'rw-note', 'data-issue': i.id });
    const h = head(i.author, i.time);
    h.prepend(el('cds-icon-indicator', { kind: 'caution-minor', label: 'For the researcher', size: '16' }));
    if (withSection) h.append(el('cds-link', { href: `#${i.section}`, size: 'sm' }, sectionTitle(i.section)));
    const tools = el('div', { class: 'rw-note__tools' });
    if (i.sentAt) {
      tools.append(el('cds-tag', { type: 'gray', size: 'md' }, `Sent ${i.sentAt}`));
    } else if (canFlag()) {
      tools.append(
        iconButton(PENCIL, 'Edit issue', () => openNote({ kind: 'issue', section: i.section, quote: i.quote, issue: i })),
        iconButton(TRASH, 'Remove issue', () => {
          store.saveIssues(store.issues().filter((x) => x.id !== i.id));
          render();
          showToast('Issue removed');
        }),
      );
    }
    h.append(tools);
    li.append(h);
    const q = quoteEl(i.quote); if (q) li.append(q);
    li.append(textEl(i.text));
    return li;
  };

  const buildComment = (c: ReviewComment, withSection = false): HTMLElement => {
    const done = store.resolved().has(commentKey(c));
    const replies = store.replies()[commentKey(c)] || [];
    const li = el('li', { class: `rw-note${done ? ' rw-note--resolved' : ''}` });
    const h = head(c.author, c.time);
    const sec = sectionOf(c);
    if (withSection && sec) h.append(el('cds-link', { href: `#${sec}`, size: 'sm' }, sectionTitle(sec)));
    if (done) { const t = el('div', { class: 'rw-note__tools' }); t.append(el('cds-tag', { type: 'green', size: 'md' }, 'Resolved')); h.append(t); }
    li.append(h);
    const q = quoteEl(c.anchor?.quote); if (q) li.append(q);
    li.append(textEl(c.text, c.mentions));
    if (replies.length) {
      const ul = el('ul', { class: 'rw-replies' });
      replies.forEach((r) => {
        const rli = el('li', { class: 'rw-reply' });
        rli.append(head(r.author, r.time), textEl(r.text, r.mentions));
        ul.append(rli);
      });
      li.append(ul);
    }
    if (canComment()) {
      const actions = el('div', { class: 'rw-note__actions' });
      actions.append(
        ghost(replies.length ? `Reply (${replies.length})` : 'Reply', () => openReply(li, c)),
        ghost(done ? 'Reopen' : 'Resolve', () => {
          store.setResolved(c, !done);
          render();
          showToast(done ? 'Comment reopened' : 'Comment resolved');
        }),
      );
      li.append(actions);
    }
    return li;
  };

  // Inline reply composer under a comment (same @-mention typeahead).
  const openReply = (li: HTMLElement, parent: ReviewComment) => {
    const existing = li.querySelector<HTMLElement>('.rw-reply-composer');
    if (existing) { (existing.querySelector('cds-textarea') as any)?.focus?.(); return; }
    const box = el('div', { class: 'rw-reply-composer' });
    const field = el('div', { class: 'rw-mention-field' });
    const input = el('cds-textarea', { label: 'Reply', placeholder: 'Write a reply… type @ to mention someone', rows: '2' }) as any;
    const menu = el('ul', { class: 'rw-mention-menu', role: 'listbox', 'aria-label': 'Mention a user', hidden: '' });
    field.append(input, menu);
    const acts = el('div', { class: 'rw-reply-composer__actions' });
    const cancel = el('cds-button', { kind: 'ghost', size: 'sm' }, 'Cancel');
    const post = el('cds-button', { kind: 'primary', size: 'sm' }, 'Reply');
    acts.append(cancel, post);
    box.append(field, acts);
    li.querySelector('.rw-note__actions')?.before(box);
    const picked = wireMentionTypeahead(input, menu, dir);
    const send = () => {
      const text = (input.value ?? '').trim();
      if (!text) { input.focus(); return; }
      const mentioned = [...picked.values()].filter((u) => text.includes(`@${u.name}`));
      store.addReply(parent, { author: me, time: todayLabel(), text, mentions: mentioned.map((u) => u.name) });
      render();
      showToast('Reply posted', mentioned.length ? `Notified ${mentioned.map((u) => u.name).join(', ')} of your mention.` : undefined);
    };
    post.addEventListener('click', send);
    cancel.addEventListener('click', () => box.remove());
    input.addEventListener('keydown', (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); send(); } });
    setTimeout(() => input.focus?.(), 30);
  };

  // ── Rendering ─────────────────────────────────────────────────────────────
  const renderSection = (slug: string) => {
    const host = document.querySelector<HTMLElement>(`[data-section-review="${slug}"]`);
    if (!host) return;
    host.className = 'rw-sec';
    host.replaceChildren();
    if (!isInternal) return;

    const issues = store.issues().filter((i) => i.section === slug);
    if (issues.length) {
      const ul = el('ul', { class: 'rw-issues', 'aria-label': `Issues for the researcher in ${sectionTitle(slug)}` });
      issues.forEach((i) => ul.append(buildIssue(i)));
      host.append(ul);
    }

    const comments = allComments().filter((c) => sectionOf(c) === slug);
    if (comments.length) {
      const done = store.resolved();
      const open = comments.filter((c) => !done.has(commentKey(c))).length;
      const expanded = openThreads.has(slug);
      const listId = `rw-thread-${slug}`;
      const toggle = el('cds-button', { kind: 'ghost', size: 'sm', 'aria-expanded': String(expanded), 'aria-controls': listId },
        expanded ? 'Hide comments' : `Show ${plural(comments.length, 'comment')}${open ? ` · ${open} open` : ''}`);
      toggle.addEventListener('click', () => {
        if (openThreads.has(slug)) openThreads.delete(slug); else openThreads.add(slug);
        renderSection(slug);
      });
      const wrap = el('div');
      wrap.append(toggle);
      host.append(wrap);
      const ul = el('ul', { class: 'rw-thread', id: listId });
      if (!expanded) ul.hidden = true;
      comments.forEach((c) => ul.append(buildComment(c)));
      host.append(ul);
    }
  };

  const renderOverview = () => {
    const ul = document.querySelector<HTMLElement>('[data-rw-overview]');
    if (!ul) return;
    ul.replaceChildren();
    allComments().forEach((c) => ul.append(buildComment(c, true)));
  };

  const notice = () => {
    const host = document.querySelector<HTMLElement>('[data-rw-notice]');
    if (!host) return;
    host.replaceChildren();
    const p = phase();
    let n: HTMLElement | null = null;
    if (p === 'returned') {
      const r = store.returned();
      const sent = store.issues().filter((i) => i.sentAt).length;
      n = el('cds-inline-notification', {
        kind: 'info', 'low-contrast': '', 'hide-close-button': '',
        title: `Returned to researcher${r ? ` · ${r.at}` : ''}`,
        subtitle: `${plural(sent, 'issue')} sent${r?.message ? ` with a message: “${r.message}”` : ''}. The researcher can resubmit once they're addressed.`,
      });
    } else if (p === 'rejected') {
      const r = store.rejected();
      n = el('cds-inline-notification', {
        kind: 'error', 'low-contrast': '', 'hide-close-button': '',
        title: `Application rejected${r ? ` · ${r.at}` : ''}`,
        subtitle: r?.reason ? `Reason: ${r.reason}` : 'The researcher was notified.',
      });
    } else if (APPROVED.includes(p)) {
      n = el('cds-inline-notification', {
        kind: 'success', 'low-contrast': '', 'hide-close-button': '',
        title: 'Application approved',
        subtitle: 'The permit conditions are now part of the permit.',
      });
    }
    if (n) host.append(n);
  };

  const bar = () => {
    const b = root.querySelector<HTMLElement>('[data-rw-bar]');
    const statusEl = root.querySelector<HTMLElement>('[data-rw-bar-status]');
    if (!b || !statusEl) return;
    const show = (sel: string, on: boolean) => {
      const x = root.querySelector<HTMLElement>(`[data-rw-action="${sel}"]`);
      if (x) x.style.display = on ? '' : 'none';
    };
    const p = phase();
    const visible = isInternal && (p === 'waiting-for-review' || p === 'under-review');
    b.hidden = !visible;
    document.body.classList.toggle('rw-has-bar', visible);
    if (!visible) return;
    if (p === 'waiting-for-review') {
      statusEl.textContent = canStart()
        ? 'Start the review to mark issues and make a decision.'
        : 'Waiting for the responsible analyst to start the review. You can still comment.';
      show('start', canStart()); show('reject', false); show('return', false); show('approve', false);
      return;
    }
    const issues = draftIssues().length;
    const open = openComments().length;
    statusEl.textContent = `${plural(issues, 'issue')} for the researcher · ${plural(open, 'open comment')}`
      + (canDecide() ? '' : ' · The responsible analyst makes the decision.');
    show('start', false);
    ['reject', 'return', 'approve'].forEach((a) => show(a, canDecide()));
  };

  const gates = () => {
    const show: Record<string, boolean> = { internal: isInternal, approved: APPROVED.includes(phase()) };
    document.querySelectorAll<HTMLElement>('[data-record-section][data-gate]').forEach((sec) => {
      const visible = show[sec.dataset.gate!] ?? true;
      // Inline display (not [hidden]) so no author display rule resurrects it.
      sec.style.display = visible ? '' : 'none';
      const item = document.querySelector<HTMLElement>(`[data-toc-item="${sec.id}"]`);
      if (item) item.style.display = visible ? '' : 'none';
    });
    // Gated tabs (the detail page's conditions tab); with only one tab left the
    // strip hides — and falls back to the application if it was showing.
    document.querySelectorAll<HTMLElement>('cds-tab[data-gate]').forEach((tab) => {
      tab.style.display = (show[tab.dataset.gate!] ?? true) ? '' : 'none';
    });
    const strip = document.querySelector<HTMLElement>('[data-record-tabs-wrap]');
    if (strip) {
      const visibleTabs = [...strip.querySelectorAll<HTMLElement>('cds-tab')].filter((t) => t.style.display !== 'none');
      strip.style.display = visibleTabs.length > 1 ? '' : 'none';
      const tabs = strip.querySelector('cds-tabs') as any;
      if (visibleTabs.length < 2 && tabs?.value !== 'application') {
        tabs.value = 'application';
        tabs.dispatchEvent(new CustomEvent('cds-tabs-selected'));
      }
    }
    document.querySelector('[data-record-toc]')?.dispatchEvent(new Event('record-toc-refresh'));
    // Add menus: comments for every internal identity; issues only while flagging is allowed.
    document.querySelectorAll<HTMLElement>('[data-add-menu]').forEach((m) => {
      m.style.display = canComment() ? '' : 'none';
      const issueItem = m.querySelector('[data-add="issue"]');
      if (canFlag()) issueItem?.removeAttribute('disabled'); else issueItem?.setAttribute('disabled', '');
    });
    const ind = document.querySelector('[data-status-indicator]');
    ind?.setAttribute('label', status());
    ind?.setAttribute('kind', STATUS_KIND[status()] ?? 'unknown');
  };

  // Detail page: the one header action — Start review (the responsible analyst /
  // Admin, before it starts; it records the start, then the link navigates) or
  // Open review (any staff while it's under review, or waiting on someone else).
  const headAction = document.querySelector<HTMLElement>('[data-rw-open-review]');
  const paintHeadAction = () => {
    if (!headAction) return;
    const p = phase();
    const visible = isInternal && (p === 'waiting-for-review' || p === 'under-review');
    headAction.style.display = visible ? '' : 'none';
    headAction.textContent = p === 'waiting-for-review' && canStart() ? 'Start review' : 'Open review';
  };
  headAction?.addEventListener('click', () => {
    if (phase() !== 'waiting-for-review' || !canStart()) return;
    try {
      localStorage.setItem(startedKey, JSON.stringify({ by: me, at: todayLabel() }));
      localStorage.setItem(statusKey, 'Under review');
    } catch {}
  });

  function render() {
    paintHeadAction();
    RECORD_SECTIONS.forEach((s) => renderSection(s.slug));
    renderOverview();
    notice();
    bar();
    gates();
  }

  // ── Add / edit a note ─────────────────────────────────────────────────────
  const noteModal = root.querySelector('[data-rw-note-modal]') as any;
  const noteInput = root.querySelector('[data-rw-note-input]') as any;
  const noteSave = root.querySelector<HTMLElement>('[data-rw-note-save]');
  const notePicked = wireMentionTypeahead(noteInput, root.querySelector('[data-rw-note-menu]'), dir);
  let pending: { kind: 'issue' | 'comment'; section: string; quote?: string; issue?: ReviewIssue } | null = null;

  function openNote(p: NonNullable<typeof pending>) {
    pending = p;
    const isIssue = p.kind === 'issue';
    root!.querySelector('[data-rw-note-label]')!.textContent = sectionTitle(p.section);
    root!.querySelector('[data-rw-note-heading]')!.textContent = isIssue ? (p.issue ? 'Edit issue' : 'Add an issue for the researcher') : 'Add a comment for reviewers';
    root!.querySelector('[data-rw-note-lede]')!.textContent = isIssue
      ? 'The researcher sees this when you return the application. Say what to change or provide.'
      : 'Only reviewers see comments. Type @ to mention someone.';
    const quote = root!.querySelector<HTMLElement>('[data-rw-note-quote]')!;
    quote.hidden = !p.quote;
    root!.querySelector('[data-rw-note-quote-text]')!.textContent = p.quote ?? '';
    noteInput.label = isIssue ? 'What needs to change?' : 'Comment';
    noteInput.value = p.issue?.text ?? '';
    noteInput.invalid = false;
    noteInput.invalidText = isIssue ? 'Describe what the researcher needs to change.' : 'Write a comment.';
    notePicked.clear();
    if (noteSave) noteSave.textContent = isIssue ? (p.issue ? 'Save issue' : 'Add issue') : 'Add comment';
    noteModal.open = true;
    setTimeout(() => noteInput.focus?.(), 60);
  }

  noteSave?.addEventListener('click', () => {
    if (!pending) return;
    const text = (noteInput.value ?? '').trim();
    if (!text) { noteInput.invalid = true; noteInput.focus?.(); return; }
    if (pending.kind === 'issue') {
      const list = store.issues();
      if (pending.issue) {
        const it = list.find((x) => x.id === pending!.issue!.id);
        if (it) it.text = text;
      } else {
        list.push({ id: `iss-${Date.now().toString(36)}`, section: pending.section, quote: pending.quote, text, author: me, time: todayLabel() });
      }
      store.saveIssues(list);
      showToast(pending.issue ? 'Issue updated' : 'Issue added', `${sectionTitle(pending.section)} · sent when you return the application.`);
    } else {
      const mentioned = [...notePicked.values()].filter((u) => text.includes(`@${u.name}`));
      store.addComment({
        author: me, time: todayLabel(), text, section: pending.section,
        mentions: mentioned.map((u) => u.name),
        ...(pending.quote ? { anchor: { quote: pending.quote } } : {}),
      });
      openThreads.add(pending.section);
      showToast('Comment posted', mentioned.length ? `Notified ${mentioned.map((u) => u.name).join(', ')} of your mention.` : undefined);
    }
    noteModal.open = false;
    pending = null;
    render();
  });

  // Section "Add" menus (Issue for the researcher / Comment for reviewers).
  document.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest?.('[data-add]') as HTMLElement | null;
    if (!item || item.hasAttribute('disabled')) return;
    const slug = item.closest<HTMLElement>('[data-add-menu]')?.dataset.addMenu;
    if (slug) openNote({ kind: item.dataset.add === 'issue' ? 'issue' : 'comment', section: slug });
  });

  // ── Selection toolbar: Issue / Comment on a selected passage ──────────────
  const sel = root.querySelector<HTMLElement>('[data-rw-select]');
  if (sel) document.body.append(sel); // position against the document, not a container
  let selection: { section: string; quote: string } | null = null;
  const hideSel = () => { if (sel) sel.hidden = true; selection = null; };
  const checkSelection = () => {
    const s = window.getSelection();
    if (!sel || !s || s.isCollapsed || !s.rangeCount || !canComment()) { hideSel(); return; }
    const range = s.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const host = (node.nodeType === 1 ? node as Element : node.parentElement)?.closest<HTMLElement>('[data-section-content]');
    const quote = s.toString().replace(/\s+/g, ' ').trim();
    if (!host || !quote) { hideSel(); return; }
    selection = { section: host.dataset.sectionContent!, quote: quote.length > 280 ? `${quote.slice(0, 277)}…` : quote };
    const r = range.getBoundingClientRect();
    sel.style.top = `${r.bottom + window.scrollY + 8}px`;
    sel.style.left = `${Math.max(8, r.left + window.scrollX)}px`;
    const issueBtn = sel.querySelector<HTMLElement>('[data-rw-select-add="issue"]');
    if (issueBtn) issueBtn.style.display = canFlag() ? '' : 'none';
    sel.hidden = false;
  };
  document.addEventListener('mouseup', (e) => { if (!sel?.contains(e.target as Node)) setTimeout(checkSelection, 0); });
  document.addEventListener('keyup', (e) => { if (e.shiftKey) checkSelection(); });
  sel?.addEventListener('mousedown', (e) => e.preventDefault()); // keep the selection
  sel?.querySelectorAll<HTMLElement>('[data-rw-select-add]').forEach((b) => b.addEventListener('click', () => {
    if (!selection) return;
    const s = selection;
    hideSel();
    window.getSelection()?.removeAllRanges();
    openNote({ kind: b.dataset.rwSelectAdd === 'issue' ? 'issue' : 'comment', section: s.section, quote: s.quote });
  }));

  // ── General comment (Comments overview composer) ──────────────────────────
  const genInput = document.querySelector('[data-rw-general-input]') as any;
  const genSubmit = document.querySelector('[data-rw-general-submit]');
  if (genInput && genSubmit) {
    const picked = wireMentionTypeahead(genInput, document.querySelector('[data-rw-general-menu]'), dir);
    const av = document.querySelector('.rc__composer .avatar');
    if (av) av.textContent = initials(me);
    const post = () => {
      const text = (genInput.value ?? '').trim();
      if (!text) { genInput.focus(); return; }
      const mentioned = [...picked.values()].filter((u) => text.includes(`@${u.name}`));
      store.addComment({ author: me, time: todayLabel(), text, mentions: mentioned.map((u) => u.name) });
      genInput.value = '';
      picked.clear();
      render();
      showToast('Comment posted', mentioned.length ? `Notified ${mentioned.map((u) => u.name).join(', ')} of your mention.` : undefined);
    };
    genSubmit.addEventListener('click', post);
    genInput.addEventListener('keydown', (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); post(); } });
  }

  // ── Decisions ─────────────────────────────────────────────────────────────
  const action = (name: string, fn: () => void) =>
    root.querySelector(`[data-rw-action="${name}"]`)?.addEventListener('click', fn);

  action('start', () => {
    if (!canStart()) return;
    try { localStorage.setItem(startedKey, JSON.stringify({ by: me, at: todayLabel() })); } catch {}
    setStatus('Under review');
    showToast('Review started', 'Mark issues for the researcher or comment for reviewers, then decide.');
  });

  // Return to researcher — sends the draft issues.
  const returnModal = root.querySelector('[data-rw-return-modal]') as any;
  const returnMsg = root.querySelector('[data-rw-return-message]') as any;
  action('return', () => {
    const issues = draftIssues();
    const list = root.querySelector<HTMLElement>('[data-rw-return-issues]')!;
    list.replaceChildren();
    RECORD_SECTIONS.forEach((s) => {
      const mine = issues.filter((i) => i.section === s.slug);
      if (!mine.length) return;
      const g = el('div', { class: 'rw-return-group' });
      g.append(el('h3', { class: 't-heading-compact-01' }, s.title));
      const ol = el('ol');
      mine.forEach((i) => {
        const li = el('li');
        if (i.quote) li.append(el('p', { class: 'rw-note__quote t-body-01' }, i.quote));
        li.append(el('p', { class: 't-body-01' }, i.text));
        ol.append(li);
      });
      g.append(ol);
      list.append(g);
    });
    (root.querySelector('[data-rw-return-none]') as HTMLElement).style.display = issues.length ? 'none' : '';
    returnMsg.label = issues.length ? 'Message to the researcher (optional)' : 'Message to the researcher';
    returnMsg.value = '';
    returnMsg.invalid = false;
    returnMsg.invalidText = 'Add a message, or mark at least one issue.';
    returnModal.open = true;
  });
  root.querySelector('[data-rw-return-confirm]')?.addEventListener('click', () => {
    const issues = draftIssues();
    const message = (returnMsg.value ?? '').trim();
    if (!issues.length && !message) { returnMsg.invalid = true; returnMsg.focus?.(); return; }
    const at = todayLabel();
    store.saveIssues(store.issues().map((i) => (i.sentAt ? i : { ...i, sentAt: at })));
    store.setReturned({ by: me, at, message, issueIds: issues.map((i) => i.id) });
    returnModal.open = false;
    setStatus('Changes requested');
    sendEmail('EM-D', emailVars());
    showToast('Returned to researcher', `${plural(issues.length, 'issue')} sent. They'll be emailed now.`);
    window.scrollTo({ top: 0 });
  });

  // Approve — continues to the permit-letter step (conditions + letter + send).
  const approveModal = root.querySelector('[data-rw-approve-modal]') as any;
  action('approve', () => {
    const drafts = draftIssues().length;
    const warn = root.querySelector('[data-rw-approve-drafts]') as HTMLElement;
    warn.style.display = drafts ? '' : 'none';
    warn.setAttribute('subtitle', `Approving doesn't send your ${plural(drafts, 'issue')} to the researcher. To ask for changes, return the application instead.`);
    approveModal.open = true;
  });
  root.querySelector('[data-rw-approve-confirm]')?.addEventListener('click', () => {
    approveModal.open = false;
    if (root.dataset.letterUrl) window.location.href = root.dataset.letterUrl;
  });

  // Reject — a reason is required; it goes to the researcher.
  const rejectModal = root.querySelector('[data-rw-reject-modal]') as any;
  const rejectReason = root.querySelector('[data-rw-reject-reason]') as any;
  action('reject', () => {
    rejectReason.value = '';
    rejectReason.invalid = false;
    rejectModal.open = true;
  });
  root.querySelector('[data-rw-reject-confirm]')?.addEventListener('click', () => {
    const reason = (rejectReason.value ?? '').trim();
    if (!reason) { rejectReason.invalid = true; rejectReason.focus?.(); return; }
    store.setRejected({ by: me, at: todayLabel(), reason });
    rejectModal.open = false;
    setStatus('Rejected');
    sendEmail('EM-E', emailVars());
    showToast('Application rejected', 'The researcher has been notified.');
    window.scrollTo({ top: 0 });
  });

  render();
}
