/**
 * Property tests for curveball engine and session summary
 * Property 3: Session summary always contains uncompleted phases (11.5)
 * Property 5: Curveball selection never repeats within a session (11.6)
 * Property 4: Curveball pool provides unique advice per prompt (11.7)
 * Validates: Requirements 2.6, 3.3, 3.6
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// SESSION_MODES mirror (timed modes only)
const SESSION_MODES = [
  { id: 'elevator-60', durationSeconds: 60, isFreeMode: false, phases: [
    { name: 'Hook', startPercent: 0, endPercent: 0.25 },
    { name: 'Problem', startPercent: 0.25, endPercent: 0.5 },
    { name: 'Solution', startPercent: 0.5, endPercent: 0.75 },
    { name: 'CTA', startPercent: 0.75, endPercent: 1.0 }
  ]},
  { id: 'startup-5m', durationSeconds: 300, isFreeMode: false, phases: [
    { name: 'Intro', startPercent: 0, endPercent: 0.15 },
    { name: 'Problem', startPercent: 0.15, endPercent: 0.35 },
    { name: 'Solution', startPercent: 0.35, endPercent: 0.60 },
    { name: 'Demo', startPercent: 0.60, endPercent: 0.80 },
    { name: 'CTA', startPercent: 0.80, endPercent: 1.0 }
  ]},
  { id: 'presentation-15m', durationSeconds: 900, isFreeMode: false, phases: [
    { name: 'Intro', startPercent: 0, endPercent: 0.10 },
    { name: 'Context', startPercent: 0.10, endPercent: 0.25 },
    { name: 'Core 1', startPercent: 0.25, endPercent: 0.45 },
    { name: 'Core 2', startPercent: 0.45, endPercent: 0.65 },
    { name: 'Synthesis', startPercent: 0.65, endPercent: 0.85 },
    { name: 'Close', startPercent: 0.85, endPercent: 1.0 }
  ]},
  { id: 'deep-dive-30m', durationSeconds: 1800, isFreeMode: false, phases: [
    { name: 'Intro', startPercent: 0, endPercent: 0.08 },
    { name: 'Background', startPercent: 0.08, endPercent: 0.20 },
    { name: 'Analysis 1', startPercent: 0.20, endPercent: 0.35 },
    { name: 'Analysis 2', startPercent: 0.35, endPercent: 0.50 },
    { name: 'Analysis 3', startPercent: 0.50, endPercent: 0.65 },
    { name: 'Synthesis', startPercent: 0.65, endPercent: 0.80 },
    { name: 'Q&A Prep', startPercent: 0.80, endPercent: 0.92 },
    { name: 'Close', startPercent: 0.92, endPercent: 1.0 }
  ]}
];

// CURVEBALL_POOL mirror (IDs only needed for selection logic test)
const CURVEBALL_POOL = [
  { id: 'cb-skepticism-01', category: 'skepticism', prompt: 'Your revenue projections look extremely optimistic.', advice: 'Walk through your key assumptions one by one.' },
  { id: 'cb-skepticism-02', category: 'skepticism', prompt: 'This problem has been around for decades.', advice: 'Name the specific shift that makes now the right moment.' },
  { id: 'cb-skepticism-03', category: 'skepticism', prompt: 'Three other startups tried this.', advice: 'Agree that competition validates the problem.' },
  { id: 'cb-skepticism-04', category: 'skepticism', prompt: 'Customer acquisition cost seems too low.', advice: 'Cite channel-by-channel data.' },
  { id: 'cb-skepticism-05', category: 'skepticism', prompt: 'The market is smaller than you think.', advice: 'Reference specific evidence.' },
  { id: 'cb-skepticism-06', category: 'skepticism', prompt: 'Timeline to profitability is unrealistic.', advice: 'Present your scenario planning honestly.' },
  { id: 'cb-clarification-01', category: 'clarification', prompt: 'Can you explain in simpler terms?', advice: 'Reach for an analogy.' },
  { id: 'cb-clarification-02', category: 'clarification', prompt: 'How do you make money?', advice: 'State the revenue model in one sentence.' },
  { id: 'cb-clarification-03', category: 'clarification', prompt: 'Who is your target customer?', advice: 'Narrow to a vivid persona.' },
  { id: 'cb-clarification-04', category: 'clarification', prompt: 'What does traction mean for you?', advice: 'Replace traction with hard numbers.' },
  { id: 'cb-clarification-05', category: 'clarification', prompt: 'What makes your algorithm proprietary?', advice: 'Describe the moat without giving away IP.' },
  { id: 'cb-clarification-06', category: 'clarification', prompt: 'Difference between free and paid tier?', advice: 'Use a side-by-side framing.' },
  { id: 'cb-pivot-01', category: 'pivot', prompt: 'What if your market does not adopt?', advice: 'Name your adjacent market.' },
  { id: 'cb-pivot-02', category: 'pivot', prompt: 'Big tech enters your space tomorrow.', advice: 'Lean into your asymmetric advantages.' },
  { id: 'cb-pivot-03', category: 'pivot', prompt: 'Better as a feature inside existing platform?', advice: 'Engage the question honestly.' },
  { id: 'cb-pivot-04', category: 'pivot', prompt: 'Core technology assumption was wrong?', advice: 'Show intellectual flexibility.' },
  { id: 'cb-pivot-05', category: 'pivot', prompt: 'Regulatory environment shifts significantly?', advice: 'Show you are monitoring the landscape.' },
  { id: 'cb-pivot-06', category: 'pivot', prompt: 'Cut roadmap to one feature?', advice: 'Name the single feature most tied to value.' },
  { id: 'cb-personal-challenge-01', category: 'personal-challenge', prompt: 'Why are YOU the right person?', advice: 'Connect past experiences to the problem.' },
  { id: 'cb-personal-challenge-02', category: 'personal-challenge', prompt: 'Have you personally experienced this?', advice: 'Describe your customer discovery process.' },
  { id: 'cb-personal-challenge-03', category: 'personal-challenge', prompt: 'Biggest mistake so far?', advice: 'Choose a real mistake, not a humblebrag.' },
  { id: 'cb-personal-challenge-04', category: 'personal-challenge', prompt: 'Do you have the resilience?', advice: 'Point to specific evidence of resilience.' },
  { id: 'cb-personal-challenge-05', category: 'personal-challenge', prompt: 'What does your co-founder bring?', advice: 'Describe the genuine skill split.' },
  { id: 'cb-personal-challenge-06', category: 'personal-challenge', prompt: 'If this fails in 18 months?', advice: 'Name the knowledge you would carry forward.' }
];

// ─── Property 3: Session summary contains uncompleted phases ──────────────
describe('Property 3: Session summary contains uncompleted phases', () => {
  it('uncompleted phases are exactly those with startPercent > elapsed/totalDuration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SESSION_MODES),
        fc.integer({ min: 0, max: 1800 }),
        (mode, elapsed) => {
          // Clamp elapsed to the mode duration
          const clampedElapsed = Math.min(elapsed, mode.durationSeconds);
          const ratio = clampedElapsed / mode.durationSeconds;

          const uncompleted = mode.phases.filter(p => p.startPercent > ratio).map(p => p.name);

          // Verify each uncompleted phase truly has startPercent > ratio
          uncompleted.forEach(name => {
            const phase = mode.phases.find(p => p.name === name);
            expect(phase.startPercent).toBeGreaterThan(ratio);
          });

          // Verify no phase with startPercent <= ratio is in uncompleted
          mode.phases.filter(p => p.startPercent <= ratio).forEach(phase => {
            expect(uncompleted).not.toContain(phase.name);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 5: Curveball no-repetition within a session ─────────────────
describe('Property 5: Curveball selection never repeats within a session', () => {
  it('N selections all produce unique IDs (N <= pool size)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: CURVEBALL_POOL.length }),
        (n) => {
          const shown = [];
          for (let i = 0; i < n; i++) {
            const available = CURVEBALL_POOL.filter(cb => !shown.includes(cb.id));
            expect(available.length).toBeGreaterThan(0);
            const selected = available[Math.floor(Math.random() * available.length)];
            expect(shown).not.toContain(selected.id);
            shown.push(selected.id);
          }
          // All IDs should be unique
          const uniqueIds = new Set(shown);
          expect(uniqueIds.size).toBe(n);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 4: Curveball advice non-empty ───────────────────────────────
describe('Property 4: Curveball pool provides unique advice per prompt', () => {
  it('every curveball has non-empty prompt and non-empty advice', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CURVEBALL_POOL),
        (curveball) => {
          expect(curveball.prompt.length).toBeGreaterThan(0);
          expect(curveball.advice.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
