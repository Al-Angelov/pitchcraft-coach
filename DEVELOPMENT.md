# Development Guide

## Prerequisites

- Node.js (LTS recommended)
- npm (comes with Node.js)
- Modern browser (Chrome, Firefox, Edge) for manual testing

---

## Setup

```bash
npm install
```

This installs dev dependencies only (Vitest, fast-check, jsdom). There are no production dependencies — the app is a single `index.html` file.

---

## Running the App

Open `index.html` directly in a browser. No dev server required.

For a local server (optional, for features requiring HTTPS like microphone):
```bash
npx serve .
```

---

## Testing

### Run All Tests

```bash
npm test
```

This executes `vitest --run` (single run, no watch mode).

### Run Specific Test File

```bash
npx vitest --run tests/session-history.test.js
```

### Run Tests Matching a Pattern

```bash
npx vitest --run --testNamePattern "curveball"
```

### Watch Mode (development)

```bash
npx vitest
```

### Coverage Report

```bash
npx vitest --run --coverage
```

### Windows Shortcut

```bash
run-tests.cmd
```

---

## Test Architecture

### Dual Testing Strategy

The project uses two complementary testing approaches:

1. **Example-Based Tests** (`*.test.js`) — Concrete scenarios, edge cases, integration flows
2. **Property-Based Tests** (`*.property.test.js`) — Universal invariants verified across generated inputs using fast-check

### Test Environment

- **Runtime:** Vitest with `globals: true`
- **DOM:** jsdom (simulated browser environment)
- **HTML Loading:** Tests read `index.html` directly from disk and inject body content into jsdom
- **Mocking:** Vitest `vi.fn()` / `vi.spyOn()` for APIs (localStorage, MediaRecorder, fetch, navigator.mediaDevices)

### Test File Conventions

```javascript
// Standard imports
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load HTML fixture
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// Extract body content (strips <script> tags)
function getBodyContent(fullHtml) { /* ... */ }
```

### Property-Based Test Pattern

```javascript
import { fc } from 'fast-check';

// Feature: <feature-name>, Property N: <description>
fc.assert(
  fc.property(
    fc.constantFrom(...DATA_ARRAY),
    (item) => {
      // assertion that must hold for ALL generated inputs
      return item.field !== undefined;
    }
  ),
  { numRuns: 100 }
);
```

Each property test runs minimum 100 iterations and references the design document property it validates.

---

## Code Conventions

### JavaScript

- Plain objects, not classes (e.g., `const StageController = { ... }`)
- No `this` binding issues — arrow functions or direct references
- ES2020+ features: optional chaining, nullish coalescing, template literals
- No build step, no transpilation, no modules in production
- Comments reference requirement IDs from specs

### CSS

- BEM-like naming: `.block__element--modifier`
- All values via custom properties (`var(--color-studio-primary)`)
- Mobile-first responsive with `@media (max-width: ...)` overrides
- Animations always wrapped in `prefers-reduced-motion` check

### HTML

- Semantic elements: `<section>`, `<article>`, `<nav>`, `<header>`, `<main>`
- ARIA attributes: `role`, `aria-label`, `aria-selected`, `aria-expanded`, `aria-live`
- SVG illustrations inlined (no external image files)

---

## Adding a New Feature

### Recommended Workflow (Spec-Driven)

1. **Create a spec** in `.kiro/specs/<feature-name>/`
   - `requirements.md` — User-facing requirements
   - `design.md` — Architecture, interfaces, data models, correctness properties
   - `tasks.md` — Implementation task breakdown

2. **Implement** in `index.html`:
   - Add data models at the top of `<script>`
   - Add service objects after existing services
   - Add controller after existing controllers
   - Add CSS in the `<style>` section (grouped by module)
   - Add HTML in the appropriate `<section>`

3. **Test**:
   - Write property-based tests for correctness properties
   - Write example-based tests for concrete scenarios
   - Write integration tests for cross-module flows

4. **Update documentation**:
   - Add feature to `FEATURES.md`
   - Update `ARCHITECTURE.md` if new services/controllers added

### File Organization Within index.html

The single-file structure follows a strict ordering:

```
<style>
  1. CSS Custom Properties
  2. Layout (reset, container, grid, responsive)
  3. Landing Screen styles
  4. Studio Shell styles (header, tabs)
  5. Stage Module styles
  6. History Panel styles
  7. Session Detail styles
  8. Library Module styles
  9. Navigator Module styles
  10. Archetypes Module styles
  11. Footer styles
  12. Recording Panel styles
  13. API Key Modal styles
</style>

<body>
  1. #landing section
  2. #app-header (fixed navigation)
  3. #studio main content (stage, library, navigator, archetypes)
  4. Footer
</body>

<script>
  1. Static data (SESSION_MODES, CURVEBALL_POOL, LESSONS, GOALS, ARCHETYPES)
  2. AppState
  3. SessionHistoryService
  4. StorageService
  5. AccessibilityService
  6. AnimationService
  7. AudioCaptureService
  8. TranscriptionService
  9. LandingController
  10. RecordingPanelController
  11. StageController
  12. LibraryController
  13. NavigatorController
  14. HistoryPanelController
  15. ArchetypesController
  16. Initialization (DOMContentLoaded handler)
</script>
```

---

## Debugging Tips

- **State inspection:** Type `AppState` in the browser console to inspect current state
- **Service testing:** Call service methods directly in console (e.g., `SessionHistoryService.getAll()`)
- **Timer accuracy:** If timer drifts, check `performance.now()` deltas in `StageController.tick()`
- **localStorage:** Use DevTools → Application → Local Storage to inspect persisted data
- **Audio issues:** Check `navigator.mediaDevices` availability and permissions in DevTools
- **Accessibility:** Use browser's Accessibility Inspector to verify ARIA tree

---

## Deployment

Since the app is a single HTML file with no build step:

```bash
# Deploy anywhere that serves static files
# Example: GitHub Pages, Netlify, Vercel, S3 + CloudFront

# The only file needed is:
index.html
```

External requirements:
- Google Fonts CDN (Playfair Display, Inter) — loaded at runtime
- OpenAI API access — user provides their own key at runtime
