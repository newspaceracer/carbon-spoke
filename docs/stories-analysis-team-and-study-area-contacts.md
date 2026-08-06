# Analysis team consistency & Study-area district contacts

Stories for making the **Analysis team** read the same everywhere it appears, and
for surfacing the **district contact assigned per park** on the permit's Study
areas. Also folds in marking the internal-only Overview sections consistently.

**Editing gate (used throughout):** the analysis-team roster is the
`supporting-agents` section in [`permissions-matrix.md`](permissions-matrix.md). It
is editable only by a **System Admin** (user role) or the permit's **Responsible
Agent** (permit-role), and only while the permit is **not** in a final status
(**Expired**, **Rejected**, **Withdrawn**). Everyone else who can open the permit
sees a read-only view. The roster and its edits persist to a shared per-permit
store, so every surface stays in sync.

Related: [`stories-analysis-review-roster.md`](stories-analysis-review-roster.md)
(the header review-progress modal — a separate surface),
[`stories-final-letter-district-contacts.md`](stories-final-letter-district-contacts.md)
(where the per-park district contacts are recorded), and
[`stories-overview-tab-restructure.md`](stories-overview-tab-restructure.md).

---

## Story 1 — Render one shared analysis-team roster on the permit detail page and the review workflow

**Story Title**
Show one identical analysis-team roster on the permit and review workflow

---

**Description**

As an internal reviewer on a permit,
I want the analysis team to look and behave identically on the permit detail page
and in the review workflow,
So that I read the same roster, review status, and contact details no matter where
I open it, and nothing drifts between the two.

The Analysis team appears in two places: the **Overview** tab's side rail on the
permit detail page, and the **Analysis team** tab of the review workflow's working
panel (the Finalize wizard, step ① — "Review & conditions"). Both now render the
same roster, grouped by review unit, with each member's role, email, and
application-review status. The roster is editable per the gate above; add / remove /
email actions persist to the shared per-permit team store so both surfaces reflect
the same team.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (as viewers, or as managers when the
permit's Responsible Agent); the permit-roles Responsible Agent and Supporting
Agent. Researcher and logged-out users never see the roster (internal only).

**Out of scope:** The permit header's review-progress modal ("N of M reviews
complete") — that separate surface is specified in
[`stories-analysis-review-roster.md`](stories-analysis-review-roster.md). Per-member
review-status transitions themselves (how a reviewer moves not-started → in progress
→ complete) are unchanged by this story.

---

**Acceptance Criteria**

**Access & permissions**
- The roster is visible only to internal reviewers (System Admin, HQ Technical
  Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer);
  it is never shown to a Researcher or a logged-out visitor.
- Add and remove controls, plus the **Add member** trigger, appear only when the
  current user is a System Admin or the permit's Responsible Agent and the permit is
  not Expired, Rejected, or Withdrawn; otherwise the roster is read-only.

**Happy path**
- The same roster renders in the permit detail page's Overview rail and in the
  review workflow's **Analysis team** tab, with identical grouping, fields, and
  actions.
- Each member row shows: an initials avatar, the member's name, their role and unit,
  their email, and their review status with a date.
- A manager can add a directory user not already on the team, remove any member
  except the Responsible analyst, and email the whole team — and the change is
  reflected on the other surface.

**State & status transitions**
- Adding or removing a member updates the shared per-permit team store; reopening
  either surface shows the updated roster.
- Removing the last member of a district group removes that group's heading;
  re-adding a member of that district restores it.

**UI & field details**
- Toolbar buttons read **"Email all"** and **"Add member"**; the add dialog's commit
  button reads **"Add to team"**.
- Each email shows as a mailto link with an adjacent copy control whose tooltip reads
  **"Copy email"**; copying confirms with an "Email copied" toast.
- The Responsible analyst's row has no remove control.

**Edge cases & constraints**
- **Email all** opens a mail draft addressed to every current member with an email;
  if no member has an email, no draft opens.
- A user already on the team does not appear in the **Add member** picker.

---

**Open questions**
- [ ] When the review workflow's Team tab shows a count badge, should it match the
  roster's live member count on add/remove? (Currently kept in step.)

---

## Story 2 — Group the analysis team by district and name the lead the Responsible analyst

**Story Title**
Group analysis-team reviewers by district and label the Responsible analyst

---

**Description**

As an internal reviewer,
I want the analysis team organized by district with the responsible reviewer clearly
named,
So that I can see at a glance who owns the permit and which reviewers belong to each
district, using the real role name rather than "Lead."

Members are grouped by review unit: the **Responsible analyst** on their own, then
**Headquarters**, then each district in the order it first appears. "Lead analyst" /
"Lead" is retired everywhere in favor of **Responsible analyst** (this is the
permit's Responsible Agent as shown on the roster).

**Roles affected:** All internal reviewers who view the roster; the permit-role
Responsible Agent (shown as the Responsible analyst).

**Out of scope:** Changing which user is the Responsible Agent, or the eligibility
rules for that permit-role (governed by single- vs multi-district span in
[`permissions-matrix.md`](permissions-matrix.md) §2).

---

**Acceptance Criteria**

**Happy path**
- Reviewers are grouped under unit headings in this order: **Responsible analyst**,
  **Headquarters**, then each district by first appearance (e.g. **North Coast
  Redwoods District**, **Mendocino District**).
- A District reviewer is grouped under their district; every other non-responsible
  reviewer is grouped under **Headquarters**.
- The responsible reviewer sits in their own **Responsible analyst** group and their
  row is visually distinguished from the others.

**State & status transitions**
- Each member's status shows an icon indicator that **names the status** —
  **"Complete"**, **"In progress"**, or **"Not started"** — followed **inline** (on
  the same line, after a "·" separator) by the dated context: **"Completed {date}"**
  when complete, **"Last opened {date}"** while in progress, and **"Added {date}"**
  when not started.
- A newly added member shows **"Not started · Added {today's date}"**.

**UI & field details**
- The word "Lead" / "Lead analyst" does not appear on the roster, the member's role,
  the profile, or the header review modal; the term used is **"Responsible analyst"**.

**Edge cases & constraints**
- The Responsible analyst is never grouped under a district or Headquarters, even if
  they also hold a district affiliation.

---

**Open questions**
- [ ] The three status dates currently reuse a single stored date, relabeled by
  status. In production, should these be distinct real timestamps — the date the
  member was added, the last time an in-progress reviewer opened the application, and
  the completion date?

---

## Story 3 — Reflect the recorded per-park district contact on the permit's Study areas

**Story Title**
Show each authorized park's recorded district contact in Study areas

---

**Description**

As an internal reviewer,
I want each authorized park in Study areas to show the district contact assigned to
it during review,
So that I see exactly who to coordinate with for each park, consistent with what the
review team recorded on the permit letter.

District contacts are assigned per park — a contact may cover a whole district or
only specific parks. The Study areas → **Authorized parks** section lists one row per
park and shows the contact(s) covering that park, matching what was recorded on the
Finalize wizard's step ② ("Finalize the letter"). This replaces the previous view
that showed a single research coordinator per district.

**Roles affected:** All internal reviewers who view the permit's Study areas tab.

**Out of scope:** Editing the district contacts — that is done on the Finalize
wizard's step ② and the Complete-review modal, per
[`stories-final-letter-district-contacts.md`](stories-final-letter-district-contacts.md).

---

**Acceptance Criteria**

**Happy path**
- The **Authorized parks** list shows one row per authorized park with the columns
  **"Park unit"**, **"District"**, and **"District contact"**.
- A park's **District contact** cell lists every contact covering that park — the
  district-wide contact(s) plus any contact scoped specifically to that park — each
  shown as a name and a mailto email link.
- The contacts shown match what the review team recorded on step ② of the Finalize
  wizard for this permit; before anything is recorded, the list falls back to the same
  default set the wizard seeds (the district lead as an all-parks contact, plus any
  published park-specialists whose parks are on the permit).

**State & status transitions**
- When contacts (or the authorized park set) are changed on the Finalize wizard, the
  Study areas list reflects the updated assignment for this permit.

**UI & field details**
- The **Collection sites** subsection is removed from Study areas (it was not a
  question on the application).
- A park with no assigned contact shows **"No contact assigned"**.

**Edge cases & constraints**
- A contact covering the whole district appears on every park row for that district;
  a park-scoped contact appears only on the parks it covers.
- A park is matched to a scoped contact regardless of unit abbreviation (e.g.
  "Prairie Creek Redwoods SP" matches a contact scoped to "Prairie Creek Redwoods
  State Park").

---

**Open questions**
- [ ] None — behavior mirrors the recorded step-② contacts.

---

## Story 4 — Mark the internal-only Overview sections consistently

**Story Title**
Mark Tags, Comments, and Analysis team as internal only

---

**Description**

As an internal reviewer,
I want the internal-only sections of the Overview tab clearly marked,
So that it is obvious which content is never shown to applicants or the public.

**Roles affected:** All internal reviewers who view the Overview tab.

**Out of scope:** The visibility rules themselves (which roles see these sections) —
unchanged by this story; this only adds the visible marker.

---

**Acceptance Criteria**

**UI & field details**
- The **Tags**, **Comments**, and **Analysis team** sections each display an
  **"Internal only"** marker (an eye-off icon with the label).
- On Tags and Comments the marker sits at the right of the section heading; on the
  Analysis team panel the marker is aligned to the right of the panel header.

**Edge cases & constraints**
- The marker is presentational only and does not change what any role can see or do.

---

**Open questions**
- [ ] None — presentational marker only.
