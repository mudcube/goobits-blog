import {
	type ReleasedNavItem,
	type ReleasedRoute,
	isRouteReleased as isRouteReleasedAgainst
} from '@goobits/visibility-mode'
import type { ReleaseStage } from '@goobits/visibility-mode'

export {
	DEFAULT_RELEASE_STAGE,
	RELEASE_STAGE_COOKIE,
	getActiveReleaseStage,
	getConfiguredReleaseStage,
	getPreviewReleaseStage,
	isLocalPreviewHost,
	isNavItemVisibleInStage,
	isVisibleInStage,
	normalizeReleaseStage,
	type ReleasedNavItem,
	type ReleasedRoute,
	type ReleaseStage
} from '@goobits/visibility-mode'

/**
 * Site-local extension of {@link ReleasedNavItem} that carries the extra
 * fields the site's nav rendering needs (`matchPrefix`, `external`, ...).
 * The package's type only owns the gating mechanism (`stages`).
 */
export type SiteReleasedNavItem = ReleasedNavItem & {
	matchPrefix?: boolean
	external?: boolean
	nofollow?: boolean
}

export const releasedRoutes: ReleasedRoute[] = [
	{ path: '/art', stage: 'preview' },
	{ path: '/music', stage: 'preview' }
]

export const releasedHeaderNavItems: SiteReleasedNavItem[] = [
	{ href: '/', label: 'Apps', stages: ['live', 'preview'] },
	{ href: '/art', label: 'Art', matchPrefix: true, stages: ['preview'] },
	{ href: '/music', label: 'Music', matchPrefix: true, stages: ['preview'] },
	{ href: '/journal', label: 'Journal', matchPrefix: true, stages: ['live', 'preview'] },
	{ href: '/about', label: 'Profile', stages: ['live', 'preview'] }
]

/** Site-bound convenience: the package's `isRouteReleased` takes the registry. */
export function isRouteReleased(pathname: string, activeStage: ReleaseStage): boolean {
	return isRouteReleasedAgainst(pathname, releasedRoutes, activeStage)
}
