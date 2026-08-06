# Download all uploaded documents

A single action on the permit detail page that downloads every uploaded document
at once, instead of downloading each file one row at a time. It lives in the
**Uploaded files** section on the **Additional documentation** tab.

Related docs: document surfaces and visibility conventions are described across
the internal-review and Uploaded Files sections; success/action toasts follow the
shared success-toast pattern.

---

## Story 1 — Download all uploaded documents at once

**Story Title**
Enable downloading all uploaded documents at once

---

**Description**

As an internal reviewer (and as the Researcher who owns the permit),
I want to download every uploaded document for a permit in one action,
So that I don't have to download each file individually.

The action sits in the header of the "Uploaded files" section and downloads the
full set of documents currently listed there, then confirms with a toast.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (owner) — anywhere the
Uploaded files section is viewable.

**Out of scope:** The per-row "View" and download actions on each file row — unchanged.
Which documents appear in "Uploaded files" — unchanged; this story only downloads the
set already shown. Bundling the files into a single archive (ZIP) — see Open questions.

---

**Acceptance Criteria**

**Access & permissions**
- A "Download all" button appears in the header of the "Uploaded files" section on the "Additional documentation" tab for any user who can view that section.

**Happy path**
- Selecting "Download all" downloads every document currently listed in "Uploaded files".
- A toast confirms the action and shows the count — "Downloading all documents" with a subtitle of "N files", where N matches the number of listed documents.

**UI & field details**
- The button reads "Download all" and carries a download icon.
- The button is a section-header action styled as a tertiary (outline) button, beside the "Uploaded files" title; the per-row View and download actions are unchanged.

**Edge cases & constraints**
- The downloaded set always matches the documents currently listed in "Uploaded files".
- Selecting "Download all" more than once re-downloads the full set each time.

**Data visibility**
- "Download all" downloads exactly the documents visible in the section for the current user — it does not expose any document the user could not already open individually.

---

**Implementation notes**

- The prototype has no server-side archiving, so "Download all" triggers one download per file (briefly staggered so the browser does not drop simultaneous downloads). A production build would likely return a single ZIP archive (see Open questions).

---

**Testing notes**

- **Behavior note:** Some browsers prompt once to allow multiple simultaneous downloads the first time; accept the prompt to proceed.
- **Test 1 — Download all:** Open a permit → Additional documentation → Uploaded files. Select "Download all". Confirm every listed document downloads and the toast reads "Downloading all documents / N files" with N matching the row count.
- **Test 2 — Count accuracy:** Confirm the toast's file count equals the number of rows shown in the Uploaded files table.

---

**Open questions**
- [ ] In production, should "Download all" produce a single ZIP archive instead of downloading each file individually?
- [ ] If a permit has no uploaded documents, should "Download all" be hidden or disabled rather than downloading nothing?
- [ ] Should the downloaded set respect per-role document visibility (e.g. internal-only documents excluded for the Researcher or public viewers), or are the listed rows already filtered by visibility upstream?
