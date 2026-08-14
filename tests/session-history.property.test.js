/**
 * Property-based tests for SessionHistoryService
 * Feature: session-history
 * Properties 1–7 as defined in the design document.
 *
 * Uses fast-check to generate arbitrary valid/invalid session data and
 * verifies correctness properties hold across 100+ iterations.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

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
    } catch (_) {
      // silently continue
    }
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

// ─── Arbitrary generators ───────────────────────────────────────────────────

/** Generates valid session input data for saveSession() */
const validSessionDataArb = fc.record({
  mode: fc.string({ minLength: 1, maxLength: 30 }),
  elapsed: fc.nat({ max: 7200 }),  // 0–7200 seconds
  phasesCompleted: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 8 }),
  curveballsShown: fc.nat({ max: 24 })
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('SessionHistoryService — Property-Based Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    SessionHistoryService._history = [];
  });

  afterEach(() => {
    localStorage.clear();
    SessionHistoryService._history = [];
  });

  // ── Property 1: Save-then-load round trip ──────────────────────────────
  describe('Property 1: Save-then-load round trip', () => {
    it('saving a session and reloading produces an array containing a matching record', () => {
      fc.assert(
        fc.property(validSessionDataArb, (data) => {
          // Reset state
          localStorage.clear();
          SessionHistoryService._history = [];

          // Save
          const saved = SessionHistoryService.saveSession(data);
          expect(saved).not.toBeNull();

          // Simulate fresh load (as if page reloaded)
          SessionHistoryService._history = [];
          const loaded = SessionHistoryService.loadHistory();

          // Verify the record is present with matching fields
          const found = loaded.find(r => r.id === saved.id);
          expect(found).toBeDefined();
          expect(found.sessionMode).toBe(data.mode);
          expect(found.duration).toBe(Math.floor(data.elapsed));
          expect(found.phasesCompleted).toEqual(data.phasesCompleted);
          expect(found.curveballsFaced).toBe(data.curveballsShown);
        }),
        { numRuns: 100 }
      );
    });
  });

  // ── Property 2: Record cap enforcement ─────────────────────────────────
  describe('Property 2: Record cap enforcement', () => {
    it('after N > 50 saves, getAll() returns at most 50 records (the most recent)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 51, max: 80 }),
          validSessionDataArb,
          (count, baseData) => {
            // Reset
            localStorage.clear();
            SessionHistoryService._history = [];

            // Perform count saves
            const savedIds = [];
            for (let i = 0; i < count; i++) {
              const result = SessionHistoryService.saveSession({
                ...baseData,
                mode: `mode-${i}`
              });
              if (result) savedIds.push(result.id);
            }

            // Verify cap
            const all = SessionHistoryService.getAll();
            expect(all.length).toBeLessThanOrEqual(50);

            // Verify they are the 50 most recent (last 50 saved)
            const last50Ids = savedIds.slice(-50);
            const loadedIds = all.map(r => r.id);
            for (const id of last50Ids) {
              expect(loadedIds).toContain(id);
            }
          }
        ),
        { numRuns: 20 }  // fewer runs due to high iteration count per run
      );
    });
  });

  // ── Property 3: Descending sort invariant ──────────────────────────────
  describe('Property 3: Descending sort invariant', () => {
    it('loaded history is always sorted by timestamp descending', () => {
      fc.assert(
        fc.property(
          fc.array(validSessionDataArb, { minLength: 2, maxLength: 20 }),
          (dataArray) => {
            // Reset
            localStorage.clear();
            SessionHistoryService._history = [];

            // Save multiple sessions with small delays between timestamps
            for (const data of dataArray) {
              SessionHistoryService.saveSession(data);
            }

            // Reload from localStorage
            SessionHistoryService._history = [];
            const loaded = SessionHistoryService.loadHistory();

            // Verify descending sort
            for (let i = 0; i < loaded.length - 1; i++) {
              expect(loaded[i].timestamp >= loaded[i + 1].timestamp).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ── Property 4: Invalid record rejection ───────────────────────────────
  describe('Property 4: Invalid record rejection', () => {
    it('objects with missing required fields are rejected (saveSession returns null)', () => {
      // Generate objects that are missing 'mode' (will result in sessionMode being null → invalid)
      const invalidNoMode = fc.record({
        elapsed: fc.nat({ max: 7200 }),
        phasesCompleted: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
        curveballsShown: fc.nat({ max: 24 })
      });

      fc.assert(
        fc.property(invalidNoMode, (data) => {
          localStorage.clear();
          SessionHistoryService._history = [];

          // data has no 'mode' field → sessionMode will be null → validation fails
          const result = SessionHistoryService.saveSession(data);
          expect(result).toBeNull();
          expect(SessionHistoryService.getAll()).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('negative elapsed values produce invalid duration and are rejected', () => {
      fc.assert(
        fc.property(
          fc.record({
            mode: fc.string({ minLength: 1, maxLength: 10 }),
            elapsed: fc.double({ min: -10000, max: -0.01, noNaN: true }),
            phasesCompleted: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
            curveballsShown: fc.nat({ max: 24 })
          }),
          (data) => {
            localStorage.clear();
            SessionHistoryService._history = [];

            const result = SessionHistoryService.saveSession(data);
            // Math.floor of negative → negative duration → validation fails
            expect(result).toBeNull();
            expect(SessionHistoryService.getAll()).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ── Property 5: Malformed data resilience ──────────────────────────────
  describe('Property 5: Malformed data resilience', () => {
    it('non-JSON strings at the storage key result in empty array without error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => {
            try { JSON.parse(s); return false; } catch (_) { return true; }
          }),
          (malformed) => {
            localStorage.clear();
            SessionHistoryService._history = [];

            // Plant malformed data
            localStorage.setItem(SessionHistoryService._KEY, malformed);

            // loadHistory should not throw
            const result = SessionHistoryService.loadHistory();
            expect(result).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('non-array JSON values at the storage key result in empty array', () => {
      const nonArrayJson = fc.oneof(
        fc.integer().map(n => JSON.stringify(n)),
        fc.string().map(s => JSON.stringify(s)),
        fc.constant('null'),
        fc.constant('true'),
        fc.constant('{}')
      );

      fc.assert(
        fc.property(nonArrayJson, (jsonStr) => {
          localStorage.clear();
          SessionHistoryService._history = [];

          localStorage.setItem(SessionHistoryService._KEY, jsonStr);
          const result = SessionHistoryService.loadHistory();
          expect(result).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });
  });

  // ── Property 6: Unique ID generation ───────────────────────────────────
  describe('Property 6: Unique ID generation', () => {
    it('two saves with identical input produce distinct IDs', () => {
      fc.assert(
        fc.property(validSessionDataArb, (data) => {
          localStorage.clear();
          SessionHistoryService._history = [];

          const first = SessionHistoryService.saveSession(data);
          const second = SessionHistoryService.saveSession(data);

          expect(first).not.toBeNull();
          expect(second).not.toBeNull();
          expect(first.id).not.toBe(second.id);
        }),
        { numRuns: 100 }
      );
    });
  });

  // ── Property 7: Existing records preservation ──────────────────────────
  describe('Property 7: Existing records preservation', () => {
    it('pre-existing records are preserved when a new record is appended (K < 50)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 49 }),
          validSessionDataArb,
          validSessionDataArb,
          (k, seedData, newData) => {
            localStorage.clear();
            SessionHistoryService._history = [];

            // Save K existing records
            const existingIds = [];
            for (let i = 0; i < k; i++) {
              const r = SessionHistoryService.saveSession({
                ...seedData,
                mode: `seed-${i}`
              });
              if (r) existingIds.push(r.id);
            }

            // Save one more
            const newRecord = SessionHistoryService.saveSession(newData);
            expect(newRecord).not.toBeNull();

            // Verify all existing records are still present
            const all = SessionHistoryService.getAll();
            expect(all.length).toBe(existingIds.length + 1);

            for (const id of existingIds) {
              expect(all.find(r => r.id === id)).toBeDefined();
            }
            // And the new one is there
            expect(all.find(r => r.id === newRecord.id)).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
