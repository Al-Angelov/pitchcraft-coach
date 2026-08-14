# Requirements Document

## Introduction

This feature adds persistent session history to PitchCraft & Eloquence Studio. Upon completing a practice session, the application packages session data (mode, duration, phases completed, curveballs faced) and saves it to browser localStorage. A dedicated review interface allows users to browse past sessions and view detailed summaries. Placeholder fields for transcript and AI feedback are included for future integration.

## Glossary

- **Session_History_Service**: The service responsible for saving, loading, and managing session history records in browser localStorage.
- **History_Panel**: The collapsible side panel UI component that displays a list of past sessions sorted by date/time.
- **Session_Record**: A data object containing: id, timestamp, session_mode, duration, phases_completed, curveballs_faced, transcript (placeholder), and ai_feedback (placeholder).
- **Session_Detail_View**: The modal or dedicated view that displays the full details of a selected past session.
- **Stage_Module**: The existing application module that manages session modes, timer, phases, and curveball questions.
- **StorageService**: The existing localStorage abstraction service used for saving personal notes.
- **AppState**: The existing global state management object for the application.

## Requirements

### Requirement 1: Save Session Data on Completion

**User Story:** As a speaker, I want my completed practice sessions to be automatically saved, so that I can review my progress over time.

#### Acceptance Criteria

1. WHEN a session reaches status "completed" in the Stage_Module, THE Session_History_Service SHALL create a Session_Record containing: a unique id, a timestamp (ISO 8601 format), session_mode (the mode id), duration (elapsed seconds as a number), phases_completed (array of phase name strings), curveballs_faced (count as a number), transcript (null placeholder), and ai_feedback (null placeholder).
2. WHEN the Session_History_Service creates a Session_Record, THE Session_History_Service SHALL append the Session_Record to the "pitchcraft_history" array in browser localStorage.
3. IF localStorage is unavailable or the write operation fails, THEN THE Session_History_Service SHALL continue application operation without interruption and without displaying an error to the user.
4. THE Session_History_Service SHALL preserve all previously saved Session_Records when appending a new record.

### Requirement 2: Load and Parse Session History

**User Story:** As a speaker, I want the application to load my session history on startup, so that my past sessions are always accessible.

#### Acceptance Criteria

1. WHEN the application initializes, THE Session_History_Service SHALL load the "pitchcraft_history" array from browser localStorage.
2. IF the "pitchcraft_history" key does not exist in localStorage, THEN THE Session_History_Service SHALL return an empty array.
3. IF the stored data is malformed or unparseable, THEN THE Session_History_Service SHALL return an empty array without throwing an error.
4. THE Session_History_Service SHALL sort loaded Session_Records by timestamp in descending order (most recent first).

### Requirement 3: Session History Navigation UI

**User Story:** As a speaker, I want a streamlined way to browse my past sessions from the Stage section, so that I can quickly find and review specific practice sessions.

#### Acceptance Criteria

1. THE History_Panel SHALL be accessible from the Stage section via a toggle button positioned in the stage header area.
2. WHEN the user activates the History_Panel toggle, THE History_Panel SHALL slide open from the left side of the Stage section.
3. THE History_Panel SHALL display each past session as a list item showing: session mode label, formatted date/time, and duration.
4. THE History_Panel SHALL sort sessions by date/time in descending order (most recent at the top).
5. WHILE the History_Panel is open, THE History_Panel SHALL remain visible without obscuring the primary stage controls.
6. WHEN the user activates the History_Panel toggle while the panel is open, THE History_Panel SHALL close with a slide-out animation.
7. IF no session history exists, THEN THE History_Panel SHALL display a message indicating no past sessions are available.

### Requirement 4: Session Detail View

**User Story:** As a speaker, I want to view the full details of a past session, so that I can reflect on my performance and track improvement.

#### Acceptance Criteria

1. WHEN the user clicks on a past session in the History_Panel, THE Session_Detail_View SHALL open as a modal overlay displaying the selected session's complete data.
2. THE Session_Detail_View SHALL display: session mode label, formatted date and time, total duration, list of phases completed, number of curveballs faced.
3. THE Session_Detail_View SHALL include a section labeled "Transcript" that displays the transcript field content or a placeholder message "Transcript will be available with AI coaching integration" when the field is null.
4. THE Session_Detail_View SHALL include a section labeled "AI Feedback" that displays the ai_feedback field content or a placeholder message "AI feedback will be available with AI coaching integration" when the field is null.
5. THE Session_Detail_View SHALL provide a close button that returns the user to the History_Panel.
6. WHEN the Session_Detail_View opens, THE Session_Detail_View SHALL trap keyboard focus within the modal for accessibility.
7. WHEN the user presses the Escape key while the Session_Detail_View is open, THE Session_Detail_View SHALL close.

### Requirement 5: Visual Design Consistency

**User Story:** As a speaker, I want the session history interface to match the existing studio aesthetic, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE History_Panel SHALL use the existing CSS custom properties for colors (--color-studio-surface, --color-studio-border, --color-studio-primary, --color-studio-text, --color-studio-muted).
2. THE History_Panel SHALL use the existing typography variables (--font-serif for headings, --font-sans for body text).
3. THE History_Panel toggle button SHALL follow the existing nav__tab styling patterns used in the application header.
4. THE Session_Detail_View modal SHALL follow the torn-page styling pattern used by the curveball overlay (clip-path with paper texture).
5. WHILE the user has enabled reduced motion preferences, THE History_Panel and Session_Detail_View SHALL suppress slide and fade animations.

### Requirement 6: Session History Data Integrity

**User Story:** As a speaker, I want my session history to be reliable and not corrupt my other saved data, so that I can trust the application with my progress.

#### Acceptance Criteria

1. THE Session_History_Service SHALL use a dedicated localStorage key "pitchcraft_history" separate from the existing "pitchcraft_notes" key.
2. THE Session_History_Service SHALL generate a unique id for each Session_Record using a combination of timestamp and random characters.
3. THE Session_History_Service SHALL validate that each Session_Record contains all required fields before saving.
4. IF a Session_Record fails validation, THEN THE Session_History_Service SHALL discard the invalid record without saving it and without affecting previously stored records.

### Requirement 7: Accessibility

**User Story:** As a speaker using assistive technology, I want the session history interface to be fully accessible, so that I can review my past sessions with a screen reader or keyboard.

#### Acceptance Criteria

1. THE History_Panel toggle button SHALL have an accessible label describing its purpose (e.g., "Open session history" / "Close session history").
2. WHEN the History_Panel opens or closes, THE application SHALL announce the state change via the ARIA live region.
3. THE History_Panel session list SHALL use appropriate ARIA roles (list/listitem) for screen reader navigation.
4. THE Session_Detail_View modal SHALL have role="dialog" and aria-modal="true" attributes.
5. THE Session_Detail_View close button SHALL have an accessible label "Close session details".
6. THE History_Panel and Session_Detail_View SHALL be fully navigable using keyboard only (Tab, Shift+Tab, Enter, Escape).
