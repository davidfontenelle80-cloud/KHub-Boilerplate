(function () {
  'use strict';

  // Public values only. Never put VAPID private keys or provider tokens here.
  window.KHUB_PUSH_CONFIG = Object.assign(
    {
      workerUrl: '',
      vapidPublicKey: '',
      appId: 'replace-with-app-id',
      appName: 'Replace with app name',
      appPath: '/replace-with-app-path/',
    },
    window.KHUB_PUSH_CONFIG || {}
  );
})();
