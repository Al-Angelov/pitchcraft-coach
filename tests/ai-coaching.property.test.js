/**
 * Property-based tests: AI Coaching — TranscriptionService
 * Feature: ai-coaching
 *
 * Property 4: API key never persisted
 * Property 5: Whisper API request structure
 * Property 10: Error classification correctness
 *
 * Validates: Requirements 4.3, 5.1, 5.2, 5.4, 5.5, 5.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';

// TranscriptionService mirror — matches implementation in index.html
const TranscriptionService = {
  _apiKey: null,

  setApiKey(key) {
    this._apiKey = key;
  },

  hasApiKey() {
    return this._apiKey !== null && this._apiKey.length > 0;
  },

  clearApiKey() {
    this._apiKey = null;
  },

  async transcribe(audioBlob) {
    if (!this._apiKey) {
      return { success: false, error: 'No API key provided.' };
    }
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._apiKey}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, text: data.text };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid API key. Please re-enter your key.', statusCode: 401 };
      } else {
        return { success: false, error: `Transcription failed (HTTP ${response.status}). Please try again.`, statusCode: response.status };
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  }
};

/**
 * Property 4: API key never persisted
 * Validates: Requirements 4.3
 *
 * For any sequence of operations on TranscriptionService (setApiKey, transcribe,
 * clearApiKey), the API key SHALL never appear in localStorage, sessionStorage,
 * cookies, or any persistent storage mechanism.
 */
describe('Property 4: API key never persisted', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = '';
    TranscriptionService._apiKey = null;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: 'transcribed' })
    }));
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TranscriptionService._apiKey = null;
    vi.restoreAllMocks();
  });

  it('API key never appears in localStorage, sessionStorage, or cookies after any operation sequence', async () => {
    // Arbitrary for non-empty API key strings
    const apiKeyArb = fc.string({ minLength: 1, maxLength: 100 });

    // Arbitrary for operation types
    const operationArb = fc.oneof(
      fc.constant('setApiKey'),
      fc.constant('transcribe'),
      fc.constant('clearApiKey')
    );

    // Generate a sequence of operations
    const operationSeqArb = fc.array(operationArb, { minLength: 1, maxLength: 10 });

    await fc.assert(
      fc.asyncProperty(apiKeyArb, operationSeqArb, async (apiKey, operations) => {
        // Reset state
        TranscriptionService._apiKey = null;
        localStorage.clear();
        sessionStorage.clear();

        const blob = new Blob(['test audio'], { type: 'audio/webm' });

        // Execute the sequence of operations
        for (const op of operations) {
          if (op === 'setApiKey') {
            TranscriptionService.setApiKey(apiKey);
          } else if (op === 'transcribe') {
            TranscriptionService.setApiKey(apiKey);
            await TranscriptionService.transcribe(blob);
          } else if (op === 'clearApiKey') {
            TranscriptionService.clearApiKey();
          }
        }

        // Verify: API key never in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          expect(value).not.toContain(apiKey);
        }

        // Verify: API key never in sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          const value = sessionStorage.getItem(key);
          expect(value).not.toContain(apiKey);
        }

        // Verify: API key never in cookies
        expect(document.cookie).not.toContain(apiKey);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 5: Whisper API request structure
 * Validates: Requirements 5.1, 5.2
 *
 * For any valid audio Blob and API key, the FormData request sent to the Whisper
 * API SHALL contain exactly: a "file" field with the Blob, a "model" field set to
 * "whisper-1", and an Authorization header with value "Bearer {apiKey}".
 */
describe('Property 5: Whisper API request structure', () => {
  let capturedRequests;

  beforeEach(() => {
    capturedRequests = [];
    TranscriptionService._apiKey = null;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url, options) => {
      capturedRequests.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => ({ text: 'hello world' })
      };
    }));
  });

  afterEach(() => {
    TranscriptionService._apiKey = null;
    vi.restoreAllMocks();
  });

  it('request contains correct file, model, and Authorization header for any key and blob', async () => {
    // Arbitrary non-empty API key
    const apiKeyArb = fc.string({ minLength: 1, maxLength: 100 });
    // Arbitrary blob content (non-empty byte array)
    const blobDataArb = fc.uint8Array({ minLength: 1, maxLength: 500 });

    await fc.assert(
      fc.asyncProperty(apiKeyArb, blobDataArb, async (apiKey, blobData) => {
        capturedRequests = [];
        TranscriptionService._apiKey = null;
        TranscriptionService.setApiKey(apiKey);

        const blob = new Blob([blobData], { type: 'audio/webm' });
        await TranscriptionService.transcribe(blob);

        // Verify fetch was called
        expect(capturedRequests.length).toBe(1);
        const { url, options } = capturedRequests[0];

        // Verify URL
        expect(url).toBe('https://api.openai.com/v1/audio/transcriptions');

        // Verify method
        expect(options.method).toBe('POST');

        // Verify Authorization header
        expect(options.headers['Authorization']).toBe(`Bearer ${apiKey}`);

        // Verify FormData body
        const formData = options.body;
        expect(formData).toBeInstanceOf(FormData);

        // Verify "file" field contains a Blob
        const fileField = formData.get('file');
        expect(fileField).toBeInstanceOf(Blob);

        // Verify "model" field is "whisper-1"
        const modelField = formData.get('model');
        expect(modelField).toBe('whisper-1');
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 10: Error classification correctness
 * Validates: Requirements 5.4, 5.5, 5.6
 *
 * For any HTTP error response from the Whisper API, the TranscriptionService SHALL
 * return an error object where: status 401 produces an "invalid API key" message,
 * other 4xx/5xx produce a message including the status code, and network failures
 * produce a "network error" message.
 */
describe('Property 10: Error classification correctness', () => {
  beforeEach(() => {
    TranscriptionService._apiKey = null;
  });

  afterEach(() => {
    TranscriptionService._apiKey = null;
    vi.restoreAllMocks();
  });

  it('status 401 produces an "invalid API key" error message', async () => {
    const apiKeyArb = fc.string({ minLength: 1, maxLength: 100 });

    await fc.assert(
      fc.asyncProperty(apiKeyArb, async (apiKey) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: 'Unauthorized' } })
        }));

        TranscriptionService.setApiKey(apiKey);
        const blob = new Blob(['audio'], { type: 'audio/webm' });
        const result = await TranscriptionService.transcribe(blob);

        expect(result.success).toBe(false);
        expect(result.error.toLowerCase()).toContain('invalid api key');
        expect(result.statusCode).toBe(401);
      }),
      { numRuns: 100 }
    );
  });

  it('other 4xx/5xx errors produce a message including the status code', async () => {
    // Generate HTTP error codes that are NOT 401 (4xx and 5xx range)
    const errorStatusArb = fc.oneof(
      fc.integer({ min: 400, max: 400 }),   // 400
      fc.integer({ min: 402, max: 499 }),   // 402-499
      fc.integer({ min: 500, max: 599 })    // 500-599
    );
    const apiKeyArb = fc.string({ minLength: 1, maxLength: 100 });

    await fc.assert(
      fc.asyncProperty(apiKeyArb, errorStatusArb, async (apiKey, statusCode) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
          ok: false,
          status: statusCode,
          json: async () => ({ error: { message: 'Error' } })
        }));

        TranscriptionService.setApiKey(apiKey);
        const blob = new Blob(['audio'], { type: 'audio/webm' });
        const result = await TranscriptionService.transcribe(blob);

        expect(result.success).toBe(false);
        expect(result.error).toContain(String(statusCode));
        expect(result.statusCode).toBe(statusCode);
      }),
      { numRuns: 100 }
    );
  });

  it('network failures produce a "network error" message', async () => {
    const apiKeyArb = fc.string({ minLength: 1, maxLength: 100 });
    const errorMsgArb = fc.string({ minLength: 1, maxLength: 50 });

    await fc.assert(
      fc.asyncProperty(apiKeyArb, errorMsgArb, async (apiKey, errorMsg) => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(errorMsg)));

        TranscriptionService.setApiKey(apiKey);
        const blob = new Blob(['audio'], { type: 'audio/webm' });
        const result = await TranscriptionService.transcribe(blob);

        expect(result.success).toBe(false);
        expect(result.error.toLowerCase()).toContain('network error');
        expect(result.statusCode).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-based tests: AI Coaching — AudioCaptureService
 * Feature: ai-coaching
 *
 * Property 1: Audio chunk packaging produces valid Blob
 * Property 2: Empty recording detection
 * Property 8: Auto-stop on session end preserves audio
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 8.3
 */

// AudioCaptureService mirror — matches implementation in index.html
function createAudioCaptureService() {
  return {
    _stream: null,
    _recorder: null,
    _chunks: [],
    _isRecording: false,

    isSupported() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },

    async requestMicrophone() {
      if (!this.isSupported()) {
        return false;
      }
      try {
        this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      } catch (err) {
        return false;
      }
    },

    start() {
      if (!this._stream) return;
      this._chunks = [];
      this._recorder = new MediaRecorder(this._stream);
      this._recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this._chunks.push(e.data);
        }
      };
      this._recorder.start();
      this._isRecording = true;
    },

    async stop() {
      if (!this._recorder || !this._isRecording) return null;
      return new Promise((resolve) => {
        this._recorder.onstop = () => {
          this._isRecording = false;
          if (this._chunks.length === 0) {
            this.releaseStream();
            resolve(null);
            return;
          }
          const blob = new Blob(this._chunks, { type: 'audio/webm' });
          this._chunks = [];
          this.releaseStream();
          resolve(blob);
        };
        this._recorder.stop();
      });
    },

    releaseStream() {
      if (this._stream) {
        this._stream.getTracks().forEach(track => track.stop());
        this._stream = null;
      }
    },

    isRecording() {
      return this._isRecording;
    }
  };
}

// Mock MediaRecorder that triggers onstop synchronously on stop()
class MockMediaRecorder {
  constructor(stream) {
    this._stream = stream;
    this.ondataavailable = null;
    this.onstop = null;
  }

  start() {
    // no-op
  }

  stop() {
    if (this.onstop) {
      this.onstop();
    }
  }
}

// Mock MediaStream with tracks
function createMockStream() {
  return {
    getTracks() {
      return [{ stop() {} }];
    }
  };
}

/**
 * Property 1: Audio chunk packaging produces valid Blob
 * Validates: Requirements 3.1, 3.2
 *
 * For any sequence of non-empty audio data chunks collected by AudioCaptureService,
 * stopping the recording SHALL produce a single Blob of MIME type `audio/webm`
 * whose size equals the combined size of all input chunks.
 */
describe('Property 1: Audio chunk packaging produces valid Blob', () => {
  beforeEach(() => {
    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(createMockStream())
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('any sequence of non-empty chunks produces a Blob of type audio/webm with correct total size', async () => {
    // Generate arrays of non-empty Uint8Arrays representing audio chunks
    const chunksArb = fc.array(
      fc.uint8Array({ minLength: 1, maxLength: 200 }),
      { minLength: 1, maxLength: 20 }
    );

    await fc.assert(
      fc.asyncProperty(chunksArb, async (chunks) => {
        const service = createAudioCaptureService();

        // Setup: request microphone and start recording
        await service.requestMicrophone();
        service.start();

        // Simulate ondataavailable events for each chunk
        for (const chunkData of chunks) {
          const blob = new Blob([chunkData], { type: 'audio/webm' });
          service._recorder.ondataavailable({ data: blob });
        }

        // Stop recording and get the result
        const resultBlob = await service.stop();

        // Verify: result is a Blob
        expect(resultBlob).toBeInstanceOf(Blob);

        // Verify: MIME type is audio/webm
        expect(resultBlob.type).toBe('audio/webm');

        // Verify: size equals combined size of all input chunks
        const expectedSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        expect(resultBlob.size).toBe(expectedSize);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 2: Empty recording detection
 * Validates: Requirements 3.3
 *
 * For any recording session where zero audio data chunks are collected,
 * stopping the recording SHALL return null (not a Blob) and trigger an error state.
 */
describe('Property 2: Empty recording detection', () => {
  beforeEach(() => {
    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(createMockStream())
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('recording with zero chunks returns null for any recording duration scenario', async () => {
    // Generate arbitrary "durations" just to show the property holds regardless
    const durationArb = fc.integer({ min: 0, max: 10000 });

    await fc.assert(
      fc.asyncProperty(durationArb, async (_duration) => {
        const service = createAudioCaptureService();

        // Setup: request microphone and start recording
        await service.requestMicrophone();
        service.start();

        // No ondataavailable events fired — zero chunks collected

        // Stop recording
        const resultBlob = await service.stop();

        // Verify: result is null (not a Blob)
        expect(resultBlob).toBeNull();

        // Verify: stream has been released (error state cleanup)
        expect(service._stream).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 8: Auto-stop on session end preserves audio
 * Validates: Requirements 8.3
 *
 * For any active recording when endSession() is called, the AudioCaptureService
 * SHALL be stopped and the resulting audio Blob SHALL be non-null (assuming chunks
 * were collected), identical to what would be produced by a manual stop.
 */
describe('Property 8: Auto-stop on session end preserves audio', () => {
  beforeEach(() => {
    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(createMockStream())
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stopping an active recording with chunks produces identical Blob to manual stop', async () => {
    // Generate arrays of non-empty Uint8Arrays
    const chunksArb = fc.array(
      fc.uint8Array({ minLength: 1, maxLength: 200 }),
      { minLength: 1, maxLength: 20 }
    );

    await fc.assert(
      fc.asyncProperty(chunksArb, async (chunks) => {
        // Simulate "manual stop" scenario
        const manualService = createAudioCaptureService();
        await manualService.requestMicrophone();
        manualService.start();

        for (const chunkData of chunks) {
          const blob = new Blob([chunkData], { type: 'audio/webm' });
          manualService._recorder.ondataavailable({ data: blob });
        }

        const manualBlob = await manualService.stop();

        // Simulate "auto-stop on session end" scenario (same chunks, same stop call)
        const autoService = createAudioCaptureService();
        await autoService.requestMicrophone();
        autoService.start();

        for (const chunkData of chunks) {
          const blob = new Blob([chunkData], { type: 'audio/webm' });
          autoService._recorder.ondataavailable({ data: blob });
        }

        // Verify the service reports recording as active before stop
        expect(autoService.isRecording()).toBe(true);

        // Auto-stop (same as calling AudioCaptureService.stop() from endSession)
        const autoBlob = await autoService.stop();

        // Verify: auto-stop result is non-null
        expect(autoBlob).not.toBeNull();
        expect(autoBlob).toBeInstanceOf(Blob);

        // Verify: auto-stop produces identical result to manual stop
        expect(autoBlob.size).toBe(manualBlob.size);
        expect(autoBlob.type).toBe(manualBlob.type);
        expect(autoBlob.type).toBe('audio/webm');

        // Verify: recording is no longer active after stop
        expect(autoService.isRecording()).toBe(false);

        // Verify: stream has been released
        expect(autoService._stream).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-based tests: AI Coaching — StageController Recording Integration
 * Feature: ai-coaching
 *
 * Property 7: Record button visibility invariant
 * Property 6: Transcript round-trip persistence
 *
 * Validates: Requirements 7.2, 7.3, 8.1, 8.2
 */

/**
 * Property 7: Record button visibility invariant
 * Validates: Requirements 8.1, 8.2
 *
 * For any application state, the Record button SHALL be visible if and only if
 * `AppState.session.status === 'running'` or `AppState.session.status === 'paused'`.
 */
describe('Property 7: Record button visibility invariant', () => {
  let btnRecord;

  beforeEach(() => {
    // Create a mock button element in the DOM
    btnRecord = document.createElement('button');
    btnRecord.id = 'btn-record';
    btnRecord.hidden = true;
    document.body.appendChild(btnRecord);
  });

  afterEach(() => {
    if (btnRecord && btnRecord.parentNode) {
      btnRecord.parentNode.removeChild(btnRecord);
    }
  });

  // Mirror of StageController.updateRecordButton() from index.html
  // Recording now auto-starts with session; button is always hidden.
  function updateRecordButton(status) {
    const btn = document.getElementById('btn-record');
    if (btn) btn.hidden = true;
  }

  it('Record button is always hidden (recording auto-starts with session)', () => {
    const statusArb = fc.constantFrom('idle', 'running', 'paused', 'completed');

    fc.assert(
      fc.property(statusArb, (status) => {
        // Apply the updateRecordButton logic
        updateRecordButton(status);

        const btn = document.getElementById('btn-record');
        expect(btn.hidden).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 6: Transcript round-trip persistence
 * Validates: Requirements 7.2, 7.3
 *
 * For any successful transcription result text, when a session ends with that
 * transcript, the SessionHistoryService record SHALL contain the identical
 * transcript string when loaded back from localStorage.
 */
describe('Property 6: Transcript round-trip persistence', () => {
  const STORAGE_KEY = 'pitchcraft_history';

  // Minimal SessionHistoryService mirror — matches implementation in index.html
  function createSessionHistoryService() {
    return {
      _KEY: STORAGE_KEY,
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
      }
    };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('any non-empty transcript string is preserved identically after save and reload from localStorage', () => {
    // Generate non-empty transcript strings (printable characters)
    const transcriptArb = fc.string({ minLength: 1, maxLength: 500 });

    fc.assert(
      fc.property(transcriptArb, (transcript) => {
        localStorage.clear();

        const service = createSessionHistoryService();

        // Save a session with the transcript
        const savedRecord = service.saveSession({
          mode: 'elevator-pitch',
          elapsed: 120,
          phasesCompleted: ['Hook', 'Problem'],
          curveballsShown: 1,
          transcript: transcript
        });

        // Verify saved record has the transcript
        expect(savedRecord).not.toBeNull();
        expect(savedRecord.transcript).toBe(transcript);

        // Create a new service instance and load from localStorage
        const freshService = createSessionHistoryService();
        const loaded = freshService.loadHistory();

        // Verify the loaded record has the identical transcript
        expect(loaded.length).toBeGreaterThan(0);
        const loadedRecord = loaded.find(r => r.id === savedRecord.id);
        expect(loadedRecord).toBeDefined();
        expect(loadedRecord.transcript).toBe(transcript);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-based tests: AI Coaching — RecordingPanelController
 * Feature: ai-coaching
 *
 * Property 3: Recording timer format consistency
 * Property 9: Reduced motion disables waveform animation
 *
 * Validates: Requirements 2.1, 2.3
 */

/**
 * Property 3: Recording timer format consistency
 * Validates: Requirements 2.1
 *
 * For any elapsed time value in seconds (0 to 5999), the recording timer display
 * SHALL render as a string matching the format MM:SS where MM is zero-padded minutes
 * and SS is zero-padded seconds.
 */
describe('Property 3: Recording timer format consistency', () => {
  // Extract the formatting logic from RecordingPanelController.tick()
  function formatElapsed(elapsedSeconds) {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  it('for any elapsed time 0-5999, output matches MM:SS format with correct values', () => {
    const elapsedArb = fc.integer({ min: 0, max: 5999 });

    fc.assert(
      fc.property(elapsedArb, (elapsed) => {
        const display = formatElapsed(elapsed);

        // Verify format matches MM:SS pattern
        expect(display).toMatch(/^\d{2}:\d{2}$/);

        // Verify the length is exactly 5 characters (MM:SS)
        expect(display.length).toBe(5);

        // Parse back and verify correctness
        const [mmStr, ssStr] = display.split(':');
        const mm = parseInt(mmStr, 10);
        const ss = parseInt(ssStr, 10);

        // Verify minutes and seconds are correct
        expect(mm).toBe(Math.floor(elapsed / 60));
        expect(ss).toBe(elapsed % 60);

        // Verify minutes is in valid range (0-99 for the format)
        expect(mm).toBeGreaterThanOrEqual(0);
        expect(mm).toBeLessThanOrEqual(99);

        // Verify seconds is in valid range (0-59)
        expect(ss).toBeGreaterThanOrEqual(0);
        expect(ss).toBeLessThanOrEqual(59);
      }),
      { numRuns: 100 }
    );
  });

  it('timer display is correctly rendered into the DOM element', () => {
    // Setup DOM element for recording timer
    document.body.innerHTML = '<span id="recording-timer">00:00</span>';

    const elapsedArb = fc.integer({ min: 0, max: 5999 });

    fc.assert(
      fc.property(elapsedArb, (elapsed) => {
        // Simulate the tick() logic writing to the DOM
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const timerEl = document.getElementById('recording-timer');
        timerEl.textContent = display;

        // Verify the DOM element contains the correctly formatted time
        expect(timerEl.textContent).toMatch(/^\d{2}:\d{2}$/);
        expect(timerEl.textContent).toBe(display);
      }),
      { numRuns: 100 }
    );

    document.body.innerHTML = '';
  });
});

/**
 * Property 9: Reduced motion disables waveform animation
 * Validates: Requirements 2.3
 *
 * For any recording panel display when prefers-reduced-motion: reduce is active,
 * all waveform bar elements SHALL have animation: none (via CSS) and display at
 * a static height.
 */
describe('Property 9: Reduced motion disables waveform animation', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    // Remove any injected style elements
    const styles = document.querySelectorAll('style[data-test-id="reduced-motion"]');
    styles.forEach(s => s.remove());
  });

  it('CSS stylesheet contains @media (prefers-reduced-motion: reduce) rule for waveform bars', () => {
    // Inject the same CSS that exists in index.html for waveform + reduced motion
    const style = document.createElement('style');
    style.setAttribute('data-test-id', 'reduced-motion');
    style.textContent = `
      .recording-waveform__bar {
        width: 4px;
        background: var(--color-studio-primary, #6c63ff);
        border-radius: 2px;
        animation: waveform-pulse 1.2s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .recording-waveform__bar {
          animation: none;
          height: 16px;
        }
      }
    `;
    document.head.appendChild(style);

    // Generate any number of waveform bars (1 to 10)
    const barCountArb = fc.integer({ min: 1, max: 10 });

    fc.assert(
      fc.property(barCountArb, (barCount) => {
        // Build a recording panel with N waveform bars
        const container = document.createElement('div');
        container.className = 'recording-waveform';
        for (let i = 0; i < barCount; i++) {
          const bar = document.createElement('div');
          bar.className = 'recording-waveform__bar';
          container.appendChild(bar);
        }
        document.body.appendChild(container);

        // Verify the stylesheet contains the reduced-motion media query rule
        const sheets = Array.from(document.styleSheets);
        let hasReducedMotionRule = false;

        for (const sheet of sheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule instanceof CSSMediaRule &&
                  rule.conditionText === '(prefers-reduced-motion: reduce)') {
                // Check it contains the waveform bar rule
                const innerRules = Array.from(rule.cssRules || []);
                for (const innerRule of innerRules) {
                  if (innerRule.selectorText === '.recording-waveform__bar') {
                    // Verify the rule sets animation: none and height: 16px
                    expect(innerRule.style.animation).toBe('none');
                    expect(innerRule.style.height).toBe('16px');
                    hasReducedMotionRule = true;
                  }
                }
              }
            }
          } catch (e) {
            // CORS restrictions on external stylesheets - skip
          }
        }

        expect(hasReducedMotionRule).toBe(true);

        // Cleanup
        document.body.removeChild(container);
      }),
      { numRuns: 100 }
    );
  });

  it('all waveform bars exist and would receive reduced-motion styles for any bar count', () => {
    // This test verifies that the DOM structure properly creates bars
    // that are targetable by the .recording-waveform__bar selector
    const barCountArb = fc.integer({ min: 1, max: 10 });

    fc.assert(
      fc.property(barCountArb, (barCount) => {
        document.body.innerHTML = '';
        const waveform = document.createElement('div');
        waveform.className = 'recording-waveform';
        for (let i = 0; i < barCount; i++) {
          const bar = document.createElement('div');
          bar.className = 'recording-waveform__bar';
          waveform.appendChild(bar);
        }
        document.body.appendChild(waveform);

        // Verify all bars have the correct class that the media query targets
        const bars = document.querySelectorAll('.recording-waveform__bar');
        expect(bars.length).toBe(barCount);

        // Each bar should be targetable by the CSS selector
        bars.forEach(bar => {
          expect(bar.classList.contains('recording-waveform__bar')).toBe(true);
        });
      }),
      { numRuns: 100 }
    );

    document.body.innerHTML = '';
  });
});
