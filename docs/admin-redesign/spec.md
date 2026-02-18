# Admin Redesign Spec (Forward-Only)

## Canonical Tabs
- `dashboard`
- `events`
- `rules`
- `programs`
- `people`
- `connections`

No legacy tab IDs or aliases are supported.

## IA
- Dashboard: week grid, needs attention, memories, quick new event.
- Events: upcoming/past lists with event detail sheet.
- Rules: operating hours + booking guardrails.
- Programs: list + modal edit/create.
- People: member list, invite flow, per-program access editing.
- Connections: Google connection status + global payment defaults.

## Modals
- New Event modal with copy-from support.
- Edit Program modal.

## Feature Decisions
- Streaks: out of scope.
- Weather: in scope for event detail.
- Payment precedence: `event override > global default`.
- Waitlist action: admin can promote waitlisted users.

## Compatibility Policy
- No runtime compatibility adapters.
- No legacy route aliases.
- No dual payload shapes.
- One-way migrations only.
