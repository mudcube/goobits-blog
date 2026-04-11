import type { Cookies } from '@sveltejs/kit'

export type ReleaseStage = 'live' | 'preview'

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
export const DEFAULT_RELEASE_STAGE: ReleaseStage = 'live'

function getRuntimeEnv() {
	if (typeof process !== 'undefined' && process.env) {
		return process.env as Record<string, string | undefined>
	}

	return {}
}

export const releasedRoutes: ReleasedRoute[] = [
	{ path: '/art', stage: 'preview' },
	{ path: '/music', stage: 'live' }
]

export const releasedHeaderNavItems: ReleasedNavItem[] = [
	{ href: '/', label: 'Apps', stages: ['live'] },
	{ href: '/art', label: 'Art', matchPrefix: true, stages: ['preview'] },
	{ href: '/music', label: 'Music', matchPrefix: true, stages: ['live', 'preview'] },
	{ href: '/about', label: 'Me', stages: ['live', 'preview'] }
]

export function normalizeReleaseStage(value: string | null | undefined): ReleaseStage {
	return value === 'preview' ? 'preview' : 'live'
}

export function getConfiguredReleaseStage(
	env: Record<string, string | undefined> = getRuntimeEnv()
): ReleaseStage {
	return normalizeReleaseStage(env['PUBLIC_RELEASE_STAGE'])
}

export function getPreviewReleaseStage(cookies: Cookies): ReleaseStage | null {
	const value = cookies.get(RELEASE_STAGE_COOKIE)
	return value ? normalizeReleaseStage(value) : null
}

export function getActiveReleaseStage({
	cookies,
	enablePreview = false,
	env = getRuntimeEnv()
}: {
	cookies?: Cookies
	enablePreview?: boolean
	env?: Record<string, string | undefined>
} = {}): ReleaseStage {
	if (enablePreview && cookies) {
		const preview = getPreviewReleaseStage(cookies)
		if (preview) return preview
	}

	return getConfiguredReleaseStage(env)
}

export function isVisibleInStage(itemStage: ReleaseStage, activeStage: ReleaseStage) {
	return itemStage === 'live' || activeStage === 'preview'
}

export function isNavItemVisibleInStage(item: ReleasedNavItem, activeStage: ReleaseStage) {
	return item.stages.includes(activeStage)
}

export function isRouteReleased(pathname: string, activeStage: ReleaseStage) {
	const route = releasedRoutes.find((entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`))
	if (!route) return true
	return isVisibleInStage(route.stage, activeStage)
}
