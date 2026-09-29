# AI action contract for KHub apps

This is an optional starter contract for apps that let an authorized AI perform
user actions. The reference boilerplate is a static PWA; an authenticated
server component is required for remote actions. Each app implements its own
field validation and persistence. No AI action is enabled by copying this doc.

## Owner and action boundary

1. Authenticate the human owner with a short-lived grant. The server verifies
   the token and derives the owner UID; the AI cannot choose an account by
   naming one in a message or request.
2. Bind the grant to one app ID and an allowlist of actions (for example,
   `preview_study_reschedule` and `commit_study_reschedule`). Reject all other
   actions and do not offer arbitrary database paths or query languages.
3. Resolve names and record IDs only inside the owner's account. Return a
   clarification request when names or dates are ambiguous.
4. Preview shows the exact intended changes and current record revision.
   Commit checks the same owner, app, action, record, and revision again and
   uses an idempotency key so retries cannot create duplicate records.
5. Record an owner-scoped audit result. Report separately whether the app
   record, push reminder, and linked calendar event succeeded. A partial
   failure must be visible and retryable without duplicating the other steps.
6. Store calendar provider, grant reference, and event ID under the same UID
   and app as the record. Never place credentials in client code, chat text,
   shared logs, or the AI action response.

## Minimum acceptance tests

- User A can preview and commit an action in A's account; A's own second
  device reads the update after sync.
- User B cannot preview, update, or infer A's record, calendar event, or
  notification token, even when B supplies A's identifiers.
- A stale preview, expired/revoked grant, changed sign-in, or unsupported
  action cannot commit.
- A retried commit changes the record only once. A failed calendar or push
  operation is reported as failed, never as a completed reminder.

Follow `SECURITY_FIREBASE.md` for current and future Firestore paths and for
the required cross-account isolation test. Adopt this contract only after an
app-specific audit and review of its data migration and recovery behavior.
