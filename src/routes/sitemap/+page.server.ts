import { dev } from '$app/environment'
import { getDevSurface } from '$lib/app/dev-surface'
import { getActiveReleaseStage } from '$lib/app/release'
import {
	filterRouteInventoryBySitemapAudiences,
	getPublicHumanSitemapInventory,
	getRouteInventory
} from '$lib/server/route-index'

export const prerender = true

export async function load({ cookies, url }: { cookies: import('@sveltejs/kit').Cookies; url: URL }) {
	const isLocalPreviewHost = dev && ['localhost', '127.0.0.1'].includes(url.hostname)
	const activeSurface = getDevSurface(cookies)
	const showDevDiagnostics = isLocalPreviewHost && activeSurface === 'dev'
	const showHiddenDiagnostics = showDevDiagnostics && url.searchParams.get('all') === '1'
	const activeStage = getActiveReleaseStage({
		cookies,
		enablePreview: isLocalPreviewHost
	})
	const inventory = showDevDiagnostics
		? filterRouteInventoryBySitemapAudiences(
			await getRouteInventory({
				includeDevOnlyCategories: true,
				activeStage
			}),
			showHiddenDiagnostics ? ['public', 'internal', 'hidden'] : ['public', 'internal']
		)
		: await getPublicHumanSitemapInventory(activeStage)

	return {
		routes: inventory.routes,
		grouped: inventory.grouped,
		stats: inventory.stats,
		showDevDiagnostics,
		showHiddenDiagnostics,
		activeSurface,
		activeStage
	}
}
