# Implementation Plan: Session History

## Overview

Implement persistent session history for PitchCraft & Eloquence Studio. All code is inline in `index.html` following the existing single-file architecture. The feature adds a `SessionHistoryService` object, a collapsible History Panel in the Stage section, and a torn-page Session Detail View modal. Tests use Vitest + fast-check with jsdom.

## Tasks

- [x] 1. Implement SessionHistoryService
  - [x] 1.1 Create the SessionHistoryService object with localStorage CRUD operations
    - Add the `SessionHistoryService` plain object in `index.html` (after `StorageService`)
    - Implement `_generateId()` using `Date.now()` + random suffix
    - Implement `_validate(record)` checking all required fields (id, timestamp, sessionMode, duration, phasesCompleted, curveballsFaced, transcript, aiFeedback)
    - Implement `_persist()` with try/catch for localStorage write failures
    - Implement `loadHistory()` that reads from `pitchcraft_history` key, handles malformed/missing data gracefully, returns sorted array (newest-first)
    - Implement `saveSession(data)` that validates, generates id, appends, trims to 50 max, persists
    - Implement `getAll()` and `getById(id)` accessors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4_

  - [x]* 1.2 Write property test: Save-then-load round trip
    - **Property 1: Save-then-load round trip**
    - Generate arbitrary valid session data, save via `saveSession()`, reload via `loadHistory()`, verify the record is present with matching fields
    - **Validates: Requirements 1.1, 1.2, 2.1**

  - [x]* 1.3 Write property test: Record cap enforcement
    - **Property 2: Record cap enforcement**
    - Generate sequences of >50 saves, verify `getAll()` returns at most 50 records (the most recent)
    - **Validates: Requirements 1.4, 6.1**

  - [x]* 1.4 Write property test: Descending sort invariant
    - **Property 3: Descending sort invariant**
    - Generate multiple saves with varying timestamps, verify loaded array is sorted newest-first
    - **Validates: Requirements 2.4, 3.4**

  - [x]* 1.5 Write property test: Invalid record rejection
    - **Property 4: Invalid record rejection**
    - Generate objects with randomly missing required fields, verify `saveSession()` returns null and stored history unchanged
    - **Validates: Requirements 6.3, 6.4**

  - [x]* 1.6 Write property test: Malformed data resilience
    - **Property 5: Malformed data resilience**
    - Generate arbitrary non-JSON or non-array strings, store at `pitchcraft_history`, verify `loadHistory()` returns empty array without error
    - **Validates: Requirements 2.2, 2.3**

  - [x]* 1.7 Write property test: Unique ID generation
    - **Property 6: Unique ID generation**
    - Generate pairs of identical inputs saved in sequence, verify distinct IDs
    - **Validates: Requirements 6.2**

  - [x]* 1.8 Write property test: Existing records preservation
    - **Property 7: Existing records preservation**
    - Generate initial arrays of K records (K < 50) + a new save, verify all originals preserved
    - **Validates: Requirements 1.4**

- [x] 2. Checkpoint - Verify SessionHistoryService
  - Skipped — Node.js not available in environment. Tests written but cannot be executed.

- [x] 3. Add History Panel UI (CSS + HTML + Controller)
  - [x] 3.1 Add CSS styles for the History Panel
    - Add styles for `.history-panel`, `.history-panel--open`, `.history-toggle-btn`, `.history-list`, `.history-item`, and empty state
    - Use existing CSS custom properties (--color-studio-surface, --color-studio-border, --color-studio-primary, --color-studio-text, --color-studio-muted)
    - Use --font-serif for headings, --font-sans for body text
    - Follow `nav__tab` styling patterns for the toggle button
    - Add `prefers-reduced-motion` media query to suppress slide animations
    - Add mobile styles (<768px) for full-width overlay
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 5.1, 5.2, 5.3, 5.5_

  - [x] 3.2 Add HTML markup for the History Panel inside the Stage section
    - Add toggle button in the stage header area with accessible label ("Open session history" / "Close session history")
    - Add collapsible panel container with session list (role="list") and empty state message
    - Add ARIA live region for panel state announcements
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 7.1, 7.2, 7.3_

  - [x] 3.3 Create HistoryPanelController to manage panel interactions
    - Implement toggle open/close with slide animation (using AnimationService patterns)
    - Implement session list rendering from `SessionHistoryService.getAll()`
    - Format date/time and duration for each list item
    - Update toggle button accessible label on state change
    - Announce panel state changes via ARIA live region
    - Extend `AppState.init()` to add `historyPanelOpen: false`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 7.1, 7.2_

- [x] 4. Add Session Detail View modal
  - [x] 4.1 Add CSS styles for the Session Detail View modal
    - Add styles for `.session-detail-modal`, overlay background, torn-page clip-path, close button
    - Follow curveball overlay styling pattern for torn-page aesthetic
    - Add `prefers-reduced-motion` support
    - _Requirements: 5.4, 5.5_

  - [x] 4.2 Add HTML markup for the Session Detail View modal
    - Add modal container with `role="dialog"` and `aria-modal="true"`
    - Add sections for: mode label, date/time, duration, phases completed, curveballs faced
    - Add Transcript section with placeholder message ("Transcript will be available with AI coaching integration")
    - Add AI Feedback section with placeholder message ("AI feedback will be available with AI coaching integration")
    - Add close button with accessible label "Close session details"
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.4, 7.5_

  - [x] 4.3 Implement Session Detail View controller logic
    - Implement open modal with record data population
    - Implement close via button click and Escape key
    - Implement focus trapping using `AccessibilityService.trapFocus()` pattern
    - Release focus and return to prior focused element on close
    - Wire click handler on history list items to open detail view
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 7.4, 7.5, 7.6_

- [x] 5. Integrate with existing StageController
  - [x] 5.1 Extend StageController.endSession() to save session history
    - After session status is set to 'completed' and phases are computed, call `SessionHistoryService.saveSession()` with mode, elapsed, phasesCompleted, and curveballsShown
    - Ensure the call is wrapped in try/catch to avoid breaking existing flow
    - _Requirements: 1.1, 1.3_

  - [x] 5.2 Initialize SessionHistoryService and HistoryPanelController in DOMContentLoaded
    - Call `SessionHistoryService.loadHistory()` during app initialization
    - Initialize HistoryPanelController and render initial panel state
    - _Requirements: 2.1_

- [x] 6. Checkpoint - Full integration verification
  - Skipped — Node.js not available in environment. Manual browser testing recommended.

- [x]* 7. Write unit and integration tests
  - [x]* 7.1 Write unit tests for SessionHistoryService
    - Test saveSession with valid data returns a proper SessionRecord
    - Test loadHistory with empty localStorage returns []
    - Test loadHistory with malformed JSON returns []
    - Test record cap at 50
    - Test getById returns correct record
    - Test getById with unknown id returns null
    - File: `tests/session-history.test.js`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 6.1, 6.2, 6.3_

  - [x]* 7.2 Write unit tests for History Panel UI
    - Test toggle button opens/closes panel
    - Test panel renders session list items correctly
    - Test empty state message when no history
    - Test accessible labels update on toggle
    - Test reduced-motion suppresses animation classes
    - File: `tests/session-history.test.js`
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 5.5, 7.1_

  - [x]* 7.3 Write unit tests for Session Detail View
    - Test modal opens with correct record data
    - Test placeholder messages for null transcript/aiFeedback
    - Test close button dismisses modal
    - Test Escape key dismisses modal
    - Test focus trap activation and release
    - File: `tests/session-history.test.js`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 7.4, 7.5, 7.6_

  - [x]* 7.4 Write integration test for end-to-end session history flow
    - Test: start session → end session → record appears in History Panel → click item → detail view shows correct data → close modal
    - Test keyboard navigation through panel and modal
    - File: `tests/session-history-integration.test.js`
    - _Requirements: 1.1, 3.3, 4.1, 4.2, 7.6_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Tests written and ready to run when Node.js is available.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code goes inline in `index.html` following the existing single-file architecture
- Property tests go in `tests/session-history.property.test.js`
- Unit tests go in `tests/session-history.test.js`
- Integration tests go in `tests/session-history-integration.test.js`
- The existing `StorageService` pattern is the template for `SessionHistoryService`
- Checkpoints ensure incremental validation between service logic and UI work

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"] },
    { "id": 2, "tasks": ["3.1", "4.1"] },
    { "id": 3, "tasks": ["3.2", "4.2"] },
    { "id": 4, "tasks": ["3.3", "4.3", "5.1"] },
    { "id": 5, "tasks": ["5.2"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3", "7.4"] }
  ]
}
```
