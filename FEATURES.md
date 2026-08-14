# Features

## Feature Inventory

Track the status and maturity of each feature. Update this document as features progress.

### Status Legend

| Status | Meaning |
|--------|---------|
| Done | Implemented, tested, stable |
| Active | In progress or recently modified |
| Planned | Designed but not yet implemented |
| Idea | Concept only, no spec |

---

## Core Application

| # | Feature | Status | Spec | Notes |
|---|---------|--------|------|-------|
| 1 | Landing Screen (narrative scroll) | Done | `pitchcraft-coach` | Cinematic hero + 5 story notes + CTA |
| 2 | Studio Shell (SPA navigation) | Done | `pitchcraft-coach` | Fixed header, tab navigation, module switching |
| 3 | Responsive Layout | Done | `pitchcraft-coach` | 375px, 768px, desktop breakpoints |
| 4 | Accessibility (WCAG 2.1 AA) | Done | `pitchcraft-coach` | Focus rings, ARIA live regions, reduced motion |
| 5 | Design System (CSS tokens) | Done | `pitchcraft-coach` | Color, typography, spacing, animation tokens |

---

## Stage Module (Practice Sessions)

| # | Feature | Status | Spec | Notes |
|---|---------|--------|------|-------|
| 6 | Session Mode Selection | Done | `pitchcraft-coach` | 5 modes: Elevator 60s, Startup 5m, Presentation 15m, Deep-Dive 30m, Free |
| 7 | Timer Engine | Done | `pitchcraft-coach` | Countdown + count-up (Free), performance.now() accuracy |
| 8 | Phase Indicator | Done | `pitchcraft-coach` | Visual bar + phase name, per-mode phase definitions |
| 9 | Curveball Engine | Done | `pitchcraft-coach` | Random scheduling, 20+ prompts, 4 categories, advice |
| 10 | Pause/Resume | Done | `pitchcraft-coach` | Timer freeze, overlay, keyboard accessible |
| 11 | Session Summary | Done | `pitchcraft-coach` | Duration, phases completed, curveballs faced |

---

## Session History

| # | Feature | Status | Spec | Notes |
|---|---------|--------|------|-------|
| 12 | History Service (CRUD) | Done | `session-history` | localStorage, 50-record cap, sorted newest-first |
| 13 | History Panel (side panel) | Done | `session-history` | Collapsible, mobile-responsive overlay |
| 14 | Session Detail Modal | Done | `session-history` | Torn-page aesthetic, focus trap, Escape dismiss |
| 15 | Auto-save on session end | Done | `session-history` | Hook into StageController.endSession() |

---

## AI Coaching (Audio + Transcription)

| # | Feature | Status | Spec | Notes |
|---|---------|--------|------|-------|
| 16 | Audio Recording | Done | `ai-coaching` | MediaRecorder, waveform animation, recording panel |
| 17 | Whisper Transcription | Done | `ai-coaching` | OpenAI API, API key modal, loading overlay |
| 18 | Transcript in Session History | Done | `ai-coaching` | Persisted in SessionRecord.transcript |
| 19 | API Key Modal Race Fix | Done | `api-key-modal-race-condition` | Sequential flow enforcement, concurrency guard |

---

## Library Module

| # | Feature | Status | Spec | Notes |
|---|---------|--------|------|-------|
| 20 | Lesson Catalog | Done | `pitchcraft-coach` | TED talks, book summaries, psychology research |
| 21 | Reader View | Done | `pitchcraft-coach` | Full-screen immersive lesson reading |
| 22 | Search / Filter | Done | `pitchcraft-coach` | Debounced, case-insensitive substring |
| 23 | Personal Notes | Done | `pitchcraft-coach` | Create, persist to localStorage, display in catalog |

---

## Navigator Module

| # | Feature | Status | Spec | Notes |
|---|---------|--------|------|-------|
| 24 | Goal Selection | Done | `pitchcraft-coach` | 5 goals: funding, technical, networking, inspirational, interview |
| 25 | Lesson Path | Done | `pitchcraft-coach` | Ordered lessons per goal |
| 26 | Goal-Specific Tips | Done | `pitchcraft-coach` | Min 3 tips per goal |
| 27 | Stage Integration | Done | `pitchcraft-coach` | Active goal shown in stage header |

---

## Archetypes Module

| # | Feature | Status | Spec | Notes |
|---|---------|--------|------|-------|
| 28 | Archetype Cards Grid | Done | `pitchcraft-coach` | SVG illustrations, name, tagline |
| 29 | Archetype Drawer | Done | `pitchcraft-coach` | Side-sliding profile: traits, contexts, quote |
| 30 | Practice with Style | Done | `pitchcraft-coach` | Maps archetype → goal, navigates to Stage |

---

## Planned / Future Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 31 | AI Feedback (post-transcription coaching) | Idea | GPT-based analysis of transcript quality |
| 32 | Session Recording Playback | Idea | Replay audio from past sessions |
| 33 | Progress Tracking Dashboard | Idea | Visualize improvement over sessions |
| 34 | Multi-language Support | Idea | i18n for UI and Whisper language param |
| 35 | Export/Share Sessions | Idea | PDF or share link for session summaries |
| 36 | Custom Curveball Pool | Idea | User-defined curveball prompts |
| 37 | Backend Sync | Idea | Optional cloud storage for cross-device access |

---

## Test Coverage Map

| Feature Area | Test Files |
|-------------|-----------|
| Stage / Timer | `timer.test.js`, `stage-mode.property.test.js`, `phase-indicator.property.test.js` |
| Curveballs | `curveball.property.test.js` |
| Library | `library.test.js`, `library.property.test.js` |
| Navigator | `navigator.test.js`, `navigator.property.test.js` |
| Archetypes | `archetypes.test.js`, `archetypes.property.test.js` |
| Session History | `session-history.test.js`, `session-history.property.test.js`, `session-history-integration.test.js` |
| AI Coaching | `ai-coaching.property.test.js`, `audio-capture.test.js`, `transcription.test.js` |
| API Key Race | `api-key-modal-race.property.test.js` |
| Landing | `landing.test.js`, `landing-controller.test.js` |
| Accessibility | `accessibility.test.js` |
| Animations | `animation.test.js` |
| Storage | `storage.test.js`, `storage.property.test.js` |
| Integration | `integration.test.js` |
| Studio Shell | `studio-shell.test.js` |
