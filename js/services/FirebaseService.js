// js/services/FirebaseService.js
// Firebase Authentication + Firestore integration for auth & credit tracking.
//
// Uses the Firebase v10 modular SDK loaded from the official CDN via ES module
// imports. Configuration is read from window.FIREBASE_CONFIG (set in a small
// inline script in index.html or via env injection at deploy time).
//
// New users get 15 free session credits. Each completed session deducts 1.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const STARTING_CREDITS = 15;

const FirebaseService = {
  _app: null,
  _auth: null,
  _db: null,
  _ready: false,
  _creditsUnsub: null,

  // Callbacks registered by controllers
  _onAuthChange: null,   // (user) => void
  _onCreditsChange: null, // (credits) => void

  /**
   * Initialize Firebase. Returns true if config present and init succeeded.
   * Safe to call once at startup.
   */
  init() {
    const config = (typeof window !== 'undefined') ? window.FIREBASE_CONFIG : null;
    if (!config || !config.apiKey || config.apiKey.indexOf('YOUR_') === 0) {
      console.warn('[Firebase] No valid config found (window.FIREBASE_CONFIG). Auth features disabled.');
      this._ready = false;
      return false;
    }

    try {
      this._app = initializeApp(config);
      this._auth = getAuth(this._app);
      this._db = getFirestore(this._app);
      this._ready = true;

      // Listen for auth state changes
      onAuthStateChanged(this._auth, (user) => {
        if (user) {
          this._handleSignedIn(user);
        } else {
          this._handleSignedOut();
        }
      });

      return true;
    } catch (err) {
      console.error('[Firebase] Initialization failed:', err);
      this._ready = false;
      return false;
    }
  },

  isReady() {
    return this._ready;
  },

  /**
   * Register a callback fired whenever auth state changes.
   * Receives the Firebase user object (or null when signed out).
   */
  onAuthChange(cb) {
    this._onAuthChange = cb;
  },

  /**
   * Register a callback fired whenever the credit count changes.
   * Receives the numeric credit count.
   */
  onCreditsChange(cb) {
    this._onCreditsChange = cb;
  },

  /**
   * Internal: handle a signed-in user. Ensures a Firestore user doc exists,
   * then subscribes to live credit updates.
   */
  async _handleSignedIn(user) {
    // Ensure the user document exists with starting credits
    try {
      const ref = doc(this._db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          email: user.email || null,
          credits: STARTING_CREDITS,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[Firebase] Failed to ensure user doc:', err);
    }

    // Notify auth change
    if (this._onAuthChange) this._onAuthChange(user);

    // Subscribe to live credit updates
    this._subscribeToCredits(user.uid);
  },

  /**
   * Internal: handle sign-out. Clean up listeners and notify.
   */
  _handleSignedOut() {
    if (this._creditsUnsub) {
      this._creditsUnsub();
      this._creditsUnsub = null;
    }
    if (this._onAuthChange) this._onAuthChange(null);
    if (this._onCreditsChange) this._onCreditsChange(null);
  },

  /**
   * Internal: live-subscribe to the user's credit field in Firestore.
   */
  _subscribeToCredits(uid) {
    if (this._creditsUnsub) {
      this._creditsUnsub();
      this._creditsUnsub = null;
    }
    const ref = doc(this._db, 'users', uid);
    this._creditsUnsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const credits = typeof data.credits === 'number' ? data.credits : 0;
        if (this._onCreditsChange) this._onCreditsChange(credits);
      }
    }, (err) => {
      console.error('[Firebase] Credit subscription error:', err);
    });
  },

  // ── Auth methods ────────────────────────────────────────────────

  async signUpWithEmail(email, password) {
    if (!this._ready) return { success: false, error: 'Auth unavailable.' };
    try {
      const cred = await createUserWithEmailAndPassword(this._auth, email, password);
      return { success: true, user: cred.user };
    } catch (err) {
      return { success: false, error: this._friendlyError(err) };
    }
  },

  async signInWithEmail(email, password) {
    if (!this._ready) return { success: false, error: 'Auth unavailable.' };
    try {
      const cred = await signInWithEmailAndPassword(this._auth, email, password);
      return { success: true, user: cred.user };
    } catch (err) {
      return { success: false, error: this._friendlyError(err) };
    }
  },

  async signInWithGoogle() {
    if (!this._ready) return { success: false, error: 'Auth unavailable.' };
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this._auth, provider);
      return { success: true, user: cred.user };
    } catch (err) {
      return { success: false, error: this._friendlyError(err) };
    }
  },

  async signOutUser() {
    if (!this._ready) return { success: false };
    try {
      await signOut(this._auth);
      return { success: true };
    } catch (err) {
      return { success: false, error: this._friendlyError(err) };
    }
  },

  getCurrentUser() {
    return this._auth ? this._auth.currentUser : null;
  },

  // ── Credit methods ──────────────────────────────────────────────

  /**
   * Read the current credit count (one-shot).
   * @returns {Promise<number|null>}
   */
  async getCredits() {
    if (!this._ready) return null;
    const user = this.getCurrentUser();
    if (!user) return null;
    try {
      const ref = doc(this._db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        return typeof data.credits === 'number' ? data.credits : 0;
      }
      return 0;
    } catch (err) {
      console.error('[Firebase] getCredits failed:', err);
      return null;
    }
  },

  /**
   * Deduct one credit from the current user (atomic).
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deductCredit() {
    if (!this._ready) return { success: false, error: 'Auth unavailable.' };
    const user = this.getCurrentUser();
    if (!user) return { success: false, error: 'Not signed in.' };
    try {
      const ref = doc(this._db, 'users', user.uid);
      await updateDoc(ref, { credits: increment(-1) });
      return { success: true };
    } catch (err) {
      console.error('[Firebase] deductCredit failed:', err);
      return { success: false, error: 'Failed to update credits.' };
    }
  },

  // ── Helpers ─────────────────────────────────────────────────────

  _friendlyError(err) {
    const code = err && err.code ? err.code : '';
    switch (code) {
      case 'auth/email-already-in-use': return 'That email is already registered. Try signing in.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/user-not-found': return 'No account found with that email.';
      case 'auth/invalid-credential': return 'Invalid email or password.';
      case 'auth/popup-closed-by-user': return 'Sign-in cancelled.';
      case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
      default: return (err && err.message) ? err.message : 'Authentication failed.';
    }
  }
};

export { FirebaseService, STARTING_CREDITS };
