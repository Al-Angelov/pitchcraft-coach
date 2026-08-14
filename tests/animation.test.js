/**
 * Unit test for AnimationService
 * Requirements: 9.11
 *
 * Tests verify:
 * - When prefers-reduced-motion: reduce is active, transition() invokes callback synchronously
 * - When reduced motion is NOT active, transition() adds the CSS class and eventually calls callback
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mirror of AnimationService from index.html
const AnimationService = {
  respectsReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

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
    // Fallback timeout
    setTimeout(() => {
      element.removeEventListener('transitionend', done);
      element.removeEventListener('animationend', done);
      if (callback) callback();
    }, duration + 50);
  }
};

describe('AnimationService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('transition() invokes callback synchronously when prefers-reduced-motion: reduce is active', () => {
    // Mock matchMedia to return reduced motion
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const element = document.createElement('div');
    document.body.appendChild(element);

    let callbackCalled = false;
    AnimationService.transition(element, 'fade-out', 600, () => {
      callbackCalled = true;
    });

    // Callback should have been called synchronously — no timeout needed
    expect(callbackCalled).toBe(true);
    expect(element.classList.contains('fade-out')).toBe(true);

    document.body.removeChild(element);
  });

  it('transition() adds CSS class but does NOT invoke callback synchronously when motion is allowed', () => {
    // Mock matchMedia to return NO reduced motion
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    vi.useFakeTimers();

    const element = document.createElement('div');
    document.body.appendChild(element);

    let callbackCalled = false;
    AnimationService.transition(element, 'slide-up', 250, () => {
      callbackCalled = true;
    });

    // CSS class added immediately
    expect(element.classList.contains('slide-up')).toBe(true);
    // Callback should NOT be called yet (waiting for transitionend or fallback)
    expect(callbackCalled).toBe(false);

    // Advance past the fallback timeout (duration + 50ms)
    vi.advanceTimersByTime(301);
    expect(callbackCalled).toBe(true);

    vi.useRealTimers();
    document.body.removeChild(element);
  });

  it('transition() invokes callback when transitionend event fires', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const element = document.createElement('div');
    document.body.appendChild(element);

    let callbackCalled = false;
    AnimationService.transition(element, 'fade-in', 400, () => {
      callbackCalled = true;
    });

    expect(callbackCalled).toBe(false);

    // Simulate transitionend event
    element.dispatchEvent(new Event('transitionend'));
    expect(callbackCalled).toBe(true);

    document.body.removeChild(element);
  });

  it('transition() invokes callback immediately if element is null', () => {
    let callbackCalled = false;
    AnimationService.transition(null, 'fade-out', 600, () => {
      callbackCalled = true;
    });

    expect(callbackCalled).toBe(true);
  });

  it('respectsReducedMotion() returns true when media query matches', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(AnimationService.respectsReducedMotion()).toBe(true);
  });

  it('respectsReducedMotion() returns false when media query does not match', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    expect(AnimationService.respectsReducedMotion()).toBe(false);
  });
});
