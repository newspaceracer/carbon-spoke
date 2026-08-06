# Study areas — Authorized parks contact table

Stories for the permit detail page's **Study areas → Authorized parks** section,
rewritten around a single **table with merged district cells**. This SUPERSEDES
Story 3 of
[`stories-analysis-team-and-study-area-contacts.md`](stories-analysis-team-and-study-area-contacts.md),
which described an earlier park-first, three-column layout that repeated the
district contact on every park row and never separated a park's own contact into
its own column.

**What changed vs. that story**

| Superseded Story 3 | These stories |
|---|---|
| Columns "Park unit", "District", "District contact" | Four columns: **District · District contact · Park unit · Park contact** |
| District-wide and park-scoped contacts listed together in one cell | Split into **two columns** — district-wide merged, park-scoped per row |
| "A contact covering the whole district appears on every park row" | Appears **once**, in a cell spanning the district's rows |
| A park with no contact shows "No contact assigned" | A park with no contact shows an **empty cell**; "No contact assigned" is reserved for a district with no district-wide contact |
| Copy-email not mentioned for these contacts | Every contact email carries a **copy control** |

**Read-only surface (used throughout):** this section DISPLAYS the contacts
recorded on the Finalize wizard's step ② ("Finalize the letter") — see
[`stories-final-letter-district-contacts.md`](stories-final-letter-district-contacts.md).
No story here adds editing to the Study areas tab.

Related:
[`stories-analysis-team-and-study-area-contacts.md`](stories-analysis-team-and-study-area-contacts.md)
(the analysis-team roster, where the copy-email control was first specified).

---

## Story 1 — Show authorized parks in one table with the district contact spanning its parks

**Story Title**
Show authorized parks in one table with merged district contact cells

---

**Description**

As an internal reviewer,
I want the authorized parks listed in one table where each district's contact spans
all of that district's parks,
So that I can see at a glance who covers a whole district versus who covers a single
park, without re-reading the same contact on every row.

District contacts are assigned per park on the Finalize wizard's step ②: a contact
may cover an entire district or only specific parks. Presenting the district-wide
contact once, in a cell that spans its district's rows, states that coverage
directly — repeating it on each row, or printing it only on the first row, both
misrepresent which parks it applies to.

**Roles affected:** All internal reviewers who can open the permit's Study areas
tab — System Admin, HQ Technical Reviewer, District Lead Technical Reviewer, and
District Assistant Technical Reviewer (user roles). The table renders identically
regardless of the viewer's permit-role (Responsible Agent, Supporting Agent, Second
Signer, or Not assigned).

**Out of scope:** Editing contacts or the authorized park set — both are done on the
Finalize wizard's step ② and the Complete-review modal, per
[`stories-final-letter-district-contacts.md`](stories-final-letter-district-contacts.md).
Row hover behavior — see Story 2. The copy-email control — see Story 3.

---

**Acceptance Criteria**

**Access & permissions**
- Every internal reviewer who can open the permit sees the table; it is **read-only**
  on this tab for all user roles and all permit-roles, including the Responsible
  Agent.
- The table renders in every permit status — **Draft**, **Waiting for review**,
  **Under review**, **Returned to submitter**, **Out for signature**, **Waiting for
  annual report**, **Active**, **Expired**, **Rejected**, and **Withdrawn**. Status
  changes its content only insofar as step ② has recorded contacts.

**Happy path**
- The **Authorized parks** section renders a single table with the columns
  **"District"**, **"District contact"**, **"Park unit"**, and **"Park contact"**, in
  that order.
- The table has **one row per authorized park unit**.
- Parks are grouped by district, and the districts appear in the order they are
  recorded on the permit.
- For each district, the **District** and **District contact** cells span all of that
  district's park rows.
- The **District contact** cell lists every contact covering the whole district —
  each as a name over a mailto email link.
- A park's **Park contact** cell lists only the contact(s) scoped specifically to
  that park.
- The contacts shown match what the review team recorded on step ② of the Finalize
  wizard for this permit.

**State & status transitions**
- When contacts or the authorized park set change on the Finalize wizard, the table
  reflects the updated assignment for this permit — including a district's row span
  growing or shrinking as parks are added or removed.
- Before anything is recorded on step ②, the table falls back to the same default set
  the wizard seeds: the district lead as an all-parks contact, plus any published
  park-specialists whose parks are on this permit.

**UI & field details**
- A park with no park-scoped contact shows an **empty** Park contact cell. It does
  **not** show "Covered by district contact" or any other filler.
- A district with no district-wide contact shows **"No contact assigned"** in its
  District contact cell.
- The merged District and District contact cells align to the **top** of their group.
- Each district's first row is separated from the district above it by a heavier rule
  than the rule between park rows.
- The **Collection sites** subsection does not appear in Study areas (it was not a
  question on the application).

**Edge cases & constraints**
- A district with exactly one park renders normally — its merged cells span that
  single row.
- A park is matched to a scoped contact regardless of unit abbreviation (e.g.
  "Prairie Creek Redwoods SP" matches a contact scoped to "Prairie Creek Redwoods
  State Park").
- A contact recorded as both district-wide and park-scoped appears once in the
  District contact cell, not twice.
- The same contact may appear as the district contact for one district and a park
  contact for another; each cell is resolved independently.
- The table has **no fixed height** and never scrolls vertically. It scrolls
  horizontally only when the viewport is too narrow to fit the four columns, and it
  scrolls within its own bounds so the page itself never scrolls sideways.

---

**Open questions**
- [ ] When a district has several district-wide contacts, is their order meaningful
      (e.g. primary lead first), or is any stable order acceptable?

---

## Story 2 — Highlight a district's full group when any of its rows or merged cells is hovered

**Story Title**
Highlight the whole district group on hover in the parks table

---

**Description**

As an internal reviewer,
I want hovering the parks table to highlight the row and the district contact that
applies to it,
So that I can trace which contact covers the park I am looking at without
mis-reading a merged cell as belonging to one row.

A merged cell belongs to the first row of its group in the underlying table
structure, so default row highlighting maps the relationship wrongly in both
directions: hovering a later park row leaves the district contact unlit, and hovering
the district contact lights only the first park. The relationship runs both ways and
the highlighting must say so.

**Roles affected:** All internal reviewers who can open the permit's Study areas tab.

**Out of scope:** Any click, selection, or navigation behavior on these rows — the
table is display-only and hovering carries no action.

---

**Acceptance Criteria**

**Happy path**
- Hovering a **park unit** or **park contact** cell highlights that park's row **and**
  its district's merged District and District contact cells.
- Hovering a **District** or **District contact** cell highlights **every row of that
  district**, including all of its park rows.
- Moving the pointer off the table clears all highlighting.

**UI & field details**
- Highlighting uses the same hover treatment as the rest of the table's rows — no
  separate colour or emphasis is introduced.

**Edge cases & constraints**
- Highlighting never crosses a district boundary: hovering any cell in one district
  leaves every other district unhighlighted, including the district immediately
  above or below.
- Because a district's merged cells physically sit alongside its later park rows,
  pointing at that area highlights the whole district group (per the rule above), not
  the single row beside it.
- Hovering carries no action and changes no record; the table remains read-only.

---

**Open questions**
- [ ] None — behavior is fully specified by the two hover rules above.

---

## Story 3 — Let reviewers copy any contact email from the parks table

**Story Title**
Allow copying a contact email from the authorized parks table

---

**Description**

As an internal reviewer,
I want to copy a district or park contact's email address from the parks table in one
click,
So that I can paste it into an email or calendar invite without retyping it or
opening my mail client.

This is the same copy affordance already specified for the analysis-team roster in
[`stories-analysis-team-and-study-area-contacts.md`](stories-analysis-team-and-study-area-contacts.md)
(Story 1). It differs in one respect: the parks table shows several people at once,
so the tooltip names whose address will be copied.

**Roles affected:** All internal reviewers who can open the permit's Study areas tab.

**Out of scope:** Emailing the contact from within the app, and any bulk "email all
contacts" action for this table.

---

**Acceptance Criteria**

**Happy path**
- Every contact shown in the **District contact** and **Park contact** columns
  displays their email as a mailto link with an adjacent copy control.
- Selecting the copy control places that contact's email address on the clipboard.
- A successful copy confirms with an **"Email copied"** toast whose body is the
  copied address.

**UI & field details**
- The copy control's tooltip reads **"Copy {contact name}'s email"** — naming the
  person, because the table shows several contacts at once.
- The copy control appears only when the contact has an email address on record; a
  contact with no email shows their name alone, with no mailto link and no copy
  control.
- The tooltip renders **over** the table, not inside it — opening a tooltip never
  adds a scrollbar to the table or changes its height.

**Notifications**
- No email is sent and no recipient is notified — the action only writes to the
  viewer's clipboard.

**Edge cases & constraints**
- If the browser refuses the clipboard write, the reviewer sees a
  **"Couldn't copy the email"** message with the guidance **"Select and copy the
  address manually."**, and the address remains selectable in the mailto link.
- Copying the same address repeatedly is allowed and confirms each time.
- Copying is available in every permit status, including the final statuses
  (**Expired**, **Rejected**, **Withdrawn**), because it neither reads nor changes
  permit state.

---

**Testing notes**

- **Test 1 — Named tooltip:** Open a permit whose district has two district-wide
  contacts. Hover each copy control in turn. Confirm each tooltip names that specific
  contact, and the two tooltips differ.
- **Test 2 — Copy from both columns:** Copy a district contact's address, then a
  park-scoped contact's address. Confirm each toast body shows the address just
  copied.
- **Test 3 — No layout shift:** Hover the copy control on the table's last row.
  Confirm the tooltip renders over the section and the table gains no scrollbar and
  does not change height.

---

**Open questions**
- [ ] Should the copy control also be offered for a contact's phone number, which the
      underlying contact record carries but this table does not display?

---

## Appendix — cross-cutting defects fixed alongside these stories

These are **not** Study-areas stories. They are app-wide defects found and fixed
while building the table, recorded here because they shipped in the same change.
Move them to a defect log or their own ticket if that suits the team better.

---

### Defect A — Pages scroll sideways by 32px

**Observed:** The `/`, `landing`, `districts`, and `permit` pages scrolled
horizontally by exactly 32px at every viewport width, on every tab.

**Cause:** The design system's reset sets `box-sizing: border-box` on the root and
`box-sizing: inherit` on everything else. That inherit chain breaks at every web
component: a page-level stylesheet cannot reach into a component's shadow DOM, so
the component's internal wrapper keeps the default `content-box`, and slotted
content inherits from *that* wrapper rather than from its own parent in the markup.
Every page's spine nests its content inside such a component, so the page grid
turned `content-box` and added its 16px left and right gutters ON TOP of a full-width
box — 2 × 16px = 32px.

**Fix:** Set `box-sizing: border-box` directly rather than inheriting it, which no
shadow boundary can interrupt. Only elements that were mis-inheriting `content-box`
change.

**Acceptance Criteria**
- No page scrolls horizontally at 768px wide or above.
- A section that is legitimately too wide for a narrow viewport (such as the parks
  table below 768px) scrolls **within its own bounds**; the page still does not.

**Known remaining issue (not fixed here):** at 480px and below, the permit page still
overflows by 16px. The cause is the six-item tab strip, not the page grid, and it is
present on every tab. Needs its own ticket.

---

### Defect B — Copy-email confirmation toast fires twice

**Observed:** On a page showing two or more surfaces with copy-email controls (the
permit detail page shows both the analysis-team roster and the parks table), one
click on a copy control raised the **"Email copied"** toast twice.

**Cause:** The shared copy handler guarded itself against double-installation with a
module-level flag. A page can load the same module more than once — once per script
bundle — and each copy carries its own flag, so each installed its own click
listener.

**Fix:** Guard on a flag stored on the page itself rather than in the module, so the
handler installs once no matter how many bundles import it.

**Acceptance Criteria**
- One click on any copy-email control raises exactly one toast, on any page and
  regardless of how many surfaces on that page offer the control.
