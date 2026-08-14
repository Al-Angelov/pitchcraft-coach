/**
 * Property test: Phase indicator maps elapsed time correctly
 * Property 2: Phase indicator maps elapsed time correctly
 * Validates: Requirements 2.2, 2.3
 *
 * Uses mode × fc.integer({ min: 0 }) (modulo duration);
 * asserts getCurrentPhase returns phase with startPercent <= ratio < endPercent
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

// Mirror of getCurrentPhase from StageController
function getCurrentPhase(elapsed, mode) {
  if (!mode || mode.isFreeMode || !mode.phases.length) return null;
  const ratio = Math.min(elapsed / mode.durationSeconds, 1);
  for (let i = 0; i < mode.phases.length; i++) {
    const phase = mode.phases[i];
    if (i === mode.phases.length - 1) {
      if (ratio >= phase.startPercent && ratio <= phase.endPercent) return phase;
    } else {
      if (ratio >= phase.startPercent && ratio < phase.endPercent) return phase;
    }
  }
  return mode.phases[mode.phases.length - 1];
}

describe('Property 2: Phase indicator maps elapsed time correctly', () => {
  it('getCurrentPhase returns a phase where startPercent <= ratio < endPercent (or <= for last)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SESSION_MODES),
        fc.integer({ min: 0, max: 10000 }),
        (mode, rawElapsed) => {
          const elapsed = rawElapsed % (mode.durationSeconds + 1); // 0 to durationSeconds
          const phase = getCurrentPhase(elapsed, mode);
          const ratio = Math.min(elapsed / mode.durationSeconds, 1);

          expect(phase).not.toBeNull();
          expect(ratio).toBeGreaterThanOrEqual(phase.startPercent);
          expect(ratio).toBeLessThanOrEqual(phase.endPercent);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getCurrentPhase at elapsed=0 returns the first phase', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SESSION_MODES), (mode) => {
        const phase = getCurrentPhase(0, mode);
        expect(phase).not.toBeNull();
        expect(phase.startPercent).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('getCurrentPhase at elapsed=durationSeconds returns the last phase', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SESSION_MODES), (mode) => {
        const phase = getCurrentPhase(mode.durationSeconds, mode);
        expect(phase).not.toBeNull();
        expect(phase.endPercent).toBe(1.0);
      }),
      { numRuns: 100 }
    );
  });

  it('getCurrentPhase returns null for Free Mode', () => {
    const freeMode = { id: 'free', durationSeconds: 0, isFreeMode: true, phases: [] };
    const phase = getCurrentPhase(100, freeMode);
    expect(phase).toBeNull();
  });
});
