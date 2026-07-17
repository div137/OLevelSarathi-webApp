# Requirements Document

## Introduction

This feature improves the existing quiz/test system in the O Level Sarathi NIELIT exam prep platform (React 18 + Firebase Realtime Database + Vite). The existing `QuizPage.jsx` has basic quiz logic but lacks persistent state, a reliable timer, answer auto-save, and a seamless resume experience after accidental refresh or browser crash. The improvements ensure students never lose progress, can resume any interrupted test exactly where they left off, and see questions with correct formatting including code indentation.

## Glossary

- **Quiz_System**: The test-taking module rendered by `QuizPage.jsx`
- **Test_Session**: A single attempt at a test, identified by `testId` and the student's browser session, stored in `localStorage`
- **Session_Store**: The `localStorage` key-value store used to persist test state across page refreshes
- **Timer**: The countdown component that tracks remaining time within a Test_Session
- **Shuffle_Map**: The pre-computed ordered list of question indices and their option permutations, stored once at session start and never regenerated
- **Answer_Map**: The mapping of question IDs to the student's selected option letters, persisted in the Session_Store
- **Formatted_Content**: The `FormattedContent` React component responsible for rendering question and option text
- **Code_Block**: A segment of question or option text detected as source code, rendered in a monospace preformatted element
- **Auto_Submit**: The action triggered by the Timer reaching zero, which finalises the test without student input
- **Navigation_Guard**: The browser event handlers (`beforeunload`, `popstate`) that intercept accidental exits during a running test

---

## Requirements

### Requirement 1: Question and Option Text Formatting

**User Story:** As a student, I want questions and answer options to display with their original formatting preserved, so that code snippets with Python indentation or multi-line content are readable and unambiguous.

#### Acceptance Criteria

1. THE Formatted_Content SHALL render any text value that contains two or more leading spaces on any line inside a `<pre>`-equivalent monospace element with `white-space: pre` applied.
2. THE Formatted_Content SHALL render any text value that contains Python keywords (`def`, `class`, `for`, `while`, `if`, `elif`, `else`, `try`, `except`, `finally`, `with`, `import`, `from`, `print`, `return`) at the start of a line inside a Code_Block.
3. THE Formatted_Content SHALL convert tab characters to exactly four spaces before rendering.
4. THE Formatted_Content SHALL render non-code text with `white-space: pre-wrap` so intentional line breaks are preserved without horizontal overflow.
5. WHEN a question text is rendered, THE Formatted_Content SHALL not truncate or collapse any whitespace characters present in the original stored value.
6. WHEN an option text is rendered, THE Formatted_Content SHALL apply the same formatting rules as question text.

---

### Requirement 2: Fixed 60-Minute Test Duration

**User Story:** As a student, I want every test to run for exactly 60 minutes, so that the experience mirrors the actual NIELIT exam duration regardless of what the database stores.

#### Acceptance Criteria

1. WHEN a new Test_Session is created, THE Timer SHALL initialise the total duration to 3600 seconds (60 minutes), ignoring any `duration` field stored in the Firebase test record.
2. WHEN the Timer is initialised for a new Test_Session, THE Quiz_System SHALL record the absolute start timestamp (`Date.now()`) in the Session_Store under the key `startTime`.
3. THE Timer SHALL calculate remaining time as `3600 - Math.floor((Date.now() - startTime) / 1000)` on every tick, using the hardcoded value 3600 rather than any duration value from the Firebase record, so it is anchored to wall-clock time and always guarantees a 60-minute limit.

---

### Requirement 3: Timer Persistence Across Refresh

**User Story:** As a student, I want the timer to continue from exactly where it left off after a page refresh or tab reopen, so that refreshing the page does not give me extra time.

#### Acceptance Criteria

1. WHEN the Quiz_System mounts and a Test_Session already exists in the Session_Store for the current `testId`, THE Timer SHALL resume from the remaining time computed as `3600 - Math.floor((Date.now() - storedStartTime) / 1000)`.
2. THE Timer SHALL NOT reset the `startTime` in the Session_Store if a `startTime` already exists for the current `testId`.
3. WHEN the computed remaining time is zero or negative upon page load, THE Quiz_System SHALL immediately transition to the result/auto-submit state without waiting for a tick. Remaining time of exactly zero is treated identically to negative remaining time.

---

### Requirement 4: Automatic Test Submission on Timer Expiry

**User Story:** As a student, I want the test to submit automatically when time runs out, so that I do not have to take any manual action and all answered questions are counted.

#### Acceptance Criteria

1. WHEN the Timer reaches zero, THE Quiz_System SHALL automatically transition status to `'result'` without requiring student interaction.
2. WHEN Auto_Submit occurs, THE Quiz_System SHALL use all answers stored in the Answer_Map at that moment to compute the final score.
3. WHEN Auto_Submit occurs, THE Quiz_System SHALL display a brief notification informing the student that the test was submitted automatically due to time expiry.
4. WHEN Auto_Submit occurs, THE Quiz_System SHALL clear the active Test_Session data from the Session_Store. IF the Session_Store removal operation throws an exception, THEN THE Quiz_System SHALL log the error and proceed to the result view regardless.

---

### Requirement 5: Navigation Guard on Active Test

**User Story:** As a student, I want to be warned before I accidentally leave an active test, so that I do not lose my progress by pressing the browser back button or refreshing the page.

#### Acceptance Criteria

1. WHILE the test status is `'playing'`, THE Navigation_Guard SHALL intercept `beforeunload` events and display the browser's built-in confirmation dialog.
2. WHILE the test status is `'playing'`, THE Navigation_Guard SHALL intercept `popstate` events and display the message: "Are you sure? Your test is currently running. Do you really want to leave this page?"
3. IF the student confirms exit from the `popstate` dialog, THEN THE Navigation_Guard SHALL allow navigation to proceed.
4. IF the student cancels exit from the `popstate` dialog, THEN THE Navigation_Guard SHALL push the current URL back onto the history stack to keep the student on the test page.
5. WHEN the test status transitions away from `'playing'` (result or quit), THE Navigation_Guard SHALL remove all event listeners to allow free navigation.

---

### Requirement 6: Test Session Resume After Accidental Close

**User Story:** As a student, I want to resume an accidentally closed test exactly where I left off — same answers selected, same question index, same remaining time — so that a browser crash or accidental close does not force me to restart.

#### Acceptance Criteria

1. WHEN the student reopens a test page whose `testId` matches an existing Test_Session in the Session_Store, THE Quiz_System SHALL restore the Answer_Map, current question index, and `startTime` from the Session_Store.
2. WHEN the Quiz_System resumes a Test_Session, THE Timer SHALL continue from the remaining time computed from the stored `startTime`, not from 3600 seconds.
3. WHEN the Quiz_System resumes a Test_Session, THE Quiz_System SHALL restore the Shuffle_Map so each question appears at the same index with the same option order as during the original session.
4. WHEN the computed remaining time is zero or negative upon page load, THE Quiz_System SHALL immediately transition to the result/auto-submit state without waiting for a tick. Remaining time of exactly zero is treated identically to negative remaining time.
5. WHEN the Quiz_System resumes a Test_Session, THE Quiz_System SHALL display a banner notifying the student: "Resuming your previous session."

---

### Requirement 7: Answer Auto-Save

**User Story:** As a student, I want every answer I select to be saved immediately to persistent storage, so that a browser crash or internet disconnect does not erase any of my selections.

#### Acceptance Criteria

1. WHEN the student selects an answer option, THE Quiz_System SHALL write the updated Answer_Map to the Session_Store within the same synchronous call stack as the state update.
2. THE Quiz_System SHALL store the Answer_Map in the Session_Store using the key `quiz_answers_{testId}`.
3. WHEN the Quiz_System mounts and an Answer_Map exists in the Session_Store for the current `testId`, THE Quiz_System SHALL initialise the `answers` state from the Session_Store value.
4. THE Quiz_System SHALL also persist the current question index to the Session_Store key `quiz_idx_{testId}` on every question navigation.

---

### Requirement 8: Question and Option Shuffle Persistence

**User Story:** As a student, I want the question order and option order to remain identical across a resume, so that my saved answer letters still map to the same options I originally selected.

#### Acceptance Criteria

1. WHEN a new Test_Session is created, THE Quiz_System SHALL generate the Shuffle_Map by shuffling question indices and option permutations once and storing the result in the Session_Store under the key `quiz_shuffle_{testId}`.
2. WHEN the Quiz_System resumes an existing Test_Session, THE Quiz_System SHALL read the Shuffle_Map from the Session_Store and apply it to reconstruct the same question order and option order, without re-shuffling.
3. THE Quiz_System SHALL NOT re-shuffle questions or options while a Test_Session is active.
4. WHEN options for a question are shuffled and stored in the Shuffle_Map, THE Quiz_System SHALL ensure that the correct answer mapping (`getCorrectOption`) remains accurate by resolving the correct answer from the original question data, not from the shuffled option position.

---

### Requirement 9: Session Store Cleanup

**User Story:** As a developer, I want the Session_Store to be cleaned up after a test is completed or voluntarily quit, so that stale test data does not interfere with future attempts.

#### Acceptance Criteria

1. WHEN the test status transitions to `'result'` via any path (manual submit, Auto_Submit, or expired session on load), THE Quiz_System SHALL attempt to remove the keys `quiz_answers_{testId}`, `quiz_idx_{testId}`, `quiz_shuffle_{testId}`, and `quiz_start_{testId}` from the Session_Store. IF the removal operation throws an exception, THEN THE Quiz_System SHALL log the error to the console and proceed to the result view without retrying.
2. WHEN the student triggers the quit action while the test is `'playing'`, THE Quiz_System SHALL prompt the student with: "Are you sure you want to quit? Your progress will be lost." Upon any confirmed or unconfirmed exit, THE Quiz_System SHALL remove all Session_Store keys for that `testId` before navigating away.
3. IF Session_Store read or write operations throw an exception (e.g., storage quota exceeded or private browsing restriction), THEN THE Quiz_System SHALL log the error to the console and continue operating with in-memory state only, without crashing.
