# Permit application form — user stories

Stories for the **public applicant flow** (`/apply`, the "Permit application"
prototype): a Researcher creating a Scientific Research & Collection Permit
application as a multi-page **Draft**, through submission.

These document the form as the prototype now behaves. Field-level required/optional
marking and the red invalid treatment are **already specified** in
[`stories-application-field-validation.md`](stories-application-field-validation.md)
and are not restated here — Story 3 covers only the navigation gate those stories
sit behind.

**Prototype note:** `?bypass` on the URL lifts the completeness and certification
gates so the flow can be walked without filling every field. It is a dev/QA escape
hatch, not product behavior, and is out of scope for every story below.

## Coverage

| # | Story | Surface |
|---|---|---|
| 1 | Split the application into a six-page wizard with a progress rail | `apply.astro` |
| 2 | Auto-save the draft on every navigation | `apply.astro` |
| 3 | Gate the Application summary page on completeness | `apply.astro` |
| 4 | Prefill and branch the research team from the applicant's account | `ResearchTeamStep` |
| 5 | Capture addresses and phone numbers with shared fieldsets | `AddressFieldset`, `PhoneField` |
| 6 | Let applicants defer narrative answers to the study proposal | `DataCollectionStep`, `AdditionalDocsStep` |
| 7 | Review every answer on a read-only Application summary | `SummaryStep` |
| 8 | Require certification before Submit is enabled | `SummaryStep` |
| 9 | Withdraw a draft application with confirmation | `apply.astro` |
| 10 | Confirm submission on a full-screen success view | `apply.astro` |
| 11 | Reuse the application form to request an amendment | `apply.astro` |

---

## Story 1 — Split the application into a six-page wizard with a progress rail

**Story Title**
Split the permit application into six navigable pages

---

**Description**

As a Researcher completing an Application in Draft,
I want the application broken into named pages I can move between in any order,
So that I can work through a long form in manageable pieces and return to any
section without scrolling past everything else.

The six pages are fixed and ordered: **Research team**, **Project information**,
**Study areas**, **Data collection**, **Additional documents**, and
**Application summary**. The first five collect answers; the sixth reviews them.

**Roles affected:** Researcher

**Out of scope:** The completeness gate that restricts entry to **Application
summary** — see Story 3. The content of each page's fields.

---

**Acceptance Criteria**

**Access & permissions**
- Only the Researcher who owns the Application in Draft can open and navigate it.

**Happy path**
- The application displays exactly one page at a time; the other five are hidden.
- A progress rail lists all six pages with their labels and sub-labels:
  Research team / "Who is conducting the research", Project information /
  "Purpose, scope, and dates", Study areas / "Parks and locations", Data collection /
  "Methods and specimens", Additional documents / "Supporting materials", and
  Application summary / "Review and submit".
- The rail marks pages before the current one complete, the current one current,
  and later ones incomplete.
- Selecting a page in the rail navigates to it, by mouse or by keyboard.
- Selecting "Save and continue" advances to the next page; selecting "Back"
  returns to the previous one.
- On navigation, the view scrolls to the top of the page content.

**UI & field details**
- Each page carries a header with an eyebrow reading "Page N of 6", the page
  label as its title, and the page's sub-label beneath it.
- The primary action reads "Save and continue" on pages 1–5 and "Submit
  application" on Application summary.
- "Back" is hidden on Research team (the first page).
- An information banner appears on every page of the Draft: "You can leave and
  come back anytime" / "Your progress saves automatically, so you can finish
  later. Complete sections in any order, or use Save and continue to move ahead.
  Every field is marked required or optional."

**Edge cases & constraints**
- The five form pages are reachable in any order, regardless of whether earlier
  pages are complete.

---

**Open questions**
- [ ] Is the six-page sequence fixed for every applicant, or do any pages
  appear conditionally (for example, skipping Data collection when no specimens
  are collected)?
- [ ] Should the rail show a per-page completeness state (for example, a count of
  missing required items) rather than only position in the sequence?

---

## Story 2 — Auto-save the draft on every navigation

**Story Title**
Auto-save the application draft on every page change

---

**Description**

As a Researcher completing an Application in Draft,
I want my answers saved automatically whenever I move between pages,
So that I can leave the application and return later without losing work or
hunting for a save button.

The draft saves even when fields are incomplete or invalid — saving is never
gated on correctness, so navigation is never blocked by unfinished work.

**Roles affected:** Researcher

**Out of scope:** Persistence across devices or sessions in the prototype (it is
client-side only). Auto-save on an idle timer between navigations.

---

**Acceptance Criteria**

**Happy path**
- The system saves the Draft before every page change, whether triggered by
  "Save and continue", "Back", or the progress rail.
- The Draft saves with incomplete and invalid answers intact; no field state
  prevents the save.
- There is no separate "Save" or "Save draft" action anywhere in the form.

**State & status transitions**
- Saving does not change the record's status — it remains **Draft** until
  submitted.

**Edge cases & constraints**
- Navigation never blocks on save failure or on missing answers; the only
  navigation restriction is the completeness gate on **Application summary**
  (Story 3).

---

**Open questions**
- [ ] Should the system also auto-save on a timer or on field blur, so work is
  retained when the browser closes mid-page without a navigation?
- [ ] Is any save confirmation shown (a timestamp, "Saved" indicator), or is the
  banner statement the only reassurance?
- [ ] How long is an unsubmitted Draft retained before it is purged?

---

## Story 3 — Gate the Application summary page on completeness

**Story Title**
Block entry to Application summary until required items are provided

---

**Description**

As a Researcher completing an Application in Draft,
I want to be stopped and told exactly which pages are unfinished when I try to
reach the review page,
So that I fix real gaps at the one moment they block me, rather than being
scolded while I am still filling the form.

Reaching **Application summary** is the effective submit attempt: it is the only
page in the flow with an entry condition. Every other page stays freely reachable.

**Roles affected:** Researcher

**Out of scope:** The `(required)` / `(optional)` label markers and the red invalid
field treatment — both specified in
[`stories-application-field-validation.md`](stories-application-field-validation.md).
The certification gate on Submit — see Story 8.

---

**Acceptance Criteria**

**Access & permissions**
- The Researcher can open the first five pages at any time, in any order,
  regardless of completeness.

**Happy path**
- When every required item is provided, selecting "Save and continue" from
  Additional documents — or selecting Application summary in the progress rail —
  opens the Application summary page.

**Edge cases & constraints**
- When required items are still missing, attempting to reach Application summary
  by either route does **not** navigate; the "Application incomplete" modal opens
  instead.
- The modal lists one link per incomplete page, labeled with that page's name.
- Selecting a page link in the modal closes the modal and navigates to that page.
- Attempting to reach Application summary again while still incomplete re-opens
  the modal with the list refreshed.

**UI & field details**
- The modal is titled "Application incomplete" with the label "Scientific Research
  & Collection Permit application", a lead line "Missing required information",
  and the body "Your work is saved, but some required fields are still empty. Fill
  in the pages below, then continue to review and submit."
- The modal's only footer action is "Close".
- Each incomplete page shows an error banner at the top of that page titled
  "Missing required information", listing exactly what is missing on that page.
- The page banners persist after the modal is dismissed, so the gaps stay visible
  in context on return.

---

**Testing notes**

- **Test 1 — Rail jump while incomplete:**
  Open a Draft with required items missing on more than one page. Select
  Application summary in the progress rail. Confirm the modal opens, the page does
  not change, and every incomplete page is listed.

- **Test 2 — Banner persistence:**
  From the modal, select a listed page. Confirm the modal closes, the page opens,
  and its error banner is present. Navigate away and back. Confirm the banner is
  still shown and is not duplicated.

- **Test 3 — Gate clears:**
  Fill every listed item, then select Application summary. Confirm the page opens
  and no modal appears.

---

**Open questions**
- [ ] Do the page error banners clear once their items are filled, or persist for
  the rest of the session?
- [ ] Should the modal list the specific missing items under each page, or is the
  page name alone sufficient?

---

## Story 4 — Prefill and branch the research team from the applicant's account

**Story Title**
Prefill research team contacts from the signed-in applicant's profile

---

**Description**

As a Researcher completing the Research team page of an Application in Draft,
I want the form to reuse my account details when I am the person being described,
So that I confirm information instead of retyping it, and only enter contact
details for people who are not me.

The page captures the applicant **Organization**, the **Principal investigator
(PI)**, the **Person in direct charge of field work (PICOF)**, **Additional
participants**, and a personnel insurance statement. The PI and PICOF sections
each branch on a required question, revealing or replacing their contact fields.

**Roles affected:** Researcher (the submitter). Captures details for the Principal
Investigator, the Person In Charge Of Field work, and Participants — none of whom
need system accounts.

**Out of scope:** Address and phone input behavior — see Story 5. Inviting a
participant to create an account.

---

**Acceptance Criteria**

**Happy path**
- The Organization section prefills the applicant organization's name, phone,
  email, and address from the account for the Researcher to confirm or edit.
- The Principal investigator section offers the checkbox "I am the principal
  investigator for this project"; when checked, the PI contact fields prefill from
  the signed-in Researcher's profile.
- The Researcher can upload the PI's résumé, and is offered "Save this résumé to
  my profile and auto-fill it on future applications".
- The Person in direct charge of field work section asks "Is this the same person
  as the principal investigator? (required)".
- Answering yes replaces the contact fields with the confirmation "No extra
  details needed" / "The principal investigator directs field work, so there's
  nothing more to add here."
- Answering no asks "Are you (the submitter) the person in direct charge of field
  work? (required)"; answering yes shows "We'll use your profile details" /
  "You're directing field work, so there's no need to re-enter your contact
  information.", and answering no reveals the full PICOF contact fields.
- The Additional participants section lets the Researcher add, edit, and remove
  roster entries with first name, last name, title, email, phone, and comments.
- The Personnel & insurance section captures whether all personnel are insured
  through the institution.

**State & status transitions**
- Checking "Save this résumé to my profile" stores the résumé on the Researcher's
  profile so a later application prefills it; leaving it unchecked attaches the
  résumé to this application only.

**Edge cases & constraints**
- Participants are free-typed and may have no system account; no account lookup or
  matching occurs.
- Switching a branch answer after entering contact details determines whether
  those details are retained or discarded — see Open questions.

---

**Open questions**
- [ ] When the Researcher answers "same person as the PI" after already entering
  PICOF contact details, are those details discarded or retained in case the
  answer changes back?
- [ ] Is there a maximum number of Additional participants?
- [ ] Which Additional participant fields are required? The completeness model
  currently requires a phone number for every participant — does that hold, and
  are email and title also required?
- [ ] If the Researcher edits prefilled Organization details, does the change
  write back to the account record or apply to this application only?

---

## Story 5 — Capture addresses and phone numbers with shared fieldsets

**Story Title**
Standardize address and phone entry across the application form

---

**Description**

As a Researcher entering contact details on an Application in Draft,
I want address and phone fields that adapt to the country I select,
So that I can enter a non-US address or an international phone number without
forcing it into a US-only format.

Every address in the application uses one country-aware fieldset, and every phone
number uses one phone field, so the form, the stored record, and the Application
summary all speak the same model.

**Roles affected:** Researcher

**Out of scope:** Address verification or autocomplete against a postal service.
Which specific addresses are required — see Story 4.

---

**Acceptance Criteria**

**Happy path**
- Every address in the application is collected through the same fieldset:
  country, address line 1, address line 2, city, state/region, and postal code.
- Selecting a country adapts the region and postal code fields to that country's
  conventions.
- For a US address, the region field offers the US states and stores the USPS code.
- Phone numbers accept international input and are stored in a single canonical
  format regardless of how they are typed.
- The Application summary renders every address and phone number in a consistent
  display format.

**Edge cases & constraints**
- A phone number that cannot be parsed for the selected country is rejected with
  an inline message rather than silently stored.

---

**Open questions**
- [ ] Is a non-US address actually permitted on a Scientific Research & Collection
  Permit application, or should the country default to United States and stay
  fixed for the applicant organization?
- [ ] What is the inline error message for an unparseable phone number?
- [ ] Are phone extensions captured?

---

## Story 6 — Let applicants defer narrative answers to the study proposal

**Story Title**
Allow narrative answers to be deferred to the attached study proposal

---

**Description**

As a Researcher completing an Application in Draft,
I want to mark a long narrative question as already answered in my study proposal,
So that I do not have to retype content that the attached proposal already covers.

Several narrative questions on **Data collection** and **Additional documents**
pair a free-text field with an "Answered in study proposal" checkbox. Either
satisfies the requirement; neither leaves the item incomplete.

**Roles affected:** Researcher

**Out of scope:** Validating that the attached study proposal actually contains
the deferred answer. The study proposal upload itself.

---

**Acceptance Criteria**

**Happy path**
- Each supported narrative question offers a text field and an "Answered in study
  proposal" checkbox.
- Checking "Answered in study proposal" satisfies that question's requirement with
  the text field empty.
- Entering text satisfies the requirement with the checkbox unchecked.
- The Application summary states which of the two was used for each deferred
  question.

**Edge cases & constraints**
- Leaving the text field empty with the checkbox unchecked leaves the item
  incomplete and lists it in the page's error banner — for example, "Provide a
  collection rationale, or mark it as answered in the study proposal."
- The Additional permits section uses the same either/or shape across a different
  pair: an uploaded document or a written rationale satisfies it, and providing
  neither shows "At least one response is required" / "Upload a permit or
  supporting document, or provide a rationale, to complete this section."

---

**Open questions**
- [ ] If the Researcher checks "Answered in study proposal" but never attaches a
  study proposal, should the application be blocked from review?
- [ ] Does text already typed remain stored when the checkbox is later checked?
- [ ] Which narrative questions support deferral? Confirm the full list against the
  regulated form.

---

## Story 7 — Review every answer on a read-only Application summary

**Story Title**
Show a read-only Application summary with per-section Edit links

---

**Description**

As a Researcher who has completed an Application in Draft,
I want a single read-only page showing every answer I have given,
So that I can check the whole application before submitting and jump straight back
to anything I need to change.

**Roles affected:** Researcher

**Out of scope:** The certification gate on Submit — see Story 8. The completeness
gate that controls entry to this page — see Story 3.

---

**Acceptance Criteria**

**Happy path**
- The Application summary page reviews all five form pages in order: Research team,
  Project information, Study areas, Data collection, and Additional documents.
- Each section reproduces its page's sub-sections — for example Research team shows
  Organization, Principal investigator, Person in direct charge of field work, and
  Additional participants.
- Every answer is displayed read-only; no field on this page is editable.
- Each section header carries an "Edit" action that navigates to that page.
- An optional item left empty displays an explicit empty state rather than a blank —
  for example "None provided" for an unused GIS upload.
- Uploaded documents are listed by filename.

**UI & field details**
- The page opens with the banner "Review before you submit".
- Section "Edit" actions are tertiary buttons placed in each section header.

**Edge cases & constraints**
- Selecting "Edit" navigates backward to a form page and is never blocked by the
  completeness gate.

---

**Open questions**
- [ ] After editing, does the Researcher return to Application summary
  automatically, or continue forward through the remaining pages?
- [ ] Should the summary be printable or downloadable as a PDF before submission?

---

## Story 8 — Require certification before Submit is enabled

**Story Title**
Require an accuracy certification before enabling Submit

---

**Description**

As California State Parks,
I want the Researcher to certify the accuracy of their application before they can
submit it,
So that every submission carries an explicit attestation from the applicant.

**Roles affected:** Researcher

**Out of scope:** Capturing a signature or a timestamped audit record of the
certification. The Principal Investigator's signature on the regulated form.

---

**Acceptance Criteria**

**Access & permissions**
- The certification appears only on the Application summary page.

**Happy path**
- The Application summary shows the checkbox "I certify that the information
  provided in this application is accurate and complete to the best of my
  knowledge."
- "Submit application" is disabled until the checkbox is checked.
- Checking the box enables "Submit application" immediately; unchecking it disables
  the button again.

**UI & field details**
- The certification is introduced by the banner "Ready to submit?" / "Once
  submitted, your application goes to California State Parks for review. Confirm
  the statement below to enable Submit."

**Edge cases & constraints**
- The system does not submit an uncertified application even if the disabled
  button is activated by other means.

---

**Open questions**
- [ ] Is the certification wording regulated? If so, confirm the exact copy against
  the DPR form.
- [ ] Is the certifier's identity and timestamp stored on the submitted record for
  the reviewer to see?

---

## Story 9 — Withdraw a draft application with confirmation

**Story Title**
Let a Researcher withdraw a draft application after confirming

---

**Description**

As a Researcher with an Application in Draft I no longer want to pursue,
I want to withdraw it behind a confirmation,
So that I can clear an abandoned application deliberately, without being able to
destroy my work by mis-clicking.

**Roles affected:** Researcher

**Out of scope:** Withdrawing an application that has already been submitted.
Restoring a withdrawn application.

---

**Acceptance Criteria**

**Access & permissions**
- "Withdraw application" is available on every page of a Draft.

**Happy path**
- Selecting "Withdraw application" opens a confirmation modal rather than acting
  immediately.
- Confirming discards the Draft, shows the confirmation "Application withdrawn" /
  "This draft has been discarded.", and returns the Researcher out of the form.
- Selecting "Keep working" closes the modal and leaves the Draft untouched on the
  current page.

**State & status transitions**
- Withdrawing ends the Draft; the application is no longer editable or reachable
  from the form. See Open questions on whether the record is deleted or retained
  as **Withdrawn**.

**UI & field details**
- "Withdraw application" is rendered as a destructive (danger) action, separated
  from the primary action.
- The modal is titled "Withdraw this application?" with the body "This permanently
  discards your draft and can't be undone. Since your answers save automatically,
  you can simply leave and return to finish later instead."
- The modal's actions are "Keep working" and "Withdraw application".

---

**Open questions**
- [ ] Does withdrawing a **Draft** delete the record, or retain it with the
  terminal status **Withdrawn**? The modal copy says "permanently discards", but
  **Withdrawn** exists as a status — these need reconciling.
- [ ] Is anyone at NRD notified when a Draft is withdrawn, or is a never-submitted
  Draft invisible to staff?
- [ ] Where does the Researcher land after withdrawing — the permits list or the
  home page?

---

## Story 10 — Confirm submission on a full-screen success view

**Story Title**
Confirm a submitted application on a full-screen success view

---

**Description**

As a Researcher who has just submitted an application,
I want unmistakable confirmation that it was received, with my tracking number and
what happens next,
So that I know the submission landed and do not resubmit.

**Roles affected:** Researcher. Downstream: the Responsible Agent who picks the
application up for review.

**Out of scope:** Reviewer-side assignment and the "Start review" action.

---

**Acceptance Criteria**

**Happy path**
- Submitting replaces the entire form — header banner, progress rail, and pages —
  with a success view.
- The success view states "Application {tracking number} was submitted", confirms
  "A confirmation email was sent to {applicant email}.", and sets expectations:
  "You'll be notified by email if additional information is needed, and again once
  a decision is made."
- The success view offers a "View my permits" action.
- The browser page title changes to "Application submitted".
- The view is scrolled to the top so it is seen from its start.

**State & status transitions**
- On submission, the record moves from **Draft** to **Waiting for review**.
- The submitted application is no longer editable by the Researcher.

**Notifications**
- The Researcher receives a confirmation email at the address on their account.
- Email body copy is not defined — flagged as an open question below.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.

- **Test 1 — Submit and return:**
  Submit a complete application. Confirm the success view replaces the form and the
  tracking number matches the Draft. Navigate back in the browser and confirm the
  form does not return to an editable state.

---

**Open questions**
- [ ] What is the full email body copy sent to the Researcher on submission, and
  does it go to the Principal Investigator and Person In Charge Of Field work as
  well as the submitter?
- [ ] Does the confirmation email carry a copy of the submitted application, or
  only the tracking number and a link?
- [ ] Is anyone at NRD notified on submission, or does the application simply
  appear in **Waiting for review**?

---

## Story 11 — Reuse the application form to request an amendment

**Story Title**
Prefill the application form to request a permit amendment

---

**Description**

As a Researcher with an Active permit that needs changing,
I want to request an amendment through the same form, prefilled from the original
permit,
So that I update only what changed instead of re-entering the whole application.

An amendment is a new record of type **Amendment**, prefilled from the original
permit and numbered with the original permit's number plus an "-A" suffix.

**Roles affected:** Researcher

**Out of scope:** Reviewer-side handling of an Amendment record. Which fields an
amendment may change. Renewals.

---

**Acceptance Criteria**

**Access & permissions**
- The amendment form is reached from an **Active** permit's "Request amendment"
  action.

**Happy path**
- The form opens prefilled with the original permit's answers on every page.
- The title reads "Amend a Scientific Research & Collection Permit".
- The tracking number is the original permit's number with an "-A" suffix.
- An "Amendment" type label is shown beside the number, and an "Amending permit"
  entry links back to the original permit.
- The breadcrumb reads Home › Permits › {original permit} › Amendment, with the
  original permit's entry linking to its detail page.
- A notice explains the prefill: "Amending permit {original}" / "We've prefilled
  this form with the original permit's information. Update what's changed, then
  submit for review. Your amendment keeps the original number with an '-A' suffix."
- On submission, the success view reads "Amendment {number} was submitted".

**State & status transitions**
- The amendment is its own record with record type **Amendment**, starting in
  **Draft**; the original permit stays **Active** and unchanged while the amendment
  is drafted.

**UI & field details**
- The "Amendment" label is a neutral type marker, not a workflow status — the
  record's status is shown separately.

**Edge cases & constraints**
- Every behavior in Stories 1–10 applies unchanged in amendment mode, including
  auto-save, the completeness gate, certification, and withdraw.

---

**Open questions**
- [ ] Can more than one amendment exist for a permit? If so, how is the second
  numbered — "-A2", "-B", or something else?
- [ ] Can a Researcher request an amendment on a permit that is not **Active** —
  for example one in **Waiting for annual report** or flagged **Delinquent**?
- [ ] Are all pages editable on an amendment, or are some answers locked to the
  original permit?
- [ ] Does the original permit show that an amendment is in progress against it?
