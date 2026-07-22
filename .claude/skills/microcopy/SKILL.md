---
name: microcopy
description: MANDATORY before writing or editing ANY user-facing copy of any kind — titles, headings, labels, helper/hint text, placeholders, button text, notification/toast/modal titles + subtitles, error messages, empty states, confirmation and success screens, tooltips, email subjects, and card content. Triggers whenever you add or change text a user will read in the UI (in .astro/.html/.css/.ts/.tsx, in string-built markup, or in mock/seed data that surfaces as copy). Encodes the NNGroup informative-microcopy framework: the 3 C's (Clarity > Concision > Character), front-loading, the common concision mistakes (expletives, determiners/modifiers, passive voice, redundancy), length targets, and the jargon/audience rule. Apply it every time; do not write copy from intuition alone.
---

# Microcopy (Clarity > Concision > Character)

The house framework for writing any user-facing text, adapted from NNGroup's
*Informative Microcopy* course. **Load and apply this every time you write or
edit copy** — a label, a button, a notification, an error, a success screen.
Don't write from intuition and back-fill a justification; walk the framework.

**Microcopy** = roughly fewer than 3 sentences (titles, headings, summaries,
card content, labels, button text, notifications). Most UI text is microcopy.
Its job is to **inform, support interaction, or influence a next action** — so
the user can scan, find what they need, and decide.

---

## The one hierarchy that settles every disagreement

> **Clarity > Concision > Character**

When two edits conflict, the higher-priority C wins. Never buy concision or
character at the cost of clarity. Extra words are fine **if they add clarity**.

A worked example from this repo: choosing between "we'll email you…" (active,
warmer) and "you'll be notified by email…" (passive, more formal) — they tie on
**clarity**, so the decision drops to lower C's. Passive is only a *concision*
flag, and it was **justified** because it keeps *"you," the applicant,* as the
subject, and the formal register fits a government permit system. Tone-fit
(Character) broke the tie. That's the framework working as designed.

---

## Goal 1 — Clarity (deliver the key information)

Before writing, identify:

- **The user's key takeaway.** State it in one sentence. If you can't, the copy
  isn't ready.
- **The organization's goal.** Balance it against the user's need.
- **Relevance & information scent.** Does the text tell the user what's here and
  whether it's worth their effort? Titles/headings are **signposts** — they must
  indicate what's in the section and where the user is.
- **Jargon.** Use words the audience can reasonably understand.
  - **Audience rule (critical):** jargon is *acceptable, even necessary, for a
    professional audience* and *wrong for a general/public one.* Judge by who
    actually reads it — e.g. a scientific-permit applicant is a researcher, so
    *power analysis, replicates, disposition of specimens* are correct and must
    NOT be plain-language'd away. A mixed-public form must avoid the same terms
    or explain them (a tooltip for an unavoidable term).

Sometimes a microcopy problem is really a **long-form problem** — fix the whole,
not just the label.

---

## Goal 2 — Concision (absorb the meaning fast)

**Front-load.** Put the most important, information-carrying words first. It
survives truncation and helps scanners. (Reassurance, the takeaway, the action —
lead with it; don't bury it mid-sentence.)

**Hunt the four common mistakes:**

| Mistake | Tell | Fix |
|---|---|---|
| **Expletives** | "There is/was…", "It is…" + filler | Rearrange so a real subject acts. *"There was an error in the code" → "The code had an error."* |
| **Determiners / modifiers** | -ly adverbs, "very", "really", "kind of" | Delete. *"really the backbone" → "the backbone."* |
| **Passive voice** | Add "…by zombies" and it still reads | Find the subject, make it act — *unless* passive deliberately keeps the reader as the subject (a clarity/tone call, allowed by the hierarchy). |
| **Redundancy** | Two phrases, one idea; helper echoing its label | Delete or merge. *"intuitive and easy-to-use" → "intuitive."* |

**Logic check (counts as clarity, not style):** don't file a **certainty** under
a conditional. *"If we … reach a decision"* is wrong — a decision always comes.
Split the *if* (may happen) from the *when* (will happen).

**Length targets** (guidelines, not laws — directness matters more):
- Titles: **≤ 60 characters**
- Email subject lines: **≤ 60**
- Descriptions / summaries: **≤ 160**
- Push notifications: **~200**

Longer is OK only when needed for **clarity**, SEO, or a style constraint. A
3-sentence block sitting in a microcopy slot (a notification subtitle, a hint)
is a smell — split it or shorten it.

Four questions to ask on every edit:
1. Can I cut words while keeping the message?
2. Any of the four concision mistakes present?
3. Does a character limit apply?
4. Is it front-loaded?

---

## Goal 3 — Character (only after Clarity + Concision)

Character = tone of voice, personality, warmth. It's the **most subjective C and
the lowest priority** for informative microcopy — nice to have, never at the
cost of clarity. Match it to the audience (learn the audience, don't guess) and
to the moment: a genuine payoff (a submitted application) can carry light warmth;
a dense professional form stays plain. Consistency of voice across a screen is
itself a clarity aid — keep it uniform.

---

## House conventions (this repo)

- **Required/optional labeling:** mark only the **exceptions**. Optional fields
  carry "(optional)"; required is the silent default. (When nearly everything is
  required, "(required)" on every field is redundancy that stops carrying scent.)
  Set once, app-wide — including runtime-built labels (`address-fields.ts`).
- **Standardize repeated phrases:** the same instruction worded three ways
  ("Provide power analysis" / "include power analyses…" / "Provide a power
  analysis") erodes scent. Pick one wording and reuse it verbatim.
  Established canonical forms: `Include a power analysis to justify your sample
  size.` · file-type hints as `Accepted file type(s): …`.
- **Notification titles must carry information**, not be a fragment. Title = the
  takeaway ("No extra details needed"), subtitle = the why.
- **De-jargon internal/implementation terms** for applicants (e.g. don't expose
  the wizard's "review section" — say what the user does).

---

## Quick checklist (run before committing any copy)

1. **Clarity** — one-sentence takeaway clear? relevant? right jargon level for
   *this* audience? signpost/scent present? logic sound (if vs when)?
2. **Concision** — front-loaded? none of the four mistakes? within the length
   target? no 3-sentence block in a microcopy slot?
3. **Character** — tone fits audience + moment, and costs no clarity?
4. **Consistency** — matches sibling copy's voice and any standardized phrasing?

If an edit trades down a C (e.g. accepts passive voice), say **why the higher C
justifies it** — that's the framework, not an excuse.
