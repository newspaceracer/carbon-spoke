#!/usr/bin/env node
// Carbon-First Guard (PreToolUse: Write|Edit|MultiEdit).
//
// BLOCKS bespoke UI primitives in a Carbon spoke: exit 2 + reason on stderr
// denies the tool call BEFORE the write lands. The discipline: reach for a
// stock cds-* Carbon web component instead of hand-rolling a control that
// Carbon already ships.
//
// Escape hatch: a `carbon-checked: <reason>` comment in the content (or already
// in the target file) proves you walked the catalog and nothing fit.
//
// Enforces ONLY in a repo whose package.json depends on @carbon/web-components
// (see classifyDir in lib.mjs); inert everywhere else.
import { existsSync, readFileSync } from 'node:fs';
import { classifyDir, nearestExistingDir, proposedContent, readPayload, targetPath } from './lib.mjs';

const payload = readPayload();
if (!payload) process.exit(0); // unparseable payload — fail open

const file = targetPath(payload);
if (!file) process.exit(0);

// --- Gate (b): file extension ---
// .astro/.css/.scss  -> full check. .js/.ts/.tsx -> MARKUP checks only (UI built
// at runtime via innerHTML / template literals bypasses the design system just
// as hard, but a CSS-selector match there is usually a querySelector arg).
const isMarkup = /\.(astro|css|scss)$/i.test(file);
const isScript = /\.(js|mjs|cjs|ts|tsx)$/i.test(file);
if (!isMarkup && !isScript) process.exit(0);

// --- Gate (a): only enforce inside a Carbon spoke ---
if (classifyDir(nearestExistingDir(file)) !== 'carbon-spoke') process.exit(0);

const content = proposedContent(payload.tool_input ?? {});
if (!content) process.exit(0);

// Scripts are only interesting if they actually BUILD markup.
if (isScript && !/<\/?[a-z][a-z0-9-]*(\s|>|\/)/i.test(content)) process.exit(0);

// --- Escape hatch: author asserted they walked the Carbon catalog ---
if (/carbon-checked:/i.test(content)) process.exit(0);
try {
  if (existsSync(file) && /carbon-checked:/i.test(readFileSync(file, 'utf8'))) process.exit(0);
} catch {
  /* unreadable existing file — fall through to the checks */
}

const violations = [];

// --- Raw styled form controls (not cds-*) ---
if (/<input(\s|>|\/)/i.test(content)) {
  violations.push('raw <input> -> use cds-text-input (or cds-checkbox / cds-radio-button / cds-search / cds-number-input / cds-file-uploader as appropriate)');
}
if (/<select(\s|>)/i.test(content)) {
  violations.push('raw <select> -> use cds-dropdown (or cds-select / cds-multi-select / cds-combo-box)');
}
if (/<textarea(\s|>)/i.test(content)) {
  violations.push('raw <textarea> -> use cds-textarea');
}
// <button class="..."> is a styled button; plain <button> with no class is allowed.
if (/<button[^>]*\sclass=/i.test(content)) {
  violations.push('styled <button class=...> -> use cds-button (text/CTA) or cds-icon-button (icon-only)');
}

// --- Hand-rolled component CSS: selectors/markup implying a cds- primitive ---
const PRIM =
  '(modal|dialog|tearsheet|side-?panel|drawer|dropzone|drop-zone|file-?(row|item|list|upload|uploader)|tooltip|popover|breadcrumb|accordion|pagination|tabs?|toast|notification|snackbar|inline-?notification|loading|spinner|skeleton|progress-?(bar|indicator)|structured-?list|overflow-?menu)';
const primSelector = new RegExp(`\\.[a-z0-9_-]*${PRIM}[a-z0-9_:-]*\\s*[,{]`, 'i');
const primClassAttr = new RegExp(`class="[^"]*${PRIM}`, 'i');
if (isMarkup && primSelector.test(content)) {
  const hit = content.match(new RegExp(`\\.[a-z0-9_-]*${PRIM}[a-z0-9_:-]*`, 'i'))?.[0] ?? '';
  violations.push(`hand-rolled component CSS '${hit}' -> compose the matching cds-* component (cds-modal / cds-tearsheet / cds-side-panel / cds-file-uploader / cds-tooltip / cds-popover / cds-breadcrumb / cds-accordion / cds-pagination / cds-tabs / cds-notification / cds-loading / cds-progress-bar / cds-structured-list / cds-overflow-menu)`);
}
if (primClassAttr.test(content)) {
  const hit = content.match(new RegExp(`class="[^"]*${PRIM}[^"]*"`, 'i'))?.[0] ?? '';
  violations.push(`bespoke markup ${hit} -> use the matching cds-* component instead of styling a primitive`);
}

// --- card / tile / badge / tag / chip primitives (class tokens only) ---
// The primitive token must be the SUFFIX of a class name so legit compound
// roles (e.g. a --tile-* token) don't false-positive.
const CHIP = '([a-z]+-tile|[a-z]+-card|[a-z]+-badge|[a-z]+-tag|[a-z]+-chip|[a-z]+-pill)';
if (
  (isMarkup && new RegExp(`\\.[a-z0-9_-]*${CHIP}\\s*[,{]`, 'i').test(content)) ||
  new RegExp(`class="[^"]*\\b[a-z0-9-]*${CHIP}(?![\\w-])`, 'i').test(content)
) {
  violations.push('bespoke card/tile/badge/tag/chip -> use cds-tile / cds-tag / cds-badge-indicator');
}

// --- Verdict ---
if (violations.length) {
  const runtimeNote = isScript
    ? [
        '',
        'This is a SCRIPT building markup at runtime (innerHTML / template literal / DOM string).',
        'That does NOT exempt you: Carbon web components are real custom elements. Import the',
        "module once, then the tag works in ANY HTML string, in any stack:",
        '',
        "      import '@carbon/web-components/es/components/modal/index.js';",
        '      panel.innerHTML = `<cds-modal open>',
        '                           <cds-text-input label="Name"></cds-text-input>',
        '                         </cds-modal>`;',
      ]
    : [];
  console.error(
    [
      'BLOCKED by carbon-first: this content reinvents a UI primitive that a stock cds-* Carbon web component already provides.',
      '',
      'Detected:',
      ...violations.map((v) => `  - ${v}`),
      ...runtimeNote,
      '',
      'Do this instead:',
      '  1. Find the Carbon component -> ls node_modules/@carbon/web-components/es/components/',
      '     (docs: https://carbondesignsystem.com/components/overview/)',
      '  2. Register it -> add its line to src/carbon.ts, then use the <cds-*> tag.',
      '  3. Reskin via TOKENS, not new CSS -> override --cds-* in src/styles/theme.css.',
      '',
      'To proceed anyway, add a justification comment to the content:',
      '  <!-- carbon-checked: no cds- component fits because Y; <name> is the reusable home -->',
      '  (CSS file: /* carbon-checked: ... */)',
      '',
      'Skill: carbon-first (.claude/skills/carbon-first/SKILL.md)',
    ].join('\n'),
  );
  process.exit(2);
}

process.exit(0);
