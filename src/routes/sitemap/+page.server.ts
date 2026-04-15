import { dev } from '$app/environment'
import { getActiveReleaseStage } from '$lib/app/release'
import { getTarget } from '$lib/app/target'
import {
	filterRouteInventoryBySitemapAudiences,
	getSitemapAudiencesForVisibility,
	getPublicHumanSitemapInventory,
	getRouteInventory
} from '$lib/server/route-index'
import type { HumanSitemapVisibility } from '$lib/server/route-index'

export const prerender = true

function normalizeVisibility(value: string | null | undefined): HumanSitemapVisibility {
	return value === 'internal' ? 'internal' : 'public'
}

export async function load({ cookies, url }: { cookies: import('@sveltejs/kit').Cookies; url: URL }) {
	const isLocalPreviewHost = dev && ['localhost', '127.0.0.1'].includes(url.hostname)
	const activeTarget = getTarget(cookies)
	const canViewInternalRoutes = isLocalPreviewHost
	const activeVisibility = canViewInternalRoutes
		? normalizeVisibility(url.searchParams.get('visibility'))
		: 'public'
	const activeStage = getActiveReleaseStage({
		cookies,
		enablePreview: isLocalPreviewHost
	})
	const inventory = canViewInternalRoutes
		? await getRouteInventory({
			includeDevOnlyCategories: true,
			activeStage
		})
		: await getPublicHumanSitemapInventory(activeStage)

	const visibilityAudiences = getSitemapAudiencesForVisibility(activeVisibility)
	const filteredInventory = canViewInternalRoutes
		? filterRouteInventoryBySitemapAudiences(inventory, visibilityAudiences)
		: inventory

	return {
		routes: filteredInventory.routes,
		grouped: filteredInventory.grouped,
		stats: filteredInventory.stats,
		canViewInternalRoutes,
		activeVisibility,
		activeTarget,
		activeStage
	}
}
