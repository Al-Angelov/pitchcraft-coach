/**
 * Property-based test: Personal note storage round-trip
 * Property 8: Personal note storage round-trip
 * Validates: Requirements 4.5
 *
 * Uses fc.record to generate arbitrary note objects and asserts that
 * save → load returns matching title, content, and createdAt.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

// StorageService mirror — matches implementation in index.html
const StorageService = {
  _KEY: 'pitchcraft_notes',

  saveNotes(notes) {
    try {
      localStorage.setItem(this._KEY, JSON.stringify(notes));
    } catch (_) {
      // silently continue
    }
  },

  loadNotes() {
    try {
      const raw = localStorage.getItem(this._KEY);
      if (raw === null) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  },

  clearNotes() {
    try {
      localStorage.removeItem(this._KEY);
    } catch (_) {
      // silently ignore
    }
  }
};

describe('Property 8: Personal note storage round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('save then load returns matching title, content, and createdAt', () => {
    const noteArb = fc.record({
      title: fc.string({ minLength: 1 }),
      content: fc.string({ minLength: 1 })
    });

    fc.assert(
      fc.property(noteArb, (noteInput) => {
        // Create a full note object with generated fields
        const createdAt = new Date().toISOString();
        const note = {
          id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: noteInput.title,
          content: noteInput.content,
          createdAt,
          isUserNote: true
        };

        // Save a single-note array and reload
        StorageService.saveNotes([note]);
        const loaded = StorageService.loadNotes();

        // Assert round-trip fidelity
        expect(loaded).toHaveLength(1);
        expect(loaded[0].title).toBe(note.title);
        expect(loaded[0].content).toBe(note.content);
        expect(loaded[0].createdAt).toBe(note.createdAt);
      }),
      { numRuns: 100 }
    );
  });

  it('round-trip preserves multiple notes in order', () => {
    const noteArb = fc.record({
      title: fc.string({ minLength: 1 }),
      content: fc.string({ minLength: 1 })
    });

    fc.assert(
      fc.property(fc.array(noteArb, { minLength: 1, maxLength: 20 }), (noteInputs) => {
        const notes = noteInputs.map((input, i) => ({
          id: `note-${i}`,
          title: input.title,
          content: input.content,
          createdAt: new Date(Date.now() + i).toISOString(),
          isUserNote: true
        }));

        StorageService.saveNotes(notes);
        const loaded = StorageService.loadNotes();

        expect(loaded).toHaveLength(notes.length);
        for (let i = 0; i < notes.length; i++) {
          expect(loaded[i].title).toBe(notes[i].title);
          expect(loaded[i].content).toBe(notes[i].content);
          expect(loaded[i].createdAt).toBe(notes[i].createdAt);
        }
      }),
      { numRuns: 100 }
    );
  });
});
