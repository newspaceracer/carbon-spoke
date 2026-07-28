# Site Footer — Jira Stories

One story: a site-wide footer carrying the AGPL open-source license notice, ESA/California State Parks attribution, and the standard California state web-template resource links.

---

## Story 1 — Site-wide footer with AGPL license notice and state links

**Story Title**
Add site-wide footer with AGPL license notice and state links

---

**Description**

As any user of the SCP Web App,
I want a footer on every page that identifies the system, its owner, and its open-source license,
So that the app meets its AGPL obligations and matches California state web-template expectations.

The SCP Web App source is released under the GNU Affero General Public License, Version 3 (AGPL). ESA developed the system for California State Parks and holds the copyright. Because the app is served over a network, AGPL §13 requires that users be *offered* the corresponding source — so the footer must link to the public source repository, not merely have it exist. The footer also carries the standard California state web-template resource links.

**Roles affected:** All users — logged out (anon), Researcher, HQ Technical Reviewer, District Lead Technical Reviewer, District Assistant Technical Reviewer, System Admin, and Pending user. The footer renders identically for every role.

**Out of scope:** Adding a top-level `LICENSE` file with the full AGPL text to the repository — tracked separately. Dedicated Privacy / Accessibility / Conditions of Use pages hosted by the app itself (this story links to existing statewide pages).

---

**Acceptance Criteria**

**Access & permissions**
- The footer renders on every page that uses the shared app shell, for every user role, including logged-out users.
- The footer content and links are identical across all roles — no role-based variation.

**Happy path**
- Every page displays a footer at the bottom of the content, separated by a top border.
- The footer displays the notice: *"The SCP Web App is an official California State Parks system, developed by Environmental Science Associates (ESA). This program is free software; you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation. Source code is available on GitHub."*
- "GNU Affero General Public License" is a link to `https://www.gnu.org/licenses/agpl-3.0.en.html`.
- "GitHub" is a link to the public source repository.
- The footer displays a state-resources link row: California State Parks, Conditions of Use, Privacy Policy, Accessibility, Contact.
- The footer displays a copyright line: *"Copyright © [current year] Environmental Science Associates (ESA). Code last compiled [build timestamp]."*

**UI & field details**
- All footer links are Carbon `cds-link` components.
- External links (license, GitHub, and every state-resource link) open in a new browser tab.
- Footer text and links render at a single consistent type size (Carbon body-compact-01, 14px); inline links are the same size as the surrounding sentence.
- The copyright year is the current year; the compiled timestamp reflects the build time of the deployed bundle, not the time of the user's visit.

**Edge cases & constraints**
- The state-resources link row wraps cleanly on narrow (mobile) viewports without horizontal overflow.
- The footer does not overlap or crowd page content; it appears after all page content with clear separation.

---

**Testing notes**

- **Test 1 — Presence across roles:** Sign in as each role (and while logged out) and confirm the footer renders on a representative page with identical content.
- **Test 2 — Link targets:** Click each footer link; confirm it opens the correct destination in a new tab.
- **Test 3 — Type consistency:** Inspect the notice paragraph and confirm the inline "GNU Affero General Public License" and "GitHub" links render at the same size as the surrounding text (no smaller inline links).
- **Test 4 — Responsive:** At a mobile width, confirm the state-resources links wrap without horizontal scrolling.

---

**Open questions**
- [ ] What is the canonical public **source repository URL** for the deployed app? (Currently pointing at `github.com/newspaceracer/carbon-spoke` — a placeholder.) AGPL §13 requires the linked repo to contain the *corresponding source of the running version*, so this must be the real, kept-in-sync public repo.
- [ ] Are the **statutory link URLs** correct — should Privacy Policy, Accessibility, and Conditions of Use point to the shared statewide `ca.gov` pages, or to Parks-specific pages? And is the Contact target (`parks.ca.gov/contactus`) correct?
- [ ] Has **Legal / ESA** approved the exact wording "official California State Parks system, developed by Environmental Science Associates (ESA)" and the ESA copyright attribution?
- [ ] Should a top-level `LICENSE` file (full AGPL-3.0 text) be added to the repo as part of this work, or tracked as a separate ticket?
