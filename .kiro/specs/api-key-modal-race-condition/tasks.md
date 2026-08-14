# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - API Key Modal Race Condition
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the race condition exists
  - **Scoped PBT Approach**: Scope the property to the four concrete failing scenarios:
    1. `handleStop()` with no API key → loading overlay shown before modal resolves (stacked overlays)
    2. `endSession()` while `isRecording() === true` → transcription flow not invoked (lost audio)
    3. `handleStop()` → `showApiKeyModal()` → cancel → loading overlay remains visible, `AppState.session.recording` not reset (hanging UI)
    4. Concurrent `endSession()` + `handleStop()` → `AudioCaptureService.stop()` called multiple times (duplicate stops)
  - Test file: `tests/api-key-modal-race.property.test.js`
  - Mock `AudioCaptureService`, `TranscriptionService`, DOM elements, and `AppState`
  - Assert expected behavior from design:
    - Loading overlay only shown AFTER API key modal resolves
    - `endSession()` with active recording delegates to full transcription flow
    - Cancel path resets `AppState.session.recording = false` and hides all overlays
    - Only one `AudioCaptureService.stop()` call occurs regardless of concurrent triggers
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Recording and Session Flows
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (cases where bug condition does NOT hold):
    - Observe: `handleStop()` with API key already in memory → skips modal, shows loading immediately, calls Whisper API
    - Observe: `endSession()` with `isRecording() === false` → ends session normally, no transcription flow triggered
    - Observe: Normal session lifecycle (start → pause → resume → end without recording) → unchanged behavior
    - Observe: Microphone denial or no audio chunks → appropriate error message displayed
  - Test file: `tests/api-key-modal-race.property.test.js` (same file, separate describe block)
  - Write property-based tests:
    - For all inputs where API key IS in memory and recording stops, result equals: modal skipped, loading shown, Whisper called
    - For all session-end inputs where recording is NOT active, endSession behaves identically to original
    - For random sequences of start/pause/resume/end (no recording), session state transitions are unchanged
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for API Key Modal Race Condition

  - [x] 3.1 Add `_stopInProgress` guard to RecordingPanelController
    - Add `_stopInProgress: false` property to `RecordingPanelController` object
    - At the top of `handleStop()`, check if `_stopInProgress` is true — if so, return immediately
    - Set `_stopInProgress = true` at entry of `handleStop()`
    - Reset `_stopInProgress = false` in ALL exit paths (success, error, cancel)
    - _Bug_Condition: isBugCondition(input) where input.source = 'concurrent' AND duplicateStopCallIssued_
    - _Expected_Behavior: Only one transcription flow executes regardless of concurrent triggers_
    - _Preservation: Existing single-call behavior unchanged_
    - _Requirements: 2.4, 1.4_

  - [x] 3.2 Set `AppState.session.recording = false` at the start of `handleStop()`
    - Immediately after the `_stopInProgress` guard passes, set `AppState.session.recording = false`
    - This signals to `endSession()` that recording has stopped, preventing re-entry into the recording stop path
    - _Bug_Condition: isBugCondition(input) where endSession fires after handleStop starts_
    - _Expected_Behavior: endSession sees recording=false and skips transcription delegation_
    - _Preservation: Recording state correctly reflects actual recording status_
    - _Requirements: 2.3, 2.4_

  - [x] 3.3 Harden the cancel/reject path in `handleStop()`
    - In the `catch` block of `showApiKeyModal()`, add:
      - `this.hideLoading()` (defensive — in case loading was shown)
      - `AppState.session.recording = false` (reset state)
      - `this._stopInProgress = false` (release guard)
      - `AccessibilityService.announce('Transcription cancelled', 'polite')` (screen reader feedback)
    - Ensure no loading overlay remains visible after cancel
    - Ensure UI returns to clean post-recording state
    - _Bug_Condition: isBugCondition(input) where input.source = 'cancelModal' AND loadingOverlayStillVisible_
    - _Expected_Behavior: All overlays hidden, state reset, clean UI_
    - _Preservation: Cancellation path does not affect unrelated UI elements_
    - _Requirements: 2.3, 1.3_

  - [x] 3.4 Replace fire-and-forget in `StageController.endSession()` with delegation
    - Replace the current block:
      ```javascript
      if (AudioCaptureService.isRecording()) {
        AudioCaptureService.stop();
        RecordingPanelController.hide();
      }
      ```
    - With delegation to `RecordingPanelController.handleStop()`:
      ```javascript
      if (AudioCaptureService.isRecording()) {
        RecordingPanelController.handleStop();
      }
      ```
    - `handleStop()` already hides the recording panel and manages the full transcription pipeline
    - `endSession()` continues with session cleanup immediately (hide controls, show summary, save history)
    - The `_stopInProgress` guard ensures no duplicate calls
    - _Bug_Condition: isBugCondition(input) where input.source = 'endSession' AND transcriptionFlowNotInvoked_
    - _Expected_Behavior: Full transcription flow executes: stop → check key → prompt → loading → transcribe → display_
    - _Preservation: Session end cleanup (UI, history save) still runs immediately_
    - _Requirements: 2.2, 1.2_

  - [x] 3.5 Reset `_stopInProgress` in success and error exit paths
    - After successful transcription display in `handleStop()`, set `this._stopInProgress = false`
    - After error display in `handleStop()`, set `this._stopInProgress = false`
    - Ensure the guard is always released regardless of outcome
    - _Bug_Condition: Prevents guard from being permanently locked after any flow_
    - _Expected_Behavior: Subsequent recording/stop cycles work correctly_
    - _Preservation: No change to success/error display behavior_
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - API Key Modal Race Condition
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied:
      - Loading overlay only shown after API key modal resolves
      - Session end with active recording triggers full transcription flow
      - Cancel path cleans up all overlays and resets state
      - Concurrent stop calls are serialized through the guard
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Recording and Session Flows
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all preservation tests still pass after fix:
      - API key in memory → fast path preserved
      - No recording active on session end → normal end preserved
      - Normal session lifecycle → unchanged
      - Error handling → unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npx vitest --run`
  - Ensure all property-based tests from tasks 1 and 2 pass
  - Ensure all existing tests in `tests/` directory still pass (no regressions to unrelated features)
  - Verify no console errors or warnings in test output
  - Ask the user if questions arise
