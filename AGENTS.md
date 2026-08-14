# AI Agent Best Practices

## Purpose

This document defines how AI agents (Kiro, Copilot, or any LLM-based tool) should work with the PitchCraft & Eloquence Studio codebase. Following these guidelines ensures consistency, avoids common pitfalls, and maximizes the value of AI-assisted development on this specific project.

---

## 1. Understand the Architecture Before Acting

### The Single-File Constraint

This project lives in **one `index.html` file** (~5700 lines). This is intentional, not technical debt. Do not:

- Split it into multiple files
- Suggest a build step or bundler
- Introduce ES module imports in production code
- Add a framework (React, Vue, Svelte, etc.)

### Read Before Writing

Before modifying any section of `index.html`:

1. Identify which controller/service owns the behavior
2. Read the relevant section (use line numbers from grep)
3. Understand what `AppState` fields are involved
4. Check if the change touches accessibility (ARIA, focus, announcements)

### Component Ownership

| If the task involves... | Work in... |
|------------------------|-----------|
| Timer, phases, session lifecycle | `StageController` |
| Curveball prompts or scheduling | `StageController` + `CURVEBALL_POOL` data |
| Recording, waveform, audio | `AudioCaptureService` + `RecordingPanelController` |
| Whisper API, API key | `TranscriptionService` |
| Session saving/loading | `SessionHistoryService` |
| History panel UI | `HistoryPanelController` |
| Lesson catalog, reader, search | `LibraryController` |
| Goal paths and tips | `NavigatorController` |
| Archetype profiles and drawer | `ArchetypesController` |
| Landing page transition | `LandingController` |
| localStorage | `StorageService` or `SessionHistoryService` |
| Focus traps, announcements | `AccessibilityService` |
| CSS transitions | `AnimationService` |

---

## 2. Code Style Rules

### JavaScript

- **Plain objects only.** All services and controllers are object literals (`const X = { ... }`). No classes, no prototypal inheritance.
- **No `this` gotchas.** When referencing the current object, use the object name directly (e.g., `StageController.tick()` not `this.tick()`) or use arrow functions.
- **ES2020+ allowed.** Optional chaining (`?.`), nullish coalescing (`??`), template literals, destructuring, `async/await`.
- **No external runtime imports.** Everything runs inline. Tests can import from node_modules, but `index.html` cannot.
- **Comment requirement IDs.** Major sections reference spec requirements (e.g., `/* Requirements: 2.1, 2.5, 3.2 */`).

### CSS

- **Use existing custom properties.** Never hard-code colors, spacing, or font families. Reference `var(--color-*)`, `var(--space-*)`, `var(--font-*)`, `var(--text-*)`, `var(--transition-*)`.
- **BEM-inspired naming.** `.block__element--modifier` (e.g., `.stage__btn--start`).
- **Reduced motion.** Any new animation must be disabled under `@media (prefers-reduced-motion: reduce)`.
- **Mobile-first considerations.** Test at 375px. Use existing responsive patterns.

### HTML

- **Semantic elements.** Use `<section>`, `<article>`, `<nav>`, `<header>` — not generic `<div>` for structural containers.
- **ARIA required.** Interactive elements need: `role`, `aria-label` or `aria-labelledby`, `aria-expanded`/`aria-selected` where appropriate.
- **Focus management.** Overlays must trap focus. Closing must restore prior focus.
- **SVG inline.** All illustrations are inlined SVG with `aria-hidden="true"` and `focusable="false"`.

---

## 3. State Management Rules

### Golden Rule

> DOM is always a pure render of `AppState`. Never read state from the DOM.

### Mutation Pattern

```javascript
// Correct: mutate state, then render
AppState.session.status = 'running';
StageController.renderControls();

// Wrong: check DOM to determine state
if (document.getElementById('btn-pause').hidden) { ... }
```

### State Boundaries

- `AppState` is the single source of truth for UI state
- `StorageService` and `SessionHistoryService` own persistence
- Never persist `AppState` directly — only save derived records

---

## 4. Testing Expectations

### Every New Feature Needs Both Test Types

1. **Property-based tests** (`*.property.test.js`) — Define correctness properties in the design doc, then implement with fast-check. Minimum 100 iterations.
2. **Example-based tests** (`*.test.js`) — Concrete scenarios, edge cases, error paths.

### Test File Pattern

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// Extract body (no scripts) for DOM tests
function getBodyContent(fullHtml) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = match ? match[1] : fullHtml;
  return body.replace(/<script[\s\S]*?<\/script>/gi, '');
}
```

### What to Mock

| API | How to Mock |
|-----|-------------|
| `localStorage` | jsdom built-in (reset with `localStorage.clear()`) |
| `navigator.mediaDevices.getUserMedia` | `vi.fn()` returning mock MediaStream |
| `MediaRecorder` | Mock constructor with `start()`, `stop()`, `ondataavailable` |
| `fetch` (Whisper API) | `vi.fn()` returning mock Response |
| `window.matchMedia` | `vi.fn()` for reduced-motion testing |
| `performance.now()` | `vi.fn()` for timer accuracy tests |

### Property Test Tagging

Always comment which design property is being validated:

```javascript
// Feature: session-history, Property 2: Record cap enforcement
```

---

## 5. Spec-Driven Development Workflow

This project uses Kiro's specs system. The workflow for any non-trivial feature:

```
1. Requirements (.kiro/specs/<feature>/requirements.md)
   └── What the user needs, acceptance criteria

2. Design (.kiro/specs/<feature>/design.md)
   └── Architecture, interfaces, data models, correctness properties, error handling

3. Tasks (.kiro/specs/<feature>/tasks.md)
   └── Ordered implementation steps with checkboxes

4. Implementation (index.html + tests/)
   └── Code following the design, tests validating properties

5. Documentation update (FEATURES.md, ARCHITECTURE.md if needed)
```

### When to Create a Spec

- New module or major feature: Always
- Bug fix with multiple root causes: Yes (see `api-key-modal-race-condition`)
- Simple UI tweak or data addition: No — just implement and test

---

## 6. Common Pitfalls

### Do Not

| Pitfall | Why |
|---------|-----|
| Add `node_modules` imports to index.html | No build step — the file runs as-is in the browser |
| Use `class` keyword | Project convention is plain objects |
| Store API keys in localStorage | Security requirement — memory only |
| Write to ARIA live regions on timer tick | Causes screen reader flooding |
| Skip `prefers-reduced-motion` check | WCAG AA compliance requirement |
| Use `innerHTML` for user-provided content | XSS risk — use `textContent` or DOM API |
| Assume timer ticks are exactly 1000ms | Browser throttles background tabs |
| Forget to cap session history at 50 | localStorage has quota limits |
| Add URL routing or pushState | Architectural decision — single-screen SPA |
| Create separate CSS/JS files | Single-file architecture is intentional |

### Do

| Practice | Reason |
|----------|--------|
| Use `performance.now()` for timer deltas | Accurate under throttling |
| Wrap localStorage access in try/catch | Private browsing may throw |
| Use `AccessibilityService.announce()` | Centralizes screen reader output |
| Test at 375px viewport width | Minimum supported width |
| Check `AnimationService.respectsReducedMotion()` | Before any programmatic animation |
| Validate data before persisting | Prevent corrupt localStorage |
| Use `null` checks before DOM manipulation | Elements may not exist in test env |

---

## 7. Working with the Large Single File

### Navigation Strategy

The file is organized in strict section order. Use these landmarks:

| Line Range (approx.) | Content |
|----------------------|---------|
| 1–3500 | CSS (style section) |
| 3500–4350 | HTML (body content) |
| 4350–4420 | Static data arrays (SESSION_MODES, CURVEBALL_POOL, LESSONS, etc.) |
| 4420–4570 | SessionHistoryService |
| 4570–4640 | StorageService |
| 4640–4700 | AccessibilityService + AnimationService |
| 4700–4800 | AudioCaptureService |
| 4800–4870 | TranscriptionService |
| 4870–4900 | LandingController |
| 4900–5090 | RecordingPanelController |
| 5090–5600 | StageController |
| 5600–5800 | LibraryController |
| 5800–5890 | NavigatorController |
| 5890–6130 | HistoryPanelController |
| 6130–6300+ | ArchetypesController + init |

### Search Patterns for Agents

When looking for specific functionality:
- `const <Name> = {` — finds service/controller definitions
- `Requirements:` — finds requirement comment blocks
- `AppState.session.` — finds state mutations
- `getElementById` — finds DOM bindings
- `aria-` — finds accessibility attributes
- `@media` — finds responsive breakpoints
- `@keyframes` — finds animations

---

## 8. Accessibility Checklist (for every change)

Before considering any UI change complete:

- [ ] Interactive element has visible focus indicator (3px solid, 2px offset)
- [ ] Button/link has accessible name (text content or `aria-label`)
- [ ] Dynamic content changes announced via `AccessibilityService.announce()`
- [ ] Overlay/modal traps focus with `AccessibilityService.trapFocus()`
- [ ] Escape key dismisses overlays
- [ ] Color contrast meets 4.5:1 ratio (AA)
- [ ] Animation respects `prefers-reduced-motion: reduce`
- [ ] Tab order is logical (no `tabindex > 0`)
- [ ] Form inputs have associated labels (visible or `.sr-only`)

---

## 9. Security Checklist

- [ ] No API keys in localStorage, sessionStorage, or cookies
- [ ] User-provided text rendered via `textContent`, never `innerHTML`
- [ ] All fetch requests use HTTPS
- [ ] No eval(), Function(), or dynamic script injection
- [ ] Validate all data before writing to localStorage
- [ ] API key input uses `type="password"` and `autocomplete="off"`

---

## 10. Agent Session Workflow

When starting a new task in Kiro:

1. **Read relevant specs** in `.kiro/specs/` first
2. **Grep for the section** you need to modify in `index.html`
3. **Read surrounding context** (50+ lines around target)
4. **Make the change** following conventions above
5. **Run tests** (`npm test`) to verify nothing broke
6. **Update FEATURES.md** if adding/changing a feature
7. **Update this file** if you discover a new pattern or pitfall

### Context Efficiency

Given the file size, avoid reading the entire `index.html`. Instead:
- Use grep to locate the relevant controller/service
- Read only the target section (with offset/limit)
- Read the test file for the feature you're modifying
- Read the spec design doc for architectural context

---

## 11. Prompt Engineering for This Project

When asking an AI agent to work on this project, include:

```
Context: Single-file SPA (index.html), vanilla JS, plain objects (no classes),
CSS custom properties, WCAG AA accessible, localStorage persistence,
Vitest + fast-check testing. See AGENTS.md for conventions.
```

For feature work:
```
Follow spec-driven workflow: check .kiro/specs/<feature>/ for requirements
and design before implementing. Write both property-based and example-based tests.
```

For bug fixes:
```
Read the relevant controller first. Check if a spec exists for the bug.
The fix must not break existing tests (run npm test to verify).
Maintain the unidirectional state flow: AppState → DOM.
```
