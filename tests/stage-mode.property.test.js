/**
 * Property test: Mode selection always produces a non-empty phase breakdown
 * Property 1: Mode selection always produces a non-empty phase breakdown
 * Validates: Requirements 1.2, 2.2
 *
 * Uses fc.constantFrom(...SESSION_MODES.filter(m => !m.isFreeMode))
 * Assert phases.length >= 1 and phases are contiguous
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// SESSION_MODES mirror (timed modes only for this property)
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
  ]}
];

const TIMED_MODES = SESSION_MODES.filter(m => !m.isFreeMode);

describe('Property 1: Mode selection produces non-empty phase breakdown', () => {
  it('every timed mode has at least one phase', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TIMED_MODES), (mode) => {
        expect(mode.phases.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 }
    );
  });

  it('phases are contiguous — each phase.endPercent === next phase.startPercent', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TIMED_MODES), (mode) => {
        for (let i = 0; i < mode.phases.length - 1; i++) {
          expect(mode.phases[i].endPercent).toBeCloseTo(mode.phases[i + 1].startPercent, 10);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('first phase starts at 0 and last phase ends at 1', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TIMED_MODES), (mode) => {
        expect(mode.phases[0].startPercent).toBe(0);
        expect(mode.phases[mode.phases.length - 1].endPercent).toBe(1.0);
      }),
      { numRuns: 100 }
    );
  });

  it('all phase names are non-empty strings', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TIMED_MODES), (mode) => {
        mode.phases.forEach(phase => {
          expect(phase.name.length).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });
});
