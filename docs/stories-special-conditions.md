# Special Conditions Catalog — Jira Stories

One story: scope the Special conditions catalog console to the signed-in user's
role — who may curate which catalog, and who sees the rest read-only.

- **Story 1** — Scope the Special conditions catalog to the user's role

The Technical Reviewer sub-roles referenced are the same as in
`stories-district-administration.md`: **HQ Technical Reviewer**, **District Lead
Technical Reviewer**, **District Assistant Technical Reviewer**.

---

## Story 1 — Scope the Special conditions catalog to the user's role

**Story Title**
Scope the Special conditions catalog to the user's role

---

**Description**

As a Technical Reviewer or System Admin,
I want the Special conditions console to let me curate only the catalogs I'm
responsible for and view the rest read-only,
So that reviewers attach consistent, approved conditions to permits without
editing catalogs outside their remit.

Special conditions are reusable text items reviewers attach to permits. There is
one org-wide catalog plus one catalog per district. Access is determined by the
signed-in user's account role.

*Prototype note:* the prototype build simulates the signed-in role with a
developer-only identity switcher. In production, the acting role is the signed-in
user's actual account role.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (no access), Public
User (no access).

**Out of scope:** The rule that a "default" condition auto-attaches when a permit
enters review (existing behavior). Access to the District administration console
— see `stories-district-administration.md` (CSPS-XXX).

---

**Acceptance Criteria**

**Access & permissions**
- A System Admin and an HQ Technical Reviewer can curate the org-wide catalog and
  the catalog of every district.
- A District Lead Technical Reviewer can curate the catalog of each district they
  lead.
- A District Assistant Technical Reviewer can curate the catalog of their
  assigned district.
- A District Lead and a District Assistant Technical Reviewer can view the
  org-wide catalog and every other district's catalog read-only, but cannot edit
  them.
- A generic Reviewer with no district or HQ role, a Researcher, and a Public User
  cannot open the console and are shown a no-access message in place of it.

**Happy path — catalog selection**
- The console provides a Catalog selector listing only the catalogs the user may
  curate.
- An HQ user's selector lists the org-wide catalog plus every district.
- A lead's or assistant's selector lists only their own district(s); the selector
  is hidden when the user may curate exactly one catalog, which loads directly.
- Selecting a catalog scopes the editable "My catalog" view to it.

**Read-only visibility**
- The "All districts" view lists every catalog — the org-wide catalog and all
  district catalogs — read-only, for reference.
- From the "All districts" view, a user may copy a condition from any catalog into
  a catalog they are permitted to curate.

**Edge cases & constraints**
- The org-wide catalog appears in the editable Catalog selector only for HQ users;
  leads and assistants see it read-only in the "All districts" view only.
- The console never lets a user edit a catalog outside their curation scope,
  including via the read-only browse view.

---

**Testing notes**

- **Test 1 — Access matrix:** For each role (System Admin, HQ Technical Reviewer,
  District Lead, District Assistant, generic Reviewer, Researcher, Public User),
  open Special conditions and confirm access and the editable catalog list match
  the AC.
- **Test 2 — Assistant curates own, views org-wide:** As a District Assistant,
  confirm the org-wide catalog is visible read-only in "All districts" and cannot
  be edited, while the assistant's own district catalog is editable.

---

**Open questions**
- [ ] Can a District Assistant Technical Reviewer curate more than one district if
  assigned to several, and can a District Lead curate more than the districts they
  lead?
- [ ] Should a District Lead be able to edit the org-wide catalog, or is org-wide
  curation reserved for HQ (System Admin / HQ Technical Reviewer)?
- [ ] Is there an approval step before a district condition becomes attachable to
  permits, or is a saved condition immediately available?
