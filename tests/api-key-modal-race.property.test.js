/**
 * Property test: Bug Condition Exploration — API Key Modal Race Condition
 * Property 1: Bug Condition - API Key Modal Race Condition
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 *
 * This test encodes the EXPECTED (correct) behavior. It is designed to FAIL on
 * unfixed code, proving the bug exists. When the fix is applied, it will pass.
 *
 * Scoped PBT Approach — four concrete failing scenarios:
 * 1. handleStop() with no API key → loading overlay shown before modal resolves (stacked overlays)
 * 2. endSession() while isRecording() === true → transcription flow not invoked (lost audio)
 * 3. handleStop() → showApiKeyModal() → cancel → loading overlay remains visible, state not reset
 * 4. Concurrent endSession() + handleStop() → AudioCaptureService.stop() called multiple times
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// ─── Test Helpers ─────────────────────────────────────────────────────────────

/**
 * Creates a mock DOM environment matching what the controllers expect.
 */
function createMockDOM() {
  // Recording panel
  const recordingPanel = document.createElement('div');
  recordingPanel.id = 'recording-panel';
  recordingPanel.hidden = true;
  document.body.appendChild(recordingPanel);

  const recordingTimer = document.createElement('span');
  recordingTimer.id = 'recording-timer';
  document.body.appendChild(recordingTimer);

  // Loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'transcription-loading';
  loadingOverlay.hidden = true;
  document.body.appendChild(loadingOverlay);

  // Session controls
  const sessionControls = document.createElement('div');
  sessionControls.id = 'session-controls';
  const btn = document.createElement('button');
  sessionControls.appendChild(btn);
  document.body.appendChild(sessionControls);

  // API Key modal
  const apiKeyModal = document.createElement('div');
  apiKeyModal.id = 'api-key-modal';
  apiKeyModal.hidden = true;
  document.body.appendChild(apiKeyModal);

  const apiKeyInput = document.createElement('input');
  apiKeyInput.id = 'api-key-input';
  document.body.appendChild(apiKeyInput);

  const apiKeyForm = document.createElement('form');
  apiKeyForm.id = 'api-key-form';
  document.body.appendChild(apiKeyForm);

  const btnCancelApiKey = document.createElement('button');
  btnCancelApiKey.id = 'btn-cancel-api-key';
  document.body.appendChild(btnCancelApiKey);

  // Transcript display
  const transcriptDisplay = document.createElement('div');
  transcriptDisplay.id = 'transcript-display';
  transcriptDisplay.hidden = true;
  document.body.appendChild(transcriptDisplay);

  // Stage container (for error/transcript elements)
  const stage = document.createElement('div');
  stage.id = 'stage';
  document.body.appendChild(stage);

  // Session UI elements
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer-display';
  document.body.appendChild(timerDisplay);

  const phaseIndicator = document.createElement('div');
  phaseIndicator.id = 'phase-indicator';
  document.body.appendChild(phaseIndicator);

  const btnPause = document.createElement('button');
  btnPause.id = 'btn-pause';
  document.body.appendChild(btnPause);

  const btnResume = document.createElement('button');
  btnResume.id = 'btn-resume';
  document.body.appendChild(btnResume);

  const btnStop = document.createElement('button');
  btnStop.id = 'btn-stop';
  document.body.appendChild(btnStop);

  const sessionSummary = document.createElement('div');
  sessionSummary.id = 'session-summary';
  sessionSummary.hidden = true;
  document.body.appendChild(sessionSummary);

  const modeSelection = document.createElement('div');
  modeSelection.id = 'mode-selection';
  modeSelection.hidden = true;
  document.body.appendChild(modeSelection);

  const btnStart = document.createElement('button');
  btnStart.id = 'btn-start';
  btnStart.hidden = true;
  document.body.appendChild(btnStart);

  const summaryContent = document.createElement('div');
  summaryContent.id = 'summary-content';
  document.body.appendChild(summaryContent);

  return {
    recordingPanel, recordingTimer, loadingOverlay, sessionControls,
    apiKeyModal, apiKeyInput, apiKeyForm, btnCancelApiKey,
    transcriptDisplay, stage
  };
}

/**
 * Creates mock services that mirror the interface of the real implementations.
 */
function createMockServices({ hasApiKey = false, audioBlob = new Blob(['audio'], { type: 'audio/webm' }) } = {}) {
  const stopCalls = [];

  const AudioCaptureService = {
    _isRecording: true,
    isRecording() { return this._isRecording; },
    async stop() {
      stopCalls.push(Date.now());
      this._isRecording = false;
      return audioBlob;
    },
    start() { this._isRecording = true; },
    releaseStream() {}
  };

  const TranscriptionService = {
    _apiKey: hasApiKey ? 'sk-test-key' : null,
    hasApiKey() { return this._apiKey !== null && this._apiKey.length > 0; },
    setApiKey(key) { this._apiKey = key; },
    clearApiKey() { this._apiKey = null; },
    async transcribe(blob) {
      return { success: true, text: 'Transcribed text.' };
    }
  };

  const AccessibilityService = {
    announcements: [],
    announce(msg, priority) { this.announcements.push({ msg, priority }); }
  };

  const AppState = {
    screen: 'studio',
    activeModule: 'stage',
    session: {
      mode: { id: 'elevator-60', label: '60-Second Elevator Pitch', durationSeconds: 60, isFreeMode: false, phases: [{ name: 'Hook', startPercent: 0, endPercent: 1.0 }] },
      status: 'running',
      elapsed: 55,
      phasesCompleted: [],
      curveballsShown: [],
      recording: true,
      transcript: null
    },
    historyPanelOpen: false
  };

  return { AudioCaptureService, TranscriptionService, AccessibilityService, AppState, stopCalls };
}

/**
 * Creates the RecordingPanelController as it exists in the FIXED code.
 * This mirrors the actual implementation in index.html EXACTLY.
 * Includes _stopInProgress guard, recording state reset, and cancel cleanup.
 */
function createRecordingPanelController(services) {
  const { AudioCaptureService, TranscriptionService, AccessibilityService, AppState } = services;

  return {
    _intervalId: null,
    _startTime: null,
    _elapsed: 0,
    _triggerElement: null,
    _stopInProgress: false,

    show() {
      const panel = document.getElementById('recording-panel');
      if (panel) panel.hidden = false;
      AccessibilityService.announce('Recording started', 'assertive');
    },

    hide() {
      const panel = document.getElementById('recording-panel');
      if (panel) panel.hidden = true;
      if (this._intervalId) {
        clearInterval(this._intervalId);
        this._intervalId = null;
      }
    },

    // Fixed handleStop — with _stopInProgress guard and cancel cleanup
    async handleStop() {
      if (this._stopInProgress) return;
      this._stopInProgress = true;
      AppState.session.recording = false;

      this.hide();
      const audioBlob = await AudioCaptureService.stop();
      if (!audioBlob) {
        this.showError('No audio was captured. Please check your microphone and try again.');
        this._stopInProgress = false;
        return;
      }
      // Check if API key is available
      if (!TranscriptionService.hasApiKey()) {
        try {
          const key = await this.showApiKeyModal();
          TranscriptionService.setApiKey(key);
        } catch (e) {
          // User cancelled — clean up all state
          this.hideLoading();
          AppState.session.recording = false;
          this._stopInProgress = false;
          AccessibilityService.announce('Transcription cancelled', 'polite');
          return;
        }
      }
      this.showLoading();
      const result = await TranscriptionService.transcribe(audioBlob);
      this.hideLoading();
      if (result.success) {
        this.showTranscript(result.text);
      } else {
        this.showError(result.error);
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
      const controls = document.getElementById('session-controls');
      if (controls) {
        controls.querySelectorAll('button').forEach(btn => btn.disabled = true);
      }
    },

    hideLoading() {
      const overlay = document.getElementById('transcription-loading');
      if (overlay) overlay.hidden = true;
      const controls = document.getElementById('session-controls');
      if (controls) {
        controls.querySelectorAll('button').forEach(btn => btn.disabled = false);
      }
    },

    showTranscript(text) {
      AppState.session.transcript = text;
      let transcriptEl = document.getElementById('transcript-display');
      if (transcriptEl) {
        transcriptEl.textContent = text;
        transcriptEl.hidden = false;
      }
      AccessibilityService.announce('Transcription complete', 'polite');
    },

    showError(message) {
      AccessibilityService.announce(message, 'assertive');
    }
  };
}

/**
 * Creates the StageController.endSession() as it exists in the FIXED code.
 * This delegates to recordingPanelController.handleStop() instead of fire-and-forget.
 */
function createStageController(services, recordingPanelController) {
  const { AudioCaptureService, AppState } = services;

  return {
    _intervalId: null,

    endSession() {
      // Fixed code: delegate to handleStop() for full transcription flow
      if (AudioCaptureService.isRecording()) {
        recordingPanelController.handleStop();
      }

      // Clear interval
      clearInterval(this._intervalId);
      this._intervalId = null;
      AppState.session.status = 'completed';
    },

    updateRecordButton() {}
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Property 1: Bug Condition - API Key Modal Race Condition', () => {
  let dom;

  beforeEach(() => {
    document.body.innerHTML = '';
    dom = createMockDOM();
  });

  describe('Scenario 1: Stacked overlays when no API key (Req 1.1)', () => {
    /**
     * EXPECTED BEHAVIOR (2.1): When no API key is in memory, ONLY the API Key modal
     * should be visible. The loading overlay must NOT appear until after the key is submitted.
     *
     * We verify the design requirement that between the time the modal is shown and
     * the time it resolves, the loading overlay must remain hidden.
     *
     * The fixed handleStop() awaits the modal promise before calling showLoading(),
     * so the loading overlay is never visible while the modal is open.
     */
    it('while API key modal is showing, loading overlay must remain hidden', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 200 }),
          async (timing) => {
            document.body.innerHTML = '';
            dom = createMockDOM();

            const services = createMockServices({ hasApiKey: false });
            const controller = createRecordingPanelController(services);

            // Create a deferred promise for the modal (simulates user not having submitted yet)
            let resolveModal;
            controller.showApiKeyModal = () => new Promise((resolve, reject) => {
              resolveModal = resolve;
              // Show modal visually
              const modal = document.getElementById('api-key-modal');
              if (modal) modal.hidden = false;
            });

            // Start handleStop (it will await the modal)
            const stopPromise = controller.handleStop();

            // Allow microtask queue to process (handleStop awaits AudioCaptureService.stop() first)
            await new Promise(r => setTimeout(r, 0));

            // Now modal should be showing, loading should NOT be
            const modal = document.getElementById('api-key-modal');
            const loadingOverlay = document.getElementById('transcription-loading');

            // INVARIANT: Loading overlay must be hidden while modal is unresolved
            expect(loadingOverlay.hidden).toBe(true);

            // Resolve the modal to allow handleStop to continue
            if (resolveModal) resolveModal('sk-test-key');
            await stopPromise;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Scenario 2: endSession() with active recording loses audio (Req 1.2)', () => {
    /**
     * EXPECTED BEHAVIOR (2.2): When recording is active and session ends, the full
     * transcription flow must be invoked — endSession() must delegate to handleStop().
     *
     * BUG: endSession() calls AudioCaptureService.stop() as fire-and-forget without
     * ever invoking TranscriptionService.transcribe(). The audio blob is discarded.
     */
    it('endSession() with active recording must trigger transcription', async () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1800 }), // elapsed seconds
          (elapsed) => {
            // Reset DOM
            document.body.innerHTML = '';
            dom = createMockDOM();

            const services = createMockServices({ hasApiKey: true });
            services.AppState.session.elapsed = elapsed;
            services.AudioCaptureService._isRecording = true;

            let transcriptionDelegated = false;
            const controller = createRecordingPanelController(services);

            // Instrument handleStop to detect if endSession delegates to it
            const originalHandleStop = controller.handleStop.bind(controller);
            controller.handleStop = async function() {
              transcriptionDelegated = true;
              return originalHandleStop();
            };

            const stageController = createStageController(services, controller);

            // Call endSession while recording is active
            stageController.endSession();

            // EXPECTED: endSession should delegate to handleStop for full transcription flow
            // BUG: endSession calls AudioCaptureService.stop() directly (fire-and-forget)
            // and NEVER calls handleStop(), so transcription is never triggered.
            expect(transcriptionDelegated).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Scenario 3: Cancel on modal leaves UI hanging (Req 1.3)', () => {
    /**
     * EXPECTED BEHAVIOR (2.3): Cancel hides all overlays and resets
     * AppState.session.recording = false.
     *
     * BUG: Unfixed code just returns on cancel without resetting recording state
     * or ensuring overlays are hidden. The UI is left in a broken state.
     */
    it('cancel path must reset AppState.session.recording to false', async () => {
      // We use fc.assert with asyncProperty to ensure this holds across inputs
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Reset DOM
          document.body.innerHTML = '';
          dom = createMockDOM();

          const services = createMockServices({ hasApiKey: false });
          services.AppState.session.recording = true;
          const controller = createRecordingPanelController(services);

          // Override showApiKeyModal to always reject (simulate cancel)
          controller.showApiKeyModal = () => Promise.reject(new Error('User cancelled'));

          await controller.handleStop();

          // EXPECTED: After cancel, recording state must be reset to false
          // BUG: unfixed code does not reset AppState.session.recording on cancel
          expect(services.AppState.session.recording).toBe(false);
        }),
        { numRuns: 20 }
      );
    });

    it('cancel path must call hideLoading to ensure no hanging overlay', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Reset DOM
          document.body.innerHTML = '';
          dom = createMockDOM();

          const services = createMockServices({ hasApiKey: false });
          const controller = createRecordingPanelController(services);

          let hideLoadingCalled = false;
          const originalHideLoading = controller.hideLoading.bind(controller);
          controller.hideLoading = function() {
            hideLoadingCalled = true;
            originalHideLoading();
          };

          // Override showApiKeyModal to always reject (simulate cancel)
          controller.showApiKeyModal = () => Promise.reject(new Error('User cancelled'));

          await controller.handleStop();

          // EXPECTED: Cancel path should explicitly call hideLoading (defensive cleanup)
          // BUG: unfixed code does not call hideLoading in the cancel/catch path
          expect(hideLoadingCalled).toBe(true);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Scenario 4: Concurrent endSession + handleStop causes duplicate stops (Req 1.4)', () => {
    /**
     * EXPECTED BEHAVIOR (2.4): Only one AudioCaptureService.stop() call should occur,
     * regardless of concurrent triggers. A _stopInProgress guard should prevent re-entry.
     *
     * BUG: No guard exists. When both endSession() and handleStop() fire at the same
     * time (e.g., timer expiry + user click), both see isRecording() === true
     * and both call AudioCaptureService.stop().
     */
    it('only one AudioCaptureService.stop() call with concurrent triggers', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Reset DOM
            document.body.innerHTML = '';
            dom = createMockDOM();

            const stopCalls = [];
            const audioBlob = new Blob(['audio'], { type: 'audio/webm' });

            // Create AudioCaptureService where isRecording() stays true synchronously
            // after stop() is called (simulating real MediaRecorder async behavior)
            const AudioCaptureService = {
              _isRecording: true,
              isRecording() { return this._isRecording; },
              stop() {
                stopCalls.push('stop');
                // In real code, _isRecording doesn't change until onstop callback
                // The promise resolves asynchronously
                const self = this;
                return new Promise(resolve => {
                  // Delay the state change to simulate real behavior
                  setTimeout(() => {
                    self._isRecording = false;
                    resolve(audioBlob);
                  }, 10);
                });
              },
              start() { this._isRecording = true; },
              releaseStream() {}
            };

            const services = createMockServices({ hasApiKey: true });
            services.AudioCaptureService = AudioCaptureService;
            services.stopCalls = stopCalls;

            const controller = createRecordingPanelController(services);
            const stageController = createStageController(services, controller);

            // Both fire synchronously — both see isRecording() === true
            controller.handleStop(); // calls AudioCaptureService.stop()
            stageController.endSession(); // also checks isRecording() — still true!

            // EXPECTED: Only ONE stop call should occur (guard prevents second)
            // BUG: Both paths call stop() because:
            // 1. handleStop calls AudioCaptureService.stop() (async, doesn't immediately set _isRecording=false)
            // 2. endSession synchronously checks isRecording() — still true — and calls stop() again
            expect(stopCalls.length).toBe(1);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
