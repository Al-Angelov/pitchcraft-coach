# PitchCraft & Eloquence Studio

## Project Summary

PitchCraft & Eloquence Studio is a browser-based public speaking and pitch practice application. It provides a private, AI-enhanced environment where users can rehearse timed presentations, receive real-time coaching feedback from GPT-4o-mini, study communication psychology, and develop their speaking archetype.

**Author:** Alexander Angelov
**Version:** 2.0.0
**License:** Proprietary
**Deployment:** Vercel (serverless + static)
**Live URL:** Configured via Vercel project `pitchcraft-coach`

---

## Vision

> "In an age of infinite noise and shrinking attention, the ability to communicate with clarity, conviction, and compassion is no longer a soft skill — it is the defining skill of our time."

The app bridges the gap between having something worth saying and saying it well. It combines cognitive psychology research (Kahneman, Cuddy, Sinek, cognitive load theory) with structured practice and AI-powered coaching.

---

## How It Works (End-to-End Flow)

### 1. User lands on the app
The landing page presents a cinematic scrollable narrative about the mission. Clicking "Enter the Studio" transitions to the main SPA.

### 2. User selects a practice mode
Five session modes available: 60-Second Elevator Pitch, 5-Minute Startup Demo, 15-Minute Presentation, 30-Minute Deep-Dive, or Free Mode. Each has timed phases with specific structural goals (Hook, Problem, Solution, CTA, etc.).

### 3. User starts a session
Clicking "Start Session" immediately:
- Starts the countdown timer (or count-up for Free Mode)
- Requests microphone permission
- Begins MediaRecorder audio capture
- Shows the unified Active Session Deck (timer, waveform, controls)
- Schedules curveball interruptions (if enabled)

### 4. During the session
- Phase indicator bar shows progress through structural phases
- Curveball questions interrupt randomly to test composure
- Pause/Resume controls halt both timer AND MediaRecorder simultaneously
- Waveform animation shows active recording status

### 5. User stops the session
Clicking "Stop & Analyze":
- Stops audio recording and packages the audio blob
- Sends audio to `/api/transcribe` (serverless proxy -> Whisper API)
- Displays the transcript in the session summary
- Automatically sends transcript to `/api/feedback` (serverless proxy -> GPT-4o-mini)
- Displays structured coaching feedback (pitch structure, delivery, filler words, suggestions)
- Generates an AI session title in the background
- Saves everything to localStorage via SessionHistoryService

### 6. User reviews past sessions
The History panel in the sidebar shows all past sessions with AI-generated titles. Clicking a session opens a detailed overlay with stats, transcript, and feedback. Sessions can be manually renamed.

---

## Architecture Overview

```
Browser (Client)                          Vercel (Server)
+------------------+                     +------------------+
| index.html       |                     | api/transcribe.js|
| css/styles.css   |  --- fetch --->     |   (Whisper proxy) |
| js/app.js        |                     +------------------+
| js/services/*    |                     | api/feedback.js  |
| js/controllers/* |  --- fetch --->     |   (GPT proxy)    |
| js/data/*        |                     +------------------+
+------------------+                     | process.env      |
       |                                 | OPENAI_API_KEY   |
       v                                 +------------------+
  localStorage
  (sessions, notes)
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| No framework | Simplicity, no build step, fast load, educational |
| ES modules (native) | Browser-native, no bundler needed |
| Serverless API proxy | Keeps API key secret, Vercel auto-scales |
| localStorage persistence | No database needed, works offline for history |
| Plain object services | Simple, testable, no `this` binding issues |
| Single CSS file | No CSS-in-JS complexity, easy to find styles |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | JavaScript ES2020+, HTML5, CSS3 |
| Fonts | Playfair Display (serif), Inter (sans-serif) via Google Fonts |
| AI - Transcription | OpenAI Whisper (`whisper-1`) via serverless proxy |
| AI - Coaching | OpenAI GPT-4o-mini via serverless proxy |
| AI - Session Naming | OpenAI GPT-4o-mini (lightweight title generation) |
| Audio | Web Audio API + MediaRecorder (with pause/resume) |
| Storage | Browser localStorage (50 session cap) |
| Hosting | Vercel (static + serverless functions) |
| Testing | Vitest + fast-check (property-based) + jsdom |
| IDE | Kiro (AI-powered VS Code) with specs-driven development |

---

## Project Structure

```
pitchcraft-coach/
├── index.html                    # HTML markup skeleton (~570 lines)
├── css/
│   └── styles.css                # All styles (~3130 lines)
├── js/
│   ├── app.js                    # Entry point: imports, init, SPA routing
│   ├── data/
│   │   └── constants.js          # SESSION_MODES, LESSONS, CURVEBALLS, GOALS, ARCHETYPES, AppState
│   ├── services/
│   │   ├── AccessibilityService.js    # ARIA live regions, focus management
│   │   ├── AiFeedbackService.js       # GPT feedback + title via /api/feedback
│   │   ├── AnimationService.js        # CSS transitions, reduced-motion
│   │   ├── AudioCaptureService.js     # MediaRecorder, mic access, pause/resume
│   │   ├── SessionHistoryService.js   # CRUD for session records (localStorage)
│   │   ├── StorageService.js          # Notes persistence (localStorage)
│   │   └── TranscriptionService.js    # Whisper transcription via /api/transcribe
│   └── controllers/
│       ├── ArchetypesController.js    # Speaker archetype cards + drawer
│       ├── HistoryPanelController.js  # History sidebar + detail overlay + rename
│       ├── LandingController.js       # Landing -> studio transition
│       ├── LibraryController.js       # Lesson catalog, search, notes, reader
│       ├── NavigatorController.js     # Goal-based curriculum paths
│       ├── RecordingPanelController.js # Transcription flow + AI feedback trigger
│       └── StageController.js         # Session lifecycle, timer, phases, curveballs
├── api/
│   ├── transcribe.js             # Serverless: audio -> Whisper API
│   └── feedback.js               # Serverless: messages -> GPT-4o-mini
├── tests/                         # 26 test files, 220 tests total
│   ├── *.test.js                  # Unit and integration tests
│   └── *.property.test.js         # Property-based tests (fast-check)
├── .kiro/specs/                   # Feature specifications
│   ├── pitchcraft-coach/          # Core app spec
│   ├── session-history/           # Session history feature
│   ├── ai-coaching/               # Audio + transcription feature
│   ├── ai-feedback/               # GPT coaching feedback feature
│   └── api-key-modal-race-condition/ # Bug fix spec
├── vercel.json                    # Vercel deployment config
├── package.json                   # Scripts: dev, test, test:watch
├── vitest.config.js               # Test config (jsdom environment)
├── .env                           # Local API key (gitignored)
├── .env.example                   # Template for environment setup
├── .gitignore                     # Excludes node_modules, .env, .vercel
├── AGENTS.md                      # AI agent development guidelines
├── ARCHITECTURE.md                # Technical architecture details
├── FEATURES.md                    # Feature inventory with status
└── DEVELOPMENT.md                 # Development workflow guide
```

---

## Modules (User-Facing)

### 1. Landing Screen
Cinematic scrollable narrative experience with a golden-thread design motif. Story panels introduce the app's philosophy before the CTA button transitions to the studio.

### 2. Practice Stage
The core module. Timed sessions with:
- 5 practice modes (60s to 30min + Free)
- Phase tracking with visual progress bar
- Live curveball question interruptions
- Auto-recording with MediaRecorder (pause/resume support)
- Unified Active Session Deck (timer, waveform, Pause/Resume/Stop & Analyze)
- AI transcription + coaching feedback on stop
- AI-generated session titles
- Button changes to "Restart Session" after first run

### 3. Eloquence Library
Curated lessons from TED talks, communication books, and psychology research. Includes:
- Full-text reader view with illustrations
- Search/filter functionality
- Personal notes with localStorage persistence

### 4. Goal Navigator
Goal-based learning paths with ordered lesson sequences and strategy tips for:
- Funding Pitch
- Technical Explanation
- Casual Networking
- Inspirational Talk
- Job Interview

### 5. Speaker Archetypes
Four communicator personality profiles (Visionary, Deep-Tech Educator, Empathetic Storyteller, Challenger) with:
- Inline SVG illustrations
- Side-drawer detail view
- "Practice with this style" integration to Stage

---

## AI Integration Details

### Transcription (Whisper)
- Audio captured as `audio/webm` via MediaRecorder
- Sent to `/api/transcribe` serverless function
- Proxy adds `Authorization: Bearer` header with server-side API key
- Returns transcript text

### Coaching Feedback (GPT-4o-mini)
- System prompt evaluates: Pitch Structure (Hook/Problem/Solution/CTA), Delivery Quality (clarity/confidence/pacing), Filler Words, and provides 3-5 Actionable Suggestions
- Feedback formatted in markdown, rendered with custom markdown-to-HTML parser
- Displayed in session summary and persisted in history

### Session Title Generation (GPT-4o-mini)
- Lightweight background call after feedback completes
- Generates 5-8 word descriptive title based on transcript content
- Persisted in session record, displayed in history panel
- Users can manually rename via inline edit in detail overlay

---

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server (serves static + runs serverless functions)
npm run dev

# Run tests
npm test

# Deploy
npx vercel --prod
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Run `npm run dev`
4. Open `http://localhost:3000`

---

## Current Status (v2.0.0)

| Feature | Status |
|---------|--------|
| Landing screen | Complete |
| Practice Stage (5 modes) | Complete |
| Phase tracking + curveballs | Complete |
| Audio recording + pause/resume | Complete |
| Whisper transcription (via proxy) | Complete |
| AI coaching feedback (via proxy) | Complete |
| AI session title generation | Complete |
| Manual session rename | Complete |
| Session history (localStorage) | Complete |
| Library (lessons + notes) | Complete |
| Goal Navigator | Complete |
| Speaker Archetypes | Complete |
| Vercel deployment | Complete |
| Serverless API proxy (secure) | Complete |
| Test suite (220 tests) | All passing |
| WCAG AA accessibility | Implemented |
| Mobile responsive (375px+) | Implemented |

---

## Related Documentation

- [AGENTS.md](./AGENTS.md) — AI agent development guidelines and conventions
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture deep-dive
- [FEATURES.md](./FEATURES.md) — Feature inventory with status tracking
- [DEVELOPMENT.md](./DEVELOPMENT.md) — Development workflow and tooling
- [.env.example](./.env.example) — Environment variable template
