# Admin Editor History Module Proposal (Undo/Redo)

## Goal
Add a shared history module for admin editors so users can undo/redo edits with:
- `Ctrl+Z` / `Cmd+Z` -> undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` (and optionally `Ctrl+Y`) -> redo

Scope target:
- Event Program Editor (`/admin/events/[slug]/`)
- Reusable for Settings/Crew forms later

## Why
- Reduces fear while editing schedule/text/settings
- Pairs well with autosave workflows (no explicit Save button)
- Gives keyboard-native editing behavior users expect

## Design

### 1) Shared core utility
Create `src/lib/admin/history/create-history.ts`:
- Generic state history manager with:
  - `push(snapshot)`
  - `undo()`
  - `redo()`
  - `canUndo`, `canRedo`
  - `clear()`
- Config:
  - `maxEntries` (default 100)
  - optional `coalesceMs` (merge rapid edits into one entry)

### 2) Program editor integration
In `src/routes/admin/events/program/[slug]/+page.svelte`:
- Track snapshots for:
  - title/subtitle/icon/eyebrow fields
  - scheduled-day mutations (add/edit/remove)
  - settings drawer field changes
- Push history only on meaningful changes (not on every keypress), using debounce/coalescing.
- Undo/redo updates local draft state and triggers the same autosave pipeline.

### 3) Keyboard handling
- Add route-level key handlers with guardrails:
  - ignore while IME composing
  - ignore inside non-editor inputs if browser-native undo should win
  - preventDefault only when app-level undo/redo actually runs

### 4) Autosave interaction
- Keep autosave as source of truth.
- Undo/redo applies to local draft first, then autosave persists.
- If autosave fails, keep local draft and show toast error.

### 5) UX affordances (optional)
- Topbar lightweight chips/buttons: `Undo` / `Redo` (disabled when unavailable)
- Toast messages: `Undid change`, `Redid change`

## Data model notes
- Snapshot shape should match existing draft shape exactly.
- Use immutable clones for snapshots.
- Consider lightweight diff entries later if memory becomes concern.

## Rollout plan
1. Build shared history utility + unit tests.
2. Wire into program editor only.
3. Validate with keyboard + autosave edge cases.
4. Expand to settings forms as second phase.

## Acceptance criteria
- Undo/redo works for text edits and day schedule operations.
- Keyboard shortcuts work on macOS + Windows layouts.
- No regressions to autosave behavior.
- History stack is bounded and performant.
