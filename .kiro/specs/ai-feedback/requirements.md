# Requirements Document

## Introduction

This feature integrates AI coaching feedback into PitchCraft & Eloquence Studio using OpenAI's Chat Completions API (model `gpt-4o-mini`). After a practice session's audio is transcribed by Whisper, the transcript is automatically sent to GPT for structured coaching analysis. The feedback evaluates pitch structure (Hook, Problem, Solution, CTA), delivery quality, filler word usage, and provides actionable improvement suggestions. Feedback is displayed in the session summary UI and persisted alongside the transcript in session history.

## Glossary

- **AiFeedback_Service**: The plain-object service responsible for sending transcripts to the OpenAI Chat Completions API and returning structured coaching feedback.
- **Chat_Completions_API**: The OpenAI endpoint at `https://api.openai.com/v1/chat/completions` used with model `gpt-4o-mini` to generate feedback.
- **Coaching_Prompt**: The system prompt sent to the Chat Completions API that instructs GPT to evaluate pitch structure, delivery, filler words, and provide actionable suggestions.
- **Session_Summary**: The UI panel (`#session-summary`) displayed after a session ends, showing session statistics, transcript, and AI feedback.
- **Feedback_Section**: The `#session-detail-feedback` element within the session detail overlay that displays AI coaching feedback for current and past sessions.
- **Session_Record**: The data object persisted by SessionHistoryService containing session metadata, transcript, and aiFeedback fields.
- **Transcription_Service**: The existing service that handles Whisper API calls and holds the API key in memory.
- **Loading_State**: A visual indicator shown in the feedback section while the Chat Completions API request is in progress.
- **Recording_Panel_Controller**: The existing controller that orchestrates the recording → transcription flow.

## Requirements

### Requirement 1: AI Feedback Generation Service

**User Story:** As a presenter, I want my transcript analyzed by an AI coaching engine, so that I receive structured feedback on my pitch performance.

#### Acceptance Criteria

1. THE AiFeedback_Service SHALL expose a `generateFeedback(transcript, sessionMode)` function that accepts a transcript string and the session mode identifier.
2. WHEN `generateFeedback` is called, THE AiFeedback_Service SHALL send a POST request to `https://api.openai.com/v1/chat/completions` with model set to `gpt-4o-mini`.
3. WHEN constructing the API request, THE AiFeedback_Service SHALL include the API key from Transcription_Service in the Authorization header using the Bearer token format.
4. WHEN constructing the API request, THE AiFeedback_Service SHALL send a JSON body containing a `messages` array with a system message (the Coaching_Prompt) and a user message containing the transcript text.
5. WHEN the Chat_Completions_API returns a successful response, THE AiFeedback_Service SHALL extract and return the assistant message content as the feedback string.
6. THE AiFeedback_Service SHALL set the `temperature` parameter to 0.7 to balance consistency with natural variation in feedback.

### Requirement 2: Coaching System Prompt Design

**User Story:** As a presenter, I want feedback that evaluates specific aspects of my pitch, so that I know exactly what to improve.

#### Acceptance Criteria

1. THE Coaching_Prompt SHALL instruct GPT to evaluate the transcript against four structural elements: Hook, Problem, Solution, and Call-to-Action (CTA).
2. THE Coaching_Prompt SHALL instruct GPT to assess delivery quality including clarity, confidence, and pacing.
3. THE Coaching_Prompt SHALL instruct GPT to identify filler words and verbal tics (such as "um", "uh", "like", "you know", "so", "basically").
4. THE Coaching_Prompt SHALL instruct GPT to provide three to five actionable improvement suggestions.
5. THE Coaching_Prompt SHALL instruct GPT to format the feedback using markdown with section headings for readability.
6. WHEN the session mode is provided, THE Coaching_Prompt SHALL reference the session mode context to tailor feedback appropriateness (e.g., elevator pitch vs. full presentation).

### Requirement 3: Feedback Trigger Flow

**User Story:** As a presenter, I want AI feedback generated automatically after my transcript is ready, so that I do not have to take an extra action.

#### Acceptance Criteria

1. WHEN the Transcription_Service returns a successful transcript, THE Recording_Panel_Controller SHALL automatically invoke `AiFeedback_Service.generateFeedback()` with the transcript text and current session mode.
2. WHILE the feedback generation request is in progress, THE Feedback_Section SHALL display a Loading_State with the text "Generating coaching feedback...".
3. WHILE the Loading_State is active, THE AccessibilityService SHALL announce "Generating coaching feedback" to screen readers via an ARIA live region.
4. WHEN feedback generation completes successfully, THE Loading_State SHALL be replaced with the rendered feedback content.
5. IF transcript text is empty or null, THEN THE AiFeedback_Service SHALL skip the feedback request and the Feedback_Section SHALL display no feedback message.

### Requirement 4: Feedback Rendering in UI

**User Story:** As a presenter, I want to see the AI coaching feedback in the session summary, so that I can review it immediately after my practice.

#### Acceptance Criteria

1. WHEN AI feedback is generated successfully, THE Session_Summary SHALL display the feedback string in the `#session-detail-feedback` element, replacing the placeholder text.
2. WHEN rendering feedback, THE Feedback_Section SHALL interpret markdown formatting (headings, bold, lists) for readability.
3. WHEN feedback is displayed in the session summary panel, THE Session_Summary SHALL append a feedback section below the transcript section with a heading "AI Coaching Feedback".
4. WHEN a user views a past session with stored aiFeedback in the History Panel, THE Feedback_Section SHALL display the stored feedback text with markdown formatting.
5. WHEN a user views a past session without aiFeedback, THE Feedback_Section SHALL display the placeholder text "AI feedback will be available with AI coaching integration".

### Requirement 5: Feedback Persistence

**User Story:** As a presenter, I want my AI feedback saved with my session history, so that I can review past coaching advice and track my improvement.

#### Acceptance Criteria

1. WHEN feedback generation completes successfully, THE SessionHistoryService SHALL update the most recent Session_Record's `aiFeedback` field with the feedback string.
2. WHEN a session ends without successful feedback generation, THE SessionHistoryService SHALL retain null in the Session_Record `aiFeedback` field.
3. THE SessionHistoryService SHALL persist the aiFeedback field to localStorage as part of the Session_Record.
4. WHEN loading past session records, THE SessionHistoryService SHALL restore the aiFeedback field from localStorage for display in the History Panel.

### Requirement 6: Error Handling

**User Story:** As a presenter, I want the app to handle feedback failures gracefully, so that a feedback error does not prevent me from seeing my transcript or continuing my workflow.

#### Acceptance Criteria

1. IF the Chat_Completions_API returns a 401 Unauthorized error, THEN THE AiFeedback_Service SHALL display a message indicating the API key is invalid and the Feedback_Section SHALL show "Unable to generate feedback: invalid API key".
2. IF the Chat_Completions_API returns a 429 Too Many Requests error, THEN THE AiFeedback_Service SHALL display a message indicating rate limiting and suggest trying again later.
3. IF the Chat_Completions_API returns any other error status (4xx or 5xx), THEN THE AiFeedback_Service SHALL display an error message including the HTTP status code.
4. IF the network request fails due to connectivity issues, THEN THE AiFeedback_Service SHALL display a message indicating a network error.
5. IF feedback generation fails for any reason, THEN THE transcript display and session saving SHALL proceed unaffected.
6. IF feedback generation fails, THEN THE Feedback_Section SHALL display "Feedback unavailable" with a brief error description.
7. WHEN a feedback error occurs, THE AccessibilityService SHALL announce the error to screen readers via an ARIA live region.
