# How PitchCraft Works — A Complete Guide

> Written for the developer who built it but wants to fully understand every moving piece, explained as if you've never written a line of code before. This is your personal reference bible.

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [What Happens When Someone Opens the App](#what-happens-when-someone-opens-the-app)
3. [The Folder Structure (Your Filing Cabinet)](#the-folder-structure-your-filing-cabinet)
4. [How the Pieces Talk to Each Other](#how-the-pieces-talk-to-each-other)
5. [The Frontend (What the User Sees)](#the-frontend-what-the-user-sees)
6. [The Backend (The Secret Kitchen)](#the-backend-the-secret-kitchen)
7. [The AI Brain (OpenAI Integration)](#the-ai-brain-openai-integration)
8. [Data & Memory (How the App Remembers Things)](#data--memory-how-the-app-remembers-things)
9. [The Session Lifecycle (Start to Finish)](#the-session-lifecycle-start-to-finish)
10. [How Deployment Works (Going Live)](#how-deployment-works-going-live)
11. [The Testing System (Quality Control)](#the-testing-system-quality-control)
12. [Glossary of Terms](#glossary-of-terms)

---

## The Big Picture

Imagine your app as a **recording studio** that also has a **robot coach** living inside it.

```
+------------------------------------------------------------------+
|                        THE USER'S BROWSER                         |
|                                                                   |
|  +------------------+   +------------------+   +---------------+  |
|  |  What they SEE   |   |  What they DO    |   | What happens  |  |
|  |  (HTML + CSS)    |   |  (Click, Talk)   |   | behind scenes |  |
|  |                  |   |                  |   | (JavaScript)  |  |
|  +------------------+   +------------------+   +---------------+  |
|                                                                   |
+-------------------------------+-----------------------------------+
                                |
                          The Internet
                                |
+-------------------------------v-----------------------------------+
|                         VERCEL SERVER                              |
|                                                                   |
|  +------------------+          +------------------------------+   |
|  | api/transcribe   |--------->| OpenAI Whisper               |   |
|  | (audio -> text)  |          | (Turns speech into writing)  |   |
|  +------------------+          +------------------------------+   |
|                                                                   |
|  +------------------+          +------------------------------+   |
|  | api/feedback     |--------->| OpenAI GPT-4o-mini           |   |
|  | (text -> advice) |          | (Reads text, gives coaching) |   |
|  +------------------+          +------------------------------+   |
|                                                                   |
|  +------------------+                                             |
|  | OPENAI_API_KEY   |  (The secret password, stored here only)    |
|  +------------------+                                             |
+-------------------------------------------------------------------+
```

**In plain English:** Your user opens a webpage. They practice a pitch while the app records them. When they stop, the audio gets sent to a server that converts it to text, then another AI reads that text and gives coaching advice. All of this happens in seconds.

---

## What Happens When Someone Opens the App

Here's the exact sequence, step by step:

### Step 1: The browser downloads files

```
Browser says: "Hey Vercel, give me pitchcraft-coach.vercel.app"

Vercel responds with:
  1. index.html     (the skeleton of the page)
  2. css/styles.css (the paint and decoration)
  3. js/app.js      (the brain that makes it interactive)
     -> which pulls in all other js/ files automatically
```

### Step 2: The page assembles itself

Think of it like building a house:
- **HTML** is the walls, floors, and rooms (structure)
- **CSS** is the paint, furniture, and lighting (appearance)
- **JavaScript** is the electricity and plumbing (behavior)

### Step 3: JavaScript wakes up

When the page finishes loading, `js/app.js` runs and does this:

```
"Okay, page is ready. Let me:
  1. Set up the initial state (everything starts at zero)
  2. Attach click handlers to all buttons
  3. Load any saved session history from localStorage
  4. Wait for the user to do something"
```

### Step 4: The landing page appears

The user sees the beautiful cinematic landing page with the golden thread design. Nothing else happens until they click "Enter the Studio."

---

## The Folder Structure (Your Filing Cabinet)

Think of your project folder like a well-organized office:

```
pitchcraft-coach/
│
├── index.html                 THE RECEPTION DESK
│                              The first thing the browser sees.
│                              Just the HTML skeleton - no logic, no styling.
│                              ~570 lines of pure structure.
│
├── css/
│   └── styles.css             THE INTERIOR DESIGNER
│                              Every color, font size, spacing, animation,
│                              and responsive layout rule lives here.
│                              ~3130 lines. The app's entire visual identity.
│
├── js/                        THE OFFICE BUILDING
│   │
│   ├── app.js                 THE RECEPTIONIST
│   │                          The main entry point. Opens the doors,
│   │                          introduces everyone, wires up all the buttons.
│   │                          Handles tab navigation between modules.
│   │
│   ├── data/
│   │   └── constants.js       THE FILING CABINET
│   │                          All the static data that never changes:
│   │                          - 5 session modes (elevator pitch, startup demo, etc.)
│   │                          - 12 lesson articles (TED talks, books, psychology)
│   │                          - 24 curveball questions across 4 categories
│   │                          - 5 speaker goals with lesson paths
│   │                          - 4 speaker archetypes with full profiles
│   │                          - AppState (the app's "current mood")
│   │
│   ├── services/              THE BACK OFFICE (does work, never talks to users)
│   │   │
│   │   ├── AccessibilityService.js    The ADA compliance officer.
│   │   │                              Makes screen readers work, manages focus.
│   │   │
│   │   ├── AnimationService.js        The choreographer.
│   │   │                              Handles CSS transitions, respects
│   │   │                              users who get motion sick.
│   │   │
│   │   ├── AudioCaptureService.js     The sound engineer.
│   │   │                              Asks for mic permission, records audio,
│   │   │                              can pause and resume the recording.
│   │   │
│   │   ├── TranscriptionService.js    The messenger.
│   │   │                              Takes the recorded audio blob and sends
│   │   │                              it to /api/transcribe. Gets text back.
│   │   │
│   │   ├── AiFeedbackService.js       The coaching coordinator.
│   │   │                              Sends transcript to /api/feedback.
│   │   │                              Gets structured coaching advice back.
│   │   │                              Also generates session titles.
│   │   │                              Contains the markdown-to-HTML renderer.
│   │   │
│   │   ├── SessionHistoryService.js   The archivist.
│   │   │                              Saves sessions to localStorage.
│   │   │                              Loads them back. Caps at 50 records.
│   │   │                              Validates data integrity.
│   │   │
│   │   └── StorageService.js          The note-taker.
│   │                                  Saves/loads personal notes to localStorage.
│   │
│   └── controllers/           THE FRONT OFFICE (talks to users via the DOM)
│       │
│       ├── LandingController.js       The greeter.
│       │                              Handles the "Enter the Studio" transition.
│       │
│       ├── StageController.js         The stage manager. THE BIG ONE.
│       │                              Owns the entire practice session:
│       │                              mode selection, timer, phases, curveballs,
│       │                              auto-recording, pause/resume, end session.
│       │
│       ├── RecordingPanelController.js  The post-production editor.
│       │                              After recording stops: triggers transcription,
│       │                              then AI feedback, then title generation.
│       │                              Manages loading states and error display.
│       │
│       ├── LibraryController.js       The librarian.
│       │                              Renders lesson cards, handles search,
│       │                              opens the reader view, manages notes.
│       │
│       ├── NavigatorController.js     The career counselor.
│       │                              Shows goal-based learning paths and tips.
│       │
│       ├── HistoryPanelController.js  The historian.
│       │                              Renders the sidebar session list,
│       │                              opens detail overlays, handles rename.
│       │
│       └── ArchetypesController.js    The personality profiler.
│                                      Renders archetype cards, opens the
│                                      drawer, connects to practice.
│
├── api/                       THE SECRET KITCHEN (runs on the server, not browser)
│   │
│   ├── transcribe.js          The translator.
│   │                          Receives audio from the browser.
│   │                          Attaches the secret API key.
│   │                          Sends to OpenAI Whisper.
│   │                          Returns text to the browser.
│   │
│   └── feedback.js            The coach's brain.
│                              Receives a prompt from the browser.
│                              Attaches the secret API key.
│                              Sends to OpenAI GPT-4o-mini.
│                              Returns coaching text to the browser.
│
├── tests/                     THE QUALITY CONTROL LAB
│                              26 test files, 220 individual checks.
│                              Runs automatically to catch bugs.
│
├── .env                       THE VAULT (your API key, never shared)
├── .env.example               THE VAULT'S LABEL (shows what goes inside)
├── vercel.json                THE DEPLOYMENT BLUEPRINT
├── package.json               THE SUPPLY LIST (what tools you need)
└── .gitignore                 THE "DO NOT SHIP" LIST
```

---

## How the Pieces Talk to Each Other

### The Import Chain

When `js/app.js` loads, it says "I need these other files." Those files say "I need these other files." It creates a tree:

```
app.js
├── imports constants.js (data)
├── imports AccessibilityService.js
├── imports LandingController.js
│   └── imports AnimationService.js
│   └── imports AccessibilityService.js
├── imports StageController.js
│   └── imports AudioCaptureService.js
│   └── imports RecordingPanelController.js
│       └── imports TranscriptionService.js
│       └── imports AiFeedbackService.js
│       └── imports SessionHistoryService.js
│       └── imports HistoryPanelController.js
│   └── imports HistoryPanelController.js
│   └── imports SessionHistoryService.js
├── imports LibraryController.js
├── imports NavigatorController.js
├── imports ArchetypesController.js
└── imports HistoryPanelController.js
```

The browser resolves all these imports automatically because we use `type="module"` on the script tag.

### The Communication Pattern

Services and controllers talk to each other like coworkers:

```
USER CLICKS "Start Session"
        |
        v
[StageController]  "Session starting! Let me set up everything."
        |
        |-- Updates AppState.session.status = 'running'
        |-- Shows the Active Session Deck
        |-- Starts the timer interval
        |-- Calls AudioCaptureService.requestMicrophone()
        |
        v
[AudioCaptureService]  "Mic access granted! Starting MediaRecorder."
        |
        v
[RecordingPanelController]  "I'll announce 'Recording started' to screen readers."
        |
        v
[AccessibilityService]  "Done. Announced via ARIA live region."
```

---

## The Frontend (What the User Sees)

### The Five Views (Tabs)

Your app has five main "rooms" the user can visit:

| Tab | What It Shows | Controller |
|-----|---------------|------------|
| **Stage** | Practice timer, recording, curveballs | StageController |
| **Library** | Lessons, articles, personal notes | LibraryController |
| **Navigator** | Goal-based learning paths | NavigatorController |
| **Archetypes** | Speaker personality profiles | ArchetypesController |
| *(Landing)* | The intro page (before entering studio) | LandingController |

Only one tab is visible at a time. The others have `hidden` attribute. Clicking a tab in the header triggers `switchToModule()` in `app.js`.

### The Active Session Deck

During a recording session, the Stage transforms into a focused control panel:

```
+-----------------------------------------------+
|                                               |
|          . 04:32                              |
|         (red dot = recording)  REMAINING      |
|                                               |
|           .....                               |
|         (waveform animation)                  |
|                                               |
|    [====..........................]           |
|    (phase progress bar)                       |
|                                               |
|      [ Pause ]    [ Stop & Analyze ]          |
|                                               |
+-----------------------------------------------+
```

This replaces the mode selection grid, curveball toggle, and start button while a session is active.

### The Dark Gold Aesthetic

Every visual element uses CSS custom properties (variables):

```css
--color-studio-bg:      #1a1208   (deep dark brown - background)
--color-studio-surface: #241c12   (slightly lighter - cards)
--color-studio-primary: #c8922a   (golden - accents, buttons, headings)
--color-studio-text:    #f5e6c8   (warm cream - body text)
--color-studio-muted:   #9a8b74   (faded gold - secondary text)
--color-studio-border:  #3a2e20   (subtle brown - borders)
```

This means if you ever want to change the color scheme, you change it in ONE place (the `:root` block in `css/styles.css`) and the entire app updates.

---

## The Backend (The Secret Kitchen)

### Why Do We Need a Backend?

**The problem:** You need an OpenAI API key to use Whisper and GPT. If you put that key in your JavaScript files, anyone who opens DevTools in their browser can steal it and rack up charges on your account.

**The solution:** The API key lives ONLY on the server (Vercel). The browser never sees it.

### How the Proxy Works

```
BROWSER                          SERVER (Vercel)                    OPENAI
  |                                |                                 |
  |  "Here's my audio blob"       |                                 |
  |-------- POST /api/transcribe ->|                                 |
  |                                |  "Here's the audio + MY key"    |
  |                                |---------- POST Whisper API ---->|
  |                                |                                 |
  |                                |  "Here's the transcript"        |
  |                                |<--- Response -------------------|
  |  "Here's your transcript"      |                                 |
  |<------- { success, text } -----|                                 |
```

The browser sends raw data. The server adds the secret key. OpenAI never talks to the browser directly.

### The Two API Routes

**`/api/transcribe`** — For turning speech into text
- Receives: Audio file (multipart form data)
- Adds: API key header
- Forwards to: `https://api.openai.com/v1/audio/transcriptions`
- Returns: `{ success: true, text: "What the user said..." }`

**`/api/feedback`** — For getting AI coaching
- Receives: JSON with messages array (system prompt + transcript)
- Adds: API key header
- Forwards to: `https://api.openai.com/v1/chat/completions`
- Returns: `{ success: true, content: "## Pitch Structure\n..." }`

---

## The AI Brain (OpenAI Integration)

### Whisper (Speech-to-Text)

**What it does:** Takes a recording of someone talking and converts it into written text.

**How we use it:**
1. User practices their pitch (browser records audio as WebM format)
2. When they stop, the audio blob is sent to our `/api/transcribe` endpoint
3. Our server forwards it to Whisper with the model name `whisper-1`
4. Whisper returns the transcript as plain text
5. We display it in the session summary

### GPT-4o-mini (Coaching Feedback)

**What it does:** Reads the transcript and generates structured coaching advice.

**The system prompt tells GPT to evaluate:**
- **Pitch Structure** — Did they hit Hook, Problem, Solution, and CTA?
- **Delivery Quality** — Clarity, confidence, pacing
- **Filler Words** — "um", "uh", "like", "you know", "basically"
- **Actionable Suggestions** — 3-5 specific things to improve

**The response comes back as markdown** which we render into styled HTML using our custom `renderMarkdown()` function in `AiFeedbackService.js`.

### Session Title Generation

After coaching feedback is generated, a second lightweight GPT call generates a 5-8 word title for the session (e.g., "SaaS Pricing Strategy Elevator Pitch"). This uses the same `/api/feedback` endpoint but with a different prompt and `max_tokens: 30`.

---

## Data & Memory (How the App Remembers Things)

### AppState (Short-term Memory)

Lives in RAM. Disappears when you close the tab. Controls what the UI shows RIGHT NOW.

```javascript
AppState = {
  screen: 'landing',        // Which screen is showing
  activeModule: 'stage',    // Which tab is active
  session: {
    mode: null,             // Which practice mode is selected
    status: 'idle',         // idle | running | paused | completed
    elapsed: 0,             // Seconds elapsed
    phasesCompleted: [],    // Which phases were finished
    curveballsShown: [],    // Which curveball IDs were used
    recording: false,       // Is the mic active?
    transcript: null        // Text from Whisper (after session)
  },
  activeGoal: null,         // Selected goal in Navigator
  openLessonId: null,       // Currently reading lesson
  openArchetypeId: null,    // Currently viewing archetype
  notes: [],                // Personal notes array
  searchQuery: '',          // Library search text
  curveballsEnabled: true,  // Toggle for curveball interruptions
  historyPanelOpen: false   // Is the history sidebar open?
}
```

### localStorage (Long-term Memory)

Persists across page refreshes and browser restarts. Stored on the user's device.

**Two storage keys:**
- `pitchcraft_notes` — Personal notes array (managed by StorageService)
- `pitchcraft_history` — Session records array, max 50 (managed by SessionHistoryService)

**A session record looks like:**
```javascript
{
  id: "1722934567890-a8f3k2m1",   // Unique identifier
  timestamp: "2026-08-06T14:30:00Z", // When it happened
  sessionMode: "elevator-60",      // Which mode was used
  sessionTitle: "SaaS Pricing Pitch", // AI-generated or manually set
  duration: 58,                    // Seconds (rounded down)
  phasesCompleted: ["Hook", "Problem", "Solution"],
  curveballsFaced: 1,
  transcript: "Hi everyone, today I want to talk about...",
  aiFeedback: "## Pitch Structure\n### Hook\nStrong opening..."
}
```

---

## The Session Lifecycle (Start to Finish)

Here's the complete journey of a practice session, told as a story:

### Act 1: Setup

```
User selects "60-Second Elevator Pitch" mode
  -> StageController.selectMode('elevator-60') fires
  -> Mode card gets aria-checked="true" (golden highlight)
  -> Phase preview appears: Hook -> Problem -> Solution -> CTA
  -> "Start Session" button becomes enabled (no longer grayed out)
```

### Act 2: Recording Begins

```
User clicks "Start Session"
  -> StageController.startSession() fires
  -> AppState.session.status = 'running'
  -> Mode selection grid HIDES
  -> Curveball toggle HIDES
  -> Active Session Deck APPEARS (timer + waveform + controls)
  -> Timer starts counting down from 01:00
  -> Button text changes to "Restart Session"
  -> Header changes to "Active Session: 60-Second Elevator Pitch"
  -> _autoStartRecording() called (async, non-blocking):
       -> AudioCaptureService.requestMicrophone()
       -> Browser shows "Allow microphone?" popup
       -> If granted: MediaRecorder.start() begins capturing audio
       -> RecordingPanelController.show() announces to screen readers
       -> Red dot pulses, waveform animates
```

### Act 3: The Session (Running)

```
Every 1000ms, StageController.tick() fires:
  -> Calculates elapsed time using performance.now() (accurate!)
  -> Updates timer display (countdown: 00:45, 00:44, 00:43...)
  -> Checks which phase we're in (updates phase bar)
  -> Checks if a curveball is scheduled for this moment
  -> If timer hits 0: auto-calls endSession()

If curveball fires:
  -> Timer PAUSES
  -> MediaRecorder PAUSES (so the curveball silence isn't recorded)
  -> Curveball overlay appears with investor question
  -> User reads question, clicks "I've Got This — Continue"
  -> Timer and MediaRecorder RESUME
  -> Next curveball is scheduled

If user clicks "Pause":
  -> Timer freezes
  -> MediaRecorder.pause() called
  -> Red dot stops pulsing, waveform freezes
  -> Button changes to "Resume"

If user clicks "Resume":
  -> Timer resumes from where it was
  -> MediaRecorder.resume() called
  -> Animations restart
  -> Button changes back to "Pause"
```

### Act 4: Session Ends

```
User clicks "Stop & Analyze" (or timer reaches 0)
  -> StageController.endSession() fires
  -> Timer stops
  -> Active Session Deck HIDES
  -> Mode selection and curveball toggle REAPPEAR
  -> Session summary panel APPEARS
  -> RecordingPanelController.handleStop() fires:

      TRANSCRIPTION PHASE:
        -> AudioCaptureService.stop() packages audio into a Blob
        -> Shows loading overlay: "Transcribing your audio waveform..."
        -> fetch('/api/transcribe', { body: audioFormData })
        -> Server adds API key, forwards to Whisper
        -> Gets text back, displays in summary
        -> Saves transcript to session record

      AI FEEDBACK PHASE:
        -> Shows "Generating coaching feedback..." in feedback section
        -> Builds system prompt (tailored to session mode)
        -> fetch('/api/feedback', { body: { messages, model, temperature } })
        -> Server adds API key, forwards to GPT-4o-mini
        -> Gets markdown feedback back
        -> Renders markdown -> HTML using custom parser
        -> Displays in session summary AND session detail overlay
        -> Saves to session record

      TITLE GENERATION PHASE (background, non-blocking):
        -> Another fetch('/api/feedback') with title-generation prompt
        -> Gets 5-8 word title
        -> Updates session record in history
        -> Refreshes history panel if open
```

### Act 5: Review & History

```
Session is now saved in localStorage (SessionHistoryService)
User can:
  -> Click "History" toggle to see past sessions in sidebar
  -> Click any session to open detail overlay (stats, transcript, feedback)
  -> Click the pencil icon to rename a session
  -> Start a new session (button now says "Restart Session")
```

---

## How Deployment Works (Going Live)

### What is Vercel?

Vercel is a hosting platform. Think of it as a building where your website lives. When someone types your URL, Vercel serves them your files.

**Special power:** Vercel can also run small programs (serverless functions) — that's where your `/api/transcribe` and `/api/feedback` live.

### What Happens When You Deploy

```
You run: npx vercel --prod

Vercel does:
  1. Uploads your project files
  2. Detects the /api/ folder -> creates serverless functions
  3. Everything else (html, css, js) -> serves as static files
  4. Assigns your URL (pitchcraft-coach.vercel.app)
  5. Reads environment variables from its dashboard (OPENAI_API_KEY)
  6. Done. Live in ~30 seconds.
```

### Local vs Production

| Aspect | Local (`npm run dev`) | Production (Vercel) |
|--------|----------------------|---------------------|
| URL | `http://localhost:3000` | `https://your-app.vercel.app` |
| API Key source | `.env` file | Vercel Dashboard |
| Serverless functions | Simulated by Vercel CLI | Real Vercel infrastructure |
| Speed | Fast (no network) | Fast (global CDN) |
| Who can access | Only you | Everyone with the URL |

---

## The Testing System (Quality Control)

### What Are Tests?

Tests are small programs that check if your app works correctly. They run your code with known inputs and verify the outputs match expectations.

**Analogy:** Imagine hiring someone to click every button in your app 220 times and check nothing breaks. That's what `npm test` does in 6 seconds.

### Two Types of Tests

**Example-based tests** (`*.test.js`):
> "When I save a session with mode 'elevator-60' and 58 seconds elapsed, the saved record should have duration: 58"

**Property-based tests** (`*.property.test.js`):
> "For ANY random session data I generate (thousands of variations), the history should NEVER exceed 50 records"

### Running Tests

```bash
npm test            # Run all 220 tests once (takes ~6 seconds)
npm run test:watch  # Re-runs automatically when you change files
```

If all tests pass: `Test Files  26 passed (26) / Tests  220 passed (220)`

If something breaks: The failing test tells you exactly which file and line has the problem.

---

## Glossary of Terms

| Term | What It Actually Means |
|------|----------------------|
| **SPA** | Single Page Application — one HTML page that swaps content dynamically |
| **ES Module** | A JavaScript file that can `import` and `export` things |
| **DOM** | Document Object Model — the browser's representation of your HTML as objects |
| **API** | Application Programming Interface — a URL you can send data to and get data back |
| **Serverless Function** | A small program that runs on a server only when called (no always-on server) |
| **localStorage** | A browser feature that saves key-value data permanently on the user's device |
| **AppState** | Our central object that tracks everything the app currently "knows" |
| **Controller** | Code that connects user actions to business logic and updates the UI |
| **Service** | Code that does background work (API calls, data storage) without touching the UI |
| **Blob** | A chunk of binary data (like an audio file) stored in memory |
| **MediaRecorder** | Browser API that records audio/video from a microphone or camera |
| **WebM** | An audio/video file format (what MediaRecorder produces) |
| **Whisper** | OpenAI's speech-to-text AI model |
| **GPT-4o-mini** | OpenAI's fast, cheap language model (reads text, generates text) |
| **Markdown** | A simple formatting syntax (`**bold**`, `## Heading`, `- list item`) |
| **ARIA** | Accessibility attributes that help screen readers understand your UI |
| **WCAG AA** | Web Content Accessibility Guidelines (the standard for accessible websites) |
| **BEM** | Block-Element-Modifier — a CSS naming convention (`.block__element--modifier`) |
| **Custom Properties** | CSS variables (`--color-primary: #c8922a`) reusable across the stylesheet |
| **Vitest** | The test runner — executes test files and reports pass/fail |
| **fast-check** | A library for property-based testing (generates random test inputs) |
| **jsdom** | A fake browser environment used during testing (no real browser needed) |
| **Vercel** | The hosting platform where the app is deployed |
| **Environment Variable** | A secret value stored on the server, not in code (`process.env.OPENAI_API_KEY`) |
| **fetch()** | JavaScript function for making HTTP requests (like sending mail to a server) |
| **async/await** | JavaScript syntax for waiting for slow operations (API calls) without freezing |
| **DOMContentLoaded** | A browser event that fires when the HTML is fully parsed and ready |
| **Hidden attribute** | HTML attribute that hides an element (`<div hidden>` = invisible) |
| **Focus trap** | When Tab key cycles only within an overlay (can't escape to background) |
| **Curveball** | A surprise question that interrupts the practice session to test composure |
| **Phase** | A structural segment of a pitch (e.g., Hook, Problem, Solution, CTA) |

---

## Quick Reference Card

```
TO START WORKING:           npm run dev
TO RUN TESTS:               npm test
TO DEPLOY:                  npx vercel --prod
TO ADD A FEATURE:           1. Read the relevant controller/service
                            2. Make changes
                            3. Run npm test
                            4. Commit with git

THE API KEY LIVES:          .env (local) / Vercel Dashboard (production)
THE API KEY IS USED IN:     api/transcribe.js and api/feedback.js ONLY
THE USER NEVER SEES:        The API key, the server code, the .env file

STYLING LIVES IN:           css/styles.css (one file, ~3130 lines)
HTML MARKUP LIVES IN:       index.html (one file, ~570 lines)
JAVASCRIPT LIVES IN:        js/ folder (16 files, organized by responsibility)
SERVERLESS FUNCTIONS:       api/ folder (2 files, run on Vercel's servers)
```

---

*Last updated: August 2026*
*Total codebase: ~19 files of source code, 220 automated tests, deployed on Vercel*
