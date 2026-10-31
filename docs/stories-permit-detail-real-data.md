# Permit detail page — holding up to real data

One story for the fixes found by stress-testing the **permit detail page** (`/permit`)
with realistic worst-case and minimal permit records (2026-10-30). The demo record
was chosen, without anyone noticing, to look good: one-year window, names that fit
on a line, a handful of files. Real applications don't. Every fix below was
reproduced in the prototype and verified at 320, 768, 1100, 1440 and 1920 px, at
200% browser zoom, and in dark mode.

Decisions made in that session and reflected here:

- **Long file names shorten from the middle**, not the end — file names differ at
  the end (version, extension), so end-truncation makes them look identical.
- **A busy schedule groups its visits** by month, or by quarter on windows longer
  than two years, once there are more than 15.
- **Project title is capped at 200 characters** on the application form, rather
  than clamped in the header.
- **The page works at phone width (320 px)** with no sideways scroll.
- **Research team cards are all the same width**, at most 3 across, with the
  Organization alone on the first row.

Related: [`stories-permit-detail-page.md`](stories-permit-detail-page.md) (the page
these fixes apply to), [`stories-permit-application-form.md`](stories-permit-application-form.md)
(the title field), [`stories-schedule-calendar.md`](stories-schedule-calendar.md).

| # | Story |
|---|---|
| 1 | Make the permit detail page hold up to long, large and minimal permit records |

---

## Story 1 — Make the permit detail page hold up to long, large and minimal permit records

**Story Title**
Make the permit detail page hold up to real permit data

---

**Description**

As a District Lead Technical Reviewer reading a permit,
I want every fact on the permit detail page to stay correct and readable whatever
the application contains — a 5-year window, 24 participants, 22 files, a one-day
survey with nothing optional filled in,
So that I never misread a date or count, and never lose an action or a piece of
contact information off the edge of a card or the screen.

The fixes span the permit header, the Overview tab, the Application tab, the
Internal review tab, the review wizard's comments, and the application form's
project title. None of them change workflow, permissions or statuses; they change
how existing data is computed, formatted and laid out.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (every staff view of the page,
including the Internal review tab), Researcher (owner view of the page, and the
application form's project title), the public (public view of issued permits).

**Out of scope:** Right-to-left layouts — the system is English-only and has no
right-to-left support; right-to-left names (e.g. Arabic) inside the normal layout
are covered and display correctly. The prototype-only test-data records and the
Prototype controls panel — dev tooling, not product.

**Prototype:**
- [Permit detail — Overview](https://newspaceracer.github.io/carbon-spoke/permit/#overview) — view as System Admin (live after the next push to master)
- [Permit detail — Application](https://newspaceracer.github.io/carbon-spoke/permit/#application) — view as System Admin (live after the next push to master)
- [Permit detail — Internal review](https://newspaceracer.github.io/carbon-spoke/permit/#internal) — view as District Lead Technical Reviewer (live after the next push to master)
- [Application form — Project information](https://newspaceracer.github.io/carbon-spoke/apply/) — view as Researcher (live after the next push to master)

---

**Acceptance Criteria**

**Access & permissions**
- Every fix applies to every viewer who can already see the affected section; no
  section's visibility changes. The Internal review tab stays staff-only.

**UI & field details — permit header**
- **Submitted** shows the date the application was submitted (the "Application
  submitted" step in the application history), not a fixed date. If there is no
  submission date, it shows "—".
- **Requested window** shows a single date when the window starts and ends on the
  same day (e.g. "Sep 12, 2026"), and "start – end" otherwise.
- Every classification and compliance tag shows its full label on hover when the
  tag is too narrow to show it (e.g. "Cultural & Archaeological Resources").

**UI & field details — Overview tab**
- **Requested dates** follows the same single-date rule as Requested window.
- **Requested specimens** is the sum of every specimen quantity, formatted with a
  thousands separator (e.g. "3,262"). A quantity typed with a comma ("1,284")
  counts; a quantity that is not a number (e.g. "~50") adds nothing to the total
  and never blanks it.
- **Research team** sub-label names who the count includes: "PI, PICOF and
  24 participants" when the PICOF is a different person from the PI; "PI and
  24 participants" when they are the same person; "PI and PICOF" when there are
  no participants; "PI only" when there are no participants and the PI is also
  the PICOF. "1 participant" is singular.
- The **Schedule** card keeps its own height; a taller **People** card beside it
  does not stretch it.
- On the Schedule track, a one-day window shows one date label, not two
  overlapping labels.
- When there are more than 15 field visits, the track shows one marker per month
  that has visits — or one per quarter when the window is longer than two years —
  instead of one per visit. The legend reads "Past month with visits", "Month with
  visits", "Month of the next visit" (or "Past quarter with visits", "Quarter with
  visits", "Quarter of the next visit"). With 15 or fewer visits the legend reads
  "Past field visit", "Field visit", "Next field visit".

**UI & field details — Application tab**
- **Research team** cards are all the same width, at most 3 per row, wrapping to
  2 and then 1 as the screen narrows. The **Organization** card sits alone on the
  first row at the same width as the others; the people (Principal investigator,
  Person in direct charge of field work, Submitter) start on the next row. A card
  alone on its row keeps the same width and does not stretch.
- On every contact card, a long email address wraps inside the card and its
  copy-email button stays beside it, inside the card.
- **Field investigation occurrences** shows the first 10 dates. When there are
  more, a "Show all N dates" button (e.g. "Show all 41 dates") reveals the rest and
  then hides itself.
- **Uploaded files**: a file name longer than 48 characters is shortened from the
  middle, keeping its start and its end (version and extension), e.g. "Snowy Plover
  Nest Exclosure Stu…ed by IACUC].pdf". The full name shows on hover and is read
  in full by screen readers. **Size** and **Date** never break across lines, and
  the **Actions** column (View, Download) is never clipped.
- **Specimens**: whole-number quantities are formatted with a thousands separator
  ("1000" → "1,000"); other entries show as typed. An empty Portion or Condition
  shows "—", matching other empty table cells.

**UI & field details — comments (Internal review tab and review wizard)**
- A comment keeps the line breaks its author typed.
- A long unbroken string in a comment, such as a pasted URL, wraps inside the
  comment instead of widening the page.

**UI & field details — project title limit**
- The **Project title (required)** field on the application form accepts at most
  200 characters and shows a character counter.
- The **Project title** field in the review wizard's record editor has the same
  200-character limit and counter, so staff cannot save a longer title than a
  Researcher can submit.

**Edge cases & constraints**
- At 320 px wide, no tab of the page (Overview, Application, Special conditions,
  Internal review) scrolls sideways: the header keeps a 16px side margin, the
  tab bar scrolls within itself, fact tiles fall to one full-width column, the
  calendar's Jump to today / Prev / Next controls wrap, and a long URL in a special
  condition wraps.
- A permit with the minimum content (one district, one park, one specimen, no
  participants, no comments, no tags, no compliance flags, a one-day window)
  renders every section without blank figures, overlapping labels or "NaN".
- At 200% browser zoom, no tab scrolls sideways. A table wider than the screen
  (e.g. Uploaded files) scrolls sideways within its own box, so its Actions column
  stays reachable.
- In dark mode, every element this story adds or changes (schedule markers and
  legend, research team label, formatted totals and quantities, tag tooltips,
  "Show all N dates", comment text) uses the theme's colors and stays legible.

This story is larger than the house limit of 12 AC items. It is kept as one
umbrella story by request; if it needs splitting for delivery, the natural seams
are header + Overview, Application tab, comments + phone width, and the form's
title limit.

---

**Testing notes**

- **Test data:** The prototype ships three dev-only test records (normal,
  worst-case, sparse). In a QA environment, create equivalent permits:
  - **Worst case:** 5-year window; about 40 field visits; 24 participants; a PICOF
    who is not the PI; 22 files with long names; a specimen quantity typed as
    "1,284"; a comment with line breaks; a comment with a long URL.
  - **Sparse:** one-day window; one field visit; no participants; one specimen with
    an empty Condition.
- **Test 1 — Widths:** Open each tab at 320, 768, 1440 and 1920 px. Confirm there
  is no sideways scroll, and every copy-email button and every file action button
  stays inside its card or table.
- **Test 2 — Counts and dates:** On the worst-case permit, confirm Requested
  specimens is a formatted number, Research team reads "PI, PICOF and
  24 participants", and Submitted matches the application history. On the sparse
  permit, confirm Requested dates and Requested window show one date and the
  Schedule track shows one label.
- **Test 3 — Grouped schedule:** On the worst-case permit, confirm the track shows
  quarter markers and the quarter legend. Reduce the visits to 15 or fewer and
  confirm per-visit markers and the default legend return.
- **Test 4 — Zoom and dark mode:** At 200% browser zoom, repeat Test 1. Switch
  to dark mode (Profile → theme) and repeat Tests 1 and 2.
- **Test 5 — Title limit:** In the application form, paste a 230-character title
  and confirm only 200 characters are accepted and the counter reads 200/200.
  Repeat in the review wizard: edit Project title and confirm the same limit.

---

**Open questions**
None — story appears complete.
