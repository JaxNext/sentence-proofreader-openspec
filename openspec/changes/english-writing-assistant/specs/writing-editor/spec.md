## ADDED Requirements

### Requirement: Text input area for writing
The system SHALL provide a textarea where users can write English sentences.

#### Scenario: User sees the writing area on page load
- **WHEN** the page loads
- **THEN** a textarea is visible and focused, ready for user input

#### Scenario: User types English text
- **WHEN** user types text into the textarea
- **THEN** the text is displayed in the textarea in real time

### Requirement: Shift+Enter submits text for proofreading
The system SHALL submit the text for AI proofreading when the user presses Shift+Enter. Plain Enter inserts a newline.

#### Scenario: User presses Shift+Enter to submit
- **WHEN** user presses Shift+Enter in the textarea
- **THEN** the current text is submitted for proofreading
- **AND** the textarea is not cleared until feedback is displayed

#### Scenario: User presses Enter for newline
- **WHEN** user presses Enter (without Shift) in the textarea
- **THEN** a newline is inserted without triggering submission

### Requirement: Loading state during proofreading
The system SHALL display a loading indicator while the AI is processing the submitted text.

#### Scenario: Loading indicator appears during processing
- **WHEN** user submits text for proofreading
- **THEN** a loading indicator is shown
- **AND** the textarea is disabled to prevent duplicate submissions

#### Scenario: Loading indicator disappears when feedback arrives
- **WHEN** the AI response is received
- **THEN** the loading indicator is removed
- **AND** the textarea is re-enabled for further input

### Requirement: Empty text submission prevention
The system SHALL NOT submit text for proofreading if the textarea contains only whitespace.

#### Scenario: User presses Enter with empty or whitespace-only text
- **WHEN** user presses Enter and the textarea is empty or contains only whitespace
- **THEN** no submission occurs
- **AND** no loading indicator is shown
