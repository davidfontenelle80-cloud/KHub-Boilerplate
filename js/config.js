/**
 * config.js — KHub Boilerplate
 * Environment detection and feature flags.
 * Dev = localhost / 127.0.0.1. Prod = everything else.
 * Detailed env config added in Step 8.
 */
(function () {
  'use strict';

  const isProd = !['localhost', '127.0.0.1'].includes(location.hostname);

  window.KHub = window.KHub || {};
  window.KHub.Config = {
    env:      isProd ? 'production' : 'development',
    isProd,
    isDev:    !isProd,
    version:  '1.0.0',
    appName:  'KHub App',
    repoOwner: 'davidfontenelle80-cloud',
    repoName:  'KHub-Boilerplate',
    // Feature flags — flip here to enable/disable
    features: {
      auth:     false,
      firebase: false,
    },
  };

  if (!isProd) {
    console.log('[KHub] Dev mode — config:', window.KHub.Config);
  }
})();
