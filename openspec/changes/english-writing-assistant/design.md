## Context

This is a greenfield project — no existing codebase or specs. The target users are English learners who need real-time writing assistance. The application is a single-page web app where users write sentences and receive AI-powered feedback. The core framework is Next.js (latest stable, currently v16) using the App Router pattern.

## Goals / Non-Goals

**Goals:**
- Provide a clean, distraction-free writing experience optimized for English learners
- Deliver AI-powered proofreading with vocabulary correction, grammar checking, and native expression suggestions
- Keep the architecture simple — single Next.js app with server-side API routes for cloud AI providers only; local and browser built-in LLMs run client-side
- Ensure fast feedback loop — users press Enter and get results within seconds
- Support responsive design for both desktop and mobile

**Non-Goals:**
- User authentication or accounts (MVP)
- Persistent storage of writing history (MVP)
- Multi-language support (English only for now)
- Real-time/collaborative editing
- Custom AI model training

## Decisions

### 1. Next.js App Router with Server Components
**Decision**: Use Next.js 16 with App Router as the sole framework.
**Rationale**: App Router is the recommended approach in Next.js 16. It provides server components for the initial page load and API route handlers for the AI proxy endpoint. No separate backend needed.
**Alternatives**: Pages Router (legacy), separate Express backend (unnecessary complexity for MVP).

### 2. Configurable AI Provider with Client/Server Dispatch
**Decision**: Support three provider categories: browser built-in LLM (e.g., Chrome Built-in AI), local LLM server (e.g., LM Studio), and cloud API (OpenAI-compatible). Browser built-in and local LLM calls execute entirely client-side; only cloud API calls go through the server-side `/api/proofread` route.
**Rationale**: Browser built-in LLMs run in the browser via the `window.ai` API — no server needed. Local LLM servers (e.g., LM Studio) are accessible via `fetch` from the browser (with CORS). Only cloud APIs need server-side proxying to protect API keys. This avoids unnecessary server round-trips for client-side providers and keeps the architecture efficient. Using OpenAI-compatible API standards for the cloud provider ensures compatibility with any OpenAI-compatible service (OpenAI, Together, Groq, etc.).
**Alternatives**: Route all requests through the server (unnecessary latency for client-side providers), client-side only for all providers (exposes cloud API keys), vendor-specific provider implementations (less flexible).

### 3. Structured AI Response Format with Character Positions
**Decision**: The AI returns a JSON structure with a fully corrected sentence and an array of corrections, each containing character-level positions: `{ correctedInput: string, corrections: [{ correction: string, startIndex: number, endIndex: number, types: string[] }] }`.
**Rationale**: Character-level `startIndex`/`endIndex` enables precise inline highlighting in the UI — the original text span can be identified and visually marked without ambiguity. The `correctedInput` provides the full corrected sentence at a glance. The `types` array allows a single correction to be tagged with multiple categories (e.g., both "grammar" and "vocabulary").
**Alternatives**: `{ type, original, correction, explanation }` format (no position info — UI must fuzzy-match original text), free-form text (unreliable parsing).

### 4. Client-Side State with React State
**Decision**: Use React `useState` for managing the current text, submission state, and feedback results. No external state library.
**Rationale**: The app has minimal state — current input text, loading state, and feedback array. React's built-in state management is sufficient.
**Alternatives**: Zustand/Redux (unnecessary for this scope), URL state (not needed).

### 5. Tailwind CSS for Styling
**Decision**: Use Tailwind CSS for all styling.
**Rationale**: Tailwind is the default styling option in `create-next-app` and provides rapid, consistent styling without context-switching to separate CSS files.
**Alternatives**: CSS Modules, styled-components (more setup, less rapid for MVP).

### 6. Textarea with Shift+Enter-to-Submit
**Decision**: Use a `<textarea>` where Enter inserts a newline and Shift+Enter submits the text for proofreading.
**Rationale**: Since users are writing English sentences, they may want to write multiple lines before submitting. Plain Enter for newlines is the natural textarea behavior and avoids accidental submissions. Shift+Enter to submit is a deliberate action that prevents unintended proofread triggers.
**Alternatives**: Enter-to-submit with Shift+Enter for newline (accidental submissions risk), separate submit button only (less convenient), contentEditable div (harder to implement correctly).

### 7. Provider Settings with localStorage Persistence
**Decision**: Store the user's provider choice and configuration in localStorage. A settings panel/modal lets users configure their provider. For browser built-in LLM, no configuration is needed (auto-detected). For local LLM, an endpoint URL is stored. For cloud API, the API key is stored in localStorage (client-side) or `.env.local` (server-side).
**Rationale**: No backend database needed for MVP. localStorage persists across sessions. Browser built-in LLM requires zero config — just detect `window.ai` availability.
**Alternatives**: Server-side config file (not per-user), environment variables only (no user choice), cookies (smaller storage).

## Risks / Trade-offs

- **[AI response latency]** → Show a loading indicator during proofreading. Local LLMs may be slower; consider streaming in a future iteration if latency is problematic.
- **[AI response format instability]** → Use structured output / JSON mode from the provider. Add client-side validation and graceful error handling for malformed responses.
- **[API cost]** → Rate-limit submissions client-side (debounce or cooldown). Local LLM option eliminates cloud API costs entirely.
- **[No persistence]** → Users lose feedback on page refresh. Acceptable for MVP; can add localStorage or a database later.
- **[Local LLM availability]** → The user's local LLM server may not be running when they submit. Show a clear error if the local endpoint is unreachable, with a hint to start the LLM service.
- **[Browser built-in LLM availability]** → The `window.ai` API is only available in supported browsers (currently Chrome 127+). Detect availability at startup and hide the option if unsupported. Show a fallback message suggesting a supported browser.
- **[Cloud API key in localStorage]** → Storing API keys in localStorage is not ideal for shared devices. Acceptable for MVP; document the trade-off and consider server-side key storage in a future iteration.
