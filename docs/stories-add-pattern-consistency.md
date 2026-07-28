# Add-Control Consistency — Jira Stories

From the UI consistency audit (item C): the app added items three different ways.
This resolves the mismatch and fixes the one collection managed in two places.

- **Story 1** — Standardize how items are added, and manage the analysis team in one place

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
