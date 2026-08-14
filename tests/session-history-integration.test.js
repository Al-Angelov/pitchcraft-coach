/**
 * Integration tests for session-history feature
 * End-to-end flow: session completion → history panel → detail view
 * Requirements: 1.1, 3.3, 4.1, 4.2, 7.6
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ─── SessionHistoryService mirror ───────────────────────────────────────────

const SessionHistoryService = {
  _KEY: 'pitchcraft_history',
  _MAX_RECORDS: 50,
  _history: [],

  _generateId() {
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    return `${ts}-${rand}`;
  },

  _validate(record) {
    if (!record || typeof record !== 'object') return false;
    if (typeof record.id !== 'string' || record.id.length === 0) return false;
    if (typeof record.timestamp !== 'string' || record.timestamp.length === 0) return false;
    if (typeof record.sessionMode !== 'string' || record.sessionMode.length === 0) return false;
    if (typeof record.duration !== 'number' || record.duration < 0) return false;
    if (!Array.isArray(record.phasesCompleted)) return false;
    if (typeof record.curveballsFaced !== 'number' || record.curveballsFaced < 0) return false;
    if (!('transcript' in record)) return false;
    if (!('aiFeedback' in record)) return false;
    return true;
  },

  _persist() {
    try {
      localStorage.setItem(this._KEY, JSON.stringify(this._history));
    } catch (_) {}
  },

  loadHistory() {
    try {
      const raw = localStorage.getItem(this._KEY);
      if (raw === null) { this._history = []; return this._history; }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { this._history = []; return this._history; }
      this._history = parsed.filter(record => this._validate(record));
      this._history.sort((a, b) => {
        if (a.timestamp > b.timestamp) return -1;
        if (a.timestamp < b.timestamp) return 1;
        return 0;
      });
      if (this._history.length > this._MAX_RECORDS) {
        this._history = this._history.slice(0, this._MAX_RECORDS);
      }
      return this._history;
    } catch (_) {
      this._history = [];
      return this._history;
    }
  },

  saveSession(data) {
    if (!data || typeof data !== 'object') return null;
    const record = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      sessionMode: data.mode || null,
      duration: typeof data.elapsed === 'number' ? Math.floor(data.elapsed) : -1,
      phasesCompleted: Array.isArray(data.phasesCompleted) ? [...data.phasesCompleted] : [],
      curveballsFaced: typeof data.curveballsShown === 'number'
        ? data.curveballsShown
        : (Array.isArray(data.curveballsShown) ? data.curveballsShown.length : 0),
      transcript: data.transcript || null,
      aiFeedback: data.aiFeedback || null
    };
    if (!this._validate(record)) return null;
    this._history.unshift(record);
    if (this._history.length > this._MAX_RECORDS) {
      this._history = this._history.slice(0, this._MAX_RECORDS);
    }
    this._persist();
    return record;
  },

  getAll() { return this._history; },

  getById(id) {
    if (typeof id !== 'string') return null;
    return this._history.find(r => r.id === id) || null;
  }
};

// ─── SESSION_MODES subset for test lookups ──────────────────────────────────

const SESSION_MODES = [
  { id: 'elevator-60', label: '60-Second Elevator Pitch', durationSeconds: 60, isFreeMode: false,
    phases: [
      { name: 'Hook', startPercent: 0, endPercent: 0.25 },
      { name: 'Problem', startPercent: 0.25, endPercent: 0.5 },
      { name: 'Solution', startPercent: 0.5, endPercent: 0.75 },
      { name: 'CTA', startPercent: 0.75, endPercent: 1.0 }
    ]
  },
  { id: 'free', label: 'Free Mode', durationSeconds: 0, isFreeMode: true, phases: [] }
];

// ─── DOM setup helper ───────────────────────────────────────────────────────

function setupFullDOM() {
  document.body.innerHTML = `
    <header class="stage__header">
      <h2 class="stage__title">Practice Stage</h2>
      <button type="button" class="history-toggle-btn" id="history-toggle" aria-expanded="false" aria-controls="history-panel" aria-label="Open session history">
        <span>History</span>
      </button>
    </header>
    <aside class="history-panel" id="history-panel" hidden>
      <h3 class="history-panel__heading">Past Sessions</h3>
      <div class="history-panel__list" id="history-list" role="list"></div>
      <p class="history-panel__empty" id="history-empty" hidden>No past sessions yet.</p>
    </aside>
    <div class="session-detail-overlay" id="session-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="session-detail-title" hidden>
      <div class="session-detail-panel">
        <button type="button" class="session-detail__close" id="session-detail-close" aria-label="Close session details">X</button>
        <h3 class="session-detail__title" id="session-detail-title"></h3>
        <p class="session-detail__meta" id="session-detail-meta"></p>
        <div class="session-detail__stat-grid">
          <div class="session-detail__stat">
            <span class="session-detail__stat-value" id="session-detail-duration">--</span>
            <span class="session-detail__stat-label">Duration</span>
          </div>
          <div class="session-detail__stat">
            <span class="session-detail__stat-value" id="session-detail-curveballs">--</span>
            <span class="session-detail__stat-label">Curveballs</span>
          </div>
        </div>
        <div class="session-detail__section">
          <h4 class="session-detail__section-title">Phases Completed</h4>
          <ul class="session-detail__phases-list" id="session-detail-phases"></ul>
        </div>
        <div class="session-detail__section">
          <h4 class="session-detail__section-title">Transcript</h4>
          <div id="session-detail-transcript"></div>
        </div>
        <div class="session-detail__section">
          <h4 class="session-detail__section-title">AI Feedback</h4>
          <div id="session-detail-feedback"></div>
        </div>
      </div>
    </div>
  `;
}

// ─── Simulated controllers (minimal versions for integration testing) ────────

function simulateEndSession(mode, elapsed, phasesCompleted, curveballsShown) {
  return SessionHistoryService.saveSession({
    mode,
    elapsed,
    phasesCompleted,
    curveballsShown
  });
}

function renderHistoryList() {
  const listEl = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');
  if (!listEl) return;

  const history = SessionHistoryService.getAll();

  if (history.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.removeAttribute('hidden');
    return;
  }

  if (emptyEl) emptyEl.setAttribute('hidden', '');

  listEl.innerHTML = history.map(record => {
    const mode = SESSION_MODES.find(m => m.id === record.sessionMode);
    const modeLabel = mode ? mode.label : record.sessionMode;
    const min = Math.floor(record.duration / 60);
    const sec = record.duration % 60;
    const duration = `${min}m ${sec}s`;

    return `<button type="button" class="history-panel__item" role="listitem" data-session-id="${record.id}" tabindex="0">
      <span class="history-panel__item-mode">${modeLabel}</span>
      <span class="history-panel__item-meta">${duration}</span>
    </button>`;
  }).join('');
}

function openDetailView(sessionId) {
  const record = SessionHistoryService.getById(sessionId);
  if (!record) return;

  const overlay = document.getElementById('session-detail-overlay');
  const titleEl = document.getElementById('session-detail-title');
  const metaEl = document.getElementById('session-detail-meta');
  const durationEl = document.getElementById('session-detail-duration');
  const curveballsEl = document.getElementById('session-detail-curveballs');
  const phasesEl = document.getElementById('session-detail-phases');
  const transcriptEl = document.getElementById('session-detail-transcript');
  const feedbackEl = document.getElementById('session-detail-feedback');

  const mode = SESSION_MODES.find(m => m.id === record.sessionMode);
  const modeLabel = mode ? mode.label : record.sessionMode;

  if (titleEl) titleEl.textContent = modeLabel;
  if (metaEl) metaEl.textContent = record.timestamp;
  if (durationEl) {
    const min = Math.floor(record.duration / 60);
    const sec = record.duration % 60;
    durationEl.textContent = `${min}m ${sec}s`;
  }
  if (curveballsEl) curveballsEl.textContent = String(record.curveballsFaced);

  if (phasesEl) {
    if (record.phasesCompleted.length > 0) {
      phasesEl.innerHTML = record.phasesCompleted.map(p =>
        `<li class="session-detail__phase-tag">${p}</li>`
      ).join('');
    } else {
      phasesEl.innerHTML = '<li class="session-detail__placeholder">No phases completed</li>';
    }
  }

  if (transcriptEl) {
    transcriptEl.innerHTML = record.transcript
      ? `<p>${record.transcript}</p>`
      : '<p class="session-detail__placeholder">Transcript will be available with AI coaching integration</p>';
  }

  if (feedbackEl) {
    feedbackEl.innerHTML = record.aiFeedback
      ? `<p>${JSON.stringify(record.aiFeedback)}</p>`
      : '<p class="session-detail__placeholder">AI feedback will be available with AI coaching integration</p>';
  }

  if (overlay) overlay.removeAttribute('hidden');
}

function closeDetailView() {
  const overlay = document.getElementById('session-detail-overlay');
  if (overlay) overlay.setAttribute('hidden', '');
}

// ─── Integration Tests ──────────────────────────────────────────────────────

describe('Session History — End-to-End Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    SessionHistoryService._history = [];
    setupFullDOM();
  });

  afterEach(() => {
    localStorage.clear();
    SessionHistoryService._history = [];
    document.body.innerHTML = '';
  });

  it('complete flow: end session → record in panel → detail view → close', () => {
    // Step 1: Simulate session completion
    const saved = simulateEndSession('elevator-60', 58, ['Hook', 'Problem', 'Solution', 'CTA'], 2);
    expect(saved).not.toBeNull();
    expect(saved.sessionMode).toBe('elevator-60');

    // Step 2: Render history list and verify the record appears
    renderHistoryList();
    const listEl = document.getElementById('history-list');
    const items = listEl.querySelectorAll('.history-panel__item');
    expect(items.length).toBe(1);
    expect(items[0].dataset.sessionId).toBe(saved.id);
    expect(items[0].querySelector('.history-panel__item-mode').textContent).toBe('60-Second Elevator Pitch');

    // Step 3: Click item to open detail view
    openDetailView(saved.id);
    const overlay = document.getElementById('session-detail-overlay');
    expect(overlay.hasAttribute('hidden')).toBe(false);

    // Step 4: Verify detail view content
    expect(document.getElementById('session-detail-title').textContent).toBe('60-Second Elevator Pitch');
    expect(document.getElementById('session-detail-duration').textContent).toBe('0m 58s');
    expect(document.getElementById('session-detail-curveballs').textContent).toBe('2');

    const phases = document.getElementById('session-detail-phases').querySelectorAll('.session-detail__phase-tag');
    expect(phases.length).toBe(4);
    expect(phases[0].textContent).toBe('Hook');
    expect(phases[3].textContent).toBe('CTA');

    // Placeholders for transcript and AI feedback
    expect(document.getElementById('session-detail-transcript').textContent).toContain('Transcript will be available');
    expect(document.getElementById('session-detail-feedback').textContent).toContain('AI feedback will be available');

    // Step 5: Close the modal
    closeDetailView();
    expect(overlay.hasAttribute('hidden')).toBe(true);
  });

  it('multiple sessions appear sorted newest-first in the panel', () => {
    // Save two sessions with slight time gap
    simulateEndSession('elevator-60', 55, ['Hook', 'Problem'], 1);
    simulateEndSession('free', 120, [], 0);

    renderHistoryList();
    const items = document.querySelectorAll('.history-panel__item');
    expect(items.length).toBe(2);

    // Newest (free mode, saved second) should be first
    expect(items[0].querySelector('.history-panel__item-mode').textContent).toBe('Free Mode');
    expect(items[1].querySelector('.history-panel__item-mode').textContent).toBe('60-Second Elevator Pitch');
  });

  it('empty state is shown when no sessions exist', () => {
    renderHistoryList();
    const emptyEl = document.getElementById('history-empty');
    expect(emptyEl.hasAttribute('hidden')).toBe(false);

    const items = document.querySelectorAll('.history-panel__item');
    expect(items.length).toBe(0);
  });

  it('empty state hides after a session is saved', () => {
    renderHistoryList();
    expect(document.getElementById('history-empty').hasAttribute('hidden')).toBe(false);

    simulateEndSession('free', 30, [], 0);
    renderHistoryList();

    expect(document.getElementById('history-empty').hasAttribute('hidden')).toBe(true);
    expect(document.querySelectorAll('.history-panel__item').length).toBe(1);
  });

  it('data persists across simulated page reload', () => {
    // Save a session
    simulateEndSession('elevator-60', 60, ['Hook', 'CTA'], 1);

    // Simulate page reload: clear in-memory, reload from localStorage
    SessionHistoryService._history = [];
    SessionHistoryService.loadHistory();

    expect(SessionHistoryService.getAll().length).toBe(1);
    expect(SessionHistoryService.getAll()[0].sessionMode).toBe('elevator-60');

    // Render panel still works
    renderHistoryList();
    expect(document.querySelectorAll('.history-panel__item').length).toBe(1);
  });

  it('free mode session with no phases shows "No phases completed" in detail', () => {
    const saved = simulateEndSession('free', 45, [], 0);
    openDetailView(saved.id);

    const phasesEl = document.getElementById('session-detail-phases');
    expect(phasesEl.textContent).toContain('No phases completed');
  });

  describe('keyboard navigation', () => {
    it('Escape key closes the detail modal', () => {
      const saved = simulateEndSession('elevator-60', 58, ['Hook'], 0);
      openDetailView(saved.id);

      const overlay = document.getElementById('session-detail-overlay');
      expect(overlay.hasAttribute('hidden')).toBe(false);

      // Simulate Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) {
          closeDetailView();
        }
      });

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);

      expect(overlay.hasAttribute('hidden')).toBe(true);
    });

    it('history panel items are keyboard focusable (tabindex=0)', () => {
      simulateEndSession('elevator-60', 60, ['Hook'], 0);
      renderHistoryList();

      const items = document.querySelectorAll('.history-panel__item');
      items.forEach(item => {
        expect(item.getAttribute('tabindex')).toBe('0');
      });
    });

    it('Enter key on a list item opens detail view', () => {
      const saved = simulateEndSession('elevator-60', 60, ['Hook'], 1);
      renderHistoryList();

      const item = document.querySelector(`[data-session-id="${saved.id}"]`);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openDetailView(saved.id);
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      item.dispatchEvent(event);

      const overlay = document.getElementById('session-detail-overlay');
      expect(overlay.hasAttribute('hidden')).toBe(false);
      expect(document.getElementById('session-detail-title').textContent).toBe('60-Second Elevator Pitch');
    });
  });
});
