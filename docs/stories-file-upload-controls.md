# File Upload Controls — One Component, One Rule — Jira Stories

One story: every place a user uploads a file uses the same Carbon file uploader,
with the trigger chosen by one rule. Multi-file uploads get a drag-and-drop area;
single-file uploads get an "Add file" button.

- **Story 1** — Standardize file upload controls on one component and one rule

The Technical Reviewer sub-roles referenced are the same as in
`stories-district-administration.md`: **HQ Technical Reviewer**, **District Lead
Technical Reviewer**, **District Assistant Technical Reviewer**.

---

## Story 1 — Standardize file upload controls on one component and one rule

**Story Title**
Standardize file upload controls on one component and one rule

---

**Description**

As a Researcher or CA State Parks Staff user,
I want every file upload to look and work the same way, with a drag-and-drop area
only where I'm expected to add several files,
So that I can see what each upload needs (whether it's required, which file types,
and any form to download first) and add files without guessing how each control
works.

Today every upload is a bare drag-and-drop area with a hand-built label, hint and
file list around it, and the label, hint and list sit in different places from
page to page. This story moves every upload onto the complete Carbon file uploader
(title, description, trigger and file list) and applies a single trigger rule:

| Upload accepts | Trigger | Label |
|---|---|---|
| Several files | Drag-and-drop area | "Drag and drop files here, or click to upload" |
| One file | Button (tertiary, medium) | "Add file" |

**Inventory (15 uploads):**

| Surface | Upload | Files | Trigger |
|---|---|---|---|
| Application — Research team | Résumé or CV | One | Button |
| Application — Research team | Liability waiver addendum | One | Button |
| Application — Project info | Project schedule | One | Button |
| Application — Study areas | GIS files | Several | Drag-and-drop ("Drag and drop GIS files here, or click to upload") |
| Application — Data collection | Supporting documentation (collection) | Several | Drag-and-drop |
| Application — Data collection | Supporting documentation (study procedures) | Several | Drag-and-drop |
| Application — Additional documents | Soil disturbance areas and supporting documents | Several | Drag-and-drop |
| Application — Additional documents | Additional permits and supporting documents | Several | Drag-and-drop |
| Application — Additional documents | Study proposal | One | Button |
| Application — Additional documents | Signed standard condition agreement form | One | Button |
| Application — Additional documents | Signed waiver and indemnity agreement form | One | Button |
| Application — Additional documents | Insurance addendum | One | Button |
| Permit detail — Annual report tab | Annual report | One | Button ("Upload file") |
| Permit detail — "Upload signed letter" modal | Signed letter | One | Button |
| Templates & defaults — "Replace document" modal | Regulated form (DPR65A / DPR65B) | One | Button |

*Prototype note:* the prototype build simulates the signed-in role with a
developer-only identity switcher. In production, the acting role is the signed-in
user's actual account role.

**Roles affected:** Researcher, Principal Investigator (PI) (application uploads
and the annual report on their own permit); Responsible analyst (RA) permit-role
(signed letter, annual report); System Admin (signed letter, annual report,
Replace document); HQ Technical Reviewer, District Lead Technical Reviewer and
District Assistant Technical Reviewer (annual report, only when they hold the
Responsible analyst permit-role on that permit).

**Out of scope:** Who may upload, and in which statuses. Every upload keeps its
current permissions and status gates (e.g. the signed letter only in Out for
signature, the annual report only in Active or Expired). This story changes only
the control. What happens after an upload (activation, holds, versions, emails)
is also unchanged. Download controls are already standard Carbon buttons, menu
items and links, and are untouched.

---

**Acceptance Criteria**

**UI & field details**
- Every upload listed in the inventory uses the complete Carbon file uploader:
  title, description, trigger, and the list of chosen files under the trigger.
- An upload that accepts several files uses the drag-and-drop area. An upload that
  accepts one file uses a tertiary, medium "Add file" button. The Annual report
  upload is labelled "Upload file", because choosing a file uploads it straight
  away.
- The title is the field label followed by "(required)" or "(optional)" in the
  secondary text color, at regular weight.
- The description states the accepted file types in the standard wording
  ("Accepted file type: PDF." / "Accepted file types: PDF, DOC, or DOCX.") and
  the maximum file size, plus any instructions the upload already had.
- An upload that needs a form signed first shows its "Download the unsigned …"
  link, with the download icon, inside the description and above the trigger.
  This covers the liability waiver addendum, standard condition agreement form,
  waiver and indemnity agreement form, and insurance addendum.
- In the "Upload signed letter" and "Replace document" modals, the uploader has no
  title (the modal heading names it), only the description.
- On the Annual report tab, the section heading names the upload, so the uploader
  has no title. Uploads appear in the Versions table, not in a file list.

**Happy path**
- Choosing files, by button or by drag-and-drop, adds one file item per file
  with a remove (×) control.
- A multi-file upload adds to its list. A single-file upload replaces the file
  already chosen.
- Removing a file item removes only that file.

**Edge cases & constraints**
- A file whose type the upload doesn't accept, or that is over the maximum size,
  appears as a file item in Carbon's error state, with a message naming the
  accepted types or the size limit. It doesn't count as uploaded, and the user
  can remove it. In a single-file upload it doesn't replace a valid file already
  chosen. The next choice clears any earlier error items.
- Required-upload checks, and the buttons that wait on a file (e.g. "Upload and
  activate", "Upload and hold", "Replace document"), count only valid files.
- Each upload handles only its own files. Adding a file to one upload never adds
  it to another upload on the same page.
- The maximum file size is chosen by the development team and stated in each
  upload's description. One app-wide value is preferred unless an upload needs
  its own. (The prototype uses 25 MB everywhere.)

*This story may be large enough to split (14 AC items). Consider moving the
wrong-type and size-limit errors (the first and last edge cases, and Tests 3–4)
into their own ticket.*

---

**Testing notes**

- **Test 1 — Trigger rule:** Open the application and visit each step. Confirm
  the five multi-file uploads in the inventory show a drag-and-drop area and the
  seven single-file application uploads show an "Add file" button. Repeat on the
  Annual report tab ("Upload file"), the "Upload signed letter" modal and the
  "Replace document" modal (both "Add file").
- **Test 2 — Multi vs single:** On GIS files, add a .zip, then add a .kml.
  Confirm both are listed. On Study proposal, add one PDF, then another. Confirm
  only the second is listed.
- **Test 3 — Wrong type:** Drag a .docx onto GIS files, and choose a .docx
  through "Add file" on the insurance addendum. Confirm each appears as an error
  item naming the accepted types, and that a required upload with only an error
  item still reads as missing at the review gate.
- **Test 4 — Over the size limit:** Add a file larger than the chosen limit to
  one drag-and-drop upload and one button upload. Confirm the error item names
  the limit.
- **Test 5 — No cross-talk:** On the application, add one file to each
  Supporting documentation upload and to Soil disturbance. Confirm each list
  shows exactly one file.
- **Test 6 — Signed letter:** As a System Admin on a permit in Out for
  signature, open "Upload signed letter" and choose a PDF. Confirm the file is
  listed and the upload buttons turn on. Remove it and confirm they turn off
  again.
- **Test 7 — Download link order:** On each signed-form upload, confirm the
  "Download the unsigned …" link sits above the "Add file" button and still
  downloads the current form from Templates & defaults.

---

**Open questions**
- None — story appears complete. The maximum file size is the development team's
  call, per the AC.
