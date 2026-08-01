# Analysis team — roster modal stories

Stories for the **Analysis team** modal, opened from the permit header's
review-progress metric ("N of M reviews complete") on the permit detail and
Finalize pages. The modal lists the reviewers on a permit's analysis team grouped
by review unit, shows each reviewer's review status, and — for a user who may edit
the team — lets them add and remove members and email the team.

**Editing gate (used throughout):** the team roster is the `supporting-agents`
section in `permissions-matrix.md`. It is editable only by a **System Admin**
(user role) or the permit's **Responsible Agent** (permit-role), and only while the
permit is **not** in a final status (**Expired**, **Rejected**, **Withdrawn**).
Everyone else who can open the permit sees a read-only view.

---

## Story 1 — Open the analysis team from the header, gated to view or manage

**Story Title**
Open the analysis team modal from the header, gated to view or manage

---

**Description**

As an internal reviewer on a permit,
I want to open the analysis team from the permit header's review-progress metric
and have it clearly read as either a read-only view or an editable roster,
So that I can see who is reviewing the permit, and only edit the team when I am
allowed to.

The permit header shows a review-progress metric tile ("N of M reviews complete").
Clicking it opens the Analysis team modal. Whether the modal is editable follows
the `supporting-agents` gate above; the tile's affordance and the modal heading
must reflect that, so a viewer is never shown edit controls they cannot use.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (as viewers or, when RA, as
managers); the permit-roles Responsible Agent and Supporting Agent.

**Out of scope:** The review-status model (Story 2), the progress-bar count
(Story 3), adding (Story 4), removing (Story 5), and emailing (Story 6) — those
behaviors are specified in their own stories.

---

**Acceptance Criteria**

**Access & permissions**
- Any user who can open the permit can open the Analysis team modal from the
  header metric tile.
- The modal is **editable** (add/remove controls present) only when the current
  user is a System Admin or the permit's Responsible Agent, and the permit is not
  Expired, Rejected, or Withdrawn.
- For every other viewer the modal is **read-only**: no add picker and no per-row
  remove control.

**Happy path**
- The header shows a metric tile with the review-progress bar and a call-to-action.
- When the team is editable, the tile CTA reads **"Manage team"** and the modal
  heading reads **"Manage analysis team"**.
- When the team is read-only, the tile CTA reads **"View team"** and the modal
  heading reads **"Analysis team"**.
- Opening the modal shows the reviewers grouped by review unit: the **Lead analyst**
  first, then **Headquarters**, then each district in the order it first appears.

**UI & field details**
- The metric tile helper text reads "N of M reviews complete".
- Grouping headers use the unit name ("Lead analyst", "Headquarters", and each
  district's name).

**Edge cases & constraints**
- The manage/view determination is evaluated when the modal opens, from the
  current identity, permit-role, and permit status — not cached from a prior state.

---

**Testing notes**

- **Test 1 — Manager view:** As a System Admin (or the RA) on an Under review
  permit, open the modal. Confirm CTA "Manage team", heading "Manage analysis
  team", the add picker is present, and rows show a remove control.
- **Test 2 — Viewer view:** As a Supporting Agent (or any non-RA reviewer), open
  the modal. Confirm CTA "View team", heading "Analysis team", no add picker, no
  remove controls.
- **Test 3 — Final status:** As the RA on a Rejected permit, open the modal.
  Confirm it is read-only ("View team").

---

**Open questions**
- [ ] On which surfaces is the header metric shown — permit detail, Finalize, or
  both — and is the gate identical on each?

---

## Story 2 — Track each reviewer's review status: Not started, Pending, Complete

**Story Title**
Show each reviewer's review status as Not started, Pending, or Complete

---

**Description**

As an internal reviewer,
I want to see where each teammate is in their own review — Not started, Pending,
or Complete —
So that I can tell at a glance who still has work outstanding before the permit
can move forward.

Each reviewer moves through three states driven by their own workflow: **Not
started** (assigned, hasn't opened their review), **Pending** (they clicked Start
review and are in progress), and **Complete** (a Supporting analyst clicked
Complete review). The **Lead analyst** is the exception: their status is **derived
from the permit**, not a self-service action — they read Complete only once the
permit reaches **Out for signature** (their sign-off ends the analysis), and
Pending before that.

**Roles affected:** All internal reviewers who can open the modal; the permit-roles
Responsible Agent (shown as Lead analyst) and Supporting Agent.

**Out of scope:** How a reviewer sets their own status (the Start review / Complete
review actions on their review surface) — this story only displays the resulting
state in the roster. The unit roll-up count on the progress bar — see Story 3.

---

**Acceptance Criteria**

**Happy path**
- Each reviewer row shows a status indicator with one of three labels: **Not
  started**, **Pending**, or **Complete**.
- The status is shown as an icon indicator with its text label (not color alone).
- A secondary line under the status gives the date context: "Added [date]" (Not
  started), "Started [date]" (Pending), or "Completed [date]" (Complete).

**State & status transitions**
- The Lead analyst row reads **Pending** with the secondary line "Reviewing" while
  the permit is Waiting for review, Under review, or Returned to submitter.
- The Lead analyst row reads **Complete** with the secondary line "Signed off" once
  the permit is Out for signature, Waiting for annual report, or Active.
- A newly added member starts at **Not started**.

**UI & field details**
- Status labels are exactly "Not started", "Pending", "Complete".
- The status indicator kinds map: Not started → not-started, Pending → in-progress,
  Complete → succeeded.

**Edge cases & constraints**
- Only the Lead analyst's status is derived from permit status; every other
  reviewer's status is their own and is unaffected by permit-status changes.

---

**Testing notes**

- **Test 1 — Three states:** Open the modal on a permit whose team has one member
  in each state. Confirm each row's label and date line match its state.
- **Test 2 — Lead derivation:** Open the modal while Under review; confirm the Lead
  reads "Pending / Reviewing". Advance the permit to Out for signature; reopen and
  confirm the Lead reads "Complete / Signed off".

---

**Open questions**
- [ ] For a terminal permit status (Rejected / Withdrawn), what status should the
  Lead analyst row show — remain Pending, or a distinct label?

---

## Story 3 — Count review progress by unit (each district + HQ), excluding the lead

**Story Title**
Count review progress by unit, one per district plus Headquarters

---

**Description**

As an internal reviewer,
I want the review-progress bar to count how many review **units** are done — each
involved district and Headquarters — rather than how many individual people,
So that the progress reflects whether each part of the organization has weighed in,
not how many reviewers happen to be assigned.

A **review unit** is one involved district, or Headquarters (which collapses every
non-district reviewer). A unit is **complete** once **at least one** of its members
is Complete. The **Lead analyst is excluded** from the count — their sign-off does
not move this bar.

**Roles affected:** All internal reviewers who can open the modal.

**Out of scope:** The per-reviewer status model — see Story 2.

---

**Acceptance Criteria**

**Happy path**
- The progress bar (in the header tile and the modal) reads "N of M reviews
  complete", where **M** is the number of review units and **N** is the number of
  units with at least one Complete member.
- A District reviewer counts toward their district's unit; every other non-lead
  reviewer counts toward the single **Headquarters** unit.
- Each unit's group header shows a roll-up indicator: **Reviewed** (≥1 member
  Complete), **In progress** (≥1 Pending, none Complete), or **Not started**.

**State & status transitions**
- When a member is added to or removed from a unit, the count and the affected
  unit's roll-up recompute immediately.
- Removing the last member of a unit drops that unit from the count.

**Edge cases & constraints**
- The Lead analyst is never counted as a unit and never contributes to a unit's
  Reviewed state.

---

**Testing notes**

- **Test 1 — Unit count:** On a permit with reviewers across two districts plus HQ
  (one HQ member Complete), confirm the bar reads "1 of 3 reviews complete" and the
  HQ header reads "Reviewed".
- **Test 2 — Lead excluded:** Confirm the Lead analyst is not counted in M and does
  not change N when their status changes.

---

**Open questions**
- [ ] If a unit has members in Pending and Not started only, the bar treats it as
  not complete — is a partially-progressed unit ever meant to count as complete?

---

## Story 4 — Add a member to the team inline, staged until Save

**Story Title**
Add a team member inline by selecting a user, staged until Save

---

**Description**

As a System Admin or the permit's Responsible Agent,
I want to add a reviewer to the analysis team by selecting them from the user
directory directly in the modal, with the change held until I Save,
So that I can build the team without leaving the roster and without a separate
add dialog, and I can review or undo my picks before committing.

Selecting a user from the directory picker **stages** them into their review unit
as a Supporting analyst; nothing persists until Save. The footer swaps to a
save/cancel pair while there are unsaved changes.

**Roles affected:** System Admin, and the permit's Responsible Agent (permit-role).

**Out of scope:** Removing a member — see Story 5. Notifying a newly added reviewer
that they were assigned — see Open questions.

---

**Acceptance Criteria**

**Access & permissions**
- The add picker is present only when the team is editable (Story 1's gate).

**Happy path**
- The picker is a directory search labeled **"Search the user directory…"** that
  lists only users not already on the team.
- Selecting a user stages a new row for them in their unit as a **Supporting
  analyst** at status **Not started**, with the secondary line "Not saved yet".
- While at least one change is staged, the footer shows **Cancel** and **Save
  changes**; with no staged changes it shows **Email all** and **Done**.
- Clicking **Save changes** commits the staged additions, updates the roster and
  the progress count, and closes the modal with a confirmation toast.

**State & status transitions**
- A staged addition counts toward the progress bar preview immediately but only
  persists on Save.
- Closing the modal or clicking **Cancel** discards all staged additions and
  returns the roster to its saved state.

**UI & field details**
- The directory picker excludes users already on the team, including ones staged
  this session.
- A staged row carries a remove (×) affordance to undo that specific pick before
  saving.

**Edge cases & constraints**
- A user cannot be staged twice; once staged (or saved) they no longer appear in
  the picker.

---

**Testing notes**

- **Test 1 — Stage and save:** As the RA, select a directory user. Confirm a "Not
  saved yet" row appears, the footer shows Cancel / Save changes, and Save persists
  the member (survives reopen).
- **Test 2 — Discard:** Stage a member, then Cancel. Reopen and confirm the member
  is gone.

---

**Open questions**
- [ ] Should a newly added reviewer receive an email that they were assigned to the
  permit's analysis team? If so, what is the email body copy and who is copied?
- [ ] Can a member be added while the permit is Out for signature or later, or is
  adding limited to earlier statuses?

---

## Story 5 — Remove a member from the team, staged with an undo

**Story Title**
Remove a team member from the modal, staged until Save with undo

---

**Description**

As a System Admin or the permit's Responsible Agent,
I want to remove a reviewer from the analysis team in the modal, with the removal
held until I Save and reversible before then,
So that I can take someone off the review deliberately and recover from a mis-click
without re-adding them.

Removal is **staged**, matching the add flow: marking a member for removal strikes
the row and previews the resulting count; nothing persists until Save. The **Lead
analyst cannot be removed**.

**Roles affected:** System Admin, and the permit's Responsible Agent (permit-role).

**Out of scope:** Adding a member — see Story 4. Whether a removed reviewer is
notified — see Open questions.

---

**Acceptance Criteria**

**Access & permissions**
- The per-row remove control is present only when the team is editable (Story 1's
  gate), and never on the Lead analyst row.

**Happy path**
- Each removable row shows a remove control; its tooltip and accessible name read
  **"Remove [reviewer name]"**.
- Activating remove marks the row for removal: the row is struck through and dimmed,
  its date line reads **"Will be removed"**, and the control's tooltip changes to
  **"Undo remove"**.
- Activating the control again undoes the staged removal and restores the row.
- Clicking **Save changes** commits the removals, recomputes the count, and closes
  the modal with a confirmation toast.

**State & status transitions**
- A row staged for removal is excluded from the progress count immediately as a
  preview; removing the last member of a unit drops that unit from the count.
- Closing the modal or clicking **Cancel** clears all staged removals and restores
  the rows.
- On Save, a member who was added earlier in the same session is simply dropped;
  a previously-saved member is recorded as removed so the change survives reload.

**UI & field details**
- The remove control uses the trash-can icon; on hover/focus it takes the system's
  danger color (matching other destructive actions such as "Reject permit").

**Edge cases & constraints**
- The Lead analyst has no remove control and cannot be removed here.
- A removed member becomes eligible to be added again (see Open questions on
  re-add via the picker).

---

**Testing notes**

- **Test 1 — Stage, preview, undo:** As the RA, remove a Complete HQ member.
  Confirm the row strikes through, the HQ roll-up and the bar update as a preview,
  and Undo restores both. 
- **Test 2 — Save removal:** Remove a member and Save. Reopen and confirm they are
  gone and the count reflects it.
- **Test 3 — Lead protected:** Confirm the Lead analyst row has no remove control.

---

**Open questions**
- [ ] Should a removed reviewer be notified that they were taken off the permit's
  analysis team? If so, what is the email body and who else is copied?
- [ ] After a saved member is removed, can they be re-added from the picker in the
  same or a later session?

---

## Story 6 — Email one reviewer or the whole team from the roster

**Story Title**
Copy a reviewer's email or email the whole analysis team

---

**Description**

As an internal reviewer,
I want to copy an individual reviewer's email or start a message to the whole team
from the roster,
So that I can reach reviewers about the permit without hunting for their addresses
elsewhere.

These are read-only utilities available to anyone who can open the modal (they do
not depend on the editing gate).

**Roles affected:** All internal reviewers who can open the modal.

**Out of scope:** Sending mail from within the app — these actions copy an address
or hand off to the user's mail client. Mention/notification emails from comments —
see `stories-comment-mentions.md`.

---

**Acceptance Criteria**

**Happy path**
- Each reviewer row shows the reviewer's email under their name with a copy control;
  activating it copies that address and shows a confirmation toast.
- A footer **Email all** button (shown when there are no staged edits) opens the
  user's mail client addressed to every current team member with an address on file.

**UI & field details**
- The email line is omitted for a reviewer with no address on file, and that
  reviewer is excluded from Email all.
- Email all deduplicates repeated addresses.

**Edge cases & constraints**
- Email all reflects the currently displayed roster (including members added this
  session once saved); staged-but-unsaved edits are not implied to be emailable
  because the footer shows Cancel / Save changes while edits are pending.

---

**Testing notes**

- **Test 1 — Copy one:** Activate a row's copy control; confirm the address is on
  the clipboard and a toast confirms it.
- **Test 2 — Email all:** Click Email all; confirm the mail client opens addressed
  to all members with an address, deduplicated.

---

**Open questions**
- [ ] Should Email all address recipients on the To line (as an internal team) or
  Bcc them?
