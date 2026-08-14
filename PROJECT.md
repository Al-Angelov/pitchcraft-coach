# PitchCraft & Eloquence Studio

## Project Summary

PitchCraft & Eloquence Studio is a browser-based public speaking and pitch practice application. It provides a private, AI-enhanced environment where users can rehearse timed presentations, receive curveball questions under pressure, study communication psychology, and develop their speaking archetype.

**Author:** Alexander Angelov  
**Version:** 1.0.0  
**License:** Proprietary  

---

## Vision

> "In an age of infinite noise and shrinking attention, the ability to communicate with clarity, conviction, and compassion is no longer a soft skill — it is the defining skill of our time."

The app bridges the gap between having something worth saying and saying it well. It combines cognitive psychology research (Kahneman, Cuddy, Sinek, cognitive load theory) with a structured practice environment — no live audience required.

---

## Key Characteristics

| Attribute | Detail |
|-----------|--------|
| Architecture | Single-page application (SPA), single `index.html` file (~5700 lines) |
| Runtime | Vanilla JavaScript ES2020+, no framework, no build step |
| Styling | Inlined CSS with custom properties, responsive grid |
| State management | In-memory `AppState` singleton, rendered to DOM |
| Persistence | `localStorage` for notes and session history |
| AI integration | OpenAI Whisper API for speech-to-text transcription |
| Accessibility | WCAG 2.1 AA compliant, `prefers-reduced-motion` support |
| Deployment | Static hosting (any CDN, GitHub Pages, Netlify, S3) |
| Testing | Vitest + fast-check (property-based) + jsdom |

---

## Modules

1. **Landing Screen** — Cinematic narrative scrollable experience with storytelling
2. **Stage** — Timed practice sessions with phase tracking and live curveball interruptions
3. **Library** — Curated lessons from TED talks, books, psychology research + personal notes
4. **Navigator** — Goal-based learning paths (funding pitch, technical explanation, networking, etc.)
5. **Archetypes** — Communicator personality profiles with practice integration

---

## Technology Stack

- **Language:** JavaScript (ES2020+), HTML5, CSS3
- **Fonts:** Playfair Display (serif), Inter (sans-serif) via Google Fonts
- **API:** OpenAI Whisper (`whisper-1`) for audio transcription
- **Audio:** Web Audio API + MediaRecorder for in-browser capture
- **Storage:** Browser localStorage
- **Testing:** Vitest, fast-check, jsdom
- **IDE:** Kiro (AI-powered VS Code) with specs-driven development

---

## Project Structure

```
workspace/
├── index.html            # Complete SPA (HTML + CSS + JS, ~5700 lines)
├── package.json          # Dev dependencies (vitest, fast-check, jsdom)
├── vitest.config.js      # Test configuration (jsdom environment)
├── run-tests.cmd         # Windows test runner script
├── tests/                # 26 test files (unit, property-based, integration)
│   ├── *.test.js         # Unit and integration tests
│   └── *.property.test.js # Property-based tests (fast-check)
└── .kiro/
    └── specs/            # Feature specifications (requirements → design → tasks)
        ├── pitchcraft-coach/      # Core application spec
        ├── session-history/       # Session history feature spec
        ├── ai-coaching/           # Audio + transcription spec
        └── api-key-modal-race-condition/  # Bug fix spec
```

---

## Current Status

- Core SPA: Implemented and functional
- Session History: Implemented with localStorage persistence
- AI Coaching (Audio + Transcription): Implemented with Whisper integration
- API Key Modal Race Condition: Bug identified, fix designed and implemented
- Test Coverage: 26 test files covering all major features

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture, modules, data flow
- [FEATURES.md](./FEATURES.md) — Feature inventory with status tracking
- [DEVELOPMENT.md](./DEVELOPMENT.md) — Development workflow, testing, tooling
- [AGENTS.md](./AGENTS.md) — Best practices for AI-assisted development
