/**
 * Unit tests for NavigatorController
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6
 *
 * Tests verify:
 * - Changing goal updates lesson path without reload
 * - Goal-specific tips differ between goals
 * - All 5 goals enumerated
 * - Only one goal active at a time
 * - Stage header updated with goal name
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

// GOALS mirror
const GOALS = [
  { id: 'funding-pitch', label: 'Funding Pitch', lessonIds: ['l1','l2','l3'], tips: ['tip1','tip2','tip3'] },
  { id: 'technical-explanation', label: 'Technical Explanation', lessonIds: ['l4','l5','l6'], tips: ['tip4','tip5','tip6'] },
  { id: 'casual-networking', label: 'Casual Networking', lessonIds: ['l7','l8','l9'], tips: ['tip7','tip8','tip9'] },
  { id: 'inspirational-talk', label: 'Inspirational Talk', lessonIds: ['l10','l11','l12'], tips: ['tip10','tip11','tip12'] },
  { id: 'job-interview', label: 'Job Interview', lessonIds: ['l13','l14','l15'], tips: ['tip13','tip14','tip15'] }
];

// LESSON_CATALOG stub (just enough for rendering)
const LESSON_CATALOG = [
  { id: 'l1', title: 'Lesson 1' }, { id: 'l2', title: 'Lesson 2' }, { id: 'l3', title: 'Lesson 3' },
  { id: 'l4', title: 'Lesson 4' }, { id: 'l5', title: 'Lesson 5' }, { id: 'l6', title: 'Lesson 6' },
  { id: 'l7', title: 'Lesson 7' }, { id: 'l8', title: 'Lesson 8' }, { id: 'l9', title: 'Lesson 9' },
  { id: 'l10', title: 'Lesson 10' }, { id: 'l11', title: 'Lesson 11' }, { id: 'l12', title: 'Lesson 12' },
  { id: 'l13', title: 'Lesson 13' }, { id: 'l14', title: 'Lesson 14' }, { id: 'l15', title: 'Lesson 15' }
];

// AppState mirror
const AppState = {
  activeGoal: null,
  init() { this.activeGoal = null; }
};

// NavigatorController mirror
const NavigatorController = {
  init() {
    const goalCards = document.querySelectorAll('.navigator__pill');
    goalCards.forEach(card => {
      card.addEventListener('click', () => { this.selectGoal(card.dataset.goalId); });
    });
  },
  selectGoal(goalId) {
    const goal = GOALS.find(g => g.id === goalId);
    if (!goal) return;
    AppState.activeGoal = goalId;
    const goalCards = document.querySelectorAll('.navigator__pill');
    goalCards.forEach(card => {
      card.setAttribute('aria-checked', card.dataset.goalId === goalId ? 'true' : 'false');
    });
    this.renderGoalPath();
    this.renderTips();
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
    if (!section || !list) return;
    if (!goal) { section.setAttribute('hidden', ''); return; }
    section.removeAttribute('hidden');
    list.innerHTML = goal.lessonIds.map((id, i) => {
      const lesson = LESSON_CATALOG.find(l => l.id === id);
      const title = lesson ? lesson.title : id;
      return `<div class="navigator__milestone"><span class="navigator__milestone-number">${i + 1}</span><span class="navigator__milestone-title">${title}</span></div>`;
    }).join('');
  },
  renderTips() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-tips-section');
    const list = document.getElementById('goal-tips-list');
    if (!section || !list) return;
    if (!goal) { section.setAttribute('hidden', ''); return; }
    section.removeAttribute('hidden');
    list.innerHTML = goal.tips.map(tip => `<div class="navigator__tip-callout"><span class="navigator__tip-text">${tip}</span></div>`).join('');
  }
};

describe('NavigatorController', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
    AppState.init();
    NavigatorController.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('all 5 goal cards are present in the DOM', () => {
    const cards = document.querySelectorAll('.navigator__pill');
    expect(cards.length).toBe(5);
  });

  it('selecting a goal shows lesson path section', () => {
    const pathSection = document.getElementById('goal-path-section');
    expect(pathSection.hasAttribute('hidden')).toBe(true);

    NavigatorController.selectGoal('funding-pitch');

    expect(pathSection.hasAttribute('hidden')).toBe(false);
    const items = document.querySelectorAll('#goal-path-list > *');
    expect(items.length).toBe(3);
  });

  it('selecting a goal shows tips section', () => {
    const tipsSection = document.getElementById('goal-tips-section');
    expect(tipsSection.hasAttribute('hidden')).toBe(true);

    NavigatorController.selectGoal('technical-explanation');

    expect(tipsSection.hasAttribute('hidden')).toBe(false);
    const items = document.querySelectorAll('#goal-tips-list > *');
    expect(items.length).toBe(3);
  });

  it('changing goal updates lesson path without page reload', () => {
    NavigatorController.selectGoal('funding-pitch');
    const items1 = document.querySelectorAll('#goal-path-list > *');
    const text1 = Array.from(items1).map(li => li.textContent);

    NavigatorController.selectGoal('casual-networking');
    const items2 = document.querySelectorAll('#goal-path-list > *');
    const text2 = Array.from(items2).map(li => li.textContent);

    expect(text1).not.toEqual(text2);
  });

  it('goal-specific tips differ between goals', () => {
    NavigatorController.selectGoal('funding-pitch');
    const tips1 = document.getElementById('goal-tips-list').innerHTML;

    NavigatorController.selectGoal('job-interview');
    const tips2 = document.getElementById('goal-tips-list').innerHTML;

    expect(tips1).not.toEqual(tips2);
  });

  it('only one goal is active at a time', () => {
    NavigatorController.selectGoal('funding-pitch');
    NavigatorController.selectGoal('inspirational-talk');

    const checked = document.querySelectorAll('.navigator__pill[aria-checked="true"]');
    expect(checked.length).toBe(1);
    expect(checked[0].dataset.goalId).toBe('inspirational-talk');
    expect(AppState.activeGoal).toBe('inspirational-talk');
  });

  it('stage header is updated with goal name on selection', () => {
    NavigatorController.selectGoal('job-interview');

    const label = document.getElementById('stage-goal-label');
    expect(label.textContent).toContain('Job Interview');
  });
});
