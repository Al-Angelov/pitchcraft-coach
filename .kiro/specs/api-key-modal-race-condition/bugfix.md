# Bugfix Requirements Document

## Introduction

When a recording stops (either via the "Stop Recording & Analyze" button or via automatic session-end), the API Key modal and the transcription loading overlay trigger simultaneously. This creates a race condition where the user sees both overlays stacked, the transcription fetch fires without a valid key, and cancelling the modal leaves the loading overlay hanging indefinitely. The fix must enforce a strict sequential flow: check for API key → prompt if missing → only then show loading and begin transcription.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a recording stops and no API key is stored in memory THEN the system displays the API Key modal AND the loading overlay ("Transcribing your audio waveform...") simultaneously, creating a stacked overlay race condition.

1.2 WHEN a recording stops via the session ending (timer expiration or user clicking Stop session) while recording is active THEN the system calls `AudioCaptureService.stop()` as fire-and-forget without initiating the transcription flow (API key check → loading → Whisper request), resulting in lost audio that is never transcribed.

1.3 WHEN the user clicks Cancel on the API Key modal during the overlapping state THEN the loading overlay remains visible and the session state is not reset, leaving the UI in a broken hanging state.

1.4 WHEN `endSession()` fires concurrently with `handleStop()` (e.g., session timer expires while user clicks "Stop Recording & Analyze") THEN both code paths call `AudioCaptureService.stop()` simultaneously, causing unpredictable behavior with the MediaRecorder and potential duplicate Blob packaging.

### Expected Behavior (Correct)

2.1 WHEN a recording stops and no API key is stored in memory THEN the system SHALL display ONLY the API Key modal first and SHALL NOT show the loading overlay until a valid key is submitted.

2.2 WHEN a recording stops via session end while recording is active THEN the system SHALL go through the full transcription flow: stop recording → check API key → prompt if needed → show loading → call Whisper API → display result, identical to the manual "Stop Recording & Analyze" path.

2.3 WHEN the user clicks Cancel on the API Key modal THEN the system SHALL hide both the modal and any loading overlay, and SHALL reset the session recording state (set `AppState.session.recording = false`) so the UI returns to a clean post-session state.

2.4 WHEN `endSession()` fires while recording is active THEN the system SHALL use a single serialized transcription flow (via `RecordingPanelController.handleStop()`) and SHALL NOT call `AudioCaptureService.stop()` independently, preventing duplicate stop calls and race conditions.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a recording stops and a valid API key IS already stored in memory THEN the system SHALL CONTINUE TO skip the API Key modal and proceed directly to showing the loading overlay and calling the Whisper API.

3.2 WHEN the Whisper API returns a successful transcription THEN the system SHALL CONTINUE TO display the transcript text and save it in the session history record via SessionHistoryService.

3.3 WHEN no recording is active and the session ends THEN the system SHALL CONTINUE TO end the session normally without triggering any transcription flow or API key prompt.

3.4 WHEN the user manually clicks "Stop Recording & Analyze" during an active session (not triggered by session end) THEN the system SHALL CONTINUE TO follow the transcription flow as currently designed — hide recording panel → stop audio → check key → loading → transcribe → display.

3.5 WHEN microphone permission is denied or no audio chunks are captured THEN the system SHALL CONTINUE TO display the appropriate error message and not proceed to the API key or transcription steps.
