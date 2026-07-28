# Add-Control Consistency — Jira Stories

From the UI consistency audit (item C): the app added items three different ways.
This resolves the mismatch and fixes the one collection managed in two places.

- **Story 1** — Standardize how items are added, and manage the analysis team in one place
- **Story 2** — Split the Add condition modal into catalog and manual paths

---

## Story 1 — Standardize how items are added, and manage the analysis team in one place

**Story Title**
Standardize add controls and manage the analysis team in one place

---

**Description**

As a CA State Parks Staff user,
I want adding an item to work the same way for the same kind of task, and each
collection to be managed in a single place,
So that the interface is predictable and I'm never adding to the same list two
different ways in two different spots.

Today the three add mechanisms actually map to three task types — the split is
mostly principled — but the analysis (review) team was the exception: it was
added via an inline combo + a trailing "Add" button (backwards from the app's
click-Add-then-do order, and the trailing button is easy to miss), and it was
editable in *two* places at once (the permit Overview and the header's "Analysis
review" modal).

**Roles affected:** Technical Reviewer, System Admin (analysis-team management);
Researcher, Principal Investigator (PI) (application-wizard add controls).

**Out of scope:** Button size/kind and label wording — see
`stories-button-and-label-consistency.md`. The remove control and its confirmation
— see `stories-remove-affordance-consistency.md`.

---

**Acceptance Criteria**

**UI & field details — the add-control rule**
- Authoring a new multi-field record that doesn't exist yet (a participant, a
  specimen, a district member, a catalog condition, a category tag, a user
  invitation) uses a modal form.
- Attaching existing items in a low-stakes, bulk way that needs no confirmation
  (permit tags, study-area parks) uses a filterable multi-select that applies each
  item on selection.
- Attaching an existing item into a managed roster that needs a deliberate pick
  then confirm (the analysis team) uses a button-first modal on the base page: an
  "Add …" button opens a modal, the user picks, and the modal's own primary button
  commits. No inline combo with a separate trailing "Add" button.

**Happy path — add to the analysis team**
- On the permit Overview, the "Analysis team" section has an "Add to team" action
  in its header.
- Selecting "Add to team" opens a modal titled "Add to team" with a "Reviewer"
  picker listing only directory users not already on the team.
- The modal's footer is "Cancel" and a primary "Add to team"; "Add to team" adds
  the selected user to the roster and closes the modal, "Cancel" closes it with no
  change.

**State & status transitions**
- A user added to the analysis team appears on the roster as pending review and
  persists (prototype: to the shared per-permit team store).

**Edge cases & constraints — one management surface**
- The analysis team is added and removed only on the permit Overview. The header's
  "Analysis review" modal is view-only: it displays the roster and review progress
  but has no add or remove control (managing it there would stack a modal on the
  already-open modal).
- The view-only modal reflects the roster as managed on the Overview (prototype:
  it reads the same shared team store on open).

---

**Testing notes**

- **Test 1 — Add to team (base page modal):** On the permit Overview, choose "Add
  to team", pick a user, confirm with "Add to team"; verify the roster gains the
  user and the modal closes. Reopen and confirm that user no longer appears in the
  picker.
- **Test 2 — View-only header modal:** Open the header "Analysis review" modal;
  confirm it shows the roster + progress with no add or remove control, and that a
  user added on the Overview appears there.
- **Test 3 — No stacked modal:** Confirm no confirmation or picker modal ever opens
  on top of the "Analysis review" modal.

---

**Open questions**
- [ ] Should the two multi-select "attach existing" surfaces (permit tags,
  study-area parks) and the analysis-team "attach into a roster" surface ever be
  unified onto one control, or is the task-based split (bulk apply-on-select vs.
  deliberate pick-then-confirm) the intended, permanent rule?
- [ ] The permit Overview roster allows removing a reviewer immediately; should
  removing a reviewer who has already started or completed their analysis be
  blocked or confirmed?

---

## Story 2 — Split the Add condition modal into catalog and manual paths

**Story Title**
Split the Add condition modal into catalog and manual paths

---

**Description**

As a technical reviewer adding a special condition to a permit,
I want to choose up front whether I'm pulling a saved condition from the catalog
or writing a new one,
So that I follow one clear path at a time instead of scanning a modal that stacks
both inputs together.

Today the Add condition modal shows both paths at once — a catalog multi-select, an
"or write a new one" divider, and the rich-text editor stacked below it. This
replaces that with a content switcher at the top of the modal (**From catalog** /
**Write manually**), showing only the chosen path's fields — the same pattern the
Add member modal already uses. This is a UI-consistency change; the conditions that
get saved and the permissions around them are unchanged.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer — whoever holds the Responsible
Agent or Supporting Agent permit-role that can edit conditions. Researchers are
unaffected (they never open this modal).

**Out of scope:** Who may add conditions and when (the existing permit-role and
approved/frozen gates are unchanged). The catalog console at `/special-conditions` —
its Add condition modal is single-path (it *is* the catalog) and stays as-is.

---

**Acceptance Criteria**

**Access & permissions**
- The modal opens on the same surfaces and under the same gates as today: the
  permit's Special conditions tab (`permit.astro`) and the final-letter conditions
  step (`final-letter.astro`). No new users gain access.

**Happy path — add**
- On **Add condition**, the modal body shows a content switcher with two items,
  **From catalog** (selected by default) and **Write manually**, above the input area.
- With **From catalog** selected, only the "Saved conditions" multi-select is shown;
  the rich-text editor and the "Also save to the catalog for reuse" checkbox are hidden.
- With **Write manually** selected, only the rich-text editor and the "Also save to
  the catalog for reuse" checkbox are shown; the catalog multi-select is hidden.
- Switching between the two clears any pending validation warning.
- **Save condition** commits only the active path: catalog picks when on **From
  catalog**, or the typed condition (with optional save-to-catalog) when on **Write
  manually** — never both in one save.

**State & status transitions**
- A condition added from the catalog is stored as source `inventory`; a typed
  condition is stored as source `custom`. Behavior is identical to today for each path.
- With **Write manually** and "Also save to the catalog for reuse" checked, the typed
  condition is also written to the acting owner's catalog (HQ or district), as today.

**Edit path**
- On **Edit condition**, the switcher, the catalog multi-select, and the
  save-to-catalog checkbox are hidden; only the rich-text editor is shown, pre-filled
  with the condition's current text. (Editing changes text only — the catalog path
  never applies when editing.)

**UI & field details**
- Switcher items read exactly **From catalog** and **Write manually**.
- The catalog field label reads **Saved conditions**.
- The removed **or write a new one** divider text no longer appears.
- The inline warning subtitle is context-aware: on **From catalog** it reads "Select
  at least one saved condition, or switch to Write manually."; on **Write manually**
  it reads "Write the condition text before adding it."

**Edge cases & constraints**
- Attempting **Save condition** with nothing entered in the active path keeps the
  modal open and shows the mode-appropriate warning; it does not save an empty condition.
- Only conditions not already applied to the permit appear in the catalog multi-select
  (unchanged).
- The two modals (`sc-condition-modal` in `permit.astro`, `cond-modal` in
  `final-letter.astro`) behave identically after this change.

---

**Testing notes**

- **Test 1 — Catalog path:** Open Add condition, leave **From catalog** selected, pick
  one or more saved conditions, Save. Confirm they attach with source `inventory` and
  the manual field never appeared.
- **Test 2 — Manual path + save to catalog:** Switch to **Write manually**, type a
  condition, check "Also save to the catalog for reuse", Save. Confirm the condition
  attaches (source `custom`) and also appears in that owner's catalog on a fresh Add.
- **Test 3 — Empty-save warning:** On each path, Save with nothing entered. Confirm the
  modal stays open with the correct mode-specific warning, then switching paths clears it.
- **Test 4 — Edit:** Edit an existing condition. Confirm only the text editor shows (no
  switcher, no catalog, no save-to-catalog checkbox) and the text saves in place.
- **Test 5 — Parity:** Repeat Tests 1–4 on both the permit Special conditions tab and
  the final-letter conditions step.

---

**Open questions**
- [ ] Should the switcher remember the last-used path across opens within a session,
  or always reset to **From catalog** (current behavior resets)?
- [ ] No notifications, status changes, or document generation are involved in this
  story — confirm none are expected.
