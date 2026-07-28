# Email Notification Copy

Canonical copy for every roles/permissions notification. Referenced by
[`stories-roles-permissions.md`](./stories-roles-permissions.md) (each email cited
by ID, e.g. **EM-C**) so the copy lives in exactly one place. These templates are
managed on **Templates & Defaults** (Story 16) and are opt-in/out per the **Profile
notification preferences** (Story 17), except where marked **Regulated (always
sent)**.

All regulated emails close with the standard NRD signature block:

```
Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

Placeholders in `[brackets]` are merged at send time. Copy follows the 3 C's
(clarity > concision > character), front-loaded.

---

## Notification preferences → email mapping

This is the authoritative mapping between each **Profile** notification preference
(Story 17) and the emails it controls. A toggleable preference set to off
suppresses only that user's copy of its emails; other recipients still receive
them. Regulated preferences are shown in Profile but cannot be turned off.

| Profile preference | Persona | Controls emails | Default | Toggleable? |
|---|---|---|---|---|
| **Assignment changes** | Internal reviewer | EM-F (assigned), EM-G (unassigned) | On | Yes |
| **Signature requests** | Internal reviewer | EM-A (internal signer request) | On | Yes |
| **Status changes** (permits I review) | Internal reviewer | EM-I (status change) | On | Yes |
| **Application decisions & updates** *(regulated)* | Researcher | EM-C (issued), EM-D (returned), EM-E (rejected), EM-H (hold) | On | **No — always sent** |

Not mapped to any preference (no Profile / always sent):
- **EM-B** (external second-signer request) — the external signer has no account,
  so there is no Profile toggle; always sent.

---

## EM-A — Second-signer signature request (internal signer)
- **Trigger:** permit enters Out for signature; second signer is a system user.
- **Recipients:** the configured Second Signer.
- **Category:** Actionable · opt-out allowed (Profile: "Signature requests").

**Subject:** Signature requested — research permit [Permit #]

```
[First name],

A research permit is ready for your signature as the second signer.

Permit:            [Permit #] — [Project title]
District(s):       [District(s)]
Responsible Agent: [Responsible Agent name] (first signature complete)

Review and sign in DocuSign. The permit becomes active once your
signature is recorded.

[Review and sign]

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-B — Second-signer signature request (external signer, no account)
- **Trigger:** permit enters Out for signature; second signer is an external email.
- **Recipients:** the district's configured external default signer.
- **Category:** Actionable · always sent (external signer has no Profile).

**Subject:** Signature requested — California State Parks research permit [Permit #]

```
Hello,

California State Parks has requested your signature on a research permit
as the designated second signer.

Permit:      [Permit #] — [Project title]
District(s): [District(s)]

Use the link below to review and sign in DocuSign. You do not need an
account. The permit takes effect once your signature is recorded.

[Review and sign]

If you were not expecting this request, contact nrd.research@parks.ca.gov.

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-C — Permit issued / active
- **Trigger:** permit becomes Active (both signatures; hold, if any, cleared).
- **Recipients:** Researcher (submitter), Principal Investigator (PI), PICOF.
- **Category:** **Regulated (always sent).**

**Subject:** Your research permit [Permit #] is now active

```
[PI name],

Your research permit is now active.

Permit:  [Permit #] — [Project title]
Term:    [Permit start] – [Permit end]
Park(s): [Park(s)]

You may begin the authorized work within the permit term and its
conditions. A copy of the permit is available in your account.

Report any change to your project before it occurs. An annual report is
required as specified in your permit.

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-D — Application returned to researcher
- **Trigger:** Responsible Agent returns the application (→ Returned to submitter).
- **Recipients:** Researcher (submitter), PI, PICOF.
- **Category:** **Regulated (always sent).**

**Subject:** Action needed — research permit application [Permit #] returned for changes

```
[PI name],

Your research permit application has been returned for changes.

Application: [Permit #] — [Project title]

Review the requested changes, update your application, and resubmit.
Reviewer notes are available in your account.

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-E — Application rejected
- **Trigger:** Responsible Agent rejects the application (→ Rejected).
- **Recipients:** Researcher (submitter), PI, PICOF.
- **Category:** **Regulated (always sent).**

**Subject:** Decision on your research permit application [Permit #]

```
[PI name],

After review, your research permit application has not been approved.

Application: [Permit #] — [Project title]

The reasons for this decision are available in your account. If you have
questions, contact nrd.research@parks.ca.gov.

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-F — Responsible Agent assigned (incoming)
- **Trigger:** a user becomes the Responsible Agent (assignment or type-flip
  reassignment, Story 8).
- **Recipients:** the new Responsible Agent.
- **Category:** Informational · opt-out allowed (Profile: "Assignment changes").

**Subject:** You are the Responsible Agent for permit [Permit #]

```
[First name],

You are now the Responsible Agent for a research permit.

Permit: [Permit #] — [Project title]
Type:   [Single/Multi]-district
Status: [Status]

As Responsible Agent you lead the review and are the first signer.

[Open permit]

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-G — Responsible Agent unassigned (outgoing)
- **Trigger:** a user is removed as Responsible Agent (type-flip reassignment,
  Story 8).
- **Recipients:** the outgoing Responsible Agent.
- **Category:** Informational · opt-out allowed (Profile: "Assignment changes").

**Subject:** You are no longer the Responsible Agent for permit [Permit #]

```
[First name],

Your role on permit [Permit #] — [Project title] has changed because the
permit's districts changed. You are no longer the Responsible Agent.

[You remain a Supporting Agent on this permit. / You no longer have a role
on this permit.]

No action is needed.

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-H — Renewal placed on hold (annual report required)
- **Trigger:** a renewal would become Active but the prior version's annual report
  is missing (→ Waiting for annual report).
- **Recipients:** Researcher (submitter), PI, PICOF.
- **Category:** **Regulated (always sent).**

**Subject:** Annual report required before permit [Permit #] can be issued

```
[PI name],

Your renewal permit is ready but is on hold. The annual report for your
previous permit has not been received, so the new permit cannot be issued
yet.

Permit: [Permit #] — [Project title]

Submit the outstanding annual report to release the hold. Once it is
received, the permit will be issued.

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## EM-I — Status change on a permit you review
- **Trigger:** a permit changes status; sent to its assigned reviewers.
- **Recipients:** the permit's Responsible Agent and Supporting Agents.
- **Category:** Informational · opt-out allowed (Profile: "Status changes").

**Subject:** Status update — permit [Permit #] is now [Status]

```
[First name],

A permit you review has changed status.

Permit:     [Permit #] — [Project title]
New status: [Status]
Your role:  [Responsible Agent / Supporting Agent]

[Open permit]

Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov
```

---

## Notes
- **Hold release / override → Active** reuses **EM-C** (the permit-issued email).
- **Start review** (Story 5) sends **no email** — internal state change only.
- Regulated researcher-facing emails (EM-C, D, E, H) are **always sent** and are
  not opt-out in Profile; only their template text is editable on Templates &
  Defaults.
