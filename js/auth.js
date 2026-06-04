/**
 * auth.js — KHub Boilerplate
 * Reusable auth pattern — stub, wired but inactive.
 * Flip KHub.Config.features.auth = true to activate.
 * Swap the signIn/signOut implementations for your auth provider
 * (Firebase Auth, Supabase, custom JWT, etc.).
 */
(function () {
  'use strict';

  let _user = null;

  async function signIn(credentials) {
    if (!KHub.Config.features.auth) {
      console.warn('[KHub.Auth] Auth feature is disabled. Enable in config.js.');
      return null;
    }
    // TODO: replace with your provider
    // e.g. firebase.auth().signInWithEmailAndPassword(...)
    console.log('[KHub.Auth] signIn called — implement provider here', credentials);
    return null;
  }

  async function signOut() {
    if (!KHub.Config.features.auth) return;
    _user = null;
    console.log('[KHub.Auth] signOut called — implement provider here');
  }

  function getUser() { return _user; }
  function isSignedIn() { return !!_user; }

  function onAuthChange(callback) {
    // TODO: wire to provider's auth state listener
    // e.g. firebase.auth().onAuthStateChanged(callback)
    if (typeof callback === 'function') callback(_user);
  }

  window.KHub = window.KHub || {};
  window.KHub.Auth = { signIn, signOut, getUser, isSignedIn, onAuthChange };
})();
