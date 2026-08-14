# Requirements Document

## Introduction

PitchCraft & Eloquence Studio is a modern, single-page web application designed to help users improve their public speaking and communication skills. It combines an interactive speaking timer with phased narrative guidance, a curated library of communication lessons, a personalized goal navigator, and case studies of expert communicators. The app features a two-tier visual identity: a grand, cinematic landing screen with a painterly high-art aesthetic that announces the prestige of the studio, and a calmer nature-inspired organic palette throughout the interior modules to maintain focus and calm during practice sessions.

## Glossary

- **App**: The PitchCraft & Eloquence Studio single-page web application
- **Stage**: The Interactive Stage module — the timer, phase visualizer, and prompt engine
- **Timer**: The countdown or count-up clock component within the Stage
- **Phase_Indicator**: The visual progress bar and narrative phase markers shown during a session
- **Session**: A single timed speaking practice run initiated by the user
- **Curveball**: A randomly selected prompt or question injected mid-session to simulate audience interruption
- **Library**: The Library of Eloquence module containing curated lessons, book notes, and lecture content
- **Lesson**: A structured learning unit within the Library covering communication topics
- **Navigator**: The Personalized Goal Navigator module
- **Goal**: A user-selected speaking objective (e.g., funding pitch, technical explanation, casual networking)
- **Archetype**: A communicator profile within the Communicator Archetypes module
- **Archetype_Card**: A visual case-study card presenting one expert communicator style
- **User**: A person using the App in a browser session
- **Landing_Screen**: The full-viewport entry screen displayed before the user enters the main Studio; styled with a dramatic, painterly high-art aesthetic and presenting the "Pitch & Eloquence." wordmark, subtitle, and "Enter the Studio" CTA

---

## Requirements

### Requirement 1: Session Mode Selection

**User Story:** As a user, I want to choose a speaking session format before I start, so that the timer and phase guidance match the type of presentation I am preparing for.

#### Acceptance Criteria

1. THE App SHALL provide the following session modes for user selection: 60-second elevator pitch, 5-minute startup demo, 15-minute presentation, 30-minute deep-dive presentation, and Free Mode.
2. WHEN a user selects a session mode, THE Stage SHALL display the expected phase breakdown for that mode before the session begins.
3. WHEN a user selects Free Mode, THE Timer SHALL count upward without a fixed end time and THE Phase_Indicator SHALL remain hidden.
4. WHEN a user has not selected a session mode, THE Stage SHALL prevent the session from starting and SHALL display a mode-selection prompt.

---

### Requirement 2: Interactive Timer and Phase Visualization

**User Story:** As a user, I want a clear visual representation of where I am in my narrative arc during a session, so that I can pace myself and stay on track.

#### Acceptance Criteria

1. WHEN a session starts, THE Timer SHALL begin counting down from the duration defined by the selected session mode.
2. WHILE a session is active, THE Phase_Indicator SHALL display the current narrative phase (e.g., Introduction, Problem, Solution, Call to Action) and highlight the active phase in real time.
3. WHILE a session is active, THE App SHALL update the Phase_Indicator position continuously as the Timer progresses.
4. WHEN the Timer reaches zero, THE Stage SHALL pause the session, display a completion state, and present a session summary.
5. WHEN a user pauses a session manually, THE Timer SHALL stop and THE Stage SHALL display a pause overlay with immediate practical speaking advice.
6. IF a session ends without the user completing all defined phases, THEN THE Stage SHALL display which phases were not reached in the session summary.

---

### Requirement 3: Dynamic Curveball Prompts

**User Story:** As a user, I want to receive unexpected questions or challenges during my session, so that I can practice handling real-world audience interruptions.

#### Acceptance Criteria

1. WHILE a session is active and the selected mode is not Free Mode, THE Stage SHALL randomly trigger a Curveball at least once per session at an unpredictable interval.
2. WHEN a Curveball is triggered, THE Stage SHALL display the Curveball prompt overlaying the Stage and SHALL pause the Timer.
3. WHEN a Curveball is displayed, THE App SHALL present one practical piece of advice alongside the prompt to help the user formulate a response.
4. WHEN a user dismisses a Curveball, THE Stage SHALL resume the Timer from where it paused.
5. THE App SHALL maintain a pool of at least 20 distinct Curveball prompts covering a variety of topic categories (audience skepticism, clarification requests, pivots, personal challenges).
6. IF the same Curveball prompt has already been shown in the current session, THEN THE Stage SHALL select a different prompt to avoid repetition.

---

### Requirement 4: Library of Eloquence — Lesson Catalog

**User Story:** As a user, I want to browse curated communication lessons, so that I can deepen my understanding of public speaking techniques and psychology.

#### Acceptance Criteria

1. THE Library SHALL display a catalog of Lessons organized into categories including: TED Talk insights, communication book summaries, foundational human psychology, and personal note entries.
2. WHEN a user selects a Lesson, THE Library SHALL display the full lesson content including title, source reference, key takeaways, and actionable techniques.
3. THE Library SHALL support a minimum of 10 pre-authored Lessons at launch.
4. WHEN a user enters text in the Library search field, THE Library SHALL filter visible Lessons to those whose title or content matches the search text within 300ms of the last keystroke.
5. WHEN a user adds a personal note entry, THE App SHALL persist the note in the browser's local storage and display it within the Library catalog.
6. IF a user clears browser local storage, THEN THE App SHALL display an empty personal notes section and SHALL not display an error state.

---

### Requirement 5: Personalized Goal Navigator

**User Story:** As a user, I want to select a speaking goal, so that the App provides a tailored learning path and advice relevant to my specific objective.

#### Acceptance Criteria

1. THE Navigator SHALL present a set of selectable Goals including: Funding Pitch, Technical Explanation, Casual Networking, Inspirational Talk, and Job Interview.
2. WHEN a user selects a Goal, THE Navigator SHALL display a curated lesson path containing ordered Lessons from the Library relevant to that Goal.
3. WHEN a user selects a Goal, THE Navigator SHALL display goal-specific tips and preparation advice distinct from the general Library content.
4. WHEN a user changes their selected Goal, THE Navigator SHALL update the lesson path and tips to reflect the new Goal without requiring a page reload.
5. THE Navigator SHALL allow a user to select exactly one active Goal at a time.
6. WHILE a Goal is active, THE Stage SHALL display the Goal name in the session header as contextual framing for the session.

---

### Requirement 6: Communicator Archetypes

**User Story:** As a user, I want to explore profiles of expert communicator styles, so that I can understand and model effective speaking techniques.

#### Acceptance Criteria

1. THE App SHALL display a minimum of 4 Archetype_Cards at launch, each representing a distinct expert communicator style (e.g., The Visionary, The Deep-Tech Educator, The Empathetic Storyteller, The Challenger).
2. WHEN a user selects an Archetype_Card, THE App SHALL display a detailed profile including: style description, signature techniques, strengths, ideal contexts, and an example excerpt or scenario.
3. THE App SHALL include at least one illustrative line-art or cartoon visual per Archetype_Card to reinforce the communicator's personality and style.
4. WHEN a user views an Archetype_Card detail, THE App SHALL display a "Practice with this style" action that pre-configures a Stage session with mode and Curveball prompts aligned to that Archetype's context.
5. IF a user activates "Practice with this style" from an Archetype_Card detail, THEN THE Navigator SHALL set the contextually closest Goal as the active Goal for that session.

---

### Requirement 7: Aesthetic and UI Standards

**User Story:** As a user, I want the interface to convey distinct visual identities for the landing entry point and the interior practice modules, so that the landing screen commands immediate attention and prestige while the interior modules maintain a calm, focused environment for practice.

#### Acceptance Criteria

1. THE App SHALL apply a nature-inspired color palette using sage green, warm earth tones, slate, and cream as the primary visual theme throughout all interior modules (Stage, Library, Navigator, Archetypes).
2. THE App SHALL use smooth CSS transitions of 200ms to 400ms duration for all module navigation, overlay appearances, and interactive state changes.
3. THE App SHALL render all text content using at minimum two complementary typefaces: one serif for headings and one sans-serif for body copy.
4. THE App SHALL display the full interface without horizontal scrolling on viewport widths of 375px and above.
5. THE App SHALL display each module in a single continuous page without full-page navigation reloads, consistent with a single-page application architecture.
6. THE App SHALL include line-art or cartoon illustrations on the Landing_Screen, the Library module header, and each Archetype_Card to reinforce the artistic identity of the product.
7. THE Landing_Screen SHALL apply a visually distinct aesthetic from the interior modules, using a dramatic, painterly, high-art treatment (rich textures, deep tones, cinematic composition) that communicates prestige and grandeur.
8. THE App SHALL not carry the dark painterly palette of the Landing_Screen into any interior module; the visual transition SHALL serve as a deliberate tonal shift from grand entrance to focused practice environment.

---

### Requirement 8: Accessibility

**User Story:** As a user with accessibility needs, I want the App to support keyboard navigation and screen reader announcements, so that I can use all features without relying solely on a mouse or visual cues.

#### Acceptance Criteria

1. THE App SHALL ensure all interactive controls (buttons, mode selectors, lesson cards, Archetype_Cards) are reachable and activatable via keyboard Tab and Enter keys.
2. WHEN a Curveball prompt appears, THE App SHALL move keyboard focus to the Curveball overlay and SHALL announce the prompt text via an ARIA live region.
3. WHEN the Timer value changes each second, THE App SHALL NOT announce each individual tick via a screen reader, and SHALL only announce phase transitions via an ARIA live region.
4. THE App SHALL provide visible focus indicators on all interactive elements that meet WCAG 2.1 AA contrast requirements.
5. THE App SHALL use semantic HTML elements (headings, landmarks, lists) to convey document structure to assistive technologies.

---

### Requirement 9: Captivating Landing Screen

**User Story:** As a user visiting the App for the first time, I want to be greeted by a grand, visually arresting entry screen, so that I immediately understand I am entering a prestigious, world-class speaking studio and feel motivated to engage.

#### Acceptance Criteria

1. WHEN the App loads in a browser, THE Landing_Screen SHALL occupy the full viewport width and height before any interior module is displayed.
2. THE Landing_Screen SHALL display the wordmark "Pitch & Eloquence." rendered in a large commanding serif display typeface as the primary focal element of the screen.
3. THE Landing_Screen SHALL display the subtitle "The Public Speaking & Psychology Studio" in a secondary typographic treatment positioned directly beneath or near the wordmark.
4. THE Landing_Screen SHALL render a hero visual — an oil-painting-style or painterly textured artwork — as the full-bleed background of the landing viewport, conveying cinematic depth, dramatic lighting, and museum-quality visual gravitas.
5. THE Landing_Screen SHALL display a prominently styled "Enter the Studio" call-to-action button that is immediately visible without scrolling on any viewport of 375px width or above.
6. WHEN a user activates the "Enter the Studio" button, THE App SHALL perform a smooth animated transition — such as a dissolve, fade, or cinematic reveal — from the Landing_Screen into the main Studio interface, with a transition duration between 400ms and 800ms.
7. WHEN a user activates the "Enter the Studio" button, THE App SHALL hide the Landing_Screen and display the main Studio interface without a full page reload.
8. THE Landing_Screen SHALL use a typographic hierarchy in which the wordmark font size is at minimum 2.5 times larger than the subtitle font size on desktop viewports of 1024px width and above.
9. THE Landing_Screen SHALL apply deep, rich tones (such as dark ochre, burnt sienna, raw umber, or near-black) consistent with a high-art oil-painting palette, distinct from the sage green and earth-tone palette used in the interior modules.
10. THE Landing_Screen SHALL present its primary content (wordmark, subtitle, and CTA button) with sufficient contrast against the painterly background to meet WCAG 2.1 AA contrast requirements.
11. IF the App is accessed on a reduced-motion preference (prefers-reduced-motion: reduce), THEN THE App SHALL replace the animated Landing_Screen transition with an immediate cut to the main Studio interface.
