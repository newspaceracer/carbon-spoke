# District Administration — Jira Stories

Three stories covering who can administer a district, the rule that every
district must always have review coverage, and how changes on the console are
saved.

- **Story 1** — Scope District administration access to the user's role
- **Story 2** — Require a Technical Reviewer on every district
- **Story 3** — Save district changes with scoped, instant-apply persistence

The Technical Reviewer roles referenced below are the product's specific
Technical Reviewer sub-roles: **HQ Technical Reviewer** (statewide, across all
districts), **District Lead Technical Reviewer** (leads and signs off for a
district), and **District Assistant Technical Reviewer** (supports district
review without sign-off).

Related: the Admin-menu entry that opens this console — see
`stories-primary-navigation.md` (CSPS-XXX).

Related: requesting deactivation of a member's account from this console (a
district-scoped action that routes to a System Admin) — see
`stories-user-management.md` Story 4.

---

## Story 1 — Scope District administration access to the user's role

**Story Title**
Scope District administration access to the user's role

---

**Description**

As a Technical Reviewer or System Admin,
I want the District administration console to show only the districts I'm
authorized to manage,
So that I can maintain district information, members, and contacts for my
districts without seeing or changing others.

Access is determined by the signed-in user's account role: a System Admin and an
HQ Technical Reviewer administer every district; a District Lead Technical
Reviewer administers only the district(s) they lead. Everyone else has no access.

*Prototype note:* the prototype build simulates the signed-in role with a
developer-only identity switcher used for demos. In production, the acting role
is the signed-in user's actual account role — there is no in-product role picker.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (no access), Researcher (no
access), Public User (no access).

**Out of scope:** Editing a district's park roster (managed on the park roster
screen — read-only here). The primary-navigation entry point that surfaces this
console — see CSPS-XXX. The rule that a district must always have a Technical
Reviewer — see Story 2.

---

**Acceptance Criteria**

**Access & permissions**
- A System Admin can open District administration for every district.
- An HQ Technical Reviewer can open District administration for every district.
- A District Lead Technical Reviewer can open District administration only for
  the district(s) they lead.
- A District Assistant Technical Reviewer, a Researcher, and a Public User
  cannot open District administration.
- A user authorized for no districts sees an explanatory no-access message in
  place of the console, and is not shown an entry point to it.

**Happy path — district selection**
- The console is a single screen scoped to one district at a time.
- A user authorized for more than one district sees a District selector listing
  only their authorized districts.
- The District selector is hidden when the user is authorized for exactly one
  district; the console loads that district directly.
- Changing the selected district re-scopes the entire console — district
  information, members, and contacts — and updates the district name in the
  page header.

**Role-scoped member management**
- Within an authorized district, a District Lead Technical Reviewer can add and
  edit District Assistant Technical Reviewers but cannot assign or reassign the
  District Lead Technical Reviewer role (a System Admin / HQ appointment).
- A System Admin can assign either the District Lead or the District Assistant
  Technical Reviewer role.

**UI & field details**
- The read-only Districts directory remains separately available to all staff
  for contact lookup and is not gated by this story.

**Edge cases & constraints**
- The console does not let a user select or load a district outside their
  authorization, including via a direct link.

---

**Testing notes**

- **Test 1 — Access matrix:** For each role (System Admin, HQ Technical
  Reviewer, District Lead Technical Reviewer, District Assistant Technical
  Reviewer, Researcher, Public User), open District administration and confirm
  access is granted or denied per the AC.
- **Test 2 — Multi-district lead:** Assign a District Lead Technical Reviewer as
  lead of two districts. Confirm the District selector lists exactly those two
  and switching between them re-scopes the console and header.
- **Test 3 — Single-district lead:** Assign a lead to exactly one district.
  Confirm the selector is hidden and the console loads that district directly.
- **Test 4 — Direct link:** As a District Lead Technical Reviewer, request the
  console for a district they do not lead. Confirm the agreed direct-link
  behavior (see Open questions).

---

**Open questions**
- [ ] What is the behavior when an authorized user follows a direct link to a
  district outside their authorization — redirect to the directory, a no-access
  message, or silently scope to their first authorized district?
- [ ] Should an HQ Technical Reviewer have full edit rights (information,
  members, contacts) across all districts, or read-only within districts they do
  not lead — reserving edits for System Admin and the District Lead?
- [ ] Is there an upper bound on how many districts one District Lead Technical
  Reviewer may lead?

---

## Story 2 — Require a Technical Reviewer on every district

**Story Title**
Require a Technical Reviewer on every district

---

**Description**

As a System Admin,
I want every district to always have at least one assigned Technical Reviewer,
So that every permit in a district has an owner and no district is left without
review coverage.

The District Lead Technical Reviewer is the district's owning reviewer — the
lead analyst who signs off on district decisions and to whom permits in the
district auto-assign. This story makes an assigned Technical Reviewer a required,
always-present condition of every district and prevents any action that would
leave a district without one.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer.

**Out of scope:** The permit auto-assignment algorithm itself. Role-scoped access
to the console — see Story 1.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin (and HQ Technical Reviewer, per Story 1) can assign or
  replace a district's District Lead Technical Reviewer.

**Happy path & constraints**
- Every district has at least one assigned Technical Reviewer at all times, and
  specifically an assigned District Lead Technical Reviewer.
- The system blocks removing the last Technical Reviewer from a district: the
  Remove action is prevented with an explanatory message naming the requirement.
- Replacing the District Lead Technical Reviewer requires naming the incoming
  lead in the same action — the district is never left with zero leads at any
  point.
- Removing a District Assistant Technical Reviewer is allowed as long as a
  District Lead Technical Reviewer remains on the district.

**State & status transitions**
- A district with no assigned Technical Reviewer is flagged as needing one in
  both District administration and the read-only Districts directory.
- Permits in a district cannot auto-assign until that district has an assigned
  District Lead Technical Reviewer.

**Edge cases & constraints**
- If a district is found with no Technical Reviewer (e.g. through data import),
  it is flagged and a System Admin is prompted to assign one; the flag clears
  once a District Lead Technical Reviewer is assigned.

---

**Testing notes**

- **Test 1 — Block last removal:** In a district whose only Technical Reviewer is
  its District Lead, attempt to remove that member. Confirm removal is blocked
  with the explanatory message.
- **Test 2 — Replace lead:** Replace a district's District Lead Technical
  Reviewer with another user. Confirm the change requires naming the new lead and
  never produces an interim state with no lead.
- **Test 3 — Assistant removal allowed:** In a district with a lead and one
  assistant, remove the assistant. Confirm removal succeeds and the district
  remains valid.
- **Test 4 — Flagged district:** Seed a district with no Technical Reviewer.
  Confirm it is flagged in both District administration and the Districts
  directory, and that permits in it cannot auto-assign until a lead is assigned.

---

**Open questions**
- [ ] Does the minimum require specifically a District Lead Technical Reviewer,
  or does any Technical Reviewer (lead or assistant) satisfy "at least one"?
- [ ] When a lead is removed or leaves, must a replacement be chosen in the same
  action, or may the district be temporarily flagged as "needs a lead"?
- [ ] Is creating a new district in scope anywhere, and if so must a District
  Lead Technical Reviewer be assigned as part of creation?
- [ ] Should a System Admin be notified when a district drops below one Technical
  Reviewer? If so, what is the email body copy?

---

## Story 3 — Save district changes with scoped, instant-apply persistence

**Story Title**
Save district changes with scoped, instant-apply persistence

---

**Description**

As a district administrator,
I want member and default-signer changes to save the moment I confirm them, and the
district-information form to have its own explicit save,
So that it's always clear what has been saved and I never lose a change I already
confirmed.

The console holds three editable areas that save differently: **members** and the
**default signer** are committed the instant their modal (or removal) is confirmed;
the **district information** form is edited freely and committed by an explicit
**Save changes** button scoped to that form only.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer (whoever can administer the district).

**Out of scope:** Who may administer a district and the role-scoped member rules —
see Story 1. The rule that a district must keep a Technical Reviewer — see Story 2.
The default-signer picker itself — see `stories-roles-permissions.md` Story 7.

---

**Acceptance Criteria**

**Happy path — instant-apply areas**
- Adding, editing, or removing a member saves immediately when the member modal (or
  the remove confirmation) is confirmed — no separate save step is required.
- Setting, changing, or removing the default signer saves immediately when its modal
  (or the Remove action) is confirmed.
- Each of these confirmations shows a success message (see Notifications).

**Happy path — district-information form**
- The **Save changes** button governs only the District-information form (office
  address, phone, email).
- **Save changes** is **disabled until a field in that form changes**, and returns
  to disabled after a successful save.
- Saving shows a success message and persists the office details.

**UI & field details**
- The **Save changes** and **Cancel** actions sit directly beneath the
  District-information fields (aligned to the field column), not at the far edge of
  the page or below unrelated sections.
- The scope tile appears only when there is more than one district to switch
  between; there is no standing explanatory help text about which districts a role
  may edit.

**Notifications**
- Every successful action (member added / updated / removed, default signer saved /
  removed, district information saved) confirms with a **transient success toast**
  (top-right, auto-dismissing, announced politely to assistive tech), consistent
  with success confirmations elsewhere in the app.

**Edge cases & constraints**
- Because members and the default signer are already persisted, navigating away
  (Cancel / leaving the page) without pressing Save changes does not discard them;
  it only discards unsaved edits to the District-information fields.
- **Cancel** returns to the district detail screen.

---

**Testing notes**

- **Test 1 — Instant-apply members:** Add a member, then reload the page without
  pressing Save changes. Confirm the member is still present.
- **Test 2 — Dirty-tracked save:** Load the console and confirm **Save changes** is
  disabled. Edit a district-information field and confirm it enables; save and
  confirm it disables again.
- **Test 3 — Scope isolation:** Edit a district-information field but do not save;
  add a member (which saves). Reload and confirm the member persisted while the
  unsaved field edit did not.

---

**Open questions**
- [ ] Should **Cancel** also discard in-progress (unsaved) district-information field
  edits explicitly, or simply navigate away?
- [ ] Should there be any unsaved-changes warning when leaving with pending
  district-information edits?
