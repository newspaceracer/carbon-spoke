# Permissions Matrix — Implementation Reference

Derived from the Confluence spec ("Test of User roles and permissions
documentation — Responsible/Supporting Agents Version", 5/13/25) **reconciled with
the decisions in [`decisions-roles-permissions.md`](./decisions-roles-permissions.md)**.
Where the two disagree, the decision log wins. This document is the reference an
implementer builds the permission resolver from.

Legend for permission cells:
- **R** = Read · **U** = Update (implies Read) · **D** = Disabled (visible,
  read-only, control present but inert) · **H** = Hide (control not rendered) ·
  **CA** = Cannot Access (whole record not reachable) · **—** = not applicable.
- Conditions in cells are **permit-role** conditions: *"U if RA"* = updatable only
  by the Responsible Agent; *RA* = Responsible Agent, *SA* = Supporting Agent.

---

## 1. Vocabulary

### 1.1 User roles (prototype identities)
| Role | Identity value | Scope |
|---|---|---|
| System Admin | `admin` | Global super-user |
| HQ Technical Reviewer | `hq-technical` | Global (statewide) |
| District Lead Technical Reviewer | `district-lead` | District-scoped (their district[s]) |
| District Assistant Technical Reviewer | `district-assistant` | District-scoped |
| Researcher (applicant) | `researcher` | Own records only |
| *(auth states)* | `pending`, `anon` | Roleless / logged-out |

Identity is the **single global actor** on every page (prototype-only switcher,
`readIdentity()`), including the permit detail page. No per-page "acting as".

### 1.2 Permit-roles (per permit)
- Exactly **one review permit-role per user per permit**: **Responsible Agent
  (RA)** or **Supporting Agent (SA)** — or **not assigned**.
- **Signer** is a separate per-permit capability (see §3): the RA is always the
  **1st signer**; a configured **2nd signer** co-signs.
- Prototype: a **constrained per-permit demo control** sets the current identity's
  permit-role (RA / SA / 2nd Signer / Not assigned), offering only what the
  identity is eligible for on this permit type (§2).

### 1.3 Permit types
- **Single-district** / **Multi-district** — a **stored attribute**, computed from
  the district span of the permit's parks; recomputed whenever parks change (§8.1).

### 1.4 Statuses (workflow order)
```
Draft
  → Waiting for review        (submitted; RA has not clicked "Start review")
  → Under review              (RA started review; IR editing unlocked)
      ⇄ Returned to submitter  (0–n round trips)
  → Out for signature         (RA signed 1st; awaiting 2nd signer via DocuSign)
      → [prior renewal's annual report missing?]
            → Waiting for annual report  (pre-activation HOLD; RA-overridable)
      → Active
  → Expired
Terminal off the review decision: Rejected · Withdrawn
```
- **Delinquent** is a **label** on an already-Active permit whose annual report is
  overdue — NOT a status.
- Display labels stay short ("Active", "Under review", …). `status` should become a
  typed union in production.

---

## 2. Role → permit-role eligibility

Who may hold which permit-role, by permit type. The constrained demo control and
the auto-reassignment on a type flip (§8.1) both key off this table.

| Role | Multi-district | Single-district |
|---|---|---|
| System Admin | RA or SA | RA or SA |
| HQ Technical Reviewer | RA or SA | **SA only** |
| District Lead | **SA only** | RA or SA |
| District Assistant | **SA only** | **SA only** |
| Researcher | — (not a reviewer permit-role) | — |

Consequences on a **single↔multi flip** (§8.1): the RA may become ineligible and
is **auto-reassigned** (multi→single ⇒ the remaining district's Lead; single→multi
⇒ an HQ reviewer).

---

## 3. Signer configuration (two-signature flow)
- **1st signer** = the **Responsible Agent** (always). Signing sends the permit
  **out for signature**.
- **2nd signer:**
  - **Multi-district:** one designated person on **Templates & Defaults**
    (`/admin/templates`); eligible = any **HQ admin or HQ reviewer**.
  - **Single-district:** the district's **default signer**, set per-district on
    **District management**; eligible = **any district member OR an external
    person by email** (no account required — notified via **DocuSign**).
- Mechanism: **DocuSign** integration ("signed in-system" = integrated
  e-signature, not generate-PDF→upload-signed).

---

## 4. Nav & page visibility

Hide the menu **and** guard the route (redirect / `no-access` notice) on direct
URL access.

| Nav item | Admin | HQ Tech | Dist Lead | Dist Assist | Researcher |
|---|:--:|:--:|:--:|:--:|:--:|
| Permits (full register) | ✓ | ✓ | ✓ | ✓ | ✗ |
| My permits | ✓ | ✓ | ✓ | ✓ | ✓ |
| Districts | ✓ | ✓ | ✓ | ✓ | ✓ |
| Catalogs (Resource tags, Special conditions) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Admin → District administration | ✓ | ✓ | ✓ | ✗ | ✗ |
| Admin → Dashboard, Users, Templates, Maintenance | ✓ | ✗ | ✗ | ✗ | ✗ |
| Help · Profile · Log out | ✓ | ✓ | ✓ | ✓ | ✓ |

- Admin menu is **partially filtered** (HQ Tech & District Lead see only District
  administration). Catalogs = internal users only. Researcher = reduced nav.
- Public (`anon`) users: only the **public registry** (`/search`) + public permit
  view (§7).

---

## 5. Internal Review (IR) permission model

The IR is the permit detail body. Access resolves as **role × permit-role ×
status × permit-type**. The reviewer **core** below is conditioned on permit-role;
role **overlays** (§5.2) adjust read-scope and the admin super-user case.

### 5.1 Global gates (apply before any cell)
- **Draft** → application is the applicant's; **all reviewers: CA**.
- **Waiting for review** → form is **Read** for eligible reviewers; **Start review**
  action shows for the **RA only**; the rest of the IR is **gated** (read-only)
  until review starts.
- **Under review** → IR editing unlocked per the core table (the review gate
  `permit-review-started-${id}` is now the Waiting-for-review → Under-review
  transition).
- **Returned to submitter** → reviewer updates are **Disabled** (permit is with the
  researcher) except Tags, Internal Notes, Supporting Documents.
- **Withdrawn** → district reviewers: **CA**; HQ/Admin: Read.
- **Researcher** → IR is **CA** in every status (§6).

### 5.2 Role overlays
| Role | Read scope | Update rights | Notes |
|---|---|---|---|
| **System Admin** | Read Any | **Update Any** (super-user); may edit form info even when Active | Not bound by permit-role conditions |
| **HQ Technical Reviewer** | **Read Any** (statewide) | Conditioned on permit-role (U if RA / U if SA) | Cannot access Draft |
| **District Lead** | Read Any for most sections; **Read if assigned** for Dates/CEQA & signing sections | Conditioned on permit-role | Multi: SA only ⇒ no RA-gated updates. No access to Draft/Withdrawn |
| **District Assistant** | Same scoping as Lead but **SA only** always | SA-gated updates only (e.g. docs, district SC during review) | No access to Draft/Withdrawn |

### 5.3 Reviewer core — IR section × status (conditioned on permit-role)

Columns are the statuses where the IR is reachable. *WfR* = Waiting for review,
*UR* = Under review, *Ret* = Returned to submitter, *OfS* = Out for signature,
*WfAR* = Waiting for annual report, *Act* = Active, *Exp* = Expired.

| IR section | WfR | UR | Ret | OfS | WfAR | Act | Exp |
|---|---|---|---|---|---|---|---|
| **Form (application)** | R | R · U if RA | R · D | R | R · Upload annual report | R · Upload annual report | R |
| **Start review** (RA) | Show to RA | (done) | H | H | H | H | H |
| **Supporting review** (SA, *informational*) | H | Show/Start–Complete if SA | H | H | H | H | H |
| **Responsible Agent** (assignment) | R | R · U if RA | R | R | R | R | R |
| **Supporting Agents** (assignment) | R | R · U if RA | R | R | R | R · U if RA | R |
| **Tags** | R | R · U | R · U | R · U | R · U | R · U | R · U |
| **Dates / CEQA** (CEQA = Yes/N-A radio) | R | R · U if RA | R · D | R | R | R | R |
| **Approve permit** (→ decision) | H | Show · U if RA · H if not RA | D if RA · H if not | H | H | H | H |
| **Return to researcher** | H | U if RA · H if not RA | D if RA · H if not | H | H | H | H |
| **Reject application** | H | U if RA · H if not RA | D if RA · H if not | H | H | H | H |
| **Sign permit** (see §8.2) | H | U if RA (1st sig → OfS) | H | U if 2nd signer (→ Active) | H | H | H |
| **Supporting Documents** | R | R · U if RA · U if SA | R · U | R · U | R · U | R · U | R · U |
| **Internal Notes** | R | R · U (any reviewer) | R · U | R · U | R · U | R · U | R · U |
| **HQ Special conditions** | R | R · U if RA · U if SA | R · U if RA/SA | R | R | R | R |
| **District Special conditions** | R | R · U if RA · U if SA | R · U if RA/SA | R | R | R | R |
| **Parks** (see §8.1) | R | **U if RA or Admin** | R · D | R | R | R | R |

Notes:
- **Removed vs spec:** "Generate unsigned permit" and "Upload signed active permit"
  rows are gone — replaced by **Sign permit** (in-system DocuSign, §8.2).
- **CEQA** collapses into the Dates/CEQA row as a single **Yes / N-A radio**.
- **Internal Notes** are updatable by any reviewer with access (not permit-role
  gated), matching the spec's "Update Any".
- **Supporting review** is **informational** — it never blocks the RA's decision.
- District reviewers read **Dates/CEQA** and signing sections only **if assigned**
  (RA/SA); HQ/Admin read them for any permit.

---

## 6. Researcher permissions

Researcher sees a permit **only if** the identity matches its `submitter`,
`principalInvestigator`, or `picof`. The **entire IR is CA** in every status.

| Section | Draft | WfR | UR | Ret | Act | Exp | Rejected | Withdrawn |
|---|---|---|---|---|---|---|---|---|
| Form / application | C·R·U·Withdraw | R | R | U · Withdraw | R | R | R | Hide record |
| Internal Review (all) | CA | CA | CA | CA | CA | CA | CA | CA |

*(C = Create. "Own records only" applies to every cell.)*

---

## 7. Public view (Active / Expired only)

Truly public (`anon` included), via `/search` as a public registry. **Summary
only, no PII.**

| Shown (non-PII) | Hidden |
|---|---|
| Permit #, project title, **organization**, park(s)/district(s), permit type, category, project start/end, permit start/end, status | **PI / PICOF / research team / submitter names** (all person names); entire Internal Review; issued terms/conditions; signed permit PDF |

Never public: Draft, Waiting for review, Under review, Returned, Out for signature,
Waiting for annual report, Rejected, Withdrawn.

---

## 8. Cross-cutting workflows

### 8.1 Editable parks + single↔multi flip
- **Who:** Responsible Agent **or** System Admin only (HQ cannot unless they are
  the RA). Editable only in **pre-decision** statuses (Draft / Waiting for review /
  Under review / Returned).
- **On add/remove that changes district span:** a **confirmation dialog** precedes
  commit. On Confirm, atomically: update parks → recompute & store permit type →
  reassign agents:
  - **Type flip** ⇒ **auto-reassign the RA** (system decides; editor cannot pick,
    only is informed): multi→single ⇒ remaining district's **Lead**; single→multi
    ⇒ an **HQ reviewer**. *(Prototype: pick a random eligible HQ reviewer when >1.
    Production has an established HQ tiebreak business rule — not replicated here.)*
  - **Outgoing RA** → demoted to **SA** if still district-relevant, else removed.
  - **Dropped district** (no parks left) ⇒ remove that district's **Supporting
    Agents** and its **Special Conditions**.
- Dialog states: the type change, the new RA, "you will no longer be the
  Responsible Agent" (if editor is outgoing RA), and any removals.

### 8.2 Two-signature activation
1. RA completes review & **approves** → **signs (1st)** → status **Out for
   signature**; DocuSign request sent to the **2nd signer** (§3).
2. **2nd signer signs** → status **Active** — **unless** the prior renewal's annual
   report is missing → **Waiting for annual report** hold.

### 8.3 Waiting-for-annual-report hold
- Trigger: a **renewal** whose **previous version has no annual report**.
- Effect: permit is **held** — not Active, **no active-permit emails** fire.
- Release: the missing annual report is provided, **or** a reviewer **overrides**
  the hold → Active. (RA/Admin override; own workflow.)

---

## 9. Open implementation notes
- HQ Responsible Agent tiebreak on a single→multi flip (§8.1): **prototype =
  random**; production uses its existing HQ tiebreak business rule.
- Make `status` a typed union (production hardening).
- "One permit-role per permit" — enforce as a real constraint in production (the
  prototype's single-select control is sufficient for the demo).
