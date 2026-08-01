# Document Viewer — Jira Stories

One story: give reviewers an in-review document viewer that shows any document
uploaded to the permit, defaulting to the Study Proposal, and lets them switch
between documents without leaving the review.

- **Story 1** — View and switch permit documents in the review wizard

This capability was prototyped in the review-wizard layout study
(`src/pages/review-layouts.astro`, non-shipping) via the `DocumentViewer`
component. This story is to graduate it into the real review wizard
(`final-letter.astro`). The reviewer's three jobs it supports — compare the
application against the documents, set special conditions, and talk to other
reviewers — come from `docs/usability-test-reviewer-admin.md`.

The reviewer roles referenced use the exact identity names from
`docs/permissions-matrix.md`: **HQ Technical Reviewer**, **District Lead Technical
Reviewer**, **District Assistant Technical Reviewer**, **System Admin**.

---

## Story 1 — View and switch permit documents in the review wizard

**Story Title**
Enable reviewers to view and switch permit documents during review

---

**Description**

As a Technical Reviewer (HQ Technical Reviewer, District Lead Technical Reviewer,
District Assistant Technical Reviewer) or System Admin,
I want to open any document uploaded to the permit — with the Study Proposal shown
by default — and switch between documents without leaving the review,
So that I can read the application against its supporting documents in one place
while I analyze the permit.

Supporting documents (Study Proposal, PI resume, study-area maps, waivers, signed
agreements, etc.) are uploaded with the application. Today a reviewer reaches them
only from the Uploaded Files list; this story embeds a viewer in the review so the
reviewer can read the actual document alongside the application record. Viewing is
read-only and does not change the permit.

*Prototype note:* the prototype simulates the signed-in role with a developer-only
identity switcher. In production the acting role is the signed-in user's actual
account role.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer. Researcher and Public User have no
access to the review wizard and do not see the viewer.

**Out of scope:** Uploading, replacing, or deleting documents (file management on
the application). Generating regulated or output documents (Signed Active Permit,
DPR65A, DPR65B). The alternative review-wizard **layout arrangements** explored in
the design study (`src/pages/review-layouts.astro`) — that page is a non-shipping
exploration, not part of this story.

---

**Acceptance Criteria**

**Access & permissions**
- The document viewer appears in the review wizard and is available to any reviewer
  who can access the review wizard on that permit — System Admin, HQ Technical
  Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer —
  regardless of their **permit-role** (Responsible Agent or Supporting Agent). It
  inherits the review wizard's existing access gating; this story does not redefine
  who may open the wizard.
- Viewing a document is read-only: no reviewer can edit, replace, or delete a
  document from the viewer.
- Researchers and Public Users do not access the review wizard and therefore never
  see the viewer.

**Happy path**
- When the reviewer opens the review wizard, the viewer loads with the **Study
  Proposal** shown by default.
- The viewer's document picker lists every document uploaded to the permit, labeled
  by file name.
- Selecting a different document in the picker replaces the embedded document in
  place, with no page reload.
- The viewer shows the selected document's file name, size, and page count.
- The viewer provides an action to open the selected document in a new browser tab.

**State & status transitions**
- Viewing or switching a document does not change the permit status, the reviewer's
  permit-role, or any edit lock — it is a read-only action.

**UI & field details**
- The default selected document is the **Study Proposal**.
- The picker is a single-select control: exactly one document is shown at a time.
- The viewer does not replace the **Uploaded Files** aggregated section; that
  section remains the canonical file list, and this viewer complements it.

**Edge cases & constraints**
- If the permit has only one uploaded document, the picker still shows that document
  as selected and the viewer displays it.
- If the selected document cannot be rendered inline, the viewer shows a fallback
  state with the open-in-new-tab action so the reviewer can still retrieve the file.
- Switching documents repeatedly always reflects the most recently selected
  document.

**Availability by status**
- The viewer is available whenever the reviewer can open the review wizard — i.e.
  while the permit is **Under review**.
- In **Draft** and **Waiting for review** the review wizard has not been started
  (no reviewer has clicked **Start review**), so the viewer is not applicable.

---

**Testing notes**

- **Test 1 — Default document:** Open a permit that is **Under review** and enter
  the review wizard. Confirm the **Study Proposal** is shown by default and named in
  the viewer.
- **Test 2 — Switch documents:** From the picker, select each uploaded document in
  turn. Confirm the embedded document updates in place and the file name, size, and
  page count update to match.
- **Test 3 — Open in new tab:** Select a document and use the open action. Confirm
  the same document opens in a new browser tab.
- **Test 4 — Role access:** As each reviewer role (System Admin, HQ Technical
  Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer),
  confirm the viewer is present in the review wizard. As a Researcher, confirm there
  is no access to the review wizard or the viewer.
- **Test 5 — Single document:** Open a permit with exactly one uploaded document and
  confirm the picker and viewer behave correctly.

---

**Open questions**
- [ ] What is the exact product copy for the viewer's section heading, the picker
  label, and the open-in-new-tab action?
- [ ] Which document set appears in the picker — applicant-uploaded files only, or
  also generated/regulated documents (Signed Active Permit, DPR65A, DPR65B) once
  they exist?
- [ ] Non-PDF uploads: if a document is not a PDF (e.g. an image or an Office file),
  does the viewer embed it, or show a download-only fallback?
- [ ] Should the viewer remain available (read-only) after review — when the permit
  is **Out for signature**, **Active**, or **Expired** — so a reviewer can still
  reference documents, or is it scoped to **Under review** only?
- [ ] How should the picker order documents — Study Proposal first, then by upload
  date, by document type, or the application's file order?
