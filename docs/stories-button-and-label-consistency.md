# Button Sizing & Action-Label Consistency — Jira Stories

Two stories from the UI consistency audit:

- **Story 1** — Standardize button sizing across the app
- **Story 2** — Align add/edit action labels and wording

Both are cross-cutting UI-consistency work with no change to business logic,
permissions, or statuses.

---

## Story 1 — Standardize button sizing across the app

**Story Title**
Standardize button sizing to one explicit scale across the app

---

**Description**

As a CA State Parks Staff user,
I want buttons to be the same size for the same kind of action on every screen,
So that the interface reads as one system and no screen looks heavier or lighter
than its peers by accident.

Carbon's `cds-button` defaults to its large size when no size is set, so screens
that omitted the attribute silently rendered large buttons while others used
small — and three screens mixed sizes within themselves. This story sets one
explicit scale everywhere.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher, Principal
Investigator (PI) — every screen with buttons.

**Out of scope:** Add/edit label and wording alignment — Story 2 below. Which
form controls appear on a screen; this story only governs button *size*.

---

**Acceptance Criteria**

**UI & field details — the size scale**
- Every `cds-button` sets its size explicitly; none relies on the default.
- A page-level form submit or primary call-to-action uses the large size.
- A section-header, card-header, rail, or standalone labeled action uses the
  medium size.
- An action button **inside a data-table / DataGrid row cell** (Edit, Approve,
  Deny, replace, and a contained-list item's per-row action cluster) uses the
  **small** size — dense per-row actions read compact, not medium.
- Icon-only controls (a row's remove/overflow icon button) and dense editor
  toolbars (the rich-text formatting bar) keep the small size.
- Within a single action cluster all buttons share one size (all small in a table
  row, all medium in a header) — never a mix; a labeled button beside a row icon
  button matches it at small.

**UI & field details — button kind by position**
- Section-header action buttons use the tertiary (outline) kind — so "Add …" and
  "Edit" actions in a section aside share one outlined affordance.
- Table / grid row-cell action buttons use the ghost kind (and danger-ghost for
  the destructive one, e.g. Deny, Revoke) — low-emphasis in the row. No row action
  is primary or tertiary, including the affirmative one (Approve is ghost beside a
  danger-ghost Deny). The regulated-forms "Replace" action moves from tertiary to
  ghost to match.
- A grid's own toolbar chrome (column manager, Reset) is not a row action and
  keeps its section-level treatment.
- A per-card action inside a compact card (for example Edit on an Email
  notification card) is an icon button (ghost, with a tooltip naming the target),
  not a text or outline button — a full labeled button is too heavy for card
  chrome.

**Edge cases & constraints**
- Screens that previously mixed sizes within one page are reconciled: the profile
  page (form footer versus its section actions), the final-letter builder (wizard
  versus comments-drawer versus add-condition), and the district detail page's
  lone action.
- The two "add a person to the analysis team" buttons, previously one size larger
  than every other add button, now match the medium scale.

---

**Testing notes**

- **Test 1 — No default sizes:** Confirm no `cds-button` in the codebase omits
  its size attribute (all are explicit).
- **Test 2 — Mixed-page reconciliation:** On the profile, final-letter, and
  district pages, confirm every labeled button matches the scale (large for a page
  submit/primary, medium otherwise) with no stray small or oversized button.
- **Test 3 — Compact controls preserved:** Confirm row remove/overflow icon
  buttons and the rich-text toolbar remain small (table rows and the editor did
  not grow taller).

---

**Open questions**
- [ ] Should the primary workflow actions in the permit header (for example the
  status-advancing action) be promoted to the large size as page-primary CTAs, or
  remain medium like other section actions?

---

## Story 2 — Align add/edit action labels and wording

**Story Title**
Align add and edit action labels and modal wording

---

**Description**

As a CA State Parks Staff user,
I want the same action to be worded the same way everywhere — the button that
opens an editor, the modal that adds an item, and the confirm button inside it,
So that the interface is predictable and doesn't appear to offer different
actions for the same task.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher, Principal
Investigator (PI).

**Out of scope:** Button sizing — Story 1 above. The specimen "Size" versus
"Portion" field-name question is a data-model question, flagged as an open
question below rather than changed here.

---

**Acceptance Criteria**

**UI & field details — edit action**
- The control that opens an item for editing is labeled "Edit" everywhere. The
  Users console row action previously labeled "Manage" is relabeled "Edit" (and
  its section hint updated to match).

**UI & field details — add / edit modal wording**
- An add modal's trigger button, heading, and confirm button use the same verb and
  noun: "Add participant" opens a modal headed "Add participant" with an "Add
  participant" confirm; "Add specimen" opens a modal headed "Add specimen" with an
  "Add specimen" confirm.
- Add-modal headings drop the article: "Add a participant" and "Add a specimen
  type" become "Add participant" and "Add specimen".
- The condition modal's primary action reads as the verb it performs — "Add
  condition" when adding a new condition, "Save changes" when editing an existing
  one — replacing the static "Save condition" on both the permit's Special
  conditions tab and the Special conditions console.

**Edge cases & constraints**
- Batch-add modals (participant, specimen) keep their existing "Done" secondary
  action and open-and-clear behavior — only the primary verb wording is governed
  here.

---

**Testing notes**

- **Test 1 — Edit label:** In the Users console, confirm the per-row edit action
  reads "Edit" and its section hint references "Edit".
- **Test 2 — Add wording:** Open the participant and specimen add modals; confirm
  the trigger, heading, and confirm button all read "Add participant" / "Add
  specimen" with no stray article.
- **Test 3 — Condition verb swap:** Open the condition modal to add (confirm reads
  "Add condition") and to edit an existing condition (confirm reads "Save
  changes"), on both the permit tab and the console.

---

**Open questions**
- [ ] The application wizard captures a specimen "Size" field (physical
  measurement, e.g. "4–8 cm shell length"), while the permit detail, finalize, and
  final-letter views show a separate "Portion" field. Are these the same attribute
  (unify to one name and one data field) or genuinely distinct (keep both)? Left
  unchanged pending this answer.
- [ ] Is "specimen" or "specimen type" the canonical NRD term for the added item —
  the heading now says "Add specimen"; confirm this matches product copy.
