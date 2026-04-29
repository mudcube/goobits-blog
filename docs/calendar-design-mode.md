# Calendar Design Mode

Calendar mock data is intentionally kept as a design surface. Add `mock=1` to calendar routes to render representative data without relying on local database state.

Useful URLs:

- `/schedule?mock=1` - member schedule landing page with mock programs, upcoming sessions, and recent sessions.
- `/schedule/gym?mock=1&preview=1` - member program booking calendar using the `gym` mock event feed.
- `/schedule/circus?mock=1&preview=1` - same member booking calendar with a different program data shape.
- `/schedule/book?mock=1&preview=1` - guided custom booking flow backed by booking mock data.
- `/schedule/admin?mock=1&preview=1` - admin shell with the admin mock catalog.

Implementation notes:

- App route loaders should use `isScheduleDesignMode()` from `$lib/app/schedule/design-mode`.
- Links that should preserve design mode should use `withScheduleDesignMode()`.
- Admin UI components still use `@calendar/ui/admin/mock/mock-mode` because they run inside the UI package and cannot import app-level `$lib` helpers.
- Mock data should stay close to the surface it supports: member schedule data in `src/lib/app/schedule/mock-data.ts`, admin catalog data in `src/lib/app/schedule/admin/mock-data.ts`, and guided booking data in `packages/calendar/ui/src/booking/mock-data.ts`.
