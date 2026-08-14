// js/services/AccessibilityService.js

/* ============================================================
   AccessibilityService — ARIA live regions, focus management, and focus trapping
   Requirements: 8.2, 8.3
============================================================ */
const AccessibilityService = {
  _politeRegion: null,
  _assertiveRegion: null,
  _priorFocus: null,
  _trapHandler: null,
  _trapContainer: null,

  init() {
    this._politeRegion = document.createElement('div');
    this._politeRegion.setAttribute('aria-live', 'polite');
    this._politeRegion.setAttribute('aria-atomic', 'true');
    this._politeRegion.className = 'sr-only';
    document.body.appendChild(this._politeRegion);

    this._assertiveRegion = document.createElement('div');
    this._assertiveRegion.setAttribute('aria-live', 'assertive');
    this._assertiveRegion.setAttribute('aria-atomic', 'true');
    this._assertiveRegion.className = 'sr-only';
    document.body.appendChild(this._assertiveRegion);
  },

  announce(text, politeness = 'polite') {
    const region = politeness === 'assertive' ? this._assertiveRegion : this._politeRegion;
    if (!region) return;
    region.textContent = '';
    setTimeout(() => { region.textContent = text; }, 1);
  },

  moveFocusTo(element) {
    if (element && typeof element.focus === 'function') element.focus({ preventScroll: false });
  },

  trapFocus(container) {
    this._priorFocus = document.activeElement;
    const focusable = Array.from(container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled);
    if (!focusable.length) return;
    focusable[0].focus();
    this._trapContainer = container;
    this._trapHandler = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    container.addEventListener('keydown', this._trapHandler);
  },

  releaseFocus() {
    if (this._trapContainer && this._trapHandler) {
      this._trapContainer.removeEventListener('keydown', this._trapHandler);
    }
    this._trapHandler = null;
    this._trapContainer = null;
    if (this._priorFocus && typeof this._priorFocus.focus === 'function') {
      this._priorFocus.focus();
    }
    this._priorFocus = null;
  }
};

export { AccessibilityService };
