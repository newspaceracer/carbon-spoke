# Reviewer comments — @-mentions & mention notifications

Stories for **@-mentioning** existing users in a permit's internal reviewer
comment thread, and **notifying** a mentioned user by email that they were
mentioned.

This intersects two existing docs: notification opt-out behavior lives in
[`stories-notification-preferences.md`](stories-notification-preferences.md), and
email templates/copy live in [`email-copy-notifications.md`](email-copy-notifications.md).
A real build needs a new mention email template registered there.

---

## Story 1 — Mention an existing user in a reviewer comment with "@"

**Story Title**
Mention an existing user in a reviewer comment with an @ picker

---

**Description**

As an internal reviewer commenting on a permit,
I want to type "@" in a comment and pick an existing user from the directory,
So that I can direct a comment at a specific teammate and make it clear who I am
asking to weigh in.

Typing "@" in the comment composer opens a picker of existing users; choosing one
inserts a mention token into the comment. On posting, mentions render as
highlighted tokens in the thread. Notifying the mentioned users is Story 2.

**Roles affected:** System Admin, HQ Technical Reviewer, District Lead Technical
Reviewer, District Assistant Technical Reviewer (as comment authors); any existing
user is mentionable.

**Out of scope:** The notification email sent to a mentioned user — see Story 2.
Mentions in researcher-facing messages — the comment thread is internal only.

---

**Acceptance Criteria**

**Access & permissions**
- Only users who can post to the permit's internal reviewer comment thread can
  create mentions.
- The mention picker offers existing system users from the user directory.

**Happy path**
- Typing "@" followed by text in the comment composer opens a suggestion list of
  users whose name matches the typed text.
- Each suggestion shows the user's name and a secondary detail (their division or
  district) to disambiguate similar names.
- Selecting a suggestion — by click, or by keyboard (Arrow keys to move, Enter to
  choose) — inserts the user's mention into the comment; Escape dismisses the list
  without choosing.
- On posting, each mention renders as a visually distinct token in the posted
  comment.

**UI & field details**
- The composer placeholder indicates the affordance (e.g. "…type @ to mention
  someone").
- A mention token is styled distinctly from body text (e.g. link color, medium
  weight) so it reads as a reference, not prose.

**Edge cases & constraints**
- The picker does not trigger inside an email-like string (e.g. "a@b") — only when
  "@" starts a new token.
- Typing "@" with no matching user shows no suggestions and inserts nothing special.
- The set of people notified on post is derived from the mentions actually present
  in the submitted text (Story 2), so deleting a mention before posting excludes
  that person.

---

**Testing notes**

- **Test 1 — Pick a user:** In a reviewer comment, type "@" and a partial name.
  Confirm matching users appear with name + detail, and choosing one inserts the
  mention.
- **Test 2 — Keyboard:** Repeat using only the keyboard (Arrow keys + Enter);
  confirm Escape dismisses without inserting.
- **Test 3 — Render:** Post a comment containing two mentions; confirm both render
  as distinct tokens in the thread.

---

**Open questions**
- [ ] Should the picker be scoped to users relevant to this permit (its analysis
  team) with an option to reach the full directory, or the full directory always?
- [ ] Can a researcher (applicant) ever be mentioned, or are mentions limited to
  internal reviewer accounts?

---

## Story 2 — Email a user when they are mentioned in a comment

**Story Title**
Notify a user by email when they are mentioned in a comment

---

**Description**

As a mentioned user,
I want an email letting me know I was mentioned in a permit's reviewer comment,
So that I find out I was asked to weigh in without having to monitor every permit's
thread.

When a comment is posted, each user mentioned in it receives an email notification.
This is an internal-reviewer notification and should follow the same opt-out model
as other optional internal emails.

**Roles affected:** The comment author (any internal reviewer); the mentioned users
(any existing internal reviewer account); System Admin.

**Out of scope:** Creating the mention itself — see Story 1. Real email delivery
infrastructure. Researcher-facing notifications.

---

**Acceptance Criteria**

**Happy path**
- When a comment is posted, the system sends a mention notification email to each
  distinct user mentioned in the posted comment.
- The email identifies the permit (number and project title), who mentioned them,
  and links to the comment thread.
- A confirmation is shown to the author indicating who was notified.

**Notifications**
- Each mentioned user (by name/role) is a recipient; the author is not emailed for
  their own mention.
- The email respects the recipient's notification preferences: it is an optional
  internal notification a user can opt out of (see
  `stories-notification-preferences.md`).
- The email is not regulated researcher-facing copy; it uses the internal
  notification pattern.

**Edge cases & constraints**
- A user mentioned more than once in the same comment is emailed once.
- If the author mentions themselves, no email is sent to the author.
- A mention that is removed from the comment before posting does not send an email.
- If the mentioned user has opted out of mention notifications, no email is sent.

---

**Testing notes**

- **Environment note:** All emails in the QA environment route to a shared ESA
  inbox. Notify the ESA team before testing so the email can be forwarded for
  verification. Do not test against real user email addresses in QA.
- **Test 1 — Single mention:** Post a comment mentioning one user. Confirm exactly
  one mention email is sent to that user, naming the permit and author.
- **Test 2 — Dedupe & self:** Post a comment mentioning the same user twice and the
  author themselves. Confirm the mentioned user gets exactly one email and the
  author gets none.
- **Test 3 — Opt-out:** With the mentioned user opted out of mention notifications,
  post a mention. Confirm no email is sent.

---

**Open questions**
- [ ] What is the full email body copy for a mention notification? A template must
  be added to `email-copy-notifications.md` (subject, body, recipients, and which
  notification preference governs it).
- [ ] Which notification preference governs this email — a new "Mentions" toggle,
  or an existing category — and is it on by default?
- [ ] Is a mention notification suppressed once the permit is in a terminal status
  (Rejected / Withdrawn / Expired), or always sent?
