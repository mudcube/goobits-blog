# @calendar/theme

SCSS-only theming layer for the calendar UI. Two top-level entry stylesheets
(`admin.scss`, `member.scss`) compose partials from `src/admin/`,
`src/member/`, and `src/shared/`.

## What's public

```json
"exports": {
  "./admin.scss": "./admin.scss",
  "./member.scss": "./member.scss"
}
```

Consumers:

- `@calendar/ui` `AdminRouteShell.svelte` imports `@calendar/theme/admin.scss`
- The host app's `/schedule/+layout.svelte` imports `@calendar/theme/member.scss`
- The host app's `/playground/+layout.svelte` imports `@calendar/theme/admin.scss`

## How to extend

1. Add a partial under the matching folder (`src/admin/_*.scss`,
   `src/member/_*.scss`, or `src/shared/_*.scss`).
2. `@use` it from the corresponding entry stylesheet (`admin.scss` /
   `member.scss`).
3. Stick to BEM-style class naming and `em` breakpoints (30/40/48/64em).
