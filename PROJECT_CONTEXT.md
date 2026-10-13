TASKFLIX — Project Context

1. Project Goal

Build a secure, reliable, cloud-based task management web application called TASKFLIX.

The application should be easy to use, mobile-friendly, maintainable, and designed to minimize data loss and security risks.

2. Development Rules

- Keep HTML, CSS, and JavaScript in separate files.
- Maintain project documentation and update it when requirements or architecture change.
- Use version control for code changes.
- Do not assume older chat code is the latest source of truth.
- Inspect current project files before modifying existing features.
- Preserve working features unless a change is explicitly requested.
- Provide complete file contents when a full file replacement is requested.
- Never claim code has been tested unless the relevant tests were actually performed.
- Explain required database migrations and deployment steps for significant changes.
- Never expose secret keys, passwords, access tokens, or privileged credentials in frontend code.

3. Planned Technology

- Frontend: HTML, CSS, JavaScript.
- Authentication and database: Supabase.
- Frontend hosting: GitHub Pages.
- Push notifications: OneSignal Web Push.
- Backend operations: Supabase Edge Functions or another suitable secure backend.
- Version control: GitHub.

4. Task Creation

The task form must remain simple.

Required fields:

- Description.
- Start date and time.
- End date and time.

Users must be able to create, edit, delete, and complete tasks.

Validate all required fields and ensure the end datetime is not earlier than the start datetime.

5. Bulk Task Upload

Users must be able to upload multiple tasks using an Excel file.

Required Excel columns, in this order:

1. Description
2. Start Date
3. Start Time
4. End Date
5. End Time

Before saving uploaded tasks:

- Validate column names and row values.
- Show an import preview.
- Identify invalid rows.
- Report duplicate or potentially duplicate tasks.
- Avoid silently skipping failed rows.
- Clearly report which tasks were imported successfully.

6. EOD Excel Export

Users must be able to export a selected day's tasks to Excel.

Required export columns, in this order:

1. Description
2. Task Completion Status

Completion status should distinguish at least:

- Pending
- In Progress
- Completed

Overdue tasks should be identifiable in the application, even if the export keeps only the two required columns.

7. Cloud Sync and Authentication

- Store task data in the cloud database, not localStorage.
- Require an appropriate user identity for private task ownership.
- Synchronize tasks across devices when the same user signs in.
- Protect user data using Supabase Row Level Security (RLS).
- Validate permissions on the server/database, not only in frontend JavaScript.
- Handle network failures, retries, and conflicting updates safely.
- Never expose Supabase service-role keys or other privileged secrets in frontend files.

8. Push Notifications

- Use OneSignal Web Push with the required service worker.
- Request notification permission automatically for eligible first-time visitors, subject to browser restrictions.
- Avoid repeatedly prompting users who have already made a permission decision.
- Schedule task reminders using a backend scheduler, not only frontend timers.
- Track scheduled and sent notifications to reduce duplicate delivery.
- Handle expired subscriptions and notification failures.
- Explain that push delivery depends on browser, operating system, permissions, network, and device settings.

9. Security and Reliability

- Use secure authentication and per-user authorization.
- Apply database RLS policies to all private task data.
- Keep privileged API credentials on the backend.
- Validate and sanitize incoming task and import data.
- Avoid collecting unnecessary personal or confidential customer information.
- Use safe error messages that do not expose credentials or sensitive internal details.
- Plan backups and recovery.
- Test authentication, access isolation, CRUD operations, imports, exports, notifications, and mobile layouts before release.

10. Documentation and Version Control

Maintain these project documents:

- PROJECT_CONTEXT.md — project goals and permanent requirements.
- FEATURES.md — implemented and planned features.
- DATABASE_SCHEMA.md — database tables, relationships, and RLS rules.
- CHANGELOG.md — changes made to the project.
- TODO.md — pending tasks, known issues, and future improvements.

Update relevant documentation whenever a significant feature, schema, security rule, or deployment procedure changes.

11. Current Implementation Status

This document records the intended architecture and requirements. It does not mean that the features listed above have already been implemented or tested.

Record implementation status, testing results, and known issues in the project documentation as development progresses.
