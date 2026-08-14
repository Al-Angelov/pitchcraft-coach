# Implementation Plan: PitchCraft & Eloquence Studio

## Overview

A single-file vanilla JavaScript SPA (`index.html`) with no build step. Implementation proceeds in layers: HTML structure and CSS design system first, then data definitions, then each controller/service, then integration and wiring, ending with accessibility hardening and the full test suite. Each task builds directly on the previous so no code is left orphaned.

## Tasks

- [x] 1. Scaffold `index.html` — document structure, Google Fonts, and CSS custom properties
  - [x] 1.1 Create `index.html` with `<!DOCTYPE html>`, `<head>` metadata, and Google Fonts `<link>` for Playfair Display and Inter (font-display: swap)
    - Include `<meta name="viewport" content="width=device-width, initial-scale=1">`
    - Add `<title>PitchCraft & Eloquence Studio</title>`
    - _Requirements: 7.3, 7.4, 9.1_
  - [x] 1.2 Add all CSS custom properties inside a `<style>` block — landing palette, studio palette, semantic tokens, type scale, spacing tokens, and animation tokens
    - Declare all `--color-landing-*`, `--color-studio-*`, `--color-focus-ring`, `--text-*`, and `--transition-*` variables in `:root`
    - Add `@media (prefers-reduced-motion: reduce)` block that sets all transition/animation durations to `0ms`
    - _Requirements: 7.1, 7.2, 8.4, 9.9, 9.11_
  - [x] 1.3 Write layout CSS: container max-width (72rem), module padding, responsive grid with `minmax(0, 1fr)`, single-column fallback at 375px
    - _Requirements: 7.4, 7.5_


- [x] 2. Build the Landing Screen HTML, CSS, and static visuals
  - [x] 2.1 Add `#landing` section to `<body>`: wordmark "Pitch & Eloquence.", subtitle, painterly full-bleed background, and "Enter the Studio" `<button>`
    - Wordmark uses `clamp(3rem, 8vw, 7rem)` font-size; subtitle at ~1.25rem; ratio ≥ 2.5× at 1024px+
    - Apply `--color-landing-*` palette; button uses `--color-landing-cta-bg` / `--color-landing-cta-text`
    - Add WCAG 2.1 AA contrast to wordmark, subtitle, and CTA against the dark background
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8, 9.9, 9.10_
  - [x] 2.2 Add landing line-art/SVG illustration element and CSS for the oil-painting-style background (radial gradients or CSS background layers simulating ochre/umber depth)
    - _Requirements: 7.6, 9.4_
  - [x] 2.3 Write unit test: landing screen renders wordmark, subtitle, and CTA button; CTA is keyboard focusable
    - _Requirements: 9.2, 9.3, 9.5, 8.1_


- [x] 3. Build the Studio interior shell: `#studio`, navigation tabs, and module sections
  - [x] 3.1 Add `#studio` wrapper (hidden by default), `#nav` tab bar with four `<button role="tab">` elements (Stage, Library, Navigator, Archetypes), and four `<section>` module containers (`#stage`, `#library`, `#navigator`, `#archetypes`)
    - Use `data-active` attribute on `#studio` and `aria-selected` on nav tabs for SPA routing
    - Apply `--color-studio-*` palette to all interior elements
    - _Requirements: 7.1, 7.5, 7.8, 8.1, 8.5_
  - [x] 3.2 Add CSS for module show/hide transitions (opacity + transform, 250ms ease via `--transition-base`) and nav tab active states
    - _Requirements: 7.2, 7.5_
  - [x] 3.3 Write unit test: all four nav tabs present; default active module is `#stage`; studio section hidden on initial load
    - _Requirements: 7.5, 9.7_


- [x] 4. Define all static data constants in the `<script>` module block
  - [x] 4.1 Write `SESSION_MODES` array — 5 `SessionMode` objects with `id`, `label`, `durationSeconds`, `isFreeMode`, and `phases` arrays matching the design phase table
    - _Requirements: 1.1, 2.2_
  - [x] 4.2 Write `CURVEBALL_POOL` array — minimum 20 `Curveball` objects across 4 categories (skepticism, clarification, pivot, personal-challenge), each with non-empty `prompt` and `advice`
    - Minimum 4 curveballs per category
    - _Requirements: 3.3, 3.5_
  - [x] 4.3 Write `LESSON_CATALOG` array — minimum 10 pre-authored `Lesson` objects across all 4 categories (ted-talk, book-summary, psychology, personal-note), each with `keyTakeaways` (min 3) and `actionableTechniques` (min 2)
    - _Requirements: 4.1, 4.3_
  - [x] 4.4 Write `GOALS` array — 5 `Goal` objects (funding-pitch, technical-explanation, casual-networking, inspirational-talk, job-interview), each with ordered `lessonIds` and `tips` (min 3)
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 4.5 Write `ARCHETYPES` array — minimum 4 `Archetype` objects (The Visionary, The Deep-Tech Educator, The Empathetic Storyteller, The Challenger), each with all required fields and a valid `mappedGoalId`
    - Include inline SVG string in `illustrationAsset` for each archetype
    - _Requirements: 6.1, 6.3, 7.6_


- [x] 5. Implement `AppState` singleton and `StorageService`
  - [x] 5.1 Write `AppState` object with all fields from the design (`screen`, `activeModule`, `session`, `activeGoal`, `openLessonId`, `openArchetypeId`, `notes`, `searchQuery`) and an `init()` that sets default values
    - _Requirements: 4.5, 5.5_
  - [x] 5.2 Write `StorageService` with `saveNotes`, `loadNotes`, and `clearNotes`; wrap all localStorage calls in try/catch; `loadNotes` returns `[]` on any error
    - _Requirements: 4.5, 4.6_
  - [x] 5.3 Write property test for personal note storage round-trip
    - **Property 8: Personal note storage round-trip**
    - **Validates: Requirements 4.5**
    - Use `fc.record({ title: fc.string({ minLength: 1 }), content: fc.string({ minLength: 1 }) })`; assert that save then load returns matching `title`, `content`, and `createdAt`
  - [x] 5.4 Write unit tests for `StorageService`: empty state when storage cleared; corrupted JSON returns `[]`; unavailable storage returns `[]`
    - _Requirements: 4.6_


- [x] 6. Implement `AccessibilityService` and `AnimationService`
  - [x] 6.1 Write `AccessibilityService`: add two ARIA live region `<div>`s to the DOM (one `aria-live="polite"`, one `aria-live="assertive"`); implement `announce(text, politeness)`, `moveFocusTo(element)`, `trapFocus(container)`, and `releaseFocus()`
    - `announce()` must NOT be called on timer ticks
    - _Requirements: 8.2, 8.3_
  - [x] 6.2 Write `AnimationService`: implement `respectsReducedMotion()` using `window.matchMedia`; implement `transition(element, cssClass, duration, callback)` that skips to callback immediately if reduced motion is active
    - _Requirements: 7.2, 9.11_
  - [x] 6.3 Write unit tests for `AccessibilityService`: focus trap contains Tab within container; `releaseFocus` restores prior focused element; `announce` writes to correct live region
    - _Requirements: 8.2_
  - [x] 6.4 Write unit test for `AnimationService`: when `prefers-reduced-motion: reduce` is mocked, `transition()` invokes callback synchronously
    - _Requirements: 9.11_


- [x] 7. Implement `LandingController`
  - [x] 7.1 Write `LandingController.init()`: attach click listener to "Enter the Studio" button; write `enter()` that adds `.landing--exiting` CSS class, uses `AnimationService.transition()` for 600ms dissolve, then sets `#landing` to `display: none`, reveals `#studio`, and updates `AppState.screen` to `'studio'`
    - Use `prefers-reduced-motion` path via `AnimationService.respectsReducedMotion()` for immediate cut
    - _Requirements: 9.6, 9.7, 9.11_
  - [x] 7.2 Write unit tests for `LandingController`: clicking CTA hides landing and shows studio; reduced-motion mock causes immediate transition; landing section hidden after enter()
    - _Requirements: 9.6, 9.7, 9.11_

- [x] 8. Checkpoint — verify scaffold, data, services, and landing are wired correctly
  - All tests pass individually. Scaffold, data constants, services (AccessibilityService, AnimationService, StorageService), and LandingController are wired correctly.


- [x] 9. Implement `StageController` — session mode selection and UI
  - [x] 9.1 Build `#stage` HTML: mode-selection grid (5 radio-style `<button>` cards), phase breakdown preview panel, session header (displays active Goal name), start/pause/resume/stop controls, phase indicator bar, curveball overlay (`<dialog>` or `role="dialog"` div), pause overlay, and session summary panel
    - _Requirements: 1.1, 1.2, 1.4, 2.5, 3.2, 5.6_
  - [x] 9.2 Implement `StageController.selectMode(modeId)`: update `AppState.session.mode`, render phase breakdown preview, enable Start button; if Free Mode, hide phase indicator
    - _Requirements: 1.2, 1.3, 1.4, 2.3_
  - [x] 9.3 Write unit tests for mode selection: all 5 modes selectable; phase breakdown shown after selection; start button disabled without selection; Free Mode hides phase indicator
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 9.4 Write property test for mode → non-empty phases
    - **Property 1: Mode selection always produces a non-empty phase breakdown**
    - **Validates: Requirements 1.2, 2.2**
    - Use `fc.constantFrom(...SESSION_MODES.filter(m => !m.isFreeMode))`; assert `phases.length >= 1` and phases are contiguous (each `phases[i].endPercent === phases[i+1].startPercent`)


- [x] 10. Implement `StageController` — timer engine and phase tracking
  - [x] 10.1 Implement `getCurrentPhase(elapsed, mode)` pure function: iterate mode's phases array and return the phase whose `[startPercent, endPercent)` interval contains `elapsed / totalDuration`
    - _Requirements: 2.2, 2.3_
  - [x] 10.2 Implement `startSession()`: validate mode selected (return + show prompt if not); set `AppState.session.status = 'running'`; start `setInterval` calling `tick()` every 1000ms; initialize `elapsed = 0`, `phasesCompleted = []`, `curveballsShown = []`; schedule first curveball at 20–60% of duration
    - Use `performance.now()` delta for accurate tick timing under browser throttling
    - _Requirements: 1.4, 2.1, 3.1_
  - [x] 10.3 Implement `tick()`: increment elapsed using `performance.now()` delta; update timer display; call `renderPhaseIndicator()`; check if phase transition occurred and call `AccessibilityService.announce()` for phase change; check curveball schedule and call `triggerCurveball()` if due; call `endSession()` when remaining = 0
    - Timer tick must NOT call `AccessibilityService.announce()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.3_
  - [x] 10.4 Implement `pauseSession()` and `resumeSession()`: `pauseSession` clears interval, sets status to `'paused'`, shows pause overlay with practical speaking advice; `resumeSession` restarts interval from current elapsed
    - _Requirements: 2.5_
  - [x] 10.5 Write property test for phase indicator mapping
    - **Property 2: Phase indicator maps elapsed time correctly**
    - **Validates: Requirements 2.2, 2.3**
    - Use mode × `fc.integer({ min: 0 })` (modulo duration); assert `getCurrentPhase` returns phase with `startPercent <= ratio < endPercent`


- [x] 11. Implement `StageController` — curveball engine and session summary
  - [x] 11.1 Implement `triggerCurveball()`: select a curveball ID not in `AppState.session.curveballsShown` (reset pool if exhausted); pause timer; show curveball overlay with prompt and advice; call `AccessibilityService.announce()` on assertive live region; call `AccessibilityService.trapFocus(overlay)`; push ID to `curveballsShown`
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 8.2_
  - [x] 11.2 Implement `dismissCurveball()`: hide overlay; call `AccessibilityService.releaseFocus()`; resume timer; schedule next curveball at 15–40% of remaining time
    - _Requirements: 3.4_
  - [x] 11.3 Implement `endSession()`: clear interval; set status `'completed'`; compute uncompleted phases (phases whose `startPercent > elapsed/totalDuration`); call `renderSummary()`
    - _Requirements: 2.4, 2.6_
  - [x] 11.4 Implement `renderSummary()`: display completion state, elapsed time, phases completed, and uncompleted phases list
    - _Requirements: 2.4, 2.6_
  - [x] 11.5 Write property test for session summary containing uncompleted phases
    - **Property 3: Session summary always contains uncompleted phases**
    - **Validates: Requirements 2.6**
    - Use mode × `fc.integer({ min: 0, max: durationSeconds })`; assert summary includes exactly phases with `startPercent > elapsed/totalDuration`
  - [x] 11.6 Write property test for curveball no-repetition within session
    - **Property 5: Curveball selection never repeats within a session**
    - **Validates: Requirements 3.6**
    - Use `fc.integer({ min: 1, max: CURVEBALL_POOL.length })`; simulate N selections; assert all selected IDs are unique
  - [x] 11.7 Write property test for curveball advice non-empty
    - **Property 4: Curveball pool provides unique advice per prompt**
    - **Validates: Requirements 3.3**
    - Use `fc.constantFrom(...CURVEBALL_POOL)`; assert `prompt.length > 0 && advice.length > 0`
  - [x] 11.8 Write unit tests for timer: countdown accuracy with mocked `performance.now`; pause/resume state; Free Mode count-up; end-session triggers summary; curveball overlay focus management


- [x] 12. Implement `LibraryController`
  - [x] 12.1 Build `#library` HTML: catalog grid of lesson cards (title, category badge, source reference), search `<input>`, personal notes section with "Add Note" form, and lesson detail panel (initially hidden)
    - Include Library module header with line-art/SVG illustration
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 7.6_
  - [x] 12.2 Implement `LibraryController.init()`, `renderCatalog(query)` (renders all lessons from `LESSON_CATALOG` plus `AppState.notes`), `openLesson(lessonId)` (renders detail panel with title, sourceReference, keyTakeaways, actionableTechniques), and `closeLesson()`
    - `openLesson` calls `AccessibilityService.trapFocus` on the detail panel
    - _Requirements: 4.1, 4.2_
  - [x] 12.3 Implement `search(query)`: debounced 300ms input handler; case-insensitive substring match against `lesson.title + lesson.content`; call `renderCatalog(query)`; update `AppState.searchQuery`
    - _Requirements: 4.4_
  - [x] 12.4 Implement `addNote(text)`: create `Note` object with generated ID (`Date.now()` + random), save via `StorageService.saveNotes`, push to `AppState.notes`, re-render catalog
    - `loadNotes()` called on `init()` to restore persisted notes
    - _Requirements: 4.5, 4.6_
  - [x] 12.5 Write property test for search filter soundness and completeness
    - **Property 7: Search filter is complete and sound**
    - **Validates: Requirements 4.4**
    - Use `fc.string({ minLength: 1 })`; assert every returned lesson contains query (soundness) and every lesson containing query is returned (completeness)
  - [x] 12.6 Write property test for lesson detail render fields
    - **Property 6: Lesson detail render contains all required fields**
    - **Validates: Requirements 4.2**
    - Use `fc.constantFrom(...LESSON_CATALOG)`; assert rendered HTML contains title, sourceReference, and at least one keyTakeaway and one actionableTechnique
  - [x] 12.7 Write unit tests for Library: empty personal notes state; note persists across simulated reload; lesson detail panel keyboard-accessible; search filters within 300ms debounce


- [x] 13. Implement `NavigatorController`
  - [x] 13.1 Build `#navigator` HTML: goal selection grid (5 `<button>` cards, one active at a time), lesson-path ordered list, and goal-specific tips section
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 13.2 Implement `NavigatorController.init()`, `selectGoal(goalId)` (overwrites `AppState.activeGoal`, calls `renderGoalPath()` and `renderTips()`), `getActiveGoal()`, `renderGoalPath()`, and `renderTips()`
    - `selectGoal` must work without page reload; update Stage header goal name via DOM query
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_
  - [x] 13.3 Write property test for goal path and tips non-empty and distinct
    - **Property 9: Goal selection produces non-empty, goal-specific lesson path and tips**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Use two distinct `fc.constantFrom(...GOAL_IDS)` values; assert `lessonIds.length > 0`, `tips.length > 0`, and the two goals return different paths and tips
  - [x] 13.4 Write property test for exactly one active goal
    - **Property 10: Exactly one active goal at all times after selection**
    - **Validates: Requirements 5.5**
    - Use `fc.array(fc.constantFrom(...GOAL_IDS), { minLength: 1 })`; after each selection assert `AppState.activeGoal === goalId` and no other goal is active
  - [x] 13.5 Write unit tests for Navigator: changing goal updates lesson path without reload; goal-specific tips differ from general Library; all 5 goals enumerated; only one goal active at a time


- [x] 14. Implement `ArchetypesController`
  - [x] 14.1 Build `#archetypes` HTML: grid of archetype cards (name, tagline, inline SVG illustration), archetype detail panel (initially hidden) with all required fields and "Practice with this style" button
    - Each card includes its `illustrationAsset` SVG; add `onerror` fallback placeholder
    - _Requirements: 6.1, 6.2, 6.3, 7.6_
  - [x] 14.2 Implement `ArchetypesController.init()`, `openArchetype(archetypeId)` (renders detail panel, calls `AccessibilityService.trapFocus`), `closeArchetype()` (releases focus), and `practiceWithStyle(archetypeId)` (calls `NavigatorController.selectGoal(archetype.mappedGoalId)`, navigates to `#stage`)
    - _Requirements: 6.2, 6.4, 6.5_
  - [x] 14.3 Write property test for archetype detail required fields
    - **Property 11: Archetype detail contains all required fields and practice action**
    - **Validates: Requirements 6.2, 6.4**
    - Use `fc.constantFrom(...ARCHETYPES)`; assert rendered detail includes styleDescription, signatureTechniques (≥1), strengths (≥1), idealContexts (≥1), exampleExcerpt, and "Practice with this style" element
  - [x] 14.4 Write property test for practice-with-style sets a valid goal
    - **Property 12: Practice with style sets a valid active goal**
    - **Validates: Requirements 6.5**
    - Use `fc.constantFrom(...ARCHETYPES)`; call `practiceWithStyle(id)`; assert `AppState.activeGoal === archetype.mappedGoalId` and that goal ID exists in `GOALS`
  - [x] 14.5 Write unit tests for Archetypes: ≥4 cards rendered; detail panel keyboard-accessible; "Practice with this style" navigates to Stage and sets Goal


- [x] 15. Checkpoint — all modules implemented; run full test suite
  - All tests pass individually. All four modules (Stage, Library, Navigator, Archetypes) fully implemented with controllers, HTML, CSS, and tests.

- [x] 16. Wire all controllers together and implement SPA navigation
  - [x] 16.1 Add `NavigatorController` initialization to the main `init()` entry point; wire nav tab click handlers to show/hide module sections and update `AppState.activeModule`; display active Goal name in Stage session header whenever `AppState.activeGoal` changes
    - _Requirements: 5.4, 5.6, 7.5_
  - [x] 16.2 Connect `ArchetypesController.practiceWithStyle()` to `NavigatorController.selectGoal()` and Stage navigation; verify `AppState.activeGoal` flows into Stage header rendering
    - _Requirements: 6.4, 6.5_
  - [x] 16.3 Call all controller `init()` functions in dependency order inside a `DOMContentLoaded` listener; confirm `StorageService.loadNotes()` is called before `LibraryController.renderCatalog()`
    - _Requirements: 4.5, 4.6_
  - [x] 16.4 Write integration tests: navigate from Archetypes → "Practice with this style" → Stage shows correct Goal name; Library notes persist and display after simulated reload; full Tab order through all interactive controls


- [x] 17. Accessibility hardening pass
  - [x] 17.1 Audit and add semantic HTML: verify all `<h1>`–`<h6>` heading hierarchy, landmark regions (`<main>`, `<nav>`, `<section aria-labelledby>`), and list markup (`<ul>/<li>`) for lesson catalogs, lesson paths, and archetype grids
    - _Requirements: 8.5_
  - [x] 17.2 Add visible focus indicator styles: 3px solid `--color-focus-ring` outline with 2px offset on all `<button>`, `<input>`, `[role="tab"]`, and card elements; verify each meets WCAG 2.1 AA contrast
    - _Requirements: 8.4_
  - [x] 17.3 Audit keyboard Tab order across all four modules; ensure all interactive controls (mode selector buttons, lesson cards, archetype cards, goal buttons, search input, note form) are reachable and activatable via Tab + Enter
    - _Requirements: 8.1_
  - [x] 17.4 Write accessibility tests: focus trap in curveball overlay; ARIA live region announces curveball text; timer tick does NOT write to live region; focus indicator meets contrast; keyboard Tab sequence is logical in each module
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 18. Final checkpoint — all tests pass and app is fully integrated
  - All tests pass individually. The app is a fully functional single-file SPA with all controllers wired, accessibility hardening complete, and integration verified.


## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery
- Each task references specific requirements for traceability
- All 12 correctness properties from the design are covered by property-based tests in tasks 9.4, 10.5, 11.5–11.7, 12.5–12.6, 13.3–13.4, and 14.3–14.4
- Property tests use `fc.assert(fc.property(...), { numRuns: 100 })` with Vitest + fast-check
- The entire app ships as a single `index.html` — no build step required; test files can be co-located `.test.js` modules run with `vitest --run`
- Run tests with: `npx vitest --run` (single execution, no watch mode)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.2"] },
    { "id": 2, "tasks": ["2.3", "3.3", "4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 3, "tasks": ["5.1", "5.2"] },
    { "id": 4, "tasks": ["5.3", "5.4", "6.1", "6.2"] },
    { "id": 5, "tasks": ["6.3", "6.4", "7.1"] },
    { "id": 6, "tasks": ["7.2", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] },
    { "id": 8, "tasks": ["9.3", "9.4", "10.2", "10.3", "10.4"] },
    { "id": 9, "tasks": ["10.5", "11.1", "11.2", "11.3", "11.4"] },
    { "id": 10, "tasks": ["11.5", "11.6", "11.7", "11.8", "12.1"] },
    { "id": 11, "tasks": ["12.2", "12.3", "12.4"] },
    { "id": 12, "tasks": ["12.5", "12.6", "12.7", "13.1"] },
    { "id": 13, "tasks": ["13.2"] },
    { "id": 14, "tasks": ["13.3", "13.4", "13.5", "14.1"] },
    { "id": 15, "tasks": ["14.2"] },
    { "id": 16, "tasks": ["14.3", "14.4", "14.5", "16.1"] },
    { "id": 17, "tasks": ["16.2", "16.3"] },
    { "id": 18, "tasks": ["16.4", "17.1", "17.2", "17.3"] },
    { "id": 19, "tasks": ["17.4"] }
  ]
}
```
