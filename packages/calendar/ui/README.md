# @calendar/ui

Svelte components for the calendar/scheduling system, split across admin,
member (booking), and shared surfaces.

## Layout

```
src/
├── admin/         ← admin dashboard, event detail, member management, shell
├── booking/       ← schedule grid, day pickers, calendar surface controller
├── member/        ← profile, booked event card, booking calendar
├── shared/        ← cross-cutting components (events, activity display, date format)
└── ...
```

The component design surface follows the host app's BEM + em-breakpoint
conventions and consumes the calendar theme via `@calendar/theme`.

## How to extend

1. Place new components under the matching domain folder.
2. Surface them through that folder's `index.ts` if they're meant to be
   imported from outside the folder.
3. For a new top-level domain (rare), add it to this README.

Tests live in `__tests__/unit/`.
