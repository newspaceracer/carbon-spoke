# Permit detail page — new version

Stories for the reworked **permit detail page** (`/permit`): the read-only record a
reviewer, a researcher who owns the permit, or the public opens for one application
or permit. Written against the current prototype, with these decisions from the
2026-10-26 grilling session:

- **Activation is a signed-letter upload, not DocuSign.** The system generates the
  final permit letter; the **Responsible analyst** downloads it, has it signed outside
  the system, and uploads the signed copy. That upload is the step that makes the
  permit **Active**. The system does not record who signed — only that the signed
  letter was uploaded and by whom. This reverses the "Upload signed active permit —
  REMOVED" decision in [`decisions-roles-permissions.md`](decisions-roles-permissions.md)
  and §3 / §8.2 of [`permissions-matrix.md`](permissions-matrix.md).
- **"Out for signature" stays** as the status between approval and the upload.
- **Annual report, matrix vocabulary.** All copy says **annual report** (the
  prototype's "Final report" wording is renamed). A permit owes **one** annual
  report, due 30 days after the permit expires. The report is a **document
  upload, not a form**: one uploaded document completes the requirement unless
  the Responsible analyst sends it back. **Delinquent** is a label, not a status,
  set automatically once the report is overdue; the Responsible analyst or a System
  Admin can lift its renewal block. The renewal pre-activation hold remains
  **Waiting for annual report**.
- **The Overview tab is one shared summary** (2026-10-28 grilling): the same
  blocks for staff, the researcher owner, and the public, with the internal
  material moved to a staff-only **Internal review** tab — Stories 10 and 11.
- **Documents read in place, at full width** (2026-10-28): the annual report's
  current version is rendered inline (Story 6), and the letter and report fill the
  tab's content width. Only a **System Admin** can replace the signed letter after
  signature (Story 5). Section rails sit to the right, in Carbon's on-page
  contents style (Stories 3 and 4).

Related: the
authorized-parks table in [`stories-study-areas-contacts-table.md`](stories-study-areas-contacts-table.md);
the schedule calendar in [`stories-schedule-calendar.md`](stories-schedule-calendar.md);
the document viewer in [`stories-document-viewer.md`](stories-document-viewer.md);
regulated email copy in [`email-copy-notifications.md`](email-copy-notifications.md);
fixes for long, large and minimal records in [`stories-permit-detail-real-data.md`](stories-permit-detail-real-data.md).

| # | Story |
|---|---|
| 1 | Restructure the permit detail page into record tabs |
| 2 | Show status- and permit-role-driven actions in the permit header |
| 3 | Present the full application as one read-only scroll with a contents rail |
| 4 | Group special conditions by owner with a contents rail |
| 5 | Activate a permit by uploading the signed permit letter |
| 6 | Let researchers upload the annual report document on a permit |
| 7 | Flag overdue annual reports as Delinquent and block PI renewals |
| 8 | Show a PII-free public view of issued permits |
| 9 | Show permit alerts in one stack under the header |
| 10 | Show one shared Overview of the permit's stage and key facts |
| 11 | Move internal review work to a staff-only Internal review tab |

---

## Story 1 — Restructure the permit detail page into record tabs

**Story Title**
Restructure the permit detail page into record tabs

---

**Description**

As an HQ Technical Reviewer, District Lead Technical Reviewer, District Assistant
Technical Reviewer, System Admin, or Researcher who owns the permit,
I want the permit detail page organized into a small set of tabs that appear only
when they have content,
So that I can find any part of the record without scrolling past tabs that don't
apply yet.

The previous six section tabs (Overview, Project information, Study areas, Special
conditions, Data collection, Additional documents) collapse into **Overview** and
one **Application** scroll (Story 3). Two later-stage documents get their own
gated tabs, and the review team's workspace gets a staff-only tab (Story 11). The detail page is **read-only**: every edit happens in the review
wizard, reached by **Start review** / **Open review** (Story 2).

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (owner: submitter, PI,
or PICOF), public viewer (see Story 8).

**Out of scope:** The content of each tab — see Stories 3–8, 10 (Overview), and 11
(Internal review). The review wizard (`final-letter.astro`) itself.

---

**Acceptance Criteria**

**UI & field details**
- The tab strip shows, in order: "Overview", "Application", "Special conditions",
  "Final permit letter", "Annual report", "Internal review".
- "Overview" is the selected tab when the page loads.
- The tab strip stays pinned below the header as the page scrolls.
- No tab contains Edit, Save, or inline-editing controls.

**Access & permissions**
- "Final permit letter" appears only when the permit's status is Out for signature,
  Waiting for annual report, Active, or Expired.
- "Annual report" appears only when the permit's status is Active or Expired.
- Neither "Final permit letter" nor "Annual report" appears in the public view.
- "Internal review" appears only to System Admin, HQ Technical Reviewer, District
  Lead Technical Reviewer, and District Assistant Technical Reviewer (Story 11).
- "Special conditions" is hidden from a Researcher (owner) until the status is Out
  for signature, Waiting for annual report, Active, or Expired; draft conditions
  stay internal.

**State & status transitions**
- When the status changes while the page is open, gated tabs appear or disappear
  without a reload.
- If the open tab is hidden by a status change, the page switches to "Overview".
- A link ending in the tab's name opens that tab directly: `#application`,
  `#special-conditions`, `#letter`, `#report`, `#internal` (`?tab=<name>` works too). The
  address bar follows the open tab, so the URL can be copied and shared. A link
  to a tab the viewer can't see opens "Overview".

**Edge cases & constraints**
- A Researcher who is not an owner of a permit in a non-public status is
  redirected to My permits (or to Search if logged out).
- A Researcher who owns a **Withdrawn** application can open it read-only; the
  Overview leads with the withdrawal (Story 10).

---

**Open questions**
- None.

---

## Story 2 — Show status- and permit-role-driven actions in the permit header

**Story Title**
Show status- and permit-role-driven actions in the permit header

**Jira:** CSPS-406

---

**Description**

As a Responsible analyst, Supporting analyst, System Admin, or Researcher who owns the permit,
I want the permit header to show one action button chosen by the permit's status and by who I am,
So that the header always answers "what do I do now?" without showing actions I can't take.

The header shows the permit number, name, status indicator, classification
badges, and a fact row. The action is a single button: a primary action, plus a
dropdown when the stage has secondary actions. A compact copy of the header pins
to the top once the full header scrolls away, with the same button.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (permit-role: Responsible analyst,
Supporting analyst, Not assigned), Researcher (owner: submitter, PI, or PICOF).

**Out of scope:** The approve / return / reject flows inside the review wizard.
The send-for-signature confirmation dialog (moved to CSPS-409, 2026-10-28: nothing
moves a permit into Out for signature until 409). The signed-letter upload itself
(CSPS-409). The annual report upload itself (CSPS-410). The EM-L email spec and
the completion-persistence rules, which CSPS-437 owns; this story only places the
Complete review / Reopen review controls in the header. The "Reviews: N of M
complete" line in EM-L, which is added when the review count ships in CSPS-286.

---

**Acceptance Criteria**

**UI & field details**
- The header action follows this table. "Primary | dropdown items" means the
  first label is the button and the rest are in its menu. "Other staff" means
  Not-assigned reviewers. A dash means no action.

  | Status | RA / System Admin | Supporting analyst | Other staff | Researcher (owner) |
  | --- | --- | --- | --- | --- |
  | Waiting for review | Start review | — | — | — |
  | Under review | Open review \| Request changes, Reject permit | Review application \| Complete review (or Reopen review) | — | — |
  | Returned to submitter | — | Complete review (or Reopen review) | — | Revise application |
  | Out for signature | Upload signed letter \| Download unsigned letter | — | — | — |
  | Waiting for annual report | Activate permit \| Download signed letter | Download signed letter | Download signed letter | Upload annual report \| Download signed letter |
  | Active | Download signed letter \| Request amendment | Download signed letter | Download signed letter | Download signed letter \| Request amendment |
  | Expired | Download signed letter | Download signed letter | Download signed letter | Upload annual report \| Download signed letter while the report is owed; otherwise Download signed letter |
  | Rejected, Withdrawn | — | — | — | — |

- The fact row shows "Requested window", "Submitted", and "Responsible analyst".
- From Out for signature onward, the "Requested window" label reads "Authorized
  window".
- The full header and the compact pinned header always show the same status and
  action.

**State & status transitions**
- "Start review" records who started the review and when, sets the status to
  Under review, and opens the review wizard. It sends no email.
- "Open review" and "Review application" open the review wizard without changing
  the status.
- "Upload signed letter" opens the signed-letter upload (CSPS-409).
- "Upload annual report" switches to the Annual report tab (CSPS-410). On a
  Waiting for annual report renewal, it opens the **previous permit's** Annual
  report tab, since the report belongs to the permit it reports on.

**Activate permit (renewal on hold)**
- "Activate permit" (renamed from "Issue permit", originally "Override hold —
  issue permit") is the normal way to release a renewal from Waiting for annual
  report. The renewal stays on hold until the Responsible analyst reviews the
  previous permit's annual report and selects it. Uploading the report doesn't
  change the renewal by itself.
- "Activate permit" is available any time the renewal is in Waiting for annual
  report, including before a report is uploaded, so the RA can issue in an
  exception.
- Selecting it opens a confirmation:
  - Heading: "Activate permit [Permit #]?"
  - Body: "The permit becomes active and the researcher, PI, and PICOF get an
    email."
  - Buttons: "Cancel" and "Activate permit".
- Only when the previous permit has no annual report uploaded, the confirmation
  also shows a warning:
  - Title: "No annual report for permit [Previous permit #]"
  - Subtitle: "Activate this permit only if you're making an exception."
- Confirming sets the status to Active and sends EM-C. "Cancel" closes the
  confirmation and leaves the renewal on hold.

**Complete review (Supporting analyst)**
- "Complete review" marks the Supporting analyst's review as done, with the date, in
  both analysis-team lists (the header's team window and the team list on the
  permit page), and updates the progress count.
- The mark persists after a reload.
- "Complete review" and "Reopen review" are available in the header while the
  permit is Under review or Returned to submitter, and are hidden in every other
  status.
- A Supporting analyst who has completed their review sees "Reopen review" in the
  menu instead; it restores their previous review status. Only the Supporting
  analyst who owns the review sees either action, and the Responsible analyst sees
  neither.
- A completed review stays complete through Returned to submitter and through
  resubmission. The system never clears a completion mark on its own (CSPS-437).
- Inside the review wizard, the Supporting analyst's header button is hidden; the
  wizard's own "Complete review" button records the same mark.

**Edge cases & constraints**
- If "Download signed letter" is selected and no signed letter is on file, a
  warning toast shows "No signed letter on file" and nothing downloads.

**Notifications**
- "Activate permit" sends **EM-C — Permit issued / active** to the Researcher
  (submitter), PI, and PICOF. Regulated: always sent, no opt-out.

  **Subject:** Your research permit [Permit #] is now active

  ```
  [PI name],

  Your research permit is now active.

  Permit:  [Permit #] — [Project title]
  Term:    [Permit start] – [Permit end]
  Park(s): [Park(s)]

  You may begin the authorized work within the permit term and its
  conditions. Your signed permit is attached. A copy is also in your account.

  Report any change to your project before it occurs. An annual report is
  required as specified in your permit.

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

- "Complete review" and "Reopen review" (header menu, or "Complete review" in the
  review wizard) send **EM-L — Supporting review completed or reopened** to the
  permit's Responsible analyst. Always sent, no Profile toggle. [Action] =
  "completed" / "reopened". [Next step] = "They're done adding conditions and
  comments." / "They can change conditions and comments again." EM-L replaces the
  retired CSPS-189 "Supporting Analyst Review Complete" email, so the RA gets one
  email per action. CSPS-437 owns the email; it ships without a "Reviews: N of M
  complete" line, which is added when CSPS-286 ships.

  **Subject:** [Reviewer name] [Action] their review — permit [Permit #]

  ```
  [First name],

  [Reviewer name] [Action] their review of a permit you're responsible for.
  [Next step]

  Permit:  [Permit #] — [Project title]

  [Open permit]

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Action table:** For each status in the table, view the permit as the
  RA, a Supporting analyst, a Not-assigned reviewer, and the Researcher owner;
  confirm the button and menu in both the full and pinned header.
- **Test 2 — Complete review:** As a Supporting analyst on the analysis team of an
  Under review permit, select "Complete review" → marked done with date in both
  team lists, progress count updates, RA receives EM-L ("completed") and no
  CSPS-189 email; reload → still marked; menu shows "Reopen review"; select it →
  RA receives EM-L ("reopened").
- **Test 2b — Returned to submitter:** With the permit Returned to submitter,
  confirm the Supporting analyst still sees Complete review / Reopen review in the
  header and each action sends EM-L; in every other status both are hidden.
- **Test 3 — Activate permit with report:** On a Waiting for annual report renewal
  whose previous permit has a report, as the RA select "Activate permit" →
  confirmation shows "Activate permit [Permit #]?", the body, "Cancel" and
  "Activate permit", and no warning. "Cancel" leaves it on hold; confirming sets
  Active and sends EM-C.
- **Test 4 — Activate permit without report:** On a Waiting for annual report
  renewal whose previous permit has no report, select "Activate permit" → the
  warning "No annual report for permit [Previous permit #]" with its subtitle
  shows; confirming still sets Active.
- **Test 5 — Upload doesn't release:** Upload the report on the previous permit →
  the renewal stays in Waiting for annual report.
- **Test 6 — Report on renewal:** As the Researcher owner of a Waiting for annual
  report renewal, select "Upload annual report" → the previous permit's Annual
  report tab opens.
- **Test 7 — No signed letter:** On a permit with no signed letter on file, select
  "Download signed letter" → warning toast "No signed letter on file"; nothing
  downloads.

---

## Story 3 — Present the full application as one read-only scroll with a contents rail

**Story Title**
Present the full application on one read-only scroll with contents rail

---

**Description**

As a reviewer or Researcher who owns the permit,
I want the whole application on one scroll with a contents rail,
So that I can read it top to bottom or jump straight to a section.

The Application tab reuses the review wizard's shared section components in
read-only mode, so the detail page and the wizard always show the record the same
way. Each section is a raised panel with its title and the section's own
classification badges and compliance flags in the panel head.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (owner), public viewer
(reduced, see Story 8).

**Out of scope:** Editing any section (review wizard only). The authorized-parks
contact rules — see `stories-study-areas-contacts-table.md`. The calendar — see
`stories-schedule-calendar.md`.

---

**Acceptance Criteria**

**UI & field details**
- The tab shows, in order: "Project information", "Research team", "Schedule",
  "Authorized parks", "Data collection", "Additional documentation".
- A contents rail to the right of the sections lists the same six sections; each
  entry shows that section's compliance-flag count when it has any.
- The rail follows Carbon's on-page contents pattern: no visible heading (it is
  announced as "On this page"), a gray track, and the section in view marked by a
  blue bar and bold text.
- Selecting a rail entry scrolls to that section; the rail stays pinned and
  highlights the section in view.
- The rail is hidden at small and medium breakpoints; the sections remain in order.
- Content follows one read rule: short facts and yes/no answers as tiles, people
  as contact cards, collections as tables, narrative as prose.
- "Schedule" shows the permit calendar followed by a "Field investigation
  occurrences" list.
- "Authorized parks" shows one table with the columns "District", "District
  contact", "Park unit", "Park contact"; each district's name and contact span all
  of that district's park rows.
- "Additional documentation" shows the files table with "Download all" and an
  inline document viewer below it; "View", "View CV", and proposal links open the
  file in that viewer instead of a new page.

**Edge cases & constraints**
- A section with no compliance flags shows no count in the rail.
- A district with no assigned contact shows "No contact assigned".

---

**Open questions**
- [ ] Should the rail also show open-comment counts per section, or only
  compliance flags?

---

## Story 4 — Group special conditions by owner with a contents rail

**Story Title**
Group special conditions by owner with a contents rail

---

**Description**

As a reviewer or Researcher who owns the permit,
I want special conditions grouped by the office that set them, with a rail
showing each group's count,
So that I can find the conditions that apply to my district or park quickly.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (owner).

**Out of scope:** Adding, editing, or removing conditions (review wizard and the
conditions catalog — see `stories-special-conditions.md`). The order of
conditions inside the final letter (HQ first).

---

**Acceptance Criteria**

**Access & permissions**
- Visibility of the tab itself follows Story 1.

**UI & field details**
- Conditions appear in one panel titled "Special conditions", grouped under a
  heading per owner: "Headquarters" and each of the permit's districts.
- A contents rail to the right of the panel lists one entry per owner group with
  its condition count. It looks and behaves like the Application tab's rail
  (Story 3).
- Owners with no conditions are left out of both the rail and the panel; if no
  owner has conditions, the rail is hidden.
- **Reviewer order:** the reviewer's own district first, then Headquarters, then
  other districts. HQ Technical Reviewers and System Admins see Headquarters
  first.
- **Researcher order:** Headquarters first, then districts in the order they
  appear in "Authorized parks".

**State & status transitions**
- From Out for signature onward, the panel shows an info notice. Reviewers see
  "Conditions are final" — "This permit is approved — its special conditions are
  now part of the permit and can no longer be changed."
- Researcher wording, by status:
  - Out for signature: "Read these before your permit starts" — "These conditions
    apply to everyone working under your permit from the day it is active."
  - Active: "Follow every condition while you work" — "These conditions are part
    of your permit and apply to everyone working under it."

---

**Open questions**
- [ ] The locked notice doesn't currently show for Waiting for annual report or
  Expired. Should it? (Conditions can't change in either status.)

---

## Story 5 — Activate a permit by uploading the signed permit letter

**Story Title**
Activate a permit by uploading the signed permit letter

**Jira:** CSPS-409

---

**Description**

As a Responsible analyst,
I want to download the system-generated permit letter, get it signed outside the system, and upload the signed copy,
So that the signed letter becomes the permit of record and the permit becomes Active.

This replaces the DocuSign two-signature flow in CSPS-221, now deprioritized
(decision from the 2026-10-26 grilling session; reverses the "Upload signed
active permit — REMOVED" decision in decisions-roles-permissions.md and §3 / §8.2
of permissions-matrix.md). The system does not track who signed or how; uploading
the signed letter is the activation step. The "Final permit letter" tab holds both
the generated letter and, once uploaded, the signed letter.

**Roles affected:** Responsible analyst (permit-role), System Admin, HQ Technical
Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer
(read only), Researcher, PI, PICOF (notified; read only).

**Out of scope:** Generating the letter's content (review wizard, step ②).
Issuing a renewal from Waiting for annual report ("Activate permit", CSPS-406).
The Second Signer configuration and emails EM-A / EM-B, which are dropped with
DocuSign (CSPS-212, CSPS-221, CSPS-222, CSPS-223 deprioritized).

---

**Acceptance Criteria**

**Access & permissions**
- Only the Responsible analyst or a System Admin can upload the signed letter while
  the status is Out for signature.
- After activation, only a System Admin can replace the signed letter.
- After signature (Active, Waiting for annual report, Expired), only a System
  Admin can replace the signed letter, or upload one if none is on file. The
  Responsible analyst cannot.
- Every other user who can see the "Final permit letter" tab can view and
  download the letters but sees no upload or replace control.

**Happy path**
- When the Responsible analyst approves the permit in the review wizard, the system
  generates the final permit letter and sets the status to Out for signature.
- The "Final permit letter" tab shows the generated letter with a "Download
  permit letter" action.
- The Responsible analyst selects "Upload signed letter" (header or tab), selects
  "Add file" to choose one PDF, and confirms. The upload follows the file upload
  controls story: the description reads "Accepted file type: PDF. Maximum file
  size: 25 MB."
- The system stores the file as the signed permit letter, recording the uploader
  and the upload date.

**Send for signature confirmation**

*Moved here from CSPS-406 (2026-10-28): this is the step that moves a permit into
Out for signature.*

- When the Responsible analyst sends the letter for signature, a confirmation
  dialog shows:
  - Heading: "Send this letter for signature?"
  - Body: "The letter locks and the permit moves to Out for signature. Then
    download the letter, get it signed, and upload the signed copy."
  - Buttons: "Keep editing" and "Send for signature".
- If any Supporting analyst reviews aren't complete, the dialog also shows a warning
  "{n} review(s) not complete" ("1 review not complete", "3 reviews not
  complete"), with the reviewers' names listed underneath. Sending is still
  allowed.

**State & status transitions**
- On upload, the status changes from Out for signature to **Active**, unless this
  is a renewal whose previous version has no annual report, in which case it
  changes to **Waiting for annual report** (CSPS-309). It stays there until the
  Responsible analyst activates it with "Activate permit" (CSPS-406), unless they
  chose "Upload and activate" at upload (below).
- **Missing vs. overdue.** The hold triggers when the previous permit's report is
  *missing* (none on file), which is normal while that permit's 30 days to report
  are running. Once its due date passes, the report is also *overdue* and the
  previous permit is Delinquent (see "Flag overdue annual reports as Delinquent
  and block PI renewals").
- On such a renewal, the upload dialog opens with a warning callout above the
  upload area: the title "Previous permit's annual report is missing" (or "…is
  overdue" once past due), with "Permit {number} · due {date}" (or "was due
  {date}") on the line below. No other lead text — the buttons state the choice.
- The dialog has three buttons: "Cancel", "Upload and activate" (secondary), and
  "Upload and hold" (primary). Both upload buttons stay disabled until a valid
  file is chosen. A wrong-type or too-large file shows as an error item and
  doesn't turn them on (CSPS-444).
  - "Upload and hold" → **Waiting for annual report**, EM-H.
  - "Upload and activate" (the Responsible analyst's override at upload) →
    **Active**, EM-C; the hold no longer applies. The "Activate permit" header
    action on Waiting for annual report remains for holds that weren't
    overridden.
- Without a missing report, the dialog keeps "Cancel" and "Upload and activate".
- After upload, the "Final permit letter" tab shows the signed letter first,
  labeled "Signed letter", with the uploader, date, and "Download signed letter";
  the generated letter stays below it as "Unsigned letter" with "Download letter".

**Replacing the signed letter**
- Before activation, the Responsible analyst's new upload replaces the old file.
- After activation, only a System Admin can upload a replacement signed letter
  (for example, to fix a wrong file). The new file becomes the current signed
  letter, recording who replaced it and when.
- The replaced file is kept as history: it stays listed on the "Final permit
  letter" tab below the current signed letter, with its uploader, date, and a
  download action, marked as replaced.
- Replacing the signed letter doesn't change the status and sends no email.

**Admin replace (after signature)**
- On the "Final permit letter" tab, the "Signed letter" section shows "Replace
  signed letter" beside "Download signed letter" for a System Admin.
- It opens the signed-letter upload titled "Replace signed letter": "Replaces
  {file name}. The permit's status doesn't change." The confirm button is
  "Replace letter".
- With no signed letter on file, the section reads "No signed letter on file."
  and the button is "Upload signed letter". The dialog reads "The permit's status
  doesn't change." with the confirm button "Upload".
- On confirm, the new file becomes the signed letter, with the admin as uploader
  and today's date. A toast confirms "Signed letter replaced" (or "Signed letter
  uploaded") — "The permit's status didn't change."
- The replaced file stays on the record. The section shows it as "Replaced":
  "{file name} · uploaded {date} by {name}".
- The status never changes and no email is sent. "Application history" keeps the
  original upload date for "Signed letter uploaded".

**Notifications**
- Moving to Active sends **EM-C — Permit issued / active** to the Researcher
  (submitter), PI, and PICOF, with the signed letter attached and a link to the
  permit. Regulated: always sent, no opt-out.

  **Subject:** Your research permit [Permit #] is now active

  ```
  [PI name],

  Your research permit is now active.

  Permit:  [Permit #] — [Project title]
  Term:    [Permit start] – [Permit end]
  Park(s): [Park(s)]

  You may begin the authorized work within the permit term and its
  conditions. Your signed permit is attached. A copy is also in your account.

  Report any change to your project before it occurs. An annual report is
  required as specified in your permit.

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

- Moving to Waiting for annual report sends **EM-H — Renewal placed on hold** to
  the Researcher (submitter), PI, and PICOF instead. Regulated: always sent, no
  opt-out.

  **Subject:** Annual report required before permit [Permit #] can be issued

  ```
  [PI name],

  Your renewal permit is ready but is on hold. The annual report for your
  previous permit has not been received, so the new permit cannot be issued
  yet.

  Permit: [Permit #] — [Project title]

  Upload the annual report for your previous permit. We'll issue your
  new permit once we've reviewed the report.

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

**Edge cases & constraints**
- Only one signed letter is current. Uploading again before activation replaces
  the file; after activation, only a System Admin can replace it (see Admin
  replace).
- Only PDF files up to 25 MB are accepted (the same limit as the annual report,
  CSPS-410); any other type or a larger file shows an inline error and the status
  doesn't change.
- The system doesn't check the file for signatures.

**Document visibility**
- The current signed permit letter appears on: the "Final permit letter" tab;
  Uploaded Files; and the Permits index grid's permit document column.
- Uploaded Files and the Permits index grid show only the current signed letter,
  never replaced files.

**Layout**
- The generated letter fills the tab's full content width, in line with the tabs.

*This story may be large enough to split. Consider separating **document
visibility across surfaces** and **System Admin replacement** into their own
tickets.*

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Activation:** Approve a new permit as the RA → status Out for
  signature → upload a PDF → status Active; EM-C received with the signed letter
  attached, a link to the permit, and the line "Your signed permit is attached. A
  copy is also in your account."
- **Test 2 — Renewal hold:** Repeat on a renewal whose previous version has no
  annual report → the dialog shows the missing-report notification and three
  buttons; "Upload and hold" → status Waiting for annual report; EM-H received
  with the closing "Upload the annual report for your previous permit. We'll
  issue your new permit once we've reviewed the report."; no EM-C.
- **Test 2b — Override:** Same renewal, "Upload and activate" → status Active;
  EM-C received, no EM-H. With the demo clock past the previous permit's due date,
  the notification reads "…is overdue" (error).
- **Test 3 — Not RA:** As a Supporting analyst on an Out for signature permit,
  confirm no upload control on the header or tab.
- **Test 4 — File limits:** As the RA, upload a non-PDF, then a PDF over 25 MB →
  inline error each time; status stays Out for signature.
- **Test 5 — Admin replace:** On an Active permit, as a System Admin upload a
  replacement → new file is current; old file listed as replaced on the tab;
  Uploaded Files and the Permits index show only the new file; status unchanged;
  no email. As the RA, confirm no replace control.
- **Test 6 — Send for signature:** As the RA, send the letter with all reviews
  complete → dialog shows heading, body, and buttons as specified, no warning.
  Repeat with one Supporting analyst not complete → warning "1 review not complete"
  with their name; with three → "3 reviews not complete". "Send for signature"
  still works; "Keep editing" closes the dialog without changing the status.
- **Test 7 — Admin replace:** As a System Admin on an Active permit, select
  "Replace signed letter" and upload a PDF. The new file is the signed letter, the
  old one shows under "Replaced", the status stays Active, and "Signed letter
  uploaded" in Application history keeps the original date. As the RA, an HQ
  Technical Reviewer, or the Researcher, confirm there is no "Replace signed
  letter".

---

**Open questions**
- [x] Can a System Admin replace a signed letter after activation (e.g. wrong
  file uploaded)? If so, what is logged? — **Resolved:** yes, see Admin replace.
  The replaced file is kept on the record.
- [ ] Should a replace notify anyone (the Responsible analyst, or the Researcher,
  PI, and PICOF)? The prototype sends no email.

---

## Story 6 — Let researchers upload the annual report document on a permit

**Story Title**
Let researchers upload the annual report document on a permit

**Jira:** CSPS-410

---

**Description**

As a Researcher who owns an Active or Expired permit (submitter, PI, or PICOF),
I want to upload my annual report document on the permit,
So that I meet the permit's reporting requirement and keep my renewals unblocked.

The annual report is a **document upload, not a form**. A permit owes one, due 30
days after it expires, and the owner can upload it any time the permit is Active
or Expired. The Responsible analyst or a System Admin can also upload it (for
example, when the researcher emailed it). Every upload is a **new version of the
same document**; the newest version is current. **One version on file completes
the requirement.** The Responsible analyst can send the current version back with a
message, which reopens the requirement. Only the Responsible analyst or a System
Admin can remove a version. All copy says "annual report" (the prototype's "Final
report" wording is renamed).

The report belongs to the permit it reports on. A renewal never accepts its
predecessor's report; the report is uploaded on the previous permit.

**Roles affected:** Researcher (owner: submitter, PI, PICOF); Responsible analyst
(permit-role: reviews, may send back, may upload, may remove versions; notified);
Responsible analyst of a renewal on hold for this report (notified); System Admin,
HQ Technical Reviewer, District Lead Technical Reviewer, District Assistant
Technical Reviewer, Supporting analysts (read).

**Out of scope:** Overdue and Delinquent handling (CSPS-411). Issuing a renewal
from Waiting for annual report ("Activate permit", CSPS-406). The prototype's
/report form page, which this story retires.

---

**Acceptance Criteria**

**Access & permissions**
- Any owner (submitter, PI, or PICOF), the Responsible analyst, or a System Admin
  can upload while the status is Active or Expired. Supporting analysts and other
  reviewers cannot. Upload isn't offered in any other status, including Waiting
  for annual report.
- Only the Responsible analyst or a System Admin can send a report back or remove a
  version. Researchers cannot remove a version once uploaded, including their own.
- "Request changes" isn't offered on a version the Responsible analyst uploaded
  themselves; they upload a new version instead.
- Every staff user who can open the permit can view and download uploaded reports.

**Happy path**
- On the "Annual report" tab, the owner selects "Upload file" and picks a file;
  it uploads immediately, with no separate confirm step, and a toast confirms
  "Version {n} uploaded".
- The system records the file as the next version number, with the uploader and
  date, makes it the current version, and marks the requirement **Complete**.
- The "Versions" table lists every version, newest first, with "Version", "File",
  "Uploaded by", "Date", and "Status" ("Complete", "Changes requested", or
  "Replaced" for earlier versions), and a "Download" action.
- Once a version is on file, a "Report" section shows the current version in the
  inline document viewer, the same one the application's documents use, so no one
  has to download it to read it. It sits above the upload area and the versions
  table and fills the tab's full content width.
- The viewer's picker lists every version, newest first ("Version {n} (current)",
  then "Version {n-1}", …). Picking one shows it; the file name, uploader, and date
  show beside the picker, with an "Open" link.
- After an upload, a send-back, or a removal, the viewer shows the new current
  version.

**State & status transitions**
- **Send back:** the Responsible analyst selects "Request changes" on the report and
  must enter a message. The requirement returns to **Changes requested**; the
  report stays visible, marked as sent back with the message, date, and sender.
- The owner can upload a new version at any time, including after the report is
  Complete. The new version becomes current; earlier versions stay listed.
- **Remove:** the Responsible analyst or a System Admin selects "Remove" on a
  version and confirms. The previous version becomes current; if none is left, the
  report is due again (and Delinquent if past the due date). Version numbers are
  never reused. Removing a version sends no email.
- The permit's status (Active or Expired) never changes because of an upload or a
  send-back.
- **Renewal on hold:** uploading the report doesn't change a renewal that's in
  Waiting for annual report. The renewal stays on hold until its Responsible analyst
  reviews the report and issues the renewal by hand with "Activate permit"
  (CSPS-406), which moves it to Active and sends EM-C.

**UI & field details**
- The upload area is headed "Upload report" (no versions yet), "Upload new
  version" (a version stands), or "Upload revised report" (after a send-back). The
  hint reads "One document completes the requirement." before the first upload,
  then "Each upload becomes the current version.", followed by "Accepted file
  type: PDF. Maximum file size: 25 MB." It reads the same for the owner and for
  staff.
- A wrong-type or too-large file isn't uploaded. It shows under the button as an
  error item ("Unsupported file type" / "File too large") that the user can
  remove, per the file upload controls story.
- The remove confirmation (danger) reads "Remove version {n}?" — "Version {n-1}
  becomes current. This can't be undone." for the current version, "No version
  will be on file, so the report is due again. This can't be undone." for the only
  version, or "This can't be undone." for an earlier version. Buttons: "Cancel",
  "Remove".
- The tab's notice: "Due {date}" (before upload), "Report complete" — "{name}
  uploaded it on {date}.", "Changes requested" — "{name}, {date}: “{message}”".
- The "Request changes" dialog: "The researcher, PI, and PICOF get your message by
  email." with the field "What needs to change" (error: "Enter what needs to
  change.").

**Notifications: EM-J (annual report uploaded)**
- Every upload, including a new version after Complete, sends **EM-J — Annual
  report uploaded** to:
  - the permit's Responsible analyst, always; and
  - the Responsible analyst of the permit's renewal, only while that renewal is in
    Waiting for annual report.
- When the permit's RA and the renewal's RA are the same person, they get one
  email: the renewal RA's version, since it carries their next step.
- The uploader is never emailed about their own upload, in any role. If no one
  else qualifies, no email is sent.
- Supporting analysts and the Researcher, PI, and PICOF don't receive EM-J,
  including when staff upload the report for them.
- EM-J is opt-out (Profile: "Status changes"). No separate "new version" email.

  **To the permit's Responsible analyst**

  **Subject:** Annual report uploaded — permit [Permit #]

  ```
  [First name],

  [Uploaded by] uploaded the annual report for permit [Permit #].
  You're its Responsible analyst.

  Permit: [Permit #] — [Project title]
  File:   [File name]

  Review it on the permit's Annual report tab.

  [Open permit]

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

  **To the renewal's Responsible analyst (renewal on hold)**

  **Subject:** Annual report uploaded — permit [Permit #]

  ```
  [First name],

  [Uploaded by] uploaded the annual report for permit [Permit #].
  Review it on the permit's Annual report tab, then issue renewal
  [Renewal #]. The renewal stays on hold until you do.

  Permit: [Permit #] — [Project title]
  File:   [File name]

  [Open permit]

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

**Notifications: EM-K (changes requested)**
- A send-back sends **EM-K — Annual report: changes requested** to the Researcher
  (submitter), PI, and PICOF with the Responsible analyst's message. Regulated:
  always sent, no opt-out.
- When the report is past due, EM-K includes the [Past due line]: "Your report is
  past due, so you can't apply for, renew, or amend a permit as PI until the
  revised report is in." Otherwise that line is left out.

  **Subject:** Annual report needs changes — permit [Permit #]

  ```
  [PI name],

  The review team needs changes to your annual report.

  Permit: [Permit #] — [Project title]

  Their message:
  [Message]

  Upload a revised report on your permit's Annual report tab.
  [Past due line]

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

**Edge cases & constraints**
- Only PDF files up to 25 MB are accepted (the same limit as the signed letter,
  CSPS-409); any other type or a larger file shows an inline error and nothing is
  uploaded.
- The newest remaining version is always the one under review.

**Document visibility**
- Uploaded reports appear on the "Annual report" tab (shown in the viewer and
  listed in Versions) and in Uploaded Files.

*This story may be large enough to split. Consider separating **the Responsible
analyst's send-back** into its own ticket.*

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Upload completes:** As the PI on an Active permit with no renewal,
  upload a PDF → requirement Complete; only the RA receives EM-J with "You're its
  Responsible analyst."; Supporting analysts get nothing.
- **Test 2 — Renewal on hold:** On a permit whose renewal (different RA) is
  Waiting for annual report, upload as the PI → the renewal stays in Waiting for
  annual report; no EM-C; permit RA gets the standard EM-J; renewal RA gets the
  version asking them to review the report and issue renewal [Renewal #].
- **Test 3 — Renewal not on hold:** On a permit whose renewal (different RA) is in
  any other status, upload as the PI → only the perm…
  *[Rest of Test 3, all of Test 4, and the start of Test 5 were lost when copying
  from Jira — re-fetch from CSPS-410.]*
- **Test 5 — Uploader not emailed:** As the permit's RA (also the renewal's RA,
  renewal on hold), upload a report → no EM-J is sent; no "Request changes" on
  that version for the RA.
- **Test 6 — Send back:** As the RA, select "Request changes" with a message on a
  version the PI uploaded → requirement Changes requested; Researcher, PI, and
  PICOF receive EM-K with the message and no past-due line. Repeat after the due
  date → EM-K includes the past-due line. Upload again → Complete.
- **Test 7 — Versions:** As the PI, upload twice → versions 1 and 2, version 2
  Complete, version 1 Replaced; no "Remove" for the PI; EM-J sent for each upload.
- **Test 8 — Remove:** As the RA, remove version 2 → version 1 becomes current, no
  email; remove version 1 → report due again.
- **Test 9 — Wrong status:** On an Under review or Waiting for annual report
  permit, confirm no upload control.
- **Test 10 — File limits:** Upload a non-PDF, then a PDF over 25 MB → inline
  error each time; no version added.
- **Test 11 — Read in place:** Upload a version. The "Report" section shows it
  without downloading. Upload another, and the viewer switches to it; picking
  "Version 1" shows the earlier file.

---

## Story 7 — Flag overdue annual reports as Delinquent and block PI renewals

**Story Title**
Flag overdue annual reports as Delinquent and block PI renewals

**Jira:** CSPS-411

---

**Description**

As a Responsible analyst,
I want a permit with an overdue annual report to be flagged Delinquent automatically and to block its PI's new applications, with the option to lift the block,
So that reporting is enforced without manual tracking, and I can make an exception when there's a reason to.

**Delinquent is a label, not a status.** Because the single annual report becomes
due at expiry, the label sits on an **Expired** permit. This differs from the
matrix's current wording ("a label on an already-Active permit"); the matrix
needs updating.

**Roles affected:** Responsible analyst (permit-role), System Admin (lift/restore),
HQ Technical Reviewer, District Lead Technical Reviewer, District Assistant
Technical Reviewer (read), Researcher, PI, PICOF.

**Out of scope:** The Waiting for annual report hold on renewals (CSPS-309). A
renewal leaves that hold only when its Responsible analyst issues it by hand with
"Activate permit" (CSPS-406); uploading the report never releases it. Uploading
and sending back the report, including EM-K's past-due line (CSPS-410).

---

**Acceptance Criteria**

**Access & permissions**
- Only the Responsible analyst or a System Admin sees "Lift renewal block" and
  "Restore renewal block".

**State & status transitions**
- The day after the due date, if no report is on file, the system adds the
  **Delinquent** label to the permit. The status stays Expired.
- While Delinquent and not lifted, the PI cannot start a new application,
  renewal, or amendment **in which they are the PI**. The block doesn't apply when
  the same person is a PICOF or participant on someone else's application.
- "Lift renewal block" removes the PI block and records who lifted it and when;
  the report is still due and the Delinquent label stays.
- "Restore renewal block" reinstates the PI block.
- Uploading an annual report removes the Delinquent label and the block.
- If the Responsible analyst requests changes on the report after the due date, the
  Delinquent label and the block return until a new document is uploaded.

**UI & field details**
- The Delinquent label shows only on the overdue permit: on its header and as a
  Kanban lane on My permits. There is no manual "Flag delinquent" action.
- On the overdue permit's "Annual report" tab, an error notice shows "Report
  overdue" — "It was due {date}." (plus the requested changes, if any).
- While the block is in force, each of the PI's **other** permits shows a
  **warning** in its alerts stack (CSPS-413). It's a warning, not an error,
  because that permit isn't the overdue one:
  - Title: "Renewals blocked — annual report overdue on [Permit #]"
  - Subtitle: "Upload it to apply for, renew, or amend a permit as PI."
  - Action: "Go to [Permit #]", which opens the overdue permit's Annual report
    tab.
- On /apply, a blocked PI sees an error notification: "Annual report overdue —
  you can't apply as PI", with the subtitle "Upload the report for permit
  [Permit #] to apply again." It links to that permit's Annual report tab.
- "Lift renewal block" and "Restore renewal block" are actions on the permit
  alerts (CSPS-413).
- Lifting or restoring shows a success toast ("Renewal block lifted" / "Renewal
  block restored").

**Notifications**
- When the Delinquent label is first added, an email goes to the Researcher
  (submitter), PI, and PICOF. Regulated: always sent, no opt-out.

  **Subject:** Annual report overdue — permit [Permit #]

  ```
  [PI name],

  The annual report for permit [Permit #] — [Project title] was due
  [Due date]. Until it's uploaded, you can't apply for, renew, or amend a
  permit as PI.

  Upload it on your permit's Annual report tab.

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

- At the same time, an email goes to the permit's Responsible analyst. Opt-out
  allowed (Profile: "Status changes", on by default). Turning it off hides
  nothing: the label and alert still show on the permit.

  **Subject:** Annual report overdue — permit [Permit #]

  ```
  [First name],

  The annual report for permit [Permit #] — [Project title] was due
  [Due date]. The PI is blocked from new permits until it's in. You can
  lift the block from the permit.

  [Open permit]

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

- When a send-back after the due date brings the Delinquent label back, neither
  overdue email is sent again. The Researcher, PI, and PICOF get EM-K with its
  past-due line instead (CSPS-410); the Responsible analyst caused the send-back and
  gets no email.

*This story may be large enough to split. Consider separating **the PI block on
/apply and other permits** from **the Delinquent label, emails, and lift/restore
controls**.*

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Auto-flag:** Use an expired permit with no report and move the demo
  clock past the due date (?today=YYYY-MM-DD) → Delinquent label on that permit
  only, error notice on its Annual report tab; Researcher, PI, PICOF, and RA
  receive the overdue emails.
- **Test 2 — RA opt-out:** Turn off "Status changes" for the RA and repeat Test 1
  → RA gets no email; label and alert still show.
- **Test 3 — Block on /apply:** As the PI, open /apply → error notification with
  the specified title, subtitle, and link to the overdue permit's Annual report
  tab; can't start an application as PI.
- **Test 4 — Other roles not blocked:** As the same person, join someone else's
  application as PICOF or participant → allowed.
- **Test 5 — Other permits:** Open another of the PI's permits → warning alert
  with the specified title, subtitle, and "Go to [Permit #]"; no Delinquent label.
- **Test 6 — Lift:** As the RA, select "Lift renewal block" → PI can apply; label
  remains; notice names who lifted it.
- **Test 7 — Upload clears:** Upload the report as the PI → label, block, and
  alerts cleared. Any renewal in Waiting for annual report stays on hold until its
  RA issues it.
- **Test 8 — Send-back re-flags:** Past the due date, as the RA select "Request
  changes" on the report → label and block return; no overdue emails; Researcher,
  PI, and PICOF receive EM-K with the past-due line.

---

## Story 8 — Show a PII-free public view of issued permits

**Story Title**
Show a PII-free public view of issued permits

---

**Description**

As a member of the public or a signed-in user who doesn't own the permit,
I want to read the public summary of an issued research permit,
So that I can see what research is authorized in a park without seeing personal
or internal information.

**Roles affected:** Logged-out visitor, Researcher (non-owner), Pending user.

**Out of scope:** Public search and listing of permits.

---

**Acceptance Criteria**

**Access & permissions**
- The public view is available only for Active and Expired permits. Any other
  status redirects a non-owner to Search (logged out) or My permits (signed in).

**UI & field details**
- The permit alerts (Story 9) show "Public view" — "Personal details and internal
  review information aren't shown."
- Shown: permit number, project title, organization, parks and districts, permit
  type, category, project and permit dates, status.
- Hidden: all person names (PI, PICOF, research team, submitter), all Internal
  Review content, the "Final permit letter" and "Annual report" tabs, the special
  conditions, and the signed permit PDF.

- The Overview (Story 10) shows the public its stage, dates, parks, and
  collection, without the "Responsible analyst" tile, on-site contacts, the
  annual report line, or the "Special conditions" tile.

**Edge cases & constraints**
- The Delinquent label is not shown in the public view.

---

**Open questions**
- [ ] The Overview hides the on-site contacts from the public (Story 10). Should
  the Application tab's "Authorized parks" section hide them too?

---

## Story 9 — Show permit alerts in one stack under the header

**Story Title**
Show permit alerts in one stack under the header

**Jira:** CSPS-413

---

**Description**

As any user who opens a permit (HQ Technical Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer, System Admin, or Researcher who owns the permit),
I want every page-level alert about the permit shown in one place, most urgent first,
So that I see what needs attention whichever tab I'm on, without scanning the page for scattered banners.

Alerts describe the permit's **state**; each one appears while its condition holds
and clears when the condition is resolved. They can't be dismissed. One shared set
of rules decides which alerts apply, for whom, and how urgent they are, so new
alerts are added in one place. Notices about a single tab stay in that tab (e.g.
"Conditions are final" on Special conditions, the report status on Annual report).

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (permit-roles: Responsible analyst,
Supporting analyst, Not assigned), Researcher (owner: submitter, PI, PICOF).

**Out of scope:** The Overview tab (TBD, work in progress). Transient action
confirmations, which stay toasts. Email notifications for any alert. The renewal
action itself (the PI starts a renewal from an Active or Expired permit; not
designed yet). Alerts on the Permits index or My permits (start with a count or
status on My permits later, decided after testing). Any change to who can open a
permit; access stays as the system works today.

---

**Acceptance Criteria**

**UI & field details**
- Alerts appear in one stack between the permit header and the tab strip, on
  every tab. With no alerts, the stack takes no space.
- Alerts are ordered by severity (error, then warning, then info) and then by the
  catalog order below.
- Every error alert always shows. Up to two warning and info alerts show; the rest
  are behind "Show {n} more", which toggles to "Show less".
- Each alert has a title, an optional subtitle, and at most one action.
- Alerts have no close button.
- On a Delinquent permit, the "Report overdue" alert shows alongside the
  Delinquent label in the header: the label is the permit's state, and the alert
  explains it and carries the action.

**Catalog**

| Alert | Shows when | Staff (title — action) | Owner (title — action) | Kind |
| --- | --- | --- | --- | --- |
| Report overdue | Active/Expired, annual report past due, block not lifted | "Annual report overdue — renewals blocked" — "Lift renewal block" (RA/Admin) or "View report" | "Annual report overdue — renewals blocked" — "Upload annual report" | Error |
| Changes requested | Returned to submitter | "Returned to the researcher" (no action) | "Changes requested" — "Review requested changes" | Staff: Info. Owner: Warning |
| Report needs changes | Latest report version sent back | "Annual report needs changes" — "View report" | "Annual report needs changes" — "Upload revised report" | Warning |
| Renewal on hold | Waiting for annual report | "On hold for the previous annual report" | "Your permit is on hold" | Warning |
| Renewals blocked | This permit's PI is blocked by an overdue report on another permit (CSPS-411) | "Renewals blocked — annual report overdue on [Permit #]", subtitle "The PI can't apply for, renew, or amend a permit until it's in." — "Go to [Permit #]" | "Renewals blocked — annual report overdue on [Permit #]", subtitle "Upload it to apply for, renew, or amend a permit as PI." — "Go to [Permit #]" | Warning |
| Ending soon | Active, 30 or fewer days left | "Permit ends in {n} days" (info) | "Your permit ends in {n} days" — "Request amendment" | Warning |
| Previous report missing | A renewal before activation (Waiting for review → Out for signature) whose previous permit has no annual report; error once that report is overdue | "Previous permit's annual report is missing" / "…is overdue" — subtitle "Permit {number} · due {date}. If it's still missing when the signed letter is uploaded, this renewal goes on hold." | "Upload your previous permit's annual report" / "Your previous permit's annual report is overdue" — "Go to My permits" | Warning / Error |
| Signed letter missing | Out for signature, no signed letter | "Waiting for the signed letter" — "Upload signed letter" (RA/Admin); subtitle "When you upload it, choose to hold the permit or activate it." when the previous report is missing | — | Info |
| Start review | Waiting for review, not started; RA/Admin only | "Start your review" — "Start review" | — | Info |
| Block lifted | Report overdue, block lifted | "Annual report overdue — renewal block lifted" — "Restore renewal block" (RA/Admin) | Same title — "Upload annual report" | Info |
| Report due | Permit ended, report not yet due | "Annual report due {date}" | "Annual report due {date}" — "Upload annual report" | Info |
| Amendment | An amendment was started from this permit | "Amendment {number} in progress" — "View amendment" | Same | Info |
| Renewal | A renewal was started from this permit | "Renewed as {number}", linking to the renewal's permit page | Same | Info |

**State & status transitions**
- Alerts update without a reload when the status changes, a report version is
  uploaded or sent back, or the renewal block is lifted or restored.
- "Lift renewal block" and "Restore renewal block" act in place and confirm with a
  toast; the alert changes to match.
- "View report", "Upload annual report", and "Upload revised report" switch to the
  Annual report tab. "Go to [Permit #]" opens the overdue permit's Annual report
  tab. "Upload signed letter" opens the signed-letter upload (CSPS-409). "Start
  review" starts the review exactly like the header action (CSPS-406).

**Access & permissions**
- Actions marked RA/Admin appear only to the Responsible analyst or a System Admin.

*This story may be large enough to split. Consider separating **the stack itself
(order, cap, Show more)** from **the alert catalog**, and adding catalog entries
as their own tickets.*

---

**Testing notes**

- **Test 1 — Cap:** As the RA on an Expired permit past the report due date, with
  an amendment started and ?renewal=1 → the overdue error, the amendment, and the
  renewal all show (error plus two info). Add a third warning or info alert →
  "Show 1 more" appears; the error is never hidden.
- **Test 2 — Lift:** Select "Lift renewal block" → toast; the error becomes the
  info "renewal block lifted" with "Restore renewal block".
- **Test 3 — Audience:** View the same permit as the Researcher owner and a
  Supporting analyst; confirm the wording, actions, and kind per the catalog (e.g.
  on Returned to submitter, staff see Info and the owner sees Warning).
- **Test 4 — Label and alert:** On a Delinquent permit, confirm the header shows
  the Delinquent label and the stack shows "Report overdue".
- **Test 5 — Renewal link:** Select "Renewed as {number}" → the renewal's permit
  page opens.
- **Test 6 — Renewals blocked:** Open one of the PI's permits that isn't the
  overdue one, as the PI and then as staff → "Renewals blocked" warning with the
  owner or staff subtitle; "Go to [Permit #]" opens the overdue permit's Annual
  report tab for both.

---

## Story 10 — Show one shared Overview of the permit's stage and key facts

**Story Title**
Show one shared Overview of the permit's stage and key facts

---

**Description**

As a Researcher who owns the permit, a reviewer (HQ Technical Reviewer, District
Lead Technical Reviewer, District Assistant Technical Reviewer, System Admin), or a
public viewer,
I want the first tab to tell me where the permit stands and what it asks for or
allows — where, when, and who to contact — on one screen,
So that I don't have to read the whole application to get my bearings, and staff
and researchers describe the permit the same way.

The Overview is for orientation only. It **never repeats** the header (status, tags,
the one action button — Story 2) or the alert stack (Story 9); it adds detail to
them (a countdown, the analyst's email). Everything clickable is a **link** that
moves around the page; actions stay in the header. Every viewer sees the **same
blocks in the same order**; only the wording changes. Values read **requested**
before a decision and **authorized** from Out for signature on.

**Roles affected:** Researcher (owner: submitter, PI, PICOF), System Admin, HQ
Technical Reviewer, District Lead Technical Reviewer, District Assistant Technical
Reviewer (any permit-role), logged-out visitor and non-owner Researcher (public
view, Story 8).

**Out of scope:** Internal review material — Story 11. The screening flags (Soil
disturbance, Beyond simple use, Additional permit required) stay header tags only.
Request amendment stays in the header's Active menu (Story 2) and the ending-soon
alert (Story 9). Recording who withdrew an application and when.

---

**Acceptance Criteria**

**UI & field details**
- The Overview shows, in order: the summary band, a "Needs your action" / "Changes
  requested" list (returned applications only), Schedule beside People, "About
  this research", and the parks (see Layout below). "Application history" sits in
  the side rail (Story 11 moves the Analysis team out).
- The summary cell has the status and one "what happens next" line — no tracker. The
  permit's progress is shown once, in "Application history".
- "Application history" is the one progress tracker, in four phases: Presubmittal
  ("Application started", "Application signed", "Application submitted"), In review
  ("Responsible analyst review completed" and "Supporting analysts review completed" —
  staff only — "Returned for changes", "Application withdrawn", "Decision reached"),
  Signature ("Signed letter uploaded", "On hold for the previous annual report"),
  and Active permit ("Permit active", "Permit expired", "Annual report uploaded").
- The live status sets each step: steps before the current one are complete and
  dated, the current step is highlighted, later steps are pending. When the current
  step is staff only, the owner and the public see the next step as current.
- Phases that haven't started fold into one line, "Next: {phase} · {phase}", so the
  rail shows what has happened plus the current phase.
- Branch steps appear only when they happened ("Returned for changes" once returned,
  "Application withdrawn", "On hold…" while held). "Decision reached" reads
  "Approved" or "Not approved" with its date. A rejected or withdrawn application
  ends at that step, marked invalid, and drops the later phases. An overdue annual
  report marks "Annual report uploaded" invalid with "Overdue".
- The stage card's title is the **status**, exactly as the header shows it
  ("Active", "Under review", …). The line under it says what comes next (owner /
  staff and public):

  | Status | Owner | Staff (public where it differs) |
  |---|---|---|
  | Draft | "Next: submit your application to start the review." | "Next: the researcher submits the application." |
  | Waiting for review | "Next: the review team starts the review." | same |
  | Under review | "Next: a decision. You'll get an email when it's made." | "Next: a decision, once the review team is done." |
  | Returned to submitter | "Next: make the changes below, then resubmit your application." | "Next: the researcher makes the changes and resubmits." |
  | Out for signature | "Next: the signed letter makes your permit active. Read the letter and its special conditions now." | "Next: the signed letter is uploaded and the permit becomes active." |
  | Waiting for annual report | "Next: it becomes active once your previous permit's annual report is in." | "Next: it becomes active once the previous permit's annual report is in." |
  | Active | "Next: the permit ends {end}. The annual report is due {due}." | same (public: "Next: the permit ends {end}.") |
  | Expired | "Next: upload your annual report by {due}." · overdue: "The annual report was due {due}." · uploaded: "Nothing left to do — the annual report is in." | "Next: the researcher uploads the annual report by {due}." (same overdue / uploaded lines; public: "It ran {start} – {end}.") |
  | Rejected | the rejection reason | same |
  | Withdrawn | "Withdrawn before a decision. It won't be reviewed." | same |

- **Key dates** — from Out for signature on, the stage card shows the deadlines as
  figures under the status instead of a sentence: Out for signature / Waiting for
  annual report — "Starts" ({start}, "In {n} days") and "Ends"; Active — "Permit
  ends" ({end}, "{n} days left") and "Annual report due" ({due}, "{n} days left");
  Expired — "Ended" and "Annual report due" ({due}, "{n} days left", or an
  "Overdue" status indicator once past due), or "Annual report" "Uploaded {date}"
  once in. "Changes requested" shows under the report date when it was sent back.
  The report figure links to "Go to the annual report". On Active and Expired the
  "Next: …" line is hidden — the figures say it. The public view shows only the
  permit's dates, never the report. The timeline's text no longer repeats the
  countdown or the report line.
- Stage links (owner only, all links, never buttons): "Continue your application"
  (Draft), "Read the permit letter" (Out for signature; staff too), "Apply again"
  (Rejected), "Apply for a new permit" (Expired, hidden while the PI's renewals are
  blocked — Story 7).
- Labels say **Requested** before Out for signature and **Authorized** from it on
  (dates, specimens, parks). The full special-conditions text stays on its tab.
- **Layout (Carbon dashboard pattern):**
  1. A **band** on one surface with 1px dividers: the **summary** cell (the status,
     then the "Next: …" line or the key dates, and the stage links) beside a grid of
     **six figures** that never move — "Requested dates" / "Authorized dates" (the
     exact start and end dates — every permit runs one year, so no duration), "Field visits" (the total; "Next {date}
     · {n} to go", "Under way …", or "All past · last {date}"; "See the schedule"),
     "Special conditions" (the count and a per-owner breakdown once authorized,
     "Read the conditions"; before that "—" with "Final once approved"; the public
     sees "—"), "Requested specimens" / "Authorized specimens" ("See specimens"),
     "Species" (the same word as the Application tab's specimens table), and "Research team" (the PI, the PICOF, and the participants, one
     person counted once — "PI and {n} participants"). Three figures across, two on
     a narrow column; the summary stacks above them below ~48rem.
  2. **Schedule** (the timeline) beside **People**: "Principal investigator",
     "PICOF (in direct charge of field work)", and "Submitter" before Out for
     signature, each with an initials chip, name, email + copy, and phone; one
     person holding two roles is one entry with both labels. The public view has no
     People panel and the Schedule takes the full width.
  3. **About this research** — the first three lines of the purpose and "Read the
     full project description".
  4. The **parks** block.
  There is no parks figure: the parks appear once, in their own block.
- **Titles:** panel titles ("Schedule", "People", "About this research", the parks
  block) share one size; field labels inside panels and cells ("Field visits",
  "Principal investigator", "Permit ends") share a smaller one. The status leads at
  the largest size; figures are large numbers.
- The **timeline** (the Schedule panel) is a strip that spans the permit window —
  extended to the annual report's due date on Active and Expired permits (not in the
  public view) — and marks: the elapsed share (filled, Active and Expired only), each
  field visit (hollow = upcoming, filled = past, large blue = next), today (a bar,
  labelled "Today"), the window's end (a tick), and the report due date (a diamond,
  "Report due {date}"). A legend names each shape; meaning never rests on colour
  alone. The strip is decorative for screen readers — the text above it carries the
  same facts. Links: "See the schedule", and "Go to the annual report" once owed.
- The parks appear **once**, never also as a tile, in the **same district blocks** as
  the Application tab's Authorized parks (district, park count, its parks), capped at
  5 parks with "See all {n} parks". Both surfaces render from one shared component,
  so they match. Before Out for signature the block is "Requested parks", park names
  only (contacts aren't final until the letter is). From Out for signature on it is
  "Authorized parks and contacts" and adds each district's contacts and each park's
  own contact (initials, email + copy, phone).
- On a phone, tiles stack in the order above; on wider screens they sit up to three
  to a row. No tile changes size or layout between states.

**Access & permissions**
- Every viewer who can open the permit sees the Overview, and it is the tab every
  viewer lands on.
- The **responsible analyst is not on the Overview** for any viewer — no tile, no
  name, no mention in the stage copy. Staff find them in the header's "Responsible
  analyst" fact and on Internal review (Story 11). They are **never disclosed to a
  Researcher** (owner) or the public: the header hides that fact for them.
- The public view also hides every person tile (principal investigator, submitter,
  PICOF), the annual report line, the
  "Special conditions" tile, and the returned-changes list; its parks section is
  titled "Authorized parks" and never shows contacts.

**State & status transitions**
- The stage, labels, countdown, tiles, annual report line, and Application history
  update without a reload when the status changes or a report version is uploaded
  or sent back.

**Edge cases & constraints**
- The Overview shows no buttons, no alert text, and no header fact repeated word for
  word.
- A Researcher who owns a Withdrawn application can open it (previously redirected).

---

This story may be large enough to split. Consider separating **the stage card**
from **the fact tiles**, and the **authorized parks with contacts** tile into its own
ticket.

---

**Testing notes**

- **Test 1 — Requested → authorized:** As the RA, view an Under review permit
  (labels read "Requested …", no conditions tile). Move it to Out for signature;
  confirm the labels read "Authorized …", the conditions tile appears, and
  "Authorized parks and contacts" appears below the tiles, matching the Application
  tab's Authorized parks.
- **Test 2 — Same blocks, different words:** Open one Active permit as the
  researcher owner, the RA, and logged out; confirm the order of blocks matches and
  only the wording and the public removals differ.
- **Test 3 — Countdown and report:** Use `?today=` to put an Active permit before
  its start ("Starts in …"), mid-window ("… days left"), and past expiry with no
  report ("Annual report was due …").
- **Test 4 — Park cap:** On a permit with more than 5 authorized parks, confirm at
  most 5 show and "See all {n} parks" opens Authorized parks on the Application tab.
- **Test 5 — Field visit:** Use `?today=` before, during, and after the field
  sessions; confirm "Next field visit", "Field visit under way", and "Last field
  visit".

---

**Open questions**
- [ ] Withdrawn: should the system record who withdrew and when, so the stage line
  can say "Withdrawn {date} by {name}"? (The Overview already reads such a record
  if one exists.)
- [ ] Is 5 the right park cap for the parks block?
- [ ] The responsible analyst can also be a district contact (on this permit J.
  Okafor is North Coast's district contact), so their name reaches the researcher
  through "Authorized parks and contacts" and the letter. Is that acceptable, since
  they're shown as a district contact, not as the analyst?
- [ ] The owner's "Annual report needs changes" alert (Story 9) and the Annual
  report tab name the person who sent the report back — usually the responsible
  analyst. Should those read "The review team" for researchers?

---

## Story 11 — Move internal review work to a staff-only Internal review tab

**Story Title**
Move internal review work to a staff-only Internal review tab

---

**Description**

As an HQ Technical Reviewer, District Lead Technical Reviewer, District Assistant
Technical Reviewer, or System Admin,
I want the review team's workspace — supporting review, tags, comments, and the
analysis team — on its own tab,
So that the Overview can be shared with researchers and the public, and nothing
internal leaks because one section was missed.

The privacy line is the **tab**: hiding the tab hides everything internal at once,
so new internal sections are protected by default. Because the tab says it's
internal, the per-section "Internal only" flags on Tags, Comments, and Analysis team
are removed.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (any permit-role); Researcher and
public viewer (lose access to nothing they could see before).

**Out of scope:** Changes to the sections themselves (tags, comments, supporting
review, analysis team). The anchored-comments study (`?comments=anchored`) keeps its
header panel.

---

**Acceptance Criteria**

**Access & permissions**
- "Internal review" is the last tab and appears only to System Admin, HQ Technical
  Reviewer, District Lead Technical Reviewer, and District Assistant Technical
  Reviewer, in every status.
- A Researcher (owner) or public viewer never sees the tab; `#internal` opens
  "Overview" for them.

**UI & field details**
- The tab holds, in order: "Supporting review" (Supporting analyst, Under review only —
  unchanged), "Tags", "Comments"; the side rail holds "Analysis team".
- The tab label reads "Internal review ({n})", where {n} is the number of open
  comments (resolved ones don't count); with none it reads "Internal review". Screen
  readers hear "Internal review ({n}), open comments".
- The Overview no longer holds Tags, Comments, Supporting review, or the Analysis
  team; its rail shows only "Application history".
- The "Internal only" flags are removed from Tags, Comments, and Analysis team.

**State & status transitions**
- Posting a comment, or resolving or reopening one, updates the count in the tab
  label without a reload.

**Edge cases & constraints**
- Staff still land on "Overview"; the header keeps the analysis team's progress
  metric.

---

**Testing notes**

- **Test 1 — Gate:** As the researcher owner and logged out, confirm no "Internal
  review" tab and that `#internal` opens Overview.
- **Test 2 — Count:** As the RA, note the count, post a comment, and confirm it goes
  up by one.

---

**Open questions**
- [ ] Should a Supporting analyst who still owes their review see a cue on the
  Overview or the tab label, now that "Supporting review" moved off the landing tab?
