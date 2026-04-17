## ADDED Requirements

### Requirement: Server-side API endpoint for cloud providers
The system SHALL expose a server-side API endpoint that proxies proofreading requests to cloud AI providers.

#### Scenario: Valid text submission to cloud provider returns feedback
- **WHEN** a POST request is sent to `/api/proofread` with a non-empty `text` field in the JSON body and a cloud provider is configured
- **THEN** the endpoint proxies the request to the cloud AI provider and returns a 200 response with a JSON object containing `correctedInput` and `corrections`

#### Scenario: Missing text field returns error
- **WHEN** a POST request is sent to `/api/proofread` without a `text` field
- **THEN** the endpoint returns a 400 response with an error message

### Requirement: Client-side proofreading for local and browser built-in LLMs
The system SHALL execute proofreading directly in the browser when a local LLM server or browser built-in LLM is selected, without routing through the server-side API endpoint.

#### Scenario: Browser built-in LLM proofreading runs client-side
- **WHEN** the user has selected the browser built-in LLM provider and submits text for proofreading
- **THEN** the system calls the `window.ai` API directly in the browser
- **AND** no request is sent to `/api/proofread`

#### Scenario: Local LLM server proofreading runs client-side
- **WHEN** the user has selected a local LLM server (e.g., LM Studio) and submits text for proofreading
- **THEN** the system calls the local LLM endpoint directly from the browser via `fetch`
- **AND** no request is sent to `/api/proofread`

#### Scenario: Browser built-in LLM is not available
- **WHEN** the user has selected the browser built-in LLM provider but `window.Proofreader` is not available in the current browser
- **THEN** the system displays an error indicating the browser does not support built-in AI and suggests using a supported browser (e.g., Chrome 127+)

#### Scenario: Local LLM server is unreachable
- **WHEN** the user has selected a local LLM server and the endpoint is not reachable
- **THEN** the system displays an error indicating the local LLM service is unavailable and suggests verifying it is running

### Requirement: Structured feedback format with character positions
The system SHALL return proofreading results in the format: `{ correctedInput: string, corrections: [{ correction: string, startIndex: number, endIndex: number, types: string[] }] }`, regardless of which provider is used.

#### Scenario: Feedback contains corrected input and positioned corrections
- **WHEN** the AI identifies issues in the submitted text
- **THEN** the response SHALL include `correctedInput` (the fully corrected version of the input text)
- **AND** a `corrections` array where each item contains `correction` (the replacement text), `startIndex` (character offset where the issue begins in the original input), `endIndex` (character offset where the issue ends in the original input), and `types` (an array of one or more category strings such as "vocabulary", "grammar", or "native-suggestion")

#### Scenario: No issues found returns empty corrections
- **WHEN** the submitted text has no vocabulary, grammar, or phrasing issues
- **THEN** the result contains `correctedInput` equal to the original text and an empty `corrections` array

### Requirement: Vocabulary error detection
The system SHALL identify incorrect or inappropriate vocabulary usage in the submitted text.

#### Scenario: Incorrect word choice is detected
- **WHEN** the submitted text contains an incorrectly used word (e.g., "make" instead of "do" in "make homework")
- **THEN** a correction item with `"vocabulary"` in its `types` array is returned, with `startIndex`/`endIndex` pointing to the incorrect word and `correction` containing the correct word

### Requirement: Grammar error detection
The system SHALL identify grammatical errors in the submitted text.

#### Scenario: Grammar mistake is detected
- **WHEN** the submitted text contains a grammar error (e.g., subject-verb agreement, wrong tense, article misuse)
- **THEN** a correction item with `"grammar"` in its `types` array is returned, with `startIndex`/`endIndex` pointing to the erroneous text and `correction` containing the fix

### Requirement: Native expression suggestion
The system SHALL suggest more natural or native-sounding alternatives for grammatically correct but awkward phrasing.

#### Scenario: Awkward but grammatically correct phrasing is improved
- **WHEN** the submitted text is grammatically correct but expressed in a non-native or unnatural way
- **THEN** a correction item with `"native-suggestion"` in its `types` array is returned, with `startIndex`/`endIndex` pointing to the awkward phrase and `correction` containing a more natural alternative

### Requirement: Configurable AI provider
The system SHALL support browser built-in LLM, local LLM server, and cloud API providers, selectable by the user.

#### Scenario: User selects a cloud API provider
- **WHEN** the user configures a cloud API provider with an API key
- **THEN** proofreading requests are routed through the server-side `/api/proofread` endpoint using an OpenAI-compatible API format

#### Scenario: User selects a local LLM server
- **WHEN** the user configures a local LLM endpoint (e.g., LM Studio at `http://localhost:1234`)
- **THEN** proofreading requests are sent directly from the browser to the local endpoint

#### Scenario: User selects browser built-in LLM
- **WHEN** the user selects the browser built-in LLM option
- **THEN** proofreading is performed using the `window.ai` API entirely within the browser, with no network requests

### Requirement: Cloud API key security
The system SHALL store cloud API keys securely and SHALL NOT expose them in client-side JavaScript bundles when using server-side proxying.

#### Scenario: API key is not present in client bundle when using server proxy
- **WHEN** the application is built and served and the user has configured a cloud API key for server-side storage
- **THEN** the API key is only accessible within server-side API routes
- **AND** the key is not included in any client-side JavaScript bundle
