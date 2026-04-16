import { getConfiguredReleaseStage } from '$lib/app/release'
import {
	getPublicHumanSitemapInventory,
	getRouteInventory,
	filterRouteInventoryBySitemapAudiences,
	getSitemapAudiencesForVisibility
} from '$lib/app/routes/route-index.server'
import { getTarget } from '$lib/app/target'
import type { RequestEvent } from '@sveltejs/kit'

export const prerender = false

export async function load({ cookies }: RequestEvent) {
	const activeStage = getConfiguredReleaseStage()
	const target = getTarget(cookies)
	const isDevTarget = target === 'dev'

	if (isDevTarget) {
		const inventory = await getRouteInventory({
			includeDevOnlyCategories: true,
			activeStage
		})
		const audiences = getSitemapAudiencesForVisibility('internal')
		const filtered = filterRouteInventoryBySitemapAudiences(inventory, audiences)

		return {
			routes: filtered.routes,
			grouped: filtered.grouped,
			stats: filtered.stats,
			canViewInternalRoutes: true,
			activeVisibility: 'internal' as const,
			activeStage
		}
	}

	const inventory = await getPublicHumanSitemapInventory(activeStage)

	return {
		routes: inventory.routes,
		grouped: inventory.grouped,
		stats: inventory.stats,
		canViewInternalRoutes: false,
		activeVisibility: 'public' as const,
		activeStage
	}
}
