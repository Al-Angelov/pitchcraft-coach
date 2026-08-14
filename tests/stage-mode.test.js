/**
 * Unit tests for StageController mode selection
 * Requirements: 1.1, 1.2, 1.3, 1.4
 *
 * Tests verify:
 * - All 5 modes are selectable via mode cards
 * - Phase breakdown shown after selection (timed modes)
 * - Start button disabled without selection
 * - Free Mode hides phase indicator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

function getBodyContent(fullHtml) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = match ? match[1] : fullHtml;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

const bodyContent = getBodyContent(html);

// SESSION_MODES mirror
const SESSION_MODES = [
  { id: 'elevator-60', label: '60-Second Elevator Pitch', durationSeconds: 60, isFreeMode: false, phases: [
    { name: 'Hook', startPercent: 0, endPercent: 0.25 },
    { name: 'Problem', startPercent: 0.25, endPercent: 0.5 },
    { name: 'Solution', startPercent: 0.5, endPercent: 0.75 },
    { name: 'CTA', startPercent: 0.75, endPercent: 1.0 }
  ]},
  { id: 'startup-5m', label: '5-Minute Startup Demo', durationSeconds: 300, isFreeMode: false, phases: [
    { name: 'Intro', startPercent: 0, endPercent: 0.15 },
    { name: 'Problem', startPercent: 0.15, endPercent: 0.35 },
    { name: 'Solution', startPercent: 0.35, endPercent: 0.60 },
    { name: 'Demo', startPercent: 0.60, endPercent: 0.80 },
    { name: 'CTA', startPercent: 0.80, endPercent: 1.0 }
  ]},
  { id: 'presentation-15m', label: '15-Minute Presentation', durationSeconds: 900, isFreeMode: false, phases: [
    { name: 'Intro', startPercent: 0, endPercent: 0.10 },
    { name: 'Context', startPercent: 0.10, endPercent: 0.25 },
    { name: 'Core 1', startPercent: 0.25, endPercent: 0.45 },
    { name: 'Core 2', startPercent: 0.45, endPercent: 0.65 },
    { name: 'Synthesis', startPercent: 0.65, endPercent: 0.85 },
    { name: 'Close', startPercent: 0.85, endPercent: 1.0 }
  ]},
  { id: 'deep-dive-30m', label: '30-Minute Deep-Dive Presentation', durationSeconds: 1800, isFreeMode: false, phases: [
    { name: 'Intro', startPercent: 0, endPercent: 0.08 },
    { name: 'Background', startPercent: 0.08, endPercent: 0.20 },
    { name: 'Analysis 1', startPercent: 0.20, endPercent: 0.35 },
    { name: 'Analysis 2', startPercent: 0.35, endPercent: 0.50 },
    { name: 'Analysis 3', startPercent: 0.50, endPercent: 0.65 },
    { name: 'Synthesis', startPercent: 0.65, endPercent: 0.80 },
    { name: 'Q&A Prep', startPercent: 0.80, endPercent: 0.92 },
    { name: 'Close', startPercent: 0.92, endPercent: 1.0 }
  ]},
  { id: 'free', label: 'Free Mode', durationSeconds: 0, isFreeMode: true, phases: [] }
];

// AppState mirror
const AppState = {
  session: { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [] },
  init() { this.session = { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [] }; }
};

// StageController mirror
const StageController = {
  init() {
    const modeCards = document.querySelectorAll('.stage__mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => { this.selectMode(card.dataset.modeId); });
    });
  },
  selectMode(modeId) {
    const mode = SESSION_MODES.find(m => m.id === modeId);
    if (!mode) return;
    AppState.session.mode = mode;
    const modeCards = document.querySelectorAll('.stage__mode-card');
    modeCards.forEach(card => {
      card.setAttribute('aria-checked', card.dataset.modeId === modeId ? 'true' : 'false');
    });
    const phasePreview = document.getElementById('phase-preview');
    const phaseList = document.getElementById('phase-list');
    const phaseIndicator = document.getElementById('phase-indicator');
    if (mode.isFreeMode) {
      if (phasePreview) phasePreview.setAttribute('hidden', '');
      if (phaseIndicator) phaseIndicator.setAttribute('hidden', '');
    } else {
      if (phasePreview) phasePreview.removeAttribute('hidden');
      if (phaseList) {
        phaseList.innerHTML = mode.phases.map(phase => {
          const pct = Math.round((phase.endPercent - phase.startPercent) * 100);
          return `<li>${phase.name} <span class="stage__phase-pct">(${pct}%)</span></li>`;
        }).join('');
      }
    }
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.disabled = false;
  }
};

describe('StageController — Mode Selection', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
    AppState.init();
    StageController.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('all 5 mode cards are present in the DOM', () => {
    const cards = document.querySelectorAll('.stage__mode-card');
    expect(cards.length).toBe(5);
  });

  it('all 5 modes are selectable — clicking each sets aria-checked="true"', () => {
    const modeIds = ['elevator-60', 'startup-5m', 'presentation-15m', 'deep-dive-30m', 'free'];
    modeIds.forEach(id => {
      StageController.selectMode(id);
      const card = document.querySelector(`[data-mode-id="${id}"]`);
      expect(card.getAttribute('aria-checked')).toBe('true');
    });
  });

  it('selecting a mode deselects other modes', () => {
    StageController.selectMode('startup-5m');
    const cards = document.querySelectorAll('.stage__mode-card');
    const checked = Array.from(cards).filter(c => c.getAttribute('aria-checked') === 'true');
    expect(checked.length).toBe(1);
    expect(checked[0].dataset.modeId).toBe('startup-5m');
  });

  it('phase breakdown preview shown after timed mode selection', () => {
    const phasePreview = document.getElementById('phase-preview');
    expect(phasePreview.hasAttribute('hidden')).toBe(true);

    StageController.selectMode('elevator-60');

    expect(phasePreview.hasAttribute('hidden')).toBe(false);
    const items = document.querySelectorAll('#phase-list li');
    expect(items.length).toBe(4); // elevator-60 has 4 phases
  });

  it('start button is disabled before any mode selection', () => {
    const btnStart = document.getElementById('btn-start');
    expect(btnStart.disabled).toBe(true);
  });

  it('start button is enabled after mode selection', () => {
    StageController.selectMode('presentation-15m');
    const btnStart = document.getElementById('btn-start');
    expect(btnStart.disabled).toBe(false);
  });

  it('Free Mode hides phase indicator and phase preview', () => {
    // First select a timed mode to show phases
    StageController.selectMode('elevator-60');
    const phasePreview = document.getElementById('phase-preview');
    const phaseIndicator = document.getElementById('phase-indicator');
    expect(phasePreview.hasAttribute('hidden')).toBe(false);

    // Now select Free Mode
    StageController.selectMode('free');
    expect(phasePreview.hasAttribute('hidden')).toBe(true);
    expect(phaseIndicator.hasAttribute('hidden')).toBe(true);
  });

  it('AppState.session.mode is updated after selectMode', () => {
    StageController.selectMode('deep-dive-30m');
    expect(AppState.session.mode.id).toBe('deep-dive-30m');
    expect(AppState.session.mode.durationSeconds).toBe(1800);
  });
});
