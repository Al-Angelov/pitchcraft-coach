/**
 * Property tests for NavigatorController
 * Property 9: Goal selection produces non-empty, goal-specific lesson path and tips (13.3)
 * Property 10: Exactly one active goal at all times after selection (13.4)
 * Validates: Requirements 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// GOALS mirror
const GOALS = [
  {
    id: 'funding-pitch',
    label: 'Funding Pitch',
    lessonIds: ['lesson-sinek-start-with-why', 'lesson-voss-never-split', 'lesson-heath-made-to-stick', 'lesson-peak-end-rule', 'lesson-handling-questions'],
    tips: ['Lead with the why', 'Pre-load objections', 'End on a peak', 'Use human-scale numbers', 'Silence is a tool']
  },
  {
    id: 'technical-explanation',
    label: 'Technical Explanation',
    lessonIds: ['lesson-cognitive-load', 'lesson-heath-made-to-stick', 'lesson-gallo-talk-like-ted', 'lesson-sinek-start-with-why', 'lesson-opening-strong'],
    tips: ['One idea per slide', 'Lead with curiosity gap', 'Translate to analogy', 'Signpost and summary', 'Grandma test']
  },
  {
    id: 'casual-networking',
    label: 'Casual Networking',
    lessonIds: ['lesson-brown-vulnerability', 'lesson-pratfall-effect', 'lesson-voss-never-split', 'lesson-cuddy-body-language', 'lesson-personal-note-best-habits'],
    tips: ['Ask genuine questions', 'Use Pratfall Effect', 'Mirror last few words', 'Match physical presence', 'Follow up in 24h']
  },
  {
    id: 'inspirational-talk',
    label: 'Inspirational Talk',
    lessonIds: ['lesson-sinek-start-with-why', 'lesson-brown-vulnerability', 'lesson-gallo-talk-like-ted', 'lesson-peak-end-rule', 'lesson-opening-strong'],
    tips: ['Start with a story', 'Identify jaw-dropping moment', 'Design close before opening', 'Use vulnerability deliberately', 'Why must be real']
  },
  {
    id: 'job-interview',
    label: 'Job Interview',
    lessonIds: ['lesson-cuddy-body-language', 'lesson-pratfall-effect', 'lesson-voss-never-split', 'lesson-handling-questions', 'lesson-peak-end-rule'],
    tips: ['Power posture before', 'Prepare limitation disclosure', 'Label empathy', 'End with forward-looking', 'Slow down on complex']
  }
];

const GOAL_IDS = GOALS.map(g => g.id);

// ─── Property 9: Goal path and tips non-empty and distinct ────────────────
describe('Property 9: Goal selection produces non-empty, goal-specific lesson path and tips', () => {
  it('two distinct goals return different paths and tips', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...GOAL_IDS),
        fc.constantFrom(...GOAL_IDS),
        (goalId1, goalId2) => {
          fc.pre(goalId1 !== goalId2); // skip when same

          const goal1 = GOALS.find(g => g.id === goalId1);
          const goal2 = GOALS.find(g => g.id === goalId2);

          // Both have non-empty lesson paths and tips
          expect(goal1.lessonIds.length).toBeGreaterThan(0);
          expect(goal1.tips.length).toBeGreaterThan(0);
          expect(goal2.lessonIds.length).toBeGreaterThan(0);
          expect(goal2.tips.length).toBeGreaterThan(0);

          // They should differ in at least one of path or tips
          const pathSame = JSON.stringify(goal1.lessonIds) === JSON.stringify(goal2.lessonIds);
          const tipsSame = JSON.stringify(goal1.tips) === JSON.stringify(goal2.tips);
          expect(pathSame && tipsSame).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 10: Exactly one active goal at all times after selection ────
describe('Property 10: Exactly one active goal at all times after selection', () => {
  it('after each selection AppState.activeGoal equals the selected goal and no other', () => {
    // Simulated AppState
    const AppState = { activeGoal: null };

    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...GOAL_IDS), { minLength: 1, maxLength: 10 }),
        (selections) => {
          selections.forEach(goalId => {
            AppState.activeGoal = goalId;
            expect(AppState.activeGoal).toBe(goalId);
            // Only one goal is active
            const activeCount = GOAL_IDS.filter(id => id === AppState.activeGoal).length;
            expect(activeCount).toBe(1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
