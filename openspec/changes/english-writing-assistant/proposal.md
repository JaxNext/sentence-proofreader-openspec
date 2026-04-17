## Why

English learners often struggle with writing grammatically correct and naturally expressed sentences. Existing tools either provide superficial corrections without explanations or are too complex for learners. There is a need for a focused, AI-powered writing assistant that not only proofreads but also educates — pointing out vocabulary and grammar errors and suggesting more native-sounding alternatives.

## What Changes

- Build a web-based writing tool where users can type English sentences and press Enter to trigger AI-powered proofreading
- Allow users to choose between a local LLM or a cloud API provider for proofreading
- AI will analyze the text for incorrect vocabulary, grammar mistakes, and awkward phrasing
- Return structured feedback with character-level positions (startIndex/endIndex) for precise inline highlighting, plus a fully corrected version of the input
- Display inline feedback highlighting errors with corrections and type indicators
- Suggest more native/natural ways to express the same idea
- Use Next.js (latest stable version) as the core framework with App Router

## Capabilities

### New Capabilities
- `writing-editor`: A text input area where users write English sentences and submit them for proofreading by pressing Enter
- `ai-proofread`: Integration with a configurable AI backend (local LLM or cloud API) to analyze submitted text for vocabulary errors, grammar mistakes, and non-native phrasing, returning structured feedback with character-level positions and a corrected version of the input
- `feedback-display`: A UI component that presents proofreading results — highlighting errors inline using character positions, showing corrections with type indicators, and displaying the fully corrected text

### Modified Capabilities

## Impact

- New Next.js project with App Router architecture
- Supports both local LLM (e.g., LM Studio) and cloud API providers (OpenAI-compatible) — user-selectable via settings
- API route(s) needed to proxy cloud API requests securely; local and browser built-in LLM calls run client-side
- Frontend-only state management (no database required for MVP)
- Responsive design for desktop and mobile usage
