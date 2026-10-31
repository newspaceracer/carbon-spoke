# Review Wizard — UI Review Fixes — Jira Stories

Two stories from a design-engineering review of the review wizard (the page reached
from a permit's **Open review** action). Story 1 fixes interaction and accessibility
failures; Story 2 aligns labels, wording, and styling.

- **Story 1** — Make the review wizard fully operable by keyboard, touch, and screen reader
- **Story 2** — Align labels, wording, and styling across the review wizard

The review wizard opens only while the permit is **Under review** and the
Responsible analyst has clicked **Start review**. It has three steps: **Review &
conditions** (step ①), **Finalize the letter** (step ②), and **Review & send**
(step ③). Steps ② and ③ are reached only by the permit's lead — the **Responsible
analyst (RA)** or a **System Admin**; a **Supporting analyst (SA)** works on step ①
only. Neither story changes a status, permit-role, record type, or district span.

---

## Story 1 — Make the review wizard fully operable by keyboard, touch, and screen reader

**Story Title**
Make the review wizard operable by keyboard, touch, and screen reader

---

**Description**

As a reviewer working a permit in the review wizard,
I want every action on the page to work with a keyboard, on a touch screen, and
with a screen reader, and to keep my place as the page changes,
So that I can review, comment on, and finalize a permit without a mouse and
without losing focus or skipping steps by accident.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer — in their permit-role as
**Responsible analyst** (all three steps) or **Supporting analyst** (step ① only).

**Out of scope:** Hit-target sizes below 44 × 44 px and form inputs under 16 px —
the house design principles sanction Carbon's `sm` (32 px) controls and 14 px
inputs. Screen-reader testing on mobile platforms.

**Prototype:**
- [Review wizard — Review & conditions](https://newspaceracer.github.io/carbon-spoke/final-letter/) — view as System Admin (live after the next push to master)
- [Review wizard — section comments](https://newspaceracer.github.io/carbon-spoke/final-letter/?comments=anchored) — view as System Admin (live after the next push to master)
- [Review wizard — supporting review](https://newspaceracer.github.io/carbon-spoke/final-letter/) — view as District Assistant Technical Reviewer (live after the next push to master)

---

**Acceptance Criteria**

**Access & permissions**
- Every behavior below applies to every role that can open the wizard; no role
  gains or loses an action.
- The editable letter paragraphs and **Restore default wording** (step ②) are
  available only to the Responsible analyst and System Admin, as today.

**Happy path — moving between steps**
- When the user moves to another step (the footer button, **Back**, the header
  action, or the progress tracker), the page scrolls to the top and keyboard focus
  moves to the new step's title.
- A screen reader announces the new step's title on arrival.
- Pressing Enter twice on the footer button advances exactly one step; the second
  press does not act on the relabelled button.
- On load, the wizard shows the step the user last worked on without first
  flashing step ①; the footer button shows its correct label from the start.

**Happy path — commenting on a passage**
- Selecting text in the application record shows the **Comment** button beside
  the selection, whether the text was selected with a mouse, with the keyboard
  (Shift + arrow keys), or on a touch screen.
- With text selected in the record, pressing **⌘/Ctrl + Alt + M** starts a comment
  on that passage, the same as clicking **Comment**.
- The comment box helper text reads: "To comment on a passage, select it in the
  record, then press ⌘/Ctrl+Alt+M." The section composer
  (`?comments=anchored`) reads: "To comment on a passage, select it in this
  section, then press ⌘/Ctrl+Alt+M."
- The **Comment** button never covers the app header or the compact permit bar.
  When there is no room above the selection it appears below it, and it hides
  while the selection is scrolled under the header.

**Happy path — removing rows**
- After removing an authorized park, district contact, or specimen, keyboard
  focus moves to the remove button in the same position (or the last one if the
  removed row was last).
- When the last park is removed, focus moves to the **Add parks** field; when the
  last specimen is removed, focus moves to **Add specimen**.
- When removing a park opens the **Drop this district from the permit?**
  confirmation, focus returns to the list as above once the dialog closes.

**Happy path — editing letter wording (step ②)**
- Each editable letter paragraph is announced as an editable text field named
  "Letter paragraph: introduction", "Letter paragraph: conditions notice", or
  "Letter paragraph: report reminder".
- Pressing Escape inside a paragraph discards the in-progress edit and leaves
  the paragraph.
- Clicking **Restore default wording** restores all three paragraphs and shows a
  notification "Default wording restored" with an **Undo** button. **Undo** puts
  back the wording that was there before the restore.
- The Undo notification does not time out. It closes when the user selects
  **Undo**, closes it, or starts editing a paragraph again.
- The hint above the letter reads: "Select a body paragraph to edit its wording.
  Dates, parks, and conditions fill in automatically."

**UI & field details**
- The @-mention suggestion list is announced to screen readers: the comment box
  reports whether the list is open, and moving through it with the arrow keys
  announces the highlighted name. This applies to every comment box on the wizard
  and on the permit detail page, which share the same control.
- The working panel (step ①) is a landmark region named "Working panel".
- On wide screens the letter preview (step ②) stays in view below the header and
  compact permit bar, and the whole letter frame, including its bottom edge,
  fits in the window; the letter scrolls inside its frame.
- Resolved comments and removed contacts are shown in secondary text color, not
  by fading. All text meets 4.5:1 contrast.
- Every scroll the page makes for the user (changing steps, jumping to a comment,
  opening a document) is instant, not animated, when the user has turned on
  reduced motion in their operating system.

**Edge cases & constraints**
- Text selected outside the application record (the working panel, the letter,
  a section's own comment thread) does not show the **Comment** button, and the
  shortcut does nothing.
- An empty or whitespace-only paragraph edit reverts to the default wording, as
  today.

---

**Testing notes**

- **Test 1 — Step focus:** Open the wizard as System Admin. Tab to **Finalize
  review** and press Enter twice quickly. Expected: the wizard is on **Finalize
  the letter** (not Review & send) and focus is on the "Finalize the letter" title.
- **Test 2 — Return to a later step:** Advance to **Review & send**, reload.
  Expected: the page opens on Review & send without showing Review & conditions
  first; the footer button reads **Send for signature**.
- **Test 3 — Keyboard comment:** Tab into the Form tab, move into a record
  answer, select text with Shift + arrows, press ⌘/Ctrl + Alt + M. Expected: the
  Comments tab opens with the passage quoted and focus in the comment box.
- **Test 4 — Touch comment:** On a phone or tablet, long-press to select text in
  the record. Expected: the **Comment** button appears beside the selection.
- **Test 5 — Remove parks by keyboard:** On Finalize the letter, focus the first
  park's remove button and press Enter. Expected: focus lands on the next remove
  button. Repeat until the list is empty; focus lands on **Add parks**.
- **Test 6 — Undo restore:** Edit the introduction paragraph, click **Restore
  default wording**, then **Undo**. Expected: the edited introduction returns.
- **Test 7 — Reduced motion:** Turn on Reduce motion in the OS, then change
  steps and use a comment's **Show in record**. Expected: the page jumps without
  animating.
- **Test 8 — Screen reader:** With VoiceOver or NVDA, type "@" in the comment box
  and arrow through the list. Expected: the open list and each highlighted name
  are announced.

---

**Open questions**
None — story appears complete.

---

## Story 2 — Align labels, wording, and styling across the review wizard

**Story Title**
Align labels, wording, and styling across the review wizard

---

**Description**

As a reviewer working a permit in the review wizard,
I want the same kind of thing to be named, sized, and styled the same way
everywhere on the page,
So that I can scan each step quickly and trust that matching controls do matching
things.

The annual report wording follows the decided model: one annual report, due 30
days after the permit ends. The generated letter's regulated body text is not
changed.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer — as **Responsible analyst** (all
steps) or **Supporting analyst** (step ①).

**Out of scope:** The letter's regulated reminder paragraph ("…submit a summary
report of your activities by <date>, as well as a final report…") and condition
HQ-C04 keep their current wording. The `/admin/templates` "Summary report due"
cadence setting — replaced by an annual-report due setting that seeds the
wizard's due date in `stories-templates-and-defaults.md` Story 9.

**Prototype:**
- [Review wizard — Finalize the letter](https://newspaceracer.github.io/carbon-spoke/final-letter/) — view as System Admin, advance to step ② (live after the next push to master)

---

**Acceptance Criteria**

**Happy path — page and step naming**
- The wizard's breadcrumb last item reads **Review**, and the browser tab title
  reads "Review <permit number>" (e.g. "Review 26-635-017").
- The progress tracker shows each step's name only: **Review & conditions**,
  **Finalize the letter**, **Review & send**. The one-line description of the
  current step appears only under the step title.

**Happy path — annual report due date (step ②)**
- The section is titled **Annual report due**, its date field is labelled
  **Due date**, and the hint below it reads "Defaults to 30 days after the permit
  ends."
- The due date defaults to 30 days after the permit end date and follows the end
  date when it changes, until the reviewer picks a due date themselves. A
  reviewer-picked date is kept after reload and is no longer recalculated.
- The **Review & send** recap labels the date **Annual report due**.
- The letter's reminder paragraph shows the same due date.

**UI & field details — labels and copy**
- Every comment box uses the placeholder "Type @ to mention someone ·
  ⌘/Ctrl+Enter to post". The section composer has the visible label **Add a
  comment**.
- **Authorized parks** shows its count in the section title (e.g. "Authorized
  parks (5)"); the repeated "Authorized parks" label above the table is removed.
  The table's action column has no visible heading; screen readers hear
  "Actions".
- Section hints are at most two sentences:
  - Authorized parks: "Same parks as Study areas. Changes update the letter's
    contact list and permit type."
  - District contacts: "These print on the letter's contact list. Each district
    lead is the primary contact; park contacts attach automatically."
  - Signature: "The signer's name and classification print on the letter. An
    administrator sets the default."
- The **Review & send** recap labels (permit category, **Valid**, **Annual report
  due**) are sentence case, not all caps.

**UI & field details — controls and styling**
- Footer buttons **Back**, **Cancel**, and the primary step button are large
  (`lg`).
- Section-header actions **Change signer** and **Restore default wording** are
  tertiary, medium (`md`).
- **Add comment** is medium (`md`) in every comment box, including the header
  comments panel.
- The selection pair **Comment** / **Issue** are both text-only buttons.
- Tab counts (Documents, Special conditions, Comments) use Carbon tags (small,
  gray) and are hidden at zero.
- **Expand all** / **Collapse all** appear in that order, as ghost buttons, on both
  the application record and the special conditions list. The conditions list on
  the permit detail page matches.
- The **Application record** and **Working panel** titles are one size smaller
  than the step title.
- Spacing on the page uses the Carbon spacing scale.

**Edge cases & constraints**
- Existing saved review drafts that stored a due date without marking it as
  reviewer-picked recalculate to 30 days after the permit end on next load.

---

**Testing notes**

- **Test 1 — Due-date default:** Open Finalize the letter as System Admin.
  Expected: **Due date** is 30 days after **Permit end**. Change the end date;
  the due date follows. Pick a due date, change the end date again; the picked
  date stays. Reload; the picked date is still there.
- **Test 2 — Recap and letter agree:** Advance to Review & send. Expected: the
  recap's **Annual report due** and the letter's reminder paragraph show the same
  date as step ②.
- **Test 3 — Naming:** Expected: breadcrumb ends in **Review**; tab title is
  "Review 26-635-017"; the tracker shows step names without descriptions.
- **Test 4 — Visual sweep:** On each step, check the controls listed above for
  label, size, order, and style; compare **Expand all / Collapse all** with the
  same controls on the permit detail page.

---

**Open questions**
None — story appears complete.
