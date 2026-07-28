# Remove Controls — Consistency & Confirmation — Jira Stories

One story: standardize how a user removes an item across every console and
roster, and require a confirmation step before removing consequential records.

- **Story 1** — Standardize the remove control and confirm consequential removals

The Technical Reviewer sub-roles referenced are the same as in
`stories-district-administration.md`: **HQ Technical Reviewer**, **District Lead
Technical Reviewer**, **District Assistant Technical Reviewer**.

---

## Story 1 — Standardize the remove control and confirm consequential removals

**Story Title**
Standardize the remove control and confirm consequential removals

---

**Description**

As a CA State Parks Staff user,
I want every "remove" control to look and behave the same, and to confirm before
I remove something that other records depend on,
So that removals are predictable across the system and a single misclick can't
silently delete a shared or downstream record.

Today the same "remove a row" action is drawn three different ways (a trash
icon-button in the application rosters, a red text "Remove" button in the
district / conditions / tags consoles, and a chip dismiss for tags) and its
safety differs by page — removing a district member asks for confirmation, while
removing a special condition, a tag, or denying a role request deletes on the
first click. This story makes the control uniform and applies a single rule for
when a confirmation is required.

The rule: confirm a removal when it deletes a shared or downstream record that is
not re-added in place. Removals made on an editing surface that offers immediate
re-add (draft application rosters; the analysis-team roster, which sits beside its
own add-reviewer control) stay immediate — confirming them would also mean
stacking a modal on a modal, which this story explicitly avoids.

*Prototype note:* the prototype build simulates the signed-in role with a
developer-only identity switcher. In production, the acting role is the signed-in
user's actual account role.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer, Researcher (application rosters),
Principal Investigator (PI).

**Out of scope:** Button-size standardization and add/edit-label wording drift —
tracked separately in the UI audit backlog (CSPS-XXX). Changing which records are
editable versus removable — this story only governs the remove control and its
confirmation, not new remove capabilities. The chip-dismiss control on applied
permit tags (an interaction native to `cds-dismissible-tag`) is unchanged.

---

**Acceptance Criteria**

**UI & field details — the standard control**
- Every "remove a row" control is a ghost trash icon-button (Carbon
  `cds-icon-button`, `kind="ghost"`, `size="sm"`) with an accessible tooltip that
  names the target — "Remove Jane Doe", "Remove condition", "Remove reviewer",
  "Remove tag", "Remove member".
- The red text "Remove" buttons previously shown in the District administration,
  Special conditions, and Resource category tags consoles are replaced by the
  standard trash icon-button.
- Deny and Revoke in the Users console keep their distinct text labels — "Deny"
  and "Revoke" — because they are named actions, not a generic remove; they are
  not converted to the trash icon.

**Happy path — remove with confirmation**
- Removing a **district member**, a **special condition**, or a **resource
  category tag** opens a confirmation modal before anything is deleted.
- The confirmation modal states what is being removed and its consequence, and
  offers a "Cancel" action and a red confirm action labeled for the item —
  "Remove member", "Remove condition", "Remove tag".
- These confirmations all open from a base page, never from within another modal;
  no confirmation is ever stacked on top of an open modal.
- The item is removed only after the user selects the confirm action; selecting
  "Cancel" or dismissing the modal leaves the item in place.

**Happy path — deny / revoke with confirmation**
- Denying a role request opens a confirmation modal headed "Deny role request"
  with a red "Deny request" confirm action; the request is denied only on
  confirm.
- Revoking a pending invitation opens a confirmation modal headed "Revoke
  invitation" with a red "Revoke invitation" confirm action; the invitation is
  revoked only on confirm.

**State & status transitions**
- Removing a special condition takes it out of the catalog (or the permit) so it
  no longer attaches to new permits and does not print on the final letter.
- Removing a district member stops that member from being auto-assigned to
  permits and from being listed as a district contact.
- Denying a role request leaves the requester's current account role unchanged;
  revoking an invitation makes the invited person's sign-in link stop working.

**Edge cases & constraints — immediate (no confirmation) removals**
- Removing a **specimen type**, a **research participant**, or a **study-area
  park** during application entry removes it immediately with no confirmation,
  because these are draft rows the user just entered and can re-add in place.
- Removing an **analysis-team reviewer** removes them immediately and recomputes
  the review-progress meters; the add-reviewer control in the same modal re-adds
  anyone, so removal is reversible in place and is not confirmed (confirming it
  would stack a modal on the open analysis-team modal).
- These immediate removals still use the same ghost trash icon-button control, so
  the affordance is identical even though the confirmation step is not required.
- A remove control appears only where the signed-in role may edit the record; a
  read-only viewer (for example, a lead browsing another district's catalog) sees
  no remove control.

---

**Testing notes**

- **Test 1 — Control uniformity:** On District administration (members), Special
  conditions (conditions), Resource category tags (tags), the permit analysis
  team (reviewers), and the application rosters (participants, specimens, parks),
  confirm the remove control is the same ghost trash icon-button with a
  target-naming tooltip on every surface.
- **Test 2 — Consequential confirm + cancel:** For a member, condition, and tag,
  click the trash icon, cancel the modal, and confirm the item is still present.
  Repeat and confirm; verify the item is removed and its downstream effect applies
  (e.g. the condition no longer prints on the letter).
- **Test 3 — Deny / Revoke confirm:** In the Users console, deny a role request
  and revoke an invitation; confirm each shows its confirmation modal and only
  acts on confirm.
- **Test 4 — Immediate removals (no modal):** In a draft application, remove a
  specimen, a participant, and a park; in the permit analysis-team modal, remove a
  reviewer. Confirm each is removed immediately with no modal, and that no
  confirmation modal ever opens on top of the analysis-team modal.

---

**Open questions**
- [ ] Should removing an **applied permit tag** (the `cds-dismissible-tag` chip on
  the permit) also route through a confirmation, or is chip-dismiss acceptable as
  an immediate action for that surface?
- [ ] Is a special condition that has already printed on an issued (Active Permit)
  letter removable at all, or should the remove control be hidden once the permit
  is active?
- [ ] Should the removal actions record an audit entry (who removed what, when)
  for members, reviewers, and conditions, or is confirmation sufficient for the
  prototype scope?
