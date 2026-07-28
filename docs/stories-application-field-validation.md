# Application field marking & validation — user stories

These are sibling stories for how the permit application form tells a Researcher
which fields are required and flags the missing ones. **Story 1** makes every
field carry its own required/optional marker (the at-rest signal). **Story 2**
flags missing required fields — but only at the point the Researcher tries to
move into the review step, which is the effective submit action.

Scope note: both stories apply to a **Researcher** (or any role) editing an
**Application** in **Draft**. Once the record is **Submitted**, **In Review**,
**Back to Researcher**, **Resubmitted**, or an **Active Permit**, the multi-page
form is not being edited, so neither behavior applies.

---

## Story 1 — Mark every application field required or optional

**Story Title**
Mark every application field required or optional in its label

---

**Description**

As a Researcher completing an Application in Draft,
I want each field labeled with whether it is required or optional,
So that I know what is expected of me as I fill the form, without guessing or
discovering it only when I try to submit.

Every field carries its own call-out rather than relying on a single global "all
fields are required unless marked optional" note, so nothing is ambiguous. The
marker is the at-rest signal; the error treatment for a missing required field is
a separate concern (Story 2).

**Roles affected:** Researcher (the role editing the Application in Draft).

**Out of scope:** Flagging or erroring on empty required fields — see Story 2.
Reviewer-side or admin-side forms. Changes to which fields are required — this
story marks the existing required-ness, it does not change it.

---

**Acceptance Criteria**

**UI & field details**
- Every field in the Application carries an explicit "(required)" or "(optional)"
  marker appended to its label.
- Markers render in secondary text color — never error red (red is reserved for
  a genuine error state).
- Yes/no gate questions carry "(required)" on the question text.
- Conditionally revealed fields carry their markers when they are shown.
- Address subfields are marked by their true per-country required-ness — e.g. for
  a United States address, "Street address (required)" and "Suite / unit
  (optional)".
- The application-wide guidance reads "Every field is marked required or
  optional."

**Edge cases & constraints**
- Each field's marker appears exactly once — a field label never shows a doubled
  marker (e.g. "(optional) (optional)").
- Fields that are optional per the application's model — the whole Additional
  participants section (though a name and email are required per person once one
  is added), the project schedule, GIS files, supporting-documentation uploads,
  budget, literature cited, the study proposal, and address line 2 — are marked
  "(optional)"; everything else is marked "(required)".

---

**Open questions**
- [ ] For a yes/no gate answered "No" that hides its follow-up fields, should the
  hidden fields' markers be considered at all, or only when the branch is shown?
- [ ] Should the "(required)" marker be exposed to assistive technology as part of
  the field's accessible name, or is the visible text sufficient?

---

## Story 2 — Flag missing required fields when moving to review

**Story Title**
Flag missing required fields when a Researcher tries to reach review

---

**Description**

As a Researcher completing an Application in Draft,
I want the incomplete pages and the specific empty required fields called out when
I try to continue to the review step,
So that I can see exactly what is blocking submission — without being interrupted
by errors while I am still filling the form.

Field-level errors are deliberately withheld during ordinary navigation and
surface only when the Researcher attempts to cross into the **Application summary**
(review) step, which is the point of intent to submit. At that point an empty
required field genuinely blocks the goal, so it uses the standard error (red)
treatment — the same as input that is actually invalid.

**Roles affected:** Researcher (the role editing the Application in Draft).

**Out of scope:** The per-field required/optional markers — see Story 1. The final
submit certification gate itself, which is unchanged. Reviewer-side validation.

---

**Acceptance Criteria**

**Happy path**
- The Researcher can move between form pages using "Save and continue", the Back
  action, or the page navigation, with no field-level error styling shown at any
  point.
- The Draft auto-saves on every navigation, including when fields are incomplete
  or empty.

**State & status transitions**
- Navigating between form pages never changes the Application's status; it remains
  Draft.
- Reaching the Application summary (review) step is gated on completeness. The
  status changes from Draft to Submitted only on final submit, which is unchanged
  by this story.

**Validation behavior**
- No field is flagged with an error state during ordinary page navigation.
- When the Researcher attempts to advance into the Application summary step while
  required items are still missing, the system:
  - keeps the Researcher on their current page (does not advance);
  - opens the "Application incomplete" modal listing each page that still needs
    attention;
  - shows a red error banner at the top of each incomplete page; and
  - flags the specific empty required fields on those pages with the standard red
    error state and an inline message.
- A flagged field clears its error the moment the Researcher edits it.
- A required field that already has a value is never flagged.

**Edge cases & constraints**
- Requirements with no single input to flag — file uploads, roster/table entries,
  and "upload OR provide a rationale" either/or requirements — are represented in
  the page-level error banner and the group's "(required)" label only, not as a
  red field.
- A Researcher who never attempts to reach review never sees a red field, only the
  "(required)" markers from Story 1.

---

**Testing notes**

- **Test 1 — Clean navigation:** In a Draft with known missing required fields,
  use "Save and continue" through several pages. Confirm no field shows a red
  error state and each page shows only its "(required)"/"(optional)" markers.
- **Test 2 — Gate fires:** From the last form page of an incomplete Draft, attempt
  to continue into Application summary. Confirm the page does not advance, the
  "Application incomplete" modal opens listing the incomplete pages, and each
  incomplete page shows a red banner plus red-flagged empty required fields on
  return.
- **Test 3 — Error clears:** On a page with a red-flagged required field, enter a
  value. Confirm the field's red error state clears immediately.
- **Test 4 — Filled field not flagged:** Trigger the gate on a Draft where a given
  required field already has a value. Confirm that field is not flagged.
- **Test 5 — Non-field requirement:** Trigger the gate with a missing required
  upload or roster entry. Confirm it appears in the page banner and group label,
  and no red field is shown for it.

---

**Open questions**
- [ ] Should every empty required field across the Application flag red at the
  gate (true live validation), or only the fields the completeness check currently
  tracks? Confirm the intended coverage.
- [ ] Confirmed direction: empty required fields use red (standard error) rather
  than a softer warning state, and fire only at the review gate (not during
  navigation) — is that final for production?
- [ ] For a conditionally revealed section left empty at the gate, should the
  group's requirement flag, and where does the red land (the group label, the
  first empty field, or both)?
- [ ] Should the inline field message be standardized wording across all flagged
  fields, or specific to each field?
