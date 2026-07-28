# Resource category tags — user stories

Sibling stories for **Resource category tags** — the reusable internal labels
CA State Parks staff apply to permits for triage and coordination. Story 1 is the
catalog console where staff manage the vocabulary (add, edit, remove); Story 2
connects that catalog to the permit's Tags picker so a reviewer applies tags from
the managed set.

Resource category tags are internal handling labels — how the team is *handling* a
record. They are distinct from a permit's classification badges (what the permit
*is*) and from its status (what is *happening*). Tags are never shown to
Researchers or Public Users.

In the prototype, the catalog persists locally in the browser and is reached from
the **Catalogs** menu, alongside Special conditions.

---

## Story 1 — Create the Resource category tags catalog

**Story Title**
Let staff manage the Resource category tags catalog

---

**Description**

As a Technical Reviewer,
I want a single place to add, edit, and remove the resource category tags,
So that the labels reviewers apply to permits stay a consistent, current
vocabulary without a developer changing a fixed list.

Each tag is a short name plus a color. The color groups related tags; it is
categorical, never a status. The catalog is the source of truth the permit Tags
picker draws from (see Story 2).

**Roles affected:** Technical Reviewer, System Admin, Researcher, Public User

**Out of scope:** Applying tags to a permit — see Story 2. Whether tags should be
scoped per district (as Special conditions are) rather than org-wide — see open
questions. Any notification or audit of catalog changes.

---

**Acceptance Criteria**

**Access & permissions**
- Only internal staff (Technical Reviewer and System Admin) can reach the
  Resource category tags catalog from the Catalogs menu.
- Researchers and Public Users cannot see or reach the catalog.

**Happy path**
- The "Tag catalog" section lists every tag, each rendered as a colored tag chip
  in its assigned color.
- Staff add a tag with "Add tag": enter a "Tag name", choose a "Color", check the
  live "Preview", and save with "Save tag".
- Staff edit a tag with "Edit" — the dialog opens pre-filled with the tag's
  current name and color — or delete it with "Remove".
- After any add, edit, or remove, the catalog saves automatically and a "Catalog
  updated" confirmation appears.

**UI & field details**
- The page title is "Resource category tags"; the section is "Tag catalog". The
  add/edit dialog fields are "Tag name" (maximum 32 characters), "Color", and a
  "Preview" that renders the chosen name in the chosen color and updates live.
- The color options are: Cool gray, Gray, Warm gray, Blue, Cyan, Teal, Green,
  Purple, Magenta, and Red.
- When the catalog has no tags, an empty state prompts the user to create the
  first one with "Add tag".

**Edge cases & constraints**
- A tag cannot be saved with an empty name; the dialog shows a "Name required"
  warning and does not save.
- A tag cannot be saved with a name that duplicates an existing tag
  (case-insensitive); the dialog shows a "Tag already exists" warning naming the
  conflict and does not save.
- Color is a category label only, never a status: every tag carries a text name,
  so color is never the sole carrier of meaning.

---

**Testing notes**

- **Test 1 — Add a colored tag:** In the catalog, add a tag named "Nesting
  season" with the Green color. Confirm the Preview updates as you type and
  change color, the tag appears in the "Tag catalog" in green after saving, and
  the "Catalog updated" confirmation shows.
- **Test 2 — Duplicate name:** Add a tag named "Priority" when one already
  exists. Confirm the dialog shows "Tag already exists" and nothing is saved.
- **Test 3 — Persistence:** Add a tag, reload the page, and confirm the tag is
  still present.

---

**Open questions**
- [ ] Who governs the catalog — System Admin only, or may any Technical Reviewer
  add, edit, and remove tags?
- [ ] Should tags be org-wide (as built) or scoped per district like Special
  conditions, with a district-level catalog?
- [ ] Should removing a tag be blocked or warned when it is already applied to
  one or more permits (i.e. show a usage count before deletion)?
- [ ] Is there a maximum number of tags the catalog should hold?

---

## Story 2 — Apply resource category tags to a permit from the catalog

**Story Title**
Let reviewers apply resource category tags to a permit

---

**Description**

As a Technical Reviewer,
I want to apply resource category tags to a permit from the managed catalog and
remove them,
So that triage and coordination labels on a permit stay consistent with the
shared vocabulary.

The permit's Tags picker draws its choosable set from the Resource category tags
catalog (Story 1), so it always reflects the current vocabulary rather than a
fixed built-in list.

**Roles affected:** Technical Reviewer, System Admin, Researcher, Public User

**Out of scope:** Managing the catalog vocabulary itself — see Story 1. A permit's
classification badges and its status, which are separate from tags.

---

**Acceptance Criteria**

**Access & permissions**
- Only internal staff (Technical Reviewer and System Admin) can apply or remove a
  permit's tags.
- Researchers and Public Users never see a permit's tags, including in the
  Application Summary and the Review and Submit view.

**Happy path**
- The permit's "Tags" section offers the current Resource category tags catalog
  as the choosable set.
- A reviewer applies one or more tags; each applied tag appears below the picker
  in its catalog color and can be removed individually.
- Applied tags persist on the record.

**State & status transitions**
- Applying or removing a tag does not change the application status or the record
  type. Tags can be applied in every status and carry over from Application to
  Active Permit.

**Data visibility**
- Applied tags appear on the internal review page and in the Tags column of the
  Permits index (hidden by default). They are never shown to Researchers or
  Public Users.

**Edge cases & constraints**
- The choosable set reflects the catalog at the time the permit is viewed: a tag
  added to the catalog becomes available to apply.
- No notification is sent when a tag is applied to or removed from a permit.

---

**Testing notes**

- **Test 1 — Apply from the catalog:** Add a new tag in the catalog (Story 1),
  then open a permit and confirm the new tag is available in the "Tags" picker.
  Apply it and confirm it appears below in its catalog color.
- **Test 2 — Internal-only visibility:** Apply a tag as a Technical Reviewer.
  Confirm it shows on the internal review page but is absent from the researcher's
  Application Summary / Review and Submit view.

---

**Open questions**
- [ ] When a catalog tag is renamed or removed after it has been applied to a
  permit, does the permit reflect the change live, or keep a snapshot of the tag
  as applied?
- [ ] Is there a maximum number of tags that can be applied to a single permit?
- [ ] Should applied tags be filterable on the Permits index, and should the Tags
  column be shown by default rather than hidden?
