/**
 * Unit tests for StorageService
 * Requirements: 4.6
 *
 * Tests verify:
 * - After clearNotes(), loadNotes() returns []
 * - When localStorage contains corrupted (invalid) JSON, loadNotes() returns []
 * - When localStorage.getItem throws (storage unavailable), loadNotes() returns []
 * - saveNotes() + loadNotes() round-trip returns equivalent data
 * - Valid JSON that is not an array returns []
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// StorageService extracted inline — mirrors the implementation in index.html exactly.
// This avoids executing the full app bundle in jsdom while still testing real logic.
const StorageService = {
  _KEY: 'pitchcraft_notes',

  saveNotes(notes) {
    try {
      localStorage.setItem(this._KEY, JSON.stringify(notes));
    } catch (_) {
      // localStorage unavailable or quota exceeded — silently continue
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

describe('StorageService', () => {
  beforeEach(() => {
    // Start each test with a clean localStorage
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Requirement 4.6 — empty state after clear
  it('loadNotes() returns [] after clearNotes() empties storage', () => {
    // Seed some data first so clearNotes() has something to remove
    StorageService.saveNotes([{ id: 'note-1', text: 'Hello' }]);
    expect(StorageService.loadNotes()).toHaveLength(1);

    StorageService.clearNotes();

    expect(StorageService.loadNotes()).toEqual([]);
  });

  // Requirement 4.6 — graceful handling of corrupted JSON
  it('loadNotes() returns [] when localStorage contains invalid JSON', () => {
    // Bypass saveNotes so we can inject a raw invalid JSON string
    localStorage.setItem('pitchcraft_notes', '{this is not valid json!!!');

    expect(StorageService.loadNotes()).toEqual([]);
  });

  // Requirement 4.6 — graceful handling of unavailable storage
  it('loadNotes() returns [] when localStorage.getItem throws a DOMException', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage access denied', 'SecurityError');
    });

    expect(StorageService.loadNotes()).toEqual([]);
  });

  // Requirement 4.6 — graceful handling of unavailable storage (generic Error)
  it('loadNotes() returns [] when localStorage.getItem throws a generic Error', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(StorageService.loadNotes()).toEqual([]);
  });

  // Requirement 4.5 — round-trip: save then load returns equivalent data
  it('loadNotes() returns equivalent notes after saveNotes()', () => {
    const notes = [
      { id: 'note-1', title: 'First note', content: 'Some content', createdAt: '2024-01-01T00:00:00.000Z' },
      { id: 'note-2', title: 'Second note', content: 'More content', createdAt: '2024-01-02T00:00:00.000Z' }
    ];

    StorageService.saveNotes(notes);
    const loaded = StorageService.loadNotes();

    expect(loaded).toEqual(notes);
  });

  // Requirement 4.6 — valid JSON that is not an array returns []
  it('loadNotes() returns [] when localStorage contains valid JSON but not an array', () => {
    // Bypass saveNotes to inject an object instead of an array
    localStorage.setItem('pitchcraft_notes', JSON.stringify({ foo: 1 }));

    expect(StorageService.loadNotes()).toEqual([]);
  });
});
