# Phase 3 — Core Platform & Trust

Phase 3 turns the Phase 2 marketplace into a safer, more trustworthy platform.

## Smart matching

Deterministic, explainable scoring — no AI. `compute_teacher_match()` sums
weighted, independent factors (max 100):

| Factor        | Weight |
| ------------- | ------ |
| Subject       | 25     |
| Class         | 20     |
| Location      | 15     |
| Teaching mode | 10     |
| Budget        | 10     |
| Availability  | 5      |
| Experience    | 5      |
| Rating        | 5      |
| Verification  | 5      |

A tuition's top matches are surfaced via `match_teachers_for_tuition()` with a
`score` (rendered as "92% Match"), and teacher search can be sorted by
**Best Match** when a tuition context is provided. Teachers see their own
"match opportunities" via `match_tuitions_for_teacher()` (open tuitions
matching their subjects/classes, scored and paginated).

Teacher discovery also supports a **budget filter** (max expected salary),
alongside class, subject, location, gender, mode, experience, rating,
verification and availability.

## Schedule, reminders & attendance

- `sessions` table holds scheduled classes (scheduled/completed/cancelled/
  rescheduled) with optional attendance (present/absent).
- Teachers schedule classes for tuitions they own or have an accepted request on.
- Students/guardians see their active tuition schedule (daily/weekly).
- Database triggers send in-app reminders: **upcoming tuition**, **schedule
  change**, **cancelled class**.

## Lightweight messaging

- `conversations` (strictly two participants) + `messages` (sent/read).
- Unread counts, timestamps, realtime delivery (Realtime publication).
- Blocking (`blocks`) hides users from search and blocks new conversations.
- Strict RLS: only participants (or admins) can read/write a conversation.
- Conversations and messages can be reported.

## Reviews & ratings

- Students/guardians with an **accepted tuition interaction** can leave one
  1–5 review per teacher (unique constraint + server-side trigger).
- "Verified review" = tied to an accepted interaction.
- Ratings are denormalized onto `teacher_profiles.rating_avg/review_count`
  via a trigger (efficient reads, no per-request aggregation).
- Reviews can be reported; admins can hide / publish / remove.

## Teacher verification tiers

Deterministic ladder stored as boolean flags on `profiles`:

`unverified → phone → education → identity → trusted tutor`

Admin sets flags; the tier is derived by `verification_tier()`. Sensitive
verification documents are **never** stored or exposed.

## Child safety

- `profiles.is_minor` — minors' location is redacted from all public/read RPCs.
- `profiles.guardian_consent` + guardian → student linking.
- Phone numbers, addresses and contact details are never exposed publicly.
- Blocking, reporting (incl. "safety concern" category), admin moderation and
  a public `/safety` guidelines page.

## Reporting & moderation

`reports` table covers teacher / student / guardian / tuition / review /
conversation targets with categories (fake profile, harassment, inappropriate,
scam, spam, safety concern, other). Admins can investigate, resolve or dismiss.

## Notifications & preferences

Per-user `notification_preferences` row (created automatically on signup).
All notifications flow through a preference-aware `push_notification()` helper
to avoid excessive writes. Types: new match, new request, request response,
new message, upcoming class, schedule change, review received, verification
update.

## No-match alerts

`watch_requests` store a user's tuition criteria. When a teacher's profile is
created/updated and matches (score ≥ 40), the watcher is notified and the
watch is marked `notified`.

## Teacher reputation

Transparent indicators via `get_teacher_reputation()`: verification tier,
rating & review count, completed tuitions, response rate, cancellation rate.
No misleading composite "score".

## Security notes

- New tables all have RLS; writes re-check authorization server-side
  (`requireProfile` / `requireRole(["admin"])`).
- Matching/search RPCs are `security definer` with explicit field lists and
  exclude blocked users in both directions.
- Review authorization is enforced in the database (trigger), not just the UI.
- Message access is strictly participant-scoped in RLS.
