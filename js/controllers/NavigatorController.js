// js/controllers/NavigatorController.js
import { GOALS, LESSON_CATALOG, AppState } from '../data/constants.js';
import { GOAL_PLAYBOOKS } from '../data/playbooks.js';
import { LibraryController } from './LibraryController.js';

/* ============================================================
   NavigatorController — goal selection, visual blueprint, playbook,
   and interactive lesson path with Library deep-linking
   Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
============================================================ */
const NavigatorController = {
  init() {
    const goalCards = document.querySelectorAll('.navigator__pill');
    goalCards.forEach(card => {
      card.addEventListener('click', () => {
        this.selectGoal(card.dataset.goalId);
      });
    });
  },

  selectGoal(goalId) {
    const goal = GOALS.find(g => g.id === goalId);
    if (!goal) return;

    AppState.activeGoal = goalId;

    // Update radio group
    const goalCards = document.querySelectorAll('.navigator__pill');
    goalCards.forEach(card => {
      card.setAttribute('aria-checked', card.dataset.goalId === goalId ? 'true' : 'false');
    });

    // Render all sections in correct order: blueprint -> playbook -> lessons
    this.renderBlueprint();
    this.renderPlaybook();
    this.renderGoalPath();

    // Update Stage header goal name
    const stageGoalLabel = document.getElementById('stage-goal-label');
    if (stageGoalLabel) stageGoalLabel.textContent = 'Your focus: ' + goal.label;
  },

  getActiveGoal() {
    if (!AppState.activeGoal) return null;
    return GOALS.find(g => g.id === AppState.activeGoal) || null;
  },

  // ── Visual Strategy Blueprint (flow diagram) ────────────────────

  renderBlueprint() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-blueprint-section');
    const flow = document.getElementById('goal-blueprint-flow');
    const emptyState = document.getElementById('navigator-empty');
    if (!section || !flow) return;

    const playbook = goal ? GOAL_PLAYBOOKS[goal.id] : null;

    if (!goal || !playbook || !playbook.strategies || playbook.strategies.length === 0) {
      section.setAttribute('hidden', '');
      if (emptyState) emptyState.style.display = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    section.removeAttribute('hidden');

    flow.innerHTML = playbook.strategies.map((strategy, i) => {
      // Extract timing from first blueprint step if available
      const timingMatch = strategy.blueprint[0] ? strategy.blueprint[0].match(/^([\d:]+[\u2013\-][\d:]+)/) : null;
      const timing = timingMatch ? timingMatch[1] : '';

      // Short description from objective (first 60 chars)
      const shortDesc = strategy.objective.length > 60
        ? strategy.objective.slice(0, 57) + '...'
        : strategy.objective;

      return '<div class="navigator__blueprint-step">' +
        '<span class="navigator__blueprint-step-number">' + (i + 1) + '</span>' +
        '<span class="navigator__blueprint-step-title">' + strategy.title + '</span>' +
        (timing ? '<span class="navigator__blueprint-step-timing">' + timing + '</span>' : '') +
        '<span class="navigator__blueprint-step-desc">' + shortDesc + '</span>' +
        '</div>';
    }).join('');
  },

  // ── Strategic Playbook (detailed accordion) ─────────────────────

  renderPlaybook() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-playbook-section');
    const list = document.getElementById('goal-playbook-list');
    if (!section || !list) return;

    const playbook = goal ? GOAL_PLAYBOOKS[goal.id] : null;

    if (!goal || !playbook || !playbook.strategies || playbook.strategies.length === 0) {
      section.setAttribute('hidden', '');
      return;
    }

    section.removeAttribute('hidden');
    list.innerHTML = playbook.strategies.map(strategy => {
      const stepsHtml = strategy.blueprint.map(step =>
        '<li class="navigator__playbook-step">' + step + '</li>'
      ).join('');

      const caseStudyHtml = strategy.caseStudy
        ? '<div class="navigator__case-study">' +
          '<p class="navigator__case-study-company">' + strategy.caseStudy.company + '</p>' +
          '<p class="navigator__case-study-text">' + strategy.caseStudy.context + ' ' + strategy.caseStudy.execution + '</p>' +
          '<p class="navigator__case-study-result">' + strategy.caseStudy.result + '</p>' +
          '</div>'
        : '';

      const psychologyHtml = strategy.psychology
        ? '<div class="navigator__psychology-block">' + strategy.psychology + '</div>'
        : '';

      return '<details class="navigator__strategy-card">' +
        '<summary class="navigator__strategy-header">' +
        '<span class="navigator__strategy-title">' + strategy.title + '</span>' +
        '<svg class="navigator__strategy-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4,6 8,10 12,6"/></svg>' +
        '</summary>' +
        '<div class="navigator__strategy-body">' +
        '<p class="navigator__playbook-objective">' + strategy.objective + '</p>' +
        '<p class="navigator__playbook-label">The Approach</p>' +
        '<p class="navigator__playbook-approach">' + strategy.approach + '</p>' +
        '<p class="navigator__playbook-label">Tactical Execution Blueprint</p>' +
        '<ol class="navigator__playbook-steps">' + stepsHtml + '</ol>' +
        '<p class="navigator__playbook-label">Real-World Example</p>' +
        caseStudyHtml +
        '<p class="navigator__playbook-label">The Psychology (Why It Works)</p>' +
        psychologyHtml +
        '</div>' +
        '</details>';
    }).join('');
  },

  // ── Interactive Lesson Path (with Library deep-linking) ─────────

  renderGoalPath() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-path-section');
    const list = document.getElementById('goal-path-list');
    if (!section || !list) return;

    if (!goal) {
      section.setAttribute('hidden', '');
      return;
    }

    section.removeAttribute('hidden');

    const playbook = GOAL_PLAYBOOKS[goal.id];
    const descriptions = playbook ? playbook.lessonDescriptions : [];

    list.innerHTML = goal.lessonIds.map((lessonId, i) => {
      const lesson = LESSON_CATALOG.find(l => l.id === lessonId);
      const title = lesson ? lesson.title : lessonId;
      const source = lesson ? lesson.sourceReference : '';
      const desc = descriptions.find(d => d.lessonId === lessonId);
      const descText = desc ? desc.whyItMatters : '';

      return '<button type="button" class="navigator__lesson-card" data-lesson-id="' + lessonId + '" aria-label="Open ' + title + ' in Library">' +
        '<span class="navigator__lesson-card-number">' + (i + 1) + '</span>' +
        '<div class="navigator__lesson-card-body">' +
        '<span class="navigator__lesson-card-title">' + title + '</span>' +
        (source ? '<span class="navigator__lesson-card-source">' + source + '</span>' : '') +
        (descText ? '<p class="navigator__lesson-card-desc">' + descText + '</p>' : '') +
        '<span class="navigator__lesson-card-badge">' +
        '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12 L12 4 M12 4 L6 4 M12 4 L12 10"/></svg>' +
        'Open in Library</span>' +
        '</div>' +
        '<svg class="navigator__lesson-card-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="8,4 14,10 8,16"/></svg>' +
        '</button>';
    }).join('');

    // Attach click handlers for Library deep-linking
    list.querySelectorAll('.navigator__lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        const lessonId = card.dataset.lessonId;
        if (lessonId) this.openLessonInLibrary(lessonId);
      });
    });
  },

  /**
   * Switch to the Library tab and open a specific lesson.
   */
  openLessonInLibrary(lessonId) {
    // Switch to Library module via global SPA router
    if (window._switchToModule) {
      window._switchToModule('library');
    }
    // Open the lesson in the Library reader view
    setTimeout(() => {
      if (LibraryController && LibraryController.openLesson) {
        LibraryController.openLesson(lessonId);
      }
    }, 100); // Small delay to let the module panel become visible
  }
};

export { NavigatorController };
