# Templates & defaults — user stories

These are sibling stories for the **Templates & defaults** admin area, where a
System Admin manages site-wide configuration self-service. Story 1 establishes
the area; Stories 2–5 are the sections inside it. Story 2 extends the existing
DPR65A/DPR65B document-management story to the remaining downloadable forms.
Story 6 adds the variable affordance to the email editor; Stories 7–8 add rich
text formatting and distinct variable tokens to the email **message**; Story 9
standardizes the seeded applicant email copy and reconciles the variable names
(resolving several open questions raised in Stories 5 and 6).

Notation: the final permit **letter body** template is tracked separately in
**CSPS-211**; e-signature configuration is out of scope for all of these.

---

## Story 1 — Create the Templates & defaults admin area for site-wide configuration

**Story Title**
Create the Templates & defaults area for System Admin configuration

---

**Description**

As a System Admin,
I want a single area where I can manage the site-wide templates and defaults that
affect every permit,
So that I can keep regulated forms, letterhead, permit defaults, and applicant
email copy current without a code deployment or developer intervention.

The area is the home for configuration that changes rarely and applies across the
whole system. Each type of configuration is its own section within it; the
sections are detailed in their own stories.

**Roles affected:** System Admin, Technical Reviewer, Researcher, Public User

**Out of scope:** The behavior of each individual section — see the regulated
forms, letterhead, permit defaults, and email notification stories. Final permit
letter body template management — see CSPS-211. E-signature service
configuration.

---

**Acceptance Criteria**

**Access & permissions**
- Only users with the System Admin role can access the Templates & defaults area.
- Technical Reviewers, Researchers, and Public Users cannot see or reach the area;
  a non-admin who navigates directly to its URL is shown an "Access denied"
  message and a way back to the site.

**Happy path**
- A System Admin can reach the Templates & defaults area from the "Admin tools"
  menu.
- The area presents its configuration sections together on a single page:
  Regulated forms, Letterhead & signatories, Permit defaults, and Email
  notifications.
- After any successful save in any section, the System Admin sees a confirmation
  that the change was saved.

**UI & field details**
- The Admin tools menu includes a "Templates & defaults" entry linking to the area.
- The area title is "Templates & defaults".

**Edge cases & constraints**
- The configuration sections show current values in a read-only view until the
  System Admin chooses to edit; nothing is edited by accident.

---

**Open questions**
- [ ] Should access be limited strictly to System Admin, or should a read-only
  view be available to other CA State Parks Staff roles?
- [ ] Is there a permission audit/logging requirement for changes made in this
  area (who changed what, when)?

---

## Story 2 — Manage all regulated forms researchers download

**Story Title**
Let System Admin manage all regulated forms researchers download

---

**Description**

As a System Admin,
I want to replace any of the official forms researchers download during the
application, not just DPR65A and DPR65B,
So that I can keep every regulated form current, self-service, without a
developer replacing files.

This extends the original document-management story to the remaining downloadable
forms. Per the SCP email inventory (CSPS-16/52 return reasons and CSPS-224 signer
routing), DPR65A is the **Insurance Addendum** (Additional documents page) and
DPR65B is the **Liability Waiver Addendum** (Research team page). The **Standard
Condition Agreement** and the **Waiver and Indemnity Agreement** are the
always-required forms and carry no DPR number. All four are managed the same way,
in the Regulated forms section of Templates & defaults.

**Roles affected:** System Admin, Researcher, Principal Investigator (PI),
Technical Reviewer

**Out of scope:** The DPR65A/DPR65B management already covered by the original
document-management story (this story reuses its rules). E-signature
configuration. Changes to document content or formatting — an NRD responsibility,
not a system concern.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can replace a regulated form; Technical Reviewers and
  Researchers cannot see or reach the Regulated forms section.
- Researchers continue to download the current version of each form from the
  same locations they do today.

**Happy path**
- The Regulated forms section lists every downloadable form — the Standard
  Condition Agreement, the Waiver and Indemnity Agreement, DPR65A (Insurance
  Addendum), and DPR65B (Liability Waiver Addendum) — each showing its name,
  current file name, and last-updated date.
- The System Admin can upload a replacement PDF for any form via a "Replace"
  action.
- On a successful upload, the new file immediately supersedes the previous
  version as the file available for download, and the last-updated date reflects
  the change.

**State & status transitions**
- Only one current version of each form exists at a time; a replacement fully
  supersedes the previous file. No version history is kept.

**UI & field details**
- Each entry displays the document name, current file name, last-updated date,
  and a "Replace" action.
- The upload accepts PDF format only.

**Data visibility**
- After a replacement, the updated file is served from every location in the
  application where that form appears today:
  - Standard Condition Agreement — the download in the Additional documents step.
  - Waiver and Indemnity Agreement — the download in the Additional documents step.
  - DPR65A (Insurance Addendum) — the download in the "research beyond simple use"
    portion of the Additional documents step.
  - DPR65B (Liability Waiver Addendum) — the download in the Research team step.
- Any Researcher who downloads a form after a replacement receives the newly
  uploaded file.

**Edge cases & constraints**
- If a System Admin uploads a non-PDF file, the system rejects it and shows an
  error naming the accepted file type; the previous file remains current.
- If an upload fails, the previous version remains available — the form is never
  left missing or broken.

---

**Testing notes**

- **Test 1 — Replace the liability waiver addendum:** Sign in as System Admin.
  In Regulated forms, replace the liability waiver addendum with a new PDF. Sign
  in as a Researcher, open the Research team step, and download it. Confirm the
  downloaded file matches the newly uploaded version.
- **Test 2 — Invalid file type:** As System Admin, attempt to replace the
  insurance addendum with a .docx file. Confirm the upload is rejected with an
  error and the existing file remains available.
- **Test 3 — Permission check:** Sign in as a Technical Reviewer. Confirm the
  Regulated forms section is not visible or accessible.

---

**Open questions**
- [ ] Form-number mapping is resolved per the SCP email inventory (DPR65A =
  Insurance Addendum, DPR65B = Liability Waiver Addendum). Confirm the two
  always-required agreements (Standard Condition, Waiver and Indemnity) indeed
  carry no DPR number.
- [ ] Are the DPR65A/DPR65B files the applicant-facing blank forms to download,
  the same PDFs the e-signature service routes for signing (CSPS-224), or both?
  If both, does replacing one here update the signing packet too?

---

## Story 3 — Manage the permit letterhead and default signer

**Story Title**
Let System Admin edit the permit letterhead and default signer

---

**Description**

As a System Admin,
I want to edit the agency identity printed on the permit letter and the
classification pre-filled for the letter signer,
So that I can keep the letterhead current when officials change, without a
developer editing the letter.

The letterhead is the masthead at the top of every permit letter — the agency,
the Governor, the department, and the Director — plus the default classification
shown for the signer.

**Roles affected:** System Admin, Technical Reviewer

**Out of scope:** The permit letter body and its editable per-permit fields —
see CSPS-211. The per-permit signer name, which a Technical Reviewer sets when
finalizing a letter.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can view and edit the Letterhead & signatories section.

**Happy path**
- The section shows the current values read-only: Agency, Governor, Department,
  Director, and Default signer classification.
- A live preview renders the letterhead exactly as it prints on the permit
  letter and updates as the System Admin types.
- The System Admin can edit the values and save; on save, the preview and the
  read-only view reflect the new values.
- Canceling an edit discards the changes and restores the previous values,
  including in the preview.

**State & status transitions**
- Saved values apply to permit letters generated after the change; letters
  already issued are unaffected.

**UI & field details**
- Fields: "Agency", "Governor", "Department", "Director", "Default signer
  classification".
- The preview is labeled as a preview of the letter masthead.

---

**Open questions**
- [ ] Should the mailing address on the letterhead's third line
  ("P.O. Box 942896, Sacramento, CA 94296-0001") also be editable, or remain
  fixed?
- [ ] Should there be validation preventing an empty required field (e.g. a
  blank Director) from being saved?
- [ ] Is a department logo/seal image part of the letterhead, and should it be
  uploadable here?

---

## Story 4 — Manage permit defaults

**Story Title**
Let System Admin set the permit number format and default terms

---

**Description**

As a System Admin,
I want to set the permit-number format and the default validity and report
cadence,
So that new permits are numbered and dated consistently without a developer
changing the rules.

**Roles affected:** System Admin, Technical Reviewer

**Out of scope:** Renumbering or re-dating permits already issued. Per-permit
overrides a Technical Reviewer may set when finalizing a specific permit.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can view and edit the Permit defaults section.

**Happy path**
- The section shows the current values read-only: the permit-number format (with
  a worked example such as "SCP-2026-00847"), the default validity, and the
  summary report due cadence.
- The System Admin can edit the number prefix and the number of sequence digits;
  a live example updates as those change.
- The System Admin can set the default validity (in months) and choose the
  summary report due cadence from a defined list.
- On save, the read-only view reflects the new values.

**State & status transitions**
- Changed defaults apply to permits and applications created after the change,
  not to existing records.

**UI & field details**
- Fields: "Permit number prefix", "Sequence digits", "Default validity
  (months)", "Summary report due".
- The summary report due options are: Annually, Semi-annually, Quarterly, and
  "At permit expiration".

---

**Open questions**
- [ ] Does changing the sequence width or prefix affect how already-issued
  permit numbers are displayed, or only newly generated numbers?
- [ ] Should the year token in the permit number follow the calendar year, the
  application-submitted year, or the approval year?
- [ ] Is the running sequence reset annually, or continuous across years?

---

## Story 5 — Manage applicant email notification copy

**Story Title**
Let System Admin edit the applicant email notification copy

---

**Description**

As a System Admin,
I want to edit the subject and message of the emails applicants receive at each
step,
So that I can keep the wording current without a developer changing the
templates.

**Roles affected:** System Admin, Researcher, Principal Investigator (PI), PICOF

**Out of scope:** Which events trigger emails and to whom they are sent — this
story covers editing copy only, not routing or trigger logic. District-facing
emails (e.g. the special-conditions request, CSPS-52), internal staff/role and
reviewer-assignment emails (CSPS-54/91/189/199), and all e-signature-service
signing emails (CSPS-224) are managed separately, not in this section.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can view and edit the Email notifications section.

**Happy path**
- The section lists the applicant-facing emails, each showing its current subject
  and message: Application submission confirmation, Application returned to
  researcher, Application rejected, Permit approved, and the two annual report
  reminders (15 days before, and due today).
- The System Admin can edit a notification's subject and message and save.
- On save, the listed notification reflects the new copy, and emails sent after
  the change use it.

**UI & field details**
- Email bodies contain variables (e.g. [Application Title]) the system fills in
  when the email is sent. Showing and inserting those variables safely is covered
  by its own story — see Story 6.

**Notifications**
- The section manages the applicant-facing emails below. Verbatim bodies are
  finalized in Jira and captured in `SCP_System_Email_Inventory.md` (Section A);
  recipient roles come from those stories:
  - **Application submission confirmation** (CSPS-51) → PI, PICOF, Submitter.
    Subject: "Permit Application Submission Confirmation: [Application Title]".
    Two body variants exist (to the Submitter vs. to a PI/PICOF who is not the
    submitter).
  - **Application returned to researcher** (CSPS-16) → Submitter (CSPS-91 broadens
    to Researcher + PI + PICOF — confirm which is live). Subject: "Your Permit
    Application Has Been Returned for Revisions". Body includes the reviewer's
    selected reasons plus any custom text.
  - **Application rejected** (CSPS-87) → Researcher. No subject line is specified
    in Jira. Body injects the reviewer's rejection reason.
  - **Permit approved** (CSPS-78) → Researcher and related people (Submitter / PI
    / PICOF). No subject line is specified. This is the legacy pre-e-signature
    path (CSPS-225 asks whether it changes now that signing + approval are one
    step).
  - **Annual report reminder — 15 days before** (CSPS-21) → PI, Submitter, PICOF.
  - **Annual report reminder — due today** (CSPS-21) → PI, Submitter, PICOF.
- The standard NRD signature block closes several of these:
  `Natural Resources Division / California State Parks / (916) 653-6725 /
  nrd.research@parks.ca.gov`.

**Edge cases & constraints**
- A notification cannot be saved with an empty subject or empty message.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real applicant email addresses in QA.
- **Test 1 — Edit and send:** As System Admin, edit the Application submission
  confirmation subject and message and save. Trigger the corresponding email and
  confirm it uses the updated copy.

---

**Open questions**
- [ ] Application rejected (CSPS-87) and Permit approved (CSPS-78) have no subject
  line in Jira — what subject should each use? (The section seeds a placeholder.)
- [ ] Application submission confirmation has two body variants (Submitter vs.
  PI/PICOF) — should the editor expose both, or is one canonical for editing?
- [ ] Return-to-researcher recipients differ between CSPS-16 (Submitter only) and
  CSPS-91 (Researcher + PI + PICOF) — which recipient set is live?
- [ ] Should the standard NRD signature block be part of the editable body or
  appended automatically? (Standardization also needs to fix the (916) 635-6725
  typo in CSPS-52 → 653-6725, and reconcile recipient tokens: PICOF vs "Person in
  Charge of Field Work" vs "Fieldwork".)
- [ ] Does the legacy approval email (CSPS-78) need reworking now that signing and
  approval happen in one step (CSPS-225)?

---

## Story 6 — Show and insert supported variables in the email editor

**Story Title**
Show and insert supported variables when editing email copy

---

**Description**

As a System Admin,
I want to see the variables each email supports and insert them into the subject
or message,
So that the merge fields are always spelled correctly and get filled in when the
email is sent.

Applicant emails contain variables — merge fields such as [Application Title] or
[Submission Date] — that the system replaces with real values at send time.
Hand-typing a token is error-prone: a misspelled or unsupported token ships as
literal bracketed text and is never filled in. This story adds the variable
affordance to the email notification editor (Story 5).

**Roles affected:** System Admin. Downstream, the emails are received by
Researcher, PI, and PICOF, who see the filled-in values — a wrong token degrades
the email they receive.

**Out of scope:** Editing the email subject/message copy itself — see Story 5.
Defining and governing the master list of which variables each email supports
(this story treats each email's variable set as a given input). The send-time
substitution that replaces tokens with real values — that lives in the email send
pipeline, not this editor.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can see and use the variable affordance, within the Email
  notifications editor.

**Happy path**
- When editing an email, the editor shows the set of variables that email
  supports, each displayed as its exact token (e.g. [Application Title]).
- Selecting a variable inserts its exact token at the cursor in the field being
  edited (subject or message).
- The inserted token matches exactly what the send process replaces, so the merge
  field always resolves.

**UI & field details**
- The variables are grouped under a label ("Variables you can insert") with helper
  text stating they are filled in automatically when the email is sent and should
  be inserted rather than typed.
- The variable set is specific to the email being edited — for example, the
  submission confirmation offers [Recipient's Name], [Application Title], and
  [Submission Date], while an annual report reminder offers [Permit Number] and
  [Expiration Date].
- Inserting a variable places it at the current cursor position; if neither the
  subject nor the message is focused, it inserts into the message.

**Edge cases & constraints**
- If the subject or message contains a bracketed token that is not in the email's
  supported set, the editor shows a non-blocking warning that names the
  unrecognized token(s).
- The warning updates live as the copy changes and clears once no unrecognized
  tokens remain.
- The warning does not block saving — the System Admin can still save (see open
  questions on send-time behavior).

---

**Testing notes**

- **Test 1 — Insert a variable:** Edit an email, place the cursor in the message,
  and select a variable. Confirm the exact token is inserted at the cursor.
- **Test 2 — Unrecognized token warning:** Type a bracketed token that is not in
  the email's set (e.g. [Aplication Title]). Confirm the editor warns and names
  it; remove it and confirm the warning clears.
- **Test 3 — Per-email variable set:** Open two different emails and confirm each
  shows a different set of variables matching its own copy.

---

**Open questions**
- [ ] What is the authoritative source of each email's supported variable list,
  and who governs it?
- [ ] What is the exact token delimiter? The current copy uses [Bracket Title
  Case]; confirm this over an alternative such as {{snake_case}}, and reconcile
  the inconsistent token names in the source copy ([Recipient's Name] vs
  [Recipient Name]; PICOF vs "Person in Charge of Field Work" vs "Fieldwork").
- [ ] When a saved template still contains an unrecognized token, what happens at
  send — is sending blocked, is the literal bracket text sent, or is the token
  stripped? (The editor warns but does not block saving.)
- [ ] Should literal square brackets be allowed in prose that is not a variable,
  and if so, how does the editor distinguish them from a token? (In the message,
  Story 8 answers this: an inserted variable becomes a distinct token; typed
  brackets stay prose and trip the unrecognized-token warning. Open for the
  subject, which stays plain text.)
- [ ] Should the editor offer a preview that renders the template with sample
  values, so the admin sees the filled-in result before saving?

---

## Story 7 — Format the email message with rich text

**Story Title**
Let System Admin format the email message with rich text

---

**Description**

As a System Admin,
I want to format an applicant email's message with rich text — emphasis, lists,
headings, and links,
So that the emails applicants receive are readable and structured, not a single
block of plain text.

Applicant emails are HTML when delivered. This replaces the plain-text message
field in the Email notifications editor (Story 5) with a formatting editor. The
subject stays a single-line plain field.

**Roles affected:** System Admin. Downstream, the formatted email is received by
Researcher, PI, PICOF, and Submitter.

**Out of scope:** Editing the subject line, which stays plain text — see Story 5.
Which events trigger emails and to whom they are sent — see Story 5. The variable
affordance (showing and inserting merge fields) — see Story 6; rendering those
variables as tokens — see Story 8. The final permit letter body — see CSPS-211.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can view and use the rich text message editor, within the
  Email notifications section.

**Happy path**
- When editing a notification, the message field is a rich text editor with a
  formatting toolbar.
- The System Admin can apply bold, italic, strikethrough, and inline code;
  headings; bulleted and numbered lists; a block quote; a code block; and a link.
- The editor supports undo and redo of content and formatting changes.
- On save, the formatted message is stored, and emails sent after the change use
  the formatted content.

**State & status transitions**
- Saved formatting applies to emails sent after the change; emails already sent
  are unaffected.

**UI & field details**
- The message field is labeled "Message".
- The toolbar controls carry the system's standard button styling and show a
  toggled (active) state when their formatting applies to the current selection.
- A link must start with `https://`, `http://`, or `mailto:`; the editor rejects
  any other scheme.

**Edge cases & constraints**
- A notification cannot be saved with an empty message (consistent with Story 5).
- Existing plain-text template copy opens as formatted text — paragraphs and line
  breaks are preserved — the first time it is edited in the rich text editor.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real applicant email addresses in QA.
- **Test 1 — Format and send:** As System Admin, edit a notification's message,
  apply bold and a bulleted list, and save. Trigger the email and confirm it
  arrives with the formatting applied.
- **Test 2 — Plain seed opens formatted:** Open a notification that has never
  been edited. Confirm its seeded plain-text copy displays with its paragraph
  breaks preserved, ready to format.

---

**Open questions**
- [ ] Do applicant email clients receive the formatting as HTML, and is a
  plain-text fallback part sent for clients that do not render HTML?
- [ ] Should any block-level options (headings, code block) be removed for email,
  where such formatting renders inconsistently across mail clients?

---

## Story 8 — Render inserted variables as distinct tokens in the message

**Story Title**
Show email variables as distinct tokens in the message editor

---

**Description**

As a System Admin,
I want an inserted variable to look like a distinct token in the message, not
ordinary text,
So that I can tell at a glance which parts are merge fields the system fills in
versus words I typed.

This extends the variable affordance (Story 6): when a variable is inserted into
the rich text message (Story 7), it renders as a non-editable token rather than
bracketed text that reads like prose.

**Roles affected:** System Admin.

**Out of scope:** The subject field, which stays plain text — a variable inserted
there remains literal bracketed text (see Story 6). The variable list and the
insert action itself — see Story 6. The rich text editor — see Story 7. Send-time
substitution — the email send pipeline.

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin sees the token rendering, within the Email notifications
  message editor.

**Happy path**
- Inserting a variable into the message renders it as a visually distinct token
  showing its exact name (e.g. [Application Title]).
- A token behaves as a single unit: it is selected and deleted as one piece and
  cannot be edited character-by-character.
- When a notification opens, any supported variable already present in its
  message is shown as a token, not as plain bracketed text.

**State & status transitions**
- On save, each token is preserved as its exact bracketed name so the send
  process fills it in; reopening the message shows it as a token again, with no
  change to the resolved value.

**UI & field details**
- Tokens are styled distinctly from body text (a filled pill) and stay legible in
  both light and dark theme zones.

**Edge cases & constraints**
- A bracketed string the admin types by hand is not a token: it stays plain text
  and continues to trip the unrecognized-token warning (Story 6). This gives a
  clear signal — tokens are inserted, plain brackets are typed.
- Tokens survive save and reload without being escaped or doubled.

---

**Testing notes**

- **Test 1 — Insert shows a token:** Edit a notification, place the cursor in the
  message, and insert a variable. Confirm it appears as a distinct token, not
  bracketed text, and that Backspace removes the whole token at once.
- **Test 2 — Seed variable renders as token:** Open a notification whose seeded
  message contains a supported variable. Confirm the variable is shown as a token.
- **Test 3 — Typed brackets stay plain:** Type a bracketed string by hand (e.g.
  [Made Up]). Confirm it is not a token and the unrecognized-token warning names
  it.

---

**Open questions**
- [ ] Should the subject field also render inserted variables as tokens, or is
  plain bracketed text acceptable for a single-line field?
- [ ] When a token's name is not in the current email's supported set (e.g. after
  the supported set changes), should it still render as a token or downgrade to a
  plain-text warning?

---

## Story 9 — Standardize the applicant email template copy and variables

**Story Title**
Standardize applicant email subjects, greetings, and variable names

---

**Description**

As a System Admin,
I want the seeded applicant email templates to be consistent in voice, structure,
and variable names,
So that the emails read as one system and every merge field resolves.

This is a copy-consistency pass over the six applicant email templates (Story 5):
sentence-case subjects, one greeting and one closing, a single wording for the
"contact us" line, and reconciled variable names.

**Roles affected:** System Admin (edits the copy); downstream Researcher, PI,
PICOF, and Submitter receive the emails.

**Out of scope:** The verbatim regulated bodies finalized in Jira and captured in
`SCP_System_Email_Inventory.md` (Section A) — this story standardizes the seeded
prototype copy, not the regulated source of truth. Which events trigger emails
and their recipients — see Story 5.

---

**Acceptance Criteria**

**UI & field details**
- Every email subject uses sentence case and stays within 60 characters:
  - "Permit application submitted: [Application Title]"
  - "Your permit application was returned for revisions"
  - "Your permit application has been rejected"
  - "Your permit has been approved"
  - "CA State Parks SCP – annual report due in 15 days"
  - "CA State Parks SCP – annual report due today"

**Consistency**
- Every email opens with "Dear [Recipient Name]," and closes with the standard
  NRD signature block:
  ```
  Natural Resources Division
  California State Parks
  (916) 653-6725
  nrd.research@parks.ca.gov
  ```
- The contact line reads identically in every template: "If you have any
  questions, please contact us."
- The recipient merge field is [Recipient Name] in every template — replacing the
  earlier mix of [Recipient's Name], [Researcher Name], and [Researcher's Name].

**Variables**
- The rejected template uses two fields, [Application ID] and [Application Title],
  rendered "[Application ID] ([Application Title])" — replacing the combined
  [Application ID (Title)] field.
- [Permit Title] is an available variable in both annual report reminders and the
  Permit approved email; the annual reminders render "[Permit Number]
  ([Permit Title])".
- Every bracketed token in a template's subject or message is in that template's
  supported-variable set, so no template shows an unrecognized-token warning at
  rest.

**Edge cases & constraints**
- Standardizing the copy does not change which events trigger emails, their
  recipients, or send-time behavior.

---

**Testing notes**

- **Test 1 — No warning at rest:** Open each of the six emails in the editor.
  Confirm none shows an unrecognized-token warning before any edit.
- **Test 2 — Subject casing and length:** Confirm each subject is sentence case
  and 60 characters or fewer.
- **Test 3 — Greeting and closing:** Confirm every email opens with
  "Dear [Recipient Name]," and closes with the NRD signature block.

---

**Open questions**
- [ ] This story sets the prototype's recipient token to [Recipient Name] and the
  delimiter to [Bracket Title Case]. Confirm these match the send pipeline's field
  names (resolves the token-reconciliation open questions in Stories 5 and 6:
  [Recipient's Name] vs [Recipient Name]; PICOF vs "Person in Charge of Field
  Work" vs "Fieldwork").
- [ ] The regulated subjects for Application rejected (CSPS-87) and Permit
  approved (CSPS-78) are unspecified in Jira; the sentence-case subjects above are
  prototype placeholders pending the official lines.
- [ ] Confirm the NRD signature block should close all six emails (Story 5 had it
  on only some), and fix the (916) 635-6725 → 653-6725 typo noted in CSPS-52.
