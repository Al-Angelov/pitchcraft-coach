// js/controllers/NavigatorController.js
import { GOALS, LESSON_CATALOG, AppState } from '../data/constants.js';
import { GOAL_PLAYBOOKS } from '../data/playbooks.js';

/* ============================================================
   NavigatorController — goal selection, lesson path, and strategic playbook
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

    // Render all sections
    this.renderGoalPath();
    this.renderTips();
    this.renderPlaybook();

    // Update Stage header goal name
    const stageGoalLabel = document.getElementById('stage-goal-label');
    if (stageGoalLabel) stageGoalLabel.textContent = 'Your focus: ' + goal.label;
  },

  getActiveGoal() {
    if (!AppState.activeGoal) return null;
    return GOALS.find(g => g.id === AppState.activeGoal) || null;
  },

  renderGoalPath() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-path-section');
    const list = document.getElementById('goal-path-list');
    const emptyState = document.getElementById('navigator-empty');
    if (!section || !list) return;

    if (!goal) {
      section.setAttribute('hidden', '');
      if (emptyState) emptyState.style.display = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    section.removeAttribute('hidden');

    // Get playbook lesson descriptions if available
    const playbook = GOAL_PLAYBOOKS[goal.id];
    const descriptions = playbook ? playbook.lessonDescriptions : [];

    list.innerHTML = goal.lessonIds.map((lessonId, i) => {
      const lesson = LESSON_CATALOG.find(l => l.id === lessonId);
      const title = lesson ? lesson.title : lessonId;
      const desc = descriptions.find(d => d.lessonId === lessonId);
      const descHtml = desc
        ? '<span class="navigator__milestone-desc">' + desc.whyItMatters + '</span>'
        : '';
      return '<div class="navigator__milestone navigator__milestone--enhanced">' +
        '<div style="display:flex;align-items:flex-start;gap:0.75rem;width:100%">' +
        '<span class="navigator__milestone-number">' + (i + 1) + '</span>' +
        '<span class="navigator__milestone-title">' + title + '</span>' +
        '</div>' +
        descHtml +
        '</div>';
    }).join('');
  },

  renderTips() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-tips-section');
    const list = document.getElementById('goal-tips-list');
    if (!section || !list) return;

    if (!goal) {
      section.setAttribute('hidden', '');
      return;
    }

    section.removeAttribute('hidden');
    list.innerHTML = goal.tips.map(tip => '<div class="navigator__tip-callout">' +
      '<svg class="navigator__tip-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8 M3 3 L4.5 4.5 M11.5 11.5 L13 13"/></svg>' +
      '<span class="navigator__tip-text">' + tip + '</span>' +
      '</div>').join('');
  },

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
  }
};

export { NavigatorController };
