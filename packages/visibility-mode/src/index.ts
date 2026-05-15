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

export type ReleasedNavItem = {
	href: string
	label: string
	matchPrefix?: boolean
	external?: boolean
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

/** True if a 'live'-stage item should render under the given active stage. */
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

/**
 * Returns true for hostnames that should be allowed to flip release stage via
 * cookie. Used as the `enablePreview` gate so prod visitors can't preview.
 */
export function isLocalPreviewHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')
}
