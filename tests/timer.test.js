/**
 * Unit tests for timer engine: countdown, pause/resume, Free Mode, curveball overlay
 * Requirements: 2.1, 2.4, 2.5, 3.2, 8.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

function getBodyContent(fullHtml) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = match ? match[1] : fullHtml;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

const bodyContent = getBodyContent(html);

// SESSION_MODES mirror
const SESSION_MODES = [
  { id: 'elevator-60', label: '60-Second Elevator Pitch', durationSeconds: 60, isFreeMode: false, phases: [
    { name: 'Hook', startPercent: 0, endPercent: 0.25 },
    { name: 'Problem', startPercent: 0.25, endPercent: 0.5 },
    { name: 'Solution', startPercent: 0.5, endPercent: 0.75 },
    { name: 'CTA', startPercent: 0.75, endPercent: 1.0 }
  ]},
  { id: 'free', label: 'Free Mode', durationSeconds: 0, isFreeMode: true, phases: [] }
];

// CURVEBALL_POOL (minimal subset for testing)
const CURVEBALL_POOL = [
  { id: 'cb-test-01', category: 'skepticism', prompt: 'Test curveball', advice: 'Test advice' },
  { id: 'cb-test-02', category: 'clarification', prompt: 'Another curveball', advice: 'Another advice' }
];

// AppState mirror
const AppState = {
  screen: 'studio',
  activeModule: 'stage',
  session: { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [] },
  activeGoal: null,
  init() {
    this.session = { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [] };
  }
};

// AccessibilityService mirror
const AccessibilityService = {
  _lastAnnounce: null,
  _lastPoliteness: null,
  _trapped: false,
  init() {},
  announce(text, politeness) { this._lastAnnounce = text; this._lastPoliteness = politeness; },
  moveFocusTo(el) { if (el) el.focus(); },
  trapFocus(container) { this._trapped = true; },
  releaseFocus() { this._trapped = false; }
};

// StageController mirror (core timer methods)
const StageController = {
  _intervalId: null,
  _startTime: null,
  _pausedElapsed: 0,
  _lastPhaseIndex: -1,
  _curveballScheduledAt: null,

  getCurrentPhase(elapsed, mode) {
    if (!mode || mode.isFreeMode || !mode.phases.length) return null;
    const ratio = Math.min(elapsed / mode.durationSeconds, 1);
    for (let i = 0; i < mode.phases.length; i++) {
      const phase = mode.phases[i];
      if (i === mode.phases.length - 1) {
        if (ratio >= phase.startPercent && ratio <= phase.endPercent) return phase;
      } else {
        if (ratio >= phase.startPercent && ratio < phase.endPercent) return phase;
      }
    }
    return mode.phases[mode.phases.length - 1];
  },

  startSession() {
    const mode = AppState.session.mode;
    if (!mode) return;
    AppState.session.status = 'running';
    AppState.session.elapsed = 0;
    AppState.session.phasesCompleted = [];
    AppState.session.curveballsShown = [];
    this._pausedElapsed = 0;
    this._lastPhaseIndex = -1;
    this._startTime = performance.now();
    if (!mode.isFreeMode && mode.durationSeconds > 0) {
      this._curveballScheduledAt = Math.floor(mode.durationSeconds * 0.4);
    } else {
      this._curveballScheduledAt = null;
    }
    const modeSelection = document.getElementById('mode-selection');
    const timerDisplay = document.getElementById('timer-display');
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnStop = document.getElementById('btn-stop');
    if (modeSelection) modeSelection.setAttribute('hidden', '');
    if (timerDisplay) timerDisplay.removeAttribute('hidden');
    if (btnStart) btnStart.setAttribute('hidden', '');
    if (btnPause) btnPause.removeAttribute('hidden');
    if (btnStop) btnStop.removeAttribute('hidden');
    this._intervalId = setInterval(() => this.tick(), 1000);
    this.renderTimer();
  },

  tick() {
    const mode = AppState.session.mode;
    if (!mode || AppState.session.status !== 'running') return;
    const now = performance.now();
    const deltaSeconds = (now - this._startTime) / 1000;
    AppState.session.elapsed = this._pausedElapsed + deltaSeconds;
    this.renderTimer();
    if (!mode.isFreeMode) {
      if (AppState.session.elapsed >= mode.durationSeconds) {
        this.endSession();
        return;
      }
    }
  },

  pauseSession() {
    if (AppState.session.status !== 'running') return;
    clearInterval(this._intervalId);
    this._intervalId = null;
    const now = performance.now();
    this._pausedElapsed += (now - this._startTime) / 1000;
    AppState.session.status = 'paused';
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    if (btnPause) btnPause.setAttribute('hidden', '');
    if (btnResume) btnResume.removeAttribute('hidden');
  },

  resumeSession() {
    if (AppState.session.status !== 'paused') return;
    AppState.session.status = 'running';
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    if (btnPause) btnPause.removeAttribute('hidden');
    if (btnResume) btnResume.setAttribute('hidden', '');
    this._startTime = performance.now();
    this._intervalId = setInterval(() => this.tick(), 1000);
  },

  triggerCurveball() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    const now = performance.now();
    this._pausedElapsed += (now - this._startTime) / 1000;
    AppState.session.status = 'paused';
    let available = CURVEBALL_POOL.filter(cb => !AppState.session.curveballsShown.includes(cb.id));
    if (available.length === 0) {
      AppState.session.curveballsShown = [];
      available = CURVEBALL_POOL.slice();
    }
    const curveball = available[Math.floor(Math.random() * available.length)];
    AppState.session.curveballsShown.push(curveball.id);
    const overlay = document.getElementById('curveball-overlay');
    const promptEl = document.getElementById('curveball-prompt');
    const adviceEl = document.getElementById('curveball-advice');
    if (promptEl) promptEl.textContent = curveball.prompt;
    if (adviceEl) adviceEl.textContent = curveball.advice;
    if (overlay) overlay.removeAttribute('hidden');
    AccessibilityService.announce(`Curveball: ${curveball.prompt}`, 'assertive');
    if (overlay) AccessibilityService.trapFocus(overlay);
  },

  dismissCurveball() {
    const overlay = document.getElementById('curveball-overlay');
    if (overlay) overlay.setAttribute('hidden', '');
    AccessibilityService.releaseFocus();
    AppState.session.status = 'running';
    this._startTime = performance.now();
    this._intervalId = setInterval(() => this.tick(), 1000);
  },

  endSession() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    AppState.session.status = 'completed';
    const sessionSummary = document.getElementById('session-summary');
    if (sessionSummary) sessionSummary.removeAttribute('hidden');
  },

  renderTimer() {
    const mode = AppState.session.mode;
    const timerValue = document.getElementById('timer-value');
    if (!timerValue) return;
    if (mode && !mode.isFreeMode) {
      const remaining = Math.max(0, Math.ceil(mode.durationSeconds - AppState.session.elapsed));
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      timerValue.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    } else {
      const elapsed = Math.floor(AppState.session.elapsed);
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      timerValue.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
  }
};

describe('Timer Engine', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
    AppState.init();
    AccessibilityService._lastAnnounce = null;
    AccessibilityService._trapped = false;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (StageController._intervalId) clearInterval(StageController._intervalId);
    StageController._intervalId = null;
    document.body.innerHTML = '';
  });

  it('countdown timer shows correct initial time for 60s mode', () => {
    AppState.session.mode = SESSION_MODES[0]; // 60s
    StageController.startSession();

    const timerValue = document.getElementById('timer-value');
    expect(timerValue.textContent).toBe('01:00');
  });

  it('countdown decreases after simulated time via performance.now', () => {
    AppState.session.mode = SESSION_MODES[0]; // 60s
    let mockTime = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

    StageController._startTime = 1000;
    StageController._pausedElapsed = 0;
    AppState.session.status = 'running';
    StageController._intervalId = 1; // fake
    StageController.renderTimer(); // should show 01:00

    // Simulate 10 seconds passing
    mockTime = 11000;
    AppState.session.elapsed = 10;
    StageController.renderTimer();

    const timerValue = document.getElementById('timer-value');
    expect(timerValue.textContent).toBe('00:50');
  });

  it('Free Mode shows count-up timer', () => {
    AppState.session.mode = SESSION_MODES[1]; // Free Mode
    AppState.session.elapsed = 125; // 2m 5s
    StageController.renderTimer();

    const timerValue = document.getElementById('timer-value');
    expect(timerValue.textContent).toBe('02:05');
  });

  it('pauseSession sets status to paused and updates pause/resume buttons', () => {
    AppState.session.mode = SESSION_MODES[0];
    let mockTime = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => mockTime);
    StageController.startSession();

    mockTime = 5000; // 4 seconds elapsed
    StageController.pauseSession();

    expect(AppState.session.status).toBe('paused');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    expect(btnPause.hasAttribute('hidden')).toBe(true);
    expect(btnResume.hasAttribute('hidden')).toBe(false);
  });

  it('resumeSession sets status back to running and updates pause/resume buttons', () => {
    AppState.session.mode = SESSION_MODES[0];
    let mockTime = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => mockTime);
    StageController.startSession();

    mockTime = 5000;
    StageController.pauseSession();
    expect(AppState.session.status).toBe('paused');

    mockTime = 8000;
    StageController.resumeSession();
    expect(AppState.session.status).toBe('running');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    expect(btnPause.hasAttribute('hidden')).toBe(false);
    expect(btnResume.hasAttribute('hidden')).toBe(true);
  });

  it('endSession sets status to completed and shows summary', () => {
    AppState.session.mode = SESSION_MODES[0];
    let mockTime = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => mockTime);
    StageController.startSession();

    StageController.endSession();

    expect(AppState.session.status).toBe('completed');
    const summary = document.getElementById('session-summary');
    expect(summary.hasAttribute('hidden')).toBe(false);
  });

  it('triggerCurveball shows overlay and announces on assertive region', () => {
    AppState.session.mode = SESSION_MODES[0];
    let mockTime = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => mockTime);
    StageController.startSession();

    mockTime = 5000;
    StageController.triggerCurveball();

    const overlay = document.getElementById('curveball-overlay');
    expect(overlay.hasAttribute('hidden')).toBe(false);
    expect(AccessibilityService._lastPoliteness).toBe('assertive');
    expect(AccessibilityService._trapped).toBe(true);
    expect(AppState.session.curveballsShown.length).toBe(1);
  });

  it('dismissCurveball hides overlay and resumes session', () => {
    AppState.session.mode = SESSION_MODES[0];
    let mockTime = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => mockTime);
    StageController.startSession();

    mockTime = 5000;
    StageController.triggerCurveball();
    expect(AppState.session.status).toBe('paused');

    mockTime = 10000;
    StageController.dismissCurveball();

    const overlay = document.getElementById('curveball-overlay');
    expect(overlay.hasAttribute('hidden')).toBe(true);
    expect(AccessibilityService._trapped).toBe(false);
    expect(AppState.session.status).toBe('running');
  });
});
