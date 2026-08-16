# AI Agent Best Practices

## Purpose

This document defines how AI agents (Kiro, Copilot, or any LLM-based tool) should work with the PitchCraft & Eloquence Studio codebase. Following these guidelines ensures consistency, avoids common pitfalls, and maximizes the value of AI-assisted development.

---

## 1. Understand the Architecture Before Acting

### Modular File Structure

This project is a **modular vanilla JavaScript SPA** deployed on Vercel. The codebase is split into:

- `index.html` — Pure HTML markup (~570 lines, no inline CSS or JS)
- `css/styles.css` — All styles in one external stylesheet (~3130 lines)
- `js/` — ES modules (data constants, services, controllers)
- `api/` — Serverless functions (Vercel) that proxy OpenAI API calls securely
- `tests/` — 26 test files using Vitest + fast-check

**Do not:**
- Re-merge files back into a monolith
- Add a framework (React, Vue, Svelte)
- Add a bundler — the app runs with native ES modules in the browser
- Call OpenAI APIs directly from client-side code (use the `/api/` proxy)

### Read Before Writing

Before modifying any module:

1. Identify which controller/service owns the behavior (see table below)
2. Read the relevant file
3. Understand what `AppState` fields are involved
4. Check if the change touches accessibility (ARIA, focus, announcements)
5. Run `npm test` after changes

### Component Ownership

| If the task involves... | Work in... |
|------------------------|-----------|
| Timer, phases, session lifecycle | `js/controllers/StageController.js` |
| Curveball prompts or scheduling | `js/controllers/StageController.js` + `js/data/constants.js` |
| Recording, transcription flow | `js/controllers/RecordingPanelController.js` |
| Audio capture, MediaRecorder | `js/services/AudioCaptureService.js` |
| Whisper transcription proxy | `js/services/TranscriptionService.js` + `api/transcribe.js` |
| AI feedback + title generation | `js/services/AiFeedbackService.js` + `api/feedback.js` |
| Session saving/loading/rename | `js/services/SessionHistoryService.js` |
| History panel UI + detail view | `js/controllers/HistoryPanelController.js` |
| Lesson catalog, reader, search | `js/controllers/LibraryController.js` |
| Goal paths and tips | `js/controllers/NavigatorController.js` |
| Archetype profiles and drawer | `js/controllers/ArchetypesController.js` |
| Landing page transition | `js/controllers/LandingController.js` |
| localStorage (notes) | `js/services/StorageService.js` |
| Focus traps, announcements | `js/services/AccessibilityService.js` |
| CSS transitions, reduced-motion | `js/services/AnimationService.js` |
| SPA routing, init, nav tabs | `js/app.js` |
| Styling | `css/styles.css` |
| Static data (modes, lessons, etc.) | `js/data/constants.js` |

---

## 2. Code Style Rules

### JavaScript
- **Plain objects only.** All services/controllers are object literals (`const X = { ... }`). No classes.
- **ES modules.** Each file exports via `export { Name };` with imports at top.
- **ES2020+ allowed.** Optional chaining, nullish coalescing, async/await.
- **No API keys in client code.** All OpenAI calls go through `/api/` serverless functions.
- **Comment requirement IDs.** Major sections reference spec requirements.

### CSS
- **Use existing custom properties.** `var(--color-*)`, `var(--space-*)`, `var(--font-*)`, `var(--text-*)`.
- **BEM-inspired naming.** `.block__element--modifier` (e.g., `.stage__btn--start`).
- **Reduced motion.** Animations disabled under `@media (prefers-reduced-motion: reduce)`.
- **Mobile-first.** Test at 375px minimum viewport width.

### HTML
- **Semantic elements.** `<section>`, `<article>`, `<nav>`, `<header>` — not generic divs.
- **ARIA required.** Interactive elements need `role`, `aria-label`, `aria-expanded`/`aria-selected`.
- **Focus management.** Overlays trap focus; closing restores prior focus.

### Serverless Functions (api/)
- **Node.js 18+ runtime** on Vercel.
- **Environment variables.** Access secrets via `process.env.OPENAI_API_KEY`.
- **Validate input.** Check method (POST only), content-type, required fields.
- **Return consistent shapes.** `{ success: true, ... }` or `{ success: false, error, statusCode? }`.

---

## 3. State Management

> DOM is always a pure render of `AppState`. Never read state from the DOM.

- `AppState` (in `js/data/constants.js`) is the single source of truth for UI state
- `StorageService` and `SessionHistoryService` own persistence
- Never persist `AppState` directly — only save derived records

---

## 4. Testing

- **Property-based tests** (`*.property.test.js`) — fast-check, 100+ iterations
- **Example-based tests** (`*.test.js`) — Concrete scenarios, edge cases
- **220 tests** across 26 files, all passing
- Run with `npm test` (Vitest, jsdom environment)

### What to Mock

| API | How to Mock |
|-----|-------------|
| `localStorage` | jsdom built-in (reset with `localStorage.clear()`) |
| `navigator.mediaDevices.getUserMedia` | `vi.fn()` returning mock MediaStream |
| `MediaRecorder` | Mock with `start()`, `stop()`, `pause()`, `resume()` |
| `fetch` (API proxy) | `vi.fn()` returning mock Response |
| `window.matchMedia` | `vi.fn()` for reduced-motion testing |
| `performance.now()` | `vi.fn()` for timer accuracy tests |

---

## 5. Local Development & Deployment

```bash
npm run dev         # Vercel dev server (localhost:3000, auto-loads .env)
npm test            # Run all 220 tests
npm run test:watch  # Watch mode
npx vercel          # Preview deployment
npx vercel --prod   # Production deployment
```

### Environment Variables
- `.env` — Local development (gitignored, loaded by `vercel dev`)
- Vercel Dashboard — Production (Settings > Environment Variables)
- `.env.example` — Template documenting required vars

---

## 6. Common Pitfalls

| Do NOT | Why |
|--------|-----|
| Call OpenAI directly from browser JS | API key exposure |
| Use `class` keyword | Convention is plain objects |
| Store secrets in localStorage | Security |
| Write to ARIA live regions on timer tick | Screen reader flooding |
| Skip `prefers-reduced-motion` | WCAG AA requirement |
| Use `innerHTML` for user content | XSS risk |
| Forget to cap session history at 50 | localStorage quota |

| DO | Why |
|----|-----|
| Use `performance.now()` for timer deltas | Accurate under throttling |
| Wrap localStorage in try/catch | Private browsing may throw |
| Use `AccessibilityService.announce()` | Centralizes screen reader output |
| Add `console.warn` for missing elements | Debug without crashing |
| Validate data before persisting | Prevent corrupt localStorage |

---

## 7. File Navigation Guide

| File/Directory | Purpose | Lines |
|---|---|---|
| `index.html` | HTML markup skeleton | ~570 |
| `css/styles.css` | All CSS (custom props, layout, components) | ~3130 |
| `js/app.js` | Entry point: imports, DOMContentLoaded, SPA tab routing | ~155 |
| `js/data/constants.js` | SESSION_MODES, LESSON_CATALOG, CURVEBALL_POOL, GOALS, ARCHETYPES, AppState | ~755 |
| `js/services/AccessibilityService.js` | ARIA live regions, focus trapping | ~69 |
| `js/services/AnimationService.js` | CSS transitions, reduced-motion check | ~56 |
| `js/services/AudioCaptureService.js` | getUserMedia, MediaRecorder, pause/resume | ~97 |
| `js/services/TranscriptionService.js` | Calls `/api/transcribe` proxy | ~48 |
| `js/services/AiFeedbackService.js` | Calls `/api/feedback` proxy, markdown renderer | ~228 |
| `js/services/SessionHistoryService.js` | CRUD for session records in localStorage | ~169 |
| `js/services/StorageService.js` | Notes persistence in localStorage | ~34 |
| `js/controllers/StageController.js` | Session lifecycle, timer, phases, curveballs, auto-record | ~499 |
| `js/controllers/RecordingPanelController.js` | Transcription flow, AI feedback trigger, title generation | ~238 |
| `js/controllers/LandingController.js` | Landing-to-studio transition | ~33 |
| `js/controllers/LibraryController.js` | Lesson catalog, search, notes, reader view | ~171 |
| `js/controllers/NavigatorController.js` | Goal selection, lesson paths, tips | ~73 |
| `js/controllers/HistoryPanelController.js` | History panel, session detail overlay, rename | ~261 |
| `js/controllers/ArchetypesController.js` | Archetype cards, drawer, practice integration | ~111 |
| `api/transcribe.js` | Serverless: forwards audio to Whisper API | ~55 |
| `api/feedback.js` | Serverless: forwards prompts to GPT-4o-mini | ~60 |
| `tests/` | 26 test files (Vitest + fast-check) | ~220 tests |

---

## 8. Accessibility Checklist

- [ ] Interactive element has visible focus indicator (3px solid, 2px offset)
- [ ] Button/link has accessible name (text content or `aria-label`)
- [ ] Dynamic changes announced via `AccessibilityService.announce()`
- [ ] Overlay/modal traps focus with `AccessibilityService.trapFocus()`
- [ ] Escape key dismisses overlays
- [ ] Color contrast meets 4.5:1 (AA)
- [ ] Animation respects `prefers-reduced-motion: reduce`
- [ ] Tab order is logical (no `tabindex > 0`)

---

## 9. Security Checklist

- [ ] No API keys in client-side code (use `/api/` proxy)
- [ ] User text rendered via `textContent`, never `innerHTML`
- [ ] All fetch uses HTTPS or relative `/api/` paths
- [ ] No `eval()`, `Function()`, or dynamic script injection
- [ ] Validate data before localStorage writes
- [ ] Serverless functions validate request method and input
