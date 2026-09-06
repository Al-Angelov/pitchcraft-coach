// js/controllers/StageController.js
import { SESSION_MODES, CURVEBALL_POOL, GOALS, AppState } from '../data/constants.js';
import { AudioCaptureService } from '../services/AudioCaptureService.js';
import { AccessibilityService } from '../services/AccessibilityService.js';
import { SessionHistoryService } from '../services/SessionHistoryService.js';
import { RecordingPanelController } from './RecordingPanelController.js';
import { HistoryPanelController } from './HistoryPanelController.js';
import { AuthController } from './AuthController.js';

/* ============================================================
   StageController — session mode selection and session management
   Requirements: 1.1, 1.2, 1.4, 2.5, 3.2, 5.6
============================================================ */
const StageController = {
  _intervalId: null,
  _startTime: null,
  _pausedElapsed: 0,
  _lastPhaseIndex: -1,
  _curveballScheduledAt: null,

  init() {
    // Attach click handlers to mode cards (skip disabled/locked cards)
    const modeCards = document.querySelectorAll('.stage__mode-card');
    modeCards.forEach(card => {
      if (card.classList.contains('stage__mode-card--locked') || card.getAttribute('aria-disabled') === 'true') {
        return; // Locked cards (e.g. Free Mode "Coming Soon") are not selectable
      }
      card.addEventListener('click', () => {
        this.selectMode(card.dataset.modeId);
      });
    });

    // Attach session control buttons
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnStop = document.getElementById('btn-stop');

    if (btnStart) btnStart.addEventListener('click', () => this.startSession());
    if (btnPause) btnPause.addEventListener('click', () => this.pauseSession());
    if (btnResume) btnResume.addEventListener('click', () => this.resumeSession());
    if (btnStop) btnStop.addEventListener('click', () => this.endSession());

    // Curveball toggle switch
    const curveballToggle = document.getElementById('curveball-toggle');
    if (curveballToggle) {
      curveballToggle.addEventListener('click', () => {
        const isOn = curveballToggle.getAttribute('aria-checked') === 'true';
        curveballToggle.setAttribute('aria-checked', isOn ? 'false' : 'true');
        AppState.curveballsEnabled = !isOn;
      });
    }

    // Curveball dismiss button
    const btnDismissCurveball = document.getElementById('btn-dismiss-curveball');
    if (btnDismissCurveball) btnDismissCurveball.addEventListener('click', () => this.dismissCurveball());

    // Record button — start recording flow
    const btnRecord = document.getElementById('btn-record');
    if (btnRecord) {
      btnRecord.addEventListener('click', async () => {
        const granted = await AudioCaptureService.requestMicrophone();
        if (granted) {
          AudioCaptureService.start();
          if (typeof RecordingPanelController !== 'undefined' && RecordingPanelController.show) {
            RecordingPanelController.show();
          }
        }
      });
    }
  },

  selectMode(modeId) {
    const mode = SESSION_MODES.find(m => m.id === modeId);
    if (!mode) return;

    // Free Mode is locked during beta — guard against accidental selection
    if (mode.isFreeMode) return;

    // Update AppState
    AppState.session.mode = mode;

    // Update radio group visual state
    const modeCards = document.querySelectorAll('.stage__mode-card');
    modeCards.forEach(card => {
      card.setAttribute('aria-checked', card.dataset.modeId === modeId ? 'true' : 'false');
    });

    // Show/hide phase breakdown preview
    const phasePreview = document.getElementById('phase-preview');
    const phaseList = document.getElementById('phase-list');
    const phaseIndicator = document.getElementById('phase-indicator');

    if (mode.isFreeMode) {
      // Free Mode: hide phase indicator and phase preview
      if (phasePreview) phasePreview.setAttribute('hidden', '');
      if (phaseIndicator) phaseIndicator.setAttribute('hidden', '');
    } else {
      // Timed modes: show phase breakdown
      if (phasePreview) phasePreview.removeAttribute('hidden');
      if (phaseList) {
        phaseList.innerHTML = mode.phases.map(phase => {
          const pct = Math.round((phase.endPercent - phase.startPercent) * 100);
          return `<li>${phase.name} <span class="stage__phase-pct">(${pct}%)</span></li>`;
        }).join('');
      }
    }

    // Enable the Start button
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.disabled = false;
  },

  /* ─────────────────────────────────────────────────────────────
     getCurrentPhase(elapsed, mode) — pure function
     Requirements: 2.2, 2.3
     Returns the phase whose [startPercent, endPercent) contains
     elapsed / totalDuration. Returns null for Free Mode.
  ───────────────────────────────────────────────────────────── */
  getCurrentPhase(elapsed, mode) {
    if (!mode || mode.isFreeMode || !mode.phases.length) return null;
    const ratio = Math.min(elapsed / mode.durationSeconds, 1);
    for (let i = 0; i < mode.phases.length; i++) {
      const phase = mode.phases[i];
      // Last phase includes the endpoint (ratio === 1.0)
      if (i === mode.phases.length - 1) {
        if (ratio >= phase.startPercent && ratio <= phase.endPercent) return phase;
      } else {
        if (ratio >= phase.startPercent && ratio < phase.endPercent) return phase;
      }
    }
    // Fallback: return last phase
    return mode.phases[mode.phases.length - 1];
  },

  /* ─────────────────────────────────────────────────────────────
     startSession() — begin a timed or free-mode session
     Requirements: 1.4, 2.1, 3.1
  ───────────────────────────────────────────────────────────── */
  startSession() {
    const mode = AppState.session.mode;
    if (!mode) return;

    // Credit gate — require a signed-in user with remaining credits
    if (!AuthController.canStartSession()) {
      const outOfCredits = document.getElementById('stage-out-of-credits');
      if (AppState.user && AppState.credits !== null && AppState.credits <= 0) {
        if (outOfCredits) outOfCredits.hidden = false;
        AccessibilityService.announce('You are out of free sessions.', 'assertive');
      } else {
        AccessibilityService.announce('Please sign in to start a session.', 'assertive');
      }
      return;
    }

    // Reset session state
    AppState.session.status = 'running';
    AppState.session.elapsed = 0;
    AppState.session.phasesCompleted = [];
    AppState.session.curveballsShown = [];
    AppState.session.recording = false;
    AppState.session.transcript = null;
    // Reset the per-session credit-deduction guard
    RecordingPanelController._creditDeductedForSession = false;
    this._pausedElapsed = 0;
    this._lastPhaseIndex = -1;
    this._startTime = performance.now();

    // Schedule first curveball at 20–60% of duration (only if enabled)
    if (AppState.curveballsEnabled && !mode.isFreeMode && mode.durationSeconds > 0) {
      const pct = 0.2 + Math.random() * 0.4; // 20–60%
      this._curveballScheduledAt = Math.floor(mode.durationSeconds * pct);
    } else {
      this._curveballScheduledAt = null;
    }

    // Show/hide UI elements
    const modeSelection = document.getElementById('mode-selection');
    const phasePreview = document.getElementById('phase-preview');
    const activeDeck = document.getElementById('active-session-deck');
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const sessionSummary = document.getElementById('session-summary');
    const sessionControls = document.getElementById('session-controls');
    const curveballSection = document.getElementById('curveball-toggle-section');

    if (modeSelection) modeSelection.setAttribute('hidden', '');
    if (phasePreview) phasePreview.setAttribute('hidden', '');
    if (sessionSummary) sessionSummary.setAttribute('hidden', '');
    if (sessionControls) sessionControls.setAttribute('hidden', '');
    if (curveballSection) curveballSection.setAttribute('hidden', '');
    if (activeDeck) activeDeck.removeAttribute('hidden');
    if (btnPause) btnPause.removeAttribute('hidden');
    if (btnResume) btnResume.setAttribute('hidden', '');
    if (btnStart) btnStart.textContent = 'Restart Session';

    // Update header to show active session mode
    const goalLabel = document.getElementById('stage-goal-label');
    if (goalLabel) goalLabel.textContent = `Active Session: ${mode.label}`;

    // Show phase indicator for timed modes
    if (!mode.isFreeMode) {
      this.renderPhaseIndicator();
    }

    // Start the timer interval
    this._intervalId = setInterval(() => this.tick(), 1000);

    // Initial render
    this.renderTimer();

    // Auto-start recording — request mic and begin capture immediately
    this._autoStartRecording();
  },

  /**
   * Auto-start audio recording when a session begins.
   * Non-blocking: if mic permission is denied, session still runs without recording.
   */
  async _autoStartRecording() {
    const granted = await AudioCaptureService.requestMicrophone();
    if (granted) {
      AppState.session.recording = true;
      AudioCaptureService.start();
      RecordingPanelController.show();
    }
  },

  /* ─────────────────────────────────────────────────────────────
     tick() — called every 1000ms during a running session
     Requirements: 2.1, 2.2, 2.3, 2.4, 8.3
     Timer tick must NOT call AccessibilityService.announce()
  ───────────────────────────────────────────────────────────── */
  tick() {
    const mode = AppState.session.mode;
    if (!mode || AppState.session.status !== 'running') return;

    // Calculate elapsed using performance.now() delta for accuracy
    const now = performance.now();
    const deltaSeconds = (now - this._startTime) / 1000;
    AppState.session.elapsed = this._pausedElapsed + deltaSeconds;

    // Render timer display
    this.renderTimer();

    // Phase tracking for timed modes
    if (!mode.isFreeMode) {
      const currentPhase = this.getCurrentPhase(AppState.session.elapsed, mode);
      if (currentPhase) {
        const currentIndex = mode.phases.indexOf(currentPhase);
        // Phase transition detected
        if (currentIndex !== this._lastPhaseIndex && this._lastPhaseIndex >= 0) {
          // Record completed phase
          const completedPhase = mode.phases[this._lastPhaseIndex];
          if (!AppState.session.phasesCompleted.includes(completedPhase.name)) {
            AppState.session.phasesCompleted.push(completedPhase.name);
          }
          // Announce phase change (NOT during tick — use a one-time announcement)
          AccessibilityService.announce(`Phase: ${currentPhase.name}`, 'polite');
        }
        this._lastPhaseIndex = currentIndex;
      }

      // Render phase indicator bar
      this.renderPhaseIndicator();

      // Check curveball schedule
      if (this._curveballScheduledAt !== null && AppState.session.elapsed >= this._curveballScheduledAt) {
        this._curveballScheduledAt = null;
        this.triggerCurveball();
        return; // timer paused by curveball
      }

      // Check if session should end (countdown complete)
      if (AppState.session.elapsed >= mode.durationSeconds) {
        this.endSession();
        return;
      }
    }
  },

  /* ─────────────────────────────────────────────────────────────
     pauseSession() and resumeSession()
     Requirements: 2.5
  ───────────────────────────────────────────────────────────── */
  pauseSession() {
    if (AppState.session.status !== 'running') return;

    // Clear interval
    clearInterval(this._intervalId);
    this._intervalId = null;

    // Save elapsed so far
    const now = performance.now();
    this._pausedElapsed += (now - this._startTime) / 1000;

    AppState.session.status = 'paused';

    // Pause MediaRecorder if recording
    if (AudioCaptureService.isRecording() && AudioCaptureService._recorder && AudioCaptureService._recorder.state === 'recording') {
      AudioCaptureService._recorder.pause();
    }

    // Toggle button visibility
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    if (btnPause) btnPause.setAttribute('hidden', '');
    if (btnResume) btnResume.removeAttribute('hidden');

    // Update deck visual state — paused look
    const indicator = document.getElementById('deck-indicator');
    const waveform = document.querySelector('.active-deck__waveform');
    if (indicator) indicator.classList.add('active-deck__indicator--paused');
    if (waveform) waveform.classList.add('active-deck__waveform--paused');
  },

  resumeSession() {
    if (AppState.session.status !== 'paused') return;

    AppState.session.status = 'running';

    // Resume MediaRecorder if it was paused
    if (AudioCaptureService._recorder && AudioCaptureService._recorder.state === 'paused') {
      AudioCaptureService._recorder.resume();
    }

    // Toggle button visibility
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    if (btnPause) btnPause.removeAttribute('hidden');
    if (btnResume) btnResume.setAttribute('hidden', '');

    // Restore deck visual state — active look
    const indicator = document.getElementById('deck-indicator');
    const waveform = document.querySelector('.active-deck__waveform');
    if (indicator) indicator.classList.remove('active-deck__indicator--paused');
    if (waveform) waveform.classList.remove('active-deck__waveform--paused');

    // Restart timer from current elapsed
    this._startTime = performance.now();
    this._intervalId = setInterval(() => this.tick(), 1000);
  },

  /* ─────────────────────────────────────────────────────────────
     Helper: renderTimer() — updates the timer display
  ───────────────────────────────────────────────────────────── */
  renderTimer() {
    const mode = AppState.session.mode;
    const timerValue = document.getElementById('timer-value');
    const timerLabel = document.getElementById('timer-label');
    if (!timerValue) return;

    if (mode && !mode.isFreeMode) {
      // Countdown
      const remaining = Math.max(0, Math.ceil(mode.durationSeconds - AppState.session.elapsed));
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      timerValue.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      if (timerLabel) timerLabel.textContent = 'remaining';
    } else {
      // Count-up (Free Mode)
      const elapsed = Math.floor(AppState.session.elapsed);
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      timerValue.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      if (timerLabel) timerLabel.textContent = 'elapsed';
    }
  },

  /* ─────────────────────────────────────────────────────────────
     Helper: renderPhaseIndicator() — updates the phase bar
  ───────────────────────────────────────────────────────────── */
  renderPhaseIndicator() {
    const mode = AppState.session.mode;
    const indicator = document.getElementById('phase-indicator');
    if (!indicator || !mode || mode.isFreeMode) return;

    const ratio = Math.min(AppState.session.elapsed / mode.durationSeconds, 1);

    indicator.innerHTML = mode.phases.map(phase => {
      const width = (phase.endPercent - phase.startPercent) * 100;
      let cls = 'stage__phase-segment';
      if (ratio >= phase.endPercent) {
        cls += ' stage__phase-segment--completed';
      } else if (ratio >= phase.startPercent) {
        cls += ' stage__phase-segment--active';
      }
      return `<div class="${cls}" style="width:${width}%" title="${phase.name}"></div>`;
    }).join('');
  },

  /* ─────────────────────────────────────────────────────────────
     triggerCurveball() — select and display a curveball
     Requirements: 3.1, 3.2, 3.3, 3.6, 8.2
  ───────────────────────────────────────────────────────────── */
  triggerCurveball() {
    // Pause the timer
    clearInterval(this._intervalId);
    this._intervalId = null;

    // Save elapsed
    const now = performance.now();
    this._pausedElapsed += (now - this._startTime) / 1000;
    AppState.session.status = 'paused';

    // Pause MediaRecorder during curveball
    if (AudioCaptureService.isRecording() && AudioCaptureService._recorder && AudioCaptureService._recorder.state === 'recording') {
      AudioCaptureService._recorder.pause();
    }

    // Update deck visual state
    const indicator = document.getElementById('deck-indicator');
    const waveform = document.querySelector('.active-deck__waveform');
    if (indicator) indicator.classList.add('active-deck__indicator--paused');
    if (waveform) waveform.classList.add('active-deck__waveform--paused');

    // Select a curveball not yet shown (reset pool if exhausted)
    let available = CURVEBALL_POOL.filter(cb => !AppState.session.curveballsShown.includes(cb.id));
    if (available.length === 0) {
      AppState.session.curveballsShown = [];
      available = CURVEBALL_POOL.slice();
    }
    const curveball = available[Math.floor(Math.random() * available.length)];
    AppState.session.curveballsShown.push(curveball.id);

    // Show curveball overlay
    const overlay = document.getElementById('curveball-overlay');
    const promptEl = document.getElementById('curveball-prompt');
    const adviceEl = document.getElementById('curveball-advice');

    if (promptEl) promptEl.textContent = curveball.prompt;
    if (adviceEl) adviceEl.textContent = curveball.advice;
    if (overlay) overlay.removeAttribute('hidden');

    // Announce on assertive live region
    AccessibilityService.announce(`Curveball: ${curveball.prompt}`, 'assertive');

    // Trap focus in the overlay
    if (overlay) AccessibilityService.trapFocus(overlay);
  },

  /* ─────────────────────────────────────────────────────────────
     dismissCurveball() — hide overlay and resume session
     Requirements: 3.4
  ───────────────────────────────────────────────────────────── */
  dismissCurveball() {
    // Hide overlay
    const overlay = document.getElementById('curveball-overlay');
    if (overlay) overlay.setAttribute('hidden', '');

    // Release focus trap
    AccessibilityService.releaseFocus();

    // Resume timer and recording
    AppState.session.status = 'running';
    this._startTime = performance.now();
    this._intervalId = setInterval(() => this.tick(), 1000);

    // Resume MediaRecorder if it was paused
    if (AudioCaptureService._recorder && AudioCaptureService._recorder.state === 'paused') {
      AudioCaptureService._recorder.resume();
    }

    // Restore deck visual state
    const indicator = document.getElementById('deck-indicator');
    const waveform = document.querySelector('.active-deck__waveform');
    if (indicator) indicator.classList.remove('active-deck__indicator--paused');
    if (waveform) waveform.classList.remove('active-deck__waveform--paused');

    // Schedule next curveball at 15–40% of remaining time (only if enabled)
    const mode = AppState.session.mode;
    if (AppState.curveballsEnabled && mode && !mode.isFreeMode) {
      const remaining = mode.durationSeconds - this._pausedElapsed;
      if (remaining > 5) {
        const pct = 0.15 + Math.random() * 0.25; // 15–40%
        this._curveballScheduledAt = this._pausedElapsed + Math.floor(remaining * pct);
      }
    }
  },

  /* ─────────────────────────────────────────────────────────────
     endSession() — finalize the session and show summary
     Requirements: 2.4, 2.6
  ───────────────────────────────────────────────────────────── */
  endSession() {
    // Delegate to RecordingPanelController.handleStop() for full transcription flow
    if (AudioCaptureService.isRecording() || (AudioCaptureService._recorder && AudioCaptureService._recorder.state === 'paused')) {
      RecordingPanelController.handleStop();
    }

    // Clear interval
    clearInterval(this._intervalId);
    this._intervalId = null;
    AppState.session.status = 'completed';

    // Compute completed phases (those whose endPercent <= elapsed ratio)
    const mode = AppState.session.mode;
    if (mode && !mode.isFreeMode) {
      const ratio = Math.min(AppState.session.elapsed / mode.durationSeconds, 1);
      mode.phases.forEach(phase => {
        if (phase.endPercent <= ratio && !AppState.session.phasesCompleted.includes(phase.name)) {
          AppState.session.phasesCompleted.push(phase.name);
        }
      });
    }

    // Hide active deck, show pre-session UI
    const activeDeck = document.getElementById('active-session-deck');
    const sessionSummary = document.getElementById('session-summary');
    const modeSelection = document.getElementById('mode-selection');
    const sessionControls = document.getElementById('session-controls');
    const curveballSection = document.getElementById('curveball-toggle-section');
    const btnStart = document.getElementById('btn-start');

    if (activeDeck) activeDeck.setAttribute('hidden', '');
    if (sessionSummary) sessionSummary.removeAttribute('hidden');
    if (modeSelection) modeSelection.removeAttribute('hidden');
    if (sessionControls) sessionControls.removeAttribute('hidden');
    if (curveballSection) curveballSection.removeAttribute('hidden');
    if (btnStart) { btnStart.disabled = false; btnStart.textContent = 'Restart Session'; }

    // Restore header text
    const goalLabel = document.getElementById('stage-goal-label');
    if (goalLabel) {
      const activeGoal = AppState.activeGoal ? GOALS.find(g => g.id === AppState.activeGoal) : null;
      goalLabel.textContent = activeGoal ? `Your focus: ${activeGoal.label}` : 'Session complete — select a mode to practice again';
    }

    this.renderSummary();

    // Save session to history
    try {
      const mode = AppState.session.mode;
      SessionHistoryService.saveSession({
        mode: mode ? mode.id : 'unknown',
        elapsed: AppState.session.elapsed,
        phasesCompleted: AppState.session.phasesCompleted,
        curveballsShown: AppState.session.curveballsShown,
        transcript: AppState.session.transcript || null
      });
      // Refresh history panel if open
      if (AppState.historyPanelOpen) {
        HistoryPanelController.renderList();
      }
    } catch (_) {
      // Non-breaking — history save failure must not interrupt session flow
    }
  },

  /* ─────────────────────────────────────────────────────────────
     renderSummary() — display session results
     Requirements: 2.4, 2.6
  ───────────────────────────────────────────────────────────── */
  renderSummary() {
    const content = document.getElementById('summary-content');
    const mode = AppState.session.mode;
    if (!content || !mode) return;

    const elapsed = Math.floor(AppState.session.elapsed);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const timeStr = `${min}m ${sec}s`;

    let html = `<p><strong>Elapsed time:</strong> ${timeStr}</p>`;
    html += `<p><strong>Mode:</strong> ${mode.label}</p>`;
    html += `<p><strong>Status:</strong> ${AppState.session.status}</p>`;

    if (!mode.isFreeMode) {
      html += `<p><strong>Phases completed:</strong> ${AppState.session.phasesCompleted.length > 0 ? AppState.session.phasesCompleted.join(', ') : 'None'}</p>`;

      const ratio = Math.min(AppState.session.elapsed / mode.durationSeconds, 1);
      const uncompleted = mode.phases.filter(p => p.startPercent > ratio).map(p => p.name);
      if (uncompleted.length > 0) {
        html += `<p><strong>Uncompleted phases:</strong> ${uncompleted.join(', ')}</p>`;
      }
    }

    if (AppState.session.curveballsShown.length > 0) {
      html += `<p><strong>Curveballs faced:</strong> ${AppState.session.curveballsShown.length}</p>`;
    }

    // Include transcript if already available
    if (AppState.session.transcript) {
      html += `<div style="margin-top: var(--space-3, 1.5rem); padding-top: var(--space-2, 1rem); border-top: 1px solid rgba(200, 146, 42, 0.1);">`;
      html += `<h4 style="font-family: var(--font-serif); font-size: var(--text-sm); font-weight: 700; color: var(--color-studio-primary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-1, 0.5rem);">Transcript</h4>`;
      html += `<p style="font-family: var(--font-sans); font-size: var(--text-sm); line-height: 1.7; color: var(--color-studio-text); opacity: 0.9; white-space: pre-wrap;">${AppState.session.transcript}</p>`;
      html += `</div>`;
    }

    content.innerHTML = html;
  },

  /* ─────────────────────────────────────────────────────────────
     updateRecordButton() — Record button is now hidden;
     recording auto-starts with session.
  ───────────────────────────────────────────────────────────── */
  updateRecordButton() {
    const btn = document.getElementById('btn-record');
    if (btn) btn.hidden = true;
  }
};

export { StageController };
