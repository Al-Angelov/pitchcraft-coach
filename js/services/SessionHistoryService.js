// js/services/SessionHistoryService.js

/* ============================================================
   SessionHistoryService — persistent session history in localStorage
   Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4
============================================================ */
const SessionHistoryService = {
  _KEY: 'pitchcraft_history',
  _MAX_RECORDS: 50,
  _history: [],

  /**
   * Generate a unique id: timestamp + random suffix.
   * @returns {string}
   */
  _generateId() {
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    return `${ts}-${rand}`;
  },

  /**
   * Validate that a record has all required fields with correct types.
   * @param {object} record
   * @returns {boolean}
   */
  _validate(record) {
    if (!record || typeof record !== 'object') return false;
    if (typeof record.id !== 'string' || record.id.length === 0) return false;
    if (typeof record.timestamp !== 'string' || record.timestamp.length === 0) return false;
    if (typeof record.sessionMode !== 'string' || record.sessionMode.length === 0) return false;
    if (typeof record.duration !== 'number' || record.duration < 0) return false;
    if (!Array.isArray(record.phasesCompleted)) return false;
    if (typeof record.curveballsFaced !== 'number' || record.curveballsFaced < 0) return false;
    // transcript and aiFeedback may be null (placeholders)
    if (!('transcript' in record)) return false;
    if (!('aiFeedback' in record)) return false;
    return true;
  },

  /**
   * Persist current _history array to localStorage.
   */
  _persist() {
    try {
      localStorage.setItem(this._KEY, JSON.stringify(this._history));
    } catch (_) {
      // localStorage unavailable or quota exceeded — silently continue
    }
  },

  /**
   * Load history from localStorage on init.
   * Returns sorted array (newest-first). Handles missing/malformed data gracefully.
   * @returns {Array}
   */
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
      // Filter out invalid records
      this._history = parsed.filter(record => this._validate(record));
      // Sort descending by timestamp (newest first)
      this._history.sort((a, b) => {
        if (a.timestamp > b.timestamp) return -1;
        if (a.timestamp < b.timestamp) return 1;
        return 0;
      });
      // Enforce max cap
      if (this._history.length > this._MAX_RECORDS) {
        this._history = this._history.slice(0, this._MAX_RECORDS);
      }
      return this._history;
    } catch (_) {
      this._history = [];
      return this._history;
    }
  },

  /**
   * Save a new session record. Validates, generates id, appends, trims to max, persists.
   * @param {object} data - { mode, elapsed, phasesCompleted, curveballsShown }
   * @returns {object|null} The saved SessionRecord or null if invalid
   */
  saveSession(data) {
    if (!data || typeof data !== 'object') return null;

    const record = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      sessionMode: data.mode || null,
      sessionTitle: data.sessionTitle || null,
      duration: typeof data.elapsed === 'number' ? Math.floor(data.elapsed) : -1,
      phasesCompleted: Array.isArray(data.phasesCompleted) ? [...data.phasesCompleted] : [],
      curveballsFaced: typeof data.curveballsShown === 'number'
        ? data.curveballsShown
        : (Array.isArray(data.curveballsShown) ? data.curveballsShown.length : 0),
      transcript: data.transcript || null,
      aiFeedback: data.aiFeedback || null
    };

    if (!this._validate(record)) return null;

    // Prepend (newest first)
    this._history.unshift(record);

    // Enforce max cap — remove oldest
    if (this._history.length > this._MAX_RECORDS) {
      this._history = this._history.slice(0, this._MAX_RECORDS);
    }

    this._persist();
    return record;
  },

  /**
   * Get all records (in-memory cache).
   * @returns {Array}
   */
  getAll() {
    return this._history;
  },

  /**
   * Get a single record by id.
   * @param {string} id
   * @returns {object|null}
   */
  getById(id) {
    if (typeof id !== 'string') return null;
    return this._history.find(r => r.id === id) || null;
  },

  /**
   * Update the most recent session record with transcript/feedback data.
   * Called when async transcription completes after the session was already saved.
   * @param {object} updates - { transcript?, aiFeedback? }
   */
  updateLatest(updates) {
    if (!updates || typeof updates !== 'object') return;
    if (this._history.length === 0) return;
    const latest = this._history[0];
    if (updates.transcript !== undefined) latest.transcript = updates.transcript;
    if (updates.aiFeedback !== undefined) latest.aiFeedback = updates.aiFeedback;
    if (updates.sessionTitle !== undefined) latest.sessionTitle = updates.sessionTitle;
    this._persist();
  },

  /**
   * Update a specific session record by id.
   * @param {string} id
   * @param {object} updates
   */
  updateById(id, updates) {
    if (!id || !updates || typeof updates !== 'object') return;
    const record = this._history.find(r => r.id === id);
    if (!record) return;
    if (updates.sessionTitle !== undefined) record.sessionTitle = updates.sessionTitle;
    if (updates.transcript !== undefined) record.transcript = updates.transcript;
    if (updates.aiFeedback !== undefined) record.aiFeedback = updates.aiFeedback;
    this._persist();
  }
};

export { SessionHistoryService };
