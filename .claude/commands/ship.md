Review this Carbon spoke's work and get it committed cleanly. Written for
everyone, including non-coders: narrate each step in one plain line, never skip
the sync step (two people committing without syncing clobber each other).

$ARGUMENTS

## Guard

`package.json` here must depend on `@carbon/web-components`. If not, stop and say:
"Run /ship inside the carbon-spoke repo — this folder isn't one."

## The sequence (in order, no skipping)

### 1. Sync
`git fetch`, and if this branch is behind, pull (rebase). On conflicts: resolve
only when the fix is obvious (both sides added a new page/file — keep both);
otherwise STOP and explain in plain language whose changes collide.

### 2. Review — the quality gate
**Load the `design-principles` and `carbon-first` skills**, then review the
working diff (`git diff`, plus untracked files). Report findings grouped by
severity. Treat every **"Must"** rule in `design-principles` and the
`carbon-first` lookup as a **Must-fix**; aesthetic "Should" items are warnings.

Fast grep checks to run over changed `.astro`/`.css`/`.ts`, then read what they hit:

- **SCSS vars used at runtime** (renders unstyled): `grep -RnE '\$(spacing|layer|background|text-primary|border-subtle)' src/` → must be `var(--cds-*)`.
- **Internal-class overrides**: `grep -RnE '\.cds--[a-z]' src/**/*.css src/**/*.astro` → never restyle Carbon internals.
- **Hardcoded color outside the theme file**: `grep -RnE '#[0-9a-fA-F]{3,6}|rgb\(' src/ --include=*.astro --include=*.css | grep -v styles/theme.css` → should read a token.
- **Colored Tag as status**: `grep -RnE '<cds-tag[^>]*type="(red|green|magenta)"' src/` → is it classification or state? State → `cds-icon-indicator`/`cds-shape-indicator`.
- **Focus ring removed**: `grep -RnE 'outline:\s*(none|0)' src/`.
- **Google Fonts / non-IBM CDN for Plex**: `grep -RnE 'fonts.googleapis|jsdelivr|unpkg' src/`.
- **Raw form controls that dodged the hook** (e.g. in template strings): `grep -RnE '<(input|select|textarea)\b' src/` → should be `cds-*`.
- **`<cds-row>`** (does not exist): `grep -Rn '<cds-row' src/`.

Then apply judgment the greps can't: accessible names on controls, one grid per
logical group + `sm/md/lg` spans, subtractive polish, mock-data that's invented
and deterministic. Fix the unambiguous Must-fixes; for anything requiring a
decision, list it and ask.

### 3. Build — HARD GATE
`npm run build`. **If it fails, the ship stops.** Explain the failure in one
sentence; fix it if unambiguous and rebuild, otherwise report and stop.

### 4. Save
Commit all work with a clear message (end with the Co-Authored-By trailer if
configured); push to the branch. If there's nothing to commit, say so.

### 5. Report
Summarize what shipped, the review findings (fixed vs. left), and the build
result. **Deployment note:** this repo has no public deploy wired yet (no GitHub
Pages / `deploy` script). If the user wants the prototypes on a public URL, offer
to set up GitHub Pages (an Astro `site`/`base` + a `deploy` script + the Pages
action) as a separate step — do NOT invent a deploy that doesn't exist.
