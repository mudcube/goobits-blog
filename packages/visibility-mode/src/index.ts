import type { Cookies } from '@sveltejs/kit'

/**
 * A "release stage" is the visibility lane a route, nav item, or piece of
 * content currently belongs to:
 *
 *   - 'live'    — released; visible to everyone.
 *   - 'preview' — pre-release; visible only when the active stage is preview.
 *
 * The active stage for a request comes from the env var (production default)
 * with an optional cookie override (dev default — see `getActiveReleaseStage`).
 */
export type ReleaseStage = 'live' | 'preview'

/**
 * A "target" is the audience perspective the dev/operator is viewing the site
 * as. It does not gate routes — it's a labeling/affordance toggle that
 * site-specific surfaces can read (e.g. a sitemap that defaults to internal
 * visibility on dev and public on production).
 */
export type Target = 'dev' | 'production'

export type ReleasedRoute = {
	path: string
	stage: ReleaseStage
}

/**
 * The minimum a nav item needs for stage-based visibility filtering. Sites
 * with richer nav metadata (icons, matchPrefix, external/nofollow flags, …)
 * should declare a site-local type that extends this — the package only owns
 * the gating mechanism, not the rendering shape.
 */
export type ReleasedNavItem = {
	href: string
	label: string
	stages: ReleaseStage[]
}

export const RELEASE_STAGE_COOKIE = 'site-release-preview'
export const TARGET_COOKIE = 'site-target'
export const DEFAULT_RELEASE_STAGE: ReleaseStage = 'live'
export const DEFAULT_TARGET: Target = 'dev'
export const RELEASE_STAGE_ENV_VAR = 'PUBLIC_RELEASE_STAGE'

function getRuntimeEnv(): Record<string, string | undefined> {
	if (typeof process !== 'undefined' && process.env) {
		return process.env as Record<string, string | undefined>
	}
	return {}
}

export function normalizeReleaseStage(value: string | null | undefined): ReleaseStage {
	return value === 'preview' ? 'preview' : 'live'
}

export function normalizeTarget(value: string | null | undefined): Target {
	return value === 'production' ? 'production' : 'dev'
}

export function getConfiguredReleaseStage(
	env: Record<string, string | undefined> = getRuntimeEnv(),
	envVarName: string = RELEASE_STAGE_ENV_VAR
): ReleaseStage {
	return normalizeReleaseStage(env[envVarName])
}

export function getPreviewReleaseStage(
	cookies: Cookies,
	cookieName: string = RELEASE_STAGE_COOKIE
): ReleaseStage | null {
	const value = cookies.get(cookieName)
	return value ? normalizeReleaseStage(value) : null
}

/**
 * Resolve the active release stage for a request.
 *
 * Order of precedence:
 *   1. Cookie override — only when `enablePreview` is true. Sites should pass
 *      `enablePreview: dev && isLocalPreviewHost(url.hostname)` so prod
 *      visitors can never flip themselves into preview via cookie.
 *   2. The configured env var (`PUBLIC_RELEASE_STAGE` by default).
 *   3. Falls back to 'live'.
 */
export function getActiveReleaseStage({
	cookies,
	enablePreview = false,
	env = getRuntimeEnv(),
	cookieName = RELEASE_STAGE_COOKIE,
	envVarName = RELEASE_STAGE_ENV_VAR
}: {
	cookies?: Cookies
	enablePreview?: boolean
	env?: Record<string, string | undefined>
	cookieName?: string
	envVarName?: string
} = {}): ReleaseStage {
	if (enablePreview && cookies) {
		const preview = getPreviewReleaseStage(cookies, cookieName)
		if (preview) return preview
	}
	return getConfiguredReleaseStage(env, envVarName)
}

export function getTarget(
	cookies?: Cookies,
	cookieName: string = TARGET_COOKIE
): Target {
	return normalizeTarget(cookies?.get(cookieName))
}

/**
 * True if an item tagged with `itemStage` should render given the request's
 * `activeStage`. `live` items always render; `preview` items only render when
 * the active stage is also `preview`.
 */
export function isVisibleInStage(itemStage: ReleaseStage, activeStage: ReleaseStage): boolean {
	return itemStage === 'live' || activeStage === 'preview'
}

export function isNavItemVisibleInStage(item: ReleasedNavItem, activeStage: ReleaseStage): boolean {
	return item.stages.includes(activeStage)
}

/**
 * Check a pathname against a registry of stage-gated routes. Routes not in the
 * registry are considered always-released. A pathname matches if it equals
 * the registered path or starts with `${path}/`.
 */
export function isRouteReleased(
	pathname: string,
	routes: readonly ReleasedRoute[],
	activeStage: ReleaseStage
): boolean {
	const route = routes.find((entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`))
	if (!route) return true
	return isVisibleInStage(route.stage, activeStage)
}

const PRIVATE_LAN_PATTERNS: readonly RegExp[] = [
	/^10(?:\.\d{1,3}){3}$/, // 10.0.0.0/8
	/^192\.168(?:\.\d{1,3}){2}$/, // 192.168.0.0/16
	/^172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}$/ // 172.16.0.0/12
]

/**
 * Returns true for hostnames that should be allowed to flip release stage via
 * cookie. Used as the `enablePreview` gate so prod visitors can't preview.
 *
 * Allow-list:
 *   - `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`
 *   - Anything ending in `.local` (mDNS) or `.localhost` (RFC 6761)
 *   - RFC 1918 private LAN ranges (10/8, 172.16/12, 192.168/16) so a dev box
 *     reached from a phone on the same Wi-Fi still gets the switcher
 */
export function isLocalPreviewHost(hostname: string): boolean {
	if (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '0.0.0.0' ||
		hostname === '::1'
	) return true
	if (hostname.endsWith('.local') || hostname.endsWith('.localhost')) return true
	return PRIVATE_LAN_PATTERNS.some((pattern) => pattern.test(hostname))
}
