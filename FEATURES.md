TASKFLIX — Features Tracker

Status Legend

- [ ] Planned / Not completed
- [ ] Implemented and verified

Features must not be marked complete until they have been implemented and appropriately tested.

1. Core Task Management

- [ ] Create task using description, start date/time, and end date/time.
- [ ] Edit existing tasks.
- [ ] Delete tasks with appropriate confirmation.
- [ ] Mark tasks as completed.
- [ ] Display pending, in-progress, completed, and overdue tasks.
- [ ] Display tasks scheduled for today.
- [ ] Validate start and end dates/times.
- [ ] Handle tasks spanning midnight correctly.

2. Excel Bulk Upload

- [ ] Upload an Excel file containing multiple tasks.
- [ ] Require columns in this order:
  1. Description
  2. Start Date
  3. Start Time
  4. End Date
  5. End Time
- [ ] Validate file type, headers, dates, times, and descriptions.
- [ ] Preview tasks before importing.
- [ ] Identify invalid rows and potential duplicates.
- [ ] Show successful and failed import counts.
- [ ] Prevent accidental duplicate imports where practical.

3. EOD Excel Export

- [ ] Export tasks for a selected date.
- [ ] Export exactly these columns:
  1. Description
  2. Task Completion Status
- [ ] Include the actual completion status of each task.
- [ ] Generate the report from cloud data.
- [ ] Handle empty reports and export errors.

4. Authentication and Cloud Sync

- [ ] Secure user registration and login.
- [ ] Secure logout and session management.
- [ ] Store task data in the cloud database.
- [ ] Synchronize tasks across devices for the same account.
- [ ] Prevent users from reading or modifying other users' tasks.
- [ ] Apply and test database Row Level Security policies.
- [ ] Handle network interruptions and failed requests.
- [ ] Handle concurrent updates safely.

5. Push Notifications

- [ ] Configure OneSignal Web Push.
- [ ] Install the required service worker at the correct URL and scope.
- [ ] Request permission automatically for eligible new visitors, subject to browser restrictions.
- [ ] Avoid repeatedly requesting permission after a user decision.
- [ ] Schedule reminders through a secure backend.
- [ ] Support reminders when the website is closed, where browser and device conditions allow.
- [ ] Track notification scheduling and delivery responses.
- [ ] Prevent duplicate notification jobs.
- [ ] Handle expired subscriptions and failed delivery attempts.

6. Dashboard and Usability

- [ ] Show today's total tasks.
- [ ] Show completed, pending, and overdue task counts.
- [ ] Search tasks by description.
- [ ] Filter tasks by date and status.
- [ ] Add mobile-responsive layouts.
- [ ] Show loading indicators and clear error messages.
- [ ] Ask for confirmation before destructive actions.

7. Security and Recovery

- [ ] Keep privileged secrets on the backend.
- [ ] Validate task data on the server.
- [ ] Restrict database access with authorization and RLS.
- [ ] Protect against unauthorized data access.
- [ ] Use safe error messages.
- [ ] Configure database backup and recovery procedures.
- [ ] Document deployment and secret rotation procedures.

8. Testing and Release

- [ ] Test task creation, editing, completion, and deletion.
- [ ] Test Excel upload with valid and invalid files.
- [ ] Test Excel export and status accuracy.
- [ ] Test access isolation between different users.
- [ ] Test synchronization across devices.
- [ ] Test notification permission and subscription flows.
- [ ] Test scheduled notifications under supported conditions.
- [ ] Test mobile and desktop layouts.
- [ ] Test error handling and recovery.
- [ ] Document known limitations before production release.

Important

All items are initially unchecked because the implementation and verification status has not yet been established. Update this file as features are built and tested.
