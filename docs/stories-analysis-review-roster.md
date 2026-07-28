# Analysis review — reviewer roster stories

Stories for the **Analysis review** modal, opened from the permit header's
"X of Y reviewers done" metric on the permit review and Finalize pages. The
modal lists the reviewers on a permit's analysis team, each with an add and a
remove control.

---

## Story 1 — Make the remove-reviewer control legible and signal its destructive intent

**Story Title**
Label the remove-reviewer control and signal its destructive intent

---

**Description**

As a Technical Reviewer or System Admin managing a permit's analysis team,
I want each reviewer's remove control to name who it removes and clearly read
as a destructive action,
So that I can tell at a glance — and by screen reader — which reviewer a control
removes, and I am not surprised by an unlabeled control that drops someone from
the review.

In the Analysis review modal, every reviewer row ends in a trash-can remove
control. Today that control has no accessible name and no destructive cue: on
hover it shows only an empty tooltip pointer with no text, and its icon stays the
same neutral color as any other row action, so nothing distinguishes it as a
delete. This story fixes the control's label and destructive affordance; it does
not change what removal does.

**Roles affected:** Technical Reviewer, System Admin

**Out of scope:** What removing a reviewer does to the roster and the "X of Y
reviewers done" count — existing behavior, unchanged here. Adding a reviewer.
Any confirmation step before a reviewer is removed (see Open questions). Whether
the removed reviewer is notified — reviewer-assignment email routing is managed
separately.

---

**Acceptance Criteria**

**Access & permissions**
- Only a role that can open the Analysis review modal (Technical Reviewer,
  System Admin) can see and use the remove control.

**Happy path**
- Each reviewer row in the Analysis review modal shows a trash-can remove control.
- Hovering or keyboard-focusing the control shows a tooltip reading
  "Remove [reviewer name]" — for example, "Remove J. Okafor".
- On hover or focus, the trash-can icon changes to the destructive (danger)
  color to signal that the action removes the reviewer.
- At rest, the control shows a neutral trash-can icon with no color alarm — the
  destructive color appears only on hover or focus.

**UI & field details**
- The tooltip text is "Remove [reviewer name]", using the reviewer's displayed
  name.
- The control exposes the same "Remove [reviewer name]" text as its accessible
  name, so a screen reader announces which reviewer the control removes.
- The destructive hover color matches the system's danger color used for other
  destructive actions (e.g. "Reject permit").

**Edge cases & constraints**
- A reviewer row added within the current session (via "Add reviewer") shows the
  same labeled, destructive remove control as a pre-existing row, with the
  tooltip and accessible name resolved to that reviewer's name.
- The label and destructive cue are presentation only — they do not add,
  remove, or gate a confirmation step for the removal itself.

---

**Testing notes**

- **Test 1 — Labeled tooltip:** Open the Analysis review modal on a permit with
  multiple reviewers. Hover a reviewer's remove control. Confirm the tooltip
  reads "Remove [that reviewer's name]" rather than an empty pointer.
- **Test 2 — Destructive cue:** Hover the same control. Confirm the trash-can
  icon turns the danger color on hover and returns to neutral on mouse-out.
- **Test 3 — Accessible name:** With a screen reader, focus the remove control.
  Confirm it is announced as "Remove [reviewer name]".
- **Test 4 — Added reviewer:** Add a reviewer via "Add reviewer", then hover the
  new row's remove control. Confirm its tooltip and announced name resolve to the
  newly added reviewer.

---

**Open questions**
- [ ] Should removing a reviewer require a confirmation step, given the action
  is immediate and destructive? This story only labels and colors the control;
  it does not add a confirmation.
- [ ] Should the removed reviewer receive a notification that they were taken off
  the permit's analysis team, and if so, what is the email body and who else is
  copied?
