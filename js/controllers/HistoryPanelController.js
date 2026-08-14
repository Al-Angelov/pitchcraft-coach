// js/controllers/HistoryPanelController.js
import { SESSION_MODES, AppState } from '../data/constants.js';
import { SessionHistoryService } from '../services/SessionHistoryService.js';
import { AccessibilityService } from '../services/AccessibilityService.js';
import { AnimationService } from '../services/AnimationService.js';
import { AiFeedbackService } from '../services/AiFeedbackService.js';

/* ============================================================
   HistoryPanelController — session history panel and detail view
   Requirements: 3.1–3.7, 4.1–4.7, 7.1–7.6
============================================================ */
const HistoryPanelController = {
  _panelOpen: false,
  _activeItemEl: null,

  init() {
    // Toggle button
    const toggleBtn = document.getElementById('history-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }

    // Session detail close button
    const closeBtn = document.getElementById('session-detail-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDetail());
    }

    // Close detail on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = document.getElementById('session-detail-overlay');
        if (overlay && !overlay.hasAttribute('hidden')) {
          this.closeDetail();
        }
      }
    });

    // Close detail on backdrop click
    const overlay = document.getElementById('session-detail-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeDetail();
        }
      });
    }

    // Render initial state
    this.renderList();
  },

  toggle() {
    if (this._panelOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  },

  openPanel() {
    const panel = document.getElementById('history-panel');
    const toggleBtn = document.getElementById('history-toggle');
    if (!panel || !toggleBtn) return;

    this._panelOpen = true;
    AppState.historyPanelOpen = true;

    panel.removeAttribute('hidden');
    // Force reflow before adding open class for animation
    void panel.offsetWidth;
    panel.classList.add('history-panel--open');

    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Close session history');

    // Refresh list content
    this.renderList();

    // Announce state change
    AccessibilityService.announce('Session history opened', 'polite');

    // Move focus to first focusable element in panel
    const firstFocusable = panel.querySelector('button, [tabindex]');
    if (firstFocusable) {
      AccessibilityService.moveFocusTo(firstFocusable);
    }
  },

  closePanel() {
    const panel = document.getElementById('history-panel');
    const toggleBtn = document.getElementById('history-toggle');
    if (!panel || !toggleBtn) return;

    this._panelOpen = false;
    AppState.historyPanelOpen = false;

    panel.classList.remove('history-panel--open');

    // After transition, hide the panel
    const afterTransition = () => {
      panel.setAttribute('hidden', '');
    };

    if (AnimationService.respectsReducedMotion()) {
      afterTransition();
    } else {
      setTimeout(afterTransition, 250); // matches --transition-base
    }

    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Open session history');

    // Announce state change
    AccessibilityService.announce('Session history closed', 'polite');

    // Return focus to toggle button
    AccessibilityService.moveFocusTo(toggleBtn);
  },

  renderList() {
    const listEl = document.getElementById('history-list');
    const emptyEl = document.getElementById('history-empty');
    if (!listEl) return;

    const history = SessionHistoryService.getAll();

    if (history.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.removeAttribute('hidden');
      return;
    }

    if (emptyEl) emptyEl.setAttribute('hidden', '');

    listEl.innerHTML = history.map(record => {
      const mode = SESSION_MODES.find(m => m.id === record.sessionMode);
      const modeLabel = mode ? mode.label : record.sessionMode;
      const displayTitle = record.sessionTitle || modeLabel;
      const date = this._formatDate(record.timestamp);
      const duration = this._formatDuration(record.duration);

      return `<button type="button" class="history-panel__item" role="listitem" data-session-id="${record.id}" tabindex="0">
        <span class="history-panel__item-mode">${displayTitle}</span>
        <span class="history-panel__item-meta">${date} &middot; ${duration}</span>
      </button>`;
    }).join('');

    // Attach click handlers
    listEl.querySelectorAll('.history-panel__item').forEach(item => {
      item.addEventListener('click', () => {
        this._activeItemEl = item;
        this.openDetail(item.dataset.sessionId);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this._activeItemEl = item;
          this.openDetail(item.dataset.sessionId);
        }
      });
    });
  },

  openDetail(sessionId) {
    const record = SessionHistoryService.getById(sessionId);
    if (!record) return;

    const overlay = document.getElementById('session-detail-overlay');
    const titleEl = document.getElementById('session-detail-title');
    const metaEl = document.getElementById('session-detail-meta');
    const durationEl = document.getElementById('session-detail-duration');
    const curveballsEl = document.getElementById('session-detail-curveballs');
    const phasesEl = document.getElementById('session-detail-phases');
    const transcriptEl = document.getElementById('session-detail-transcript');
    const feedbackEl = document.getElementById('session-detail-feedback');

    // Populate data
    const mode = SESSION_MODES.find(m => m.id === record.sessionMode);
    const modeLabel = mode ? mode.label : record.sessionMode;
    const displayTitle = record.sessionTitle || modeLabel;

    if (titleEl) {
      titleEl.innerHTML = `<span class="session-detail__title-text" id="session-detail-title-text">${displayTitle}</span><button type="button" class="session-detail__rename-btn" id="session-detail-rename-btn" aria-label="Rename session" title="Rename session"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M11.5 1.5 L14.5 4.5 L5 14 L1 15 L2 11 Z"/><path d="M10 3 L13 6"/></svg></button>`;
      titleEl.dataset.sessionId = record.id;

      // Wire rename button
      const renameBtn = document.getElementById('session-detail-rename-btn');
      if (renameBtn) {
        renameBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._startRename(record.id, displayTitle);
        });
      }
    }
    if (metaEl) metaEl.textContent = this._formatDate(record.timestamp);
    if (durationEl) durationEl.textContent = this._formatDuration(record.duration);
    if (curveballsEl) curveballsEl.textContent = String(record.curveballsFaced);

    // Phases
    if (phasesEl) {
      if (record.phasesCompleted && record.phasesCompleted.length > 0) {
        phasesEl.innerHTML = record.phasesCompleted.map(p =>
          `<li class="session-detail__phase-tag">${p}</li>`
        ).join('');
      } else {
        phasesEl.innerHTML = '<li class="session-detail__placeholder">No phases completed</li>';
      }
    }

    // Transcript
    if (transcriptEl) {
      if (record.transcript) {
        transcriptEl.innerHTML = `<p class="session-detail__section-content" style="white-space: pre-wrap;">${record.transcript}</p>`;
      } else {
        transcriptEl.innerHTML = '<p class="session-detail__placeholder">No transcript recorded for this session</p>';
      }
    }

    // AI Feedback — render with markdown formatting
    if (feedbackEl) {
      if (record.aiFeedback) {
        const renderedFeedback = AiFeedbackService.renderMarkdown(record.aiFeedback);
        feedbackEl.innerHTML = `<div class="session-detail__section-content">${renderedFeedback}</div>`;
      } else {
        feedbackEl.innerHTML = '<p class="session-detail__placeholder">No AI feedback for this session</p>';
      }
    }


    // Show overlay
    if (overlay) {
      overlay.removeAttribute('hidden');
      AccessibilityService.trapFocus(overlay);
    }
  },

  closeDetail() {
    const overlay = document.getElementById('session-detail-overlay');
    if (overlay) {
      overlay.setAttribute('hidden', '');
    }
    AccessibilityService.releaseFocus();

    // Return focus to the item that opened the detail
    if (this._activeItemEl) {
      AccessibilityService.moveFocusTo(this._activeItemEl);
      this._activeItemEl = null;
    }
  },

  // ── Rename helpers ─────────────────────────────────────────────

  _startRename(sessionId, currentTitle) {
    const titleEl = document.getElementById('session-detail-title');
    if (!titleEl) return;

    titleEl.innerHTML = `<input type="text" class="session-detail__rename-input" id="session-detail-rename-input" value="${currentTitle.replace(/"/g, '&quot;')}" aria-label="Session name" />`;
    const input = document.getElementById('session-detail-rename-input');
    if (!input) return;

    input.focus();
    input.select();

    const commit = () => {
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== currentTitle) {
        SessionHistoryService.updateById(sessionId, { sessionTitle: newTitle });
        this.renderList();
      }
      // Restore display
      const record = SessionHistoryService.getById(sessionId);
      const mode = SESSION_MODES.find(m => m.id === (record ? record.sessionMode : ''));
      const displayTitle = (record && record.sessionTitle) || (mode ? mode.label : currentTitle);
      titleEl.innerHTML = `<span class="session-detail__title-text" id="session-detail-title-text">${displayTitle}</span><button type="button" class="session-detail__rename-btn" id="session-detail-rename-btn" aria-label="Rename session" title="Rename session"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M11.5 1.5 L14.5 4.5 L5 14 L1 15 L2 11 Z"/><path d="M10 3 L13 6"/></svg></button>`;
      titleEl.dataset.sessionId = sessionId;
      const renameBtn = document.getElementById('session-detail-rename-btn');
      if (renameBtn) {
        renameBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._startRename(sessionId, displayTitle);
        });
      }
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = currentTitle; input.blur(); }
    });
  },

  // ── Formatting helpers ────────────────────────────────────────

  _formatDate(isoStr) {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (_) {
      return isoStr;
    }
  },

  _formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  }
};

export { HistoryPanelController };
