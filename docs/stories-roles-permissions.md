# Stories — Roles & Permissions

Build tickets for the roles/permissions alignment. Source of truth:
[`decisions-roles-permissions.md`](./decisions-roles-permissions.md) and
[`permissions-matrix.md`](./permissions-matrix.md). Written in NRD house style.

**Status vocabulary note:** these stories introduce/rename statuses versus the
legacy NRD set. New/changed names used below: **Waiting for review** (was
"Submitted"), **Under review** (was "In Review"), **Returned to submitter** (was
"Back to Researcher"), **Out for signature** (new), **Waiting for annual report**
(new), **Active** (permit; was "Active Permit"), plus **Expired / Rejected /
Withdrawn**. Each story calls out the transitions it owns.

**Roles used:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher, Principal
Investigator (PI), PICOF, Public User. "Technical Reviewer" = the three reviewer
subtypes collectively.

**Suggested sequencing:** 1 → 2 → 3 (foundation) unlock the rest. 5–7 (statuses/
signing/hold) and 8 (parks) and 9 (IR enforcement) depend on 1–3.

---

## Story 1 — Make prototype identity the single global actor

**Story Title**
Drive all pages from the prototype identity switcher

**Description**

As a prototype tester,
I want the prototype identity switcher to be the single source of "who am I" on
every page — including the permit detail page,
So that I can view and test the application exactly as each user type would
experience it, with no page overriding the active identity.

The prototype identity is a testing-only affordance. Today it drives only the
catalog/admin pages; the permit detail page uses a hardcoded current user and the
special-conditions tab has its own self-selected "Acting as" scope.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher

**Out of scope:** Real authentication — the identity switcher is prototype-only.
Per-permit permit-role selection — see Story 2. Nav gating — see Story 3.

---

**Acceptance Criteria**

**Access & permissions**
- The active identity is read from the single prototype switcher (`readIdentity()`)
  on every page, including the permit detail page.
- The switcher offers every role: System Admin, HQ Technical Reviewer, District
  Lead Technical Reviewer, **District Assistant Technical Reviewer**, Researcher,
  plus the New user (pending role) and Logged out states.

**State & status transitions**
- No status changes result from this story.

**UI & field details**
- The permit detail page derives the current user from the active identity, not
  from the hardcoded highlighted analysis-team member.
- The special-conditions "Acting as" dropdown is removed; the editable scope
  (HQ vs a district) derives from the active identity intersected with the
  permit's districts.

**Edge cases & constraints**
- The District Assistant Technical Reviewer identity is a distinct value, no
  longer simulated by the generic "Reviewer (non-admin)" identity.
- Switching identity re-renders every page consistently, including any page
  previously reading a local actor.

---

**Open questions**
- [ ] Should the generic "Reviewer (non-admin)" identity be retired now that
  District Assistant is a first-class identity, or kept for a roleless-internal case?

---

## Story 2 — Per-permit permit-role demo control (constrained)

**Story Title**
Add a constrained per-permit permit-role selector for testing

**Description**

As a prototype tester,
I want a per-permit control that sets my permit-role on that specific permit —
Responsible Agent, Supporting Agent, Second Signer, or Not assigned,
So that I can test how each permit-role sees and acts on a permit without
depending on seeded assignment data.

A user holds exactly one review permit-role per permit. Because identity gives the
role but not the per-permit assignment, this control supplies the permit-role
axis. It is constrained: it only offers permit-roles the active identity is
eligible for on this permit's type.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer

**Out of scope:** Production assignment of permit-roles — this is a prototype
control. The eligibility rules it enforces are defined in `permissions-matrix.md`
§2.

---

**Acceptance Criteria**

**Access & permissions**
- The control offers only the permit-roles the active identity is eligible for on
  this permit's type (per the eligibility table): e.g. a District Assistant
  Technical Reviewer identity can select Supporting Agent only; an HQ Technical
  Reviewer on a single-district permit cannot select Responsible Agent.
- The control is presented as a prototype/testing affordance, visually distinct
  from real UI, alongside the identity switcher.

**State & status transitions**
- No permit status changes result from selecting a permit-role.

**UI & field details**
- Options are: Responsible Agent, Supporting Agent, Second Signer, Not assigned —
  filtered by eligibility.
- The selection persists per permit (e.g. `demo-permit-role-${permitId}`) and
  survives navigation away and back.

**Edge cases & constraints**
- Selecting a role is single-select — the tester cannot hold two review roles on
  one permit at once.
- When the permit's type flips (Story 8), the available options re-filter to the
  new type's eligibility.

---

**Open questions**
- [ ] For the Researcher identity, is the per-permit axis "Submitter/PI/PICOF vs
  not associated" surfaced here too, or handled only by Story 10's ownership check?

---

## Story 3 — Gate navigation and pages by identity

**Story Title**
Hide and guard nav and admin pages by user role

**Description**

As the system,
I want each user to see and reach only the navigation and pages their role
allows,
So that internal tools and other users' records aren't exposed to roles that
shouldn't have them.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher, Public User

**Out of scope:** Permit-level IR permissions — see Story 9. Researcher record
scoping — see Story 10.

---

**Acceptance Criteria**

**Access & permissions**
- Nav items render per the visibility map:
  - Permits (full register), Catalogs (Resource category tags, Special
    conditions): the four reviewer roles and System Admin; hidden for Researcher.
  - My permits, Districts, Help, Profile, Log out: all authenticated roles
    including Researcher.
  - Admin → District administration: System Admin, HQ Technical Reviewer,
    District Lead Technical Reviewer.
  - Admin → Dashboard, Users, Templates & Defaults, Maintenance mode: System
    Admin only.
- The Admin menu is partially filtered: District Lead and HQ Technical Reviewer
  see only District administration within it; District Assistant sees no Admin
  menu.
- Each restricted page is guarded on direct URL access: a role without access is
  redirected or shown a no-access notice, not the page.

**State & status transitions**
- No status changes result from this story.

**Edge cases & constraints**
- Hiding a nav item and guarding its route are both required — a hidden item must
  not be reachable by typing the URL.
- Public Users (unauthenticated) reach only the public registry and public permit
  view (Story 11).

---

**Open questions**
- [ ] Does the Researcher's "Districts" view show the same content as staff, or a
  reduced public-facing district list?

---

## Story 4 — Rename the Admin role label to System Admin

**Story Title**
Rename the Admin account-role label to System Admin

**Description**

As a CA State Parks Staff user,
I want the top administrative role labeled "System Admin" consistently,
So that the UI matches the roles-and-permissions specification.

**Roles affected:** System Admin

**Out of scope:** Any change to the role's permissions or its underlying value
(`admin`) — label only.

---

**Acceptance Criteria**

**UI & field details**
- The account-role label reads "System Admin" everywhere it appears (account role
  options, user management).
- The demo identity switcher's "HQ system admin" option is standardized to the
  same "System admin" wording.

**Edge cases & constraints**
- The underlying role value is unchanged; only the display label changes.

---

**Open questions**
- [ ] Any external references (docs, emails) that hardcode "Admin" and need the
  same rename?

---

## Story 5 — Add "Waiting for review" status and the Start review transition

**Story Title**
Add Waiting for review status gated by Start review

**Description**

As a Responsible Agent,
I want a submitted application to sit in a "Waiting for review" status until I
click "Start review,"
So that there is a clear, owned handoff between submission and active review, and
review edits are locked until review has formally begun.

**Roles affected:** Researcher, Responsible Agent (Technical Reviewer as
Responsible Agent), System Admin

**Out of scope:** Reviewer assignment logic. The full IR read/update matrix once
Under review — see Story 9.

---

**Acceptance Criteria**

**State & status transitions**
- On submission, an application enters **Waiting for review** (between Draft and
  Under review).
- Clicking **Start review** transitions the permit from **Waiting for review** to
  **Under review** and records who started the review and when.
- Only the **Responsible Agent** (or System Admin) can start review.

**UI & field details**
- In Waiting for review, the application form is read-only for eligible reviewers
  and the **Start review** action is shown to the Responsible Agent only.
- The rest of the Internal Review is gated (read-only) until review starts.

**Edge cases & constraints**
- A reviewer who is not the Responsible Agent does not see the Start review action
  in Waiting for review.
- Starting review is not available once the permit is past Under review.

**Notifications**
- Starting review sends no email — it is an internal state change only (see
  `email-copy-notifications.md`, Notes).

---

**Open questions**
- [ ] Should the Kanban "Submitted / Awaiting review" lane be relabeled to match
  "Waiting for review"?

---

## Story 6 — Two-signature activation with Out for signature status

**Story Title**
Add two-signature activation via Out for signature

**Description**

As a Responsible Agent,
I want to sign an approved permit and send it to a second signer, after which the
permit becomes Active,
So that every issued permit carries the two required signatures before it takes
effect.

A permit becomes Active only after two signatures. The Responsible Agent is always
the first signer; signing sends the permit out for signature to a configured
second signer (Story 7 configures who). Signing is handled in-system via DocuSign.

**Roles affected:** Responsible Agent (Technical Reviewer as Responsible Agent),
Second Signer, System Admin

**Out of scope:** Second-signer configuration surfaces — see Story 7. The
Waiting-for-annual-report hold that can intercept activation — see Story 13.
Generating an unsigned PDF or uploading a signed PDF — removed; signing is
in-system.

---

**Acceptance Criteria**

**State & status transitions**
- When the Responsible Agent approves and applies the **first signature**, the
  permit transitions to **Out for signature**.
- When the **second signer** completes their signature, the permit transitions to
  **Active** (unless intercepted by the annual-report hold — see the hold story).
- The permit record type changes from Application to **Permit** on becoming Active.

**Access & permissions**
- Only the Responsible Agent can apply the first signature. Only the configured
  second signer can apply the second signature.
- The "Generate unsigned permit" and "Upload signed active permit" actions do not
  exist; signing is in-system.

**UI & field details**
- The Internal Review presents a single **Sign permit** action appropriate to the
  current signer and status (first signature in Under review; second signature in
  Out for signature).

**Notifications**
- On entering Out for signature, the second signer receives a DocuSign request:
  **EM-A** (internal signer) or **EM-B** (external no-account signer). Recipient:
  the configured second signer.
- On becoming Active, the permit-issued notification **EM-C** is sent to the
  Researcher (submitter), PI, and PICOF (regulated, always sent).
- Copy for all three: see `email-copy-notifications.md`.

**Edge cases & constraints**
- The permit cannot become Active without both signatures.
- A second signer without a system account signs via the emailed DocuSign request
  (see Story 7).

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Full sign path:** As Responsible Agent, approve and apply the first
  signature; confirm status is Out for signature and a DocuSign request goes to the
  second signer. Complete the second signature; confirm status is Active and record
  type is Permit.

---

**Open questions**
- [ ] Can the Responsible Agent recall or cancel a permit that is Out for signature
  before the second signature? If so, to what status does it return?

---

## Story 7 — Configure the second signer per permit type

**Story Title**
Configure default second signers for single and multi-district permits

**Description**

As a System Admin (multi-district) or a district administrator (single-district),
I want to configure the second signer who co-signs a permit,
So that every permit routes to the correct second signature automatically.

The Responsible Agent is always the first signer. The second signer is configured
by permit type: one designated person for all multi-district permits, and a
per-district default signer for single-district permits.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, Second Signer (may be a Public/external person by email)

**Out of scope:** The signing flow itself — see Story 6.

---

**Acceptance Criteria**

**Access & permissions**
- The **multi-district** second signer is configured on **Templates & Defaults**
  (`/admin/templates`); the selectable pool is any HQ admin or HQ Technical
  Reviewer. Only roles with Templates & Defaults access can set it (System Admin).
- The **single-district** second signer is configured per district on **District
  management** as that district's default signer; the selectable pool is any
  district member, or an external person entered by email (no account required).

**State & status transitions**
- No permit status changes result from configuration; the value is consumed by the
  signing flow (Story 6).

**UI & field details**
- Templates & Defaults gains a "Default second signer" setting (multi-district).
- District management gains a per-district "Default signer" field accepting a
  district member or a free-text email address.

**Edge cases & constraints**
- An external single-district second signer has no account and is identified and
  contacted solely by the entered email (DocuSign).
- Behavior when no second signer is configured for a permit's type/district is an
  open question.

---

**Open questions**
- [ ] What happens at sign-out time if no second signer is configured for the
  permit's type or district — is the first signature blocked, or is a fallback
  signer used?
- [ ] Can the multi-district default second signer be overridden per permit, or is
  it strictly the single configured person?

---

## Story 8 — Editable parks with single↔multi-district flip handling

**Story Title**
Allow editing permit parks with managed district-flip handling

**Description**

As a Responsible Agent (or System Admin),
I want to add and remove parks on a permit, with the system managing the
consequences when the district span changes,
So that a permit's parks can be corrected while keeping its district type,
responsible agent, and district data consistent.

A permit's multi/single-district type is a stored attribute computed from its
parks' district span. Editing parks can flip the type, which changes who is
eligible to be the Responsible Agent, so the system reassigns the lead and prunes
data for any district that is fully removed. Because this is consequential, the
editor must confirm before it commits.

**Roles affected:** Responsible Agent (Technical Reviewer as Responsible Agent),
System Admin, HQ Technical Reviewer, District Lead Technical Reviewer, District
Assistant Technical Reviewer

**Out of scope:** The permit-role eligibility table itself — defined in
`permissions-matrix.md` §2 and encoded by Story 2.

---

**Acceptance Criteria**

**Access & permissions**
- Only the **Responsible Agent** or a **System Admin** can add/remove parks. An HQ
  Technical Reviewer who is not the Responsible Agent cannot edit parks.
- Parks are editable only in pre-decision statuses: Draft, Waiting for review,
  Under review, Returned to submitter.

**State & status transitions**
- The stored **permit type** (single/multi-district) is recomputed from the
  district span of the current parks whenever parks change.
- The prior "single cannot become multi / multi can only shrink" rule no longer
  applies — a permit may flip either direction.

**Happy path**
- When a park add/remove changes the district span, a confirmation dialog is shown
  before anything commits. On Confirm, parks, permit type, and agent reassignments
  commit together.

**UI & field details**
- The confirmation dialog states: the type change; the newly assigned Responsible
  Agent; "You will no longer be the Responsible Agent on this permit" when the
  editor is the outgoing lead; and any agent/condition removals.
- The editor is informed of the new Responsible Agent but cannot choose them.

**Edge cases & constraints**
- On a type flip, the system **auto-assigns** the new Responsible Agent: multi→
  single assigns the remaining district's Lead; single→multi assigns an HQ
  Technical Reviewer. The editor cannot pick the assignee.
- When more than one HQ Technical Reviewer is eligible on a single→multi flip, the
  **prototype assigns one at random**. (Production has an established HQ tiebreak
  business rule; the prototype does not replicate it.)
- The outgoing Responsible Agent is demoted to Supporting Agent if still
  district-relevant, otherwise removed.
- When a park removal empties a district entirely, that district's Supporting
  Agents are removed **and** that district's Special Conditions are removed. (This
  pruning does not exist today and must be built.)
- The final-letter preview must render district condition blocks from the permit's
  **live** districts, not the original seed set (fixes a current defect where a
  dropped district keeps printing its conditions).

**Notifications**
- On a type-flip reassignment, the incoming Responsible Agent receives **EM-F**
  and the outgoing Responsible Agent receives **EM-G** (both informational,
  opt-out via Profile). Copy: see `email-copy-notifications.md`.

---

**Testing notes**

- **Test 1 — Single→multi flip:** On a single-district permit, add a park from a
  second district. Confirm the dialog names an HQ Technical Reviewer as the new
  Responsible Agent, the outgoing lead is demoted to Supporting Agent, and the
  stored type becomes multi-district.
- **Test 2 — Dropped district pruning:** On a multi-district permit, remove the
  last park of one district. Confirm that district's Supporting Agents and Special
  Conditions are removed, and the letter preview no longer prints that district's
  conditions.

---

**Open questions**
- [ ] None — prototype uses random HQ assignment; production tiebreak is an
  existing business rule.

---

## Story 9 (Epic) — Enforce the Internal Review permission matrix

IR enforcement is split into a resolver foundation (9.1) plus four
section-group tickets (9.2–9.5). All key off `permissions-matrix.md` §5. Common
rules across the group: System Admin has Update Any (not bound by permit-role);
HQ Technical Reviewer reads any permit statewide; District Lead/Assistant read
scoped sections only when assigned and cannot access a Withdrawn permit; editing
happens live in the review wizard (no per-section "Make changes" button).

---

## Story 9.1 — IR permission resolver foundation

**Story Title**
Add a permission resolver for role, permit-role, status, and type

**Description**

As the system,
I want a single resolver that returns Read / Update / Disabled / Hidden for any IR
section given the user's role, permit-role, permit status, and permit type,
So that every IR section enforces permissions consistently from one source instead
of ad-hoc per-section logic.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Responsible Agent, Supporting
Agent

**Out of scope:** Applying the resolver to specific sections — see Stories
9.2–9.5. Researcher access — see Story 11.

---

**Acceptance Criteria**

**Access & permissions**
- The resolver takes (role, permit-role, status, permit type, IR section) and
  returns one of Read, Update, Disabled, Hidden, per `permissions-matrix.md` §5.
- System Admin resolves to Update Any (super-user), not bound by permit-role
  conditions.
- HQ Technical Reviewer resolves to Read Any for read scope; District
  Lead/Assistant resolve to scoped read (assigned-only) for Dates/CEQA and signing
  sections.

**Edge cases & constraints**
- The resolver is the single source consumed by Stories 9.2–9.5 — no section
  implements its own parallel rules.

---

**Open questions**
- [ ] Confirm the exact matrix cells for the two new statuses (Out for signature,
  Waiting for annual report) match `permissions-matrix.md` §5.3 before wiring
  sections.

---

## Story 9.2 — Enforce permissions on agent assignment and Tags

**Story Title**
Enforce IR permissions on Responsible/Supporting Agent and Tags

**Description**

As the system,
I want the Responsible Agent, Supporting Agents, and Tags sections to enforce the
resolver's rules,
So that only the permitted roles can change assignment and tagging in each status.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Responsible Agent, Supporting
Agent

**Out of scope:** The resolver itself — see Story 9.1.

---

**Acceptance Criteria**

**Access & permissions**
- Responsible Agent and Supporting Agents assignment sections are Update-if-
  Responsible-Agent; others see Read per the matrix.
- Tags are updatable per the matrix across the reachable statuses.

**State & status transitions**
- In Returned to submitter, assignment updates are Disabled; Tags remain updatable.

---

**Open questions**
- [ ] None — governed by the matrix.

---

## Story 9.3 — Enforce permissions on decision actions and signing

**Story Title**
Enforce IR permissions on Dates/CEQA, decisions, and signing

**Description**

As the system,
I want Dates/CEQA, Approve permit, Return to researcher, Reject application, and
Sign permit to enforce the resolver's rules,
So that only the Responsible Agent (or the applicable signer) can take these
actions in the correct statuses.

**Roles affected:** Responsible Agent, Second Signer, System Admin, HQ Technical
Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer

**Out of scope:** The status transitions themselves (Stories 5, 6). The resolver —
Story 9.1.

---

**Acceptance Criteria**

**Access & permissions**
- Dates/CEQA, Approve permit, Return to researcher, and Reject application are
  Update-if-Responsible-Agent and Hidden for non-Responsible-Agents per the matrix.
- Sign permit resolves to the first signer (Responsible Agent, in Under review) or
  the second signer (in Out for signature) only.
- District Lead/Assistant read Dates/CEQA and signing sections only when assigned.

**State & status transitions**
- In Returned to submitter, decision actions are Disabled for the Responsible
  Agent and Hidden for others.

**Notifications**
- Return to researcher sends **EM-D**; Reject application sends **EM-E**; both to
  the Researcher (submitter), PI, and PICOF (regulated, always sent). Copy: see
  `email-copy-notifications.md`.

---

**Open questions**
- [ ] None — governed by the matrix and Stories 5–6.

---

## Story 9.4 — Enforce permissions on Special Conditions

**Story Title**
Enforce IR permissions on HQ and District Special Conditions

**Description**

As the system,
I want the HQ and District Special Conditions sections to enforce the resolver's
rules,
So that conditions are editable only by the Responsible Agent and Supporting Agent
during review, and read-only afterward.

**Roles affected:** Responsible Agent, Supporting Agent, System Admin, HQ Technical
Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer

**Out of scope:** The scope derivation from identity (Story 1) and the resolver
(Story 9.1). Pruning conditions on a district drop — see Story 8.

---

**Acceptance Criteria**

**Access & permissions**
- HQ and District Special Conditions are updatable by the Responsible Agent and
  Supporting Agent during Under review; Read once Out for signature or later, per
  the matrix.
- The editable scope (HQ vs a district's conditions) derives from the active
  identity, not a self-selected control.

---

**Open questions**
- [ ] None — governed by the matrix.

---

## Story 9.5 — Enforce permissions on Form, Documents, and Internal Notes

**Story Title**
Enforce IR permissions on Form, Supporting Documents, and Internal Notes

**Description**

As the system,
I want the application Form, Supporting Documents, and Internal Notes to enforce
the resolver's rules,
So that document and note access matches the matrix in each status.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Responsible Agent, Supporting
Agent

**Out of scope:** The resolver — Story 9.1.

---

**Acceptance Criteria**

**Access & permissions**
- The Form is Read, Update-if-Responsible-Agent during Under review, and Read plus
  annual-report upload in Active/Expired, per the matrix.
- Supporting Documents are updatable by the Responsible Agent and Supporting Agent
  per the matrix.
- Internal Notes are updatable by any reviewer with access (not permit-role gated).

**State & status transitions**
- In Returned to submitter, Internal Notes and Supporting Documents remain
  updatable; the Form is Read/Disabled.

---

**Open questions**
- [ ] None — governed by the matrix.

---

## Story 10 — Supporting review (informational)

**Story Title**
Add an informational supporting review action for Supporting Agents

**Description**

As a Supporting Agent,
I want to start and complete my supporting review of a permit,
So that my review is recorded, without blocking the Responsible Agent's decision.

**Roles affected:** Supporting Agent (Technical Reviewer as Supporting Agent),
Responsible Agent

**Out of scope:** Gating the Responsible Agent's decision on supporting reviews —
supporting review is informational and never blocks.

---

**Acceptance Criteria**

**Access & permissions**
- The Start/Complete supporting review action is visible only to a user assigned as
  a Supporting Agent, during Under review.

**State & status transitions**
- Completing a supporting review records the review but does not change the permit
  status and does not gate the Responsible Agent's ability to proceed to a decision.

**UI & field details**
- The action is distinct from the Responsible Agent's "Start review" (which is the
  Waiting for review → Under review transition in Story 5).

**Edge cases & constraints**
- The Responsible Agent can approve, return, or reject regardless of whether any
  supporting reviews are complete.

---

**Open questions**
- [ ] Is a completed supporting review reflected anywhere visible to the
  Responsible Agent (e.g. the review history/timeline)?

---

## Story 11 — Restrict researcher access to own records

**Story Title**
Scope researcher access to their own applications

**Description**

As a Researcher,
I want to see and act only on applications where I am the submitter, PI, or PICOF,
So that I cannot access other researchers' records or any internal review data.

**Roles affected:** Researcher, Principal Investigator (PI), PICOF

**Out of scope:** The public view of Active/Expired permits, which is available to
everyone — see Story 12.

---

**Acceptance Criteria**

**Access & permissions**
- A Researcher can access a permit only when the active identity matches its
  submitter, Principal Investigator, or PICOF.
- The entire Internal Review is not accessible to a Researcher in any status.
- A Researcher who reaches another researcher's permit URL is guarded (redirect or
  no-access notice), except for the public view of an Active/Expired permit
  (Story 12).

**State & status transitions**
- On own records: Draft allows Create/Read/Update/Withdraw; Returned to submitter
  allows Update and Withdraw; all other statuses (Waiting for review, Under review,
  Out for signature, Waiting for annual report, Active, Expired, Rejected) are Read
  only. A Withdrawn record is hidden from the researcher.

**Edge cases & constraints**
- The new Waiting for review status is read-only for the researcher (they cannot
  edit a submitted application until it is Returned to submitter).

---

**Open questions**
- [ ] Are PI and PICOF matched by account identity, by email, or by name on the
  application?

---

## Story 12 — Public view of Active and Expired permits

**Story Title**
Show a public, PII-free view of active and expired permits

**Description**

As a Public User,
I want to search and view a summary of active and expired research permits,
So that issued permits are transparent to the public without exposing personal or
internal information.

**Roles affected:** Public User (unauthenticated), plus all authenticated roles.

**Out of scope:** Any pre-issuance or terminal status. Issued permit conditions
and the signed permit document (not shown).

---

**Acceptance Criteria**

**Access & permissions**
- Any user, including unauthenticated Public Users, can view the public summary of
  a permit whose status is **Active** or **Expired**.
- Permits in any other status (Draft, Waiting for review, Under review, Returned to
  submitter, Out for signature, Waiting for annual report, Rejected, Withdrawn) have
  no public view.

**UI & field details**
- The public view shows: permit number, project title, organization, park(s) and
  district(s), permit type, category, project start/end, and permit start/end, and
  status.
- The public view shows no person names — Principal Investigator, PICOF, research
  team, and submitter names are hidden.
- The public view hides the entire Internal Review, issued terms/conditions, and
  the signed permit document.

**State & status transitions**
- No status changes result from viewing.

**Edge cases & constraints**
- The `/search` page serves as the public registry entry point for these permits.

---

**Open questions**
- [ ] Should the public registry search be limited to Active/Expired permits only,
  or search all and simply gate the detail view?
- [ ] Is project title guaranteed PII-free, or does it need a review/redaction step?

---

## Story 13 — Waiting for annual report hold on renewals

**Story Title**
Hold renewal activation when the prior annual report is missing

**Description**

As a Technical Reviewer,
I want a renewal permit to be held from becoming active when the previous permit
version's annual report is missing,
So that permits are not validated while an outstanding compliance requirement is
unmet — while still allowing an override when appropriate.

**Roles affected:** Responsible Agent, System Admin, Researcher, PI, PICOF

**Out of scope:** The delinquent label on an already-active overdue permit (a
separate display concept, not a status).

---

**Acceptance Criteria**

**State & status transitions**
- When a renewal would become Active but its previous version has no annual report
  submitted, the permit enters **Waiting for annual report** instead of Active.
- While held, the permit is not Active and no active-permit notifications are sent.
- The hold clears — moving the permit to Active — when the missing annual report is
  provided, or when a Responsible Agent or System Admin **overrides** the hold.

**Access & permissions**
- Only the Responsible Agent or System Admin can override the hold.

**UI & field details**
- The permit surfaces a clear held state and, for authorized roles, an override
  action.

**Notifications**
- When a renewal is placed on hold, **EM-H** is sent to the Researcher (submitter),
  PI, and PICOF (regulated, always sent).
- No active-permit email fires while held. When the hold is released or overridden
  and the permit becomes Active, the permit-issued email **EM-C** is sent.
- Copy: see `email-copy-notifications.md`.

**Edge cases & constraints**
- The Waiting for annual report hold applies to renewals only.
- This is distinct from the delinquent label applied to an already-active permit
  whose annual report is overdue.

---

**Open questions**
- [ ] Does "previous version has no annual report" mean not submitted, or submitted
  but not accepted?

---

## Story 14 — Replace CEQA with a Yes/N-A radio in Dates/CEQA

**Story Title**
Add a CEQA Yes/N-A radio to the Dates section

**Description**

As a Responsible Agent,
I want to record CEQA applicability as a simple Yes / N/A choice,
So that CEQA status is captured without the dropped write-only implementation.

**Roles affected:** Responsible Agent (Technical Reviewer as Responsible Agent),
System Admin

**Out of scope:** Any CEQA document handling or workflow beyond the applicability
choice.

---

**Acceptance Criteria**

**UI & field details**
- The Dates/CEQA section includes a CEQA control that is a two-option radio: **Yes**
  and **N/A**.

**Access & permissions**
- CEQA is editable per the IR matrix (Update if Responsible Agent, in the
  appropriate statuses); read-only otherwise.

---

**Open questions**
- [ ] What is the default state of the CEQA radio on a new application — unset, Yes,
  or N/A?

---

## Story 15 — Remove the "Make changes" stubs

**Story Title**
Remove non-functional Make changes buttons from permit sections

**Description**

As a Technical Reviewer,
I want permit edits to happen live in the review wizard rather than through
per-section "Make changes" buttons,
So that the interface reflects the real editing model and has no dead controls.

**Roles affected:** Technical Reviewer (all reviewer subtypes), System Admin

**Out of scope:** The review wizard's live editing behavior itself.

---

**Acceptance Criteria**

**UI & field details**
- The per-section "Make changes" button is removed from all permit sections.
- Reviewers make changes live in the review wizard, gated by the IR permission
  matrix (Story 9).

**Edge cases & constraints**
- No section retains a non-functional edit control after this change.

---

**Open questions**
- [ ] None — story appears complete.

---

## Story 16 — Manage email notification templates on Templates & Defaults

**Story Title**
Manage research permit email notification templates

**Description**

As a System Admin,
I want to view and edit the email notification templates the system sends,
So that notification copy can be maintained without a code change and stays
consistent across the permit workflow.

**Roles affected:** System Admin

**Out of scope:** The events that trigger each email (owned by Stories 5–8, 9.3,
13). Per-user opt-in/out — see Story 17.

---

**Acceptance Criteria**

**Access & permissions**
- The Email notifications area lives on **Templates & Defaults** (`/admin/templates`)
  and is accessible to System Admin only (per the nav map, Story 3).

**UI & field details**
- The area lists each notification template with an editable **subject** and
  **body**: EM-A, EM-B (second-signer request, internal/external), EM-C
  (permit issued/active), EM-D (returned to researcher), EM-E (rejected), EM-F/EM-G
  (Responsible Agent assigned/unassigned), EM-H (annual-report hold), EM-I (status
  change on a permit you review). Copy source: `email-copy-notifications.md`.
- Each template shows its available merge placeholders (e.g. `[Permit #]`,
  `[Project title]`, `[PI name]`) and its recipient roles.
- Regulated templates (EM-C, EM-D, EM-E, EM-H) are labeled **Regulated / always
  sent** — editable copy, but their send is not optional.
- Every template preserves the standard NRD signature block.

**Edge cases & constraints**
- The default second-signer settings (multi-district on this page; single-district
  on District management) are configured in Story 7 and are referenced, not
  duplicated, here.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Edit + send:** Edit the EM-C body, trigger a permit to become Active,
  and confirm the received email reflects the edited copy with merge fields
  resolved and the signature block intact.

---

**Open questions**
- [ ] Should edited templates be versioned / auditable (who changed the copy and
  when), or is last-write-wins acceptable?

---

## Story 17 — Notification preferences on the Profile page

**Story Title**
Let users choose which permit notifications they receive

**Description**

As an internal reviewer or a researcher,
I want to choose which optional notifications I receive,
So that I control my inbox without missing required, regulated communications.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher

**Out of scope:** The email copy and triggers (Stories 16, 5–8, 9.3, 13).
Regulated researcher-facing emails, which are always sent.

---

**Acceptance Criteria**

**Access & permissions**
- The Profile page gains a **Notifications** preferences section, rendered per
  persona (staff vs researcher).

**UI & field details**
- Internal reviewers can toggle three optional notifications, each mapping to
  specific emails (authoritative mapping: `email-copy-notifications.md`,
  "Notification preferences → email mapping"):
  - **Assignment changes** → EM-F (assigned), EM-G (unassigned)
  - **Signature requests** → EM-A (internal signature request)
  - **Status changes** (permits I review) → EM-I (status change)
  - All three default to on.
- Regulated researcher-facing notifications — **Application decisions & updates**
  → EM-C, EM-D, EM-E, EM-H — are shown as **Always on** and cannot be turned off.

**Edge cases & constraints**
- Turning off an optional preference suppresses only that user's copy; other
  recipients still receive it.
- External (no-account) second signers have no Profile; EM-B is always sent.

---

**Open questions**
- [ ] None — preferences and their email mappings are defined.
