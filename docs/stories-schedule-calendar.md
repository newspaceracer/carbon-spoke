# Permit schedule calendar

A calendar on the permit detail page that shows the permit's key dates at a
glance: the permit period, each field-investigation session, the two
annual-report milestones, and today. It lives in a new **Schedule** section on
the **Project information** tab, above the existing field-date list.

Related docs: the Project information tab layout is described in
[`stories-overview-tab-restructure.md`](stories-overview-tab-restructure.md);
success/action toasts follow the shared success-toast pattern.

---

## Story 1 — Show the permit schedule as an at-a-glance calendar

**Story Title**
Show the permit schedule as a calendar on Project information

---

**Description**

As an internal reviewer (and as the Researcher who owns the permit),
I want to see the permit's key dates on a calendar,
So that I can grasp the whole schedule at a glance instead of reading dates from a list.

The calendar plots, from a single structured source, the requested **permit
period**, every **field-investigation** session, the annual-report **tentative
completion** date, the annual-report **required-by** date, and **today**. It
opens on a year-at-a-glance view spanning every month the schedule touches, with
a toggle to a single-month view. It is read-only — a view of dates entered
elsewhere, not a place to edit them.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (owner) — anywhere the
Project information tab is viewable.

**Out of scope:** Editing, adding, moving, or removing any date from the calendar
— all dates are read-only here and originate from the application and review
workflow. The "Field investigation occurrences" list, which remains below the
calendar unchanged. The annual-report due date stated in the Special conditions.

---

**Acceptance Criteria**

**Access & permissions**
- The Schedule calendar appears in the "Schedule" section of the "Project information" tab for any user who can view that tab.
- The calendar is read-only: no user can create, move, resize, or delete a date on it.

**Happy path (Year view)**
- The calendar loads in "Year" view, showing at once every month the schedule spans — from the permit-period start month through the annual-report required-by month.
- The permit period renders as shading across its full span; each field-investigation session, the tentative-completion date, the required-by date, and today each render as a colored day cell.
- A field-investigation session that spans multiple days marks every day in its range.
- A legend labels each color exactly: "Field investigation", "Permit period", "Report — tentative completion", "Report — required by", "Today".

**View toggle & navigation**
- A "Year" / "Month" toggle switches between the multi-month year view and a single-month view; "Year" is selected on load, and the selected view is visually indicated.
- "‹ Prev" and "Next ›" move the view backward and forward; "Jump to today" returns to the anchored current view.
- A heading shows the current view's date range (e.g. "July 2026 – September 2027" in Year view, "July 2026" in Month view).

**Selecting a date**
- Selecting a marked day shows a toast naming that day's item and its exact date(s) — e.g. "Field investigation" with "Aug 13, 2026 – Aug 15, 2026".
- Selecting a day inside the permit-period shading that has no milestone does nothing.

**UI & field details**
- The "Project details" section shows the annual-report dates as an "Annual report" fact with two entries labeled "Tentative completion" and "Required by".
- The "Field investigation occurrences" list remains below the calendar as a textual reference.

**Edge cases & constraints**
- The calendar renders correctly when the Project information tab is opened after initial page load (it is not left blank or broken by having started hidden).
- In Year view, marked days are always shown — a day is never collapsed into a "+N more" summary.

---

**Implementation notes**

- The calendar is built on **FullCalendar** — a sanctioned third-party rendering library, on the same footing as AG Grid and `@carbon/charts` — themed to Carbon through `--cds-*` tokens. Year view is a 15-month `multiMonth` view; Month view is `dayGridMonth`.
- Milestones render as background-filled day cells (not event chips) specifically so the compact year view never collapses them into "+N more".
- All dates are driven by structured ISO values in the permit data (requested window, field-investigation sessions, and the two annual-report dates) — no display-string parsing.

---

**Testing notes**

- **Test 1 — Year at a glance:** Open a permit → Project information → Schedule. Confirm Year view shows every month from the permit start month through the required-by month, with the permit period shaded and each field date, both report dates, and today marked.
- **Test 2 — Select for detail:** Click a field-investigation day and confirm the toast names it with the correct date range. Click the tentative-completion and required-by days and confirm each toast shows the right label and date.
- **Test 3 — Views & navigation:** Toggle to "Month"; confirm one month shows with the same markers and the active toggle updates. Use "‹ Prev", "Next ›", and "Jump to today".
- **Test 4 — Open-after-load render:** Load the permit on a different tab first, then switch to Project information; confirm the calendar renders fully with no blank or misaligned grid.

---

**Open questions**
- [ ] The "Today" marker uses a fixed demo date in the prototype. In production, should it track the real current date?
- [ ] Should the permit period reflect the requested window while the permit is under review, and switch to the approved/active window once the permit is issued (Active)?
- [ ] If field-investigation or annual-report dates change during review, should the calendar update to match the new values automatically?
- [ ] Should the annual-report "Required by" date stay in sync with the due date stated in Special conditions (they currently reference the same date)?
