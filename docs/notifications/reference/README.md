# Required notification settings control

Every KHub app that implements push notifications must also include a device-specific **Notifications ON/OFF** control in Settings.

The control is not optional. Copy `push-toggle.js` from this folder into the app as `js/push-toggle.js` and configure it before loading the script.

```html
<div id="notificationSettingsCard" class="card stack-2"></div>

<script>
window.KHUB_PUSH_TOGGLE_CONFIG = {
  cardId: 'notificationSettingsCard',
  pushApiName: 'MyAppPush',
  storageKey: 'myAppPushSubscriptionId',
  debugFunctionName: 'showMyAppPushDebug',
  appName: 'My App'
};
</script>
<script src="js/push-toggle.js"></script>
```

Also add `./js/push-toggle.js` to the service worker's `PRECACHE_URLS` and bump the cache version.

## Required behavior

**OFF** must affect only the current browser/device:

- call the current browser `PushSubscription.unsubscribe()`
- clear only that device's local subscription ID
- leave other phones, tablets, and computers untouched
- show a stable diagnostic status code

**ON** must perform a clean refresh:

- unsubscribe any existing browser subscription first
- clear the stored subscription ID
- call the app push API's `subscribe()` method
- create and save a completely fresh subscription

The Settings card must also expose:

- a separate **Send test notification** button
- a **View diagnostics** action
- permission and subscription state through the status code
- English and Spanish labels when the app supports both languages

## Standard status codes

- `PUSH_ENABLED_SUBSCRIBED`
- `PUSH_GRANTED_NO_SUBSCRIPTION`
- `PUSH_PERMISSION_NOT_REQUESTED`
- `PUSH_PERMISSION_DENIED`
- `PUSH_UNSUPPORTED`

## Verification gate

Before approving a notification-enabled app, verify all of the following on real devices:

1. Turning OFF on one device does not disable another device using the same account.
2. Turning ON creates a new browser subscription and a new server-side subscription record.
3. The Test button succeeds after the reset.
4. The app reports blocked iOS permission accurately.
5. The control works from an installed iPhone/iPad Home Screen PWA.
6. The updated module is included in the service-worker cache and appears after deployment.

Do not solve a stale-device subscription by requiring the user to delete and reinstall the app unless the operating system has permanently blocked the PWA and provides no recoverable permission path.
