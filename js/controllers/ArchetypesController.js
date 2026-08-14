// js/controllers/ArchetypesController.js
import { ARCHETYPES, AppState } from '../data/constants.js';
import { AccessibilityService } from '../services/AccessibilityService.js';
import { NavigatorController } from './NavigatorController.js';

/* ============================================================
   ArchetypesController — archetype cards and detail
   Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
============================================================ */
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
      card.addEventListener('click', () => {
        this.openArchetype(card.dataset.archetypeId);
      });
    });
  },

  openArchetype(archetypeId) {
    const arch = ARCHETYPES.find(a => a.id === archetypeId);
    if (!arch) return;

    AppState.openArchetypeId = archetypeId;

    const panel = document.getElementById('archetype-detail');
    const titleEl = document.getElementById('archetype-detail-title');
    const taglineEl = document.getElementById('archetype-detail-tagline');
    const illustrationEl = document.getElementById('archetype-detail-illustration');
    const bodyEl = document.getElementById('archetype-detail-body');

    if (titleEl) titleEl.textContent = arch.name;
    if (taglineEl) taglineEl.textContent = arch.tagline;
    if (illustrationEl) illustrationEl.innerHTML = arch.illustrationAsset;

    if (bodyEl) {
      let html = '';

      // Style description
      html += `<div class="archetype-drawer__section">
        <p class="archetype-drawer__desc">${arch.styleDescription}</p>
      </div>`;

      // Signature Techniques
      html += `<div class="archetype-drawer__section">
        <h4 class="archetype-drawer__section-title">Signature Techniques</h4>
        <ul class="archetype-drawer__traits">`;
      arch.signatureTechniques.forEach(t => { html += `<li class="archetype-drawer__trait">${t}</li>`; });
      html += `</ul></div>`;

      // Strengths
      html += `<div class="archetype-drawer__section">
        <h4 class="archetype-drawer__section-title">Core Strengths</h4>
        <ul class="archetype-drawer__traits">`;
      arch.strengths.forEach(s => { html += `<li class="archetype-drawer__trait">${s}</li>`; });
      html += `</ul></div>`;

      // Ideal Contexts
      html += `<div class="archetype-drawer__section">
        <h4 class="archetype-drawer__section-title">Ideal Contexts</h4>
        <ul class="archetype-drawer__contexts">`;
      arch.idealContexts.forEach(c => { html += `<li class="archetype-drawer__context-tag">${c}</li>`; });
      html += `</ul></div>`;

      // Signature Quote
      html += `<div class="archetype-drawer__section">
        <h4 class="archetype-drawer__section-title">Signature Quote</h4>
        <blockquote class="archetype-drawer__quote">${arch.exampleExcerpt}</blockquote>
      </div>`;

      bodyEl.innerHTML = html;
    }

    if (panel) panel.removeAttribute('hidden');
    if (panel) AccessibilityService.trapFocus(panel);
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

    // Set the goal via NavigatorController
    NavigatorController.selectGoal(arch.mappedGoalId);

    // Close archetype detail
    this.closeArchetype();

    // Navigate to Stage module via SPA router
    if (window._switchToModule) {
      window._switchToModule('stage');
    } else {
      AppState.activeModule = 'stage';
      const tabs = document.querySelectorAll('[role="tab"]');
      tabs.forEach(tab => {
        tab.setAttribute('aria-selected', tab.dataset.module === 'stage' ? 'true' : 'false');
        tab.classList.toggle('nav__tab--active', tab.dataset.module === 'stage');
      });
      const modules = document.querySelectorAll('[role="tabpanel"]');
      modules.forEach(mod => {
        if (mod.id === 'stage') { mod.removeAttribute('hidden'); mod.classList.add('module--active'); }
        else { mod.setAttribute('hidden', ''); mod.classList.remove('module--active'); }
      });
    }
  }
};

export { ArchetypesController };
