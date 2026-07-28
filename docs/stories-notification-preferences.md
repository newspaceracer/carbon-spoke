# Notification preferences — user stories

This is the **recipient-side** counterpart to the Email notifications admin
section. A System Admin edits the *copy* of the applicant-facing system emails in
Templates & defaults (see `stories-templates-and-defaults.md`, Story 5, and the
`SCP_System_Email_Inventory.md` Section A); this story lets a **Researcher** choose
*which of those same emails they receive*, from their profile.

The preference list is driven by the **same email inventory** the admin manages —
one source of truth — so the emails a Researcher can opt out of here are exactly
the emails the system sends. District-facing, internal/reviewer, and
e-signature-service emails are managed separately and are not listed.

Prototype note: `/profile` is persona-aware. Signed in as an internal staff
identity it shows the staff account (role/districts + internal notifications);
signed in as the **Researcher** identity it shows the applicant account and these
applicant-email preferences. Switch via the Prototype identity control.

---

## Story 1 — Let a researcher choose which permit emails they receive

**Story Title**
Let a Researcher manage which permit emails they receive from their profile

---

**Description**

As a Researcher,
I want to turn each system permit email on or off from my profile,
So that I receive the notifications I care about and can stop the ones I don't,
without contacting an administrator.

The Notification preferences section on the profile lists the applicant-facing
system emails and gives each an on/off control. Preferences are per-recipient —
each person manages their own — and default to on, so a Researcher receives every
notification until they opt out. This story governs *delivery preference only*;
the wording of each email is managed by a System Admin (see out of scope).

**Roles affected:** Researcher. The same emails are also delivered to the
Principal Investigator (PI), PICOF, and the Submitter, each of whom manages their
own preferences. System Admin governs the email copy but not any individual's
delivery preference.

**Out of scope:** Editing the subject or body of any email — that is a System
Admin action (see `stories-templates-and-defaults.md`, Story 5). Which events
trigger emails and the routing/recipient logic. District-facing emails (e.g. the
special-conditions request, CSPS-52), internal staff / reviewer-assignment emails
(CSPS-54/91/189/199), and all e-signature-service signing emails (CSPS-224).

---

**Acceptance Criteria**

**Access & permissions**
- A signed-in user can view and change their own notification preferences from
  their profile.
- A user cannot view or change another user's notification preferences.

**Happy path**
- The profile's "Notification preferences" section lists the applicant-facing
  system emails, each with its own on/off toggle and a short description of when
  it is sent.
- Each toggle defaults to on (opt-out model): a Researcher receives every listed
  email until they turn one off.
- Turning a toggle off or on takes effect immediately and persists across
  sessions.
- The section states that these emails are delivered to the user's account email
  address.

**UI & field details**
- The section title is "Notification preferences".
- The listed emails correspond one-to-one to the admin-managed inventory
  (`SCP_System_Email_Inventory.md`, Section A):
  - **Submission confirmation** — Application submission confirmation (CSPS-51).
  - **Application returned** — Application returned to researcher (CSPS-16/91).
  - **Application rejected** — Application rejected (CSPS-87).
  - **Permit approved** — Permit approved (CSPS-78).
  - **Annual report due in 15 days** — Annual report reminder, 15 days before
    (CSPS-21).
  - **Annual report due today** — Annual report reminder, due today (CSPS-21).
- The list is derived from the admin-managed inventory (single source of truth):
  if that inventory changes, the preference list stays in sync.

**State & status transitions**
- A saved preference persists for the user across sessions and applies to emails
  sent after the change.
- A System Admin editing an email's copy does not change any user's on/off
  preference for that email.

**Notifications**
- When an email event fires, the system sends the email only to recipients who
  have that email turned on; recipients who have turned it off do not receive it.
- Emails already close with the standard NRD signature block where the copy
  specifies it (`Natural Resources Division / California State Parks /
  (916) 653-6725 / nrd.research@parks.ca.gov`) — unchanged by this story.

**Edge cases & constraints**
- Turning an email off suppresses only that email for that recipient; it does not
  affect the underlying application/permit state or any other recipient.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Preference persists:** As a Researcher, turn off "Submission
  confirmation" and reload the profile. Confirm the toggle is still off.
- **Test 2 — Opt-out suppresses delivery:** With "Submission confirmation" off,
  submit an application. Confirm no submission-confirmation email is sent to that
  Researcher (check the shared ESA inbox).
- **Test 3 — Opt-in still delivers:** With "Permit approved" on, approve the
  permit. Confirm the approval email is sent.
- **Test 4 — Independent recipients:** With a PI opted out of an email and the
  Submitter opted in, trigger that email. Confirm only the Submitter receives it.

---

**Open questions**
- [ ] Should the decision emails (Application returned, Application rejected,
  Permit approved) and the annual-report reminders — which the copy calls
  "mandatory in all cases" — be opt-out-able at all, or locked always-on because
  they are transactional/regulated? If some are locked, the section should show
  them as always-on rather than as toggles.
- [x] Which profile holds these preferences? Resolved: they belong to the
  **Researcher** persona. The prototype now has a Researcher identity and a
  persona-aware `/profile`, so these preferences appear only on the Researcher's
  account (staff see their internal notifications instead).
- [ ] Preferences are per-recipient — for an email that goes to several people
  (Researcher, PI, PICOF, Submitter), does each manage their own copy, and how is
  the preference resolved for a recipient (e.g. a PI) who has no system account?
- [ ] Confirm the default is all-on (opt-out) rather than opt-in.
- [ ] Should opting out of a legally-required notice require a confirmation /
  acknowledgment, and is an audit of opt-outs needed for those notices?
