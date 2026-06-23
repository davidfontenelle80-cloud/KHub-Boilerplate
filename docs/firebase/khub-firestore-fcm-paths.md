---
title: "KHub Firestore + FCM Path Conventions"
repo: "davidfontenelle80-cloud/KHub-Boilerplate"
status: "active guidance"
created: "2026-06-23"
owner: "David"
supervisor: "App Supervisor / Builder Sol"
applies_to:
  - "Talk Arrangements"
  - "Ministry Tracker"
  - "Finance Tracker"
  - "My Wallet"
  - "Overtime Tracker"
  - "Note Clip"
  - "Future KHub apps"
firebase_project: "khub-apps"
firestore_database: "(default)"
source_context: "Firebase Console rules screenshot and KHub notification migration planning"
---

# KHub Firestore + FCM Path Conventions

This document protects the KHub ecosystem from accidental Firebase path drift when adding cloud backup, notification preferences, Firebase Cloud Messaging device tokens, or future app-specific user data.

## Current Firestore Rules Pattern

The Firebase project is `khub-apps`, Cloud Firestore database `(default)`.

Use this rules structure as the source of truth unless David deliberately approves a migration:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Legacy Note Clip backup path
    match /noteClipUsers/{userId}/backups/{backupId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && backupId == "current";
    }

    // Current KHub shared backup path
    // Covers Talk Arrangements, Ministry Tracker, Finance Tracker,
    // My Wallet, Overtime Tracker, and other current KHub apps.
    match /backups/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // Future KHub app data path
    // Use this for future backups, settings, notification preferences,
    // FCM/device tokens, cloud sync, and app-specific user data.
    match /khubApps/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // Optional finance bridge read-only path.
    // Keep write disabled unless we deliberately build a secure bridge writer.
    match /finance-sync/{docId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## Path Usage Rules

### Legacy Note Clip path

```txt
/noteClipUsers/{userId}/backups/current
```

Use only for existing Note Clip legacy backup compatibility.

Do not put new KHub app data here.

### Current shared backup path

```txt
/backups/{appId}/users/{userId}/{document=**}
```

Use for current KHub app backup data when the app is already built around this path.

Examples:

```txt
/backups/ministry-tracker/users/{uid}/current
/backups/talk-arrangements/users/{uid}/current
/backups/overtime-tracker/users/{uid}/current
/backups/my-wallet/users/{uid}/current
```

### Future KHub app data path

```txt
/khubApps/{appId}/users/{userId}/{document=**}
```

Use for all new user-owned app data, especially:

- FCM/device tokens.
- Notification preferences.
- Notification history.
- Settings.
- Cloud sync metadata.
- Future backups for newly built apps.
- App-specific private user data.

Recommended notification paths:

```txt
/khubApps/{appId}/users/{uid}/notificationTokens/{tokenId}
/khubApps/{appId}/users/{uid}/notificationPreferences/current
/khubApps/{appId}/users/{uid}/notificationHistory/{notificationId}
```

For Ministry Tracker specifically:

```txt
/khubApps/ministry-tracker/users/{uid}/notificationTokens/{tokenId}
/khubApps/ministry-tracker/users/{uid}/notificationPreferences/current
/khubApps/ministry-tracker/users/{uid}/notificationHistory/{notificationId}
```

### Finance bridge path

```txt
/finance-sync/{docId}
```

Current policy:

- Authenticated users may read.
- No client writes.
- Do not enable writes unless a secure server-side bridge writer is deliberately built and reviewed.

## Firebase Cloud Messaging Boilerplate Guidance

Every KHub app that adds notifications should include or reuse:

- Firebase Messaging initialization.
- Permission request UI.
- Token registration.
- Token refresh/update logic.
- Token deletion or inactive-token cleanup strategy.
- Notification preference document.
- Clear denied-permission message.
- Service worker support where required.
- Cache version bump for deployable service worker or Firebase changes.

## Security Rules

Required rule principle:

```txt
Only a signed-in user may read/write their own UID path.
```

Never use broad rules such as:

```js
allow read, write: if request.auth != null;
```

for user-owned app data unless the collection is intentionally shared and separately reviewed.

Never expose admin keys in client code. Firebase web config keys are not admin secrets, but Firestore rules must still enforce UID isolation.

## Required QA for Any KHub Notification Work

Before approving a notification implementation, verify:

- App loads without console errors.
- Existing backup still works.
- Existing local storage still works.
- Signed-in user can create/update their own notification token.
- Signed-in user cannot read/write another user's token.
- Permission denied state is handled clearly.
- Token refresh updates Firestore.
- Notification preferences save only after real success.
- Mobile layout works.
- Desktop layout works.
- Light/dark mode works.
- English/Spanish labels work if the app supports i18n.
- Service worker cache version is bumped for deployable changes.
- GitHub Pages live version is verified.

If live verification is missing, status is:

```txt
code-implemented, not live-approved yet
```

## Boilerplate Improvement Backlog

Recommended future additions to KHub Boilerplate:

1. `khubFirestorePaths` constants helper.
2. `khubNotifications` helper for FCM token registration and refresh.
3. Standard Notification Settings UI component.
4. Standard `firebase-messaging-sw.js` template.
5. Standard notification QA checklist.
6. Standard cloud/security checklist.
7. Standard deployment/cache history section.

## Codex / Coworker Instruction Snippet

```txt
When adding notifications to any KHub app, use /khubApps/{appId}/users/{uid}/... for device tokens, notification preferences, notification history, and future user-owned app data.

Keep existing current app backups under /backups/{appId}/users/{uid}/... unless a separate migration is approved.

Do not store new app data under /noteClipUsers unless maintaining Note Clip legacy compatibility.

Do not write to /finance-sync from client apps.

Do not broaden Firestore rules beyond authenticated UID-owned access.

Always bump the service worker cache version when deployable files change.

Always verify cross-account isolation before approval.
```
