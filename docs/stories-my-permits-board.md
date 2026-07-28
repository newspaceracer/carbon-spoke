# My permits board — workflow-state stories

Stories for the **My permits** board (`/my-permits`), the internal reviewer's
kanban view of the applications and permits they hold a role on, organized by
where each one sits in the review workflow. Covers the board's workflow-state
lanes, entering review from the board, the "Review completed" recent tray, and
the supporting **My decisions** scope on the permits register.

> **Vocabulary note.** The board's lane labels reproduce the shipped UI copy
> ("Submitted", "Under review", "Returned to researcher", "Review completed",
> "Delinquent"). These do not all match the canonical NRD status names one-to-one
> (In Review, Back to Researcher, Active Permit; and NRD has no "Rejected" or
> "Delinquent" status). Each story maps the lane to its NRD status in the AC and
> flags the reconciliation as an open question rather than silently renaming.

---

## Story 1 — Organize the My permits board into workflow-state lanes

**Story Title**
Organize the My permits board into workflow-state lanes

---

**Description**

As a Technical Reviewer or System Admin,
I want the applications and permits I hold a role on shown as a board with one
lane per workflow state,
So that I can see at a glance what is mine and where each one sits in the review
workflow, and triage by state instead of scanning the full register.

The board replaces a flat list with five lanes, left to right, matching the
review lifecycle: Submitted, Under review, Returned to researcher, Review
completed, and Delinquent. Each card is one application or permit the reviewer
has a role on; the card's lane is derived from the record's current status and
compliance state, not stored separately.

**Roles affected:** Technical Reviewer, System Admin. Researcher (indirectly —
their submissions and returned applications surface here for review).

**Out of scope:** Whether a move on the board commits a real status transition
with its notifications and record-type change (see Open questions and Story 2).
The permits register grid itself — see Story 4. Entering review — see Story 2.
The 30-day limit on the Review completed lane — see Story 3.

---

**Acceptance Criteria**

**Access & permissions**
- Only a Technical Reviewer or System Admin can open the My permits board.
- The board shows only records the signed-in reviewer holds a role on; it does
  not show records they have no role on.

**UI & field details**
- The board shows five lanes, left to right: "Submitted", "Under review",
  "Returned to researcher", "Review completed", "Delinquent".
- Each lane header shows its name, a one-line note, and a live count of the
  cards in it.
- Each card shows the Application/Permit # (as a link to the record), the
  project title, the Principal Investigator, the park unit, the reviewer's role
  on the record, and one state-relevant date.

**State & status transitions**
- A record appears in exactly one lane, derived from its current state:
  - "Submitted" — an application that has been submitted and is awaiting review
    intake (NRD status Submitted).
  - "Under review" — an application a reviewer has started reviewing (NRD status
    In Review). How it enters this lane is covered in Story 2.
  - "Returned to researcher" — an application returned to the researcher for
    changes (NRD status Back to Researcher).
  - "Review completed" — a record that has reached a decision: approved (record
    type has changed to Permit / Active Permit) or rejected.
  - "Delinquent" — an issued permit whose annual report is missing or overdue.
- Delinquency takes precedence: an issued permit with a missing annual report
  shows in "Delinquent" even though it was previously approved.

**Edge cases & constraints**
- When a lane has no cards, it shows an empty-state message rather than a blank
  column.
- The card's role tag reflects the reviewer's own role on that record (e.g.
  Technical Reviewer), not the roles of others.

---

**Open questions**
- [ ] Do "Review completed" and "Delinquent" map to defined NRD statuses, or are
  they view-only groupings over existing statuses? NRD's status list has no
  "Rejected" or "Delinquent" — how should a rejected application and a
  compliance-overdue permit be represented?
- [ ] Is board membership scoped to records where the reviewer is the assigned
  Technical Reviewer, or any role (e.g. supporting reviewer, district reviewer)?
- [ ] Which single date should each lane's card show (e.g. date submitted for
  Submitted, decision date for Review completed, annual report due date for
  Delinquent)?

---

## Story 2 — Move an application between lanes to change its workflow state

**Story Title**
Move a My permits card between lanes to update its workflow state

---

**Description**

As a Technical Reviewer or System Admin,
I want to move a card between lanes by dragging it or using its menu, and to
start review on a Submitted application,
So that I can advance a record through the workflow directly from the board
without opening each record.

A card can be moved two ways that reach the same result: dragging it to another
lane, or choosing an action from the card's overflow menu ("Start review",
"Return to researcher", "Mark review completed", "Flag delinquent", "Move to
Submitted"). Moving a Submitted application into "Under review" is the "start
review" action and shares the same review-started state as the record's detail
page, so the board and the detail page never disagree.

**Roles affected:** Technical Reviewer, System Admin. Researcher (the party a
"Returned to researcher" move hands the application back to).

**Out of scope:** The full set of lanes and how a card's initial lane is derived
— see Story 1. Any change to the permit detail page's existing "Start review"
gate beyond keeping it consistent with the board.

---

**Acceptance Criteria**

**Access & permissions**
- Only a Technical Reviewer or System Admin can move a card.

**Happy path**
- A card can be moved to another lane by dragging it onto that lane.
- A card's overflow menu offers a labeled action for each destination lane, and
  choosing one moves the card to that lane.
- The overflow-menu action is the keyboard-accessible equivalent of dragging —
  every move possible by drag is possible without a pointer.
- The action for the card's current lane is disabled (a record cannot be moved
  to the lane it is already in).

**State & status transitions**
- Moving a Submitted application into "Under review" starts review on it (NRD
  status Submitted → In Review) and marks it as review-started, the same state
  the record's detail page reads and sets.
- Moving a card out of "Under review" clears the review-started state.
- After a move, the source and destination lane counts update immediately.

**UI & field details**
- The overflow-menu actions read: "Start review", "Return to researcher", "Mark
  review completed", "Flag delinquent", and "Move to Submitted".

**Edge cases & constraints**
- A record can be moved more than once; each move updates its lane and, for the
  Under review transitions, its review-started state.

---

**Notifications**
- Moving an application to "Returned to researcher" (NRD status Back to
  Researcher) and moving it to an approved/rejected "Review completed" state are
  both points where the researcher is normally notified. This story does not
  define that email — see Open questions.

---

**Open questions**
- [ ] Does moving a card commit the record's real status transition (and its
  emails and Application → Permit record-type change), or is the board a local
  triage view whose moves do not change the underlying record? This is the
  central product decision behind Stories 1 and 2.
- [ ] What is the email body copy sent to the Researcher, PI, and PICOF when an
  application is moved to "Returned to researcher", and when it reaches an
  approved or rejected "Review completed" state?
- [ ] Should "Start review" from the board auto-assign the mover as the Technical
  Reviewer if the record has none, or only start review on an already-assigned
  record?

---

## Story 3 — Limit the Review completed lane to recent decisions and link to the full history

**Story Title**
Show only recent decisions in the Review completed lane, with a "See all" link

---

**Description**

As a Technical Reviewer or System Admin,
I want the "Review completed" lane to show only reviews I completed recently and
to link to the full history elsewhere,
So that the board stays a working queue of what is current, not an ever-growing
archive of everything I have ever approved or rejected.

The "Review completed" lane shows only records whose decision (approved or
rejected) was reached within the last 30 days; older decisions drop off the
board. A "See all" link opens the permits register filtered to every application
this reviewer approved or rejected — the full history (see Story 4).

**Roles affected:** Technical Reviewer, System Admin.

**Out of scope:** The other four lanes — see Story 1. The register scope the
"See all" link lands on — see Story 4. The definition of a "decision" beyond
approved or rejected.

---

**Acceptance Criteria**

**State & status transitions**
- The "Review completed" lane shows only records whose approve or reject
  decision date falls within the last 30 days.
- A record whose decision is older than 30 days does not appear on the board in
  any lane (it remains reachable via "See all"); a record that later becomes
  delinquent moves to the "Delinquent" lane per Story 1.

**UI & field details**
- Each "Review completed" card shows whether the decision was "Approved" or
  "Rejected", paired with an icon so the outcome does not read by color alone.
- The lane shows a "See all N" link, where N is the count of every application
  this reviewer has approved or rejected (not only the recent ones).
- Activating "See all" opens the permits register filtered to the reviewer's
  approved-or-rejected records (the My decisions scope — see Story 4).

**Edge cases & constraints**
- "See all" counts and links to every record the reviewer approved or rejected
  ever, including a permit that was approved and has since expired or gone
  delinquent — being approved once is enough to be included.
- The count shown in the "See all" link is a superset of the cards visible in the
  lane (it also includes older and now-delinquent decisions).

---

**Testing notes**

- **Test 1 — Recent only:** Confirm the lane shows only records decided in the
  last 30 days, and that a record decided more than 30 days ago is absent from
  the board but present behind "See all".
- **Test 2 — See all target:** Activate "See all" and confirm the register opens
  filtered to the reviewer's approved-or-rejected records, with a row count equal
  to the link's N.
- **Test 3 — Once-approved-now-expired:** Confirm a permit that was approved and
  has since expired is counted by "See all" even though it is not in the lane.

---

**Open questions**
- [ ] Is 30 days the correct window, and is it anchored to today's date or to the
  reviewer's most recent decision (the prototype anchors to the data's latest
  decision, not the wall clock)?
- [ ] Should a withdrawn application count as a completed "decision" for this
  lane and for "See all"? The prototype treats only approved and rejected as
  decisions.

---

## Story 4 — Add a "My decisions" scope to the permits register

**Story Title**
Add a "My decisions" scope to the permits register

---

**Description**

As a Technical Reviewer or System Admin,
I want a register scope that shows every application I have approved or rejected,
So that I can review the full history of my own decisions in one filtered view —
the destination the My permits board's "See all" link opens.

The permits register's scope switcher gains a fourth segment, "My decisions",
alongside "My permits", "My district", and "All permits". It shows the reviewer's
records that reached an approve or reject decision at any point. A `?scope=`
deep-link opens the register pre-set to a chosen scope so another screen (the
board's "See all" link) can land the reviewer directly on it.

**Roles affected:** Technical Reviewer, System Admin.

**Out of scope:** The My permits board and its "See all" link — see Story 3. The
register's existing search, column manager, and other scopes — unchanged except
for the new segment and deep-link.

---

**Acceptance Criteria**

**UI & field details**
- The register scope switcher shows a "My decisions" segment with a live count,
  placed after "My permits": "My permits", "My decisions", "My district",
  "All permits".
- Selecting "My decisions" filters the grid to the reviewer's approved-or-rejected
  records, and the row count reflects the filtered set.

**State & status transitions**
- The "My decisions" set includes a record the reviewer approved (record type
  changed to Permit / Active Permit, including permits that have since expired)
  or rejected. It excludes records that never reached a decision (Draft,
  Submitted, In Review, Back to Researcher).

**Access & permissions**
- The register can be opened with a `?scope=` deep-link whose value is one of the
  defined scopes (all, my permits, my district, my decisions); an unrecognized
  value falls back to the reviewer's remembered scope.
- A valid `?scope=` value takes precedence over the reviewer's remembered scope,
  and the matching segment is highlighted to match the filtered grid.

**Edge cases & constraints**
- Landing via a `?scope=` deep-link highlights the correct scope segment (not the
  first segment), so the highlighted scope and the filtered grid always agree.

---

**Testing notes**

- **Test 1 — Segment filter:** Select "My decisions" and confirm the grid shows
  only the reviewer's approved-or-rejected records and the count matches.
- **Test 2 — Deep-link:** Open the register with the My-decisions `?scope=`
  deep-link and confirm the grid is filtered and the "My decisions" segment is
  highlighted.
- **Test 3 — Precedence:** With a different scope remembered from a prior visit,
  open a `?scope=` deep-link and confirm the deep-link scope wins.

---

**Open questions**
- [ ] Is "My decisions" scoped to records where the reviewer was the deciding
  Technical Reviewer, or any record they held a role on that reached a decision?
- [ ] Should the "My decisions" scope be visible to all Technical Reviewers and
  System Admins, or gated (e.g. hidden for roles that never decide applications)?
- [ ] Should a withdrawn or otherwise closed-without-decision application ever
  appear in "My decisions"?
