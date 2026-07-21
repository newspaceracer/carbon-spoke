Build a new prototype screen (or flow) in this Carbon spoke, composed from stock
`cds-*` Carbon web components. This command is for EVERYONE — including teammates
who don't code. Speak plain language: no jargon, explain what you're doing in one
line as you go.

$ARGUMENTS

## Guard: run in a Carbon spoke

Check `package.json` in the current directory: it must list
`@carbon/web-components`. If not, STOP and say: "Run /new-prototype inside the
carbon-spoke repo — this folder isn't one."

## 1. Interview — understand the screen before building

Ask (skip anything `$ARGUMENTS` already answers; one round, not an interrogation):

1. **Who looks at this?** (client name/role, internal team, public demo)
2. **What's the scenario?** The one-sentence story of what the person is trying
   to do. ("An analyst triages incoming platform issues.")
3. **What's on it?** Rough contents: a list/table? a form? filters? a detail
   panel? a modal flow? If they have a sketch/screenshot/Figma, ask for it.
4. **What realistic content should it show?** If they don't know, propose
   invented-but-credible content and confirm. Never copy real client data.

Play back a 3–5 bullet summary and confirm before building.

## 2. Manifest first — outline the page as components (BEFORE any code)

**Load the `carbon-first` skill now.** The first artifact is NOT code — it's a
**manifest**: the page's spine plus each section resolved to a component.

1. Pick the page **spine** — the layout wrapper (a container + `cds-stack`, or
   Carbon grid `cds-grid`/`cds-column`).
2. List the page's **sections** in order (header, filters, table, detail…).
3. **Resolve each section**, stopping at the first hit:
   - **a single stock `cds-*` component** covers it (`cds-table`, `cds-modal`,
     `cds-file-uploader`, …), else
   - **a small `src/components/*` component composing cds-\* legos**, else
   - a documented bespoke wrapper (rare — the catalog is large; check it first:
     `ls node_modules/@carbon/web-components/es/components/`).

Write the manifest as the page's opening comment and confirm it:

```
<!-- manifest:
  spine: container > cds-stack(gap 7)
  sections:
    - page header  -> inline (heading + lede)
    - action row   -> cds-button x3
    - filters      -> issue-filters.astro  (composes cds-dropdown + cds-search)
    - table        -> cds-table
    - detail modal -> cds-modal
-->
```

## 3. Build from the manifest

- Build any NEW `src/components/*` section components first, then assemble the
  page that references them on the spine.
- **Register every new cds-\* component** you use by adding its import line to
  `src/carbon.ts`.
- **Reskin via tokens** (`src/styles/theme.css`), never bespoke component CSS.
- Page-level layout CSS (container width, gaps) is fine in the page; **component
  styling is not** — that's what the `cds-*` legos and `--cds-*` tokens are for.
- Mock data: invented, deterministic, domain-credible. Put it in `src/data/`
  modules or the page frontmatter, not copied from client documents.
- Create the page under `src/pages/<slug>.astro` (or `src/pages/prototypes/`).

## 4. Show it

- Start the dev server if not running (`npm run dev`) and give the local URL.
- Invite iteration in plain language ("tell me what to change — wording, layout,
  what's missing").
- One consolidated `npm run build` at the end verifies everything compiles.
