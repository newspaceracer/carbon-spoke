# Final Letter — District Contacts — Jira Stories

Two stories covering how district contacts appear on, and are edited for, the
permit letter's **Contact List for Parks** (the "Finalize the letter" step of the
review wizard).

- **Story 1** — Manage district contacts on the letter as a person + park scope
- **Story 2** — Require a contact for every district on the letter before finalizing

The Technical Reviewer sub-roles referenced are the same as in
`stories-district-administration.md`: **HQ Technical Reviewer**, **District Lead
Technical Reviewer**, **District Assistant Technical Reviewer**. The permit-role
layer (**Responsible Agent**, **Supporting Agent**) is the same as in
`stories-roles-permissions.md`. In this feature the permit's **Responsible Agent
(RA)** — and a **System Admin** acting on the permit — is the "lead" who edits the
letter directly; a **Supporting Agent (SA)** assigned to a district raises change
requests the RA approves.

---

## Story 1 — Manage district contacts on the letter as a person + park scope

**Story Title**
Manage permit-letter district contacts as a person plus park scope

---

**Description**

As the permit's Responsible Agent (or a System Admin),
I want each district on the permit letter to carry a plain list of contacts —
each one a person and the parks they cover — that I can add to, edit, and remove,
So that every applicant knows exactly who to notify before working in any
authorized park unit.

The letter's **Contact List for Parks** replaces the earlier model of a single
"primary" contact plus auto-attached "park" and "added" contacts (and the
Primary / Park contact / Added labels those carried). Now a district is simply a
flat list of contacts, and a contact has only two parts: **who** (a person from
that district's user list) and **scope** (the parks they cover — *all parks on
this permit*, or *specific parks*). "Covers all parks" is what used to be called
the district's main/primary contact — the same thing, stated once by its scope.

Each district's list is **seeded** from the district's roster — the district lead
as an all-parks contact, plus any members the district has designated as
point-of-contact park specialists on the district admin page (`/manage-district`),
scoped to their parks — and is then fully editable per permit. Contacts can only
be chosen from the district's existing users (no free-typed people).

Two people edit the list, on two surfaces:
- The **RA** (lead) edits every district directly, on the **Finalize the letter**
  step, through a single contact-editor modal (person + scope together).
- A **SA** edits only the district they belong to, inline in their **Complete
  review** modal; their changes are **change requests** the RA accepts or declines
  — they do not appear on the letter until accepted.

*Prototype note:* the prototype build simulates the signed-in role with a
developer-only identity switcher, and the per-permit permit-role with a
constrained per-permit control. In production, the acting role is the signed-in
user's actual account role and their assigned permit-role.

**Roles affected:** Responsible Agent (RA), Supporting Agent (SA), System Admin,
HQ Technical Reviewer / District Lead Technical Reviewer / District Assistant
Technical Reviewer (as the users who hold RA/SA), Researcher / Principal
Investigator (PI) (letter recipients — read the printed list, do not edit it).

**Out of scope:** Designating which members are default point-of-contact park
specialists and their default park scope — managed on the district admin page
(`stories-district-administration.md`). The completeness rule that blocks
finalizing when a district has no contact — **Story 2** below. Generating and
sending the letter itself (the `Send for signature` flow) and its body copy —
existing behavior, unchanged here.

---

**Acceptance Criteria**

**Access & permissions**
- On the **Finalize the letter** step, the Responsible Agent (or a System Admin)
  can add, edit, and remove contacts for **every** district on the permit, applied
  directly.
- A Supporting Agent can add, edit, and remove contacts only for the district they
  belong to, and only from their **Complete review** modal; every such action
  becomes a change request awaiting the RA. Districts they do not belong to show
  "Not your district — managed by its reviewer." and are read-only.
- While the permit is **Out for signature** (letter sent) the contact list is
  read-only for all roles, with a locked notice shown.
- The Researcher / PI never edits the list; they see the resulting contacts on the
  generated letter only.

**Happy path**
- Each contact row shows the person's name and details, a scope line reading
  "Covers all parks on this permit" or "Covers: <park name(s)>", and an **Edit**
  and **Remove** control.
- The **Edit** and **Remove** controls are icon buttons (a pencil and a trash icon)
  with hover tooltips "Edit" and "Remove" (for the SA, "Request change" and
  "Request removal").
- **Add contact** opens the contact editor with a person picker (the district's
  users not already on the list) and the scope control; the RA's save adds the
  contact directly.
- **Edit** opens the same editor pre-filled with the contact's person and scope;
  saving changes the person and/or the scope in one action.
- **Add contact** is available for every district on the permit — including
  districts that previously offered no one to add.

**UI & field details**
- Each district's contacts sit under a single "<district name> contacts" header,
  with the **Add contact** control (a tertiary button) inline on the right of that
  header. The district name and its parks are not repeated as a
  separate header above the list — that context lives on the permit detail /
  study-area surfaces.
- The scope control is labeled "Applies to" with two radio options: "All parks on
  this permit" and "Specific parks". Choosing "Specific parks" reveals a checkbox
  list of the district's parks on this permit; choosing none collapses back to all
  parks.
- On the printed letter, contacts whose scope is all parks are listed once under
  "For all authorized park units — notify:"; contacts scoped to specific parks are
  listed inline under each park they cover as "<park name> — also notify:", never
  repeated in the all-parks block. The block ends with "Authorized park units: …".
- A district with no contacts shows "No contacts on the letter for this district
  yet." in the editor.

**State & status transitions**
- The list is editable while the permit is **Under review** (review started) and on
  the finalize wizard; it does **not** lock when the RA advances past the Finalize
  the letter step.
- The list locks only when the letter is sent and the permit moves to **Out for
  signature**; it unlocks if the permit is reset back to review.

**Change-request workflow (Supporting Agent)**
- A SA's add / edit / remove for their district is recorded as a pending request,
  shown to the RA under "Pending change requests" with **Accept** and **Decline**,
  and to the SA under "Your change requests · pending lead approval" with
  **Withdraw**.
- A pending request does not change the printed letter until the RA accepts it;
  Decline and Withdraw discard it.
- Repeated inline edits by the SA to the same contact collapse into a single
  pending request (the latest desired person + scope), not one request per change.

**Edge cases & constraints**
- Contacts can only be chosen from the district's user list; there is no free-text
  contact entry.
- A person already on a district's list is not offered again in that district's Add
  picker.
- Removing every contact from a district is allowed, but blocks finalizing the
  letter (see Story 2).

---

**Testing notes**

- **Test 1 — RA direct edit:** As the RA on Finalize the letter, edit a contact to
  a different person and scope it to one specific park. Confirm the row and the
  letter update immediately, moving that person from the all-parks block to the
  chosen park's "— also notify:" group.
- **Test 2 — Add in a second district:** As the RA, confirm every district on the
  permit offers **Add contact** and a non-empty person picker; add one and confirm
  it prints on the letter.
- **Test 3 — SA request → RA accept:** As a SA for their district, edit a contact
  inline; confirm one pending request appears and the letter is unchanged. Switch
  to the RA; Accept the request and confirm the letter now reflects it.
- **Test 4 — Lock on send:** Send the letter (permit → Out for signature) and
  confirm the contact editor is read-only with a locked notice.

---

**Open questions**
- [ ] When a permit's parks change after the contact list is seeded, should the
  list re-derive (re-pull district specialists whose parks are now in/out of the
  permit), or stay as edited? (Current behavior: seeded once, then user-owned.)
- [ ] Should removing the district lead / the last all-parks contact prompt a
  confirmation, or is the Story 2 finalize block sufficient?
- [ ] For permits already edited under the previous primary/park/added model, is a
  one-time migration to the new person+scope list required, or is re-seeding from
  the roster acceptable?

---

## Story 2 — Require a contact for every district on the letter before finalizing

**Story Title**
Require every permit district to have a letter contact before finalizing

---

**Description**

As the permit's Responsible Agent,
I want to be prevented from finalizing or sending the letter while any district
with authorized parks has no contact,
So that the applicant is never issued a letter that fails to name who to notify
for an authorized park unit.

*Prototype note:* the prototype build simulates the signed-in role with a
developer-only identity switcher, and the per-permit permit-role with a
constrained per-permit control.

**Roles affected:** Responsible Agent (RA), System Admin (as RA), Supporting Agent
(SA) (indirectly — resolves the gap by contributing a contact request the RA
accepts).

**Out of scope:** Adding, editing, and removing the contacts themselves —
**Story 1**. The rule is evaluated only against districts that have parks on this
permit; district administration is unchanged.

---

**Acceptance Criteria**

**Access & permissions**
- The rule is enforced for the RA (and System Admin) at the finalize and send
  actions; it does not add any capability for other roles.

**Happy path**
- When every district that has authorized parks on the permit has at least one
  contact, **Finalize letter** advances to Review & send and **Send for signature**
  proceeds normally.

**State & status transitions**
- Advancing from the **Finalize the letter** step to **Review & send**, and the
  **Send for signature** action (permit → Out for signature), are both blocked
  while any qualifying district has zero contacts.

**Edge cases & constraints**
- A district with no authorized parks on the permit is exempt from the rule (it
  prints nothing on the letter).
- On a blocked attempt, the wizard stays on / returns to the **Finalize the letter**
  step, scrolled to the first offending district, and shows a warning notification.
- The warning notification title is "Add a contact for <district name(s)>" with the
  supporting line "Every district with authorized parks needs a contact on the
  letter." and is presented as an alert (not a success message).
- The empty district's editor shows "No contacts on the letter for this district
  yet." as a passive cue in addition to the block.

**Notifications**
- No email is sent; the block surfaces only as the in-app warning notification
  described above.

---

**Testing notes**

- **Test 1 — Blocked finalize:** As the RA, remove all contacts from one district,
  then click **Finalize letter**. Confirm the step does not advance, the warning
  names that district, and the view scrolls to it.
- **Test 2 — Cleared block:** Add a contact back to that district, then click
  **Finalize letter**. Confirm it advances to Review & send.
- **Test 3 — Blocked send via deep link:** Navigate directly to Review & send with
  an empty district and click **Send for signature**. Confirm the send modal does
  not open and the RA is returned to Finalize the letter with the warning.
- **Test 4 — Exempt district:** Remove all of a district's parks from the permit so
  it has no authorized parks, and confirm it no longer blocks finalizing even with
  no contact.

---

**Open questions**
- [ ] Should the **Finalize letter** button be visibly disabled while a district is
  empty (with an explanatory tooltip), in addition to the on-click block and
  warning?
- [ ] Is a single contact per district sufficient, or should any district with more
  than one authorized park additionally warn when no contact covers a given park?
