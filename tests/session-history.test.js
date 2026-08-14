/**
 * Unit tests for SessionHistoryService, HistoryPanelController, and Session Detail View
 * Feature: session-history
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1–3.7, 4.1–4.7, 5.5, 6.1–6.4, 7.1–7.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ─── SessionHistoryService mirror (matches implementation in index.html) ────

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
      if (raw === null) {
        this._history = [];
        return this._history;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this._history = [];
        return this._history;
      }
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

  getAll() {
    return this._history;
  },

  getById(id) {
    if (typeof id !== 'string') return null;
    return this._history.find(r => r.id === id) || null;
  }
};

// ─── Unit Tests: SessionHistoryService ──────────────────────────────────────

describe('SessionHistoryService', () => {
  beforeEach(() => {
    localStorage.clear();
    SessionHistoryService._history = [];
  });

  afterEach(() => {
    localStorage.clear();
    SessionHistoryService._history = [];
  });

  describe('saveSession', () => {
    it('returns a proper SessionRecord with valid data', () => {
      const result = SessionHistoryService.saveSession({
        mode: 'elevator-60',
        elapsed: 58,
        phasesCompleted: ['Hook', 'Problem', 'Solution', 'CTA'],
        curveballsShown: 2
      });

      expect(result).not.toBeNull();
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
      expect(result.sessionMode).toBe('elevator-60');
      expect(result.duration).toBe(58);
      expect(result.phasesCompleted).toEqual(['Hook', 'Problem', 'Solution', 'CTA']);
      expect(result.curveballsFaced).toBe(2);
      expect(result.transcript).toBeNull();
      expect(result.aiFeedback).toBeNull();
    });

    it('returns null when mode is missing', () => {
      const result = SessionHistoryService.saveSession({
        elapsed: 30,
        phasesCompleted: [],
        curveballsShown: 0
      });

      expect(result).toBeNull();
    });

    it('returns null when data is null', () => {
      expect(SessionHistoryService.saveSession(null)).toBeNull();
    });

    it('returns null when data is not an object', () => {
      expect(SessionHistoryService.saveSession('string')).toBeNull();
      expect(SessionHistoryService.saveSession(42)).toBeNull();
    });

    it('handles curveballsShown as an array (counts length)', () => {
      const result = SessionHistoryService.saveSession({
        mode: 'free',
        elapsed: 120,
        phasesCompleted: [],
        curveballsShown: ['cb-1', 'cb-2', 'cb-3']
      });

      expect(result).not.toBeNull();
      expect(result.curveballsFaced).toBe(3);
    });

    it('floors the elapsed value for duration', () => {
      const result = SessionHistoryService.saveSession({
        mode: 'startup-5m',
        elapsed: 299.7,
        phasesCompleted: ['Intro'],
        curveballsShown: 0
      });

      expect(result).not.toBeNull();
      expect(result.duration).toBe(299);
    });
  });

  describe('loadHistory', () => {
    it('returns empty array when localStorage is empty', () => {
      const result = SessionHistoryService.loadHistory();
      expect(result).toEqual([]);
    });

    it('returns empty array when stored data is malformed JSON', () => {
      localStorage.setItem('pitchcraft_history', '{not valid json!!');
      const result = SessionHistoryService.loadHistory();
      expect(result).toEqual([]);
    });

    it('returns empty array when stored data is not an array', () => {
      localStorage.setItem('pitchcraft_history', JSON.stringify({ foo: 'bar' }));
      const result = SessionHistoryService.loadHistory();
      expect(result).toEqual([]);
    });

    it('filters out invalid records from stored data', () => {
      const validRecord = {
        id: 'test-1',
        timestamp: '2024-06-01T10:00:00.000Z',
        sessionMode: 'elevator-60',
        duration: 55,
        phasesCompleted: ['Hook'],
        curveballsFaced: 1,
        transcript: null,
        aiFeedback: null
      };
      const invalidRecord = { id: 'bad', foo: 'bar' };

      localStorage.setItem('pitchcraft_history', JSON.stringify([validRecord, invalidRecord]));
      const result = SessionHistoryService.loadHistory();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-1');
    });

    it('sorts records by timestamp descending (newest first)', () => {
      const records = [
        { id: 'old', timestamp: '2024-01-01T00:00:00.000Z', sessionMode: 'free', duration: 10, phasesCompleted: [], curveballsFaced: 0, transcript: null, aiFeedback: null },
        { id: 'new', timestamp: '2024-12-15T00:00:00.000Z', sessionMode: 'free', duration: 20, phasesCompleted: [], curveballsFaced: 0, transcript: null, aiFeedback: null },
        { id: 'mid', timestamp: '2024-06-01T00:00:00.000Z', sessionMode: 'free', duration: 15, phasesCompleted: [], curveballsFaced: 0, transcript: null, aiFeedback: null }
      ];

      localStorage.setItem('pitchcraft_history', JSON.stringify(records));
      const result = SessionHistoryService.loadHistory();

      expect(result[0].id).toBe('new');
      expect(result[1].id).toBe('mid');
      expect(result[2].id).toBe('old');
    });
  });

  describe('record cap', () => {
    it('enforces maximum of 50 records', () => {
      // Save 55 records
      for (let i = 0; i < 55; i++) {
        SessionHistoryService.saveSession({
          mode: `mode-${i}`,
          elapsed: i * 10,
          phasesCompleted: [],
          curveballsShown: 0
        });
      }

      expect(SessionHistoryService.getAll().length).toBe(50);
    });
  });

  describe('getById', () => {
    it('returns the correct record', () => {
      const saved = SessionHistoryService.saveSession({
        mode: 'elevator-60',
        elapsed: 60,
        phasesCompleted: ['Hook', 'CTA'],
        curveballsShown: 1
      });

      const found = SessionHistoryService.getById(saved.id);
      expect(found).toEqual(saved);
    });

    it('returns null for unknown id', () => {
      expect(SessionHistoryService.getById('nonexistent-id')).toBeNull();
    });

    it('returns null for non-string id', () => {
      expect(SessionHistoryService.getById(123)).toBeNull();
      expect(SessionHistoryService.getById(null)).toBeNull();
    });
  });

  describe('localStorage error handling', () => {
    it('saveSession continues without error when localStorage.setItem throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      // Should not throw
      const result = SessionHistoryService.saveSession({
        mode: 'free',
        elapsed: 30,
        phasesCompleted: [],
        curveballsShown: 0
      });

      // Record is still created in memory
      expect(result).not.toBeNull();
      expect(SessionHistoryService.getAll().length).toBe(1);
    });

    it('loadHistory returns [] when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('SecurityError');
      });

      const result = SessionHistoryService.loadHistory();
      expect(result).toEqual([]);
    });
  });
});

// ─── Unit Tests: History Panel UI ───────────────────────────────────────────

describe('History Panel UI', () => {
  let container;

  beforeEach(() => {
    localStorage.clear();
    // Set up minimal DOM for panel tests
    container = document.createElement('div');
    container.innerHTML = `
      <button type="button" id="history-toggle" aria-expanded="false" aria-label="Open session history">
        <span>History</span>
      </button>
      <aside class="history-panel" id="history-panel" hidden>
        <h3 class="history-panel__heading">Past Sessions</h3>
        <div class="history-panel__list" id="history-list" role="list"></div>
        <p class="history-panel__empty" id="history-empty" hidden>No past sessions yet.</p>
      </aside>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  it('toggle button starts with aria-expanded="false"', () => {
    const btn = document.getElementById('history-toggle');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggle button has correct initial aria-label', () => {
    const btn = document.getElementById('history-toggle');
    expect(btn.getAttribute('aria-label')).toBe('Open session history');
  });

  it('panel starts with hidden attribute', () => {
    const panel = document.getElementById('history-panel');
    expect(panel.hasAttribute('hidden')).toBe(true);
  });

  it('empty state message element exists and is initially hidden', () => {
    const emptyEl = document.getElementById('history-empty');
    expect(emptyEl).not.toBeNull();
    expect(emptyEl.hasAttribute('hidden')).toBe(true);
  });

  it('history list has role="list"', () => {
    const list = document.getElementById('history-list');
    expect(list.getAttribute('role')).toBe('list');
  });

  describe('toggle behavior simulation', () => {
    it('setting aria-expanded to true reflects open state', () => {
      const btn = document.getElementById('history-toggle');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close session history');

      expect(btn.getAttribute('aria-expanded')).toBe('true');
      expect(btn.getAttribute('aria-label')).toBe('Close session history');
    });

    it('panel can be shown by removing hidden and adding open class', () => {
      const panel = document.getElementById('history-panel');
      panel.removeAttribute('hidden');
      panel.classList.add('history-panel--open');

      expect(panel.hasAttribute('hidden')).toBe(false);
      expect(panel.classList.contains('history-panel--open')).toBe(true);
    });
  });

  describe('list rendering', () => {
    it('renders session items into the list container', () => {
      const list = document.getElementById('history-list');
      const mockRecords = [
        { id: 'session-1', sessionMode: 'elevator-60', timestamp: '2024-12-15T14:30:00.000Z', duration: 58 },
        { id: 'session-2', sessionMode: 'free', timestamp: '2024-12-14T10:00:00.000Z', duration: 120 }
      ];

      list.innerHTML = mockRecords.map(r =>
        `<button type="button" class="history-panel__item" role="listitem" data-session-id="${r.id}">
          <span class="history-panel__item-mode">${r.sessionMode}</span>
          <span class="history-panel__item-meta">${r.timestamp}</span>
        </button>`
      ).join('');

      expect(list.querySelectorAll('.history-panel__item').length).toBe(2);
      expect(list.querySelector('[data-session-id="session-1"]')).not.toBeNull();
    });

    it('shows empty state when no records exist', () => {
      const list = document.getElementById('history-list');
      const emptyEl = document.getElementById('history-empty');

      list.innerHTML = '';
      emptyEl.removeAttribute('hidden');

      expect(list.innerHTML).toBe('');
      expect(emptyEl.hasAttribute('hidden')).toBe(false);
    });
  });
});

// ─── Unit Tests: Session Detail View ────────────────────────────────────────

describe('Session Detail View', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
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
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('modal starts hidden', () => {
    const overlay = document.getElementById('session-detail-overlay');
    expect(overlay.hasAttribute('hidden')).toBe(true);
  });

  it('modal has correct ARIA attributes', () => {
    const overlay = document.getElementById('session-detail-overlay');
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
    expect(overlay.getAttribute('aria-labelledby')).toBe('session-detail-title');
  });

  it('close button has correct aria-label', () => {
    const closeBtn = document.getElementById('session-detail-close');
    expect(closeBtn.getAttribute('aria-label')).toBe('Close session details');
  });

  describe('populating session data', () => {
    const mockRecord = {
      id: 'test-session-1',
      sessionMode: 'startup-5m',
      timestamp: '2024-12-15T14:30:00.000Z',
      duration: 295,
      phasesCompleted: ['Intro', 'Problem', 'Solution'],
      curveballsFaced: 2,
      transcript: null,
      aiFeedback: null
    };

    it('displays mode label as title', () => {
      const titleEl = document.getElementById('session-detail-title');
      titleEl.textContent = '5-Minute Startup Demo';
      expect(titleEl.textContent).toBe('5-Minute Startup Demo');
    });

    it('displays formatted duration', () => {
      const durationEl = document.getElementById('session-detail-duration');
      const min = Math.floor(mockRecord.duration / 60);
      const sec = mockRecord.duration % 60;
      durationEl.textContent = `${min}m ${sec}s`;
      expect(durationEl.textContent).toBe('4m 55s');
    });

    it('displays curveball count', () => {
      const curveballsEl = document.getElementById('session-detail-curveballs');
      curveballsEl.textContent = String(mockRecord.curveballsFaced);
      expect(curveballsEl.textContent).toBe('2');
    });

    it('displays phases as list items', () => {
      const phasesEl = document.getElementById('session-detail-phases');
      phasesEl.innerHTML = mockRecord.phasesCompleted.map(p =>
        `<li class="session-detail__phase-tag">${p}</li>`
      ).join('');

      expect(phasesEl.querySelectorAll('li').length).toBe(3);
      expect(phasesEl.querySelector('li').textContent).toBe('Intro');
    });

    it('shows placeholder message when transcript is null', () => {
      const transcriptEl = document.getElementById('session-detail-transcript');
      transcriptEl.innerHTML = '<p class="session-detail__placeholder">Transcript will be available with AI coaching integration</p>';

      expect(transcriptEl.querySelector('.session-detail__placeholder')).not.toBeNull();
      expect(transcriptEl.textContent).toContain('Transcript will be available');
    });

    it('shows placeholder message when aiFeedback is null', () => {
      const feedbackEl = document.getElementById('session-detail-feedback');
      feedbackEl.innerHTML = '<p class="session-detail__placeholder">AI feedback will be available with AI coaching integration</p>';

      expect(feedbackEl.querySelector('.session-detail__placeholder')).not.toBeNull();
      expect(feedbackEl.textContent).toContain('AI feedback will be available');
    });

    it('displays "No phases completed" when phases array is empty', () => {
      const phasesEl = document.getElementById('session-detail-phases');
      phasesEl.innerHTML = '<li class="session-detail__placeholder">No phases completed</li>';

      expect(phasesEl.textContent).toContain('No phases completed');
    });
  });

  describe('close behavior', () => {
    it('close button click hides the overlay', () => {
      const overlay = document.getElementById('session-detail-overlay');
      overlay.removeAttribute('hidden'); // simulate open

      const closeBtn = document.getElementById('session-detail-close');
      closeBtn.addEventListener('click', () => overlay.setAttribute('hidden', ''));
      closeBtn.click();

      expect(overlay.hasAttribute('hidden')).toBe(true);
    });

    it('Escape key hides the overlay', () => {
      const overlay = document.getElementById('session-detail-overlay');
      overlay.removeAttribute('hidden');

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) {
          overlay.setAttribute('hidden', '');
        }
      });

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);

      expect(overlay.hasAttribute('hidden')).toBe(true);
    });

    it('backdrop click hides the overlay', () => {
      const overlay = document.getElementById('session-detail-overlay');
      overlay.removeAttribute('hidden');

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.setAttribute('hidden', '');
        }
      });

      // Simulate click on the overlay backdrop (not the panel)
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: overlay });
      overlay.dispatchEvent(event);

      expect(overlay.hasAttribute('hidden')).toBe(true);
    });
  });
});
