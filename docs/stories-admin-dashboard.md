# Administrator Dashboard — Jira Stories

Six stories, in build order. Stories 3–5 depend on the status-transition history (Story 2).

- **Story 1** — Volume, intake & distribution metrics (Tier 1)
- **Story 2** — Record a status-transition history for every permit (data foundation)
- **Story 3** — Processing & timing metrics (Tier 2)
- **Story 4** — Trends over time (monthly intake, decisions, delinquency)
- **Story 5** — Review workload & health (open-backlog aging, inquiry rounds)
- **Story 6** — Composition & outcomes (permit type, approval by category)

---

## Story 1 — Administrator dashboard: volume, intake & distribution metrics (Tier 1)

**Story Title**
Provide a System Admin dashboard of permit program metrics

---

**Description**

As a System Admin,
I want a dashboard of program metrics across the permit register that I can scope by date, district, and resource category,
So that I can monitor intake, current workload, and how permits are distributed without pulling a manual report.

Every metric is a live count that reflects the active filter and links through to the underlying list of records it represents. This story covers volume, on-hand, and distribution counts only (Tier 1) — metrics computed from data the register already holds.

**Roles affected:** System Admin, Researcher, Public User (the latter two are denied access)

**Out of scope:** Processing-time and workflow-timing metrics — see CSPS-XXX (Story 3). Recording the status-transition history those metrics depend on — see CSPS-XXX (Story 2).

---

**Acceptance Criteria**

**Access & permissions**
- Only a System Admin can open the Administrator dashboard.
- A Researcher and a Public User cannot reach the dashboard and are not shown a link to it.

**Happy path — volume & on-hand metrics**
- The dashboard shows the number of applications received within the selected period, counted by Date submitted, with Draft applications excluded.
- The dashboard shows applications approved (record type Active Permit) versus denied, counted by Status.
- The dashboard shows the number of permits currently on hand / in process, counted by Record Type and Status (Submitted, In Review, Back to Researcher, Resubmitted).
- The dashboard shows the number of permits pending annual report requirements, by the Annual Report Submitted flag (consistent with CSPS-19).
- The dashboard shows counts by District, by Resource Category, and by Park Unit.
- The dashboard shows the number of applicant entities and a list of them, counted by Organization.
- The dashboard shows the number of permits per year over the past five years, counted by Permit start date.

**Filtering**
- The dashboard provides one shared filter bar that scopes every metric by, at minimum: date range, District, and Resource Category.
- Every metric, chart, and list updates to reflect the active filter without a page reload.
- The view supports comparing the selected timeframe against the immediately preceding equal-length period.

**Click-through**
- Each metric count links to the underlying filtered list of applications/permits it represents, rather than being a static number.
- The click-through list reflects the same filter state active on the dashboard.

**UI & field details**
- Metric labels use the system's existing terminology for Status, District, Resource Category, and Record Type — not paraphrased report-question wording.
- Ranked distribution bar charts (by District, Resource Category, Park Unit, and per year) use a single colour — the bar length carries the value and the axis label carries identity — so the charts read as data, not decoration.
- In the status breakdown chart, each Status is shown with both a distinct colour and a text label, so a status is never conveyed by colour alone.

**Edge cases & constraints**
- Draft applications are excluded from every intake and volume count unless a metric explicitly includes them.
- A metric whose supporting data column does not exist (e.g. Park Unit) is either omitted or clearly marked as pending its data dependency — never shown as a zero or an incorrect value.
- When a filter combination matches no records, the dashboard shows an empty state rather than an error.

---

**Testing notes**

- **Test 1 — Counts match source:** For a known data set, confirm each metric count matches the equivalent filtered list of records in the register.
- **Test 2 — Draft exclusion:** Create Draft applications and confirm they are excluded from every intake and volume count.
- **Test 3 — Filter propagation:** Apply a District + date-range filter and confirm every metric and every click-through list reflects it.
- **Test 4 — Permissions:** Confirm a Researcher and a non-admin internal user cannot reach the dashboard.
- **Test 5 — Empty state:** Apply a filter combination with no matching records and confirm a graceful empty state, not an error.

---

**Open questions**
- [ ] Beyond System Admin, should any internal role (Technical Reviewer, other CA State Parks Staff) see the dashboard, in full or scoped to their own district?
- [ ] Does a Park Unit data column exist on the record to support the "by Park Unit" metric, or is that metric pending a data dependency?
- [ ] Is there a Principal Investigator (PI) name and institution column to support filtering by investigator/PI and institution, or are those deferred?
- [ ] "Denied" is not one of the six standard statuses — what is the exact status name for a denied/rejected application?
- [ ] What is the default date range when the dashboard first loads — all time, a fixed window (e.g. last 12 months), or the current fiscal year?
- [ ] This story carries more than 12 AC items. Consider splitting the shared filter bar + click-through behavior into its own ticket from the metric definitions.

---

## Story 2 — Record a status-transition history for every permit

**Story Title**
Record a status-transition history for every permit application

---

**Description**

As the system,
I want to write an audit entry every time an application changes status,
So that processing-time and workflow analytics can be computed from a reliable timeline rather than reconstructed after the fact.

This is the data foundation for the Administrator dashboard's processing-time metrics (CSPS-XXX). Each entry captures which status the record left, which it entered, when, and who caused the change.

**Roles affected:** System (writer), System Admin (consumer of the resulting data), Researcher and Technical Reviewer (their actions generate entries)

**Out of scope:** Displaying the history on the permit detail page or anywhere in the UI — this story records the data only. Backfilling history for permits that predate this feature — flagged as an open question below.

---

**Acceptance Criteria**

**Happy path**
- Whenever an application's Status changes, the system writes one history entry recording: the application identifier, the status left (from), the status entered (to), a timestamp, and the actor who caused the change.
- The system writes an entry for every transition across every status: Draft → Submitted, Submitted → In Review, In Review → Back to Researcher, Back to Researcher → Resubmitted, Resubmitted → In Review, and In Review → Active Permit.
- The first entry for a record captures its creation (no "from" status).

**State & status transitions**
- When an application is approved and its record type changes from Application to Permit (status Active Permit), the system records that transition, and its timestamp is the record's approval/signed date.

**Edge cases & constraints**
- History entries are append-only and immutable — no role, including System Admin, can edit or delete a recorded entry.
- The actor on a system-initiated transition is recorded as the System; the actor on a researcher- or reviewer-initiated transition is that user.
- An application that moves back and forth (In Review → Back to Researcher → Resubmitted → In Review) accumulates one entry per transition, preserving every round trip.

---

**Testing notes**

- **Test 1 — Full lifecycle capture:** Take one application from Draft through to Active Permit, exercising a Back to Researcher round trip. Confirm one entry exists per transition, in order, each with the correct from/to/timestamp/actor.
- **Test 2 — Approval timestamp:** Approve an application and confirm the In Review → Active Permit entry's timestamp equals the record's approval/signed date and that the record type is now Permit.
- **Test 3 — Immutability:** Confirm no UI or API path allows a user to alter or remove an existing history entry.

---

**Open questions**
- [ ] Should the history for permits created before this feature be backfilled, and if so from what source? Per-stage and processing-window metrics are only meaningful for records with a complete history.
- [ ] The standard status list does not include a denied/rejected or withdrawn status — do those transitions exist, and should they be recorded here?
- [ ] Is the "approved/signed date" the moment the status becomes Active Permit, or a separate signature event that may occur later?
- [ ] Is there a retention policy for history entries, or are they kept for the life of the record?

---

## Story 3 — Show processing & timing metrics on the Administrator dashboard (Tier 2)

**Story Title**
Show permit processing-time metrics on the Administrator dashboard

---

**Description**

As a System Admin,
I want processing-time and workflow-timing metrics computed from the status-transition history,
So that I can measure throughput, spot bottlenecks by stage and reviewer, and track how many permits exceed the target processing window.

These metrics depend on the status-transition history (CSPS-XXX) and appear as a "Processing & timing" section within the existing Administrator dashboard, scoped by the same shared filter.

**Roles affected:** System Admin

**Out of scope:** Recording the status-transition history — see CSPS-XXX (Story 2). Volume, on-hand, and distribution metrics — see CSPS-XXX (Story 1).

---

**Acceptance Criteria**

**Happy path**
- The dashboard shows the total processing time for a permit as the approved/signed date (the transition into Active Permit) minus the Date submitted, in days.
- The dashboard shows aggregate processing time as both a median and an average, with the median presented as the headline figure.
- The dashboard shows processing time grouped by assigned Technical Reviewer.
- The dashboard shows processing time grouped by Resource Category.
- The dashboard shows the time spent in each workflow stage (In Review, Back to Researcher), derived from per-status durations in the history.
- The dashboard shows the count and percentage of permits whose processing time exceeded the target window.
- The dashboard shows the count and percentage of applications that required at least one return to the researcher (a Back to Researcher transition).

**State & status transitions**
- Applications still in process (not yet at Active Permit) have no completed processing time and are excluded from completed-time figures, with the excluded count clearly stated.

**UI & field details**
- The processing-time-by-category and processing-time-by-reviewer charts each display a reference line at the target processing window, labeled with the threshold (e.g. "90-day target"), so groups whose median approaches or exceeds the target are visible at a glance.
- Ranked processing-time bar charts use a single colour; the axis label carries identity (consistent with the distribution charts in CSPS-XXX / Story 1).

**Filtering**
- Every processing-time metric respects the dashboard's shared date / District / Resource Category filter and recomputes when it changes.
- Each metric links through to the underlying filtered list of records it represents.

**Edge cases & constraints**
- Figures cover only permits with a recorded status-transition history; permits predating history logging are excluded until backfilled, and this limitation is stated on the dashboard.
- When the filtered set contains no permits with a completed processing time, the section shows an empty/"no completed permits" state rather than a zero that reads as a real value.

---

**Testing notes**

- **Test 1 — Processing time correctness:** For permits with known submitted and approved dates, confirm total processing time and the median/average aggregates compute correctly.
- **Test 2 — In-process exclusion:** Confirm applications not yet at Active Permit are excluded from completed-time figures and that the excluded count is reported.
- **Test 3 — Target window:** With a defined target, confirm the count and percentage over the window match the underlying records.
- **Test 4 — Filter propagation:** Apply a Resource Category filter and confirm every processing-time metric and its click-through list recompute to match.

---

**Open questions**
- [ ] Is the target processing window 60 days, 90 days, or a configurable value? The requirement states a "60–90 day" target without a single threshold; the dashboard currently draws the reference line at 90 days pending this decision.
- [ ] Are denied applications included in processing-time figures (submitted → decision), or is processing time measured only to approval (Active Permit)?
- [ ] For a permit whose assigned Technical Reviewer changed during review, is "processing time by reviewer" attributed to the current reviewer, the reviewer at decision, or split by time held?
- [ ] Should "time in each workflow stage" include the Submitted (intake, pre-assignment) stage, or only stages after a reviewer is assigned?

---

## Story 4 — Show trends-over-time charts on the Administrator dashboard

**Story Title**
Show monthly intake, decision, and delinquency trends on the Administrator dashboard

---

**Description**

As a System Admin,
I want monthly trend charts of application intake, approval/denial decisions, and newly delinquent permits,
So that I can see whether volume, review throughput, and reporting compliance are improving or worsening over time — not just as a current snapshot.

These charts show a fixed trailing window of months so a time series stays readable regardless of the dashboard's date range; the District and Resource Category filters still scope them. Decision dates come from the status-transition history (Story 2).

**Roles affected:** System Admin

**Out of scope:** The shared filter bar and click-through — Story 1. Recording the status-transition history the decision series depends on — Story 2.

---

**Acceptance Criteria**

**Happy path — intake & decisions**
- The dashboard shows, per month over a fixed trailing window, the number of applications received (counted by Date submitted, Draft excluded).
- The dashboard shows, per month, the number of permits approved (the transition into Active Permit) and the number denied (the transition into the denied status).
- Approved and denied are shown as a single stacked bar representing that month's decisions; applications received are shown as a line.
- The chart makes clear that received (intake) and approved/denied (decisions) are distinct measures — a decision lands on an application received in an earlier month — so the bar is not read as a breakdown of that month's intake.

**Happy path — delinquency trend**
- The dashboard shows, per month, the number of issued permits that newly became delinquent — their annual report came due that month and was not submitted.
- A downward trend indicates fewer permits are newly missing their reporting deadline.

**Filtering**
- These charts show a fixed trailing window of months rather than following the shared date range, so the trend stays readable at any date preset.
- The District and Resource Category filters scope these charts, and they recompute without a page reload.

**Edge cases & constraints**
- A month with no activity renders as a zero value, not a gap in the series.
- A permit still in process (no decision yet) contributes to Received but to neither Approved nor Denied.
- Delinquency counts only issued permits (Active Permit / Expired) whose report is unsubmitted; applications in process are excluded.

---

**Testing notes**

- **Test 1 — Decision bucketing:** For permits with known approval/denial dates, confirm each is counted in the correct month and outcome, and that in-process permits are excluded from decisions.
- **Test 2 — Received vs decisions independence:** Confirm a month's Received (line) and Approved+Denied (bar) are counted independently — a permit received in one month and decided in another appears in each series at its own month.
- **Test 3 — Fixed window:** Change the shared date range to a short preset and confirm the trend charts still show the full trailing window while the other metrics narrow.
- **Test 4 — Delinquency:** For issued permits with a known annual-report due date and no report, confirm each is counted in its due month.

---

**Open questions**
- [ ] How many months should the fixed trailing window show — 12, 18, or configurable?
- [ ] Should the trailing window anchor to today's date, or to the latest activity in the data (the prototype anchors to the latest submission so the window always lands on records)?
- [ ] Is "delinquent" defined solely by the annual-report due date passing with no report submitted, or are grace periods / other report types involved?
- [ ] Should these trends optionally follow the shared date range instead of a fixed window, as a toggle?

---

## Story 5 — Show review-workload & health charts on the Administrator dashboard

**Story Title**
Show open-backlog aging and inquiry-round charts on the Administrator dashboard

---

**Description**

As a System Admin,
I want to see how long open permits have been in process and how many inquiry round-trips permits require,
So that I can spot a stalling review queue and gauge review friction — health measures the processing-time metrics don't show, because those cover only permits that already reached a decision.

**Roles affected:** System Admin

**Out of scope:** Processing-time metrics for decided permits — Story 3. The shared filter bar — Story 1.

---

**Acceptance Criteria**

**Happy path — open-backlog aging**
- The dashboard shows permits still in process (In Review, Back to Researcher, and any other pre-decision status) bucketed by how long since Date submitted: 0–30, 31–60, 61–90, and over 90 days, in that order.
- The "over 90 days" bucket represents permits still awaiting a decision past the target processing window.
- Only in-process permits are counted; decided permits (Active Permit, denied, withdrawn) are excluded.

**Happy path — inquiry rounds**
- The dashboard shows how many permits required 0, 1, or 2 or more returns to the researcher (Back to Researcher round-trips) during review.
- This complements the inquiry-rate figure (Story 3) by showing the distribution, not just the overall percentage.

**UI & field details**
- Both charts are single-hue magnitude bars with an ordered, labelled axis (the bucket order carries meaning), consistent with the other distribution bars on the dashboard.

**Filtering**
- The shared date, District, and Resource Category filters scope both charts, and they recompute without a page reload.

**Edge cases & constraints**
- Aging is measured against a single reference date (the "as of" date), so every open permit is aged on the same clock.
- A bucket with no permits shows a zero-height bar in its ordered position rather than being omitted.

---

**Testing notes**

- **Test 1 — Aging buckets:** For in-process permits with known submitted dates, confirm each falls in the correct age bucket relative to the reference date, and that decided permits are excluded.
- **Test 2 — Over-target count:** Confirm the "over 90 days" bucket count matches the in-process permits whose age exceeds the target window.
- **Test 3 — Inquiry distribution:** For permits with 0, 1, and 2+ Back to Researcher transitions in their history, confirm each is counted in the correct bucket.
- **Test 4 — Filter propagation:** Apply a District filter and confirm both charts recompute to the scoped set.

---

**Open questions**
- [ ] What is the "as of" reference date for aging in production — the current date, or a reporting cutoff? (The prototype uses the latest submission date in the data.)
- [ ] Should aging be measured from Date submitted (total time open) or from the date the permit entered its current status (time in current stage)?
- [ ] Should the aging buckets align to the confirmed target window (e.g. a 60-day threshold would change the bucket boundaries)?
- [ ] Should the inquiry-rounds chart cap at "2+", or break out 2, 3, 4+ separately if the data warrants?

---

## Story 6 — Show composition & outcome charts on the Administrator dashboard

**Story Title**
Show permit-composition and decision-outcome charts on the Administrator dashboard

---

**Description**

As a System Admin,
I want to see the permit mix by type and renewal, and the approve/deny split per resource category,
So that I understand what the review workload is made of and whether certain resource categories are denied disproportionately.

**Roles affected:** System Admin

**Out of scope:** The shared filter bar and click-through — Story 1.

---

**Acceptance Criteria**

**Happy path — permit-type composition**
- The dashboard shows permits by permit type, as a stacked bar split by renewal type (New, Renewal, Amendment, Reissuance).
- Permit types are ordered by total volume so the largest type reads first.

**Happy path — decision outcome by category**
- The dashboard shows decided permits per Resource Category as a stacked bar split by outcome — approved (Active Permit) versus denied.
- Only permits that reached a decision are counted; in-process permits are excluded.
- Categories are ordered by total decided volume.

**UI & field details**
- Renewal types use a distinct colour each with a legend (a composition, not a magnitude), and each is named — colour is never the only cue.
- The approved and denied segments each carry a colour and a legend label, so an outcome is never conveyed by colour alone.

**Filtering**
- The shared date, District, and Resource Category filters scope both charts, and they recompute without a page reload.

**Edge cases & constraints**
- A category with no decided permits is omitted from the outcome chart rather than shown as an empty row.
- Draft applications are excluded from both charts.

---

**Testing notes**

- **Test 1 — Composition totals:** Confirm each permit type's stacked segments sum to that type's total permit count, and renewal-type segments match the underlying records.
- **Test 2 — Outcome split:** For a category with known approvals and denials, confirm the two segments match, and that in-process permits are excluded.
- **Test 3 — Filter propagation:** Apply a Resource Category filter and confirm both charts scope to it.

---

**Open questions**
- [ ] Should the decision-outcome chart show counts (volume + mix) or a 100%-stacked proportion (pure approval rate) — or both, as a toggle?
- [ ] Should "denied" here use the exact denied/rejected status name to be confirmed in Story 1's open question?
- [ ] Is renewal type (New / Renewal / Amendment / Reissuance) the right split for permit-type composition, or should record type be used instead?
