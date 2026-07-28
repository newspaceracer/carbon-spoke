---
name: scp-domain-story-writing-skill
description: >
  Write, rewrite, or clean up Jira user stories following the CA State Parks
  Natural Resources Division (NRD) house style. Use this skill whenever the
  user wants to draft a new story, reformat an existing one, or turn rough
  notes or requirements into a properly structured ticket. Trigger on phrases
  like "write a story for", "clean up this story", "turn this into a ticket",
  "reformat this", "draft AC for", or any time raw requirements, feature notes,
  or messy bullet points are provided and a polished Jira story is the expected
  output. Always use this skill when the content involves permit workflows,
  researcher submissions, reviewer assignments, document uploads, or any NRD
  system feature — even if the user doesn't explicitly ask for a "story" or
  "ticket".
---

# SCP-Domain Story Writing Skill — Domain Extension

This skill extends the base **Basic story writing skill** with NRD-specific rules.

**Always read Basic story writing skill/SKILL.md first**, then apply the overrides and
additions in this file. Where these rules conflict with the base skill,
these win. Where this file is silent, the base skill applies.

---

## NRD System Context

This skill is for the CA State Parks Natural Resources Division (NRD) permit
management system. Stories describe workflows for research permit applications:
submission, internal review, approval, document handling, and compliance
tracking.

---

## NRD Role Names

Always use these exact role names. Never abbreviate, paraphrase, or substitute.

| Role | Who they are |
|---|---|
| **Researcher** | Public user submitting a research permit application |
| **Principal Investigator (PI)** | Named research lead on the application |
| **PICOF** | PI's co-investigator or fiscal officer |
| **Technical Reviewer** | CA State Parks staff assigned to review an application |
| **System Admin** | Internal staff with full access across all records and statuses |
| **Public User** | Any unauthenticated or general public-facing user |
| **CA State Parks Staff** | General internal staff role |

When a story affects multiple roles differently, call each out explicitly in
both the Description and the relevant AC items.

---

## NRD Application Statuses

Use these exact status names — do not paraphrase or invent variations.

- **Draft** — being edited by the researcher, not yet submitted
- **Submitted** — submitted by researcher, awaiting review intake
- **In Review** — assigned to a technical reviewer, under active review
- **Back to Researcher** — returned by reviewer; researcher can edit and resubmit
- **Resubmitted** — researcher has resubmitted; awaiting reviewer confirmation
- **Active Permit** — application approved; record type has changed to Permit

Record types: **Application** (pre-approval) and **Permit** (post-approval).
Whenever a status or record type changes as a result of a story's action,
spell it out explicitly in the AC under "State & status transitions."

---

## NRD Email Rules

These override the base skill's notification guidance for NRD stories.

- Every email trigger must name all recipient roles explicitly
  (e.g. Researcher, PI, PICOF — not just "the submitter").
- When the email content is fixed or regulated, paste the full body verbatim.
- Always close regulated emails with this exact NRD signature block:

  ```
  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

- If email copy is not provided in the input, flag it as an open question:
  "What is the email body copy sent to [role] when [trigger event]?"
  Never leave a Notifications AC item without either the copy or a flagged
  open question.

---

## NRD AC Evaluation — Additional Checks

Run these after the base skill's AC evaluation pass.

**NRD: full status sweep**
- Check every NRD status (Draft, Submitted, In Review, Back to Researcher,
  Resubmitted, Active Permit) for whether this story's action is available,
  unavailable, or affected.
- Does an approval or status change also trigger a record type change
  (Application → Permit)? If so, is it explicitly called out?

**NRD: email copy completeness**
- Is the full email body present for every triggered notification?
- Does every regulated email include the standard NRD signature block?
- If email copy is missing, it must be an open question — never omit it silently.

**NRD: document visibility**
- If a document is uploaded or generated (signed permit, DPR65A, DPR65B, etc.),
  confirm its visibility is addressed across all relevant surfaces:
  - Internal review page
  - Uploaded Files aggregated section
  - Permits index grid (relevant column)
  - Review and Submit section (public user visibility)

**NRD: exact UI naming**
- Verify all UI element names match NRD product copy exactly.
  Common elements: "Signed Active Permit", "Approve Permit", "Back to
  Researcher", "Uploaded Files", "Review and Submit", "Application Summary".

---

## NRD Testing Environment Note

When a story involves email notifications, always include this in Testing notes:

> **Environment note:** All emails in the QA environment route to a shared ESA
> inbox. Notify the ESA team before testing so the email can be forwarded for
> verification. Do not test against real user email addresses in QA.

---

## NRD Examples

The base skill's examples cover generic patterns. The examples below are
NRD-specific and show the full extension in practice.

---

### Example 1: Minimal NRD input → lean output

**User input:**
> As a CA State Parks staff user, I can log into my account in the system

**Output:**

---

**Story Title**
Allow CA State Parks staff to log in with their account credentials

---

**Description**

As a CA State Parks Staff user,
I want to log in using my username and password,
So that I can access the system and perform the actions permitted by my role.

**Roles affected:** System Admin, Technical Reviewer, CA State Parks Staff

**Out of scope:** Password reset and account creation — not covered in this story.

---

**Acceptance Criteria**

**Access & permissions**
- A user with a valid account can log in using their username and password.
- Each role (System Admin, Technical Reviewer, and all other CA State Parks
  Staff roles) is granted access to the features and actions assigned to that
  role upon successful login.
- A user with invalid credentials cannot log in and sees an appropriate error
  message.

**Happy path**
- The user enters valid credentials and is directed to their role-appropriate
  landing page.

**Edge cases & constraints**
- A user with an unrecognized username or incorrect password is shown an error
  message and cannot proceed.

---

**Open questions**
- [ ] Is there a specific landing page per role after login, or a single shared
  home page for all staff roles?
- [ ] Are there account lockout rules after repeated failed login attempts?

---

### Example 2: Rich NRD input → full output

**User input:**
> When a permit is submitted by a researcher the system sends an automated
> email to the appropriate technical reviewer. System assigns 1 technical
> reviewer per permit. Assigns by matching project type to reviewer specialty.
> If multiple reviewers share a specialty, distribute so all have the same
> number of open applications before assigning a second to any.
> Scope does not include manually changing assignment — that's CSPS-44.
> Scope does not include changes to the email template — also CSPS-44.

**Output:**

---

**Story Title**
Auto-assign technical reviewer and notify on application submission

---

**Description**

As the system,
I want to automatically assign a technical reviewer when a researcher submits
an application and notify that reviewer by email,
So that every submitted application has an owner immediately and no submissions
go unactioned.

The assignment algorithm matches the application's project type to a reviewer's
designated specialty, then load-balances across reviewers who share a specialty
by assigning to the one with the fewest open applications.

**Roles affected:** Researcher, Technical Reviewer, System Admin

**Out of scope:** Manual reassignment of a reviewer after assignment — see
CSPS-44. Changes to the email template by any user — see CSPS-44.

---

**Acceptance Criteria**

**Access & permissions**
- Only the system performs the assignment — no user initiates or confirms it.

**Happy path**
- When a researcher submits an application, the system assigns exactly one
  technical reviewer to it.
- The system matches the application's project type to the reviewer's
  designated specialty to determine eligibility.
- If multiple reviewers share the matched specialty, the system assigns the
  one with the fewest currently open applications.
- If no reviewer has a matching specialty, the system assigns the reviewer
  with the "Other" specialty who has the fewest open applications.
- Once assigned, the system sends an email notification to the assigned
  technical reviewer.

**State & status transitions**
- Once assigned, the system does not automatically change the assigned reviewer
  — the assignment persists until manually updated (out of scope for this story).

**Notifications**
- The assigned technical reviewer receives an email notifying them that a new
  application is awaiting their review.

**Edge cases & constraints**
- If no technical reviewer exists in the system at time of submission, fallback
  behavior is undefined — flagged as open question.
- If two reviewers are tied on open application count, tiebreaker behavior is
  undefined — flagged as open question.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real reviewer email addresses in QA.

- **Test 1 — No reviewers exist:**
  Verify no Technical Reviewer users exist in the system. Submit a new
  application. Verify system behavior (email send attempt, assignment state).

- **Test 2 — Reviewers with no specialty:**
  Create 2 Technical Reviewers with no specialty assigned. Submit 3
  applications. Confirm assignments are distributed evenly.

- **Test 3 — Load balancing:**
  Confirm both reviewers have 3 applications each. Add a third Technical
  Reviewer with no specialty. Submit one more application. Confirm it is
  assigned to the new reviewer.

- **Test 4 — Specialty matching:**
  Create one reviewer with a specific specialty and one with "Other". Submit
  more than 3 applications matching the first reviewer's specialty. Confirm
  the first 3 go to the matched reviewer; overflow goes to the "Other" reviewer.

---

**Open questions**
- [ ] What is the system behavior if no technical reviewer exists at time of
  submission — does the application still move to In Review, and is a System
  Admin notified?
- [ ] What is the tiebreaker when two reviewers have an identical open
  application count — random, round-robin, or last-assignment date?
- [ ] What is the full email body sent to the assigned technical reviewer?
  A template is needed since email copy changes are out of scope for this story.
