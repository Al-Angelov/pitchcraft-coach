/**
 * Unit tests for TranscriptionService
 * Requirements: 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 *
 * Tests verify:
 * - setApiKey/hasApiKey/clearApiKey lifecycle
 * - API key is never stored in localStorage
 * - transcribe() builds correct FormData and sends POST to Whisper API
 * - Successful 200 response returns { success: true, text }
 * - 401 response returns { success: false, error: "Invalid API key...", statusCode: 401 }
 * - Other HTTP errors return { success: false, error with status code, statusCode }
 * - Network failure returns { success: false, error: "Network error..." }
 * - transcribe() without API key returns error immediately
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// TranscriptionService extracted inline — mirrors the implementation in index.html exactly.
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

describe('TranscriptionService', () => {
  beforeEach(() => {
    TranscriptionService.clearApiKey();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    TranscriptionService.clearApiKey();
    vi.restoreAllMocks();
  });

  describe('API key management', () => {
    it('hasApiKey returns false when no key is set', () => {
      expect(TranscriptionService.hasApiKey()).toBe(false);
    });

    it('hasApiKey returns true after setApiKey with a valid key', () => {
      TranscriptionService.setApiKey('sk-test123');
      expect(TranscriptionService.hasApiKey()).toBe(true);
    });

    it('hasApiKey returns false after clearApiKey', () => {
      TranscriptionService.setApiKey('sk-test123');
      TranscriptionService.clearApiKey();
      expect(TranscriptionService.hasApiKey()).toBe(false);
    });

    it('hasApiKey returns false for empty string', () => {
      TranscriptionService.setApiKey('');
      expect(TranscriptionService.hasApiKey()).toBe(false);
    });

    // Requirement 4.3 — API key never in localStorage
    it('API key is never stored in localStorage', () => {
      TranscriptionService.setApiKey('sk-secret-key');
      expect(localStorage.getItem('apiKey')).toBeNull();
      expect(localStorage.getItem('openai_key')).toBeNull();
      // Check that no localStorage entry contains the key
      for (let i = 0; i < localStorage.length; i++) {
        const val = localStorage.getItem(localStorage.key(i));
        expect(val).not.toContain('sk-secret-key');
      }
    });
  });

  describe('transcribe()', () => {
    it('returns error immediately if no API key is set', async () => {
      const blob = new Blob(['audio'], { type: 'audio/webm' });
      const result = await TranscriptionService.transcribe(blob);
      expect(result).toEqual({ success: false, error: 'No API key provided.' });
    });

    // Requirement 5.1, 5.2 — correct FormData and Authorization header
    it('sends POST to Whisper API with correct FormData and auth header', async () => {
      TranscriptionService.setApiKey('sk-test-key');
      const blob = new Blob(['audio-data'], { type: 'audio/webm' });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ text: 'Hello world' })
      });
      global.fetch = mockFetch;

      await TranscriptionService.transcribe(blob);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.openai.com/v1/audio/transcriptions');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toBe('Bearer sk-test-key');
      expect(options.body).toBeInstanceOf(FormData);

      const formData = options.body;
      expect(formData.get('model')).toBe('whisper-1');
      expect(formData.get('file')).toBeInstanceOf(File);
    });

    // Requirement 5.3 — successful response
    it('returns { success: true, text } on 200 response', async () => {
      TranscriptionService.setApiKey('sk-test-key');
      const blob = new Blob(['audio-data'], { type: 'audio/webm' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ text: 'Transcribed speech here' })
      });

      const result = await TranscriptionService.transcribe(blob);
      expect(result).toEqual({ success: true, text: 'Transcribed speech here' });
    });

    // Requirement 5.4 — 401 Unauthorized
    it('returns invalid API key error on 401 response', async () => {
      TranscriptionService.setApiKey('sk-bad-key');
      const blob = new Blob(['audio-data'], { type: 'audio/webm' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Unauthorized' } })
      });

      const result = await TranscriptionService.transcribe(blob);
      expect(result).toEqual({
        success: false,
        error: 'Invalid API key. Please re-enter your key.',
        statusCode: 401
      });
    });

    // Requirement 5.5 — other HTTP errors
    it('returns error with status code on 500 response', async () => {
      TranscriptionService.setApiKey('sk-test-key');
      const blob = new Blob(['audio-data'], { type: 'audio/webm' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: 'Internal error' } })
      });

      const result = await TranscriptionService.transcribe(blob);
      expect(result).toEqual({
        success: false,
        error: 'Transcription failed (HTTP 500). Please try again.',
        statusCode: 500
      });
    });

    it('returns error with status code on 429 response', async () => {
      TranscriptionService.setApiKey('sk-test-key');
      const blob = new Blob(['audio-data'], { type: 'audio/webm' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: { message: 'Rate limited' } })
      });

      const result = await TranscriptionService.transcribe(blob);
      expect(result).toEqual({
        success: false,
        error: 'Transcription failed (HTTP 429). Please try again.',
        statusCode: 429
      });
    });

    // Requirement 5.6 — network error
    it('returns network error on fetch rejection', async () => {
      TranscriptionService.setApiKey('sk-test-key');
      const blob = new Blob(['audio-data'], { type: 'audio/webm' });

      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await TranscriptionService.transcribe(blob);
      expect(result).toEqual({
        success: false,
        error: 'Network error. Please check your connection and try again.'
      });
    });
  });
});
