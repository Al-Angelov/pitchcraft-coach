// js/controllers/NavigatorController.js
import { GOALS, LESSON_CATALOG, AppState } from '../data/constants.js';

/* ============================================================
   NavigatorController — goal selection and lesson path
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

    // Render path and tips
    this.renderGoalPath();
    this.renderTips();

    // Update Stage header goal name
    const stageGoalLabel = document.getElementById('stage-goal-label');
    if (stageGoalLabel) stageGoalLabel.textContent = `Your focus: ${goal.label}`;
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
    list.innerHTML = goal.lessonIds.map((lessonId, i) => {
      const lesson = LESSON_CATALOG.find(l => l.id === lessonId);
      const title = lesson ? lesson.title : lessonId;
      return `<div class="navigator__milestone">
        <span class="navigator__milestone-number">${i + 1}</span>
        <span class="navigator__milestone-title">${title}</span>
      </div>`;
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
    list.innerHTML = goal.tips.map(tip => `<div class="navigator__tip-callout">
      <svg class="navigator__tip-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8 M3 3 L4.5 4.5 M11.5 11.5 L13 13"/></svg>
      <span class="navigator__tip-text">${tip}</span>
    </div>`).join('');
  }
};

export { NavigatorController };
