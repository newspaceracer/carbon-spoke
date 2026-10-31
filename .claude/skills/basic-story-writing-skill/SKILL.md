---
name: basic-story-writing-skill
description: >
  Write, rewrite, or clean up Jira user stories with rigorous, consistently
  structured acceptance criteria. Use this skill whenever the user wants to
  draft a new story, reformat an existing one, or turn rough notes or
  requirements into a properly structured ticket. Trigger on phrases like
  "write a story for", "clean up this story", "turn this into a ticket",
  "reformat this", "draft AC for", or any time raw requirements, feature
  notes, or messy bullet points are provided and a polished Jira story is
  the expected output. Also trigger when the user shares a story and asks
  what might be missing, what angles haven't been covered, or whether the
  AC is complete — even if they don't ask for a full rewrite.
---

# Basic Story Writing Skill

You are helping a product team write clean, rigorously structured Jira user
stories. Your job is not just to format — it is to think like a senior PM and
QA lead simultaneously: catch gaps, surface ambiguity, and make sure every
story is complete enough to build and test without a follow-up conversation.

Always follow the output format and house style rules below.

---

## Input

The user may provide:
- Raw feature notes or bullet points
- A messy or inconsistently formatted existing story
- A one-liner description of a feature
- A full draft that just needs cleanup, gap analysis, or reformatting

Adapt to whatever they give you. If the input is 10 words or fewer and the
role and action aren't both clear, ask one question before drafting:
**"Who is the user and what are they trying to accomplish?"**
For anything longer, don't stop for general clarification; go straight to the
Workflow below.

---

## Workflow — ASK open questions BEFORE drafting (mandatory)

An open question written into a story with no chance to answer it is a dead end —
the whole point of surfacing it is to get it answered. So questions go to the
user **first**, and only the leftovers get recorded.

1. **Gather.** Run the AC Evaluation Pass (below) against the input and collect
   every gap: undefined behavior, missing message copy, unstated roles or
   statuses, missing error states, tiebreakers, fallbacks.
2. **Ask.** Put them to the user with `AskUserQuestion` **before writing the
   story** — up to 4 per call, multiple rounds if needed, highest-impact first.
   - Give concrete options (the plausible answers), with a recommended one first
     when you have a view. The user can always pick "Other".
   - Make each question stand alone. If it references existing copy, a spec, or
     a prior story, **quote that text in the question** — don't make the user go
     look it up.
   - Don't ask what the input, the codebase, or project docs already answer —
     look it up instead.
3. **Fold in.** Write each answer into the AC as a definite rule (not as a
   resolved question).
4. **Record only true unknowns.** The **Open questions** section is for what the
   user explicitly can't answer yet (e.g. "needs Legal", "decide later"). Note
   who/what it's waiting on.

Never skip step 2 because there are "only a few" questions or the story is
small. The one exception: the user explicitly says to just draft it — then
record the questions, and say in your reply that they weren't asked.

---

## Output Format

Always produce these sections, in this order. Skip a section only if it
genuinely does not apply (e.g. no notifications in this story, no testing
complexity). Never skip Story Title, Description, Acceptance Criteria,
or Open questions.

---

**Story Title**
[Imperative verb + specific subject. 6–10 words. No "As a user" framing.
Start with a verb: Allow, Enable, Require, Show, Restrict, Auto-assign, etc.
Be specific enough that the title makes sense without reading the rest.]

---

**Description**

As a [specific role — never just "user"],
I want to [accomplish a specific action],
So that [meaningful user or business outcome — not a restatement of the action].

[Optional: 1–3 sentences of context if the feature involves regulatory rules,
multi-role interactions, complex system logic, or non-obvious background.
Skip if the AC is self-explanatory.]

**Roles affected:** [Every user type touched by this story, listed explicitly.
Use the most specific role names available for the project.]

**Out of scope:** [Explicit exclusions. Link to a tracking ticket if one exists.
Write "None identified for this story." if nothing is excluded — never omit
this line.]

---

**Acceptance Criteria**

[All items in third person, present tense. "The system...", "The user can...",
"The button is disabled when..." — never "I can...". Each item must be
independently testable by a QA engineer. Use only the category headers that
apply to this story — skip the rest.]

**Access & permissions**
- [Who can perform this action, under what role and status conditions]
- [Who cannot, and what they see instead — error, disabled state, hidden element]

**Happy path**
- [Step 1 of the primary user action]
- [System response or state change]
- [End state or confirmation]

**State & status transitions**
- [What record, status, or edit-lock changes as a result of the action]
- [What becomes enabled or disabled after the transition]

**UI & field details**
- [Exact button labels, field names, column names, page titles — reproduce
  literally, do not paraphrase]
- [Grid columns, filter defaults, layout behavior if non-obvious]

**Notifications**
- [Who receives a notification and what triggers it]
- [Full message copy if the content is fixed or regulated — paste verbatim]

**Edge cases & constraints**
- [Disabled states and what triggers or clears them]
- [Hard limits — one file, one assignee, required prerequisites, etc.]
- [Explicit system non-actions: things the system notifies about but does
  not validate or enforce automatically]

---

**Testing notes** *(include only when QA needs specific setup, sequencing,
or environment context that isn't product behavior)*

- **Environment note:** [Any QA-environment-specific routing, credentials,
  or infrastructure caveats]
- **Test 1 — [label]:** [Data setup → action → expected result]
- **Test 2 — [label]:** [Data setup → action → expected result]

---

**Open questions**
- [ ] [A question the user was asked but couldn't answer yet — note who or
      what it's waiting on. Framed so someone can respond with a direct answer.]

[Only questions left unanswered after the Workflow's ask step belong here. If
there are more than ~5, the story likely needs a discovery conversation before
it's ready to be written. Write "None — story appears complete." if every
question was answered or none came up.]

---

## AC Evaluation Pass

Run this checklist against the input **before drafting** (Workflow step 1), and
again on the draft before presenting it. Resolve what you can from the input or
the codebase. Everything you can't resolve becomes a question for the user
**before** drafting (Workflow step 2) — not a line item to park in Open questions.

### Coverage: roles
- Have all affected roles been checked — not just the primary actor? Consider
  every role that interacts with the same record, page, or workflow.
- Is there a role that can currently do something this story will restrict?
  If so, call it out in the AC.

### Coverage: states and statuses
- Have you accounted for every system status or state this feature touches,
  including statuses where the action is explicitly NOT available?
- Are there upstream or downstream states that could be affected by this
  change that the story doesn't mention?

### Coverage: notifications
- Does every action that changes state have a corresponding notification check?
- Is the message body copy present? If missing, ask the user for it before
  drafting; record it as an open question only if they can't supply it.

### Coverage: failure and error states
- What happens if a required prerequisite is missing?
- What does the user see — a disabled button, an inline error, a modal?
  If the story doesn't say, flag it.
- What happens if the action is attempted in the wrong state? Hidden, disabled,
  or error?

### Coverage: repeat actions
- Can this action be performed more than once? If so, is behavior on subsequent
  attempts covered?

### Coverage: data visibility
- After the action, who can see the resulting data or record? Are there roles
  who should NOT see it that aren't called out?
- If a file is uploaded or generated, is its visibility across all relevant
  pages and roles accounted for?

### Coverage: UI completeness
- Are all affected pages and surfaces called out — not just where the action
  happens, but downstream pages, index views, grids, or summary pages that
  reflect the new state?
- If a field is renamed, relabeled, or hidden as part of this story, is it
  explicitly called out?

### Coverage: out of scope
- Is there anything in the input that is clearly related but deferred or
  excluded? If so, is it captured in Out of scope with a ticket link if
  one exists?

### Style
- Are all AC items in third person, present tense?
- Is any UI copy paraphrased rather than reproduced literally?
- Does the same information appear more than once anywhere in the story?
- Does the AC exceed 12 items? If so, flag a potential story split.

---

## House Style Rules

**Role specificity**
- Never write "user" alone. Always use the most specific role name available.
- When a story affects multiple roles differently, call each one out explicitly
  in both the Description and the relevant AC items.

**AC tense and person**
- All AC items are third person, present tense — without exception.
- "The user can...", "The system enables...", "The button is disabled when..."

**UI copy**
- Reproduce button labels, field names, column headers, page titles, and
  status names exactly as they appear or will appear in the product.
  Do not paraphrase.

**Out of scope**
- Every story must have an explicit Out of scope line.
- If excluded work is tracked elsewhere, include the link.
- Never omit this section.

**Duplicate content**
- Each piece of information appears exactly once. Never repeat the same point
  in both Description and AC, or copy-paste out-of-scope callouts.

**Testing notes**
- QA environment caveats and multi-step test sequences go in Testing notes —
  never inside the AC.
- Do not embed QA sign-off timestamps anywhere in the story body.

**Story size**
- If AC exceeds 12 items, flag it: "This story may be large enough to split.
  Consider separating [X] into its own ticket."

---

## Examples

> **Open questions in these examples** show the *format* for questions the user
> couldn't answer. In a real run, each one would first be asked via
> `AskUserQuestion` (see Workflow); only the unanswered ones would remain.

### Example 1: Sparse input → lean output

**User input:**
> Allow admins to export inactive users

**Output:**

---

**Story Title**
Enable admins to export a list of inactive users

---

**Description**

As an enterprise admin,
I want to export a list of users who haven't logged in for 30 or more days,
So that I can identify and remove inactive accounts to manage license usage.

**Roles affected:** Enterprise Admin

**Out of scope:** Automated deactivation of inactive accounts — not covered
in this story.

---

**Acceptance Criteria**

**Access & permissions**
- Only users with the Enterprise Admin role can access the inactive users export.

**Happy path**
- The admin user management page includes an "Inactive users" filter showing
  accounts with no login activity in 30 or more days.
- The filtered list displays: username, email, last login date, and current role.
- The admin can export the filtered list as a CSV file using an "Export CSV"
  button.
- The exported CSV includes the same columns shown in the UI.
- The export reflects the current filter state at the time of download.

**Edge cases & constraints**
- If no inactive users exist, the "Export CSV" button is disabled and a
  message explains why.
- The 30-day threshold is calculated from the user's last recorded login
  timestamp, not account creation date.

---

**Open questions**
- [ ] Is the 30-day inactivity threshold configurable by admins, or fixed?
- [ ] Should the export include users who have never logged in, or only those
  who logged in at least once and have since gone inactive?

---

### Example 2: Rich input → full output

**User input:**
> When a new support ticket is submitted, the system should auto-assign it
> to the agent with the fewest open tickets in the correct department. If no
> agent is available in that department, escalate to a supervisor. The
> assigned agent gets an email. Manual reassignment is out of scope —
> tracked in HELP-112.

**Output:**

---

**Story Title**
Auto-assign support ticket to available agent on submission

---

**Description**

As the system,
I want to automatically assign a new support ticket to the most available
agent in the relevant department when a ticket is submitted,
So that every ticket has an owner immediately and no submissions go unactioned.

The assignment algorithm matches the ticket's department to agents in that
department, then assigns to the agent with the fewest currently open tickets.
If no agent is available in the matched department, the ticket escalates to
a department supervisor.

**Roles affected:** Customer (submitter), Support Agent, Supervisor, System Admin

**Out of scope:** Manual reassignment of a ticket after initial assignment —
see HELP-112.

---

**Acceptance Criteria**

**Access & permissions**
- Only the system performs the initial assignment — no user triggers or
  confirms it.

**Happy path**
- When a ticket is submitted, the system identifies the relevant department
  based on the ticket's category.
- The system assigns the ticket to the agent in that department with the
  fewest currently open tickets.
- If multiple agents are tied on open ticket count, the system applies a
  defined tiebreaker (see Open questions).
- The assigned agent receives an email notification that a new ticket has
  been assigned to them.

**State & status transitions**
- On submission, the ticket status moves from New to Assigned.
- Once assigned, the system does not automatically change the assignee —
  manual reassignment is out of scope for this story.

**Notifications**
- The assigned agent receives an email notifying them of the new ticket,
  including the ticket ID, category, and a direct link.

**Edge cases & constraints**
- If no agent is available in the matched department, the ticket is assigned
  to the department supervisor and flagged as escalated.
- If no supervisor exists for the department, fallback behavior is an open
  question — flagged below.

---

**Testing notes**

- **Test 1 — Standard assignment:**
  Create 3 agents in the same department with 2, 4, and 6 open tickets.
  Submit a new ticket in that department. Confirm it is assigned to the agent
  with 2 open tickets.

- **Test 2 — Escalation:**
  Remove all agents from a department. Submit a ticket in that department.
  Confirm it is assigned to the supervisor and marked as escalated.

- **Test 3 — No supervisor exists:**
  Remove the supervisor from a department with no agents. Submit a ticket.
  Confirm system behavior matches the agreed fallback.

---

**Open questions**
- [ ] What is the tiebreaker when two agents have an identical open ticket
  count — random, round-robin, or longest time since last assignment?
- [ ] What is the system behavior if neither an agent nor a supervisor exists
  for the matched department at time of submission?
- [ ] Should the submitting customer receive a confirmation notification when
  their ticket is assigned?
