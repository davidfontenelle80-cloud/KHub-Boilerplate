# Firebase / Firestore Security Standard

This document defines the approved Firebase Cloud Firestore security model and cloud data structure for KHub apps.

## Approved current path

Current KHub apps may store user-owned backup or sync data under:

```text
/backups/{appId}/users/{userId}/...
```

Rules for this path must require the signed-in Firebase Authentication user to match the path user:

```text
request.auth != null && request.auth.uid == userId
```

## Approved future path

Future KHub apps should store user-owned app data under:

```text
/khubApps/{appId}/users/{userId}/...
```

This path is the preferred long-term standard for cloud backup, cloud sync, notification tokens, notification preferences, and future user-owned app data.

Rules for this path must require:

```text
request.auth != null && request.auth.uid == userId
```

## Legacy Note Clip path

Note Clip previously used this legacy backup path:

```text
/noteClipUsers/{userId}/backups/current
```

This path remains documented for compatibility only. New KHub apps should not copy this structure.

Rules for this path must require:

```text
request.auth != null && request.auth.uid == userId
```

and the backup document must be limited to:

```text
backupId == "current"
```

## Cross-account isolation testing

Every app that uses Firebase cloud backup, cloud sync, notifications, or worker-assisted cloud features must be tested for cross-account isolation before release.

Minimum test checklist:

1. Sign in as User A and create or update cloud data.
2. Sign out completely.
3. Sign in as User B.
4. Confirm User B cannot read, overwrite, restore, or delete User A data.
5. Repeat the test in the opposite direction.
6. Confirm direct path tampering fails when `userId` does not match `request.auth.uid`.

Do not approve a Firebase-backed app until this isolation test passes.

## Notification token storage standard

Notification tokens must be stored under the future KHub standard user path:

```text
/khubApps/{appId}/users/{userId}/notificationTokens/{tokenId}
```

Rules must require:

```text
request.auth != null && request.auth.uid == userId
```

Tokens are user-owned data. Never place notification tokens in a shared public collection.

## Notification preferences standard

Notification preferences must be stored under:

```text
/khubApps/{appId}/users/{userId}/notificationPrefs/current
```

Rules must require:

```text
request.auth != null && request.auth.uid == userId
```

Apps should treat `current` as the single active notification preference document for that user and app.

## Finance bridge path

The finance bridge path is read-only from browser apps:

```text
/finance-sync/{docId}
```

Browser clients may read this path only when signed in. Browser clients must not write to this path.

Writes must remain blocked in Firestore rules:

```text
allow write: if false;
```

## Cloudflare worker warning

No admin keys, service account private keys, or privileged Firebase credentials may be placed in browser apps.

Any service account credentials must remain server-side only, such as inside a properly secured Cloudflare Worker or other server-side environment.

Browser apps may use public Firebase client config, but they must rely on Firebase Authentication plus Firestore rules for user-level access control.

## Implementation rule

Before implementing cloud backup, cloud sync, notifications, or Cloudflare worker support in any KHub app, review:

```text
firestore.rules.example
SECURITY_FIREBASE.md
```

Do not introduce public read/write access unless a future design explicitly documents why the data is public and how abuse is prevented.
