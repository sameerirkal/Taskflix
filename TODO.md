TASKFLIX — Development TODO List

This file tracks the development progress of TASKFLIX.

Status Legend

- [ ] Not completed
- [x] Completed and verified

Phase 1: Project Setup

- [x] Create private GitHub repository.
- [x] Document project requirements.
- [x] Document planned features.
- [x] Document database schema requirements.
- [x] Create changelog documentation.
- [ ] Create TODO file
- [x] Create security guidelines.
- [ ] Organize project folders and files.

Phase 2: Backend and Database

- [ ] Create a Supabase project.
- [ ] Configure Supabase Authentication.
- [ ] Create the user profiles table.
- [ ] Create the tasks table.
- [ ] Configure Row Level Security (RLS).
- [ ] Test that users can access only their authorized data.
- [ ] Configure secure backend operations.
- [ ] Plan database backups and recovery.

Phase 3: Frontend

- [ ] Create index.html.
- [ ] Create style.css.
- [ ] Create app.js.
- [ ] Build the TASKFLIX interface.
- [ ] Add user sign-up and sign-in.
- [ ] Add task creation form.
- [ ] Add task listing and editing.
- [ ] Add task completion status.
- [ ] Connect the frontend to Supabase.
- [ ] Verify cloud synchronization.

Phase 4: Excel Features

- [ ] Add bulk task import from Excel.
- [ ] Support the required columns: Description, Start Date, Start Time, End Date, End Time.
- [ ] Validate uploaded spreadsheet data.
- [ ] Add EOD Excel export.
- [ ] Ensure EOD exports contain Description and Task Completion Status.
- [ ] Test import and export with sample spreadsheets.

Phase 5: Notifications

- [ ] Configure OneSignal Web Push.
- [ ] Implement an appropriate notification permission flow.
- [ ] Configure push subscriptions.
- [ ] Implement backend notification scheduling.
- [ ] Handle task start and end times appropriately.
- [ ] Test notifications on supported browsers and devices.
- [ ] Document browser and device limitations.

Phase 6: Security and Testing

- [ ] Test authentication and authorization.
- [ ] Test database security policies.
- [ ] Validate all task inputs.
- [ ] Test Excel upload restrictions.
- [ ] Check for exposed secrets.
- [ ] Test notification permissions.
- [ ] Test error handling.
- [ ] Verify cloud data persistence.
- [ ] Test application behavior on mobile and desktop.

Phase 7: Deployment

- [ ] Configure GitHub Pages.
- [ ] Configure the production environment.
- [ ] Verify HTTPS.
- [ ] Connect the production frontend to Supabase.
- [ ] Verify production authentication and database access.
- [ ] Test the complete application.
- [ ] Document known issues and deployment steps.

Important Rules

- Do not mark a task complete until it has been implemented and verified.
- Never expose privileged credentials in frontend code.
- Keep HTML, CSS, and JavaScript in separate files.
- Store task data in the cloud database, not localStorage.
- Test security and functionality before using real user data.
