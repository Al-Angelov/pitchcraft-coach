# Implementation Plan: AI Coaching — Audio Recording & Whisper Transcription

## Overview

Implement AI coaching capabilities for PitchCraft & Eloquence Studio by adding browser-based audio recording during practice sessions and OpenAI Whisper transcription. All code is added inline to `index.html` following the existing plain-object service pattern. New services (AudioCaptureService, TranscriptionService), a new UI controller (RecordingPanelController), and modifications to StageController integrate recording and transcription into the active session workflow.

## Tasks

- [x] 1. Add HTML markup for recording panel, API key modal, and loading overlay
  - [x] 1.1 Add Recording Panel HTML inside the Stage section
    - Add the `#recording-panel` dialog element with timer display, waveform bars, and stop button
    - Place it inside `#stage` after existing session controls
    - Include ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-label="Recording in progress"`
    - Panel starts `hidden`
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

  - [x] 1.2 Add API Key Modal HTML inside the Stage section
    - Add `#api-key-modal` dialog with password input, submit, and cancel buttons
    - Include `role="dialog"`, `aria-modal="true"`, `aria-labelledby="api-key-title"`
    - Input has `type="password"`, `autocomplete="off"`, `required`
    - Modal starts `hidden`
    - _Requirements: 4.1, 4.2_

  - [x] 1.3 Add Loading Overlay HTML inside the Stage section
    - Add `#transcription-loading` with `role="alert"`, `aria-live="assertive"`
    - Include loading text "Transcribing your audio waveform..." and three animated dots
    - Overlay starts `hidden`
    - _Requirements: 6.1, 6.5_

  - [x] 1.4 Add Record button to session controls
    - Add `#btn-record` button inside Stage session controls area
    - Include accessible label `aria-label="Record your practice session"`
    - Button starts `hidden` (shown only during active sessions)
    - _Requirements: 8.1, 8.2, 8.4_

- [x] 2. Add CSS styles for recording panel, waveform, API key modal, and loading overlay
  - [x] 2.1 Add Recording Panel and waveform CSS
    - Style `.recording-panel` as a modal overlay (centered, backdrop)
    - Add `.recording-waveform` flex container with 5 bars using `waveform-pulse` keyframes
    - Add `.recording-panel__indicator` pulsing red dot
    - Add `.recording-panel__timer` styling
    - Add `@media (prefers-reduced-motion: reduce)` rule to disable animation and set static bar height
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 2.2 Add API Key Modal and Loading Overlay CSS
    - Style `.modal-overlay` with centered content and backdrop
    - Style `.loading-overlay` as full-screen blocking overlay
    - Add `.loading-dot` animation with `@keyframes` bounce
    - Add `@media (prefers-reduced-motion: reduce)` rule to disable loading animation
    - _Requirements: 4.1, 6.1, 6.2, 6.3_

- [x] 3. Implement AudioCaptureService
  - [x] 3.1 Create AudioCaptureService plain object in the inline script
    - Implement `isSupported()` checking for `navigator.mediaDevices.getUserMedia`
    - Implement `requestMicrophone()` calling `getUserMedia({ audio: true })`, storing the stream, announcing status via AccessibilityService
    - Handle permission denied: display error, announce to screen readers
    - Handle unsupported browser: display error, announce to screen readers
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 3.2 Implement AudioCaptureService start/stop/release methods
    - Implement `start()`: create MediaRecorder from stream, set `ondataavailable` to push chunks, call `recorder.start()`
    - Implement `stop()`: return Promise that resolves after `recorder.onstop`; package chunks into Blob with MIME `audio/webm`; return null if no chunks; release stream tracks
    - Implement `releaseStream()`: stop all tracks on the stored stream
    - Implement `isRecording()`: return current recording state
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Write property tests for AudioCaptureService
    - **Property 1: Audio chunk packaging produces valid Blob**
    - **Property 2: Empty recording detection**
    - **Property 8: Auto-stop on session end preserves audio**
    - **Validates: Requirements 3.1, 3.2, 3.3, 8.3**
    - Test file: `tests/ai-coaching.property.test.js`

- [x] 4. Implement TranscriptionService
  - [x] 4.1 Create TranscriptionService plain object in the inline script
    - Implement `setApiKey(key)`, `hasApiKey()`, `clearApiKey()` — store key only in a local variable (never localStorage)
    - Implement `transcribe(audioBlob)`: build FormData with "file" (Blob) and "model" ("whisper-1"), send POST to `https://api.openai.com/v1/audio/transcriptions` with `Authorization: Bearer {key}`
    - Return `{ success: true, text }` on 200
    - Return `{ success: false, error: "Invalid API key...", statusCode: 401 }` on 401
    - Return `{ success: false, error: "Transcription failed (HTTP {code})...", statusCode }` on other errors
    - Return `{ success: false, error: "Network error..." }` on fetch rejection
    - _Requirements: 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 4.2 Write property tests for TranscriptionService
    - **Property 4: API key never persisted**
    - **Property 5: Whisper API request structure**
    - **Property 10: Error classification correctness**
    - **Validates: Requirements 4.3, 5.1, 5.2, 5.4, 5.5, 5.6**
    - Test file: `tests/ai-coaching.property.test.js`

- [x] 5. Checkpoint - Verify services
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement RecordingPanelController
  - [x] 6.1 Create RecordingPanelController plain object in the inline script
    - Implement `show()`: unhide `#recording-panel`, start timer interval (1000ms), trap focus, announce "Recording started" via AccessibilityService
    - Implement `hide()`: hide panel, clear timer interval, release focus trap, return focus to trigger element
    - Implement `tick()`: compute elapsed seconds from `_startTime`, format as MM:SS, update `#recording-timer` text
    - _Requirements: 2.1, 2.5, 2.6, 2.7_

  - [x] 6.2 Implement RecordingPanelController stop, API key, loading, and transcript flows
    - Implement `handleStop()`: call `AudioCaptureService.stop()`, if null show error, else initiate transcription flow
    - Implement `showApiKeyModal()`: return Promise; unhide `#api-key-modal`, trap focus; resolve with key on form submit; reject on cancel
    - Implement `showLoading()`: unhide `#transcription-loading`, disable Stage controls
    - Implement `hideLoading()`: hide loading overlay, re-enable Stage controls
    - Implement `showTranscript(text)`: display transcript text in Stage area, store in `AppState.session.transcript`
    - Implement `showError(message)`: display error message with accessible announcement
    - _Requirements: 2.4, 4.1, 4.4, 4.5, 6.1, 6.2, 6.4, 7.1_

  - [x] 6.3 Write property tests for RecordingPanelController
    - **Property 3: Recording timer format consistency**
    - **Property 9: Reduced motion disables waveform animation**
    - **Validates: Requirements 2.1, 2.3**
    - Test file: `tests/ai-coaching.property.test.js`

- [x] 7. Extend StageController and AppState for recording integration
  - [x] 7.1 Extend AppState.session with recording fields
    - Add `recording: false` and `transcript: null` to the session initialization in AppState
    - _Requirements: 8.1_

  - [x] 7.2 Modify StageController to show/hide Record button
    - Add `updateRecordButton()`: show `#btn-record` when `AppState.session.status === 'running'` or `'paused'`, hide otherwise
    - Call `updateRecordButton()` from `startSession()`, `endSession()`, `pauseSession()`, `resumeSession()`
    - Add click handler on `#btn-record` to trigger `AudioCaptureService.requestMicrophone()` then `RecordingPanelController.show()`
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 7.3 Modify StageController.endSession() for auto-stop and transcript persistence
    - If `AudioCaptureService.isRecording()`, call `AudioCaptureService.stop()` to auto-stop and package audio
    - Pass `AppState.session.transcript` to `SessionHistoryService.saveSession()` in the transcript field
    - When no transcript, pass `null`
    - _Requirements: 7.2, 7.3, 8.3_

  - [x] 7.4 Write property tests for StageController recording integration
    - **Property 7: Record button visibility invariant**
    - **Property 6: Transcript round-trip persistence**
    - **Validates: Requirements 7.2, 7.3, 8.1, 8.2**
    - Test file: `tests/ai-coaching.property.test.js`

- [x] 8. Wire services and controller in DOMContentLoaded handler
  - [x] 8.1 Initialize AudioCaptureService, TranscriptionService, and RecordingPanelController
    - Add initialization calls in the existing `DOMContentLoaded` event listener
    - Wire `#btn-stop-recording` click to `RecordingPanelController.handleStop()`
    - Wire `#btn-record` click to the recording start flow
    - Wire `#api-key-form` submit and `#btn-cancel-api-key` click to API key modal logic
    - Ensure Record button is hidden on page load (no active session)
    - _Requirements: 8.1, 8.2_

- [x] 9. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code is added inline to `index.html` — no separate JS files
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The application uses plain object services (no classes) matching existing codebase patterns

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "4.1", "7.1"] },
    { "id": 3, "tasks": ["3.2", "4.2", "7.2"] },
    { "id": 4, "tasks": ["3.3", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.3"] },
    { "id": 6, "tasks": ["6.3", "7.4", "8.1"] }
  ]
}
```
