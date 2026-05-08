# Playground reference: program-editor day dialog

The day-edit dialog has been migrated to production. This playground now imports
the live components from `@calendar/ui/admin/programs/editor/`. Treat the page as
a visual sandbox — changes to behavior should be made in the production files.

## What lives where

- **DayDialog**: `packages/calendar/ui/src/admin/programs/editor/DayDialog.svelte`
- **TimeChip**: `packages/calendar/ui/src/admin/programs/editor/TimeChip.svelte`
- **SpotsStepper**: `packages/calendar/ui/src/admin/programs/editor/SpotsStepper.svelte`
- **DayDraft type + helpers**: `packages/calendar/ui/src/admin/programs/editor/day-dialog.types.ts`
- **Capacity chip**: `packages/calendar/ui/src/booking/CalendarGrid.svelte` (`day.capacity` field)
- **`--ins-control-*` tokens**: `packages/calendar/ui/src/admin/shell/admin-route-shell.scss`

The previous `ProgramDaySheet.svelte` has been deleted.

## What this playground page is

`+page.svelte` is a mockup harness that mirrors the visual structure of
`AdminProgramEditor.svelte` (lavender hero panel + AdminCalendar + day-edit
dialog). It uses local `$state` + a fake `events` map to demo the dialog without
needing a real `dashboard` controller, auth, or persistence.

To preview design changes, edit the production components and reload this page.
