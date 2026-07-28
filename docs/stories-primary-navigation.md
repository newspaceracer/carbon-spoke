# Primary Navigation — Jira Stories

One story: restructure the top navigation from a flat, mixed list into task-based
groups, and split the read-only Districts directory from the District
administration console.

- **Story 1** — Restructure the primary navigation into task-based groups

Related: District administration access and scoping — see
`stories-district-administration.md` (CSPS-XXX).

---

## Story 1 — Restructure the primary navigation into task-based groups

**Story Title**
Restructure the primary navigation into task-based groups

---

**Description**

As CA State Parks Staff using the permit system,
I want the top navigation organized by task with clearly labeled destinations,
So that I can reach my work, reference directories, catalogs, and admin tools
without scanning a flat list that mixes unrelated things.

The navigation previously placed work destinations, a reference directory, two
curation catalogs, and a utility link in a single flat row, and carried a
duplicate Districts link plus a dead link. This story regroups those items and
corrects their labels; it does not change what any destination page does.

**Roles affected:** CA State Parks Staff (all Technical Reviewer types), System
Admin, District Lead Technical Reviewer. Researcher and Public User are not
affected — their applicant navigation is unchanged.

**Out of scope:** Building the Help destination — see CSPS-XXX. Role-scoped
access to the District administration console reached from the Admin menu — see
CSPS-XXX (District administration access). Applicant-facing navigation (Apply /
My applications) — not touched by this story.

---

**Acceptance Criteria**

**UI & field details — primary navigation**
- The primary navigation contains, in order: Permits, My permits, Districts.
- "Districts" opens the read-only district directory (office, parks, and
  contacts) — not the management console.
- A "Catalogs" menu contains: Resource category tags, Special conditions.
- An "Admin" menu contains, in order: Dashboard, Users, District
  administration, Templates & defaults, Maintenance mode.
- "District administration" links to the management console (the scoped
  edit screen), distinct from the "Districts" directory in the primary nav.
- All menu and item labels use sentence case.

**UI & field details — utility & mobile**
- Help is presented as a header utility action (icon), not a primary
  navigation item.
- Below the navigation breakpoint, the collapsed side navigation mirrors the
  same structure: the primary links, then Catalogs, then Admin, then Help.

**Access & permissions**
- The Admin menu and its items are shown only to roles authorized to use them
  (at minimum System Admin) — see Open questions for HQ Technical Reviewer.
- The "District administration" item is shown only to users authorized to
  administer at least one district; authorization and console behavior are
  defined in CSPS-XXX (District administration access).

**Edge cases & constraints**
- The former separate "Manage internal users" and "Manage public users" items
  are replaced by a single "Users" entry.
- The former "Manage districts & members" item is replaced by "District
  administration."
- The duplicate Districts link and the dead "Manage public users" link are
  removed.

---

**Open questions**
- [ ] Is the Admin menu visible to HQ Technical Reviewers, or restricted to
  System Admin only?
- [ ] Is the Catalogs menu visible to all Technical Reviewers, or only to those
  who curate catalog entries (District Lead Technical Reviewers and HQ)?
- [ ] What is the Help target — an in-app help page, a support email, or an
  external documentation URL?
- [ ] Should the primary nav be role-gated further (e.g. hide "My permits" for a
  role that never holds permits), or does every staff role see the same primary
  items?
