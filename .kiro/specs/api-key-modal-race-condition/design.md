# API Key Modal Race Condition Bugfix Design

## Overview

When a recording stops (manually or via session end), the system simultaneously shows the API Key modal and the transcription loading overlay, creating a stacked UI race condition. Additionally, `StageController.endSession()` calls `AudioCaptureService.stop()` as fire-and-forget — bypassing the transcription flow entirely — and cancelling the API key modal leaves the loading overlay hanging. The fix enforces a strict sequential flow: stop recording → check API key → prompt if missing → only then show loading → transcribe. A concurrency guard prevents duplicate stop calls when `endSession()` and `handleStop()` fire simultaneously.

## Glossary

- **Bug_Condition (C)**: The condition where a recording stops (manually or via session end) while no API key is stored in memory, OR where `endSession()` and `handleStop()` fire concurrently, producing overlapping/orphaned UI states.
- **Property (P)**: The desired sequential behavior: API key confirmation must precede the loading overlay, and all stop flows must serialize through a single code path.
- **Preservation**: Existing behavior that must remain unchanged — recordings with a valid key already in memory should skip the modal and proceed directly to loading/transcription.
- **RecordingPanelController.handleStop()**: The function in `index.html` that orchestrates: stop recording → API key check → loading → transcription → display result.
- **StageController.endSession()**: The function that finalizes a session, hides controls, and saves session history. Currently calls `AudioCaptureService.stop()` independently.
- **_stopInProgress**: A proposed guard flag on `RecordingPanelController` to prevent concurrent stop/transcription flows.

## Bug Details

### Bug Condition

The bug manifests when a recording stops and either (a) no API key is in memory causing the modal and loading overlay to race, (b) the session ends while recording is active causing the transcription flow to be skipped, (c) the user cancels the API key modal leaving the UI in a broken state, or (d) both `endSession()` and `handleStop()` fire simultaneously creating duplicate MediaRecorder stop calls.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type StopEvent (manual button click, session timer expiry, or concurrent trigger)
  OUTPUT: boolean
  
  RETURN (input.recordingActive = true
         AND (
           (NOT apiKeyInMemory AND loadingOverlayShownBeforeKeyConfirmed)
           OR (input.source = 'endSession' AND transcriptionFlowNotInvoked)
           OR (input.source = 'cancelModal' AND loadingOverlayStillVisible)
           OR (input.source = 'concurrent' AND duplicateStopCallIssued)
         ))
END FUNCTION
```

### Examples

- **Stacked overlays**: User clicks "Stop Recording & Analyze" with no API key → system shows API Key modal AND loading overlay simultaneously → user sees two overlapping modals.
- **Lost transcription on session end**: Session timer expires while recording → `endSession()` calls `AudioCaptureService.stop()` fire-and-forget → audio is discarded, no transcription occurs.
- **Hanging loading overlay**: User clicks "Stop Recording & Analyze" → API key modal appears → user clicks Cancel → loading overlay remains visible, UI is stuck.
- **Duplicate stop**: Session timer fires at exact moment user clicks "Stop Recording & Analyze" → both `endSession()` and `handleStop()` call `AudioCaptureService.stop()` → MediaRecorder receives two stop() calls, producing unpredictable behavior.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When a valid API key IS already in memory, the system skips the modal and proceeds directly to showing loading + calling Whisper API (current fast path).
- When the Whisper API returns a successful transcription, the transcript text is displayed and saved in session history via SessionHistoryService.
- When no recording is active and the session ends, the session ends normally without triggering any transcription flow.
- When the user manually clicks "Stop Recording & Analyze" during a session (not triggered by session end), the flow proceeds: hide panel → stop audio → check key → loading → transcribe → display.
- When microphone permission is denied or no audio chunks are captured, the appropriate error message is displayed and no transcription is attempted.

**Scope:**
All inputs that do NOT involve the recording-stop flow with a missing API key, the session-end-while-recording path, modal cancellation during transcription, or concurrent stop calls should be completely unaffected by this fix. This includes:
- Normal session lifecycle (start, pause, resume, end without recording)
- Record button visibility toggling
- Curveball overlay interactions
- Session history panel interactions
- All other UI interactions unrelated to the transcription pipeline

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Sequential ordering not enforced in `handleStop()`**: The current code calls `AudioCaptureService.stop()` correctly before checking the API key, but the loading overlay (`showLoading()`) should only be called AFTER the API key modal resolves. Currently, if the code path were to show loading before the modal promise resolves (or if a future refactor introduces this), the stacked overlay occurs. The real issue is that the cancel path in `showApiKeyModal()` does not clean up — when the user cancels, `handleStop()` just returns without hiding any potential loading state or resetting `AppState.session.recording`.

2. **`StageController.endSession()` bypasses the transcription flow**: The `endSession()` method calls `AudioCaptureService.stop()` directly and `RecordingPanelController.hide()` without delegating to `RecordingPanelController.handleStop()`. This means audio is packaged but never sent to the Whisper API — the blob is discarded.

3. **No concurrency guard**: There is no `_stopInProgress` flag. If `endSession()` fires (e.g., timer expiry) at the same moment the user clicks "Stop Recording & Analyze", both paths call `AudioCaptureService.stop()`. The second call to `MediaRecorder.stop()` when `_isRecording` is already false returns null, but the resulting flow is unpredictable.

4. **Cancel path does not reset state**: When `showApiKeyModal()` rejects (user clicks Cancel), `handleStop()` catches the error and returns. But it does not: (a) hide the loading overlay (if it were shown), (b) reset `AppState.session.recording = false`, or (c) announce anything to the screen reader. The UI is left in a liminal state.

## Correctness Properties

Property 1: Bug Condition - Sequential Flow Enforcement

_For any_ recording stop event where no API key is in memory, the fixed `handleStop()` function SHALL display ONLY the API Key modal and SHALL NOT show the loading overlay until after the user submits a valid key (i.e., `showLoading()` is called only after `showApiKeyModal()` resolves successfully).

**Validates: Requirements 2.1**

Property 2: Bug Condition - Session End Delegates to Transcription Flow

_For any_ session end event where recording is active, the fixed `endSession()` function SHALL delegate to `RecordingPanelController.handleStop()` (or equivalent serialized flow) to ensure the full transcription pipeline executes: stop recording → check API key → prompt if needed → show loading → call Whisper API → display result.

**Validates: Requirements 2.2**

Property 3: Bug Condition - Cancel Path Cleanup

_For any_ API key modal cancellation during the recording-stop flow, the fixed code SHALL hide the API key modal, hide any loading overlay, reset `AppState.session.recording = false`, and return the UI to a clean post-recording state with no hanging overlays.

**Validates: Requirements 2.3**

Property 4: Bug Condition - Concurrency Guard Prevents Duplicate Stops

_For any_ concurrent invocation of `endSession()` and `handleStop()` (e.g., timer expiry simultaneous with user click), the fixed code SHALL serialize execution through a single stop-and-transcribe flow using a `_stopInProgress` guard flag, preventing duplicate `AudioCaptureService.stop()` calls and ensuring only one transcription attempt occurs.

**Validates: Requirements 2.4**

Property 5: Preservation - Fast Path with Existing API Key

_For any_ recording stop event where a valid API key IS already in memory, the fixed code SHALL produce the same behavior as the original code: skip the API Key modal, show loading immediately, call the Whisper API, and display the transcript — preserving the existing fast path.

**Validates: Requirements 3.1, 3.2, 3.4**

Property 6: Preservation - No Recording Active on Session End

_For any_ session end event where recording is NOT active (`AudioCaptureService.isRecording() === false`), the fixed `endSession()` function SHALL behave identically to the original: end the session normally without triggering any transcription flow, API key prompt, or loading overlay.

**Validates: Requirements 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `index.html`

**Function**: `RecordingPanelController.handleStop()`

**Specific Changes**:
1. **Add `_stopInProgress` guard**: Add a `_stopInProgress: false` property to `RecordingPanelController`. At the top of `handleStop()`, check if `_stopInProgress` is true — if so, return immediately. Set it to `true` at entry, and reset to `false` in all exit paths (success, error, cancel).

2. **Ensure `showLoading()` is called ONLY after API key confirmation**: The existing code already has the correct sequencing (stop → check key → modal → loading), but the cancel path must be hardened. After `showApiKeyModal()` resolves, then call `showLoading()`. This is already the case structurally but needs explicit protection in the catch block.

3. **Harden the cancel/reject path**: In the `catch` block of `showApiKeyModal()`, add:
   - `this.hideLoading()` (defensive — in case loading was shown)
   - `AppState.session.recording = false`
   - `this._stopInProgress = false`
   - Screen reader announcement: "Transcription cancelled"

4. **Reset `_stopInProgress` in all exit paths**: After successful transcription display, after error display, and after cancellation.

**Function**: `StageController.endSession()`

**Specific Changes**:
5. **Delegate to `RecordingPanelController.handleStop()` instead of direct stop**: Replace the current block:
   ```javascript
   if (AudioCaptureService.isRecording()) {
     AudioCaptureService.stop();
     RecordingPanelController.hide();
   }
   ```
   With:
   ```javascript
   if (AudioCaptureService.isRecording()) {
     // Delegate to handleStop for full transcription flow
     // handleStop() already hides the recording panel and manages the pipeline
     RecordingPanelController.handleStop();
   }
   ```
   
6. **Make `endSession()` aware of the async transcription flow**: Since `handleStop()` is async, `endSession()` should still proceed with session cleanup (hiding controls, showing summary, saving history) immediately. The transcription flow runs in the background and updates the UI when complete. The `_stopInProgress` guard ensures no duplicate calls.

**Function**: `RecordingPanelController.handleStop()` (additional)

7. **Set `AppState.session.recording = false` at the start of `handleStop()`**: This immediately signals to the rest of the system that recording has stopped, preventing `endSession()` from re-entering the recording stop path.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate recording stops with no API key, session ends while recording, modal cancellations, and concurrent stop triggers. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Stacked Overlay Test**: Simulate `handleStop()` with no API key and verify loading overlay is shown before modal resolves (will expose ordering bug on unfixed code)
2. **Lost Transcription Test**: Simulate `endSession()` while `AudioCaptureService.isRecording() === true` and verify transcription flow is NOT triggered (will fail on unfixed code — confirms fire-and-forget)
3. **Hanging UI Test**: Simulate `handleStop()` → `showApiKeyModal()` → user cancels, and check that loading overlay is still visible and `AppState.session.recording` is not reset (will expose cleanup bug)
4. **Concurrent Stop Test**: Call `endSession()` and `handleStop()` simultaneously and verify `AudioCaptureService.stop()` is called more than once (will expose missing guard)

**Expected Counterexamples**:
- Loading overlay becomes visible before API key modal resolves
- `endSession()` discards audio blob without transcription
- Possible causes: missing await sequencing, fire-and-forget in endSession, no cleanup on cancel, no concurrency guard

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleStop_fixed(input) OR endSession_fixed(input)
  ASSERT sequentialFlowEnforced(result)
  ASSERT noStackedOverlays(result)
  ASSERT transcriptionFlowCompletes(result)
  ASSERT cleanStateOnCancel(result)
  ASSERT noDuplicateStopCalls(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT handleStop_original(input) = handleStop_fixed(input)
  ASSERT endSession_original(input) = endSession_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for the "API key already in memory" path, "no recording active" session end, and normal session lifecycle. Then write property-based tests capturing that behavior.

**Test Cases**:
1. **Fast Path Preservation**: Verify that when API key is already in memory, `handleStop()` shows loading immediately and calls Whisper (no modal detour) — identical to original behavior
2. **No-Recording Session End Preservation**: Verify that `endSession()` with `isRecording() === false` behaves identically before and after the fix
3. **Normal Session Lifecycle Preservation**: Verify start → pause → resume → end (without recording) is unchanged
4. **Error Handling Preservation**: Verify that microphone denial, no-chunks, and HTTP errors still produce correct error messages

### Unit Tests

- Test `_stopInProgress` guard prevents re-entry when called twice rapidly
- Test `handleStop()` sequencing: `showApiKeyModal()` resolves → then `showLoading()` is called (not before)
- Test `handleStop()` cancel path: modal rejected → loading hidden, state reset, no hanging overlay
- Test `endSession()` delegates to `handleStop()` when recording is active
- Test `endSession()` does NOT call `AudioCaptureService.stop()` directly when recording is active (delegates instead)
- Test `endSession()` behaves normally when recording is NOT active

### Property-Based Tests

- Generate random sequences of {startRecording, handleStop, endSession, cancelModal} events and verify no stacked overlays occur
- Generate random API key states (present/absent) and verify the correct path is taken on every recording stop
- Generate random timing for concurrent endSession + handleStop calls and verify only one transcription flow executes

### Integration Tests

- Full flow: start session → record → session timer expires while recording → verify transcript is produced
- Full flow: start session → record → click "Stop Recording & Analyze" → no API key → submit key → verify transcript
- Full flow: start session → record → click "Stop Recording & Analyze" → no API key → cancel → verify UI returns to clean state
- Concurrent flow: trigger session end and manual stop simultaneously → verify single transcription, no errors
