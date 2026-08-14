// js/services/TranscriptionService.js

/* ============================================================
   TranscriptionService — Proxied via /api/transcribe serverless function
   The API key is stored server-side only; this service sends audio
   to our own backend which forwards it to Whisper.
============================================================ */
const TranscriptionService = {

  /**
   * Send audio to our serverless proxy for Whisper transcription.
   * The proxy attaches the API key server-side.
   * Returns { success: true, text } or { success: false, error, statusCode? }.
   */
  async transcribe(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, text: data.text };
      } else {
        return { success: false, error: data.error || 'Transcription failed.', statusCode: data.statusCode };
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  },

  // Legacy compat stubs (no-ops since key is server-side now)
  hasApiKey() { return true; },
  setApiKey() {},
  clearApiKey() {},
  _apiKey: null
};

export { TranscriptionService };
