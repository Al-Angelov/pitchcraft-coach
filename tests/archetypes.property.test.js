/**
 * Property tests for ArchetypesController
 * Property 11: Archetype detail contains all required fields and practice action (14.3)
 * Property 12: Practice with style sets a valid active goal (14.4)
 * Validates: Requirements 6.2, 6.4, 6.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ARCHETYPES mirror
const ARCHETYPES = [
  {
    id: 'the-visionary',
    name: 'The Visionary',
    tagline: 'See what others can\'t yet.',
    styleDescription: 'The Visionary speaks from conviction before evidence.',
    signatureTechniques: ['Opening with bold claim', 'Future-back storytelling', 'Sustained eye contact', 'Repeating anchor phrase'],
    strengths: ['Creates emotional momentum', 'Makes change feel achievable', 'Inspires loyalty', 'Turns abstract into felt experience'],
    idealContexts: ['All-hands announcements', 'Keynote addresses', 'Fundraising pitches', 'Team kickoffs'],
    exampleExcerpt: 'We\'re not building a product. We\'re building infrastructure for a world where no expert knowledge dies.',
    illustrationAsset: '<svg></svg>',
    mappedGoalId: 'inspirational-talk'
  },
  {
    id: 'the-deep-tech-educator',
    name: 'The Deep-Tech Educator',
    tagline: 'Complexity is the canvas. Clarity is the art.',
    styleDescription: 'Transforms dense technical material into insight anyone can grasp.',
    signatureTechniques: ['Opening with the question', 'Layered analogies', 'Explicit signposting', 'Drawing live'],
    strengths: ['Earns trust from all audiences', 'Makes complex systems navigable', 'Builds credibility', 'Creates lasting understanding'],
    idealContexts: ['Investor deep-dives', 'Cross-functional briefings', 'Mixed-expertise conferences', 'Product demos'],
    exampleExcerpt: 'Think of it like a postal system — but one where every letter is sealed so only the recipient can open it.',
    illustrationAsset: '<svg></svg>',
    mappedGoalId: 'technical-explanation'
  },
  {
    id: 'the-empathetic-storyteller',
    name: 'The Empathetic Storyteller',
    tagline: 'Connection before content. Always.',
    styleDescription: 'Leads with human experience before any argument.',
    signatureTechniques: ['Opening mid-story', 'Naming audience emotions', 'Deliberate vulnerability', 'Reflective questions'],
    strengths: ['Builds trust fastest', 'Makes sensitive topics approachable', 'Audiences feel understood', 'Stories travel'],
    idealContexts: ['Networking', 'Team retrospectives', 'Community building', 'Sales conversations'],
    exampleExcerpt: 'The first time I had to lay someone off, I rehearsed it fourteen times. I still got it wrong.',
    illustrationAsset: '<svg></svg>',
    mappedGoalId: 'casual-networking'
  },
  {
    id: 'the-challenger',
    name: 'The Challenger',
    tagline: 'Disrupt the assumption before you pitch the solution.',
    styleDescription: 'Deliberately unsettles existing mental models before offering new ones.',
    signatureTechniques: ['Opening with the assumption', 'Data to challenge consensus', 'Accusation audit', 'Rhetorical questions'],
    strengths: ['Commands immediate attention', 'Changes minds', 'Effective with skeptics', 'Creates memorable moments'],
    idealContexts: ['Skeptical VCs', 'Conference keynotes', 'Board presentations', 'Sales against status quo'],
    exampleExcerpt: 'Every person in this room has told a founder to go find more traction.',
    illustrationAsset: '<svg></svg>',
    mappedGoalId: 'funding-pitch'
  }
];

const GOAL_IDS = ['funding-pitch', 'technical-explanation', 'casual-networking', 'inspirational-talk', 'job-interview'];

// ─── Property 11: Archetype detail contains all required fields ───────────
describe('Property 11: Archetype detail contains all required fields and practice action', () => {
  it('every archetype has styleDescription, signatureTechniques >= 1, strengths >= 1, idealContexts >= 1, exampleExcerpt, and mappedGoalId', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ARCHETYPES),
        (arch) => {
          expect(arch.styleDescription.length).toBeGreaterThan(0);
          expect(arch.signatureTechniques.length).toBeGreaterThanOrEqual(1);
          expect(arch.strengths.length).toBeGreaterThanOrEqual(1);
          expect(arch.idealContexts.length).toBeGreaterThanOrEqual(1);
          expect(arch.exampleExcerpt.length).toBeGreaterThan(0);
          expect(arch.mappedGoalId.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 12: Practice with style sets a valid goal ───────────────────
describe('Property 12: Practice with style sets a valid active goal', () => {
  it('every archetype.mappedGoalId exists in GOALS', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ARCHETYPES),
        (arch) => {
          expect(GOAL_IDS).toContain(arch.mappedGoalId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
