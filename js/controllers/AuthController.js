// js/controllers/AuthController.js
// Manages authentication state, the Stage lock overlay, and the auth modal UI.
// The Stage tab is locked behind sign-in; Navigator/Library/Archetypes stay public.

import { AppState } from '../data/constants.js';
import { FirebaseService } from '../services/FirebaseService.js';

const AuthController = {
  _statusUpdaters: [],

  init() {
    // Attempt to init Firebase. If config is missing, the Stage stays unlocked
    // (graceful degradation for local dev without Firebase configured).
    const ready = FirebaseService.init();

    // Wire auth state changes -> update lock + AppState
    FirebaseService.onAuthChange((user) => {
      AppState.user = user;
      this._applyStageLock(!user);
      this._renderAuthButton(user);
      if (!user) {
        AppState.credits = null;
        this._notifyStatus();
      }
    });

    // Wire credit changes -> update AppState + status bar
    FirebaseService.onCreditsChange((credits) => {
      AppState.credits = credits;
      this._notifyStatus();
      this._updateStartButtonForCredits();
    });

    // If Firebase isn't configured, unlock the stage so local dev still works
    if (!ready) {
      this._applyStageLock(false);
    } else {
      // Default to locked until auth resolves
      this._applyStageLock(true);
    }

    this._wireOverlayForm();
    this._wireAuthButton();
    this._wireModal();
  },

  /**
   * Register a callback to receive status updates (user, credits).
   * Used by the status bar in app.js.
   */
  onStatusUpdate(cb) {
    if (typeof cb === 'function') this._statusUpdaters.push(cb);
  },

  _notifyStatus() {
    this._statusUpdaters.forEach(cb => {
      try { cb({ user: AppState.user, credits: AppState.credits }); } catch (_) {}
    });
  },

  /**
   * Blur/lock or unlock the Stage controls.
   */
  _applyStageLock(locked) {
    const overlay = document.getElementById('stage-auth-overlay');
    const container = document.getElementById('stage-lockable');
    if (overlay) overlay.hidden = !locked;
    if (container) {
      container.classList.toggle('stage--locked', locked);
      // Prevent interaction with locked content
      container.setAttribute('aria-hidden', locked ? 'true' : 'false');
    }
  },

  /**
   * Show the auth header button reflecting signed-in/out state.
   */
  _renderAuthButton(user) {
    const btn = document.getElementById('auth-button');
    if (!btn) return;
    if (user) {
      const label = user.email ? user.email.split('@')[0] : 'Account';
      btn.textContent = 'Sign Out (' + label + ')';
      btn.dataset.action = 'signout';
    } else {
      btn.textContent = 'Sign In';
      btn.dataset.action = 'signin';
    }
  },

  _wireAuthButton() {
    const btn = document.getElementById('auth-button');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      if (btn.dataset.action === 'signout') {
        await FirebaseService.signOutUser();
      } else {
        this._openModal();
      }
    });
  },

  /**
   * Wire the overlay's "Create free account" CTA to open the modal.
   */
  _wireOverlayForm() {
    const cta = document.getElementById('stage-auth-cta');
    if (cta) {
      cta.addEventListener('click', () => this._openModal('signup'));
    }
  },

  // ── Auth Modal ──────────────────────────────────────────────────

  _openModal(mode) {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.hidden = false;
    this._setModalMode(mode || 'signup');
    const emailInput = document.getElementById('auth-email');
    if (emailInput) emailInput.focus();
  },

  _closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.hidden = true;
    this._clearError();
  },

  _setModalMode(mode) {
    const isSignup = mode === 'signup';
    const title = document.getElementById('auth-modal-title');
    const submit = document.getElementById('auth-submit');
    const toggle = document.getElementById('auth-toggle-mode');
    if (title) title.textContent = isSignup ? 'Create Your Free Account' : 'Welcome Back';
    if (submit) submit.textContent = isSignup ? 'Sign Up & Get 15 Sessions' : 'Sign In';
    if (toggle) toggle.textContent = isSignup ? 'Already have an account? Sign in' : "Need an account? Sign up free";
    const form = document.getElementById('auth-form');
    if (form) form.dataset.mode = isSignup ? 'signup' : 'signin';
  },

  _showError(msg) {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.hidden = false; }
  },

  _clearError() {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = ''; el.hidden = true; }
  },

  _wireModal() {
    const form = document.getElementById('auth-form');
    const toggle = document.getElementById('auth-toggle-mode');
    const closeBtn = document.getElementById('auth-modal-close');
    const googleBtn = document.getElementById('auth-google');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        this._clearError();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const mode = form.dataset.mode || 'signup';

        if (!email || !password) {
          this._showError('Please enter both email and password.');
          return;
        }

        const submit = document.getElementById('auth-submit');
        if (submit) { submit.disabled = true; submit.textContent = 'Please wait...'; }

        const result = mode === 'signup'
          ? await FirebaseService.signUpWithEmail(email, password)
          : await FirebaseService.signInWithEmail(email, password);

        if (submit) submit.disabled = false;

        if (result.success) {
          this._closeModal();
        } else {
          this._showError(result.error || 'Authentication failed.');
          this._setModalMode(mode); // restore submit button text
        }
      });
    }

    if (toggle) {
      toggle.addEventListener('click', () => {
        const form = document.getElementById('auth-form');
        const current = form ? form.dataset.mode : 'signup';
        this._clearError();
        this._setModalMode(current === 'signup' ? 'signin' : 'signup');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this._closeModal());
    }

    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        this._clearError();
        const result = await FirebaseService.signInWithGoogle();
        if (result.success) {
          this._closeModal();
        } else {
          this._showError(result.error || 'Google sign-in failed.');
        }
      });
    }

    // Close on backdrop click + Escape
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this._closeModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const m = document.getElementById('auth-modal');
        if (m && !m.hidden) this._closeModal();
      }
    });
  },

  /**
   * Enable/disable the Start button based on credit availability.
   */
  _updateStartButtonForCredits() {
    const btnStart = document.getElementById('btn-start');
    const outOfCredits = document.getElementById('stage-out-of-credits');
    if (AppState.credits !== null && AppState.credits <= 0) {
      if (btnStart) { btnStart.disabled = true; }
      if (outOfCredits) outOfCredits.hidden = false;
    } else {
      if (outOfCredits) outOfCredits.hidden = true;
      // Note: btnStart re-enable is governed by mode selection in StageController
    }
  },

  /**
   * Returns true if the user is allowed to start a session (has credits).
   */
  canStartSession() {
    // If Firebase isn't configured, allow (local dev)
    if (!FirebaseService.isReady()) return true;
    if (!AppState.user) return false;
    return AppState.credits !== null && AppState.credits > 0;
  }
};

export { AuthController };
