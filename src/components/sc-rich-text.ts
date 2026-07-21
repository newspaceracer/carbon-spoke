// carbon-checked: Carbon ships NO rich-text / WYSIWYG component (verified against
// `ls node_modules/@carbon/web-components/es/components/` and the Carbon catalog —
// only cds-textarea for multi-line plain text). Special conditions need real
// formatting, so this wraps Tiptap (a real, reusable ProseMirror editor) as a
// custom element — the sanctioned third tier of the lookup order, exactly like
// carbon-ag-grid.ts wraps AG Grid.
//
// The editing engine is Tiptap; the CHROME is Carbon: the menu bar is built from
// real <cds-button kind="ghost" size="sm"> elements, and the active/toggled state
// uses Carbon's own `isSelected` (the cds--btn--selected look) — no bespoke button
// CSS. The writing surface is styled with --cds-* tokens so it follows Carbon's
// theme zones.
//
// <sc-rich-text value="<p>..</p>" placeholder="Write a condition…"></sc-rich-text>
// Exposes a `.value` getter/setter (HTML). Tiptap's schema is the sanitizer:
// getHTML() only emits nodes/marks StarterKit allows.
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

function injectStyleOnce() {
  if (document.getElementById('sc-rich-text-styles')) return;
  const style = document.createElement('style');
  style.id = 'sc-rich-text-styles';
  // Layout + writing-surface styling only (via --cds-* tokens). The toolbar
  // controls are stock cds-button, so they carry Carbon's own look.
  style.textContent = `
    sc-rich-text {
      display: block;
      border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
      background: var(--cds-field-01, #f4f4f4);
    }
    sc-rich-text .sc-rt__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.125rem;
      padding: 0.25rem;
      background: var(--cds-layer-01, #ffffff);
      border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    }
    sc-rich-text .sc-rt__group { display: flex; flex-wrap: wrap; gap: 0.125rem; }
    sc-rich-text .sc-rt__divider {
      width: 1px;
      align-self: stretch;
      margin: 0.25rem 0.25rem;
      background: var(--cds-border-subtle-01, #e0e0e0);
    }
    sc-rich-text .tiptap {
      caret-color: var(--cds-interactive, #0f62fe);
      min-height: 8rem;
      max-height: 22rem;
      overflow-y: auto;
      padding: 0.75rem 1rem;
      outline: none;
      color: var(--cds-text-primary, #161616);
      line-height: 1.5;
    }
    sc-rich-text .tiptap:focus { outline: 2px solid var(--cds-focus, #0f62fe); outline-offset: -2px; }
    sc-rich-text .tiptap :first-child { margin-top: 0; }
    sc-rich-text .tiptap p { margin: 0.5rem 0; }
    sc-rich-text .tiptap ul,
    sc-rich-text .tiptap ol { padding: 0 1rem; margin: 0.75rem 1rem 0.75rem 0.4rem; }
    sc-rich-text .tiptap ul { list-style: disc; }
    sc-rich-text .tiptap ol { list-style: decimal; }
    sc-rich-text .tiptap ul li p,
    sc-rich-text .tiptap ol li p { margin: 0.25em 0; }
    sc-rich-text .tiptap h1,
    sc-rich-text .tiptap h2,
    sc-rich-text .tiptap h3 { line-height: 1.2; margin-top: 1.5rem; font-weight: 600; }
    sc-rich-text .tiptap h1 { font-size: 1.25rem; }
    sc-rich-text .tiptap h2 { font-size: 1.125rem; }
    sc-rich-text .tiptap h3 { font-size: 1rem; }
    sc-rich-text .tiptap a { color: var(--cds-link-primary, #0f62fe); }
    sc-rich-text .tiptap code {
      background-color: var(--cds-layer-accent-01, #e0e0e0);
      border-radius: 0.25rem;
      color: var(--cds-text-primary, #161616);
      font-family: var(--cds-code-01-font-family, 'IBM Plex Mono', monospace);
      font-size: 0.85em;
      padding: 0.1em 0.3em;
    }
    sc-rich-text .tiptap pre {
      background: var(--cds-background-inverse, #393939);
      border-radius: 0.25rem;
      color: var(--cds-text-inverse, #ffffff);
      font-family: var(--cds-code-01-font-family, 'IBM Plex Mono', monospace);
      margin: 1rem 0;
      padding: 0.75rem 1rem;
    }
    sc-rich-text .tiptap pre code { background: none; color: inherit; padding: 0; }
    sc-rich-text .tiptap blockquote {
      border-left: 3px solid var(--cds-border-subtle-01, #e0e0e0);
      margin: 1rem 0;
      padding-left: 1rem;
      color: var(--cds-text-secondary, #525252);
    }
    sc-rich-text .tiptap hr { border: none; border-top: 1px solid var(--cds-border-subtle-01, #e0e0e0); margin: 1.5rem 0; }
    sc-rich-text .tiptap p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: var(--cds-text-placeholder, #a8a8a8);
      float: left;
      height: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

interface ToolButton {
  label: string;
  title?: string;
  isActive?: (e: Editor) => boolean;
  enabled?: (e: Editor) => boolean;
  run: (e: Editor) => void;
  el?: HTMLElement; // a cds-button
}

class ScRichText extends HTMLElement {
  private editor?: Editor;
  private buttons: ToolButton[] = [];

  connectedCallback() {
    if (this.editor) return;
    injectStyleOnce();

    // Menu-bar groups: marks · block types · insert · history.
    const groups: ToolButton[][] = [
      [
        { label: 'Bold', isActive: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
        { label: 'Italic', isActive: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
        { label: 'Strike', isActive: (e) => e.isActive('strike'), run: (e) => e.chain().focus().toggleStrike().run() },
        { label: 'Code', isActive: (e) => e.isActive('code'), run: (e) => e.chain().focus().toggleCode().run() },
      ],
      [
        { label: 'H1', title: 'Heading 1', isActive: (e) => e.isActive('heading', { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: 'H2', title: 'Heading 2', isActive: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: 'H3', title: 'Heading 3', isActive: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
        { label: 'Bulleted list', isActive: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
        { label: 'Numbered list', isActive: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
        { label: 'Quote', title: 'Blockquote', isActive: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
        { label: 'Code block', isActive: (e) => e.isActive('codeBlock'), run: (e) => e.chain().focus().toggleCodeBlock().run() },
      ],
      [
        { label: 'Link', isActive: (e) => e.isActive('link'), run: (e) => this.toggleLink(e) },
      ],
      [
        { label: 'Undo', enabled: (e) => e.can().undo(), run: (e) => e.chain().focus().undo().run() },
        { label: 'Redo', enabled: (e) => e.can().redo(), run: (e) => e.chain().focus().redo().run() },
      ],
    ];

    const toolbar = document.createElement('div');
    toolbar.className = 'sc-rt__toolbar';
    this.buttons = [];
    groups.forEach((group, gi) => {
      if (gi > 0) {
        const divider = document.createElement('span');
        divider.className = 'sc-rt__divider';
        divider.setAttribute('aria-hidden', 'true');
        toolbar.appendChild(divider);
      }
      const wrap = document.createElement('div');
      wrap.className = 'sc-rt__group';
      group.forEach((btn) => {
        // Stock Carbon ghost button — Carbon owns its look, hover, focus, a11y.
        const b = document.createElement('cds-button');
        b.setAttribute('kind', 'ghost');
        b.setAttribute('size', 'sm');
        b.textContent = btn.label;
        b.setAttribute('aria-label', btn.title || btn.label);
        if (btn.title) b.setAttribute('tooltip-text', btn.title);
        // Keep the selection in the editor while the button takes the click
        // (Tiptap also restores it via chain().focus(), so this is belt-and-braces).
        b.addEventListener('mousedown', (e) => e.preventDefault());
        b.addEventListener('click', () => this.editor && btn.run(this.editor));
        btn.el = b;
        this.buttons.push(btn);
        wrap.appendChild(b);
      });
      toolbar.appendChild(wrap);
    });

    const mount = document.createElement('div');
    mount.className = 'sc-rt__editor';

    this.append(toolbar, mount);

    this.editor = new Editor({
      element: mount,
      extensions: [
        StarterKit.configure({
          link: {
            openOnClick: false,
            autolink: true,
            HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
          },
        }),
        Placeholder.configure({ placeholder: this.getAttribute('placeholder') || 'Write a condition…' }),
      ],
      content: this.getAttribute('value') || '',
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label': this.getAttribute('aria-label') || 'Condition text',
        },
      },
      onTransaction: () => this.syncToolbar(),
    });
    this.syncToolbar();
  }

  disconnectedCallback() {
    this.editor?.destroy();
    this.editor = undefined;
  }

  private syncToolbar() {
    if (!this.editor) return;
    const e = this.editor;
    this.buttons.forEach((btn) => {
      const el = btn.el as any;
      if (!el) return;
      // Carbon's native toggled state for a ghost button (cds--btn--selected).
      if (btn.isActive) el.isSelected = btn.isActive(e);
      if (btn.enabled) el.disabled = !btn.enabled(e);
    });
  }

  private toggleLink(editor: Editor) {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('Link URL (https:// or mailto:)');
    if (!url) return;
    if (!/^(https?:|mailto:)/i.test(url.trim())) {
      window.alert('Links must start with https://, http://, or mailto:');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  /** The editor's HTML (empty string when it holds no visible text). */
  get value(): string {
    if (!this.editor) return this.getAttribute('value') || '';
    return this.editor.isEmpty ? '' : this.editor.getHTML();
  }

  set value(html: string) {
    if (!this.editor) {
      this.setAttribute('value', html || '');
      return;
    }
    this.editor.commands.setContent(html || '');
    this.syncToolbar();
  }

  clear() { this.value = ''; }
}

if (!customElements.get('sc-rich-text')) {
  customElements.define('sc-rich-text', ScRichText);
}
