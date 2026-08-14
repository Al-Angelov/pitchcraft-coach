// js/controllers/RecordingPanelController.js
import { AppState } from '../data/constants.js';
import { AudioCaptureService } from '../services/AudioCaptureService.js';
import { TranscriptionService } from '../services/TranscriptionService.js';
import { AiFeedbackService } from '../services/AiFeedbackService.js';
import { SessionHistoryService } from '../services/SessionHistoryService.js';
import { AccessibilityService } from '../services/AccessibilityService.js';
import { HistoryPanelController } from './HistoryPanelController.js';

/* ============================================================
   RecordingPanelController — Recording state management
   (Timer is now unified with StageController; this handles
    recording lifecycle and transcription flow)
============================================================ */
const RecordingPanelController = {
  _stopInProgress: false,

  show() {
    // Recording visual state is now part of the active-session-deck
    // Just announce for accessibility
    AccessibilityService.announce('Recording started', 'assertive');
  },

  hide() {
    // No-op: active deck visibility is managed by StageController
  },

  async handleStop() {
    if (this._stopInProgress) return;
    this._stopInProgress = true;
    AppState.session.recording = false;

    this.hide();
    // Defensively hide loading overlay first to ensure clean state
    this.hideLoading();
    const audioBlob = await AudioCaptureService.stop();
    if (!audioBlob) {
      this.showError('No audio was captured. Please check your microphone and try again.');
      this._stopInProgress = false;
      return;
    }
    // API key is hardcoded — skip modal entirely, proceed to transcription
    // Only show loading AFTER API key is confirmed available
    this.showLoading();
    const result = await TranscriptionService.transcribe(audioBlob);
    this.hideLoading();
    if (result.success) {
      this.showTranscript(result.text);
    } else {
      if (result.statusCode === 401) {
        TranscriptionService.clearApiKey();
        this.showError(result.error);
      } else {
        this.showError(result.error);
      }
    }
    this._stopInProgress = false;
  },

  showApiKeyModal() {
    return new Promise((resolve, reject) => {
      const modal = document.getElementById('api-key-modal');
      const input = document.getElementById('api-key-input');
      const form = document.getElementById('api-key-form');
      const cancelBtn = document.getElementById('btn-cancel-api-key');
      if (!modal || !input || !form || !cancelBtn) { reject(); return; }

      modal.hidden = false;
      input.value = '';
      input.focus();

      const cleanup = () => {
        modal.hidden = true;
        form.removeEventListener('submit', onSubmit);
        cancelBtn.removeEventListener('click', onCancel);
      };

      const onSubmit = (e) => {
        e.preventDefault();
        const key = input.value.trim();
        if (key) {
          cleanup();
          resolve(key);
        }
      };

      const onCancel = () => {
        cleanup();
        reject(new Error('User cancelled'));
      };

      form.addEventListener('submit', onSubmit);
      cancelBtn.addEventListener('click', onCancel);
    });
  },

  showLoading() {
    const overlay = document.getElementById('transcription-loading');
    if (overlay) overlay.hidden = false;
    // Disable stage controls
    const controls = document.getElementById('session-controls');
    if (controls) {
      controls.querySelectorAll('button').forEach(btn => btn.disabled = true);
    }
  },

  hideLoading() {
    const overlay = document.getElementById('transcription-loading');
    if (overlay) overlay.hidden = true;
    // Re-enable stage controls
    const controls = document.getElementById('session-controls');
    if (controls) {
      controls.querySelectorAll('button').forEach(btn => btn.disabled = false);
    }
  },

  showTranscript(text) {
    AppState.session.transcript = text;

    // Persist transcript to the most recent session history record
    SessionHistoryService.updateLatest({ transcript: text });

    // Refresh history panel if open (so sidebar shows updated data)
    if (AppState.historyPanelOpen) {
      HistoryPanelController.renderList();
    }

    // Ensure session summary is visible
    const sessionSummary = document.getElementById('session-summary');
    if (sessionSummary) sessionSummary.removeAttribute('hidden');
    // Render transcript inside the session summary panel
    const summaryContent = document.getElementById('summary-content');
    if (summaryContent) {
      // Remove any existing transcript section to avoid duplicates
      const existing = summaryContent.querySelector('[data-transcript-section]');
      if (existing) existing.remove();
      // Append transcript section to existing summary
      const transcriptSection = document.createElement('div');
      transcriptSection.setAttribute('data-transcript-section', 'true');
      transcriptSection.style.marginTop = 'var(--space-3, 1.5rem)';
      transcriptSection.style.paddingTop = 'var(--space-2, 1rem)';
      transcriptSection.style.borderTop = '1px solid rgba(200, 146, 42, 0.1)';
      transcriptSection.innerHTML = `
        <h4 style="font-family: var(--font-serif); font-size: var(--text-sm); font-weight: 700; color: var(--color-studio-primary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-1, 0.5rem);">Transcript</h4>
        <p style="font-family: var(--font-sans); font-size: var(--text-sm); line-height: 1.7; color: var(--color-studio-text); opacity: 0.9; white-space: pre-wrap;">${text}</p>
      `;
      summaryContent.appendChild(transcriptSection);
    }
    // Also update session detail modal transcript section (for immediate viewing)
    const detailTranscript = document.getElementById('session-detail-transcript');
    if (detailTranscript) {
      detailTranscript.innerHTML = `<p class="session-detail__section-content" style="white-space: pre-wrap;">${text}</p>`;
    }
    AccessibilityService.announce('Transcription complete', 'polite');

    // ── Trigger AI Coaching Feedback (non-blocking) ──────────
    this._triggerFeedback(text);
  },

  /**
   * Trigger AI feedback generation after transcription.
   * Non-blocking: if feedback fails, transcript still persists.
   */
  async _triggerFeedback(transcript) {
    if (!transcript || transcript.trim().length === 0) return;

    const sessionMode = AppState.session.mode ? AppState.session.mode.id : null;

    // Show loading state in feedback section
    const feedbackEl = document.getElementById('session-detail-feedback');
    if (feedbackEl) {
      feedbackEl.innerHTML = '<p class="session-detail__placeholder" style="font-style: italic; color: var(--color-studio-muted);">Generating coaching feedback...</p>';
    }

    // Also show loading in session summary
    const summaryContent = document.getElementById('summary-content');
    let feedbackSection = null;
    if (summaryContent) {
      const existingFeedback = summaryContent.querySelector('[data-feedback-section]');
      if (existingFeedback) existingFeedback.remove();
      feedbackSection = document.createElement('div');
      feedbackSection.setAttribute('data-feedback-section', 'true');
      feedbackSection.style.marginTop = 'var(--space-3, 1.5rem)';
      feedbackSection.style.paddingTop = 'var(--space-2, 1rem)';
      feedbackSection.style.borderTop = '1px solid rgba(200, 146, 42, 0.1)';
      feedbackSection.innerHTML = `
        <h4 style="font-family: var(--font-serif); font-size: var(--text-sm); font-weight: 700; color: var(--color-studio-primary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-1, 0.5rem);">AI Coaching Feedback</h4>
        <p style="font-style: italic; color: var(--color-studio-muted);">Generating coaching feedback...</p>
      `;
      summaryContent.appendChild(feedbackSection);
    }

    AccessibilityService.announce('Generating coaching feedback', 'polite');

    // Call the feedback service
    const result = await AiFeedbackService.generateFeedback(transcript, sessionMode);

    if (result.success) {
      const renderedHtml = AiFeedbackService.renderMarkdown(result.feedback);

      // Update session detail modal feedback section
      if (feedbackEl) {
        feedbackEl.innerHTML = `<div class="session-detail__section-content">${renderedHtml}</div>`;
      }

      // Update session summary panel
      if (feedbackSection) {
        feedbackSection.innerHTML = `
          <h4 style="font-family: var(--font-serif); font-size: var(--text-sm); font-weight: 700; color: var(--color-studio-primary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-1, 0.5rem);">AI Coaching Feedback</h4>
          <div style="font-family: var(--font-sans); font-size: var(--text-sm); line-height: 1.7; color: var(--color-studio-text); opacity: 0.9;">${renderedHtml}</div>
        `;
      }

      // Persist feedback to session history
      SessionHistoryService.updateLatest({ aiFeedback: result.feedback });

      // Refresh history panel if open
      if (AppState.historyPanelOpen) {
        HistoryPanelController.renderList();
      }

      AccessibilityService.announce('Coaching feedback ready', 'polite');

      // Generate AI session title (non-blocking background call)
      this._generateSessionTitle(transcript, sessionMode);
    } else {
      // Show error in feedback section without disrupting transcript
      const errorMsg = result.error || 'Feedback unavailable';
      if (feedbackEl) {
        feedbackEl.innerHTML = `<p class="session-detail__placeholder" style="font-style: italic; color: var(--color-studio-muted);">Feedback unavailable: ${errorMsg}</p>`;
      }
      if (feedbackSection) {
        feedbackSection.innerHTML = `
          <h4 style="font-family: var(--font-serif); font-size: var(--text-sm); font-weight: 700; color: var(--color-studio-primary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-1, 0.5rem);">AI Coaching Feedback</h4>
          <p style="font-style: italic; color: var(--color-studio-muted);">Feedback unavailable: ${errorMsg}</p>
        `;
      }
      AccessibilityService.announce(`Feedback error: ${errorMsg}`, 'assertive');
    }
  },

  /**
   * Generate an AI session title and persist it.
   * Non-blocking: failure silently ignored.
   */
  async _generateSessionTitle(transcript, sessionMode) {
    const result = await AiFeedbackService.generateTitle(transcript, sessionMode);
    if (result.success && result.title) {
      SessionHistoryService.updateLatest({ sessionTitle: result.title });
      if (AppState.historyPanelOpen) {
        HistoryPanelController.renderList();
      }
    }
  },

  showError(message) {
    AccessibilityService.announce(message, 'assertive');
    // Display inline error in stage area
    let errorEl = document.getElementById('recording-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.id = 'recording-error';
      errorEl.className = 'recording-error';
      errorEl.setAttribute('role', 'alert');
      const stage = document.getElementById('stage');
      if (stage) stage.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.hidden = false;
    // Auto-hide after 5 seconds
    setTimeout(() => { if (errorEl) errorEl.hidden = true; }, 5000);
  }
};

export { RecordingPanelController };
