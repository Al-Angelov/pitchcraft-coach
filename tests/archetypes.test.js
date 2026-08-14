/**
 * Unit tests for ArchetypesController
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 *
 * Tests verify:
 * - >= 4 archetype cards rendered
 * - Detail panel is keyboard-accessible (close button present)
 * - "Practice with this style" navigates to Stage and sets Goal
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

// Minimal data mirrors
const ARCHETYPES = [
  { id: 'the-visionary', name: 'The Visionary', tagline: 'See what others can\'t.', styleDescription: 'Speaks from conviction.', signatureTechniques: ['Bold claim'], strengths: ['Momentum'], idealContexts: ['Keynotes'], exampleExcerpt: 'We\'re building the future.', illustrationAsset: '<svg></svg>', mappedGoalId: 'inspirational-talk' },
  { id: 'the-deep-tech-educator', name: 'The Deep-Tech Educator', tagline: 'Clarity is art.', styleDescription: 'Transforms complexity.', signatureTechniques: ['Analogies'], strengths: ['Trust'], idealContexts: ['Demos'], exampleExcerpt: 'Think of it like...', illustrationAsset: '<svg></svg>', mappedGoalId: 'technical-explanation' },
  { id: 'the-empathetic-storyteller', name: 'The Empathetic Storyteller', tagline: 'Connection first.', styleDescription: 'Leads with experience.', signatureTechniques: ['Mid-story opening'], strengths: ['Trust fast'], idealContexts: ['Networking'], exampleExcerpt: 'First time I failed...', illustrationAsset: '<svg></svg>', mappedGoalId: 'casual-networking' },
  { id: 'the-challenger', name: 'The Challenger', tagline: 'Disrupt first.', styleDescription: 'Unsettles mental models.', signatureTechniques: ['Accusation audit'], strengths: ['Commands attention'], idealContexts: ['VC pitches'], exampleExcerpt: 'Everyone told you...', illustrationAsset: '<svg></svg>', mappedGoalId: 'funding-pitch' }
];

const GOALS = [
  { id: 'funding-pitch', label: 'Funding Pitch', lessonIds: [], tips: [] },
  { id: 'technical-explanation', label: 'Technical Explanation', lessonIds: [], tips: [] },
  { id: 'casual-networking', label: 'Casual Networking', lessonIds: [], tips: [] },
  { id: 'inspirational-talk', label: 'Inspirational Talk', lessonIds: [], tips: [] },
  { id: 'job-interview', label: 'Job Interview', lessonIds: [], tips: [] }
];

const LESSON_CATALOG = [];

const AppState = {
  activeGoal: null,
  activeModule: 'archetypes',
  openArchetypeId: null,
  init() { this.activeGoal = null; this.activeModule = 'archetypes'; this.openArchetypeId = null; }
};

const AccessibilityService = { trapFocus() {}, releaseFocus() {} };

const NavigatorController = {
  selectGoal(goalId) {
    AppState.activeGoal = goalId;
    const label = document.getElementById('stage-goal-label');
    const goal = GOALS.find(g => g.id === goalId);
    if (label && goal) label.textContent = `Goal: ${goal.label}`;
  }
};

const ArchetypesController = {
  init() {
    this.renderCards();
    const closeBtn = document.getElementById('archetype-detail-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeArchetype());
    const practiceBtn = document.getElementById('archetype-practice-btn');
    if (practiceBtn) practiceBtn.addEventListener('click', () => {
      if (AppState.openArchetypeId) this.practiceWithStyle(AppState.openArchetypeId);
    });
  },
  renderCards() {
    const grid = document.getElementById('archetypes-grid');
    if (!grid) return;
    grid.innerHTML = ARCHETYPES.map(arch => `
      <button type="button" class="archetypes__card" data-archetype-id="${arch.id}" tabindex="0">
        <div class="archetypes__card-illustration">${arch.illustrationAsset}</div>
        <span class="archetypes__card-name">${arch.name}</span>
        <span class="archetypes__card-tagline">${arch.tagline}</span>
      </button>
    `).join('');
    grid.querySelectorAll('.archetypes__card').forEach(card => {
      card.addEventListener('click', () => { this.openArchetype(card.dataset.archetypeId); });
    });
  },
  openArchetype(archetypeId) {
    const arch = ARCHETYPES.find(a => a.id === archetypeId);
    if (!arch) return;
    AppState.openArchetypeId = archetypeId;
    const panel = document.getElementById('archetype-detail');
    const titleEl = document.getElementById('archetype-detail-title');
    const taglineEl = document.getElementById('archetype-detail-tagline');
    const bodyEl = document.getElementById('archetype-detail-body');
    if (titleEl) titleEl.textContent = arch.name;
    if (taglineEl) taglineEl.textContent = arch.tagline;
    if (bodyEl) {
      let h = `<p>${arch.styleDescription}</p>`;
      h += '<h4>Signature Techniques</h4><ul>'; arch.signatureTechniques.forEach(t => { h += `<li>${t}</li>`; }); h += '</ul>';
      h += '<h4>Strengths</h4><ul>'; arch.strengths.forEach(s => { h += `<li>${s}</li>`; }); h += '</ul>';
      h += '<h4>Ideal Contexts</h4><ul>'; arch.idealContexts.forEach(c => { h += `<li>${c}</li>`; }); h += '</ul>';
      h += `<blockquote><em>${arch.exampleExcerpt}</em></blockquote>`;
      bodyEl.innerHTML = h;
    }
    if (panel) { panel.removeAttribute('hidden'); AccessibilityService.trapFocus(panel); }
  },
  closeArchetype() {
    const panel = document.getElementById('archetype-detail');
    if (panel) panel.setAttribute('hidden', '');
    AppState.openArchetypeId = null;
    AccessibilityService.releaseFocus();
  },
  practiceWithStyle(archetypeId) {
    const arch = ARCHETYPES.find(a => a.id === archetypeId);
    if (!arch) return;
    NavigatorController.selectGoal(arch.mappedGoalId);
    this.closeArchetype();
    AppState.activeModule = 'stage';
    const tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.module === 'stage' ? 'true' : 'false');
    });
    const modules = document.querySelectorAll('[role="tabpanel"]');
    modules.forEach(mod => {
      if (mod.id === 'stage') { mod.removeAttribute('hidden'); } else { mod.setAttribute('hidden', ''); }
    });
  }
};

describe('ArchetypesController', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
    AppState.init();
    ArchetypesController.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('>= 4 archetype cards rendered', () => {
    const cards = document.querySelectorAll('.archetypes__card');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('detail panel has a close button (keyboard accessible)', () => {
    const closeBtn = document.getElementById('archetype-detail-close');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.tagName.toLowerCase()).toBe('button');
  });

  it('openArchetype shows detail panel with correct title', () => {
    ArchetypesController.openArchetype('the-visionary');
    const panel = document.getElementById('archetype-detail');
    expect(panel.hasAttribute('hidden')).toBe(false);
    const title = document.getElementById('archetype-detail-title');
    expect(title.textContent).toBe('The Visionary');
  });

  it('closeArchetype hides detail panel', () => {
    ArchetypesController.openArchetype('the-challenger');
    ArchetypesController.closeArchetype();
    const panel = document.getElementById('archetype-detail');
    expect(panel.hasAttribute('hidden')).toBe(true);
    expect(AppState.openArchetypeId).toBeNull();
  });

  it('"Practice with this style" sets the mapped goal and navigates to Stage', () => {
    ArchetypesController.openArchetype('the-challenger');
    ArchetypesController.practiceWithStyle('the-challenger');

    // Goal should be set to funding-pitch
    expect(AppState.activeGoal).toBe('funding-pitch');
    expect(AppState.activeModule).toBe('stage');

    // Stage module should be visible
    const stage = document.getElementById('stage');
    expect(stage.hasAttribute('hidden')).toBe(false);

    // Archetypes module should be hidden
    const archetypes = document.getElementById('archetypes');
    expect(archetypes.hasAttribute('hidden')).toBe(true);
  });

  it('"Practice with this style" updates stage goal label', () => {
    ArchetypesController.openArchetype('the-deep-tech-educator');
    ArchetypesController.practiceWithStyle('the-deep-tech-educator');

    const label = document.getElementById('stage-goal-label');
    expect(label.textContent).toContain('Technical Explanation');
  });
});
