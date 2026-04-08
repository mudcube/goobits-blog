# Restructure Plan

## Goal

Do one bounded structural reorganization for the calendar UI surface.

The purpose is to fix the current ownership split across:

- `packages/calendar/ui`
- `src/components/Admin`
- `src/lib/admin/AdminWysiwygWorkspace.svelte`
- route files under `src/routes/schedule/admin/**`

This plan is intentionally **not** a whole-repo rearchitecture.

## Why

Current structural problems:

- reusable admin UI still lives in `src/components/Admin` and `src/lib/admin`
- route files own reusable editor/admin UI
- `packages/calendar/ui/src/features/**` is feature-sliced in a way that hides product boundaries (admin vs. member)
- package code currently depends on app-local code in some places
- theme structure does not cleanly mirror UI ownership

The key package-boundary smell:

- `packages/calendar/ui` should not depend on app-local `src/components/Admin`

## Scope

### In Scope

- replace `packages/calendar/ui/src/features/**` with product-owned folders, feature-sliced underneath the role (`admin/events`, `member/booking`, etc.)
- remove `src/components/Admin/**` entirely
- move `src/lib/admin/AdminWysiwygWorkspace.svelte` to package UI
- move reusable admin UI into `packages/calendar/ui/src/admin/**`
- move member-facing calendar UI into `packages/calendar/ui/src/member/**`
- extract reusable admin editor UI out of route files into `packages/calendar/ui/src/admin/events/editor/**` and `packages/calendar/ui/src/admin/programs/editor/**`
- align `packages/calendar/theme/src/**` structure with the calendar UI package
- rewrite imports
- add/update barrel exports so imports stay short

### Out of Scope

- broad `src/lib/**` cleanup (except for the explicitly identified `AdminWysiwygWorkspace.svelte`)
- route tree moves under `src/routes/**`
- auth package restructuring beyond import alignment if needed
- repo-wide `packages/ui` redesign beyond small internal cleanup
- behavior changes to editor/contenteditable flows
- controller/API naming cleanup

## Target Structure

```diff
packages/calendar/ui/src/
- features/
+ admin/
+   auth/
+   availability/
+   dashboard/
+   events/
+     editor/
+   integrations/
+     google/
+   members/
+   programs/
+     editor/
+   shared/
+ member/
+   auth/
+   booking/
+   home/
+   profile/
+   shared/

packages/calendar/theme/src/
- calendar/
+ member/
  admin/
  shared/
+   _editor.scss

src/components/
- Admin/
```

*Note: Grouping by feature domain (e.g., `events`, `programs`, `booking`) underneath the role boundary scales better than grouping by component type (e.g., `modals`, `cards`), avoiding "junk drawer" folders.*

## Ownership Rules

### `packages/ui`

Owns cross-product primitives only:

- buttons
- forms
- filters
- navigation
- layout primitives
- feedback primitives

No calendar-specific composites here.

### `packages/calendar/ui/src/admin`

Owns reusable calendar admin UI, grouped by feature domains:

- `events/`: admin modals, cards, and forms for events
- `programs/`: admin UI for programs
- `shared/`: admin-specific layouts, nav, and generic workspace components. **Rule:** A component only goes in `shared/` if it is used by 2+ feature domains within the same role. Otherwise, it belongs in the specific feature domain.

### `packages/calendar/ui/src/member`

Owns reusable member-facing calendar UI, grouped by feature domains:

- `auth/`: member authentication UI
- `booking/`: member booking UI and calendar
- `home/`: member feed and dashboard UI
- `profile/`: member profile UI
- `shared/`: generic member UI. **Rule:** A component only goes in `shared/` if it is used by 2+ feature domains within the same role.

### `src/routes/schedule/**`

Owns route composition only:

- page wiring
- data/controller hookup
- route-specific composition

Must not own reusable UI components.

**Rule for Editor Extraction:** Move reusable editor UI only; keep route/controller state and route-specific orchestration in the page.

### `src/components/Admin`

This directory should be deleted.

Anything reusable here must move into `packages/calendar/ui/src/admin/**`.

## Move Strategy & Explicit Mapping

### Phase 1: Remove App-Local Admin UI

Move all reusable components out of `src/components/Admin/*` and `src/lib/admin/` into `packages/calendar/ui/src/admin/`.

**Explicit mapping for Phase 1:**
- `src/components/Admin/AdminActionButton.svelte` -> `packages/calendar/ui/src/admin/shared/AdminActionButton.svelte`
- `src/components/Admin/AdminCalendarWidget.svelte` -> `packages/calendar/ui/src/admin/dashboard/AdminCalendarWidget.svelte`
- `src/components/Admin/AdminChevronRowCard.svelte` -> `packages/calendar/ui/src/admin/shared/AdminChevronRowCard.svelte`
- `src/components/Admin/AdminCrewInviteModal.svelte` -> `packages/calendar/ui/src/admin/members/AdminCrewInviteModal.svelte`
- `src/components/Admin/AdminCrewMemberCard.svelte` -> `packages/calendar/ui/src/admin/members/AdminCrewMemberCard.svelte`
- `src/components/Admin/AdminDashboardContent.svelte` -> `packages/calendar/ui/src/admin/dashboard/AdminDashboardContent.svelte`
- `src/components/Admin/AdminDashboardRecentFeed.svelte` -> `packages/calendar/ui/src/admin/dashboard/AdminDashboardRecentFeed.svelte`
- `src/components/Admin/AdminDashboardTodayTimeline.svelte` -> `packages/calendar/ui/src/admin/dashboard/AdminDashboardTodayTimeline.svelte`
- `src/components/Admin/AdminEventSessionCard.svelte` -> `packages/calendar/ui/src/admin/events/AdminEventSessionCard.svelte`
- `src/components/Admin/AdminMetaCards.svelte` -> `packages/calendar/ui/src/admin/shared/AdminMetaCards.svelte`
- `src/components/Admin/AdminPageHero.svelte` -> `packages/calendar/ui/src/admin/shared/AdminPageHero.svelte`
- `src/lib/admin/AdminWysiwygWorkspace.svelte` -> `packages/calendar/ui/src/admin/events/editor/AdminWysiwygWorkspace.svelte`

### Phase 2: Replace `features/**` with `admin/**` and `member/**`

Move all features from `packages/calendar/ui/src/features/**` directly into the product-boundaried feature folders. The `features/` directory will be completely deleted afterwards.

**Explicit mapping for Phase 2:**
- `features/auth/admin/*` -> `admin/auth/*`
- `features/availability/admin/*` -> `admin/availability/*`
- `features/dashboard/admin/*` -> `admin/dashboard/*`
- `features/events/admin/*` -> `admin/events/*`
- `features/integrations/google/admin/*` -> `admin/integrations/google/*`
- `features/members/admin/*` -> `admin/members/*`
- `features/programs/admin/*` -> `admin/programs/*`
- `features/modals/admin/AdminNewEventModal.svelte` -> `admin/events/AdminNewEventModal.svelte`
- `features/modals/admin/AdminEditProgramModal.svelte` -> `admin/programs/AdminEditProgramModal.svelte`
- `features/admin/admin.ts` -> `admin/shared/admin.ts`
- `features/auth/member/*` -> `member/auth/*`
- `features/events/member/ActivityBookingPage.svelte` (and related booking UI) -> `member/booking/*`
- `features/events/member/CalendarHomePage.svelte` (and related feed UI) -> `member/home/*`
- `features/events/member/CalendarProfilePage.svelte` -> `member/profile/*`

### Phase 3: Extract admin editor UI from routes

Extract reusable editor UI currently hardcoded inside SvelteKit route files into the shared package.

**Explicit mapping for Phase 3:**
- Extract the WYSIWYG editor component and its internal logic from `src/routes/schedule/admin/events/program/[slug]/+page.svelte` into `packages/calendar/ui/src/admin/programs/editor/`
- Extract the new event creation modal/logic from `src/routes/schedule/admin/events/new/+page.svelte` into `packages/calendar/ui/src/admin/events/editor/`

*Rule: Keep route state wiring, controller hookup, and page-level composition in the route files. Do not change editor behavior during extraction.*

### Phase 4: Align theme structure

Rename the theme folder to align with the new package UI structure. Update the `package.json` exports.

**Explicit mapping for Phase 4:**
- Rename `packages/calendar/theme/src/calendar/` to `packages/calendar/theme/src/member/`
- Update `packages/calendar/theme/package.json` `exports` to map `"./member.scss": "./member.scss"` instead of `"./calendar.scss"`
- Update `packages/calendar/theme/src/index.ts` or `admin.scss`/`member.scss` imports if applicable
- Search and replace all SCSS `@use` or `@import` statements pointing to `@calendar/theme/calendar/...` to point to `@calendar/theme/member/...`

Add `packages/calendar/theme/src/shared/_editor.scss` to hold any specific styles needed by the extracted WYSIWYG components.

### Phase 5: Fix Imports

Rewrite all UI imports globally to reflect the structural shift, including explicit barrel file updates.

**Explicit mapping for Phase 5:**
- `packages/calendar/ui/src/index.ts` must export the new paths: `admin/auth/AdminLoginCard.svelte`, etc., instead of `features/auth/admin/...`
- Find and replace `@calendar/ui/features/...` imports in `src/routes/` and other app code with `@calendar/ui/admin/...` or `@calendar/ui/member/...` 
- Find and replace `@components/Admin/...` with `@calendar/ui/admin/shared/...` or respective new domains
- Find and replace `$lib/admin/AdminWysiwygWorkspace.svelte` with `@calendar/ui/admin/events/editor/AdminWysiwygWorkspace.svelte`
- Find and replace `./features/` to respective `./admin/` and `./member/` directories inside `packages/calendar/ui/src/**`

## Concrete Principles

### Do

- One bounded PR, executed in ordered steps. Use a phased execution locally to validate each step.
- After each phase, run import search + typecheck before continuing.
- Move ownership to product packages
- Keep route files thin
- Keep editor domain separate from forms domain
- Make theme structure reflect UI structure
- Execute exactly as mapped in the phase lists without guessing

### Do Not

- Reorganize the entire repo in the same pass
- Mix package cleanup with broad `src/lib` cleanup
- Redesign UI while moving files
- Change behavior unless necessary for extraction
- Leave temporary duplicate component ownership in both old and new locations

## Risks

Main risks in this reorg:

- high import-path churn
- merge conflict pressure in `src/routes/schedule/admin/**`
- review difficulty if file moves and behavior changes are mixed
- broken dev environment if all moves are done before fixing imports

## Risk Controls

- keep the PR bounded to calendar UI structure
- keep behavior changes out
- use barrel exports
- keep `shared/` minimal and intentional

## Success Criteria

The restructure is complete when:

- `src/components/Admin/**` no longer exists
- `src/lib/admin/AdminWysiwygWorkspace.svelte` is moved
- `packages/calendar/ui/src/features/**` no longer exists
- package code does not import app-local UI
- route files are composition-oriented, not reusable UI owners
- calendar theme structure matches the admin/member/shared split
- all imports are rewritten and validated cleanly

## Non-Goals For This Pass

These can happen later in separate work:

- full `packages/ui` internal redesign
- moving base CSS fully out of app theme files
- `src/lib` topology cleanup
- auth package UI reorganization
- route tree reorganization