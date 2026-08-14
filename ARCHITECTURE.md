# Architecture

## Overview

PitchCraft & Eloquence Studio follows a deliberately minimal architecture: a single HTML file with inlined CSS and JavaScript, no build tooling for production, and no external runtime dependencies. This makes it trivially deployable to any static host.

The application uses a **controller + service** pattern with plain JavaScript objects (no class hierarchies, no prototypal inheritance). State flows unidirectionally: user interactions trigger controller methods, which mutate `AppState`, which triggers DOM re-rendering.

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                          │
├─────────────────────────────────────────────────────────┤
│  <style>   │  All CSS: tokens, layout, components,      │
│            │  animations, responsive breakpoints         │
├────────────┼────────────────────────────────────────────┤
│  <body>    │  Semantic HTML sections:                    │
│            │  #landing → #studio (stage, library,        │
│            │  navigator, archetypes) + overlays          │
├────────────┼────────────────────────────────────────────┤
│  <script>  │  Data → Services → Controllers → Init      │
└────────────┴────────────────────────────────────────────┘
```

---

## Data Flow

```
User Interaction (click, keypress, timer tick)
       │
       ▼
Controller Method (reads/writes AppState)
       │
       ├── Service Call (StorageService, SessionHistoryService, etc.)
       │
       └── DOM Render (direct DOM manipulation based on AppState)
```

**Invariant:** State is never derived from the DOM. The DOM is always a pure render of `AppState`. This keeps the system predictable and testable.

---

## Component Map

### State

| Component | Role |
|-----------|------|
| `AppState` | Singleton in-memory state store. Single source of truth for screen, module, session, goals, notes |

### Services (stateless utilities + thin persistence wrappers)

| Service | Responsibility |
|---------|---------------|
| `StorageService` | localStorage abstraction for personal notes |
| `SessionHistoryService` | CRUD for session records in localStorage (max 50, sorted) |
| `AudioCaptureService` | MediaRecorder lifecycle, microphone access, chunk collection |
| `TranscriptionService` | OpenAI Whisper API calls, API key management (memory-only) |
| `AccessibilityService` | ARIA live region announcements, focus trapping/release |
| `AnimationService` | CSS class transitions with `prefers-reduced-motion` awareness |

### Controllers (UI logic + event handling)

| Controller | Module | Responsibility |
|-----------|--------|---------------|
| `LandingController` | Landing | "Enter the Studio" transition, animation |
| `StageController` | Stage | Session modes, timer, phase engine, curveball engine, pause/resume |
| `RecordingPanelController` | Stage | Audio recording UI, timer, waveform, transcription flow |
| `HistoryPanelController` | Stage | Session history panel, detail modal |
| `LibraryController` | Library | Lesson catalog, search, personal notes CRUD, reader view |
| `NavigatorController` | Navigator | Goal selection, lesson paths, tips |
| `ArchetypesController` | Archetypes | Archetype cards, drawer panel, "Practice with style" |

---

## SPA Navigation

Navigation between modules uses CSS class toggling — no `pushState`, no hash routing, no URL-based deep linking:

1. Tab buttons in `#nav` (`role="tablist"`) toggle `aria-selected`
2. Module `<section>` elements use `hidden` attribute and `.module--active` class
3. Transitions use CSS `opacity` + `transform` with 250ms ease
4. `AppState.activeModule` is the source of truth

---

## State Schema

```javascript
AppState = {
  screen: 'landing' | 'studio',
  activeModule: 'stage' | 'library' | 'navigator' | 'archetypes',
  session: {
    mode: SessionMode | null,
    status: 'idle' | 'running' | 'paused' | 'completed',
    elapsed: number,              // seconds
    phasesCompleted: string[],
    curveballsShown: string[],
    recording: boolean,
    transcript: string | null
  },
  activeGoal: string | null,
  openLessonId: string | null,
  openArchetypeId: string | null,
  notes: Note[],
  searchQuery: string,
  historyPanelOpen: boolean
}
```

---

## Data Models

### SessionMode
```javascript
{ id, label, durationSeconds, isFreeMode, phases: Phase[] }
```

### Phase
```javascript
{ name, startPercent (0–1), endPercent (0–1) }
```

### Curveball
```javascript
{ id, category, prompt, advice }
```

### Lesson
```javascript
{ id, category, title, sourceReference, keyTakeaways[], actionableTechniques[], content, isUserNote }
```

### Goal
```javascript
{ id, label, description, lessonIds[], tips[] }
```

### Archetype
```javascript
{ id, name, tagline, styleDescription, signatureTechniques[], strengths[], idealContexts[], exampleExcerpt, illustrationAsset, mappedGoalId }
```

### SessionRecord (persisted)
```javascript
{ id, timestamp, sessionMode, duration, phasesCompleted[], curveballsFaced, transcript, aiFeedback }
```

---

## CSS Architecture

### Design Tokens (Custom Properties)

- **Color palettes:** Landing (ochre/umber) + Studio (dark warm palette)
- **Typography:** Serif (Playfair Display) for headings, Sans (Inter) for body
- **Spacing scale:** 0.5rem base unit (space-1 through space-8)
- **Animation tokens:** fast (150ms), base (250ms), slow (400ms), landing (600ms)
- **Breakpoints:** 375px (mobile), 768px (tablet), implicit desktop

### Layout System

- `.container` — max-width 72rem, centered
- `.grid` — CSS Grid with `repeat(auto-fill, minmax(280px, 1fr))`
- `.module` — padding + border-left accent (golden thread)
- Responsive: single-column below 375px

### Accessibility CSS

- Universal focus ring: `3px solid var(--color-focus-ring)` with `2px offset`
- `.sr-only` utility for screen-reader-only content
- `@media (prefers-reduced-motion: reduce)` zeroes all animation durations

---

## AI Integration

### Current: Speech-to-Text via OpenAI Whisper

The app uses AI to transcribe the user's spoken practice sessions into text. This enables self-review and (in future) automated coaching feedback.

#### Pipeline

```
User clicks "Record" (during active session)
       │
       ▼
AudioCaptureService.requestMicrophone()
       │  ← browser permission prompt
       ▼
MediaRecorder captures audio chunks (audio/webm)
       │
       ▼
User clicks "Stop Recording & Analyze"  ─── OR ─── Session timer expires
       │                                                     │
       └──────────────── both delegate to ───────────────────┘
                              │
                              ▼
              RecordingPanelController.handleStop()
                              │
                              ▼
              AudioCaptureService.stop() → Blob (audio/webm)
                              │
                              ▼
              TranscriptionService.hasApiKey()?
                    │                    │
                   YES                  NO
                    │                    │
                    ▼                    ▼
              Show loading       Show API Key modal
                    │                    │
                    │              User enters key
                    │                    │
                    ▼◄───────────────────┘
              TranscriptionService.transcribe(blob)
                              │
                              ▼
              POST https://api.openai.com/v1/audio/transcriptions
              FormData: { file: blob, model: "whisper-1" }
              Header: Authorization: Bearer <key>
                              │
                              ▼
              Response: { text: "transcribed speech..." }
                              │
                              ▼
              Display transcript + save to SessionRecord.transcript
```

#### Services Involved

| Service | Role in AI Pipeline |
|---------|-------------------|
| `AudioCaptureService` | Manages `getUserMedia()`, `MediaRecorder`, chunk collection, stream cleanup |
| `TranscriptionService` | Holds API key (memory-only), constructs FormData, calls Whisper, classifies errors |
| `RecordingPanelController` | Orchestrates the full flow: record UI → stop → key check → loading → result display |
| `SessionHistoryService` | Persists the transcript string in the session record |

#### API Details

| Parameter | Value |
|-----------|-------|
| Endpoint | `https://api.openai.com/v1/audio/transcriptions` |
| Method | `POST` |
| Model | `whisper-1` |
| Audio format | `audio/webm` (native MediaRecorder output) |
| Auth | `Authorization: Bearer <user-provided-key>` |
| Response | `{ text: string }` |

#### API Key Security Model

The API key is **never persisted**. It lives only in `TranscriptionService._apiKey` (JavaScript variable) for the duration of the browser session:

- Entered via a password-masked modal (`type="password"`, `autocomplete="off"`)
- Cleared on page unload (garbage collected)
- Never written to localStorage, sessionStorage, cookies, or DOM attributes
- On 401 error, the key is cleared and the modal re-shown

#### Error Handling

| Condition | User-Facing Behavior |
|-----------|---------------------|
| Microphone denied | "Microphone access is required..." + no recording |
| No audio chunks captured | "No audio was captured..." error message |
| No API key + user cancels modal | Return to normal session state, no transcription |
| 401 Unauthorized | "Invalid API key" + re-show key modal |
| Other HTTP errors (4xx/5xx) | "Transcription failed (HTTP {code})" |
| Network failure | "Network error. Check your connection." |

#### Concurrency & Race Conditions

A `_stopInProgress` guard on `RecordingPanelController` serializes all stop-and-transcribe flows. This prevents:
- Stacked overlays (API key modal + loading shown simultaneously)
- Duplicate `MediaRecorder.stop()` calls when session end and manual stop fire together
- Orphaned loading overlays when the user cancels the API key modal

See `.kiro/specs/api-key-modal-race-condition/design.md` for the full bug analysis.

#### Audio Technical Details

- **Capture:** `navigator.mediaDevices.getUserMedia({ audio: true })`
- **Encoding:** MediaRecorder default codec (typically Opus in WebM container)
- **MIME type:** `audio/webm`
- **Chunking:** `ondataavailable` collects chunks into array, packaged into single Blob on stop
- **Waveform UI:** CSS-only animation (5 bars, staggered `animation-delay`), disabled under reduced-motion
- **Resource cleanup:** MediaStream tracks always released after stop (success or error)

### Future: AI Coaching Feedback

The `SessionRecord` schema already includes an `aiFeedback` field (currently `null`). The planned integration:

| Capability | Status | Description |
|-----------|--------|-------------|
| Speech-to-text (Whisper) | Implemented | Transcribes practice sessions |
| AI feedback (GPT analysis) | Planned | Analyze transcript for structure, clarity, filler words, pacing |
| Real-time coaching | Idea | Live prompts during session based on detected patterns |
| Progress tracking | Idea | Compare transcripts across sessions for improvement metrics |

The architecture is prepared for GPT feedback: once implemented, the flow would extend from `transcribe() → analyze(transcript) → save aiFeedback to SessionRecord`.

---

## External Dependencies

### Runtime (CDN)
- Google Fonts: Playfair Display, Inter

### Development Only (npm)
- `vitest` ^1.6.0 — Test runner
- `jsdom` ^24.0.0 — DOM environment for tests
- `fast-check` ^3.22.0 — Property-based testing
- `@vitest/coverage-v8` ^1.6.0 — Coverage reporting

### External API
- OpenAI Whisper API (`POST https://api.openai.com/v1/audio/transcriptions`)
  - Model: `whisper-1`
  - Auth: Bearer token (in-memory only, never persisted)

---

## Security Considerations

- API key stored in memory only — cleared on page unload
- No server-side component — no CORS issues for static hosting
- localStorage data is user-local, no PII transmitted
- All external requests are to HTTPS endpoints only
- Input validation on all service boundaries (session records, notes)

---

## Performance Characteristics

- Zero-dependency runtime — no framework overhead
- Single HTTP request for the entire app (one HTML file)
- CSS animations hardware-accelerated (opacity, transform)
- Timer uses `performance.now()` deltas for accuracy under tab throttling
- Debounced search (300ms) prevents layout thrashing
- Session history capped at 50 records to bound localStorage usage
