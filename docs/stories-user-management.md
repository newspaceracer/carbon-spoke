# User Management — Jira Stories

Five stories covering the System Admin Users console and the account-lifecycle
work that spans it and the District administration console:

- **Story 1** — Separate internal and public users into two directories
- **Story 2** — Edit a user's name and contact details from the Users console
- **Story 3** — Activate or deactivate a user account
- **Story 4** — Request account deactivation from the District administration console
- **Story 5** — Invite a member to a district with their role pre-granted

The Technical Reviewer roles referenced below are the product's specific
sub-roles: **HQ Technical Reviewer** (statewide, across all districts),
**District Lead Technical Reviewer** (leads and signs off for a district), and
**District Assistant Technical Reviewer** (supports district review without
sign-off). **Researcher** is a member of the public who applies for permits — a
"public user" — distinct from every internal staff role.

The Users console (`/users`) is reachable by a **System Admin only**. The District
administration console (`/manage-district`) is reachable by a System Admin, an HQ
Technical Reviewer, and a District Lead Technical Reviewer (scoped to the districts
they lead).

Related: District administration console — see `stories-district-administration.md`.
Account role labels and the two-layer actor model — see `stories-roles-permissions.md`
and `docs/permissions-matrix.md`.

---

## Story 1 — Separate internal and public users into two directories

**Story Title**
Separate internal and public users into two directories

---

**Description**

As a System Admin,
I want the Users console to list internal staff accounts and public (researcher)
accounts in two separate tables,
So that I can manage each population on its own terms without conflating agency
reviewers with members of the public.

Internal accounts are agency staff and carry a global account role and areas of
expertise. Public accounts are researchers who apply for permits; they carry no
agency role, no expertise, and no organization on the roster.

**Roles affected:** System Admin (only role with access to the Users console).
Accounts listed: all internal reviewer roles (HQ Technical Reviewer, District Lead
Technical Reviewer, District Assistant Technical Reviewer, System Admin) and
Researchers (public users).

**Out of scope:** Editing a user's name, contact, or role — see Story 2. Setting a
user active/inactive — see Story 3. Inviting a new internal user (existing invite
flow) and the role-change request inbox — unchanged by this story.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can open the Users console; every other role (HQ Technical
  Reviewer, District Lead/Assistant Technical Reviewer, Researcher, Pending user,
  logged out) is denied access and routed away.

**Happy path**
- The Users console shows an **"Internal users"** table and a separate **"Public
  users"** table; a user never appears in both.
- The **Internal users** table shows the columns: **User**, **Status**, **Account
  role**, **Expertise**, **Affiliation**, **Actions**.
- The **Public users** table shows the columns: **User**, **Account role**, **Last
  seen**, **Actions**.
- Each table shows a count of its rows in the section header.

**UI & field details**
- The Public users table does **not** show an organization column or a phone
  column.
- The **Last seen** column shows a relative time (e.g. "6 hr ago", "3 days ago").
- The **User** cell in both tables shows the person's name with their email
  beneath it.

**Edge cases & constraints**
- A public account carries no agency account role and no areas of expertise, so
  those columns are absent from the Public users table by design.

---

**Open questions**
- [ ] Should an HQ Technical Reviewer also be able to open the Users console
  (read-only or full), or is it strictly System Admin?
- [ ] What is the exact "last seen" precision and rounding the product wants
  (minutes/hours/days, and how far back before it shows a date)?
- [ ] Is the Public users table paginated or searchable for real volumes, or is a
  single scrolling table acceptable for launch?

---

## Story 2 — Edit a user's name and contact details from the Users console

**Story Title**
Edit a user's name and contact details from the Users console

---

**Description**

As a System Admin,
I want to correct a user's name and contact details from the Users console,
So that account records stay accurate — while the email that verifies the account
at sign-in stays locked.

Email is the account's verified identity (managed through the sign-in provider,
Auth0), so it is never editable in the console. A public user manages their own
phone number, so the admin sees it but cannot change it.

**Roles affected:** System Admin (editor). Accounts edited: all internal reviewer
roles and Researchers (public users).

**Out of scope:** Changing an account's role or activation state — see Story 3 and
Story 4. A user editing their own profile — existing profile flow, unchanged. Email
change / re-verification — not supported in this story.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can open the **Edit user** modal and save changes.

**Happy path**
- Each row in both the Internal users and Public users tables has an **Edit**
  action that opens the **"Edit user"** modal.
- The modal shows separate **First name** and **Last name** fields, both editable.
- Saving with **Save changes** updates the name everywhere the account is shown
  (both console tables, district member rosters, permit rows).

**UI & field details**
- **Email** is shown read-only, with the note **"Verified at sign-in — can't be
  changed here."**
- For an **internal** account, **Phone** is an editable field.
- For a **public** account, **Phone** is shown read-only, with the note **"Managed
  by the account holder — can't be changed here."**
- The account name is stored as first name and last name separately; the full
  display name is composed from the two.

**State & status transitions**
- Editing name or phone does not change the account's role, activation state, or
  invitation status.

**Edge cases & constraints**
- Both **First name** and **Last name** are required; saving with either blank
  shows an inline field error and blocks the save.
- The email field cannot be edited, focused for editing, or cleared under any
  role or account state.

---

**Open questions**
- [ ] If a name change must propagate to the sign-in provider (Auth0) or to any
  already-sent documents, is that in scope or handled separately?
- [ ] Should a System Admin be able to edit a public user's phone in any
  circumstance (e.g. a support override), or is it always account-holder-only?
- [ ] Is there an audit-log requirement for admin edits to another user's identity?

---

## Story 3 — Activate or deactivate a user account

**Story Title**
Activate or deactivate a user account

---

**Description**

As a System Admin,
I want to set any account to active or inactive,
So that a person who has left — or a returning one — has access that matches their
real status, without losing the account's role and history.

Deactivation revokes sign-in access; it does **not** delete the account or change
its role. An internal account carries an **Active / Inactive** status that is
separate from its reviewer role (a deactivated District Lead is still a District
Lead, just switched off). A public account expresses the same idea as its account
role, which is one of exactly two values: **Public user** or **Inactive**.

**Roles affected:** System Admin (sets the state). Accounts affected: all internal
reviewer roles and Researchers (public users). A deactivated user of any role can
no longer sign in.

**Out of scope:** How a District Lead requests a deactivation and how the admin
approves it — see Story 4. Automated deactivation based on inactivity — not covered.
Account deletion — not supported.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can change an account's active/inactive state.

**Happy path — internal account**
- The **Edit user** modal for an internal account shows an **Account status**
  control with the options **Active** and **Inactive**.
- Setting it to **Inactive** and saving deactivates the account; setting it back to
  **Active** reactivates it.

**Happy path — public account**
- The **Edit user** modal for a public account shows an **Account role** control
  with exactly two options: **Public user** and **Inactive**.
- Selecting **Inactive** deactivates the account; selecting **Public user**
  reactivates it.

**State & status transitions**
- Deactivating an account preserves its account role, expertise, district
  memberships, and history; only sign-in access is revoked.
- A deactivated user cannot sign in and cannot exercise any permit-role,
  district-membership, or review capability until reactivated.

**UI & field details**
- In the Internal users table **Status** column, a deactivated account reads
  **Inactive** (shown as an icon + label, not by color alone) and takes precedence
  over the invited/active invitation state.
- In the Public users table **Account role** column, a deactivated account reads
  **Inactive**; an active one reads **Public user**.

**Edge cases & constraints**
- Deactivation is reversible: reactivating restores access with the prior role and
  data intact.
- A district member who is deactivated remains listed on their district roster
  until separately removed (see Story 4) — deactivation and roster removal are
  independent.

---

**Notifications**
- Whether the affected user (and/or their District Lead) receives an email when
  their account is deactivated or reactivated is an open question below.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so any deactivation email can be
  forwarded for verification. Do not test against real user email addresses in QA.
- **Test 1 — Deactivate then verify access:** As a System Admin, set an internal
  reviewer to **Inactive**, save, and confirm the account can no longer sign in and
  reads **Inactive** in the Internal users table.
- **Test 2 — Reactivate:** Set the same account back to **Active**, save, and confirm
  sign-in works and the prior role/expertise/memberships are intact.

---

**Open questions**
- [ ] Does deactivation revoke an active session immediately, or take effect on the
  next sign-in attempt?
- [ ] Is any email sent to the user (and/or their District Lead) on deactivation or
  reactivation? If so, what is the exact body copy?
- [ ] Should a deactivated internal reviewer be auto-removed from, or flagged on,
  their district rosters and any permits they hold a permit-role on?
- [ ] Are there any accounts that cannot be deactivated (e.g. the last remaining
  System Admin)?

---

## Story 4 — Request account deactivation from the District administration console

**Story Title**
Request account deactivation from the District administration console

---

**Description**

As a District Lead Technical Reviewer,
I want to ask a System Admin to deactivate a member's account when that person
leaves,
So that a departing member loses system access even though deactivating an account
is an admin-held, agency-wide action beyond my district's scope.

Removing a member from a district is district-scoped and done in place; deactivating
their **account** is separate and global, so a District Lead **requests** it. The
request lands in a System Admin inbox on the Users console; approving it deactivates
the account (Story 3). Removing a member from a district and requesting deactivation
are two distinct actions — a member can be removed without being deactivated (e.g. a
transfer) and vice versa.

**Roles affected:** District Lead Technical Reviewer, HQ Technical Reviewer, and
System Admin can raise a request from the District administration console (whoever
can manage that district). System Admin reviews and decides. Any internal account
referenced as a district member can be the subject of a request.

**Out of scope:** The mechanics of the active/inactive state itself — see Story 3.
Removing a member from a district (existing "Remove from district" action) —
unchanged except for where it now lives in the row menu. Deactivating a public
(researcher) account — not raised from the district console.

---

**Acceptance Criteria**

**Access & permissions**
- The District administration console is reachable by a System Admin, an HQ
  Technical Reviewer, and a District Lead Technical Reviewer (scoped to the
  districts they lead); only these roles can raise a deactivation request.
- Only a System Admin can approve or deny a deactivation request.

**Happy path — raising the request**
- Each district member row has an **Edit** action inline and a **"More actions"**
  overflow menu containing **"Remove from district"** and **"Request account
  deactivation"**.
- **"Request account deactivation"** opens a modal that states an admin completes
  the deactivation and offers an optional **"Reason (optional)"** field; **"Send
  request"** submits it.
- On submit, a confirmation notice **"Deactivation requested"** appears, and the
  member's overflow item changes to a disabled **"Deactivation requested"**.

**Happy path — admin decision**
- The Users console shows an **"Account deactivation requests"** section listing
  each pending request with the columns **User**, **Requested by** (name and the
  district it was raised from), **Reason**, and **Actions**.
- The admin can **Deactivate** (approve), which sets the account to Inactive
  (Story 3) and removes the request from the inbox with an **"Account deactivated"**
  confirmation.
- The admin can **Deny**, which closes the request (after a confirmation), leaves
  the account active, and removes it from the inbox.

**State & status transitions**
- Submitting a request does **not** change the account's status or the member's
  district membership; only an admin approval deactivates the account.
- Approving a request deactivates the account but does **not** remove the person
  from their district roster.

**UI & field details**
- The **"Request account deactivation"** overflow item is disabled and reads
  **"Deactivation requested"** while a request for that account is pending, and
  **"Account already inactive"** when the account is already deactivated.
- Removing a member from a district uses the existing **"Remove from district"**
  confirmation and is independent of any deactivation request.

**Edge cases & constraints**
- Re-submitting a request for the same account while one is already pending
  replaces it rather than creating a duplicate.
- A denied request can be raised again later.

---

**Notifications**
- Whether the System Admin is emailed when a request is submitted, and whether the
  requesting lead is emailed when it is decided, are open questions below.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so any request/decision email can be
  forwarded for verification. Do not test against real user email addresses in QA.
- **Test 1 — Request then approve (cross-console):** As a District Lead, request
  deactivation of a member; confirm the row item flips to **"Deactivation
  requested"**. As a System Admin, open the Users console, approve the request in
  **"Account deactivation requests"**, and confirm the account reads **Inactive**.
- **Test 2 — Deny leaves account active:** Raise a request, then **Deny** it as
  admin; confirm the account stays active and the request can be raised again.
- **Test 3 — Remove vs deactivate are independent:** Remove a member from a
  district and confirm their account is unaffected; separately request and approve
  a deactivation and confirm district rosters are unchanged by it.

---

**Open questions**
- [ ] Is the System Admin notified by email (or in-app) when a deactivation request
  is submitted? If email, what is the body copy?
- [ ] Is the requesting District Lead notified when the request is approved or
  denied? If email, what is the body copy?
- [ ] Should a District Lead be prevented from requesting deactivation of their own
  account, or of another System Admin / HQ Technical Reviewer?
- [ ] Should approving a deactivation prompt the admin to also remove the person
  from their district rosters and reassign any permits they own, or are those
  deliberately left as separate follow-up actions?

---

## Story 5 — Invite a member to a district with their role pre-granted

**Story Title**
Invite a member to a district with their role pre-granted

---

**Description**

As a District Lead Technical Reviewer,
I want to invite a new person onto my district and assign the district role they
should hold at the same time,
So that when they create their account and sign in for the first time they already
have the correct district-scoped access, with no separate admin step.

A district member role **is** a district-scoped account role, so choosing it on the
invite grants it immediately (before first login) rather than as a later admin
action. The invitee is created in an **invited** state and becomes **active** when
they accept and sign in for the first time; the pre-granted role is already attached.

**Roles affected:** District Lead Technical Reviewer (invites into their own
district, can appoint an assistant only), HQ Technical Reviewer and System Admin
(invite into any district, can appoint a lead or an assistant). The invitee becomes
a District Lead or District Assistant Technical Reviewer scoped to that district.

**Out of scope:** Inviting a global (HQ Technical Reviewer / System Admin) or public
(Researcher) account — done from the Users console, not a district. The active/inactive
state and deactivation flow — see Story 3 and Story 4. Adding an **existing** account
as a district member (that member already has an account and role) — unchanged.

---

**Acceptance Criteria**

**Access & permissions**
- The District administration console is reachable by a System Admin, an HQ
  Technical Reviewer, and a District Lead Technical Reviewer (scoped to the
  districts they lead); only these roles can invite a member.
- A District Lead can appoint only a **District assistant technical reviewer**; an
  HQ Technical Reviewer or System Admin can appoint a **District lead technical
  reviewer** or a **District assistant technical reviewer**.

**Happy path**
- The Members section's **"Add member"** action opens a modal offering to add an
  **existing account** or **invite a new user**.
- In **invite new user** mode, the inviter enters the person's **First name**,
  **Last name**, **Email**, and optional **Phone**, and picks a district **role**
  (scoped to what their own role may appoint).
- On save, the person is created as an invited account, added to the district's
  member roster, and **granted the chosen district role for this district
  immediately** — no further admin action is required to assign it.

**State & status transitions**
- The invited account is created with status **Invited** and carries the district
  role from the moment of invitation.
- When the invitee accepts and signs in for the first time, the account becomes
  **Active** with the pre-granted district role already in effect; the role is not
  re-assigned at that point.

**UI & field details**
- In **existing account** mode, the selected user's name, email, and phone appear as
  a **read-only** identity card with the note **"These details come from the user's
  account — only the user or an admin can change them, not this page."** — the inviter
  cannot edit account identity from this modal.
- The role choices in the invite modal are limited to the roles the inviter is
  allowed to appoint (a District Lead sees only **District assistant technical
  reviewer**).
- After the invite, the new member appears in the district's **Members** table, and
  the account appears in the **Internal users** table of the Users console showing
  the pre-granted **Account role**, the district as **Affiliation**, and **Invited**
  status.

**Edge cases & constraints**
- A district may have only one **District lead technical reviewer**; attempting to
  add a second lead is blocked with an explanation before any invite is created (no
  orphaned account is left behind).
- **First name**, **Last name**, and **Email** are required to invite; a missing
  field shows an inline error and blocks the invite.
- The same pre-grant behavior applies to the Users console **"Invite user"** flow —
  an invited account carries its assigned role before first login regardless of
  where it was invited from.

---

**Notifications**
- Whether the invitee receives an invitation email (and its body copy), and whether
  the district lead / admin is notified, are open questions below.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so any invitation email can be forwarded
  for verification. Do not test against real user email addresses in QA.
- **Test 1 — Lead invites an assistant (pre-grant):** As a District Lead, invite a
  new user and confirm the role picker offers only **District assistant technical
  reviewer**. Save, then as a System Admin open the Users console and confirm the new
  account shows **District assistant technical reviewer**, the district as
  affiliation, and **Invited** status — without any admin role assignment.
- **Test 2 — One-lead guard:** As an HQ Technical Reviewer, attempt to invite a
  second **District lead technical reviewer** into a district that already has one;
  confirm it is blocked and no invited account is created.

---

**Open questions**
- [ ] What is the invitation email body copy sent to a newly invited district
  member, and does it differ from a Users-console invite?
- [ ] In production, first sign-in happens through the identity provider (Auth0) —
  how is the emailed invite tied to the account that logs in so the pre-granted role
  attaches to the right person (e.g. keyed by email)?
- [ ] Can a District Lead invite the same person into a role in a second district,
  and if so how do multiple district-scoped roles on one account combine?
- [ ] Should there be a way to re-send or expire a district member invitation, and
  is that owned here or only in the Users console "Pending invitations" section?
