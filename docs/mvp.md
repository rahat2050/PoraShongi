# Phase 2 — MVP Marketplace: data model & flows

## Entities

| Table              | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `profiles`         | Base profile (role, name, avatar, location, phone, status)     |
| `student_profiles` | Class, group, subjects, mode, budget, days, time               |
| `teacher_profiles` | Education, subjects, classes, experience, mode, fee, availability |
| `guardian_profiles`| Relationship, contact preference, linked student               |
| `tuitions`         | Tuition requirements/posts (title, class, subject, budget, …)  |
| `tuition_requests` | Student/guardian → teacher requests (pending/accepted/rejected/withdrawn) |
| `favorites`        | Saved teachers (unique per user+teacher)                       |
| `notifications`    | In-app notifications (new request, accepted, rejected)         |

## Core flows

### Student / guardian
1. Register and complete profile.
2. Create a tuition requirement (`/dashboard/tuitions/new`).
3. Search teachers (`/teachers`) with filters.
4. View a teacher profile (`/teachers/[id]`).
5. Send a tuition request (choose one of their open tuitions + message).
6. Track request status in `/dashboard/requests` and notifications.

### Teacher
1. Register and complete profile (`/profile`).
2. Browse tuition requirements (`/tuitions`).
3. Receive requests and **accept / reject** them (`/dashboard/requests`).
4. Manage own listings — pause / complete / close / delete.

### Guardian
1. Register, link a student in `/profile`.
2. Create and manage tuition requirements for the linked student.
3. Send requests and track their status.

## Key invariants

- **Duplicate prevention** — a unique partial index blocks two *active*
  requests for the same (tuition, teacher, sender).
- **Role safety** — DB triggers ensure requests are only sent by
  students/guardians to teachers; users cannot change their own role.
- **Status transitions** — requests only move `pending → accepted | rejected |
  withdrawn` (enforced by a trigger).
- **Tuition auto-assign** — accepting a request sets the tuition status to
  `assigned`.
- **Pagination everywhere** — searches and admin lists use `limit/offset`
  (capped page size) and never load full tables.

## Security (RLS)

- Users can only read/update their own profile, requests, favorites and
  notifications.
- Tuitions are readable by all authenticated users (marketplace listing), but
  only the poster (or an admin) can insert/update/delete.
- Requests are visible only to the sender, teacher, linked student or admin.
- Admin operations are protected by `requireRole(["admin"])` server-side and
  the `is_admin()` RLS helper in the database.
- Public teacher search runs through `security definer` RPCs that return an
  explicit field list — email and phone are never exposed.
