// js/services/AudioCaptureService.js
import { AccessibilityService } from './AccessibilityService.js';

/* ============================================================
   AudioCaptureService — Microphone access + MediaRecorder management
   Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
============================================================ */
const AudioCaptureService = {
  _stream: null,
  _recorder: null,
  _chunks: [],
  _isRecording: false,

  /**
   * Check if the browser supports getUserMedia.
   */
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  /**
   * Request microphone access. Returns a promise resolving to true/false.
   * Announces status to screen readers via AccessibilityService.
   */
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

  /**
   * Start recording. Requires prior successful requestMicrophone().
   * Initializes MediaRecorder with optimized settings for upload size.
   * Uses timeslice to collect data in smaller chunks.
   * Requirements: 3.1
   */
  start() {
    if (!this._stream) return;
    this._chunks = [];

    // Use lower bitrate to keep file sizes manageable for serverless upload
    const options = {};
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options.mimeType = 'audio/webm;codecs=opus';
    }
    options.audioBitsPerSecond = 32000; // 32kbps — good speech quality, small files

    try {
      this._recorder = new MediaRecorder(this._stream, options);
    } catch (e) {
      // Fallback: no options if browser rejects them
      this._recorder = new MediaRecorder(this._stream);
    }

    this._recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this._chunks.push(e.data);
      }
    };
    // Collect data every 1 second (timeslice) to avoid one giant buffer at stop
    this._recorder.start(1000);
    this._isRecording = true;
  },

  /**
   * Stop recording. Packages chunks into a single Blob (audio/webm).
   * Releases media stream tracks. Returns the audio Blob.
   * Returns null if no chunks were collected.
   * Requirements: 3.2, 3.3, 3.4
   */
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

  /**
   * Release microphone resources without packaging audio.
   * Requirements: 3.4
   */
  releaseStream() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
  },

  /**
   * Returns true if currently recording.
   */
  isRecording() {
    return this._isRecording;
  }
};

export { AudioCaptureService };
