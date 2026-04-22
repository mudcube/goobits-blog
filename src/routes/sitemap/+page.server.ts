import { getConfiguredReleaseStage } from '$lib/app/release'
import { getPublicHumanSitemapInventory } from '$lib/app/routes/route-index.server'

export const prerender = true

export async function load() {
	const activeStage = getConfiguredReleaseStage()
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
