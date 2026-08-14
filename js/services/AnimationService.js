// js/services/AnimationService.js

/* ============================================================
   AnimationService — CSS class transitions with reduced-motion support
   Requirements: 7.2, 9.11
============================================================ */
const AnimationService = {
  /**
   * Returns true if the user has requested reduced motion.
   * Reads window.matchMedia('(prefers-reduced-motion: reduce)').matches.
   * Requirements: 9.11
   */
  respectsReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Adds cssClass to element then waits for the CSS transition/animation to
   * finish before invoking callback.  Listens for both `transitionend` and
   * `animationend`; whichever fires first wins.  A fallback setTimeout fires
   * after `duration + 50 ms` in case no CSS transition or animation is
   * actually running on the element.
   *
   * If reduced motion is active OR element is null/undefined, cssClass is
   * applied (when element exists) and callback is invoked synchronously
   * with no delay.
   *
   * Requirements: 7.2, 9.11
   *
   * @param {Element|null} element  - DOM element to apply the CSS class to
   * @param {string}       cssClass - CSS class name to add
   * @param {number}       duration - Nominal transition duration in ms (used for fallback)
   * @param {Function}     [callback] - Called once after the transition completes
   */
  transition(element, cssClass, duration, callback) {
    if (!element) { if (callback) callback(); return; }
    if (this.respectsReducedMotion()) {
      element.classList.add(cssClass);
      if (callback) callback();
      return;
    }
    element.classList.add(cssClass);
    const done = () => {
      element.removeEventListener('transitionend', done);
      element.removeEventListener('animationend', done);
      if (callback) callback();
    };
    element.addEventListener('transitionend', done, { once: true });
    element.addEventListener('animationend', done, { once: true });
    // Fallback: if no transition/animation fires within duration + 50ms, invoke callback
    setTimeout(() => {
      element.removeEventListener('transitionend', done);
      element.removeEventListener('animationend', done);
      if (callback) callback();
    }, duration + 50);
  }
};

export { AnimationService };
