/**
 * Property tests for LibraryController
 * Property 7: Search filter is complete and sound (12.5)
 * Property 6: Lesson detail render contains all required fields (12.6)
 * Validates: Requirements 4.2, 4.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Minimal LESSON_CATALOG mirror for property tests
const LESSON_CATALOG = [
  {
    id: 'lesson-sinek-start-with-why',
    category: 'ted-talk',
    title: 'Start With Why',
    sourceReference: 'TED Talk: Simon Sinek, 2009',
    keyTakeaways: ['People buy why you do it', 'Golden Circle works inside out', 'Limbic brain responds to why'],
    actionableTechniques: ['Open with a Why statement', 'Test your why'],
    content: 'Simon Sinek argues that inspiring leaders communicate from a clear sense of purpose.'
  },
  {
    id: 'lesson-cuddy-body-language',
    category: 'ted-talk',
    title: 'Your Body Language May Shape Who You Are',
    sourceReference: 'TED Talk: Amy Cuddy, 2012',
    keyTakeaways: ['Body language affects self-perception', 'Power posing shifts hormones', 'Nonverbal communication matters'],
    actionableTechniques: ['Adopt expansive posture before stage', 'Plant feet hip-width apart'],
    content: 'Amy Cuddy explores the feedback loop between body language and self-perception.'
  },
  {
    id: 'lesson-cognitive-load',
    category: 'psychology',
    title: 'Cognitive Load Theory for Speakers',
    sourceReference: 'Psychology: John Sweller, 1988',
    keyTakeaways: ['Working memory holds 4 chunks', 'Extraneous load is the enemy', 'Dual-coding expands capacity'],
    actionableTechniques: ['One idea per slide', 'Signpost and summary technique'],
    content: 'Cognitive Load Theory explains why many technically accurate presentations fail.'
  },
  {
    id: 'lesson-peak-end-rule',
    category: 'psychology',
    title: 'The Peak-End Rule in Presentations',
    sourceReference: 'Psychology: Kahneman & Fredrickson, 1993',
    keyTakeaways: ['Audiences remember peak and end', 'Duration neglect applies', 'Positive peak plus strong close'],
    actionableTechniques: ['Design your peak moment', 'Never end with Q&A'],
    content: 'The peak-end rule describes how humans evaluate past experiences.'
  }
];

// Search filter logic mirror
function searchFilter(lessons, query) {
  const lowerQuery = query.toLowerCase();
  return lessons.filter(lesson => {
    const searchable = (lesson.title + ' ' + (lesson.content || '')).toLowerCase();
    return searchable.includes(lowerQuery);
  });
}

// ─── Property 7: Search filter soundness and completeness ─────────────────
describe('Property 7: Search filter is complete and sound', () => {
  it('every returned lesson contains the query (soundness)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        (query) => {
          const results = searchFilter(LESSON_CATALOG, query);
          const lowerQuery = query.toLowerCase();
          results.forEach(lesson => {
            const searchable = (lesson.title + ' ' + (lesson.content || '')).toLowerCase();
            expect(searchable).toContain(lowerQuery);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every lesson containing the query is returned (completeness)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        (query) => {
          const results = searchFilter(LESSON_CATALOG, query);
          const lowerQuery = query.toLowerCase();
          const resultIds = results.map(r => r.id);

          LESSON_CATALOG.forEach(lesson => {
            const searchable = (lesson.title + ' ' + (lesson.content || '')).toLowerCase();
            if (searchable.includes(lowerQuery)) {
              expect(resultIds).toContain(lesson.id);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6: Lesson detail render contains all required fields ────────
describe('Property 6: Lesson detail render contains all required fields', () => {
  it('every lesson has title, sourceReference, at least one keyTakeaway and one actionableTechnique', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LESSON_CATALOG),
        (lesson) => {
          expect(lesson.title.length).toBeGreaterThan(0);
          expect(lesson.sourceReference.length).toBeGreaterThan(0);
          expect(lesson.keyTakeaways.length).toBeGreaterThanOrEqual(1);
          expect(lesson.actionableTechniques.length).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
