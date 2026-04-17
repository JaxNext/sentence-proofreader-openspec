## 1. Project Setup

- [ ] 1.1 Initialize Next.js 16 project with App Router using `create-next-app` (TypeScript, Tailwind CSS, ESLint)
- [ ] 1.2 Create `.env.local` with `LLM_API_KEY` placeholder and add `.env.local` to `.gitignore`
- [ ] 1.3 Verify the dev server starts and the default page renders

## 2. AI Provider Abstraction Layer

- [ ] 2.1 Define a `ProofreadProvider` interface with a `proofread(text: string)` method returning `{ correctedInput, corrections }`
- [ ] 2.2 Implement a `BrowserAIProvider` that calls the `window.Proofreader` API directly in the browser
- [ ] 2.3 Implement a `LocalProvider` that calls a local LLM endpoint (e.g., LM Studio) directly from the browser via `fetch`
- [ ] 2.4 Implement a `CloudProvider` that calls an OpenAI-compatible API via the server-side `/api/proofread` route
- [ ] 2.5 Create a provider factory that instantiates the correct provider based on user configuration and dispatches client-side vs server-side accordingly

## 3. Server-Side API Route (Cloud Providers Only)

- [ ] 3.1 Create `/api/proofread` route handler accepting POST with `{ text: string }` body
- [ ] 3.2 Implement input validation — return 400 if `text` is missing or empty/whitespace-only
- [ ] 3.3 Build the AI prompt that instructs the model to return `{ correctedInput, corrections: [{ correction, startIndex, endIndex, types }] }`
- [ ] 3.4 Call the cloud AI provider API using OpenAI-compatible chat completions format
- [ ] 3.5 Parse and validate the AI response, returning the structured result to the client
- [ ] 3.6 Add error handling for cloud AI API failures — return 500 with user-friendly error message

## 4. Provider Settings UI

- [ ] 4.1 Create a settings panel/modal with a provider type selector (Browser Built-in AI / Local LLM / Cloud API)
- [ ] 4.2 Auto-detect browser built-in LLM availability (`window.ai`) and disable the option if unsupported
- [ ] 4.3 Add input fields for local LLM endpoint URL (default: `http://localhost:1234` for LM Studio)
- [ ] 4.4 Add input fields for cloud API key (when a cloud provider is selected)
- [ ] 4.5 Persist provider settings to localStorage and load them on app startup
- [ ] 4.6 Pass the selected provider configuration to the proofreading dispatch logic

## 5. Writing Editor Component

- [ ] 5.1 Create the main page layout with a centered textarea component
- [ ] 5.2 Implement Shift+Enter-to-submit behavior (Enter inserts newline, Shift+Enter submits)
- [ ] 5.3 Add empty/whitespace text submission prevention
- [ ] 5.4 Add loading state — disable textarea and show spinner while proofreading is in progress
- [ ] 5.5 Re-enable textarea and clear loading state when feedback arrives or on error

## 6. Feedback Display Component

- [ ] 6.1 Create a component that renders the original text with inline highlights at `startIndex`/`endIndex` positions
- [ ] 6.2 Display the `correctedInput` (fully corrected text) prominently below the textarea
- [ ] 6.3 Add visual distinction by correction type — different colors/icons for vocabulary, grammar, and native-suggestion
- [ ] 6.4 Handle corrections with multiple types by showing all applicable indicators
- [ ] 6.5 Show correction text near each highlighted span (tooltip or inline label)
- [ ] 6.6 Show a "no issues found" message when the corrections array is empty
- [ ] 6.7 Display user-friendly error messages for API failures, unreachable local LLM, and unsupported browser

## 7. Polish and Integration

- [ ] 7.1 Style the overall page for a clean, distraction-free writing experience (responsive for desktop and mobile)
- [ ] 7.2 Add a brief header/title explaining the tool's purpose
- [ ] 7.3 End-to-end test: write a sentence with errors, press Shift+Enter, verify feedback displays with correct highlights and corrected text
