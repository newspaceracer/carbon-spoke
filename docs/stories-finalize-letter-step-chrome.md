# Finalize-Letter Step Chrome — Jira Stories

One story: tidy the review wizard's later steps so each step leads with its
content — promote a section's primary action into its section header, and drop the
redundant per-step intro info banners.

- **Story 1** — Promote section actions into headers and drop step-intro banners on
  Finalize the letter & Review & send

The review wizard (permit **Under review**) has three steps: **Review &
conditions** (step ①), **Finalize the letter** (step ②), and **Review & send**
(step ③). Steps ② and ③ are reached only by the permit's lead — the **Responsible
Agent (RA)** or a **System Admin** acting on the permit; a **Supporting Agent
(SA)** never advances past step ①.

---

## Story 1 — Promote section actions into headers and drop step-intro banners on Finalize the letter & Review & send

**Story Title**
Promote section actions into headers and drop step-intro banners

---

**Description**

As the permit's Responsible Agent (or a System Admin),
I want the Finalize the letter and Review & send steps to open directly on their
content, with each section's primary action sitting in that section's header,
So that the steps read cleanly without stating what I already understand from the
step title and layout.

This follows the pattern already applied to the **District contacts** section,
whose **Add contact** control sits inline in its header (see
`stories-final-letter-district-contacts.md`). Two changes apply the same idea to
the rest of the finalize steps: the **Signature** section's action moves into its
header, and the two per-step intro info banners are removed. No field, letter
content, or send behavior changes.

*Prototype note:* the prototype build simulates the signed-in role with a
developer-only identity switcher, and the per-permit permit-role with a
constrained per-permit control. In production, the acting role is the signed-in
user's actual account role and their assigned permit-role.

**Roles affected:** Responsible Agent (RA), System Admin (the leads who reach
steps ② and ③). Supporting Agent (SA) is unaffected — they never reach these steps.

**Out of scope:** The **Add contact**-in-header treatment for District contacts —
already covered in `stories-final-letter-district-contacts.md`. The behavior of
**Change signer** (the picker it opens) and of **Send for signature** — unchanged.
The signer eligibility / default-signer rules — unchanged.

---

**Acceptance Criteria**

**UI & field details**
- On **Finalize the letter** (step ②), the **Signature** section shows its **Change
  signer** control as a tertiary button inline on the right of the "Signature"
  section header, and the section divider spans the full width beneath the title
  and the button.
- The **Change signer** button no longer appears as a full-width button below the
  signer tile.
- The info banner titled "These set the letter" is removed from the top of step ②;
  the step opens directly on the "Addressed to" recap.
- The info banner titled "Review the full package, then send" is removed from the
  top of **Review & send** (step ③); the step opens directly on the package recap.

**Happy path**
- Clicking **Change signer** in the Signature header opens the signer picker modal,
  exactly as before; selecting a signer updates the signer tile and the letter's
  printed signer.

**Edge cases & constraints**
- No change to the letter body, the signer options, the summary/recap content, or
  the **Send for signature** flow.
- The change is presentation-only; a screen-reader user still reaches the Change
  signer control and the section content in a sensible order (the header action
  precedes the section body).

---

**Testing notes**

- **Test 1 — Signature header action:** As the RA on Finalize the letter, confirm
  **Change signer** appears inline in the "Signature" header (not below the tile),
  and that clicking it opens the picker and reassigns the signer.
- **Test 2 — Banners removed:** Confirm step ② no longer shows the "These set the
  letter" banner and step ③ no longer shows the "Review the full package, then
  send" banner, and that each step begins on its first content section.

---

**Open questions**
- [ ] Should the other sections on step ② (e.g. Permit window, Authorized parks)
  also move their inline controls into their headers for full consistency, or is
  header-promotion reserved for a section's single primary action?
- [ ] The **District contacts** section still shows a helper paragraph describing
  the previous primary/park-contact model ("Each district's lead is its Primary
  contact… Park contacts attach automatically…"). Should that stale hint be
  updated to the current person + scope model or removed? (Tracked here since it is
  the same step's chrome.)
