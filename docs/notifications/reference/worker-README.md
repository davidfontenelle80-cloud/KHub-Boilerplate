# KHub Push/Reminder Worker Reference

This optional notification-archetype reference is not loaded by ordinary KHub apps.
Copy and parameterize it only for an app that needs closed-app reminders.

## Required configuration

- Set `APP_ID`, `APP_PATH`, `ALLOWED_ORIGIN`, the public VAPID values, and a dedicated
  `PUSH_STORE` binding in `wrangler.toml`.
- Store `VAPID_PRIVATE_KEY` only as a Worker secret. Never commit it.
- Give each app its own worker identity and storage namespace.

## Cleanup and run evidence

- A push-service `404` or `410` deletes the dead subscription and reminders owned by it.
- A due reminder without a subscription is deleted as an orphan.
- Every scheduled run logs one secret-free JSON counter record containing only the app id
  and counts for due, sent, failed, dead subscriptions deleted, and orphan reminders deleted.
- Logs must never include endpoints, subscription keys, VAPID secrets, authorization
  headers, payload bodies, or user content.

## Verification before deployment

Test subscription creation, a successful push, 404 cleanup, 410 cleanup, orphan cleanup,
counter output, scheduled delivery, CORS, and a real closed-app notification on each
supported platform. Deployment is a separate authorized action.
