// js/services/TranscriptionService.js

/* ============================================================
   TranscriptionService — Proxied via /api/transcribe serverless function
   The API key is stored server-side only; this service sends audio
   to our own backend which forwards it to Whisper.
============================================================ */
const TranscriptionService = {
  // Maximum time to wait for transcription response (ms)
  _TIMEOUT_MS: 120000, // 2 minutes — long recordings need time to upload + process

  /**
   * Send audio to our serverless proxy for Whisper transcription.
   * Includes timeout handling and detailed error reporting.
   * Returns { success: true, text } or { success: false, error, statusCode? }.
   */
  async transcribe(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    // Set up abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this._TIMEOUT_MS);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses (e.g., 413 from proxy)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (response.status === 413) {
          return { success: false, error: 'Recording too large. Try a shorter session (under 5 minutes).', statusCode: 413 };
        }
        return { success: false, error: 'Server returned an unexpected response (HTTP ' + response.status + ').', statusCode: response.status };
      }

      const data = await response.json();

      if (data.success) {
        return { success: true, text: data.text };
      } else {
        return { success: false, error: data.error || 'Transcription failed.', statusCode: data.statusCode };
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        return { success: false, error: 'Transcription timed out. The recording may be too long — try a shorter session.' };
      }
      if (err.message && err.message.includes('Failed to fetch')) {
        return { success: false, error: 'Network connection lost. Please check your internet and try again.' };
      }
      return { success: false, error: 'Network error: ' + (err.message || 'Please check your connection and try again.') };
    }
  },

  // Legacy compat stubs (no-ops since key is server-side now)
  hasApiKey() { return true; },
  setApiKey() {},
  clearApiKey() {},
  _apiKey: null
};

export { TranscriptionService };
