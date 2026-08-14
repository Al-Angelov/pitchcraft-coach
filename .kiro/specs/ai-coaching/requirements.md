# Requirements Document

## Introduction

This feature adds AI coaching capabilities to PitchCraft & Eloquence Studio in two phases. Phase 1 introduces browser-based audio recording during active practice sessions, capturing the user's speech via the Web Audio API. Phase 2 integrates with OpenAI's Whisper API to transcribe the recorded audio, providing users with a text transcript of their practice sessions that can be stored in session history.

## Glossary

- **Recording_Panel**: A modal/panel UI element within the Stage view that displays live recording status including a timer, waveform animation, and stop button.
- **Audio_Capture_Service**: The service responsible for requesting microphone access, capturing audio chunks via MediaRecorder, and packaging them into a Blob.
- **Transcription_Service**: The service responsible for sending recorded audio to the OpenAI Whisper API and returning the transcript text.
- **Stage_View**: The primary practice area of the application where session modes, timers, phases, and curveballs are managed by StageController.
- **Session_Record**: The data object persisted by SessionHistoryService containing session metadata, transcript, and aiFeedback fields.
- **API_Key_Input**: A temporary secure input field that accepts the user's OpenAI API key without persisting it to storage.
- **Waveform_Animation**: A CSS-based simulated audio visualization displayed during active recording.
- **Loading_State**: A theatrical UI state displayed while the Whisper API transcription request is in progress.

## Requirements

### Requirement 1: Microphone Permission Request

**User Story:** As a presenter practicing on stage, I want the application to request microphone access, so that my speech can be captured for transcription.

#### Acceptance Criteria

1. WHEN the user initiates a recording, THE Audio_Capture_Service SHALL request microphone access using navigator.mediaDevices.getUserMedia with audio-only constraints.
2. WHEN the user grants microphone permission, THE Audio_Capture_Service SHALL initialize a MediaRecorder instance and begin capturing audio data chunks.
3. IF the user denies microphone permission, THEN THE Audio_Capture_Service SHALL display a clear error message explaining that microphone access is required for recording.
4. IF the browser does not support navigator.mediaDevices.getUserMedia, THEN THE Audio_Capture_Service SHALL display a message indicating that the browser does not support audio recording.
5. WHEN microphone permission is requested, THE Audio_Capture_Service SHALL announce the permission status to screen readers via AccessibilityService.

### Requirement 2: Recording Panel UI

**User Story:** As a presenter, I want to see a live recording interface during my session, so that I know recording is active and can stop it when ready.

#### Acceptance Criteria

1. WHEN a recording session is active, THE Recording_Panel SHALL display a live timer in mm:ss format showing the elapsed recording duration.
2. WHEN a recording session is active, THE Recording_Panel SHALL display a CSS-based Waveform_Animation indicating that audio capture is in progress.
3. WHILE the user has enabled reduced motion preferences, THE Recording_Panel SHALL replace the Waveform_Animation with a static recording indicator.
4. THE Recording_Panel SHALL provide a "Stop Recording & Analyze" button that is keyboard accessible and has an accessible label.
5. WHEN a recording session is active, THE Recording_Panel SHALL be displayed as a modal or panel within the Stage_View context.
6. WHEN the Recording_Panel is displayed, THE AccessibilityService SHALL trap focus within the panel and announce that recording has started.
7. WHEN the Recording_Panel is closed, THE AccessibilityService SHALL return focus to the element that triggered it.

### Requirement 3: Audio Capture and Packaging

**User Story:** As a presenter, I want my recorded audio to be packaged into a standard format, so that it can be sent for transcription.

#### Acceptance Criteria

1. WHILE recording is active, THE Audio_Capture_Service SHALL collect audio data chunks from the MediaRecorder ondataavailable event.
2. WHEN the user presses "Stop Recording & Analyze", THE Audio_Capture_Service SHALL stop the MediaRecorder and package all collected audio chunks into a single Blob with MIME type audio/webm.
3. IF no audio data chunks are collected during the recording session, THEN THE Audio_Capture_Service SHALL display an error message indicating that no audio was captured.
4. WHEN recording stops, THE Audio_Capture_Service SHALL release the microphone media stream tracks to free hardware resources.

### Requirement 4: API Key Input

**User Story:** As a presenter, I want to provide my OpenAI API key securely, so that I can use the transcription service without the key being permanently stored.

#### Acceptance Criteria

1. WHEN transcription is requested and no API key is present in the current session, THE Transcription_Service SHALL display the API_Key_Input field prompting the user for their OpenAI API key.
2. THE API_Key_Input SHALL render as a password-type input field that masks the entered characters.
3. THE Transcription_Service SHALL retain the API key only in memory for the duration of the browser session and SHALL NOT persist the key to localStorage or any other persistent storage.
4. WHEN the user submits a valid API key, THE Transcription_Service SHALL proceed with the transcription request.
5. IF the user cancels the API key input, THEN THE Transcription_Service SHALL abort the transcription process and return the user to the Recording_Panel or session state.

### Requirement 5: Whisper API Transcription Request

**User Story:** As a presenter, I want my recorded audio to be transcribed by OpenAI Whisper, so that I can review the text of my practice session.

#### Acceptance Criteria

1. WHEN a valid audio Blob and API key are available, THE Transcription_Service SHALL construct a FormData request containing the audio Blob with field name "file", the model parameter set to "whisper-1", and send it to https://api.openai.com/v1/audio/transcriptions.
2. THE Transcription_Service SHALL include the API key in the Authorization header using the Bearer token format.
3. WHEN the Whisper API returns a successful response, THE Transcription_Service SHALL extract and return the transcript text from the response body.
4. IF the Whisper API returns a 401 Unauthorized error, THEN THE Transcription_Service SHALL display a message indicating that the API key is invalid and prompt the user to re-enter the key.
5. IF the Whisper API returns any other error status, THEN THE Transcription_Service SHALL display an error message including the HTTP status code and a brief description.
6. IF the network request fails due to connectivity issues, THEN THE Transcription_Service SHALL display a message indicating a network error and suggest retrying.

### Requirement 6: Theatrical Loading State

**User Story:** As a presenter, I want to see an engaging loading animation during transcription, so that I know the process is underway and the experience feels polished.

#### Acceptance Criteria

1. WHILE the Whisper API transcription request is in progress, THE Loading_State SHALL display the text "Transcribing your audio waveform..." with a theatrical animation.
2. WHILE the Loading_State is active, THE Loading_State SHALL prevent user interaction with the underlying Stage_View controls.
3. WHILE the user has enabled reduced motion preferences, THE Loading_State SHALL display the loading message without animation.
4. WHEN the transcription completes or fails, THE Loading_State SHALL be dismissed and control SHALL return to the appropriate result or error view.
5. WHILE the Loading_State is active, THE AccessibilityService SHALL announce "Transcription in progress" to screen readers via an ARIA live region.

### Requirement 7: Transcript Storage in Session History

**User Story:** As a presenter, I want my transcript saved with my session history, so that I can review what I said in past practice sessions.

#### Acceptance Criteria

1. WHEN a transcription completes successfully, THE Stage_View SHALL display the transcript text to the user.
2. WHEN a session with a completed transcript ends, THE SessionHistoryService SHALL save the transcript in the Session_Record transcript field.
3. WHEN a session ends without a transcript, THE SessionHistoryService SHALL save null in the Session_Record transcript field.
4. WHEN a user views a past session with a transcript in the History Panel, THE Session_Record SHALL display the stored transcript text.

### Requirement 8: Recording Session Integration with Stage

**User Story:** As a presenter, I want recording to integrate with my active practice session, so that the workflow feels natural and connected to my practice.

#### Acceptance Criteria

1. THE Recording_Panel SHALL only be accessible while a practice session is active in the Stage_View (after the user presses Start).
2. WHILE no session is active, THE Stage_View SHALL hide or disable the recording trigger control.
3. WHEN the user ends a practice session while recording is still active, THE Audio_Capture_Service SHALL automatically stop the recording and package the audio.
4. THE Recording_Panel trigger control SHALL be keyboard accessible and have a descriptive accessible label.
