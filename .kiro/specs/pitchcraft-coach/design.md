# Design Document

## PitchCraft & Eloquence Studio

---

## Overview

PitchCraft & Eloquence Studio is a single-page web application (SPA) built entirely in the browser — no backend, no server-side rendering, no build step required for deployment. It ships as a self-contained `index.html` with inlined or co-located CSS and JavaScript, making it trivially hostable on any static host (GitHub Pages, Netlify, S3).

The app presents a **two-tier visual identity**:

- **Landing Screen** — full-viewport, cinematic, oil-painting aesthetic with deep ochres and umber tones. This is the "grand entrance" that commands immediate prestige.
- **Studio Interior** — a calmer, nature-inspired environment with nature elemnts blended into the design (sage green, warm earth, slate, cream) across all four practice modules: Interactive Stage, Library of Eloquence, Personalized Goal Navigator, and Communicator Archetypes.

The architecture is deliberately minimal: vanilla JavaScript (ES2020+) with no external runtime dependencies. State lives in a single in-memory application state object, and personal notes are persisted to `localStorage`. The UI is composed of a set of semantic HTML sections that are shown/hidden via CSS class toggling, achieving SPA navigation without a router library or page reloads.

---

## Architecture

### High-Level Structure

```
index.html
├── <style>          — All CSS (custom properties, layout, animations, themes)
└── <body>
    ├── #landing      — Landing Screen (shown on first load)
    └── #studio       — Studio interior (hidden until "Enter the Studio")
        ├── #nav      — Module navigation tabs
        ├── #stage    — Interactive Stage module
        ├── #library  — Library of Eloquence module
        ├── #navigator — Personalized Goal Navigator module
        └── #archetypes — Communicator Archetypes module
    └── <script>      — Application JavaScript (single inline module)
```

### Module Boundaries

Each module is a self-contained section of the DOM. JavaScript is organized into a set of namespaced objects (plain JS objects — no class hierarchies):

- `AppState` — singleton state store
- `LandingController` — landing screen transition logic
- `StageController` — timer, phase engine, curveball engine
- `LibraryController` — lesson catalog, search, personal notes
- `NavigatorController` — goal selection, lesson path rendering
- `ArchetypesController` — archetype cards, practice launch
- `StorageService` — `localStorage` abstraction
- `AccessibilityService` — focus management, ARIA live region updates
- `AnimationService` — CSS class-based transitions with `prefers-reduced-motion` awareness

### Data Flow

```
User interaction
      │
      ▼
Controller (reads/writes AppState)
      │
      ├── writes to StorageService (personal notes only)
      │
      └── calls render() → DOM mutation
```

State is never derived from the DOM. DOM is always a pure render of `AppState`. This keeps the system predictable and testable — every controller function is a pure transformation of `AppState → DOM`.

### SPA Navigation

Modules are navigated by toggling a `data-active` attribute on `#studio` and `aria-selected` on nav tabs. No `pushState` or hash routing is used — the app has no URL-based deep linking. Transitions between modules use CSS `opacity` + `transform` with a 250ms ease.

---

## Components and Interfaces

### 1. LandingController

**Responsibilities:** Render landing screen; handle "Enter the Studio" activation; trigger transition.

```javascript
LandingController = {
  init(),              // attach event listeners
  enter()              // triggers transition → studio
}
```

**Transition logic:** Adds `.landing--exiting` CSS class to `#landing` (triggers fade/dissolve animation, 400–800ms). On `animationend`, sets `#landing` to `display: none` and reveals `#studio`. If `prefers-reduced-motion: reduce`, skips animation and cuts immediately.

---

### 2. StageController

**Responsibilities:** Session mode selection, timer countdown, phase engine, curveball engine, pause/resume, session summary.

```javascript
StageController = {
  init(),
  selectMode(modeId),         // updates AppState.session.mode
  startSession(),             // validates mode selected, begins timer
  pauseSession(),             // stops tick interval, shows pause overlay
  resumeSession(),            // restarts tick interval
  endSession(),               // clears interval, renders summary
  triggerCurveball(),         // selects prompt, pauses timer, shows overlay
  dismissCurveball(),         // hides overlay, resumes timer
  tick(),                     // called every 1000ms; updates timer, checks phase, schedules curveball
  getCurrentPhase(elapsed, mode),  // pure function: returns phase for given elapsed time
  renderPhaseIndicator(),
  renderSummary()
}
```

**Timer implementation:** Uses `setInterval` with 1-second granularity. For countdown modes, `remaining = totalDuration - elapsed`. For Free Mode, `elapsed` counts upward with no end.

**Phase engine:** Each mode definition contains an ordered array of `Phase` objects with `{ name, startPercent, endPercent }`. `getCurrentPhase(elapsed, mode)` is a pure function that maps elapsed time to the active phase by comparing `elapsed / totalDuration` against phase boundaries.

**Curveball scheduler:** On session start, a random offset between 20% and 60% of session duration is chosen as the first curveball trigger time. After each curveball is dismissed, a new random offset (15%–40% of remaining time) is scheduled. This guarantees at least one curveball per non-Free-Mode session.

---

### 3. LibraryController

**Responsibilities:** Render lesson catalog, search filtering, personal note CRUD, lesson detail view.

```javascript
LibraryController = {
  init(),
  renderCatalog(query),       // renders filtered lesson list
  openLesson(lessonId),       // renders lesson detail panel
  closeLesson(),
  search(query),              // debounced 300ms; calls renderCatalog
  addNote(text),              // persists via StorageService, re-renders
  loadNotes()                 // reads from StorageService on init
}
```

**Search:** Debounced input handler. Filtering logic: case-insensitive substring match against `lesson.title + lesson.content`. All matching happens in-memory on the static lesson array.

---

### 4. NavigatorController

**Responsibilities:** Goal selection, lesson path rendering, goal-specific tips, integration with StageController header.

```javascript
NavigatorController = {
  init(),
  selectGoal(goalId),         // updates AppState.activeGoal, re-renders
  renderGoalPath(),
  renderTips(),
  getActiveGoal()             // returns AppState.activeGoal or null
}
```

**Single-goal invariant:** `AppState.activeGoal` is a single string ID or `null`. `selectGoal` always overwrites it.

---

### 5. ArchetypesController

**Responsibilities:** Render archetype card grid, archetype detail panel, "Practice with this style" action.

```javascript
ArchetypesController = {
  init(),
  openArchetype(archetypeId),
  closeArchetype(),
  practiceWithStyle(archetypeId)  // sets goal via NavigatorController, navigates to Stage
}
```

**Goal mapping:** Each archetype definition includes a `mappedGoalId` field that `practiceWithStyle` passes to `NavigatorController.selectGoal`.

---

### 6. StorageService

```javascript
StorageService = {
  saveNotes(notes),     // JSON.stringify → localStorage['pitchcraft_notes']
  loadNotes(),          // JSON.parse ← localStorage; returns [] on missing/corrupt
  clearNotes()
}
```

All reads are wrapped in try/catch. `loadNotes()` never throws — returns `[]` on any error (cleared storage, JSON parse failure, storage unavailable).

---

### 7. AccessibilityService

```javascript
AccessibilityService = {
  announce(text, politeness),  // writes to ARIA live region
  moveFocusTo(element),        // element.focus() with fallback
  trapFocus(container),        // for overlays: curveball, pause, lesson detail
  releaseFocus()               // restores prior focus anchor
}
```

ARIA live regions: two hidden `<div>` elements in the DOM — one `aria-live="polite"` (phase transitions) and one `aria-live="assertive"` (curveball). Timer ticks do NOT write to any live region.

---

### 8. AnimationService

```javascript
AnimationService = {
  transition(element, cssClass, duration, callback),
  respectsReducedMotion()   // returns true if prefers-reduced-motion: reduce
}
```

All animations check `respectsReducedMotion()` first. If `true`, class toggles happen synchronously with no transition delay.

---

## Data Models

### SessionMode

```javascript
{
  id: string,              // e.g. "elevator-60", "startup-5m", "free"
  label: string,           // e.g. "60-Second Elevator Pitch"
  durationSeconds: number, // 0 for Free Mode
  isFreeMode: boolean,
  phases: Phase[]
}
```

### Phase

```javascript
{
  name: string,           // e.g. "Introduction", "Problem", "Solution", "Call to Action"
  startPercent: number,   // 0.0–1.0
  endPercent: number      // 0.0–1.0
}
```

**Session mode phase definitions:**

| Mode | Duration | Phases |
|------|----------|--------|
| Elevator (60s) | 60s | Hook (0–25%), Problem (25–50%), Solution (50–75%), CTA (75–100%) |
| Startup Demo (5m) | 300s | Intro (0–15%), Problem (15–35%), Solution (35–60%), Demo (60–80%), CTA (80–100%) |
| Presentation (15m) | 900s | Intro (0–10%), Context (10–25%), Core 1 (25–45%), Core 2 (45–65%), Synthesis (65–85%), Close (85–100%) |
| Deep-Dive (30m) | 1800s | Intro (0–8%), Background (8–20%), Analysis 1 (20–35%), Analysis 2 (35–50%), Analysis 3 (50–65%), Synthesis (65–80%), Q&A Prep (80–92%), Close (92–100%) |
| Free Mode | ∞ | [] |

---

### AppState

```javascript
AppState = {
  screen: 'landing' | 'studio',
  activeModule: 'stage' | 'library' | 'navigator' | 'archetypes',
  session: {
    mode: SessionMode | null,
    status: 'idle' | 'running' | 'paused' | 'completed',
    elapsed: number,           // seconds
    phasesCompleted: string[], // phase names completed this session
    curveballsShown: string[]  // curveball IDs shown this session
  },
  activeGoal: string | null,    // Goal ID
  openLessonId: string | null,
  openArchetypeId: string | null,
  notes: Note[],
  searchQuery: string
}
```

---

### Lesson

```javascript
{
  id: string,
  category: 'ted-talk' | 'book-summary' | 'psychology' | 'personal-note',
  title: string,
  sourceReference: string,     // e.g. "TED Talk: Simon Sinek, 2009"
  keyTakeaways: string[],      // min 3 items
  actionableTechniques: string[], // min 2 items
  content: string,             // full body text for search and display
  isUserNote: boolean
}
```

---

### Note (user-generated)

```javascript
{
  id: string,          // uuid-style, generated client-side (Date.now + random)
  title: string,
  content: string,
  createdAt: string    // ISO 8601
}
```

---

### Goal

```javascript
{
  id: 'funding-pitch' | 'technical-explanation' | 'casual-networking' | 'inspirational-talk' | 'job-interview',
  label: string,
  description: string,
  lessonIds: string[],    // ordered lesson IDs from the Library
  tips: string[]          // min 3 goal-specific tips
}
```

---

### Archetype

```javascript
{
  id: string,
  name: string,                  // e.g. "The Visionary"
  tagline: string,
  styleDescription: string,
  signatureTechniques: string[],
  strengths: string[],
  idealContexts: string[],
  exampleExcerpt: string,
  illustrationAsset: string,     // SVG inline string or path to line-art asset
  mappedGoalId: string           // Goal ID for "Practice with this style"
}
```

---

### Curveball

```javascript
{
  id: string,
  category: 'skepticism' | 'clarification' | 'pivot' | 'personal-challenge',
  prompt: string,
  advice: string    // one practical tip for responding
}
```

**Pool size:** Minimum 20 curveballs at launch, distributed across 4 categories (minimum 4 per category).

---

## Visual Design System

### Color Tokens

```css
/* Landing Screen Palette */
--color-landing-bg:        #1a1208;  /* near-black warm */
--color-landing-primary:   #b8860b;  /* dark ochre */
--color-landing-secondary: #8b4513;  /* burnt sienna */
--color-landing-accent:    #5c3317;  /* raw umber */
--color-landing-text:      #f5e6c8;  /* aged cream */
--color-landing-cta-bg:    #c8922a;  /* warm gold */
--color-landing-cta-text:  #1a1208;

/* Studio Interior Palette */
--color-studio-bg:         #f7f3ed;  /* cream */
--color-studio-surface:    #eee8df;  /* warm off-white */
--color-studio-primary:    #4a7c59;  /* sage green */
--color-studio-secondary:  #8b7355;  /* warm earth */
--color-studio-accent:     #5c6b7a;  /* slate */
--color-studio-text:       #2c2416;  /* near-black warm */
--color-studio-muted:      #8b7355;  /* earth tone for secondary text */
--color-studio-border:     #d4c9b8;  /* light sand */

/* Semantic */
--color-focus-ring:        #4a7c59;  /* sage, 3px solid */
--color-phase-active:      #4a7c59;
--color-phase-inactive:    #d4c9b8;
--color-curveball-bg:      #2c2416;
--color-curveball-text:    #f5e6c8;
```

### Typography

```css
/* Serif — headings, wordmark, lesson titles */
font-family: 'Playfair Display', 'Georgia', serif;

/* Sans-serif — body copy, labels, tips */
font-family: 'Inter', 'Helvetica Neue', system-ui, sans-serif;
```

Both loaded via Google Fonts with `font-display: swap`. Fallback stack ensures no FOUT blocks rendering.

**Type scale (interior):**
- `--text-xs: 0.75rem`
- `--text-sm: 0.875rem`
- `--text-base: 1rem`
- `--text-lg: 1.125rem`
- `--text-xl: 1.25rem`
- `--text-2xl: 1.5rem`
- `--text-3xl: 2rem`

**Landing wordmark:** `clamp(3rem, 8vw, 7rem)` — ensures minimum 2.5× the subtitle size at ≥1024px.

### Spacing and Layout

- Base unit: `0.5rem` (8px)
- Container max-width: `72rem` (1152px), centered with auto margins
- Module padding: `2rem` on desktop, `1rem` on mobile (≤768px)
- Responsive grid: CSS Grid with `minmax(0, 1fr)` columns; falls back to single column at 375px

### Animation Tokens

```css
--transition-fast:   150ms ease;
--transition-base:   250ms ease;
--transition-slow:   400ms ease;
--transition-landing: 600ms cubic-bezier(0.4, 0, 0.2, 1);
```

All `transition` declarations reference these tokens. `@media (prefers-reduced-motion: reduce)` sets all to `0ms`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mode selection always produces a non-empty phase breakdown

*For any* session mode that is not Free Mode, selecting that mode should result in a phase breakdown array with at least one phase, and the phases should be contiguous (no gaps between `startPercent` and the next `endPercent`).

**Validates: Requirements 1.2, 2.2**

---

### Property 2: Phase indicator maps elapsed time correctly

*For any* non-Free-Mode session mode and any elapsed time value between 0 and the mode's total duration, `getCurrentPhase(elapsed, mode)` should return exactly one phase whose `[startPercent, endPercent)` interval contains `elapsed / totalDuration`.

**Validates: Requirements 2.2, 2.3**

---

### Property 3: Session summary always contains uncompleted phases

*For any* non-Free-Mode session where the timer reaches zero at elapsed time T, and where the set of phases not fully traversed is non-empty, the session summary data should contain exactly those phase names that had a `startPercent > T / totalDuration`.

**Validates: Requirements 2.6**

---

### Property 4: Curveball pool provides unique advice per prompt

*For any* curveball in the pool, the curveball object should have a non-empty `prompt` field and a non-empty `advice` field.

**Validates: Requirements 3.3**

---

### Property 5: Curveball selection never repeats within a session

*For any* sequence of N curveball selections within a single session (where N ≤ pool size), all selected curveball IDs should be unique — no ID appears more than once.

**Validates: Requirements 3.6**

---

### Property 6: Lesson detail render contains all required fields

*For any* lesson object in the catalog (including user notes), rendering its detail view should produce output that contains the lesson's title, source reference, at least one key takeaway, and at least one actionable technique.

**Validates: Requirements 4.2**

---

### Property 7: Search filter is complete and sound

*For any* search query string Q (non-empty), the filter function should satisfy two conditions simultaneously:
1. **Soundness**: every lesson returned contains Q (case-insensitive) in its title or content.
2. **Completeness**: every lesson that contains Q (case-insensitive) in its title or content is returned.

**Validates: Requirements 4.4**

---

### Property 8: Personal note storage round-trip

*For any* note with a non-empty title and content, saving it via `StorageService.saveNotes` and then loading via `StorageService.loadNotes` should return a collection containing an object with equivalent `title`, `content`, and `createdAt` values.

**Validates: Requirements 4.5**

---

### Property 9: Goal selection produces non-empty, goal-specific lesson path and tips

*For any* valid goal ID, calling `selectGoal(goalId)` should result in `AppState`'s active goal being that ID, the lesson path being non-empty, and the tips array being non-empty. Furthermore, for any two distinct goal IDs, their lesson paths and tips arrays should differ.

**Validates: Requirements 5.2, 5.3, 5.4**

---

### Property 10: Exactly one active goal at all times after selection

*For any* sequence of goal selections (each a valid goal ID), after each selection the count of "active" goals should be exactly 1, and it should be the most recently selected goal ID.

**Validates: Requirements 5.5**

---

### Property 11: Archetype detail contains all required fields and practice action

*For any* archetype in the catalog, rendering its detail view should include: style description, signature techniques (at least one), strengths (at least one), ideal contexts (at least one), an example excerpt, and a "Practice with this style" action element.

**Validates: Requirements 6.2, 6.4**

---

### Property 12: Practice with style sets a valid active goal

*For any* archetype, calling `practiceWithStyle(archetypeId)` should result in `AppState.activeGoal` being set to the archetype's `mappedGoalId`, which must be a valid goal ID in the Goals dataset.

**Validates: Requirements 6.5**

---

## Error Handling

### localStorage Unavailability

`StorageService` wraps all reads and writes in `try/catch`. If `localStorage` is unavailable (private browsing, quota exceeded, security policy), the app continues in memory-only mode. Notes will not persist across sessions, but no error is displayed. A subtle banner ("Note: changes won't be saved in this session") may appear optionally.

### Corrupted Storage Data

`StorageService.loadNotes()` returns `[]` on JSON parse failure. The notes section renders an empty state ("No personal notes yet. Add your first note below.") with no error messaging.

### Curveball Pool Exhaustion

If all curveballs in the pool have been shown in the current session and a new curveball is scheduled, the session logic resets `AppState.session.curveballsShown` to `[]` and selects from the full pool again. This prevents infinite loops on very long sessions.

### Timer Edge Cases

- If `startSession()` is called without a mode selected, it returns early and displays the mode-selection prompt (requirement 1.4).
- If the browser tab is backgrounded and throttled by the browser, `tick()` may be called less frequently. The timer uses `performance.now()` deltas rather than assuming 1000ms exactly per tick to remain accurate across throttling.

### Missing Archetype Illustration

If an archetype's `illustrationAsset` fails to load (broken path), a CSS-generated placeholder SVG silhouette is displayed instead. This is handled with an `onerror` handler on `<img>` elements or by inlining all SVGs directly.

---

## Testing Strategy

### Dual Testing Approach

This feature uses both **unit/example-based tests** and **property-based tests**. Together they provide comprehensive coverage: unit tests verify concrete scenarios and edge cases, while property tests verify universal invariants across a wide range of generated inputs.

### Test Framework

- **Test runner**: Vitest (zero-config, ESM-native, fast)
- **Property-based testing**: [fast-check](https://fast-check.dev/) — a mature TypeScript/JavaScript PBT library
- **DOM testing**: jsdom (provided by Vitest's `environment: 'jsdom'` config)

### Property-Based Test Configuration

Each property test uses `fc.assert(fc.property(...))` with a minimum of **100 iterations** (`numRuns: 100`). Each test is tagged with a comment referencing the design property:

```javascript
// Feature: pitchcraft-coach, Property 2: Phase indicator maps elapsed time correctly
fc.assert(
  fc.property(
    fc.constantFrom(...SESSION_MODES),
    fc.integer({ min: 0 }),
    (mode, elapsedRaw) => {
      const elapsed = elapsedRaw % mode.durationSeconds;
      const phase = getCurrentPhase(elapsed, mode);
      const ratio = elapsed / mode.durationSeconds;
      return phase.startPercent <= ratio && ratio < phase.endPercent;
    }
  ),
  { numRuns: 100 }
);
```

### Property Tests (from Correctness Properties)

| Property | Generator Strategy |
|----------|-------------------|
| P1: Mode → non-empty phases | `fc.constantFrom(...SESSION_MODES.filter(m => !m.isFreeMode))` |
| P2: Phase indicator mapping | Mode × integer elapsed time |
| P3: Summary contains uncompleted phases | Mode × integer elapsed ≤ duration |
| P4: Curveball advice non-empty | `fc.constantFrom(...CURVEBALL_POOL)` |
| P5: No curveball repetition | `fc.integer({ min: 1, max: POOL_SIZE })` selections from pool |
| P6: Lesson detail fields | `fc.constantFrom(...LESSON_CATALOG)` |
| P7: Search filter soundness + completeness | `fc.string()` query × lesson catalog |
| P8: Note storage round-trip | `fc.record({ title: fc.string(), content: fc.string() })` |
| P9: Goal path + tips non-empty and distinct | Two `fc.constantFrom(...GOAL_IDS)` drawn distinctly |
| P10: Single active goal | `fc.array(fc.constantFrom(...GOAL_IDS), { minLength: 1 })` |
| P11: Archetype detail fields | `fc.constantFrom(...ARCHETYPE_CATALOG)` |
| P12: Practice sets valid goal | `fc.constantFrom(...ARCHETYPE_CATALOG)` |

### Unit / Example-Based Tests

- Session mode enumeration (all 5 modes present)
- Free Mode: count-up timer, hidden phase indicator
- No-mode guard: start button disabled, prompt shown
- Timer countdown accuracy (mock `performance.now`)
- Pause/resume state transitions
- Curveball overlay: focus management, ARIA announcement
- Session completion state
- Personal notes: empty state when storage cleared
- Goal list enumeration (all 5 goals)
- Archetype count (≥ 4)
- Landing → studio transition (with and without `prefers-reduced-motion`)
- Viewport 375px: no horizontal overflow (JSDOM + ResizeObserver mock)

### Accessibility Tests

- Keyboard navigation order (Tab sequence through interactive elements)
- Focus trap in curveball overlay
- ARIA live region population on curveball trigger
- Timer tick does NOT write to live region
- Focus indicator contrast (computed style assertion)

### Manual / Visual QA

- Color palette correctness (landing vs. studio)
- Typeface rendering (Playfair Display + Inter loaded)
- Illustration presence on all Archetype Cards
- Responsive layout at 375px, 768px, 1024px, 1440px
- Painterly background visual quality
- Animation smoothness and `prefers-reduced-motion` override
