# Permit Overview tab — restructure & always-on collaboration

Stories for the reworked **Overview** tab of the permit detail page: a tighter
section layout, an application that is browsable before review starts, and
comment/tag collaboration that is always available to reviewers who can see it.

Related docs: the review-start transition is defined in
[`stories-roles-permissions.md`](stories-roles-permissions.md) and
[`permissions-matrix.md`](permissions-matrix.md); the comment @-mention behavior
is defined in [`stories-comment-mentions.md`](stories-comment-mentions.md); toast
conventions are the shared success-toast pattern.

---

## Story 1 — Reorganize the Overview tab and pair Analysis team with Application history

**Story Title**
Reorganize the permit Overview tab into tighter, tabbed sections

---

**Description**

As an internal reviewer opening a permit,
I want the Overview tab to lead with the sections I act on and pair the analysis
roster with the application timeline,
So that I can orient quickly without scrolling past a redundant summary.

The redundant "Application summary" block (a copy of the project purpose already
shown on Project information) is removed. In the right-hand rail, **Analysis team**
and **Application history** become two tabs of a single tile, with **Analysis team**
shown by default.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer. Researcher (owner) and public
viewers see the Overview tab without the internal-only sections (see Story 3).

**Out of scope:** The content of the Analysis team roster and Application history
themselves — unchanged here. The Comments and Tags behavior — see Stories 3 and 4.

---

**Acceptance Criteria**

**Happy path**
- The Overview tab no longer renders an "Application summary" section.
- The Overview main column shows, in order: Tags, Comments (internal-only), and the
  right-hand rail tile.
- The rail tile presents two tabs — "Analysis team" and "Application history".
- "Analysis team" is the selected tab when the page loads.
- Selecting "Application history" shows the phased lifecycle timeline; selecting
  "Analysis team" shows the reviewer roster.

**UI & field details**
- The tab labels read exactly "Analysis team" and "Application history".
- The Analysis team tab retains its "Internal only" marker and its "Add to team"
  action.

**Edge cases & constraints**
- For a Researcher (owner) or public viewer, the Analysis team tab and panel are
  removed and the rail defaults to "Application history" (Analysis team is internal
  only) — consistent with Story 3's internal-only hiding.

---

**Open questions**
- [ ] Should the rail tile remember the reviewer's last-selected tab across visits,
  or always default to "Analysis team"?

---

## Story 2 — Make the application browsable before review starts, with an inline Start-review prompt

**Story Title**
Allow reviewers to browse a permit before starting review

---

**Description**

As an internal reviewer assigned to a submitted permit,
I want to read the full application before I formally start my review,
So that I can assess scope before the system records my review as begun.

Previously the entire application body (tab strip and all panels) was sealed behind
a full-page "Start the review to see the application" gate until review began. That
seal is removed: all six tabs are accessible while the permit is **Waiting for
review**. In its place, an inline "Start your review" prompt appears on the Overview
tab, above Tags, for the reviewer who is able to start.

**Roles affected:** System Admin and the permit's **Responsible Agent** (who can
start review); other internal reviewers (who can browse but not start). Researcher
(owner) and public viewers never see the prompt.

**Out of scope:** What "Start review" does after it is clicked — recording who/when,
the **Waiting for review → Under review** transition, and entering the review wizard
are existing behavior defined in [`stories-roles-permissions.md`](stories-roles-permissions.md).

---

**Acceptance Criteria**

**Access & permissions**
- While a permit is **Waiting for review**, every internal reviewer with access to
  the permit can open all Overview, Project information, Study areas, Special
  conditions, Data collection, and Additional documentation tabs.
- The "Start your review" prompt is shown only to a viewer eligible to start review
  (the permit's **Responsible Agent**, or a **System Admin**); other internal
  reviewers can browse but do not see the prompt.
- The prompt is never shown to a Researcher (owner) or public viewer.

**Happy path**
- On the Overview tab, the "Start your review" prompt renders above the Tags section
  while the permit is **Waiting for review** and review has not started.
- The prompt's action reuses the "Start review" control (same behavior as the
  header's "Start review").

**State & status transitions**
- Once review has started (or the permit is past **Waiting for review**), the prompt
  is hidden and a quiet confirmation — "You started reviewing this application on
  {date}." — is shown instead.

**UI & field details**
- The prompt title reads exactly "Start your review"; its action button reads exactly
  "Start review".

**Edge cases & constraints**
- The prompt renders without a flash for a permit already **Under review** (its hidden
  state is resolved before first paint).

---

**Open questions**
- [ ] This reverses the prior "record start-time on first access" guarantee (the app
  is now readable before starting). Is recording start time strictly on the explicit
  "Start review" click acceptable to the program?

---

## Story 3 — Always allow reviewers to add comments and apply/remove tags, with success toasts

**Story Title**
Always allow reviewers to comment and tag, and confirm each change

---

**Description**

As an internal reviewer,
I want to add comments and apply or remove handling tags at any point I can see
those sections,
So that I can capture triage notes and coordination labels even before I formally
start the review.

Previously the Comments composer and the Tags picker were read-only while a permit
was **Waiting for review**. Both are now editable in every status where the sections
are visible. Applying or removing a tag now fires a success toast.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer. Researcher (owner) and public
viewers do not see Tags or Comments (internal only) — unchanged.

**Out of scope:** The @-mention behavior and "Comment posted" confirmation of the
comment composer — see Story 4. The curated tag vocabulary itself — unchanged.

---

**Acceptance Criteria**

**Access & permissions**
- Any internal reviewer who can see the Tags section can apply and remove tags,
  regardless of permit status — including **Waiting for review**.
- Any internal reviewer who can see the Comments section can post a comment,
  regardless of permit status — including **Waiting for review**.
- Tags and Comments remain hidden entirely for a Researcher (owner) or public
  viewer; this story does not expose them.

**Happy path**
- Applying a tag from the picker shows a success toast titled "Tag added" naming the
  tag.
- Removing a tag — by unchecking it in the picker or dismissing its chip — shows a
  success toast titled "Tag removed" naming the tag.
- Applied tags render as dismissible chips (not read-only) whenever tags are editable.

**Edge cases & constraints**
- Loading the page and rendering already-applied tags does not fire a toast — only a
  user-initiated add or remove does.
- Toasts follow the shared success-toast pattern (top-right, `role="status"`,
  auto-dismiss).

---

**Open questions**
- [ ] Should a comment or tag added while a permit is **Waiting for review** be
  attributed to the acting reviewer even though they have not yet started review, or
  is authorship expected only after **Under review**?

---

## Story 4 — Bring the Overview comment thread to parity with the review wizard

**Story Title**
Give the Overview comment thread the same @-mention behavior as the wizard

---

**Description**

As an internal reviewer commenting on a permit's Overview tab,
I want the same commenting experience as the review wizard,
So that a mention and its confirmation work identically wherever I comment on the
same shared thread.

The Overview comment composer and the review-wizard composer read and write the same
permit comment thread. The Overview composer previously lacked the wizard's
@-mention typeahead, mention rendering, and post confirmation; those are now shared
so both behave identically.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (as comment authors).

**Out of scope:** The email that notifies a mentioned user — see
[`stories-comment-mentions.md`](stories-comment-mentions.md) Story 2. Comments on
researcher-facing surfaces — the thread is internal only.

---

**Acceptance Criteria**

**Happy path**
- Typing "@" in the Overview comment composer opens a typeahead of existing users;
  choosing one inserts an "@Name" mention (identical to the wizard).
- On posting, mentions render as highlighted tokens in the thread.
- Posting shows a "Comment posted" toast; when the comment mentions users, the toast
  subtitle names who was notified.
- Pressing ⌘/Ctrl+Enter in the composer posts the comment.

**State & status transitions**
- A comment posted on the Overview tab appears in the review wizard's comment thread
  and vice versa (one shared thread), including its mention tokens.

**UI & field details**
- The composer placeholder advertises the "@" mention and the ⌘/Ctrl+Enter shortcut.
- The Comments composer and thread are capped to a readable measure so comment lines
  do not stretch the full column width.

**Edge cases & constraints**
- Only mentions that survive in the posted text are recorded; deleting an inserted
  "@Name" before posting drops that mention.
- Mention tokens are built from DOM text nodes (never raw HTML), so comment text
  cannot inject markup.

---

**Open questions**
- [ ] Should mention notifications fire when the mention originates from the Overview
  composer as well as the wizard, or only from the wizard? (Notification copy is
  tracked in [`stories-comment-mentions.md`](stories-comment-mentions.md).)
