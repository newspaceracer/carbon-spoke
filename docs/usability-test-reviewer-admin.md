# Usability test — Reviewers & Admins

**System:** NRD permit system (Carbon Spoke prototype)
**Method:** Moderated, task-based, think-aloud
**Focus roles:** System Admin · District Administrator · Responsible Analyst (permit reviewer)
**Status:** Ready to run · Owner: _[research lead]_ · Last updated: 2026-07-28

---

## 1. Why we're testing

The prototype layers a lot of workflow logic behind a small set of screens. Several
patterns are efficient once learned but are suspected to be hard to discover cold —
especially for the two audiences who live in the system daily: the **analysts who
review and decide permits** and the **admins who manage users, districts, and
site-wide defaults**. This study finds where those users hesitate, guess wrong, or
give up, and rates each weakness by severity so the team can prioritize fixes.

This is **evaluative** research on the current build — not concept validation. We
watch real people attempt real jobs and record where the interface fights them.

## 2. Research questions

The high-value questions, each tied to a suspected weakness surfaced in the flow map:

| # | Question | Suspected weakness under test |
|---|----------|-------------------------------|
| RQ1 | Can a reviewer figure out **how to approve/issue a permit**? | There is no "Approve" button — approval *is* completing the finalize wizard's **Send for signature** step. |
| RQ2 | Do reviewers understand the **review-started gate** and the **forced redirect** into the wizard? | Starting a review seals→unseals the detail page *and* immediately yanks the user into `/final-letter`. |
| RQ3 | Do reviewers grasp the **two-layer role model** (account role vs. per-permit Responsible/Supporting Agent)? | Controls silently appear/disappear based on permit-role; a Supporting Agent sees fewer actions with no explanation. |
| RQ4 | Can reviewers find the **right surface to manage the analysis team** vs. the view-only progress modal? | One-management-surface rule: add/remove lives on Overview; the header modal looks similar but is read-only. |
| RQ5 | Do users understand the **kanban board's hidden state coupling**? | Dragging a card in/out of *Under review* silently starts/un-starts the real review used elsewhere. |
| RQ6 | Do district admins distinguish **"Remove from district"** from **"Request account deactivation"**? | Independent actions that read as synonyms; deactivation is a cross-console handshake. |
| RQ7 | Can district admins **invite a member** and understand **role scoping** and the **lead-replacement guardrail**? | Content switcher (existing vs. invite); appointable roles are scoped; you can't leave a district with zero leads. |
| RQ8 | Can system admins process the **deactivation-request inbox** and connect it back to the district action that raised it? | Cross-console handshake between `/manage-district` and `/users`. |
| RQ9 | Do admins discover **view-first editing** on templates/defaults and district info? | Fields look static until a deliberate **Edit**. |
| RQ10 | Can admins use the **dashboard filter** to answer a real reporting question and click through to the register? | Live-recompute filter (no Apply); KPI tiles are click-throughs. |

## 3. Method

- **Moderated, one participant at a time**, ~60 minutes, remote (screen-share) or in
  person. Think-aloud protocol: participants narrate what they expect, see, and decide.
- **Facilitator + notetaker** per session (or a single facilitator with recording).
- **Task-based:** each participant attempts a set of realistic tasks for their role.
  Tasks are framed as **goals, not instructions** — we never name the button.
- **No leading.** When a participant stalls, the facilitator asks "What would you try?"
  or "What did you expect to happen?" before offering a nudge. Escalate help only after
  a genuine attempt (see §8 assist ladder).

## 4. Participants

**Target: 5 per role (15 total).** Five per role reliably surfaces the large majority
of role-specific issues; a lighter first pass of **3 per role (9 total)** is acceptable
if recruiting is slow — run it, fix the severe issues, retest.

| Profile | Who | Recruit for |
|---|---|---|
| **System Admin** | Program-level staff who manage users, role requests, districts, and site defaults | Comfort with admin consoles; does NOT need to know this product |
| **District Administrator** | District Lead / HQ reviewer who manages their district's roster and signers | Manages a team today; understands the reviewer org |
| **Responsible Analyst** | Reviewer who owns permit decisions end to end | Reviews applications; decides/issues; the daily driver of `/permit` |

**Mix:** at least 2 of 5 per role should be **new to this build** (measures learnability),
the rest can be familiar (measures whether familiarity papers over real friction).
Screen out anyone who built or designed the system.

## 5. Environment & pre-session setup

This is a prototype with a **dev-only identity switcher** (bottom-left overlay) and a
per-permit **permit-role switcher**. The facilitator uses these to place each
participant in the right context **before** the participant takes control — participants
should not see or touch the dev switchers (they don't exist in production).

**Per-session checklist (facilitator does this first):**

- [ ] Fresh build running (`npm run dev`), browser at a clean state; clear prototype
      local storage between participants so review-started flags, board moves, and saved
      members don't leak across sessions.
- [ ] Set the **account identity** to match the participant's role (System Admin /
      District Lead / a reviewer identity).
- [ ] For reviewer sessions, pre-stage permits in known states: one **Submitted /
      Waiting for review**, one **Under review (already started)**, one where the
      participant is **Responsible Agent**, and one where they are only a **Supporting
      Agent** (for RQ3).
- [ ] For district-admin sessions, ensure the scoped district has ≥2 technical reviewers
      (so the last-reviewer guardrail is reachable but not pre-tripped) and a named lead.
- [ ] For system-admin sessions, seed the inboxes: ≥1 role-change request, ≥1
      deactivation request raised from a district, ≥1 pending invitation.
- [ ] Screen recording + audio consented and started.

## 6. Session structure (~60 min)

| Phase | Time | Content |
|---|---|---|
| Intro & consent | 5 min | Purpose, "we're testing the system not you," think-aloud, recording consent |
| Warm-up | 5 min | Role, how they do this work today, expectations |
| Tasks | 40 min | Role task set (§8), think-aloud, SEQ after each task |
| Debrief | 8 min | SUS + open reflection (§9) |
| Wrap | 2 min | Thanks, incentive, next steps |

## 7. Facilitator script (verbatim scaffold)

**Intro:** "Thanks for helping. Today we're testing this permit system — not you. There
are no wrong answers; anything you find confusing is exactly what we need. I'll give you
a goal, and I'd like you to think out loud as you go — tell me what you're looking at,
what you expect, and when something surprises you. I may stay quiet so I can see what you
do naturally. Okay to record your screen and voice?"

**Before each task:** read the scenario, confirm they understand the *goal*, then go
quiet.

**When stuck (assist ladder — climb only one rung at a time):**
1. "What are you thinking?" / "What would you try next?"
2. "What did you expect to happen when you did that?"
3. "Where would you look for that?"
4. (Only if fully blocked and the task is done being informative) point them forward and
   mark the task **failed / assisted**.

**After each task:** "On a scale of 1 (very difficult) to 7 (very easy), how easy or
hard was that?" (Single Ease Question) + "Anything about that feel off?"

---

## 8. Task scenarios

Each card: the **participant-facing goal** (read aloud, no button names), **setup**,
**success = ...**, **watch for**, and **probes**. Tasks are ordered to build context.

### 8A. Responsible Analyst (permit reviewer)

> **R1 — Find and triage your work.** *"You're starting your day. Show me how you'd get
> a picture of the permits you're responsible for, and move one that's ready along to the
> next stage of its process."*
> - **Setup:** reviewer identity, board (`/my-permits`) has cards across lanes.
> - **Success:** locates the board; moves a card via drag or the card menu; can explain
>   what the lanes mean.
> - **Watch for (RQ5):** Do they realize the card menu items are *verbs* ("Start review",
>   "Return to researcher"), not lane names? Do they understand that moving a card
>   *into/out of Under review* actually starts/un-starts a real review? Does "Reset
>   board" behave as they expect? Do they notice Completed is a 30-day tray, not an
>   archive?
> - **Probes:** "What do you think happened elsewhere when you moved that card?"

> **R2 — Begin reviewing an application.** *"This permit just came in and it's yours to
> review. Get into it and start your review."*
> - **Setup:** a Submitted / Waiting-for-review permit where they're Responsible Agent.
> - **Success:** opens the permit, recognizes the sealed gate, starts the review.
> - **Watch for (RQ2):** Do they understand *why* the application body is sealed before
>   they start? When Start review **immediately redirects them into the finalize
>   wizard**, do they know where they landed — and can they get back to just *reading*
>   the application? Note surprise, back-button hunting, disorientation.
> - **Probes:** "Where are you now? Is this where you expected to be?"

> **R3 — Issue the permit. ★ headline task.** *"You've reviewed everything and you're
> satisfied. Approve this permit and get it moving toward being issued."*
> - **Setup:** a permit Under review, participant is Responsible Agent, conditions set.
> - **Success:** reaches **Send for signature** in the wizard (the actual approval act).
> - **Watch for (RQ1):** This is the biggest hypothesized failure. There is **no
>   "Approve" button** on the detail page — the primary action reads "Open review," and
>   approval only exists as completing the wizard's Send step. Time how long they hunt
>   for an Approve control. Do they expect a discrete approve action? Do they understand
>   that "Send for signature" *is* the approval, and that two signatures are involved?
> - **Metric:** task-success + time-on-task + count of distinct places they look for
>   "approve."

> **R4 — Bring in another reviewer.** *"You want a colleague to help review this permit.
> Add them to the team working on it."*
> - **Setup:** permit Under review, participant is Responsible Agent.
> - **Success:** uses **Add to team** on the Overview tab.
> - **Watch for (RQ4):** Do they instead open the header's "reviewers done" progress tile
>   (which is **view-only**) expecting to add someone there? Note the detour and whether
>   they recover.
> - **Probes:** "You opened this — what did you expect to be able to do here?"

> **R5 — Send it back to the applicant.** *"The application is missing a required
> document. Ask the researcher to fix it before you go further."*
> - **Setup:** permit Under review.
> - **Success:** finds Request changes, selects reason(s), sends; understands status
>   moves to *Changes requested*.
> - **Watch for:** Do they find the action inside the "Open review" combo menu? Is the
>   difference between *Request changes* and *Reject* clear (reversible vs. terminal)?

> **R6 — Understand your limits on a shared permit.** *"You've been asked to help on this
> other permit. Take whatever review actions you can on it."*
> - **Setup:** a permit where the participant is only a **Supporting Agent**.
> - **Success (learning task):** they discover they **cannot** start/decide it, and can
>   articulate why (they're supporting, not responsible).
> - **Watch for (RQ3):** With controls silently absent (no Start review, no decision
>   menu, a "Supporting review" section instead), do they understand *why* their options
>   differ, or do they read it as a bug/broken page? This exposes the two-layer role
>   model directly.
> - **Probes:** "What can you do here, and what can't you? Why do you think that is?"

> **R7 — Add a permit condition.** *"Add a special condition requiring the researcher to
> report findings annually."*
> - **Setup:** permit Under review, Special conditions tab.
> - **Success:** uses the Add-condition modal; chooses **From catalog** or **Write
>   manually** appropriately.
> - **Watch for:** Is the catalog-vs-manual content switcher discoverable? Do they notice
>   the "also save to catalog for reuse" option? (If time: show a frozen-status permit —
>   do they understand why conditions are read-only?)

### 8B. District Administrator

> **D1 — Add a new person to your district.** *"A new assistant reviewer is joining your
> district. Get them set up so they can start working on your permits."*
> - **Setup:** District Lead identity, scoped to their district.
> - **Success (RQ7):** opens Add member; chooses **Invite new user** (vs. Add existing);
>   fills name/email; picks a role.
> - **Watch for:** Does the **existing-vs-invite content switcher** read clearly? Do they
>   notice the **Role dropdown is scoped** to what they may appoint (a Lead can only
>   appoint an Assistant)? Do they understand the invitee is created "Invited" with the
>   role pre-granted before first login?

> **D2 — Remove someone the right way. ★ mental-model task.** *"One of your reviewers is
> leaving the district for another assignment but staying with the department. Handle it.
> Separately: another person's account should be shut off entirely."*
> - **Setup:** ≥2 technical reviewers present.
> - **Success (RQ6):** uses **Remove from district** for the transferring person, and
>   **Request account deactivation** for the second — and can explain the difference.
> - **Watch for:** Do they conflate the two? Do they expect "Remove from district" to
>   deactivate the account (or vice versa)? Do they realize deactivation only *requests*
>   an admin action, and isn't immediate?
> - **Probes:** "What happens to each person's account after what you just did?"

> **D3 — Replace the district lead.** *"Leadership of the district is changing hands to
> [named reviewer]. Make that change."*
> - **Setup:** current lead + at least one other eligible reviewer.
> - **Success:** completes lead replacement, naming the incoming lead in the same action.
> - **Watch for:** Does the guardrail (can't leave zero leads; must name a successor)
>   communicate itself, or does it feel like an obstacle? Note reactions to the block.

> **D4 — Guardrail probe.** *"Suppose you needed to remove your district's only remaining
> reviewer. Try it."*
> - **Success (learning task):** they hit the "can't remove the last technical reviewer"
>   block and understand it.
> - **Watch for:** Is the blocking message clear about *why* and *what to do instead*?

> **D5 — Set who signs.** *"Set the person who signs off on new permits for your
> district."*
> - **Success:** finds and sets the **Default signer**; notices the saved confirmation.
> - **Watch for:** Do they understand what the default signer governs (routing the second
>   signature)? Is the scope of the field clear?

> **D6 — Scope orientation (HQ/admin only).** *For participants who administer more than
> one district:* *"Now do the same for a different district."*
> - **Watch for:** Is the district **scope switcher** discoverable, and is it obvious the
>   whole console re-scoped (header, members, signer)?

### 8C. System Admin

> **A1 — Approve access.** *"Someone has requested a role in the system. Review the
> request and grant it."*
> - **Setup:** `/users` seeded with a role-change request.
> - **Success:** finds Role change requests; Approves (or Denies with reason).
> - **Watch for:** Is the request context (current → requested role, reason) enough to
>   decide? Is Approve/Deny weighting clear (Deny is destructive-styled)?

> **A2 — Deactivate an account raised by a district. ★ handshake task.** *"A district lead
> has asked you to shut off a user's account. Take care of it."*
> - **Setup:** a deactivation request already sitting in the `/users` inbox (raised in
>   §8B/D2 flow).
> - **Success (RQ8):** locates the Account deactivation requests inbox; Deactivates.
> - **Watch for:** Do they connect this inbox item to the district-side action that
>   created it? Do they understand deactivation is reversible and preserves
>   role/history? Is it clear this is *separate* from removing the person from a district?
> - **Probes:** "Where do you think this request came from? What does approving it change?"

> **A3 — Edit a user.** *"Update this internal user's details. Also take a look at a
> public (applicant) account and note what you can and can't change."*
> - **Success:** opens Edit user; observes **email is read-only** ("verified at sign-in");
>   notes internal vs. public field differences (public phone read-only; public status
>   expressed *as* role).
> - **Watch for (RQ3 admin variant):** Do they understand *why* email/phone are locked?
>   Do the **two different status vocabularies** (Active/Inactive for internal vs.
>   Public-user/Inactive role for public) confuse them?

> **A4 — Change a site-wide default.** *"The department updated one of the official permit
> forms. Swap in the new file. Then change the default validity period for new permits."*
> - **Setup:** `/admin/templates`.
> - **Success (RQ9):** replaces a regulated form; enters **Edit** on Permit defaults and
>   changes validity; saves.
> - **Watch for:** Do they discover the page is **view-first** (nothing editable until a
>   deliberate Edit)? Do they hesitate because fields look static? Is the live permit-ID
>   preview understood?

> **A5 — Answer a reporting question.** *"How many applications were denied in [a specific
> district] over [a recent period]? Then show me those specific permits."*
> - **Setup:** `/admin/dashboard`.
> - **Success (RQ10):** sets the shared filter (date range + district), reads the KPI, and
>   **clicks through** the tile into the filtered register.
> - **Watch for:** Do they expect an **Apply** button (there isn't one — it recomputes
>   live)? Do they realize the KPI tiles are click-throughs? Do they handle the
>   custom-date-range picker and empty-state cleanly?

> **A6 — (If time) Maintenance mode.** *"You need to take the site down for maintenance.
> Start that process (you don't have to confirm)."*
> - **Watch for:** Is the danger weighting and the role-confirm step proportionate and
>   clear? Do they feel safe that it's reversible?

---

## 9. Debrief (post-task, ~8 min)

- **SUS** (System Usability Scale) — 10-item standard questionnaire, per participant.
- Open questions:
  - "What was the most confusing moment today?"
  - "Was there ever a point you thought the system was broken but it was working as
    designed?" *(targets the silent role-gating and view-first patterns)*
  - "If you could change one thing, what would it be?"
  - "Was there anything you expected to be able to do that you couldn't find?"
  - (Reviewers) "In your own words, how do you approve a permit here?" *(RQ1 recall check)*
  - (Admins) "What's the difference between removing someone from a district and
    deactivating their account?" *(RQ6/RQ8 recall check)*

## 10. Data captured per task

| Metric | How |
|---|---|
| **Task success** | Complete-unaided / Complete-assisted / Failed |
| **Time on task** | Start (goal read) → success or give-up |
| **Errors & wrong turns** | Count of dead-ends, wrong surfaces opened, misclicks of consequence |
| **SEQ** | 1–7 single-ease rating, immediately after |
| **Verbatim friction** | Quotes at moments of hesitation/surprise |
| **Assist level** | Highest assist-ladder rung reached |

Plus per session: SUS score, top-3 observed issues, notable quotes.

## 11. Analysis & severity

After all sessions, aggregate issues and rate each with a standard severity scale so the
team can triage:

| Severity | Meaning | Rough bar |
|---|---|---|
| **4 — Critical** | Blocks task completion; users can't recover | Must fix before release |
| **3 — Serious** | Major delay/frustration; many users hit it | High priority |
| **2 — Minor** | Slows users; workaround found | Fix when convenient |
| **1 — Cosmetic** | Noticed, no real impact | Backlog |

Score each issue on **frequency** (how many participants) × **impact** (how badly it
hurt) × **persistence** (one-time confusion vs. recurring). Report as a ranked issue
list, each with: what happened, which RQ it maps to, severity, supporting quotes/clips,
and a recommended direction.

**Expected headline findings to validate or refute** (pre-registered so we don't
rationalize after the fact): RQ1 (invisible approve), RQ2 (forced wizard redirect), RQ3
(silent role-gating reads as broken), RQ6 (remove vs. deactivate conflation). If these
*don't* surface, that's a finding too.

## 12. Deliverables

1. Ranked, severity-rated issue list mapped to the RQ matrix (§2).
2. Per-role success-rate / time / SEQ summary + overall SUS.
3. Highlight clips for the top 5 issues.
4. Prioritized recommendation set for the next build.

---

### Appendix A — Screener (per role)

- Do you [manage users & districts / administer a district's roster / review and decide
  permits] as part of your job today? *(must be yes for the matching role)*
- How long have you done this work?
- Did you help design or build this system? *(exclude if yes)*
- Comfort with web admin tools (self-rated 1–5).

### Appendix B — Notetaker template (per task)

```
Task: ____   Participant: ____   Role: ____
Start time: ____   End time: ____   Outcome: Unaided / Assisted / Failed
Assist rung reached: 0 1 2 3 4
Wrong surfaces opened: ____________________
Key quotes: ______________________________
Surprises / "is this broken?" moments: ____
SEQ (1–7): ___
```

### Appendix C — Facilitator reminders

- Place the participant's identity/permit-role **before** handing over control; never let
  them see the dev switchers.
- Reset prototype state between participants (review-started flags, board moves, saved
  members, seeded inboxes).
- Don't name buttons. Don't rescue too early. Silence is a tool.
- A task where the participant learns a *constraint* (R6, D4) succeeds when they
  understand the limit — not when they defeat it.
