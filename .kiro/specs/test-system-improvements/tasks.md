# Implementation Plan: Test System Improvements

## Overview

Refactor `QuizPage.jsx` by extracting session persistence into `useQuizSession.js` and timer logic into `useQuizTimer.js`, then wire them back into the page. Add a resume banner, auto-submit notification, corrected navigation guard messages, and a quit prompt fix. Set up Vitest + fast-check and create three test files covering all 12 correctness properties.

## Tasks

- [ ] 1. Set up testing infrastructure
  - Install `vitest`, `@vitest/coverage-v8`, and `fast-check` as devDependencies
  - Add a `vitest.config.js` (or `vite.config.js` merge) that sets `environment: 'jsdom'` and `globals: true`
  - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `package.json`
  - _Requirements: (infrastructure prerequisite for all test tasks)_

- [ ] 2. Create `useQuizSession` hook
  - [ ] 2.1 Implement `src/hooks/useQuizSession.js`
    - Define `KEYS` constants (`quiz_answers_`, `quiz_idx_`, `quiz_shuffle_`, `quiz_start_`)
    - Implement `safeGet`, `safeSet`, `safeRemove` helpers with `try/catch` and `console.error` on failure
    - On mount: check `quiz_start_{testId}`; if present → restore all 4 keys and set `isResumed = true`; if absent → write `startTime = Date.now()`, set defaults
    - Expose `answers`, `currentIdx`, `shuffleMap`, `startTime`, `isResumed`, `saveAnswer`, `saveIdx`, `initShuffle`, `clearSession`
    - `initShuffle` only writes if no existing shuffle map in localStorage
    - `clearSession` removes all 4 keys via `safeRemove`
    - _Requirements: 3.2, 6.1, 6.3, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 9.1, 9.3_

  - [ ]* 2.2 Write property test — Property 7: startTime immutability on resume
    - **Property 7: startTime immutability on resume**
    - Seed localStorage with a known `quiz_start_{testId}` value `T` before calling the hook; assert it is unchanged after initialisation
    - **Validates: Requirements 3.2, 8.3**

  - [ ]* 2.3 Write property test — Property 9: Session round-trip completeness
    - **Property 9: Session round-trip completeness**
    - Use `fc.record` to generate arbitrary `testId`, `answers`, `currentIdx`, `shuffleMap`, `startTime`; call all mutators; create a fresh hook instance; assert deep equality
    - **Validates: Requirements 6.1, 6.3, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2**

  - [ ]* 2.4 Write property test — Property 10: Session cleanup completeness
    - **Property 10: Session cleanup completeness**
    - For any `testId` where all 4 keys are present, call `clearSession()` and assert all 4 keys are absent from localStorage
    - **Validates: Requirements 4.4, 9.1, 9.2**

  - [ ]* 2.5 Write property test — Property 12: localStorage error resilience
    - **Property 12: localStorage error resilience**
    - Mock `localStorage.getItem`, `setItem`, and `removeItem` to throw; assert the hook does not rethrow and returns valid in-memory defaults
    - **Validates: Requirements 9.3**

  - [ ]* 2.6 Write unit tests for `useQuizSession`
    - New session: all 4 keys written; `isResumed === false`
    - Resumed session: `isResumed === true`; `startTime` unchanged
    - `clearSession` removes all 4 keys
    - Correct quit-prompt text
    - _Requirements: 3.2, 6.1, 6.5, 7.2, 8.1, 9.1_

- [ ] 3. Checkpoint — Ensure `useQuizSession` tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create `useQuizTimer` hook
  - [ ] 4.1 Implement `src/hooks/useQuizTimer.js`
    - Define `TOTAL_SECONDS = 3600` as a module-level constant
    - On mount and whenever `startTime` changes: compute `timeLeft` synchronously using `Math.max(0, TOTAL_SECONDS - Math.floor((Date.now() - startTime) / 1000))`
    - When `startTime === null`: return `{ timeLeft: TOTAL_SECONDS, autoSubmit: false }`, do not start interval
    - Start a 1 000 ms `setInterval` only while `status === 'playing'` and `startTime !== null`
    - Set `autoSubmit = true` in the same tick that `timeLeft` reaches 0
    - Clean up interval on unmount or status/startTime change
    - Hook is pure computation — no localStorage reads or writes
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 4.1, 6.4_

  - [ ]* 4.2 Write property test — Property 5: Timer hardcoded to 3600 seconds
    - **Property 5: Timer hardcoded to 3600 seconds**
    - Use `fc.record({ duration: fc.oneof(fc.integer(), fc.constant(null), fc.constant(undefined)) })` to generate arbitrary Firebase test records; assert `timeLeft` never exceeds 3600
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 4.3 Write property test — Property 6: Remaining time formula correctness
    - **Property 6: Remaining time formula correctness**
    - Use `fc.integer({ min: Date.now() - 3_600_000, max: Date.now() })` to generate `startTime`; assert `computeRemainingTime(startTime)` equals the formula exactly
    - **Validates: Requirements 2.3, 3.1**

  - [ ]* 4.4 Write property test — Property 8: Expired session triggers immediate auto-submit
    - **Property 8: Expired session triggers immediate auto-submit**
    - Use `fc.integer({ min: 0, max: Date.now() - 3_600_000 })` to generate expired `startTime`; assert the hook returns `{ timeLeft: 0, autoSubmit: true }` on first evaluation without waiting for a tick
    - **Validates: Requirements 3.3, 4.1, 6.4**

  - [ ]* 4.5 Write unit tests for `useQuizTimer`
    - `timeLeft` ≈ 3600 when `startTime = Date.now()`
    - `autoSubmit === true` immediately when `startTime` places remaining time at 0
    - `startTime === null` → `timeLeft === 3600`, no interval started
    - _Requirements: 2.1, 2.3, 3.3, 4.1_

- [ ] 5. Checkpoint — Ensure `useQuizTimer` tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Write `looksLikeCode` and `normalizeText` property tests
  - [ ] 6.1 Create `src/pages/QuizPage.looksLikeCode.test.js`
    - Export or import `looksLikeCode` and `normalizeText` from `QuizPage.jsx` (or extract to a shared utility if not yet exported)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 6.2 Write property test — Property 1: Code detection is input-universal (indentation)
    - **Property 1: Code detection is input-universal**
    - Use `fc.string()` to build strings that contain at least one line with 2+ leading spaces; assert `looksLikeCode(normalizeText(value)) === true`
    - **Validates: Requirements 1.1, 1.3**

  - [ ]* 6.3 Write property test — Property 2: Python keyword detection is input-universal
    - **Property 2: Python keyword detection is input-universal**
    - Use `fc.constantFrom(...KEYWORDS)` to prepend a keyword at line start; assert `looksLikeCode(text) === true`
    - **Validates: Requirements 1.2**

  - [ ]* 6.4 Write property test — Property 3: Tab normalisation round-trip
    - **Property 3: Tab normalisation round-trip**
    - Use `fc.string().filter(s => s.includes('\t'))`; assert `normalizeText(value)` contains no `\t` and contains at least one `'    '` (4 spaces)
    - **Validates: Requirements 1.3**

  - [ ]* 6.5 Write property test — Property 4: Non-code prose detection
    - **Property 4: Non-code prose detection**
    - Generate strings that have no leading indentation, no Python keywords at line start, no `>>>`, and no block-ending colon pattern; assert `looksLikeCode(text) === false`
    - **Validates: Requirements 1.4**

  - [ ]* 6.6 Write property test — Property 11: Correct answer invariant under option shuffle
    - **Property 11: Correct answer invariant under option shuffle**
    - Use `fc.record` to generate a question object with options `a`–`d` and a `correct` field; generate all permutations of option order; assert `getCorrectOption(q)` returns the same letter regardless of display permutation
    - **Validates: Requirements 8.4**

  - [ ]* 6.7 Write unit tests for `FormattedContent`
    - Renders `<pre>`-equivalent element for indented code text
    - Renders element with `white-space: pre-wrap` for plain prose
    - _Requirements: 1.1, 1.4_

- [ ] 7. Integrate `useQuizSession` into `QuizPage.jsx`
  - [ ] 7.1 Replace inline state and Fisher-Yates shuffle with `useQuizSession`
    - Remove `useState` for `idx` and `answers`; replace with `currentIdx`, `answers` from `useQuizSession(testId)`
    - Remove the inline `useMemo` shuffle in the `questions` computation; replace the `shuffled` logic with `initShuffle` call after questions load
    - Apply `shuffleMap` (array of `{ qIdx, optionOrder }`) when rendering questions so order is deterministic
    - `saveAnswer` called in the answer-click handler instead of bare `setAnswers`
    - `saveIdx` called on every question navigation instead of bare `setIdx`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

  - [ ] 7.2 Add resume banner
    - When `isResumed === true` from `useQuizSession`, render a dismissible banner above the question card with text: "Resuming your previous session."
    - _Requirements: 6.5_

  - [ ] 7.3 Call `clearSession` on result transition and quit
    - Call `clearSession()` when `status` transitions to `'result'` (in the `useEffect` that watches `status`)
    - Call `clearSession()` in the `handleQuit` function before `navigate('/tests')`
    - _Requirements: 4.4, 9.1, 9.2_

- [ ] 8. Integrate `useQuizTimer` into `QuizPage.jsx`
  - [ ] 8.1 Replace manual timer state with `useQuizTimer`
    - Remove `useState(0)` for `timeLeft` and the `setInterval` `useEffect` that decrements it
    - Remove the `useEffect` that seeds `timeLeft` from `test.duration`
    - Add `const { timeLeft, autoSubmit } = useQuizTimer(startTime, status)` where `startTime` comes from `useQuizSession`
    - _Requirements: 2.1, 2.3, 3.1_

  - [ ] 8.2 Wire auto-submit
    - Add a `useEffect` that watches `autoSubmit`; when `true` and `status === 'playing'`, call `clearSession()` and set `status` to `'result'`
    - Show a notification (e.g. a brief toast or inline banner) informing the student the test was submitted automatically due to time expiry
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Fix navigation guard messages and quit prompt
  - [ ] 9.1 Fix `popstate` dialog message
    - Update the `window.confirm` call inside the `popstate` handler to use exactly: `"Are you sure? Your test is currently running. Do you really want to leave this page?"`
    - _Requirements: 5.2_

  - [ ] 9.2 Fix quit prompt message
    - Update `handleQuit`'s `window.confirm` call to use exactly: `"Are you sure you want to quit? Your progress will be lost."`
    - _Requirements: 9.2_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (Properties 1–12 from design.md)
- Unit tests validate specific examples and edge cases
- `looksLikeCode` and `normalizeText` should be exported from `QuizPage.jsx` (or a shared utility) to make them testable without a DOM renderer
- The `ShuffleMap` entry shape is `{ qIdx: number, optionOrder: string[] }` — option letters stored are the original letters from the question object, not display-position indices

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "4.1", "6.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "4.2", "4.3", "4.4", "4.5", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"] },
    { "id": 3, "tasks": ["7.1"] },
    { "id": 4, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 5, "tasks": ["8.2", "9.1", "9.2"] }
  ]
}
```
