# Permit detail page — new version

Stories for the reworked **permit detail page** (`/permit`): the read-only record a
reviewer, a researcher who owns the permit, or the public opens for one application
or permit. Written against the current prototype, with these decisions from the
2026-10-26 grilling session:

- **Activation is a signed-letter upload, not DocuSign.** The system generates the
  final permit letter; the **Responsible Agent** downloads it, has it signed outside
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
  the Responsible Agent sends it back. **Delinquent** is a label, not a status,
  set automatically once the report is overdue; the Responsible Agent or a System
  Admin can lift its renewal block. The renewal pre-activation hold remains
  **Waiting for annual report**.
- **The Overview tab is TBD (work in progress)** and is not described in these
  stories. Anything that will surface there (stage summary, report notices,
  lift/restore controls) is noted as "placement TBD".

Related: the
authorized-parks table in [`stories-study-areas-contacts-table.md`](stories-study-areas-contacts-table.md);
the schedule calendar in [`stories-schedule-calendar.md`](stories-schedule-calendar.md);
the document viewer in [`stories-document-viewer.md`](stories-document-viewer.md);
regulated email copy in [`email-copy-notifications.md`](email-copy-notifications.md).

| # | Story |
|---|---|
| 1 | Restructure the permit detail page into five record tabs |
| 2 | Show status- and permit-role-driven actions in the permit header |
| 3 | Present the full application as one read-only scroll with a contents rail |
| 4 | Group special conditions by owner with a contents rail |
| 5 | Activate a permit by uploading the signed permit letter |
| 6 | Let a researcher upload the annual report document |
| 7 | Flag overdue annual reports as Delinquent and block the PI's renewals |
| 8 | Show a PII-free public view of issued permits |
| 9 | Show permit alerts in one stack under the header |

---

## Story 1 — Restructure the permit detail page into five record tabs

**Story Title**
Restructure the permit detail page into five record tabs

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
gated tabs. The detail page is **read-only**: every edit happens in the review
wizard, reached by **Start review** / **Open review** (Story 2).

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (owner: submitter, PI,
or PICOF), public viewer (see Story 8).

**Out of scope:** The content of each tab — see Stories 3–8. The **Overview** tab's
content (TBD, work in progress). The review wizard (`final-letter.astro`) itself.

---

**Acceptance Criteria**

**UI & field details**
- The tab strip shows, in order: "Overview", "Application", "Special conditions",
  "Final permit letter", "Annual report".
- "Overview" is the selected tab when the page loads.
- The tab strip stays pinned below the header as the page scrolls.
- No tab contains Edit, Save, or inline-editing controls.

**Access & permissions**
- "Final permit letter" appears only when the permit's status is Out for signature,
  Waiting for annual report, Active, or Expired.
- "Annual report" appears only when the permit's status is Active or Expired.
- Neither "Final permit letter" nor "Annual report" appears in the public view.
- "Special conditions" is hidden from a Researcher (owner) until the status is Out
  for signature, Waiting for annual report, Active, or Expired; draft conditions
  stay internal.

**State & status transitions**
- When the status changes while the page is open, gated tabs appear or disappear
  without a reload.
- If the open tab is hidden by a status change, the page switches to "Overview".
- A link ending in the tab's name opens that tab directly: `#application`,
  `#special-conditions`, `#letter`, `#report` (`?tab=<name>` works too). The
  address bar follows the open tab, so the URL can be copied and shared. A link
  to a tab the viewer can't see opens "Overview".

**Edge cases & constraints**
- A Researcher who is not an owner of a permit in a non-public status is
  redirected to My permits (or to Search if logged out).
- A Researcher who owns a **Withdrawn** application has no access to it: they
  are redirected to My permits, like any non-owner.

---

**Open questions**
- None.

---

## Story 2 — Show one action button per viewer in the permit header

**Story Title**
Show one action button in the permit header, driven by status and who's viewing

---

**Description**

As anyone working on a permit (Responsible Agent, Supporting Agent, other staff,
or the Researcher who owns it),
I want the permit header to offer my next step for the permit's current status,
So that the header always answers "what do I do now?" without showing actions I
can't take.

The header shows one action button at most. Its primary action and its menu
change with the status and with who is viewing. Where there is only one action,
it is a plain button with no menu. A compact copy of the header pins to the top
once the full header scrolls away, with the same button.

The header also shows the permit number, name, status indicator, classification
badges, and a fact row.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (permit-role: Responsible Agent,
Supporting Agent, Not assigned), Researcher (owner: submitter, PI, or PICOF),
public viewer.

**Out of scope:** The approve / request changes / reject flows inside the review
wizard. The signed-letter upload itself — see Story 5. Annual report upload —
see Story 6.

---

**Acceptance Criteria**

**Access & permissions**
- Workflow actions (Start review, Open review, Request changes, Reject permit,
  Upload signed letter, Override hold — issue permit) appear only to the
  **Responsible Agent** or a **System Admin**.
- "Review application" and "Complete review" appear only to a **Supporting
  Agent** on the permit.
- "Revise application" and "Upload annual report" appear only to the
  **Researcher owner**.
- "Request amendment" appears to the Responsible Agent, a System Admin, and the
  Researcher owner.
- The public view shows no action button.

**UI & field details**
- The button for each status and viewer ("Primary | menu items"; — = no button):

  | Status | Responsible Agent / System Admin | Supporting Agent | Other staff (Not assigned) | Researcher (owner) |
  |---|---|---|---|---|
  | Waiting for review | Start review | — | — | — |
  | Under review | Open review \| Request changes, Reject permit (danger) | Review application \| Complete review | — | — |
  | Returned to submitter | — | — | — | Revise application |
  | Out for signature | Upload signed letter \| Download unsigned letter | — | — | — |
  | Waiting for annual report | Override hold — issue permit \| Download signed letter | Download signed letter | Download signed letter | Upload annual report \| Download signed letter |
  | Active | Download signed letter \| Request amendment | Download signed letter | Download signed letter | Download signed letter \| Request amendment |
  | Expired | Download signed letter | Download signed letter | Download signed letter | Upload annual report \| Download signed letter while the report is owed; otherwise Download signed letter |
  | Rejected, Withdrawn | — | — | — | — |

- Once a Supporting Agent has marked their review complete, the menu item reads
  "Reopen review" instead of "Complete review".
- Inside the review wizard, the Responsible Agent's primary action follows the
  wizard step ("Finalize review" / "Finalize letter" / "Send for signature"),
  and the Supporting Agent's button is hidden (the wizard has its own "Complete
  review").
- The fact row shows "Requested window", "Submitted", and "Responsible analyst".
- From Out for signature onward, the "Requested window" label reads "Authorized
  window".

**State & status transitions**
- "Start review" records who started the review and when, sets the status to
  Under review, and opens the review wizard.
- "Open review" and "Review application" open the review wizard without changing
  the status.
- "Complete review" marks the Supporting Agent's review complete, with the date,
  on the analysis team (roster status "Complete", "Completed {date}"; the
  analysis-team progress updates). It doesn't change the permit status or gate
  the Responsible Agent.
- "Reopen review" removes the mark and restores the reviewer's previous roster
  status. It's available only while the permit is Under review.
- "Override hold — issue permit" sets the status to Active and sends EM-C.
- "Request amendment" opens the amendment application, prefilled from this
  permit.
- "Upload annual report" opens the Annual report tab on an Expired permit. On a
  renewal held for the previous permit's report, it opens My permits.
- The full header and the compact pinned header always show the same status and
  button.

**Notifications**
- "Override hold — issue permit" sends **EM-C — Permit issued / active** to the
  Researcher (submitter), PI, and PICOF. Regulated (always sent).

  **Subject:** Your research permit [Permit #] is now active

  ```
  [PI name],

  Your research permit is now active.

  Permit:  [Permit #] — [Project title]
  Term:    [Permit start] – [Permit end]
  Park(s): [Park(s)]

  You may begin the authorized work within the permit term and its
  conditions. A copy of the permit is available in your account.

  Report any change to your project before it occurs. An annual report is
  required as specified in your permit.

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```
- "Complete review" and "Reopen review" send **EM-L — Supporting review
  completed / reopened** to the permit's Responsible Agent. Always sent (no
  Profile toggle). The toast confirms: "Review complete" / "Review reopened" —
  "Emailed the Responsible Agent." [Action] is "completed" or "reopened";
  [Next step] is "They're done adding conditions and comments." or "They can
  change conditions and comments again."

  **Subject:** [Reviewer name] [Action] their review — permit [Permit #]

  ```
  [First name],

  [Reviewer name] [Action] their review of a permit you're responsible for.
  [Next step]

  Permit:  [Permit #] — [Project title]
  Reviews: [Reviews complete] complete

  [Open permit]

  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```

**Edge cases & constraints**
- The review wizard's send-for-signature confirmation reads:
  - Label: "Permit [Permit #]"
  - Heading: "Send this letter for signature?"
  - Body: "The letter locks and the permit moves to **Out for signature**. Then
    download the letter, get it signed, and upload the signed copy."
  - Buttons: "Keep editing" (secondary), "Send for signature" (primary).
- When any Supporting Agent hasn't marked their review complete, the same
  confirmation also shows a warning notification. Title: "{n} review(s) not
  complete" ("1 review not complete" / "3 reviews not complete"). Subtitle: the
  reviewers' names, comma-separated. Sending is still allowed.
- Once the permit is Out for signature, a review that wasn't marked complete
  can no longer be marked or reopened.
- "Download signed letter" with no signed letter on file shows a warning toast:
  "No signed letter on file".

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — The table:** For each status, view as Responsible Agent, System
  Admin, Supporting Agent, Not assigned, and Researcher owner; confirm the button
  and menu match the table in both the full and the pinned header.
- **Test 2 — Complete and reopen:** As a Supporting Agent who is on the analysis
  team, choose "Complete review"; confirm the roster shows "Complete" with
  today's date and the progress count goes up. Reload; it persists. Choose
  "Reopen review"; the previous status returns.
- **Test 3 — Send warning:** As the Responsible Agent, send for signature with
  at least one review not complete; confirm the warning lists them and sending
  still works.

---

**Open questions**
- [ ] On Waiting for annual report, does the Researcher's "Upload annual report"
  upload to the previous permit (whose report is missing) or to this renewal?
  (Same question as CSPS-410.) Recommendation: the previous permit — the report
  belongs to the permit it reports on, and its arrival is what releases the
  hold. The prototype has no link between the two permits yet, so it opens My
  permits.
- [ ] Confirm the EM-L copy, and that it has no Profile toggle.
- [ ] Does "Request amendment" from staff fill in the same amendment application
  for the researcher, or send a request to the researcher?
- [ ] Should a Supporting Agent who isn't on the analysis team roster see
  "Complete review"? Today the button follows the permit-role, but only roster
  members show as complete.

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
- A contents rail on the left lists the same six sections; each entry shows that
  section's compliance-flag count when it has any.
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
- A contents rail lists one entry per owner group with its condition count.
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

---

**Description**

As a Responsible Agent,
I want to download the system-generated permit letter, get it signed outside the
system, and upload the signed copy,
So that the signed letter becomes the permit of record and the permit becomes
Active.

This replaces the DocuSign two-signature flow. The system does not track who
signed or how; uploading the signed letter is the activation step. The "Final
permit letter" tab holds both the generated letter and, once uploaded, the signed
letter.

**Roles affected:** Responsible Agent (permit-role), System Admin, HQ Technical
Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer
(read only), Researcher, PI, PICOF (notified; read only).

**Out of scope:** Generating the letter's content (review wizard, step ②). The
Second Signer configuration on Templates & Defaults and District management —
see Open questions.

---

**Acceptance Criteria**

**Access & permissions**
- Only the Responsible Agent or a System Admin can upload the signed letter, and
  only while the status is Out for signature.
- Every other user who can see the "Final permit letter" tab can view and
  download the letters but sees no upload control.

**Happy path**
- When the Responsible Agent approves the permit in the review wizard, the system
  generates the final permit letter and sets the status to Out for signature.
- The "Final permit letter" tab shows the generated letter with a "Download
  permit letter" action.
- The Responsible Agent selects "Upload signed letter" (header or tab), chooses
  one PDF, and confirms.
- The system stores the file as the signed permit letter, recording the uploader
  and the upload date.

**State & status transitions**
- On upload, the status changes from Out for signature to **Active**, unless this
  is a renewal whose previous version has no annual report, in which case it
  changes to **Waiting for annual report** (the existing hold).
- After upload, the "Final permit letter" tab shows the signed letter first,
  labeled "Signed letter", with the uploader, date, and "Download signed letter";
  the generated letter stays below it as "Unsigned letter" with "Download
  letter".

**Notifications**
- Moving to Active sends **EM-C — Permit issued / active** to the Researcher, PI,
  and PICOF.
- Moving to Waiting for annual report sends **EM-H — Renewal placed on hold**
  instead.

**Edge cases & constraints**
- Only one signed letter can be on file. Uploading again before activation
  replaces the file; after activation, uploads are not offered.
- Only PDF files are accepted; any other type shows an inline error and the
  status doesn't change.
- The system doesn't check the file for signatures.

**Document visibility**
- The signed permit letter appears on: the "Final permit letter" tab; Uploaded
  Files; and the Permits index grid's permit document column.
- The signed letter is never shown in the public view.

---

This story may be large enough to split. Consider separating **document
visibility across surfaces** into its own ticket.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Activation:** Approve a new permit as the RA → status Out for
  signature → upload a PDF → status Active; EM-C received.
- **Test 2 — Renewal hold:** Repeat on a renewal whose previous version has no
  annual report → status Waiting for annual report; EM-H received, no EM-C.
- **Test 3 — Not RA:** As a Supporting Agent on an Out for signature permit,
  confirm no upload control on the header or tab.

---

**Open questions**
- [ ] Is the Second Signer setting (Templates & Defaults, District management) now
  retired, along with emails EM-A and EM-B?
- [ ] Should the Researcher, PI, and PICOF get the signed letter as an email
  attachment, or only a link to the permit?
- [ ] Can a System Admin replace a signed letter after activation (e.g. wrong file
  uploaded)? If so, what is logged?
- [ ] Is there a file size limit for the signed letter?

---

## Story 6 — Let a researcher upload the annual report document

**Story Title**
Let researchers upload the annual report document on a permit

---

**Description**

As a Researcher who owns an Active or Expired permit (submitter, PI, or PICOF),
I want to upload my annual report document on the permit,
So that I meet the permit's reporting requirement and keep my renewals unblocked.

The annual report is a **document upload, not a form**. A permit owes one, due 30
days after it expires, and the owner can upload it any time the permit is Active
or Expired. The Responsible Agent or a System Admin can also upload it — for
example, when the researcher emailed it. Every upload is a **new version of the
same document**; the newest version is current. **One version on file completes
the requirement.** The Responsible Agent can send the current version back with a
message, which reopens the requirement. Only the Responsible Agent or a System
Admin can remove a version.

**Roles affected:** Researcher (owner: submitter, PI, PICOF); Responsible Agent
(permit-role: reviews, may send back, may upload, may remove versions); Supporting Agents on the analysis team
(notified); System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (read).

**Out of scope:** Overdue and Delinquent handling — see Story 7. The prototype's
`/report` form page, which this story retires.

---

**Acceptance Criteria**

**Access & permissions**
- Any owner (submitter, PI, or PICOF), the Responsible Agent, or a System Admin can
  upload while the status is Active or Expired. Supporting Agents and other
  reviewers cannot. Upload isn't offered in any other status.
- Only the Responsible Agent or a System Admin can send a report back or remove a
  version. Researchers cannot remove a version once uploaded, including their own.
- Every staff user who can open the permit can view and download uploaded reports.

**Happy path**
- On the "Annual report" tab, the owner drops or picks a file; it uploads
  immediately, with no separate confirm step, and a toast confirms "Version {n}
  uploaded".
- The system records the file as the next version number, with the uploader and
  date, makes it the current version, and marks the requirement **Complete**.
- The "Versions" table lists every version, newest first, with "Version", "File",
  "Uploaded by", "Date", and "Status" ("Complete", "Changes requested", or
  "Replaced" for earlier versions), and a "Download" action.

**State & status transitions**
- **Send back:** the Responsible Agent selects "Request changes" on the report and
  must enter a message. The requirement returns to **Changes requested**; the
  report stays visible, marked as sent back with the message, date, and sender.
- The owner can upload a new version at any time, including after the report is
  Complete. The new version becomes current; earlier versions stay listed.
- **Remove:** the Responsible Agent or a System Admin selects "Remove" on a
  version and confirms. The previous version becomes current; if none is left, the
  report is due again (and Delinquent if past the due date). Version numbers are
  never reused.
- The permit's status (Active or Expired) never changes because of an upload or a
  send-back.

**UI & field details**
- The upload area is headed "Upload report" (no versions yet), "Upload new
  version" (a version stands), or "Upload revised report" (after a send-back). The
  hint reads "One document completes the requirement." before the first upload,
  then "Each upload becomes the current version." It reads the same for the owner
  and for staff.
- The remove confirmation (danger) reads "Remove version {n}?" — "Version {n-1}
  becomes current. This can't be undone." for the current version, "No version
  will be on file, so the report is due again. This can't be undone." for the
  only version, or "This can't be undone." for an earlier version. Buttons:
  "Cancel", "Remove".
- The tab's notice: "Due {date}" (before upload), "Report complete" — "{name}
  uploaded it on {date}.", "Changes requested" — "{name}, {date}: “{message}”".
- The "Request changes" dialog: "The researcher, PI, and PICOF get your message by
  email." with the field "What needs to change" (error: "Enter what needs to
  change.").

**Notifications**
- An upload emails the Responsible Agent and every Supporting Agent on the
  permit's analysis team, subject to their notification preferences.
- A send-back emails the Researcher, PI, and PICOF with the Responsible Agent's
  message.

**Edge cases & constraints**
- The newest remaining version is always the one under review.

**Document visibility**
- Uploaded reports appear on the "Annual report" tab and in Uploaded Files.
- They never appear in the public view.

---

This story may be large enough to split. Consider separating **the Responsible
Agent's send-back** into its own ticket.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Upload completes:** As the PI on an Active permit, upload a file →
  requirement Complete; RA and each Supporting Agent are emailed.
- **Test 2 — Send back:** As the RA, select "Request changes" with a message →
  requirement Changes requested; Researcher, PI, and PICOF are emailed; the tab
  shows the message. Upload again → Complete.
- **Test 3 — Versions:** As the PI, upload twice → versions 1 and 2, version 2
  Complete, version 1 Replaced; no "Remove" for the PI.
- **Test 4 — Remove:** As the RA, remove version 2 → version 1 becomes current;
  remove version 1 → report due again.
- **Test 5 — Wrong status:** On an Under review permit, confirm no upload control.

---

**Open questions**
- [ ] Which file types and size limit are accepted?
- [ ] When the Responsible Agent or a System Admin uploads the report, are the
  Researcher, PI, and PICOF also emailed?
- [ ] Should the Responsible Agent be able to "Request changes" on a report they
  uploaded themselves? (The prototype allows it.)
- [ ] Confirm the email body copy sent to the Responsible Agent and Supporting
  Agents when an annual report is uploaded (draft: EM-J in
  `email-copy-notifications.md`).
- [ ] Confirm the email body copy sent to the Researcher, PI, and PICOF when the
  Responsible Agent requests changes on the report (draft: EM-K).
- [ ] When the Responsible Agent removes a version, are the Researcher, PI, and
  PICOF notified?
- [ ] Does a new version uploaded after the report is Complete need the
  Responsible Agent's attention (e.g. a "new version" email), or is EM-J enough?
- [ ] The matrix also lists "Upload annual report" under Waiting for annual report.
  Is that the previous permit's report (uploaded on that permit), or should the
  renewal accept it too?

---

## Story 7 — Flag overdue annual reports as Delinquent and block the PI's renewals

**Story Title**
Flag overdue annual reports as Delinquent and block PI renewals

---

**Description**

As a Responsible Agent,
I want a permit with an overdue annual report to be flagged Delinquent
automatically and to block its PI's new applications, with the option to lift the
block,
So that reporting is enforced without manual tracking, and I can make an exception
when there's a reason to.

**Delinquent is a label, not a status.** Because the single annual report becomes
due at expiry, the label sits on an **Expired** permit. This differs from the
matrix's current wording ("a label on an already-Active permit") — the matrix
needs updating.

**Roles affected:** Responsible Agent (permit-role), System Admin (lift/restore),
HQ Technical Reviewer, District Lead Technical Reviewer, District Assistant
Technical Reviewer (read), Researcher, PI, PICOF.

**Out of scope:** The Waiting for annual report hold on renewals (unchanged; lifted
by "Override hold — issue permit", Story 2). Uploading and sending back the report
— see Story 6.

---

**Acceptance Criteria**

**Access & permissions**
- Only the Responsible Agent or a System Admin sees "Lift renewal block" and
  "Restore renewal block".

**State & status transitions**
- The day after the due date, if no report is on file, the system adds the
  **Delinquent** label to the permit. The status stays Expired.
- While Delinquent and not lifted, the PI cannot start a new application, renewal,
  or amendment in which they are the PI.
- "Lift renewal block" removes the PI block and records who lifted it and when;
  the report is still due and the Delinquent label stays.
- "Restore renewal block" reinstates the PI block.
- Uploading an annual report removes the Delinquent label and the block.
- If the Responsible Agent requests changes on the report after the due date, the
  Delinquent label and the block return until a new document is uploaded.

**UI & field details**
- On the "Annual report" tab, an overdue report shows an error notice "Report
  overdue" — "It was due {date}." (plus the requested changes, if any).
- "Lift renewal block" and "Restore renewal block" are actions on the permit
  alerts (Story 9).
- Lifting or restoring shows a success toast ("Renewal block lifted" / "Renewal
  block restored").
- The Delinquent label shows on the permit header and as a Kanban lane on My
  permits, with no manual "Flag delinquent" action.

**Notifications**
- Notification behavior for Delinquent is undefined — see Open questions.

---

This story may be large enough to split. Consider separating **the PI renewal
block on `/apply`** from **the Delinquent label and the lift/restore controls**.

---

**Testing notes**

- **Test 1 — Auto-flag:** Use an expired permit with no report and move the demo
  clock past the due date (`?today=YYYY-MM-DD`) → Delinquent label, error notice,
  PI blocked on `/apply`.
- **Test 2 — Lift:** As the RA, select "Lift renewal block" → PI can apply; label
  remains; notice names who lifted it.
- **Test 3 — Upload clears:** Upload the report as the PI → label and block
  cleared.
- **Test 4 — Send-back re-flags:** Past the due date, as the RA select "Request
  changes" on the report → label and block return.

---

**Open questions**
- [ ] Should the Delinquent label show on **all** of the PI's permits, or only the
  overdue one? (The earlier spec said all.)
- [ ] Are the Researcher, PI, and PICOF emailed when a permit becomes Delinquent?
  If so, what is the email body copy?
- [ ] Is the Responsible Agent emailed when a report becomes overdue?
- [ ] Does the block also apply when the delinquent PI is a PICOF or participant on
  a new application, or only as PI?

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

**Edge cases & constraints**
- The Delinquent label is not shown in the public view.

---

**Open questions**
- [ ] The "Authorized parks" table lists district and park contacts by name.
  Should those staff contacts be hidden in the public view like other person
  names?

---

## Story 9 — Show permit alerts in one stack under the header

**Story Title**
Show permit alerts in one stack under the header

---

**Description**

As any user who opens a permit (HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, System Admin, Researcher who owns
the permit, or a public viewer),
I want every page-level alert about the permit shown in one place, most urgent
first,
So that I see what needs attention whichever tab I'm on, without scanning the
page for scattered banners.

Alerts describe the permit's **state**; each one appears while its condition holds
and clears when the condition is resolved. They can't be dismissed. One shared set
of rules decides which alerts apply, for whom, and how urgent they are, so new
alerts are added in one place. Notices about a single tab stay in that tab (e.g.
"Conditions are final" on Special conditions, the report status on Annual report).

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (permit-roles: Responsible Agent,
Supporting Agent, Not assigned), Researcher (owner: submitter, PI, PICOF), public
viewer.

**Out of scope:** The Overview tab (TBD, work in progress). Transient action
confirmations, which stay toasts. Email notifications for any alert.

---

**Acceptance Criteria**

**UI & field details**
- Alerts appear in one stack between the permit header and the tab strip, on every
  tab. With no alerts, the stack takes no space.
- Alerts are ordered by severity — error, then warning, then info — and then by
  the catalog order below.
- Two alerts show at a time; the rest are behind "Show {n} more", which toggles to
  "Show less".
- Each alert has a title, an optional subtitle, and at most one action.
- Alerts have no close button.

**Catalog**

| Alert | Shows when | Staff (title — action) | Owner (title — action) | Kind |
|---|---|---|---|---|
| Report overdue | Active/Expired, annual report past due, block not lifted | "Annual report overdue — renewals blocked" — "Lift renewal block" (RA/Admin) or "View report" | "Annual report overdue — renewals blocked" — "Upload annual report" | Error |
| Changes requested | Returned to submitter | "Returned to the researcher" (info, no action) | "Changes requested" — "Review requested changes" | Warning |
| Report needs changes | Latest report version sent back | "Annual report needs changes" — "View report" | "Annual report needs changes" — "Upload revised report" | Warning |
| Renewal on hold | Waiting for annual report | "On hold for the previous annual report" | "Your permit is on hold" | Warning |
| Ending soon | Active, 30 or fewer days left | "Permit ends in {n} days" (info) | "Your permit ends in {n} days" — "Request amendment" | Warning |
| Signed letter missing | Out for signature, no signed letter | "Waiting for the signed letter" — "Upload signed letter" (RA/Admin) | — | Info |
| Start review | Waiting for review, not started; RA/Admin only | "Start your review" — "Start review" | — | Info |
| Block lifted | Report overdue, block lifted | "Annual report overdue — renewal block lifted" — "Restore renewal block" (RA/Admin) | Same title — "Upload annual report" | Info |
| Report due | Permit ended, report not yet due | "Annual report due {date}" | "Annual report due {date}" — "Upload annual report" | Info |
| Amendment | An amendment was started from this permit | "Amendment {number} in progress" — "View amendment" | Same | Info |
| Renewal | A renewal was started from this permit | "Renewed as {number}" | Same | Info |
| Public view | Viewer is the public | — | — | Info: "Public view" |

**State & status transitions**
- Alerts update without a reload when the status changes, a report version is
  uploaded or sent back, or the renewal block is lifted or restored.
- "Lift renewal block" and "Restore renewal block" act in place and confirm with a
  toast; the alert changes to match.
- "View report", "Upload annual report", and "Upload revised report" switch to the
  Annual report tab. "Upload signed letter" opens the signed-letter upload.
  "Start review" starts the review exactly like the header action.

**Access & permissions**
- Public viewers see only "Amendment" (without its action), "Renewal", and
  "Public view".
- Actions marked RA/Admin appear only to the Responsible Agent or a System Admin.

---

This story may be large enough to split. Consider separating **the stack itself
(order, cap, Show more)** from **the alert catalog**, and adding catalog entries
as their own tickets.

---

**Testing notes**

- **Test 1 — Cap:** As the RA on an Expired permit past the report due date, with
  an amendment started and `?renewal=1` → the overdue error and the amendment show;
  "Show 1 more" reveals the renewal.
- **Test 2 — Lift:** Select "Lift renewal block" → toast; the error becomes the
  info "renewal block lifted" with "Restore renewal block".
- **Test 3 — Audience:** View the same permit as the researcher owner, a Supporting
  Agent, and logged out; confirm the wording and actions per the catalog.

---

**Open questions**
- [ ] What starts a renewal, and where does "Renewed as {number}" link to?
- [ ] Should alerts also reach the Permits index or My permits (e.g. a count or
  badge per permit)?
- [ ] Is a cap of two visible alerts right, or should errors always show?
- [ ] Should the Delinquent label in the header be replaced by the overdue alert,
  or kept alongside it?
