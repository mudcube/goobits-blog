# @goobits/visibility-mode

Two orthogonal toggles for SvelteKit sites that ship pre-release work in
production:

- **Release stage** (`live` | `preview`) — gates routes, nav items, and
  content. Routes/nav not on `live` 404 unless the active stage is
  `preview`.
- **Target** (`dev` | `production`) — a labeling/affordance switch the
  package exposes; the site decides what to do with it (e.g. a sitemap
  page that defaults to internal visibility on dev).

A floating bottom-right switcher writes cookies and reloads. The cookie is
**inert in production** by default — you opt in per request via
`enablePreview`, which the site should gate to local hostnames only.

## Install

```sh
pnpm add -D @goobits/visibility-mode
```

This is a workspace-private package; consume via `workspace:*`:

```json
"@goobits/visibility-mode": "workspace:*"
```

## Setup (per site)

### 1. Site-owned registries

The package owns the *mechanism*; the site owns the *data*. Define the
routes and nav items you want gated in your own module:

```ts
// src/lib/release.ts
import type { ReleasedRoute, ReleasedNavItem } from '@goobits/visibility-mode'

export const releasedRoutes: ReleasedRoute[] = [
	{ path: '/art', stage: 'preview' },
	{ path: '/music', stage: 'preview' }
]

export const releasedHeaderNavItems: ReleasedNavItem[] = [
	{ href: '/', label: 'Home', stages: ['live', 'preview'] },
	{ href: '/art', label: 'Art', matchPrefix: true, stages: ['preview'] },
	{ href: '/about', label: 'About', stages: ['live', 'preview'] }
]
```

### 2. Server hook — 404 unreleased routes

```ts
// src/hooks.server.ts
import { dev } from '$app/environment'
import { error } from '@sveltejs/kit'
import {
	getActiveReleaseStage,
	isLocalPreviewHost,
	isRouteReleased
} from '@goobits/visibility-mode'
import { releasedRoutes } from '$lib/release'

export const handle = async ({ event, resolve }) => {
	const enablePreview = dev && isLocalPreviewHost(event.url.hostname)
	const stage = getActiveReleaseStage({ cookies: event.cookies, enablePreview })
	if (!isRouteReleased(event.url.pathname, releasedRoutes, stage)) {
		throw error(404, 'Not found')
	}
	return resolve(event)
}
```

### 3. Root layout — expose stage/target + mount switcher

```ts
// src/routes/+layout.server.ts
import { dev } from '$app/environment'
import {
	getActiveReleaseStage,
	getTarget,
	isLocalPreviewHost
} from '@goobits/visibility-mode'

export function load({ cookies, url }) {
	const enablePreview = dev && isLocalPreviewHost(url.hostname)
	return {
		activeStage: getActiveReleaseStage({ cookies, enablePreview }),
		activeTarget: getTarget(cookies),
		showVersionSwitcher: enablePreview
	}
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { ReleaseTargetSwitcher } from '@goobits/visibility-mode/ui'
	import { isNavItemVisibleInStage } from '@goobits/visibility-mode'
	import { releasedHeaderNavItems } from '$lib/release'

	let { data, children } = $props()
	const navItems = $derived(
		releasedHeaderNavItems.filter((item) => isNavItemVisibleInStage(item, data.activeStage))
	)
</script>

<!-- ...your site... -->
{@render children()}

{#if data.showVersionSwitcher}
	<ReleaseTargetSwitcher activeStage={data.activeStage} activeTarget={data.activeTarget} />
{/if}
```

### 4. Production env

Set `PUBLIC_RELEASE_STAGE` to either `live` (default) or `preview`. Flip
to `preview` if you want to globally launch a preview-stage feature.

## Extra rows in the switcher

Sites often have an extra contextual toggle (e.g. a sitemap visibility
switch) that should ride along with the main switcher. Pass an `extraRows`
snippet:

```svelte
<ReleaseTargetSwitcher activeStage={data.activeStage} activeTarget={data.activeTarget}>
	{#snippet extraRows({ Row })}
		{@render Row(
			'Visibility',
			[{ value: 'public', label: 'Public' }, { value: 'internal', label: 'Internal' }],
			activeVisibility,
			handleVisibilityChange,
			'Sitemap visibility'
		)}
	{/snippet}
</ReleaseTargetSwitcher>
```

## Cookie names

| Purpose | Default | Constant |
|---|---|---|
| Release stage override | `site-release-preview` | `RELEASE_STAGE_COOKIE` |
| Target | `site-target` | `TARGET_COOKIE` |
| Stage env var | `PUBLIC_RELEASE_STAGE` | `RELEASE_STAGE_ENV_VAR` |

All can be overridden by passing `cookieName` / `envVarName` / `stageCookieName` /
`targetCookieName` to the relevant call. Useful when migrating a site that
previously used a different name — pair with a fallback read from the
legacy cookie.

## API

| Export | Purpose |
|---|---|
| `getActiveReleaseStage({ cookies, enablePreview, env, cookieName, envVarName })` | Resolve the request's active stage |
| `getConfiguredReleaseStage(env, envVarName)` | Read just the env var |
| `getPreviewReleaseStage(cookies, cookieName)` | Read just the cookie |
| `getTarget(cookies, cookieName)` | Read the target cookie |
| `isRouteReleased(pathname, routes, activeStage)` | Gate check for a request path |
| `isNavItemVisibleInStage(item, activeStage)` | Gate check for a nav item |
| `isVisibleInStage(itemStage, activeStage)` | Low-level stage check |
| `isLocalPreviewHost(hostname)` | Hostname allow-list (`localhost`, `127.0.0.1`, `*.local`) |
| `normalizeReleaseStage(value)` / `normalizeTarget(value)` | Coerce arbitrary input to a valid stage/target |
| `RELEASE_STAGE_COOKIE`, `TARGET_COOKIE`, `RELEASE_STAGE_ENV_VAR` | Name constants |
| `ReleaseStage`, `Target`, `ReleasedRoute`, `ReleasedNavItem` | Types |

UI exports (from `@goobits/visibility-mode/ui`):

| Export | Purpose |
|---|---|
| `ReleaseTargetSwitcher` | The floating switcher widget |
