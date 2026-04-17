## ADDED Requirements

### Requirement: Display corrected input
The system SHALL display the fully corrected version of the user's input text.

#### Scenario: Corrected input is shown after proofreading
- **WHEN** the proofreading API returns a result with `correctedInput`
- **THEN** the corrected input text is displayed prominently below the textarea

#### Scenario: Corrected input matches original when no issues found
- **WHEN** the proofreading API returns a result with no corrections
- **THEN** a message indicating no issues were found is displayed alongside the original text

### Requirement: Inline highlighting using character positions
The system SHALL highlight the original text spans identified by `startIndex`/`endIndex` in each correction item.

#### Scenario: Original text is highlighted at the correct position
- **WHEN** a correction item has `startIndex: 2` and `endIndex: 5`
- **THEN** the characters from position 2 to 5 in the original input are visually highlighted (e.g., underline, background color, or strikethrough)

#### Scenario: Multiple corrections are highlighted simultaneously
- **WHEN** multiple correction items are returned
- **THEN** each span in the original text is highlighted independently, all visible at the same time

### Requirement: Visual distinction by correction type
The system SHALL visually distinguish corrections by their `types` array values (vocabulary, grammar, native-suggestion).

#### Scenario: Vocabulary correction has distinct styling
- **WHEN** a correction item has `"vocabulary"` in its `types` array
- **THEN** it is displayed with a visual indicator (e.g., color or icon) that distinguishes it from grammar and native-suggestion corrections

#### Scenario: Grammar correction has distinct styling
- **WHEN** a correction item has `"grammar"` in its `types` array
- **THEN** it is displayed with a visual indicator that distinguishes it from vocabulary and native-suggestion corrections

#### Scenario: Native suggestion correction has distinct styling
- **WHEN** a correction item has `"native-suggestion"` in its `types` array
- **THEN** it is displayed with a visual indicator that distinguishes it from vocabulary and grammar corrections

#### Scenario: Correction with multiple types shows all indicators
- **WHEN** a correction item has multiple types (e.g., `["grammar", "vocabulary"]`)
- **THEN** all applicable visual indicators are shown for that correction

### Requirement: Show correction details
The system SHALL display the correction text for each highlighted span, showing what the original text should be replaced with.

#### Scenario: Correction text is shown alongside the highlighted original
- **WHEN** a correction item is displayed
- **THEN** the `correction` text is shown near the highlighted original span (e.g., as a tooltip, inline replacement, or adjacent label)

### Requirement: Error state display
The system SHALL display an error message when the proofreading API call fails.

#### Scenario: API error is shown to the user
- **WHEN** the proofreading API returns an error or the request fails
- **THEN** a user-friendly error message is displayed
- **AND** the textarea is re-enabled for the user to retry

#### Scenario: Local LLM unreachable error is shown
- **WHEN** the local LLM endpoint is unreachable
- **THEN** an error message is displayed indicating the local LLM service is unavailable, with a suggestion to verify it is running
