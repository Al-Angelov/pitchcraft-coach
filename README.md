<div align="center">

# 🎙️ PitchCraft &amp; Eloquence Studio

### The Public Speaking &amp; Psychology Studio

*A private, AI-powered practice ground where psychology meets performance.*

<br />

**Rehearse timed pitches · Face live curveballs · Get instant AI coaching · Master the craft of speaking.**

<br />

![Vanilla JS](https://img.shields.io/badge/Vanilla%20JS-ES2020%2B-c8922a?style=flat-square)
![Vite](https://img.shields.io/badge/Build-Vite%205-646cff?style=flat-square)
![Firebase](https://img.shields.io/badge/Auth-Firebase-ffca28?style=flat-square)
![OpenAI](https://img.shields.io/badge/AI-Whisper%20%2B%20GPT--4o--mini-412991?style=flat-square)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-220%20passing-3fb950?style=flat-square)
![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-3fb950?style=flat-square)

</div>

---

## ✨ Overview

> *"In an age of infinite noise and shrinking attention, the ability to communicate with clarity, conviction, and compassion is no longer a soft skill — it is the defining skill of our time."*

**PitchCraft &amp; Eloquence Studio** bridges the gap between having something worth saying and saying it well. It's a browser-based studio where you can rehearse presentations under realistic pressure, receive structured coaching feedback from AI, study the psychology of great communication, and discover your own speaking archetype — all without a live audience.

The experience blends decades of communication research (Kahneman's peak-end rule, Cuddy's embodied cognition, Sinek's golden circle, cognitive load theory) with a deliberate-practice environment and real-time AI analysis.

---

## 🎯 Core Features

### 🎤 Practice Stage
The heart of the studio. Choose a timed session mode and rehearse against structured phases:

| Mode | Duration | Structure |
|------|----------|-----------|
| **Elevator Pitch** | 1 min | Hook → Problem → Solution → CTA |
| **Quick Pitch** | 3 min | Hook → Problem → Solution → Proof → CTA |
| **Startup Demo** | 5 min | Intro → Problem → Solution → Demo → CTA |
| **Presentation** | 15 min | Intro → Context → Core → Synthesis → Close |
| **Free Mode** | ∞ | *(Coming soon)* |

- **Auto-recording** — microphone capture begins the moment you start
- **Live curveballs** — surprise investor-style questions interrupt mid-session to test composure
- **Phase indicator** — a visual progress bar tracks you through each structural beat
- **Pause / Resume** — freezes both the timer and the recording in sync

### 🤖 AI Coaching
When you hit **Stop &amp; Analyze**, your audio flows through a secure pipeline:

1. **Transcription** — audio is transcribed by **OpenAI Whisper**
2. **Coaching Feedback** — the transcript is analyzed by **GPT-4o-mini**, which evaluates pitch structure, delivery quality, filler words, and returns 3–5 actionable suggestions
3. **Smart Naming** — an AI-generated session title is created automatically

### 📚 Eloquence Library
A curated knowledge base of lessons distilled from landmark **TED talks**, **communication books**, and **psychology research** — complete with an immersive reader view, search, and personal notes.

### 🧭 Goal Navigator
Goal-based strategic playbooks with visual framework diagrams, deep tactical breakdowns (objective, approach, execution, real-world case studies, and the psychology behind them), and a curated lesson path that deep-links straight into the Library. Goals include Funding Pitch, Technical Explanation, Casual Networking, Inspirational Talk, and Job Interview.

### 🎭 Speaker Archetypes
Discover your communication style through four richly-drawn archetypes — **The Visionary**, **The Deep-Tech Educator**, **The Empathetic Storyteller**, and **The Challenger** — each with signature techniques, ideal contexts, and a one-click path to practice in that style.

### 🔐 Accounts &amp; Free Sessions
Firebase-backed authentication with a free-tier credit system: create an account to unlock the Stage and receive **15 free coaching sessions**, tracked live in an IDE-style status bar.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript (ES2020+), HTML5, CSS3 — no framework |
| **Build** | Vite 5 (dev server + production bundle) |
| **Auth &amp; Data** | Firebase Authentication + Cloud Firestore |
| **AI — Transcription** | OpenAI Whisper (`whisper-1`) |
| **AI — Coaching &amp; Naming** | OpenAI GPT-4o-mini |
| **Audio** | Web Audio API + MediaRecorder (with pause/resume) |
| **Local Storage** | Browser `localStorage` (session history &amp; notes) |
| **Backend** | Vercel serverless functions (secure API proxy) |
| **Hosting** | Vercel (static frontend + serverless) |
| **Testing** | Vitest + fast-check (property-based) + jsdom — 220 tests |
| **Typography** | Playfair Display (serif) + Inter (sans-serif) |
| **Design** | Dark-academia aesthetic · WCAG 2.1 AA · responsive to 375px |

---

## 🏗️ Architecture

```
   Browser (Client)                         Vercel (Server)
 ┌────────────────────┐                  ┌────────────────────────┐
 │  index.html         │                  │  api/transcribe.js      │
 │  css/styles.css     │  ── fetch ──▶    │    (Whisper proxy)      │
 │  js/app.js          │                  ├────────────────────────┤
 │  js/services/*      │  ── fetch ──▶    │  api/feedback.js        │
 │  js/controllers/*   │                  │    (GPT-4o-mini proxy)  │
 │  js/config/firebase │                  ├────────────────────────┤
 └────────┬───────────┘                  │  process.env            │
          │                              │  OPENAI_API_KEY (secret)│
          ▼                              └────────────────────────┘
   localStorage  +  Firebase (Auth · Firestore credits)
```

**Why this design?** The OpenAI API key never touches the browser — all AI calls are proxied through Vercel serverless functions that inject the secret server-side. The frontend stays framework-free and fast, state flows one way (`AppState → DOM`), and every service is a simple, testable plain object.

---

## 📁 Project Structure

```
pitchcraft-coach/
├── index.html                  # App shell &amp; markup
├── css/
│   └── styles.css              # Complete stylesheet (dark-academia theme)
├── js/
│   ├── app.js                  # Entry point · SPA routing · init
│   ├── config/
│   │   └── firebase.js         # Firebase init (reads VITE_ env vars)
│   ├── data/
│   │   ├── constants.js        # Modes, lessons, curveballs, goals, archetypes, AppState
│   │   └── playbooks.js        # Navigator strategic playbook content
│   ├── services/               # Stateless logic (audio, AI, storage, auth, a11y)
│   └── controllers/            # UI controllers (stage, library, navigator, etc.)
├── api/
│   ├── transcribe.js           # Serverless: audio → Whisper
│   └── feedback.js             # Serverless: transcript → GPT-4o-mini
├── tests/                      # Vitest + fast-check suite (220 tests)
├── .env.example                # Environment variable template
├── vite.config.js              # Vite build configuration
├── vercel.json                 # Vercel deployment configuration
└── package.json                # Scripts &amp; dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- An **OpenAI API key** ([platform.openai.com](https://platform.openai.com/))
- A **Firebase project** with Authentication + Firestore enabled ([console.firebase.google.com](https://console.firebase.google.com/))

### 1. Install
```bash
git clone <your-repo-url>
cd pitchcraft-coach
npm install
```

### 2. Configure environment
Copy the template and fill in your keys:
```bash
cp .env.example .env
```

```dotenv
# Server-side (used by Vercel serverless functions)
OPENAI_API_KEY=sk-...

# Firebase web config (client-side, injected by Vite — not secret)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> **Note:** The Firebase web config is safe to expose — it identifies your project rather than granting access. Security is enforced by Firebase Auth settings and Firestore rules. The OpenAI key stays server-side and is never shipped to the browser.

### 3. Run locally
```bash
npm run dev          # Vite dev server (frontend) → http://localhost:3000
npm run dev:vercel   # Vercel dev (runs the /api serverless functions too)
```

### 4. Test
```bash
npm test             # Run the full suite once
npm run test:watch   # Watch mode
```

### 5. Build &amp; deploy
```bash
npm run build        # Produces the static bundle in dist/
npx vercel --prod    # Deploy to Vercel
```

On Vercel, set `OPENAI_API_KEY` and all `VITE_FIREBASE_*` variables in **Project Settings → Environment Variables**, then add your production domain to Firebase **Authentication → Authorized domains**.

---

## 🔒 How Credits Work

- New users automatically receive **15 free sessions** (stored in Firestore).
- Starting a session requires being signed in with `credits > 0`.
- Each successfully transcribed session deducts **1 credit** (atomic update).
- The live count is shown in the bottom status bar and updates reactively.

---

## 🎨 Design Philosophy

PitchCraft embraces a **dark-academia** aesthetic — deep espresso backgrounds, warm antique-gold accents, elegant serif display type, and generous spacing. Every animation respects `prefers-reduced-motion`, all interactive elements meet WCAG 2.1 AA contrast and focus standards, and the layout stays graceful down to 375px.

---

<div align="center">

**Created by Alexander Angelov**

*Great speaking is not a gift. It is a practice.*

</div>
