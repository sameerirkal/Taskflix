TASKFLIX — Security Guidelines

1. Purpose

This document defines the security requirements for the TASKFLIX application. Security controls must be implemented and tested before the application is used with real user data.

2. Authentication

- Use Supabase Authentication for user sign-up, sign-in, and sign-out.
- Protect authenticated user sessions.
- Do not expose passwords, authentication tokens, or private credentials.
- Provide a secure process for account recovery.

3. Database Security

- Use Supabase Row Level Security (RLS) on tables containing user data.
- Users must only be able to access and modify records they are authorized to manage.
- Validate database access policies for every relevant operation.
- Do not rely on frontend checks as the only security control.

4. Secrets and Environment Variables

- Never place Supabase service-role keys, private API keys, or other privileged secrets in frontend HTML, CSS, JavaScript, or public repositories.
- Only use public client configuration in the frontend when appropriate.
- Store privileged secrets in secure backend environment variables.
- Rotate any secret that may have been exposed.

5. Input Validation

- Validate task descriptions, dates, times, and imported spreadsheet data.
- Reject invalid or malformed input.
- Perform important validation on the backend as well as in the frontend.
- Prevent spreadsheet imports from creating unauthorized or invalid records.

6. Excel Import and Export

- Import only supported file formats.
- Validate column names and required values before processing uploaded files.
- Limit upload size and row count to reasonable values.
- Export only data the authenticated user is authorized to access.
- Do not include credentials, access tokens, or other secrets in exported files.

7. Push Notifications

- Request notification permission only when appropriate and supported by the browser.
- Respect browser permission settings and user preferences.
- Do not include passwords, authentication tokens, or sensitive task details in notification content.
- Keep push subscription data protected.
- Do not assume push notifications will work when a browser or device blocks them.

8. Backend and Scheduled Jobs

- Run privileged operations on a trusted backend.
- Authenticate and authorize requests before processing them.
- Protect scheduled jobs and internal endpoints against unauthorized access.
- Avoid exposing administrative functions to unauthenticated users.
- Log relevant failures without recording secrets or unnecessary personal data.

9. Deployment

- Use HTTPS for deployed application pages and backend communications.
- Review repository visibility before adding configuration or sensitive information.
- Keep dependencies updated.
- Review deployment configuration before releasing changes.

10. Backups and Recovery

- Establish a suitable database backup and recovery plan.
- Document database schema changes and migrations.
- Test recovery procedures before relying on them.

11. Security Testing Checklist

- [ ] Authentication flows tested.
- [ ] Row Level Security policies tested.
- [ ] Unauthorized database access attempts rejected.
- [ ] Frontend checked for exposed privileged secrets.
- [ ] Task input validation tested.
- [ ] Excel import validation tested.
- [ ] User data access boundaries tested.
- [ ] Push notification permissions and subscriptions reviewed.
- [ ] HTTPS deployment verified.
- [ ] Backup and recovery procedures reviewed.

12. Status

These are planned security requirements. Do not mark a control as implemented or verified until it has actually been configured and tested.
