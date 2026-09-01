/**
 * Optional push/click handlers to integrate into the ONE app sw.js.
 * Do not copy install/activate/fetch/message handlers or create another SW.
 * Define PUSH_OPTIONS with appName, appPath, sourceType, and route(data).
 */

const PUSH_OPTIONS = {
  appName: 'Replace with app name',
  appPath: '/replace-with-app-path/',
  sourceType: 'reminder',
  route(data) {
    const url = new URL(data.url || this.appPath, self.location.origin);
    if (data.sourceType) url.searchParams.set('sourceType', data.sourceType);
    if (data.sourceId) url.searchParams.set('sourceId', data.sourceId);
    url.hash = 'notification';
    return url.href;
  },
};

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification?.data || {};
  const targetUrl = PUSH_OPTIONS.route(data);
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const ownedClient = clientList.find(
        (client) =>
          'focus' in client && new URL(client.url).pathname.startsWith(PUSH_OPTIONS.appPath)
      );
      if (ownedClient) {
        ownedClient.postMessage({ type: 'NOTIFICATION_CLICK_ROUTE', data, url: targetUrl });
        return ownedClient.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || PUSH_OPTIONS.appName, {
      body: data.body || data.message || '',
      icon: data.icon || './icons/icon-192.png',
      badge: data.badge || './icons/icon-192.png',
      tag: data.tag || data.sourceId || `${PUSH_OPTIONS.sourceType}-reminder`,
      data: {
        url: data.url || PUSH_OPTIONS.appPath,
        sourceType: data.sourceType || PUSH_OPTIONS.sourceType,
        sourceId: data.sourceId || '',
      },
      requireInteraction: Boolean(data.requireInteraction),
    })
  );
});
