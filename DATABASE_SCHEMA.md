TASKFLIX — Database Schema

1. Purpose

This document defines the planned cloud database structure and security requirements for TASKFLIX.

This is a design document. It does not mean the database has already been created or tested.

2. Database Technology

- Database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- Authorization: PostgreSQL Row Level Security (RLS).
- Task data must be stored in the cloud, not localStorage.

3. Planned Tables

A. profiles

Purpose: Store minimal application-specific user information.

Planned fields:

- id: UUID, linked to the authenticated Supabase user.
- created_at: Timestamp.
- updated_at: Timestamp.

Only add additional profile fields when there is a clear requirement.

B. tasks

Purpose: Store each user's tasks.

Planned fields:

- id: UUID, primary key.
- user_id: UUID, owner of the task, linked to the authenticated user.
- description: Text, required.
- start_at: Timestamp with time zone, required.
- end_at: Timestamp with time zone, required.
- status: Text or enum, initially pending.
- completed_at: Timestamp with time zone, nullable.
- created_at: Timestamp with time zone.
- updated_at: Timestamp with time zone.

Validation requirements:

- Description must not be empty.
- Start and end timestamps must be valid.
- End timestamp must not be earlier than start timestamp.
- Status must be one of the permitted values.
- Users must not be allowed to assign tasks to another user's ID.

4. Task Status

Supported application statuses:

- pending
- in_progress
- completed

Overdue should normally be calculated from the task deadline and completion status, rather than stored as a permanent status. This prevents completed tasks from incorrectly remaining overdue.

5. Time Zone Rules

- Interpret the user's selected date and time in the configured application time zone.
- Store actual task instants consistently in PostgreSQL using timestamptz.
- Display dates and times in the user's configured time zone.
- Validate daylight-saving transitions where relevant.
- Handle tasks that span midnight correctly.

The initial application time zone must be explicitly configured before implementation.

6. Security Requirements

- Enable RLS on every table containing private user data.
- Authenticated users can read only their own tasks.
- Authenticated users can create tasks only for themselves.
- Authenticated users can update and delete only their own tasks.
- Enforce ownership checks in database policies, not only in frontend code.
- Never expose a Supabase service-role key in frontend code.
- Never trust a user_id supplied by the browser without verifying it against the authenticated identity.
- Use server-side validation for sensitive operations.

7. Cloud Sync

- Fetch tasks from the cloud after authentication.
- Save task changes to the cloud.
- Use updated_at or another explicit versioning strategy to help detect conflicting updates.
- Show errors when cloud operations fail.
- Do not report a task as saved when the server has rejected the operation.
- Define a safe retry strategy that does not create duplicate tasks.
- Do not use localStorage as the task database.

8. Bulk Import

Excel columns:

1. Description
2. Start Date
3. Start Time
4. End Date
5. End Time

Before saving:

- Validate the file and expected columns.
- Validate every row.
- Convert dates and times using the configured application time zone.
- Reject or report invalid rows.
- Associate imported tasks with the authenticated user on the server.
- Use safe transaction or batch handling where practical.
- Return a clear import summary.

9. EOD Export

Export columns:

1. Description
2. Task Completion Status

The report must be generated from authorized cloud data for the selected date. Only tasks belonging to the authenticated user should be included unless a future authorized team feature explicitly changes this rule.

10. Notification Data

If persistent scheduling requires additional tables, define them separately before implementation.

Potential notification records may include:

- Notification job ID.
- Task ID.
- User ID.
- Scheduled time.
- Delivery attempt status.
- Attempt count.
- Last attempt time.
- Provider response reference.
- Created and updated timestamps.

Notification tables must have appropriate access controls. Browser clients must never receive privileged notification credentials.

Avoid storing unnecessary push subscription details outside the provider integration unless required.

11. Data Lifecycle and Recovery

- Define how task deletion affects pending notification jobs.
- Cancel or invalidate reminders when a task is deleted or its schedule changes.
- Prevent duplicate notification jobs.
- Document database backup and restoration procedures.
- Define retention rules before storing additional user information.
- Ensure restored data preserves ownership and access restrictions.

12. Schema Change Rules

- Record database changes as migration files.
- Do not make undocumented production schema changes.
- Test migrations before applying them to production.
- Update this document whenever the schema or security policies change.
- Keep development and production environments separate where practical.

13. Implementation Status

All structures in this document are planned. Verify the actual database schema, RLS policies, indexes, and migrations before marking them implemented.
