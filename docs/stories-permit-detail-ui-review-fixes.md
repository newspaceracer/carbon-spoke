# Permit detail — UI review fixes — Jira story

One story from the 2026-10-30 design-engineering review of the permit detail page,
which was checked across every status × viewer (System Admin as Responsible
analyst, District Lead Technical Reviewer as Supporting analyst, Researcher owner,
logged-out visitor), at desktop and phone width, in light and dark themes, and
against the demo, worst-case, and sparse permit data.

It amends [stories-permit-detail-page.md](stories-permit-detail-page.md) Stories
1, 5, 6, 10, and 11, and renames the review permit-roles everywhere.

---

## Story — Fix permit detail access, copy, and layout found in the UI review

**Story Title**
Fix permit detail tab access, wording, and phone layout

---

**Description**

As a System Admin, HQ Technical Reviewer, District Lead Technical Reviewer,
District Assistant Technical Reviewer, or Researcher,
I want the permit detail page to show only what my role may see, describe each
stage accurately, and use the same words for the same things on every tab,
So that internal review work can't leak to researchers, nobody reads a message
that contradicts the permit's status, and the page works on a phone and with a
keyboard.

The review found two blocking problems: tabs hidden from a viewer could still
be opened with the arrow keys, which let a Researcher open the staff-only
"Internal review" tab; and reviewers could open Draft permits (and District
reviewers Withdrawn ones), which the permissions matrix forbids. The rest are
copy that contradicted the status, competing words for the same concept, and
phone-width layout breaks.

This story also renames the two review permit-roles everywhere:
**Responsible Agent → Responsible analyst** and **Supporting Agent → Supporting
analyst** (abbreviations stay RA / SA).

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (all permit-roles), Researcher
(owner), logged-out visitor.

**Out of scope:** The review wizard (`final-letter.astro`) — its own review is a
separate story, including its Comments tab, which is hidden the same unsafe way
when `?comments=anchored` is on. Changes to what each tab contains or which
statuses show a tab (unchanged from Stories 1, 5, 6, 10, 11).

**Prototype:**
- [Permit detail — Overview](https://newspaceracer.github.io/carbon-spoke/permit/) — view as Researcher, then System Admin (live after the next push to master)
- [Permit detail — Application tab](https://newspaceracer.github.io/carbon-spoke/permit/#application) — view as System Admin; set the status from the Prototype panel (live after the next push to master)
- [Permit detail — Internal review tab](https://newspaceracer.github.io/carbon-spoke/permit/#internal) — view as District Lead Technical Reviewer (live after the next push to master)

---

**Acceptance Criteria**

**Access & permissions**
- A tab that is hidden from the viewer can't be reached by any means: clicking,
  the arrow keys on the tab strip, or a `#tab` / `?tab=` link. Arrow keys move
  only between the tabs the viewer can see.
- If a hidden tab's panel would be shown (for example, the tab is hidden while
  it's open), the page shows "Overview" instead.
- A Researcher (owner) on an "Under review" permit sees only "Overview" and
  "Application"; pressing → or ← on the tab strip cycles only between those two.
  "Internal review" content (tags, comments, analysis team) is never shown to them.
- No reviewer (System Admin, HQ Technical Reviewer, District Lead Technical
  Reviewer, District Assistant Technical Reviewer) can open a **Draft** permit.
  Opening one sends them to "My permits".
- District Lead and District Assistant Technical Reviewers can't open a
  **Withdrawn** permit; opening one sends them to "My permits". System Admin and
  HQ Technical Reviewer can still read it.
- These rules follow `docs/permissions-matrix.md` §5.1 and apply in every
  permit-role (RA, SA, Second Signer, Not assigned) and to single- and
  multi-district permits alike.

**UI & field details**

*Role names*
- "Responsible Agent" becomes **"Responsible analyst"** and "Supporting Agent"
  becomes **"Supporting analyst"** everywhere a person reads it: page copy,
  confirmation messages, Application history, the dev role switcher, email
  templates (see Notifications), `docs/permissions-matrix.md`,
  `docs/decisions-roles-permissions.md`, `docs/email-copy-notifications.md`, and
  the story-writing skill's vocabulary. Mid-sentence they're lowercase
  ("the responsible analyst's decision").
- Application history steps read "Responsible analyst review completed" and
  "Supporting analysts review completed".
- The Supporting review hint reads: "Record your supporting review. This is
  informational — it doesn't hold up the responsible analyst's decision."
- The Complete review / Reopen review confirmations read "Emailed the
  responsible analyst."

*One word per concept*
- **Dates:** the header label reads "Requested dates" before the permit is issued
  and "Authorized dates" from "Out for signature" on (was "Requested window" /
  "Authorized window"), matching the Overview tile and the Application tab.
- **Parks:** the Application tab's parks section and its contents-rail entry read
  "Requested parks" before the permit is issued and "Authorized parks" from "Out
  for signature" on (was always "Authorized parks"). The Overview's parks block
  uses the same title (was "Authorized parks and contacts").
- **Field visits:** the Application tab's Schedule list is titled "Field visits"
  (was "Field investigation occurrences"), matching the Overview's "Field visits"
  tile.
- **Person in direct charge of field work:** the Overview's People label reads
  "Person in direct charge of field work" (was "PICOF (in direct charge of field
  work)"), matching the Application tab.
- **Overview links** all start with "See": "See the schedule", "See specimens",
  "See the conditions", "See the full project description", "See the annual
  report" (was a mix of See / Read / Go to).
- **Document types** in the Uploaded files table display in sentence case
  ("Principal investigator resume", "Study area supporting documentation"). Form
  codes and acronyms keep their case ("Liability Waiver Addendum (DPR65B)" →
  "Liability waiver addendum (DPR65B)"). Stored values don't change.

*Status-accurate copy*
- **Final permit letter tab, no letter on file:** the tab still appears from "Out
  for signature" on. If no letter file is on record, it shows an info notice
  titled "No letter on file yet". Its subtitle depends on the status:
  - From "Out for signature" on: "The letter sent for signature isn't saved to
    this record."
  - Before that (other pages that host the letter): "It appears here once it's
    sent for signature."
- **Returned with a message only (no issues marked):**
  - The Researcher's "Changes requested" alert reads "The review team returned
    your application on {date}." followed by the reviewer's message in quotes.
    It never says "0 changes".
  - The staff alert reads "Returned on {date}. Waiting for them to resubmit."
  - The Researcher's Overview stage line reads "Next: make the changes the review
    team asked for, then resubmit your application." It says "below" only when
    the list of requested changes is shown.
- **Annual report tab before an upload:** staff see "Due {date} — 30 days after
  the permit ends. The researcher uploads it here." The empty list reads "No
  report uploaded yet" (was "No versions yet.").

*Schedule calendar*
- The Year / Month control is a content switcher (one selected segment), not two
  buttons with "Year" styled as a primary button.
- Each highlighted day (field visits, report dates) is reachable with Tab, reads
  its event and date to screen readers, opens its details with Enter or Space,
  and shows a visible focus outline. The hint reads "Select a highlighted day for
  its details."

*Phone and touch*
- At phone width the tab strip's › overflow arrow sits at the end of the strip,
  on the same line as the tabs (it was dropping onto its own line under them).
- The site header's product name never wraps. On phones it shows "CA State Parks"
  only; from tablet width up it shows "CA State Parks Research & Collection
  Permits" on one line.
- On touch screens, email, phone, and document links in the permit tabs have a
  tap area of at least 42px tall without changing the layout.
- On the Overview's Special conditions tile, a district's condition count stays
  on the same line as the end of its name ("North Coast Redwoods District · 3").

**Notifications**
- Only the role wording changes in these emails. Triggers, recipients, and the
  rest of the copy stay as they are. None are regulated, so the signature block
  is unchanged.
- **EM-A — Second-signer request (internal):**
  - Placeholder "Responsible Agent name" becomes "Responsible analyst name".
  - Body line becomes:
    `Responsible analyst: [Responsible analyst name] (first signature complete)`
- **EM-F — Responsible analyst assigned** (was "Responsible Agent assigned"):
  - Recipients: "The new Responsible analyst".
  - Subject: "You are the Responsible analyst for permit [Permit #]".
  - Body lines: "You are now the Responsible analyst for a research permit." and
    "As Responsible analyst you lead the review and are the first signer."
- **EM-G — Responsible analyst unassigned** (was "Responsible Agent
  unassigned"):
  - Recipients: "The outgoing Responsible analyst".
  - Subject: "You are no longer the Responsible analyst for permit [Permit #]".
  - Body: "…You are no longer the Responsible analyst." and "[You remain a
    Supporting analyst on this permit. / …]".
- **EM-I — Status change (permits you review):**
  - Recipients: "The permit's Responsible analyst and Supporting analysts".
  - Role line: `Your role:  [Responsible analyst / Supporting analyst]`
- **EM-J — Annual report uploaded:** recipients "The permit's Responsible
  analyst and Supporting analysts".
- **EM-L — Supporting review completed / reopened:** recipients "The permit's
  Responsible analyst".

**Edge cases & constraints**
- If a tab is hidden while it's open (for example, the status changes so the
  "Annual report" tab no longer applies), the page falls back to "Overview".
- The rename doesn't change any permission, eligibility rule, or permit-role
  behavior. It's wording only.
- Long content (60+ character titles, long emails and organization names, 25+
  tags, 12+ comments) wraps without horizontal scrolling. Checked against the
  worst-case data set.
- Text contrast meets WCAG AA on every tab in both light and dark themes.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Which tabs each viewer sees** (unchanged by this story; use it to check
  arrow-key navigation):

  | Status | Staff | Researcher (owner) | Logged out |
  |---|---|---|---|
  | Draft | no access (→ My permits) | Overview, Application | no access |
  | Waiting for review, Under review, Returned to submitter, Rejected | Overview, Application, Special conditions, Internal review | Overview, Application | no access |
  | Withdrawn | Admin / HQ: same as above; District: no access | Overview, Application | no access |
  | Out for signature, Waiting for annual report | + Final permit letter | Overview, Application, Special conditions, Final permit letter | no access |
  | Active, Expired | + Final permit letter, Annual report | + Annual report | Overview, Application |

- **Test 1 — Arrow keys can't open hidden tabs:** As Researcher on an "Under
  review" permit, click "Application", press → five times. Confirm only
  "Overview" and "Application" are ever selected, and no tags, comments, or
  analysis team appear.
- **Test 2 — Draft and Withdrawn access:** As System Admin, then District Lead
  Technical Reviewer, open a Draft permit → both land on "My permits". As
  District Lead Technical Reviewer open a Withdrawn permit → "My permits". As
  System Admin open the Withdrawn permit → it opens.
- **Test 3 — Missing letter:** Set a permit to "Active" with no letter file. Open
  "Final permit letter" → the notice says the sent letter isn't saved to this
  record.
- **Test 4 — Return with message only:** Return a permit with a message and no
  marked issues. As the Researcher, confirm the alert and Overview never say
  "0 changes" or "below".
- **Test 5 — Status-driven labels:** On "Under review" confirm the header says
  "Requested dates" and the Application tab says "Requested parks". Move to
  "Out for signature" → both switch to "Authorized".
- **Test 6 — Calendar keyboard:** On the Application tab's Schedule, Tab to a
  highlighted day, press Enter → its details appear. Switch Year ↔ Month.
- **Test 7 — Phone:** At 390px wide, confirm the tab strip's › arrow is inline,
  the header reads "CA State Parks" on one line, and nothing scrolls sideways.
- **Test 8 — Rename sweep:** Search the UI, the six emails above, and the
  listed docs for "Agent" → no "Responsible Agent" or "Supporting Agent"
  remains.
