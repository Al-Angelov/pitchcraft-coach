// js/services/StorageService.js

/* ============================================================
   StorageService — localStorage abstraction
   Requirements: 4.5, 4.6
============================================================ */
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

export { StorageService };
