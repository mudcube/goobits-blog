import { dev } from '$app/environment'
import { getSitemapAudiencesForVisibility, type HumanSitemapVisibility } from '@goobits/sitemap/core'
import { getActiveReleaseStage, isLocalPreviewHost } from '$lib/app/release'
import { getTarget } from '$lib/app/target'
import {
	filterRouteInventoryBySitemapAudiences,
	getPublicHumanSitemapInventory,
	getRouteInventory
} from '$lib/app/routes/route-index.server'

export const prerender = false

function normalizeVisibility(value: string | null): HumanSitemapVisibility | null {
	return value === 'internal' || value === 'public' ? value : null
}

export async function load({ cookies, url }: { cookies: import('@sveltejs/kit').Cookies; url: URL }) {
	const canViewInternalRoutes = dev && isLocalPreviewHost(url.hostname)
	const activeStage = getActiveReleaseStage({
		cookies,
		enablePreview: canViewInternalRoutes
	})
	const activeTarget = getTarget(cookies)
	const requestedVisibility = normalizeVisibility(url.searchParams.get('visibility'))
	const activeVisibility: HumanSitemapVisibility = canViewInternalRoutes
		? requestedVisibility ?? (activeTarget === 'dev' ? 'internal' : 'public')
		: 'public'
	const inventory = activeVisibility === 'internal'
		? filterRouteInventoryBySitemapAudiences(
			await getRouteInventory({ includeDevOnlyCategories: true, activeStage }),
			getSitemapAudiencesForVisibility('internal')
		)
		: await getPublicHumanSitemapInventory(activeStage)

	return {
		routes: inventory.routes,
		grouped: inventory.grouped,
		stats: inventory.stats,
		canViewInternalRoutes,
		activeVisibility,
		activeStage
	}
}
