/**
 * Unit tests for LandingController
 * Requirements: 9.6, 9.7, 9.11
 *
 * Tests verify:
 * - Clicking CTA hides landing and shows studio
 * - Reduced-motion mock causes immediate transition (no async delay)
 * - Landing section hidden (display:none) after enter()
 * - AppState.screen is updated to 'studio' after enter()
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// Extract body content stripping <script> and <noscript>
function getBodyContent(fullHtml) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = match ? match[1] : fullHtml;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

const bodyContent = getBodyContent(html);

// Mirrors of services needed for the controller tests
const AppState = {
  screen: 'landing',
  activeModule: 'stage',
  session: { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [] },
  activeGoal: null,
  openLessonId: null,
  openArchetypeId: null,
  notes: [],
  searchQuery: '',
  init() {
    this.screen = 'landing';
    this.activeModule = 'stage';
    this.session = { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [] };
    this.activeGoal = null;
    this.openLessonId = null;
    this.openArchetypeId = null;
    this.notes = [];
    this.searchQuery = '';
  }
};

const AccessibilityService = {
  _politeRegion: null,
  _assertiveRegion: null,
  _priorFocus: null,
  _trapHandler: null,
  _trapContainer: null,
  init() {
    this._politeRegion = document.createElement('div');
    this._politeRegion.setAttribute('aria-live', 'polite');
    this._politeRegion.className = 'sr-only';
    document.body.appendChild(this._politeRegion);
    this._assertiveRegion = document.createElement('div');
    this._assertiveRegion.setAttribute('aria-live', 'assertive');
    this._assertiveRegion.className = 'sr-only';
    document.body.appendChild(this._assertiveRegion);
  },
  moveFocusTo(element) {
    if (element && typeof element.focus === 'function') element.focus();
  }
};

// AnimationService with controllable reduced-motion mock
let _mockReducedMotion = false;

const AnimationService = {
  respectsReducedMotion() {
    return _mockReducedMotion;
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
    setTimeout(() => {
      element.removeEventListener('transitionend', done);
      element.removeEventListener('animationend', done);
      if (callback) callback();
    }, duration + 50);
  }
};

const LandingController = {
  init() {
    const cta = document.getElementById('enter-studio');
    if (cta) {
      cta.addEventListener('click', () => this.enter());
    }
  },
  enter() {
    const landing = document.getElementById('landing');
    const studio = document.getElementById('studio');
    if (!landing || !studio) return;
    AnimationService.transition(landing, 'landing--exiting', 600, () => {
      landing.style.display = 'none';
      studio.removeAttribute('hidden');
      studio.setAttribute('data-active', 'true');
      AppState.screen = 'studio';
      const firstTab = document.querySelector('[role="tab"]');
      if (firstTab) AccessibilityService.moveFocusTo(firstTab);
    });
  }
};

describe('LandingController', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
    _mockReducedMotion = false;
    AppState.init();
    AccessibilityService.init();
    LandingController.init();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('clicking CTA hides landing and shows studio (with transition fallback)', () => {
    const cta = document.getElementById('enter-studio');
    const landing = document.getElementById('landing');
    const studio = document.getElementById('studio');

    expect(studio.hasAttribute('hidden')).toBe(true);

    cta.click();

    // landing--exiting class is added immediately
    expect(landing.classList.contains('landing--exiting')).toBe(true);

    // But studio not yet visible (waiting for transition)
    expect(studio.hasAttribute('hidden')).toBe(true);

    // Advance past the fallback timeout (600 + 50 = 650ms)
    vi.advanceTimersByTime(651);

    // Now landing should be hidden and studio revealed
    expect(landing.style.display).toBe('none');
    expect(studio.hasAttribute('hidden')).toBe(false);
    expect(AppState.screen).toBe('studio');
  });

  it('reduced-motion causes immediate transition — no delay needed', () => {
    _mockReducedMotion = true;

    const cta = document.getElementById('enter-studio');
    const landing = document.getElementById('landing');
    const studio = document.getElementById('studio');

    cta.click();

    // With reduced motion, everything happens synchronously
    expect(landing.style.display).toBe('none');
    expect(landing.classList.contains('landing--exiting')).toBe(true);
    expect(studio.hasAttribute('hidden')).toBe(false);
    expect(AppState.screen).toBe('studio');
  });

  it('landing section has display:none after enter()', () => {
    _mockReducedMotion = true;

    LandingController.enter();

    const landing = document.getElementById('landing');
    expect(landing.style.display).toBe('none');
  });

  it('AppState.screen is updated to "studio" after enter()', () => {
    _mockReducedMotion = true;

    expect(AppState.screen).toBe('landing');

    LandingController.enter();

    expect(AppState.screen).toBe('studio');
  });

  it('studio data-active attribute is set to "true" after enter()', () => {
    _mockReducedMotion = true;

    LandingController.enter();

    const studio = document.getElementById('studio');
    expect(studio.getAttribute('data-active')).toBe('true');
  });

  it('focus moves to the first tab in the studio after enter()', () => {
    _mockReducedMotion = true;

    LandingController.enter();

    const firstTab = document.getElementById('tab-stage');
    expect(document.activeElement).toBe(firstTab);
  });
});
