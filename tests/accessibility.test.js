/**
 * Unit tests for AccessibilityService
 * Requirements: 8.2
 *
 * Tests verify:
 * - Focus trap contains Tab within container (forward and backward)
 * - releaseFocus() restores the previously focused element
 * - announce() writes text to the correct ARIA live region (polite/assertive)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mirror of AccessibilityService from index.html
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

describe('AccessibilityService', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    AccessibilityService._politeRegion = null;
    AccessibilityService._assertiveRegion = null;
    AccessibilityService._priorFocus = null;
    AccessibilityService._trapHandler = null;
    AccessibilityService._trapContainer = null;
    AccessibilityService.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  // ── Focus Trap Tests ─────────────────────────────────────────

  it('trapFocus moves focus to the first focusable element in the container', () => {
    const container = document.createElement('div');
    const btn1 = document.createElement('button'); btn1.textContent = 'First';
    const btn2 = document.createElement('button'); btn2.textContent = 'Second';
    const btn3 = document.createElement('button'); btn3.textContent = 'Third';
    container.append(btn1, btn2, btn3);
    document.body.appendChild(container);

    AccessibilityService.trapFocus(container);

    expect(document.activeElement).toBe(btn1);
  });

  it('focus trap wraps forward Tab from last element back to first', () => {
    const container = document.createElement('div');
    const btn1 = document.createElement('button'); btn1.textContent = 'First';
    const btn2 = document.createElement('button'); btn2.textContent = 'Second';
    const btn3 = document.createElement('button'); btn3.textContent = 'Third';
    container.append(btn1, btn2, btn3);
    document.body.appendChild(container);

    AccessibilityService.trapFocus(container);

    // Move focus to last element
    btn3.focus();
    expect(document.activeElement).toBe(btn3);

    // Simulate Tab keydown on the last element
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      bubbles: true,
      cancelable: true
    });
    container.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(btn1);
  });

  it('focus trap wraps backward Shift+Tab from first element to last', () => {
    const container = document.createElement('div');
    const btn1 = document.createElement('button'); btn1.textContent = 'First';
    const btn2 = document.createElement('button'); btn2.textContent = 'Second';
    const btn3 = document.createElement('button'); btn3.textContent = 'Third';
    container.append(btn1, btn2, btn3);
    document.body.appendChild(container);

    AccessibilityService.trapFocus(container);

    // Focus is on first element after trapFocus
    expect(document.activeElement).toBe(btn1);

    // Simulate Shift+Tab keydown on the first element
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true
    });
    container.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(btn3);
  });

  it('focus trap ignores non-Tab key events', () => {
    const container = document.createElement('div');
    const btn1 = document.createElement('button'); btn1.textContent = 'First';
    const btn2 = document.createElement('button'); btn2.textContent = 'Second';
    container.append(btn1, btn2);
    document.body.appendChild(container);

    AccessibilityService.trapFocus(container);
    btn2.focus();

    // Simulate Enter key — should not change focus
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true
    });
    container.dispatchEvent(enterEvent);

    expect(document.activeElement).toBe(btn2);
  });

  // ── releaseFocus Tests ───────────────────────────────────────

  it('releaseFocus restores focus to the element that was focused before trapFocus', () => {
    // Set up an element to be focused before trapping
    const outsideBtn = document.createElement('button');
    outsideBtn.textContent = 'Outside';
    document.body.appendChild(outsideBtn);
    outsideBtn.focus();
    expect(document.activeElement).toBe(outsideBtn);

    // Create trap container
    const container = document.createElement('div');
    const innerBtn = document.createElement('button'); innerBtn.textContent = 'Inside';
    container.appendChild(innerBtn);
    document.body.appendChild(container);

    AccessibilityService.trapFocus(container);
    expect(document.activeElement).toBe(innerBtn);

    // Release focus — should restore to outsideBtn
    AccessibilityService.releaseFocus();
    expect(document.activeElement).toBe(outsideBtn);
  });

  it('releaseFocus removes the keydown handler from the container', () => {
    const container = document.createElement('div');
    const btn1 = document.createElement('button'); btn1.textContent = 'First';
    const btn2 = document.createElement('button'); btn2.textContent = 'Last';
    container.append(btn1, btn2);
    document.body.appendChild(container);

    AccessibilityService.trapFocus(container);
    AccessibilityService.releaseFocus();

    // After release, Tab on the last element should NOT wrap
    btn2.focus();
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      bubbles: true,
      cancelable: true
    });
    container.dispatchEvent(tabEvent);

    // Focus should remain on btn2 (trap handler removed, browser doesn't move focus in jsdom)
    expect(document.activeElement).toBe(btn2);
  });

  // ── announce Tests ───────────────────────────────────────────

  it('announce writes text to the polite live region by default', async () => {
    vi.useFakeTimers();

    AccessibilityService.announce('Phase changed to Solution');

    // Text set after 1ms setTimeout
    vi.advanceTimersByTime(2);

    const politeRegion = document.querySelector('[aria-live="polite"]');
    expect(politeRegion.textContent).toBe('Phase changed to Solution');

    vi.useRealTimers();
  });

  it('announce writes text to the assertive live region when politeness is "assertive"', async () => {
    vi.useFakeTimers();

    AccessibilityService.announce('Curveball incoming!', 'assertive');

    vi.advanceTimersByTime(2);

    const assertiveRegion = document.querySelector('[aria-live="assertive"]');
    expect(assertiveRegion.textContent).toBe('Curveball incoming!');

    vi.useRealTimers();
  });

  it('announce clears region text before setting new text (for screen reader re-announcement)', () => {
    vi.useFakeTimers();

    AccessibilityService.announce('First announcement');
    vi.advanceTimersByTime(2);

    const politeRegion = document.querySelector('[aria-live="polite"]');
    expect(politeRegion.textContent).toBe('First announcement');

    // Announce again — should clear then set
    AccessibilityService.announce('Second announcement');
    // Immediately after call, text should be cleared
    expect(politeRegion.textContent).toBe('');

    vi.advanceTimersByTime(2);
    expect(politeRegion.textContent).toBe('Second announcement');

    vi.useRealTimers();
  });
});
