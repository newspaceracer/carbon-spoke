# Roles & Permissions — Decision Log

Working tracker for aligning the build with the permissions spec. Update as we
talk through each finding. **Status legend:** ✅ settled · 🔲 open · ➖ absorbed
by another decision.

**Companion docs:** [`permissions-matrix.md`](./permissions-matrix.md)
(implementation reference), [`stories-roles-permissions.md`](./stories-roles-permissions.md)
(build tickets, Stories 1–17), [`email-copy-notifications.md`](./email-copy-notifications.md)
(notification copy EM-A…EM-H).

**Notifications ✅:** email copy written for all triggers (EM-A…EM-I). Templates are
**managed on Templates & Defaults** (Story 16) and **opt-in/out on Profile** (Story
17), except regulated researcher-facing emails (EM-C/D/E/H) which are always sent.
Start review sends no email. The **Profile-preference → email mapping** is the
table in `email-copy-notifications.md` (Assignment changes → EM-F/G · Signature
requests → EM-A · Status changes → EM-I · Application decisions & updates → EM-C/D/E/H,
always on).

## Source of truth (the spec)
- Confluence export: **"Test of User roles and permissions documentation
  (Responsible/Supporting Agents Version)"**, last updated 5/13/25.
- Local copy of the doc: `~/Downloads/Test+of+User+roles+and+permissions+documentation+(Responsible_Supporting+Agents+Version).doc`
  (Confluence MHTML; decoded text was extracted during the audit).
- The spec defines a matrix: **`role × permit-role × status × (multi | single-district)`
  → per-IR-section {Read | Update | Hide | Disabled}**.

## Spec vocabulary (for reference)
- **User roles (5):** System Admin, HQ Technical Reviewer, District Lead
  Technical Reviewer, District Assistant Technical Reviewer, Researcher.
- **Permit-roles (per permit, exactly one):** Responsible Agent, Supporting Agent.
- **Permit statuses (8):** Draft, In Review, Sent back to researcher, Active
  Permit, Expired Permit, Rejected Application, Waiting for Annual Report
  (Renewal only), Withdrawn Permit.
- **Permit type axis:** Multi-district vs Single-district.
- **IR sections:** Responsible Agent, Supporting Agents, Tags, Dates/CEQA,
  Generate unsigned permit, Upload signed active permit, Approve Permit, Return
  to researcher, Reject Application, Supporting Documents, Internal Notes, HQ
  Special conditions, District Special conditions; plus a "Start/complete
  supporting review" button and the Form + left nav.
- **Role → permit-role eligibility:**
  - System Admin: Responsible or Supporting, multi **and** single.
  - HQ Technical Reviewer: Responsible or Supporting on **multi**; **Supporting
    only** on single.
  - District Lead: **Supporting** on multi; Responsible or Supporting on single.
  - District Assistant: **Supporting only**, multi and single.
  - Researcher: unchanged in all scenarios (scoped to own records as PI/PICOF/submitter).

---

## Core architectural decision — Prototype identity is the single global actor ✅

The `demo-identity` switcher (`readIdentity()` in `src/lib/maintenance.ts`) is
the **sole** source of "who am I" on **every** page, including the permit detail
page. Prototype-only affordance for viewing the app as each user type — **not**
real auth.

**Two-layer actor model:**
1. **Prototype identity (global):** sets the **user role** — admin /
   hq-technical / district-lead / district-assistant / researcher (+ pending /
   anon for auth states).
2. **Per-permit demo control (local to each permit):** sets the **permit-role**
   on that permit — Responsible Agent / Supporting Agent / Not assigned.

Together they resolve the full matrix; status and district-span come from the
permit data.

---

## Findings & decisions

### 1. Permit-role (Responsible vs Supporting) is never enforced ✅ SETTLED
- **Problem:** editability on `permit.astro` is gated only by status + the global
  "Start review" toggle; signed-in user is a hardcoded display name
  (`permit.astro:74`); no permit-role check anywhere.
- **Decision:** implement it via the two-layer actor model above. Prototype
  identity must work **perfectly** and everywhere — it's the prototype's way to
  test how each user type sees the app.
- **Sub-decisions:**
  - Per-permit demo control offers **Responsible / Supporting / Not assigned**.
  - **CONSTRAINED**, not free override: it only offers permit-roles the current
    identity is eligible for on this permit type (District Assistant → Supporting
    only; HQ → not Responsible on single-district; District Lead → Responsible on
    single, Supporting on multi). Doubles as a live check of the eligibility
    rules; naturally enforces "one permit-role per permit."
  - Marked as a **prototype/testing** affordance (same treatment as the identity
    switcher), not real UI chrome.
  - **Persisted per-permit** in localStorage, e.g. `demo-permit-role-${id}`
    (mirrors the existing `permit-review-started-${id}` pattern).
  - Lives on the permit page near the top / in the same demo toolbar as the
    identity switcher.

### 2. "Acting as" scope is self-selected, not derived from identity ✅ SETTLED
- **Problem:** special-conditions editing keys off a user-pickable "Acting as"
  dropdown defaulting to HQ (`permit.astro:455-467, 1071-1073`); anyone can act
  as HQ or any district. Script doesn't even import `readIdentity()`.
- **Decision:** **remove the "Acting as" dropdown** (and any similar secondary
  actor control on any page). Scope derives from the prototype identity +
  `editableDistricts()`/`curatableDistricts()` intersected with the permit's
  districts. One global actor, no per-page overrides.

### 3. Role-based enforcement missing on permits + nav ungated ✅ SETTLED
- **Problem:** `readIdentity()` gating exists only on `special-conditions.astro`
  and `manage-district.astro`. The permit IR ignores identity, and
  `PermitNav.astro` renders Admin/Users/Districts menus to every identity.
- **Decision:** **yes, do this.**
  - Permit-IR half is already covered by decision #1 (identity is the global
    actor; IR enforcement flows from role × permit-role × status).
  - **Nav + page gating:** the top nav (`PermitNav.astro`) and admin/catalog
    pages hide/block based on the prototype identity. Reuse the existing guard +
    `no-access` notice pattern (cf. `enforcePending`, special-conditions
    no-access). **Hide the menu AND guard direct URL access** so identity behaves
    "perfectly."

  **Nav visibility map (finalized):**

  | Nav item | Admin | HQ Tech | Dist Lead | Dist Assist | Researcher |
  |---|:--:|:--:|:--:|:--:|:--:|
  | Permits (full register) | ✓ | ✓ | ✓ | ✓ | ✗ |
  | My permits | ✓ | ✓ | ✓ | ✓ | ✓ |
  | Districts | ✓ | ✓ | ✓ | ✓ | ✓ |
  | Catalogs (Resource tags, Special conditions) | ✓ | ✓ | ✓ | ✓ | ✗ |
  | Admin → **District administration** | ✓ | ✓ | ✓ | ✗ | ✗ |
  | Admin → Dashboard, Users, Templates, Maintenance | ✓ | ✗ | ✗ | ✗ | ✗ |
  | Help, Profile, Log out | ✓ | ✓ | ✓ | ✓ | ✓ |

  Notes:
  - The **Admin menu is partially filtered**: Admin sees all 5 items; HQ Tech and
    District Lead see **only** District administration; District Assistant sees no
    Admin menu.
  - **Catalogs = all internal users** (the 4 reviewer roles incl. admin), never
    researchers or public.
  - **Researcher** top nav is reduced to: My permits, Districts, Help, Profile,
    Log out (no full Permits register, no Catalogs, no Admin).

### 4. "One permit-role per permit" not enforced ✅ SETTLED
- **Decision:** **not built into the prototype** (the single-select constrained
  per-permit control already prevents holding two roles at once). **Must be
  documented as a production requirement** — production needs a real
  type/DB-level constraint that a user holds at most one permit-role per permit.

### Absorbed by decisions 1 & 2
- ➖ **Role → permit-role eligibility rules not encoded** — the constrained
  control *is* the encoding of the eligibility table.
- ➖ **`district-assistant` missing from the `Identity` union**
  (`maintenance.ts:45-52`) — must be added so the switcher covers every role.

### 5. Role taxonomy naming ✅ SETTLED
- **Decision:**
  - **Rename display label `Admin` → `System Admin`** to match the spec (value
    stays `admin`; `accountRoleOptions` in `src/data/user.ts`). Standardize the
    demo switcher's "HQ system admin" to the same "System admin" wording so the
    two don't drift.
  - **Researcher stays an identity only**, NOT an assignable account role
    (correct as-is: researchers are external self-registered applicants, not a
    permission a reviewer is granted). Leave the taxonomy split.

### 7. Status vocabulary ✅ SETTLED
- **NEW STATUS — "Waiting for review"** ✅: sits **between Draft and Under
  review**. Semantics: application has been **submitted** but the lead/responsible
  reviewer has **not yet clicked "Start review."** Clicking Start review
  transitions **Waiting for review → Under review** and flips the existing
  `permit-review-started-${id}` gate. Only the **responsible agent** can start
  review. This promotes the Kanban "Submitted / Awaiting review" lane to a
  first-class status and turns the review gate into a real status transition
  (refines [[permit-review-started-gate]], where Start review was previously a
  phase *within* Under review). Full status order:
  Draft → **Waiting for review** → Under review → (Returned to submitter ⇄ Under
  review) → decision (Out for signature / Rejected / Withdrawn) → Active → Expired.
- **"Out for signature"** ✅: a real status **between Under review and Active**.
  A permit can only become **Active once it has been signed**. Path: Under review
  → Out for signature → (signed) → Active.
- **"Waiting for annual report" — redefined** ✅: a **pre-activation HOLD**, NOT
  "an active permit that's overdue." Applies to a **renewal whose previous permit
  version never had its annual report submitted** → the new permit **cannot be
  validated**, so it is **held**: even if signed and ready, it does **not** become
  Active and the **active-permit emails/notifications do not fire**. It is **its
  own workflow** — reviewers can **override the hold** and move it to Active
  regardless, or it clears when the missing annual report is provided.
  - **Delinquent is NOT a status** ✅ — it's a **label/badge on the original
    (already-Active) permit** whose annual report is overdue. Distinct from
    "Waiting for annual report" (the pre-activation hold on the renewal). The two
    coexist; the current `delinquent` Kanban lane stays as a *label*, not a
    workflow state.
  - Supersedes earlier question B (precedence) — it's a distinct state *before*
    Active, not an overlay on it.

- **Activation fork:**
  `… → Out for signature → (signed) → [prior version's annual report missing? →
  Waiting for annual report → (provided OR reviewer override) → Active] else →
  Active → Expired`

- **Full status order (9+):** Draft → Waiting for review → Under review →
  (Returned to submitter ⇄ Under review) → Out for signature →
  {Waiting for annual report → } Active → Expired; plus terminal Rejected /
  Withdrawn off the review decision.

- **Display strings** ✅: keep the code's **short labels** ("Active", "Under
  review", "Withdrawn", …); map the spec's verbose wording onto them (do NOT adopt
  "Active Permit" / "In Review" / etc.).
- **Typed statuses** ✅: recorded as an **optional production-hardening note**
  (make `status` a typed union of the ~9 allowed values instead of loose `string`);
  nothing built into the prototype.

### IR section gaps ✅ SETTLED
1. **Supporting review — BUILD** ✅: add a **Start / Complete supporting review**
   action, visible **only to a Supporting Agent when assigned**, during Under
   review. Separate from the lead's "Start review" (which is the Waiting for review
   → Under review transition). Detail-permit history already implies a sequence
   (Responsible agent review completed → Supporting agents review completed).
   - **Sequencing: INFORMATIONAL** ✅ — supporting agents record their review, but
     it does **not gate** the responsible agent, who can proceed to a decision
     whenever they choose regardless of whether supporting reviews are complete.
2. **CEQA — BUILD (minimal)** ✅: CEQA is just a **radio: Yes / N/A** within the
   Dates/CEQA section. Not the dropped write-only version — a simple two-option
   radio.
3. **Generate unsigned permit / Upload signed active permit — REMOVED** ✅: these
   **will not exist**. Everything is **signed in-system** (digital signing within
   the app), so there's no generate-unsigned-then-upload-signed round trip.
   - ⤳ Ripples into the activation fork: **Out for signature → (in-system
     signature) → Active**. No PDF upload step.
4. **`PermitSection editable` "Make changes" button — REMOVED** ✅: no "Make
   changes" button anywhere. Reviewers now edit **live in the review wizard**.
   - ⤳ Refines [[edit-pattern-view-first]]: for the reviewer flow, editing happens
     inline in the review wizard rather than via a per-section Make-changes toggle.
### NEW — Signer permit-role + two-signature workflow ✅ SETTLED
- **New per-permit role/capability: `Signer`.** Permit-level roles are now
  **Responsible Agent, Supporting Agent, and Signer** (Signer is a permit-scoped
  capability, like the others — not a new account role).
- **Two signers per permit:**
  - **First signer = the Responsible Agent (always).** A Responsible Agent is
    always a Signer. They sign to **send the permit out for signature** → this is
    the transition into **Out for signature**.
  - **Second signer = another user in the system**, configured by permit type:
    - **Multi-district:** **one designated person**, configured on the **Templates
      & Defaults** page (`/admin/templates`). Eligible = **any HQ admin or HQ
      reviewer**.
    - **Single-district:** configured per-district on the **District management**
      page as that district's **default signer**. Eligible = **any district
      member, OR even a non-account person** — identified by **email**. They do
      **not** need a system account; the entered email is used to send them a
      **DocuSign** notification to sign. So single-district second signers can be
      external.
- **Signing mechanism = DocuSign (integrated).** This is what "signed in-system"
  means (IR gap #3): e-signature is integrated, not a manual generate-PDF →
  upload-signed round trip. Multi-district second signer is an HQ system user;
  single-district second signer may be external (email-only).
- **Activation flow (refined) ✅:** Responsible Agent completes review → **signs
  (1st)** → **Out for signature** (DocuSign sent to the 2nd signer) → **second
  signer signs (2nd)** → **Active** (subject to the Waiting-for-annual-report hold).
- **Demo control ✅:** the per-permit demo control **exposes "second signer"** as a
  viewable hat so the signing step can be tested (the second signer may not
  otherwise be a reviewer on the permit).
- **Config surfaces to add:** a **default second-signer** field on **Templates &
  Defaults** (multi-district; pick an HQ admin/reviewer) and a **default signer**
  field per district on **District management** (single-district; a district member
  or an external email).

### 8. Researcher PI/PICOF scoping ✅ SETTLED
- **Scope model** ✅: a researcher sees a permit **only if** the current identity
  matches its `submitter`, `principalInvestigator`, or `picof` (any of the three).
- **Capabilities on own records** ✅ (per spec Researcher table): Draft →
  Create/Read/Update/Withdraw; Sent back to researcher → Update + Withdraw; all
  other statuses (incl. the new **Waiting for review**, In Review, Active, Expired,
  Rejected, Withdrawn) → **Read only**; the entire **Internal Review section is
  Cannot Access** in every status.
- **Off own records** ✅: guard / no-access — **except** the public view below.

### NEW — Public view of Active/Expired permits ✅ SETTLED
- Active and Expired permits have a **public-facing view** — a limited read-only
  "public view" distinct from the full internal record. Overrides the researcher
  off-record guard for those two statuses.
- **Audience** ✅: **truly public / unauthenticated** (anon included), not just
  logged-in users.
- **Statuses** ✅: **Active + Expired only.** Never Draft / Waiting for review /
  Under review / Returned / Out for signature / Rejected / Withdrawn.
- **Entry point** ✅: the existing **`/search`** becomes a public registry — anyone
  can search and open the public view of an issued/expired permit.
- **Field set** ✅ — **summary only, NO PII:**
  - **Show:** permit #, project title, **organization**, park(s)/district(s),
    permit type, category, project start/end, permit start/end, status.
  - **Hide (PII):** **PI name, PICOF name, research team / participants, submitter
    name** — no person names at all.
  - **Hide (internal/output):** the entire Internal Review (analysis team, internal
    notes/comments, internal tags, uploaded documents, HQ/District special-
    conditions deliberation) **and** the issued terms/conditions + signed permit
    PDF (summary only — no conditions, no document).
### Multi- vs single-district axis + editable parks ✅ SETTLED (workflow TBD)
- **Stored attribute** ✅: multi/single becomes a **first-class stored field on
  every permit**, computed from the permit's parks (district span) at creation and
  whenever parks change. (Today it's derived only on the detail permit +
  `final-letter.astro`, absent from the 960 `PermitRow`s.)
- **Old lock rule DROPPED** ✅: the "single can't become multi / multi can only
  shrink" rule (`final-letter.astro:789`) no longer holds.
- **Editable parks** ✅: reviewers with appropriate permissions can **add and
  remove parks** on a permit. This can flip the permit **single ↔ multi**.
- **A flip is a managed transition** ✅ (details TBD):
  - Because eligibility depends on permit type, the **Responsible (lead) agent can
    change**: single→multi, a District Lead can no longer be Responsible
    (Supporting only on multi); multi→single, an HQ reviewer can no longer be
    Responsible (Supporting only on single).
  - The **previous lead loses the permissions** they held as Responsible Agent
    (likely demoted to Supporting if still district-relevant).
  - The change is **consequential → requires explicit confirmation** from the
    reviewer making it before it commits (modal confirm per design-principles:
    reserve confirms for consequential actions).
- **Transition workflow ✅ SETTLED:**
  1. **Who can edit parks:** only the **Responsible Agent** (the lead) + **System
     Admin**. HQ reviewers **cannot** edit parks unless they are the lead. Editable
     only in **pre-decision statuses** (Draft / Waiting for review / Under review /
     Returned to submitter) — not once Out for signature / Active / later.
  2. **New lead is AUTO-ASSIGNED by the system** — the editor does **not** pick and
     **cannot** choose the target. The dialog *informs* the editor who it will go
     to, but the assignment is deterministic per the eligibility rules:
     - multi→single: the **lead of the remaining district** becomes Responsible.
     - single→multi: an **HQ reviewer** becomes Responsible.
     - ⚙️ **Tiebreak ✅:** when >1 HQ reviewer is eligible (single→multi), the
       **prototype assigns at random**. Production already has an established HQ
       tiebreak business rule — not replicated in the prototype.
  3. **Confirmation dialog** (only on Confirm do parks + stored type + agent
     reassignments commit together) states: the type change; the auto-assigned new
     Responsible Agent; "you will no longer be the Responsible Agent" when the
     editor is the outgoing lead; and any removals from item 4.
  4. **Outgoing lead:** auto-demoted to **Supporting Agent** if still
     district-relevant on the new permit, else **removed**.
  5. **Dropped district (park removal empties a district):** that district's
     **Supporting Agents are removed**, AND that district's **Special Conditions
     are removed**.
     - ✅ VERIFIED (not handled today — this is net-new work): `final-letter.astro`
       already shows a **confirmation modal** when a district empties
       (`requestParksChange`, ~760-777) and re-derives permit type, BUT **nothing
       prunes special conditions** — they persist in `state.conditions` and in
       `permit-conditions-${permitId}` (localStorage). Plus a latent bug: the
       letter preview keys district-condition blocks off the **original seed**
       `data.districtKeys` (`final-letter.astro:1169-1175`), not the live parks, so
       a dropped district keeps printing "Special Conditions for X". Build the
       prune-on-drop + fix the preview to use live districts.
