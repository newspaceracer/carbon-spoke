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

**Source of truth for the vocabulary below:**
[`docs/permissions-matrix.md`](../../../docs/permissions-matrix.md) (§1 Vocabulary,
§2 eligibility) reconciled with
[`docs/decisions-roles-permissions.md`](../../../docs/decisions-roles-permissions.md).
Where the two disagree, the decision log wins on rules and the matrix wins on the
short display labels. If either doc changes, re-true this section against it.

---

## NRD Roles — the two-layer actor model

NRD has **two layers of "who"**, and a story usually touches both. Keep them
distinct; never collapse a permit-role into a user role.

### Layer 1 — User role (identity)

The global "who is signed in" — exactly one per session (the prototype identity,
`readIdentity()`). Use these exact names. **Never write bare "Technical Reviewer"** —
it is an umbrella; always name the specific variant (HQ / District Lead / District
Assistant).

| Role | Identity value | Scope |
|---|---|---|
| **System Admin** (Admin) | `admin` | Global super-user — users, districts, settings + review |
| **HQ Technical Reviewer** | `hq-technical` | Global (statewide, all districts) |
| **District Lead Technical Reviewer** | `district-lead` | Their district(s); signs off on district decisions |
| **District Assistant Technical Reviewer** | `district-assistant` | Their district(s); analysis without final sign-off |
| **Researcher** | `researcher` | Public applicant; own records only |
| **Pending user** | `pending` | Signed-in parks.ca.gov account with **no reviewer role yet** (awaiting approval) |
| *(logged out)* | `anon` | Unauthenticated |

### Layer 2 — Permit-role (per permit)

What a user *is on one specific permit*. Exactly **one review permit-role per user
per permit**. Set by a constrained control that offers only what the user's identity
is eligible for on that permit (see eligibility below).

| Permit-role | Meaning |
|---|---|
| **Responsible Agent (RA)** | Owns the permit; the only one who can **Start review**; the **1st signer** |
| **Supporting Agent (SA)** | Contributes analysis; no final sign-off |
| **Second Signer** | Co-signs — a separate per-permit capability, not a review role |
| **Not assigned** | Holds no permit-role on this permit |

### Application-side people (not system accounts)

Captured on the application itself, distinct from the user roles above.

| Term | Who they are |
|---|---|
| **Principal Investigator (PI)** | The applicant/research lead who submits and signs; usually the submitter |
| **PICOF** | **Person In Charge Of Field work** — leads field operations (distinct from the PI) |
| **Participant** | An additional research-team roster member; free-typed, may have no account |

**Eligibility (who may hold which permit-role)** depends on the user role **×** the
permit's district span (single- vs multi-district). See `permissions-matrix.md` §2.
Summary: System Admin → RA or SA either way; HQ Technical → RA or SA on multi-district
but **SA only** on single-district; District Lead → **SA only** on multi-district but
RA or SA on single-district; District Assistant → **SA only** either way; Researcher →
no permit-role.

When a story affects multiple roles differently, call each out explicitly in both the
Description and the relevant AC items — and be clear whether you mean a **user role**
or a **permit-role**.

---

## NRD Statuses & record axes

### Application/permit statuses (workflow order)

Use these exact short labels — do not paraphrase or invent variations.

- **Draft** — being edited by the researcher, not yet submitted
- **Waiting for review** — submitted; the RA has **not** clicked "Start review" yet
- **Under review** — RA started review; internal-review (IR) editing is unlocked
- **Returned to submitter** — returned by a reviewer; researcher can edit and resubmit (0–n round trips)
- **Out for signature** — RA signed first; awaiting the 2nd signer (DocuSign)
- **Waiting for annual report** — renewal pre-activation **hold**: a prior version's annual report is missing; RA-overridable
- **Active** — permit issued and in effect
- **Expired** — permit term ended
- **Rejected** — terminal, off the review decision
- **Withdrawn** — terminal, off the review decision

**Delinquent is a *label*, not a status** — it flags an already-**Active** permit
whose annual report is overdue. Don't list it as a status.

### Two axes that are NOT the status (don't conflate)

- **Record type:** **Permit · Amendment · Renewal · Application** — the kind of record.
  (This replaces the old "Application → Permit" pre/post-approval binary, which no
  longer exists.)
- **Permit type (district span):** **Single-district** vs **Multi-district** — a stored
  attribute computed from the district span of the permit's parks; recomputed when parks
  change. It **drives permit-role eligibility** (above), so name it whenever eligibility
  or signing is in play.

Whenever a status, permit-role, record type, or district span changes as a result of a
story's action, spell it out explicitly in the AC under "State & status transitions."

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
- Check every NRD status (Draft, Waiting for review, Under review, Returned to
  submitter, Out for signature, Waiting for annual report, Active, Expired,
  Rejected, Withdrawn) for whether this story's action is available, unavailable,
  or affected.
- Does the action change a **permit-role** (RA/SA/Second Signer/Not assigned) or
  the **district span** (single↔multi, which can auto-reassign the RA)? If so, is
  it explicitly called out?

**NRD: permit-role eligibility**
- Is the action gated on a **permit-role** (e.g. only the Responsible Agent can
  Start review or sign first) rather than just a user role? If so, name the
  permit-role, not just the identity.
- Where eligibility depends on the **single- vs multi-district** span, is that
  condition stated?

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
  Common elements: "Start review", "Approve Permit", "Return to researcher"
  (status label: "Returned to submitter"), "Reject Application", "Uploaded Files",
  "Review and Submit", "Application Summary", "Signed Active Permit".

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

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer

**Out of scope:** Password reset and account creation — not covered in this story.

---

**Acceptance Criteria**

**Access & permissions**
- A user with a valid account can log in using their username and password.
- Each role (System Admin, HQ Technical Reviewer, District Lead Technical
  Reviewer, and District Assistant Technical Reviewer) is granted access to the
  features and actions assigned to that role upon successful login.
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

> **Model note:** this example illustrates how to structure a *rich* input — the
> vocabulary sections above are the source of truth. In the current model the
> auto-assigned reviewer becomes the permit's **Responsible Agent**, and RA
> eligibility depends on the permit's **single- vs multi-district** span (§2 of
> `permissions-matrix.md`). A real version of this story would state that
> interaction; it's called out as an open question below rather than silently
> assumed.

**User input:**
> When a permit is submitted by a researcher the system sends an automated
> email to the appropriate technical reviewer. System assigns 1 technical
> reviewer per permit. Assigns by matching project type to reviewer area of expertise.
> If multiple reviewers share an area of expertise, distribute so all have the same
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
designated area of expertise, then load-balances across reviewers who share an area of expertise
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
  designated area of expertise to determine eligibility.
- If multiple reviewers share the matched area of expertise, the system assigns the
  one with the fewest currently open applications.
- If no reviewer has a matching area of expertise, the system assigns the reviewer
  with the "Other" area of expertise who has the fewest open applications.
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

- **Test 2 — Reviewers with no area of expertise:**
  Create 2 Technical Reviewers with no area of expertise assigned. Submit 3
  applications. Confirm assignments are distributed evenly.

- **Test 3 — Load balancing:**
  Confirm both reviewers have 3 applications each. Add a third Technical
  Reviewer with no area of expertise. Submit one more application. Confirm it is
  assigned to the new reviewer.

- **Test 4 — Specialty matching:**
  Create one reviewer with a specific area of expertise and one with "Other". Submit
  more than 3 applications matching the first reviewer's area of expertise. Confirm
  the first 3 go to the matched reviewer; overflow goes to the "Other" reviewer.

---

**Open questions**
- [ ] What is the system behavior if no technical reviewer exists at time of
  submission — does the application still move to Waiting for review, and is a System
  Admin notified?
- [ ] What is the tiebreaker when two reviewers have an identical open
  application count — random, round-robin, or last-assignment date?
- [ ] What is the full email body sent to the assigned technical reviewer?
  A template is needed since email copy changes are out of scope for this story.
- [ ] Does the auto-assigned reviewer become the permit's **Responsible Agent**,
  and how does assignment respect RA eligibility on **single- vs multi-district**
  permits (e.g. an HQ reviewer cannot be RA on a single-district permit)?
