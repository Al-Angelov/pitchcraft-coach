/**
 * Unit tests for AudioCaptureService
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4
 *
 * Tests verify:
 * - isSupported() detects getUserMedia availability
 * - requestMicrophone() returns true on success and stores stream
 * - requestMicrophone() returns false and announces error on permission denial
 * - requestMicrophone() returns false and announces error on unsupported browser
 * - start() creates MediaRecorder and begins recording
 * - stop() packages chunks into Blob with audio/webm MIME type
 * - stop() returns null when no chunks collected
 * - stop() releases stream tracks
 * - releaseStream() stops all tracks and nulls stream
 * - isRecording() reflects current state
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mirror of AccessibilityService (minimal for testing)
const AccessibilityService = {
  _politeRegion: null,
  _assertiveRegion: null,

  init() {
    this._politeRegion = document.createElement('div');
    this._politeRegion.setAttribute('aria-live', 'polite');
    this._politeRegion.className = 'sr-only';
    document.body.appendChild(this._politeRegion);

    this._assertiveRegion = document.createElement('div');
    this._assertiveRegion.setAttribute('aria-live', 'assertive');
    this._assertiveRegion.className = 'sr-only';
    document.body.appendChild(this._assertiveRegion);
  },

  announce(text, politeness = 'polite') {
    const region = politeness === 'assertive' ? this._assertiveRegion : this._politeRegion;
    if (!region) return;
    region.textContent = '';
    setTimeout(() => { region.textContent = text; }, 1);
  }
};

// Mirror of AudioCaptureService from index.html
const AudioCaptureService = {
  _stream: null,
  _recorder: null,
  _chunks: [],
  _isRecording: false,

  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  async requestMicrophone() {
    if (!this.isSupported()) {
      AccessibilityService.announce('Your browser does not support audio recording. Please use a modern browser.', 'assertive');
      return false;
    }
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      AccessibilityService.announce('Microphone access granted', 'polite');
      return true;
    } catch (err) {
      AccessibilityService.announce('Microphone access is required for recording. Please allow microphone access and try again.', 'assertive');
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

describe('AudioCaptureService', () => {
  beforeEach(() => {
    AccessibilityService.init();
    AudioCaptureService._stream = null;
    AudioCaptureService._recorder = null;
    AudioCaptureService._chunks = [];
    AudioCaptureService._isRecording = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('isSupported()', () => {
    it('returns true when navigator.mediaDevices.getUserMedia is available', () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn() },
        configurable: true,
        writable: true
      });
      expect(AudioCaptureService.isSupported()).toBe(true);
    });

    it('returns false when navigator.mediaDevices is undefined', () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined,
        configurable: true,
        writable: true
      });
      expect(AudioCaptureService.isSupported()).toBe(false);
    });

    it('returns false when getUserMedia is not a function', () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {},
        configurable: true,
        writable: true
      });
      expect(AudioCaptureService.isSupported()).toBe(false);
    });
  });

  describe('requestMicrophone()', () => {
    it('returns true and stores stream on successful permission grant', async () => {
      const mockStream = { getTracks: () => [] };
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
        configurable: true,
        writable: true
      });

      const result = await AudioCaptureService.requestMicrophone();

      expect(result).toBe(true);
      expect(AudioCaptureService._stream).toBe(mockStream);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it('announces "Microphone access granted" on success', async () => {
      const mockStream = { getTracks: () => [] };
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
        configurable: true,
        writable: true
      });

      await AudioCaptureService.requestMicrophone();

      // announce uses setTimeout(1), so we need to wait
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(AccessibilityService._politeRegion.textContent).toBe('Microphone access granted');
    });

    it('returns false when permission is denied', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')) },
        configurable: true,
        writable: true
      });

      const result = await AudioCaptureService.requestMicrophone();

      expect(result).toBe(false);
      expect(AudioCaptureService._stream).toBeNull();
    });

    it('announces permission denied error to screen readers via assertive region', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')) },
        configurable: true,
        writable: true
      });

      await AudioCaptureService.requestMicrophone();

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(AccessibilityService._assertiveRegion.textContent).toBe(
        'Microphone access is required for recording. Please allow microphone access and try again.'
      );
    });

    it('returns false when browser does not support getUserMedia', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined,
        configurable: true,
        writable: true
      });

      const result = await AudioCaptureService.requestMicrophone();

      expect(result).toBe(false);
    });

    it('announces unsupported browser error via assertive region', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined,
        configurable: true,
        writable: true
      });

      await AudioCaptureService.requestMicrophone();

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(AccessibilityService._assertiveRegion.textContent).toBe(
        'Your browser does not support audio recording. Please use a modern browser.'
      );
    });
  });

  describe('start()', () => {
    it('does nothing if no stream is available', () => {
      AudioCaptureService._stream = null;
      AudioCaptureService.start();
      expect(AudioCaptureService._recorder).toBeNull();
      expect(AudioCaptureService._isRecording).toBe(false);
    });

    it('creates a MediaRecorder and starts recording when stream exists', () => {
      const mockStart = vi.fn();
      const mockTrack = { stop: vi.fn() };
      const mockStream = { getTracks: () => [mockTrack] };

      // Mock MediaRecorder
      globalThis.MediaRecorder = vi.fn().mockImplementation((stream) => ({
        start: mockStart,
        stop: vi.fn(),
        ondataavailable: null,
        onstop: null,
        stream
      }));

      AudioCaptureService._stream = mockStream;
      AudioCaptureService.start();

      expect(globalThis.MediaRecorder).toHaveBeenCalledWith(mockStream);
      expect(mockStart).toHaveBeenCalled();
      expect(AudioCaptureService._isRecording).toBe(true);
      expect(AudioCaptureService._chunks).toEqual([]);
    });

    it('sets ondataavailable handler that pushes non-empty chunks', () => {
      const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
      let ondataavailableHandler = null;

      globalThis.MediaRecorder = vi.fn().mockImplementation(() => {
        const recorder = {
          start: vi.fn(),
          stop: vi.fn(),
          ondataavailable: null,
          onstop: null
        };
        // Capture the handler when it's set
        Object.defineProperty(recorder, 'ondataavailable', {
          set(fn) { ondataavailableHandler = fn; },
          get() { return ondataavailableHandler; }
        });
        return recorder;
      });

      AudioCaptureService._stream = mockStream;
      AudioCaptureService.start();

      // Simulate data event with non-empty data
      ondataavailableHandler({ data: { size: 1024 } });
      expect(AudioCaptureService._chunks).toHaveLength(1);
      expect(AudioCaptureService._chunks[0]).toEqual({ size: 1024 });

      // Simulate data event with empty data
      ondataavailableHandler({ data: { size: 0 } });
      expect(AudioCaptureService._chunks).toHaveLength(1); // no new chunk added
    });
  });

  describe('stop()', () => {
    it('returns null if no recorder exists', async () => {
      AudioCaptureService._recorder = null;
      AudioCaptureService._isRecording = true;
      const result = await AudioCaptureService.stop();
      expect(result).toBeNull();
    });

    it('returns null if not currently recording', async () => {
      AudioCaptureService._recorder = { stop: vi.fn() };
      AudioCaptureService._isRecording = false;
      const result = await AudioCaptureService.stop();
      expect(result).toBeNull();
    });

    it('packages chunks into a Blob with audio/webm type', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = { getTracks: () => [mockTrack] };
      AudioCaptureService._stream = mockStream;

      // Pre-populate chunks
      const chunk1 = new Blob(['hello'], { type: 'audio/webm' });
      const chunk2 = new Blob([' world'], { type: 'audio/webm' });
      AudioCaptureService._chunks = [chunk1, chunk2];
      AudioCaptureService._isRecording = true;

      let onstopHandler = null;
      AudioCaptureService._recorder = {
        stop() {
          // Trigger onstop when stop is called
          setTimeout(() => onstopHandler(), 0);
        },
        get onstop() { return onstopHandler; },
        set onstop(fn) { onstopHandler = fn; }
      };

      const result = await AudioCaptureService.stop();

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('audio/webm');
      expect(AudioCaptureService._isRecording).toBe(false);
      expect(AudioCaptureService._chunks).toEqual([]);
    });

    it('returns null and releases stream when no chunks collected', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = { getTracks: () => [mockTrack] };
      AudioCaptureService._stream = mockStream;
      AudioCaptureService._chunks = [];
      AudioCaptureService._isRecording = true;

      let onstopHandler = null;
      AudioCaptureService._recorder = {
        stop() {
          setTimeout(() => onstopHandler(), 0);
        },
        get onstop() { return onstopHandler; },
        set onstop(fn) { onstopHandler = fn; }
      };

      const result = await AudioCaptureService.stop();

      expect(result).toBeNull();
      expect(AudioCaptureService._isRecording).toBe(false);
      expect(AudioCaptureService._stream).toBeNull();
      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('releases stream tracks after packaging audio', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = { getTracks: () => [mockTrack] };
      AudioCaptureService._stream = mockStream;

      const chunk = new Blob(['data'], { type: 'audio/webm' });
      AudioCaptureService._chunks = [chunk];
      AudioCaptureService._isRecording = true;

      let onstopHandler = null;
      AudioCaptureService._recorder = {
        stop() {
          setTimeout(() => onstopHandler(), 0);
        },
        get onstop() { return onstopHandler; },
        set onstop(fn) { onstopHandler = fn; }
      };

      await AudioCaptureService.stop();

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(AudioCaptureService._stream).toBeNull();
    });
  });

  describe('releaseStream()', () => {
    it('stops all tracks and nulls the stream', () => {
      const mockTrack1 = { stop: vi.fn() };
      const mockTrack2 = { stop: vi.fn() };
      AudioCaptureService._stream = { getTracks: () => [mockTrack1, mockTrack2] };

      AudioCaptureService.releaseStream();

      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
      expect(AudioCaptureService._stream).toBeNull();
    });

    it('does nothing if stream is already null', () => {
      AudioCaptureService._stream = null;
      AudioCaptureService.releaseStream(); // Should not throw
      expect(AudioCaptureService._stream).toBeNull();
    });
  });

  describe('isRecording()', () => {
    it('returns false when not recording', () => {
      AudioCaptureService._isRecording = false;
      expect(AudioCaptureService.isRecording()).toBe(false);
    });

    it('returns true when recording is active', () => {
      AudioCaptureService._isRecording = true;
      expect(AudioCaptureService.isRecording()).toBe(true);
    });
  });
});
