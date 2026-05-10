# @calendar/preset-miko

Site-specific configuration preset for the miko-art instance of the
calendar system. Applied once at server startup.

## How it's wired

- `src/hooks.server.ts` calls `applyMikoCalendarPreset()` during the
  Cloudflare worker initialization phase.
- `src/routes/+layout.ts` calls it again on the client side so the same
  defaults apply during client-side navigation.

## What it sets

See `src/index.ts`. Typically: program defaults, default timezone,
admin/member theming hooks, brand-specific copy. Anything site-specific
that the engine itself shouldn't carry.

## Adding a new preset

If a second site needs its own preset, copy this folder to
`packages/calendar/presets/<sitename>/`, update its `package.json` name
to `@calendar/preset-<sitename>`, and wire it from that site's
`hooks.server.ts` + root `+layout.ts`.
