// Shared @-mention behavior for the reviewer comment thread. Used by BOTH the
// permit detail page (Overview → Comments) and the review wizard (final-letter),
// so the two composers stay functionally identical: a "@" typeahead over the
// STOCK cds-textarea, and @Name tokens rendered in the thread. Keep the single
// conversation (same permit-comments-${id} storage key) reading the same way in
// both places — don't fork this logic back into either page.

export interface MentionUser {
  id: string;
  name: string;
  detail: string;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Render comment text with @Name mentions as <span class="mention"> tokens —
// DOM-built (never innerHTML'd), so the user's text can't inject markup.
export function renderMentionText(text: string, names: string[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  const valid = names.filter(Boolean);
  if (!valid.length) {
    frag.appendChild(document.createTextNode(text));
    return frag;
  }
  const re = new RegExp(
    '@(' + valid.slice().sort((a, b) => b.length - a.length).map(escapeRe).join('|') + ')',
    'g',
  );
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    const span = document.createElement('span');
    span.className = 'mention';
    span.textContent = '@' + m[1];
    frag.appendChild(span);
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  return frag;
}

// Wire a "@" typeahead over a stock cds-textarea, drawing suggestions from
// `mentionDir` into `menu`. carbon-checked: it composes over the STOCK
// cds-textarea by reading that component's OWN inner shadow textarea — no raw
// control is authored; the field is cds-*. Returns the `picked` map of users
// inserted via the menu; the caller reads it at post time to record only the
// @Name mentions that actually survive in the posted text.
export function wireMentionTypeahead(
  commentInput: any,
  menu: HTMLElement | null,
  mentionDir: MentionUser[],
): Map<string, MentionUser> {
  const picked = new Map<string, MentionUser>();
  if (!commentInput || !menu) return picked;
  customElements.whenDefined('cds-textarea').then(async () => {
    await (commentInput.updateComplete ?? Promise.resolve());
    const ta = commentInput.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement | null;
    if (!ta) return;
    let items: MentionUser[] = [];
    let active = -1;
    // The in-progress "@token" ending at the caret: from the last "@" starting a
    // word (not an email's a@b), no newline, not closed by a trailing space.
    const queryAtCaret = () => {
      const caret = ta.selectionStart ?? ta.value.length;
      const upto = ta.value.slice(0, caret);
      const at = upto.lastIndexOf('@');
      if (at === -1) return null;
      if (at !== 0 && !/\s/.test(upto[at - 1])) return null;
      const q = upto.slice(at + 1);
      if (/\n/.test(q) || /\s$/.test(q) || q.length > 30) return null;
      return { at, caret, q };
    };
    const hideMenu = () => { menu.hidden = true; menu.innerHTML = ''; active = -1; };
    const paintActive = () =>
      Array.from(menu.children).forEach((li, i) => (li as HTMLElement).classList.toggle('is-active', i === active));
    const renderMenu = (matches: MentionUser[]) => {
      items = matches;
      menu.innerHTML = '';
      matches.forEach((u, i) => {
        const li = document.createElement('li');
        li.className = 'mention-menu__item';
        li.setAttribute('role', 'option');
        li.dataset.idx = String(i);
        const n = document.createElement('span');
        n.className = 'mention-menu__name';
        n.textContent = u.name;
        const d = document.createElement('span');
        d.className = 'mention-menu__detail';
        d.textContent = u.detail;
        li.append(n, d);
        menu.appendChild(li);
      });
      active = matches.length ? 0 : -1;
      paintActive();
      menu.hidden = matches.length === 0;
    };
    const refresh = () => {
      const ctx = queryAtCaret();
      if (!ctx) { hideMenu(); return; }
      const q = ctx.q.toLowerCase();
      renderMenu(mentionDir.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 6));
    };
    const choose = (u: MentionUser) => {
      const ctx = queryAtCaret();
      if (!ctx) return;
      const before = ta.value.slice(0, ctx.at);
      const after = ta.value.slice(ctx.caret);
      const insert = `@${u.name} `;
      ta.value = before + insert + after;
      const pos = (before + insert).length;
      ta.setSelectionRange(pos, pos);
      commentInput.value = ta.value;
      picked.set(u.name, u);
      hideMenu();
      ta.focus();
    };
    ta.addEventListener('input', refresh);
    ta.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes((e as KeyboardEvent).key)) refresh();
    });
    ta.addEventListener('keydown', (e) => {
      const k = (e as KeyboardEvent).key;
      if (menu.hidden) return;
      if (k === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); paintActive(); }
      else if (k === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); paintActive(); }
      else if (k === 'Enter' && active >= 0) { e.preventDefault(); choose(items[active]); }
      else if (k === 'Escape') { e.preventDefault(); hideMenu(); }
    });
    // mousedown (not click) so the pick beats the textarea blur.
    menu.addEventListener('mousedown', (e) => {
      const li = (e.target as HTMLElement).closest('.mention-menu__item') as HTMLElement | null;
      if (!li) return;
      e.preventDefault();
      const u = items[Number(li.dataset.idx)];
      if (u) choose(u);
    });
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.mention-field')) hideMenu();
    });
  });
  return picked;
}
