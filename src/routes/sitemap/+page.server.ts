import { dev } from '$app/environment'
import { getActiveReleaseStage } from '$lib/app/release'
import { getRouteInventory } from '$lib/server/route-index'

export const prerender = true

function isTruthy(value: string | undefined) {
	if (!value) return false
	return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

export async function load({ cookies, url }: { cookies: import('@sveltejs/kit').Cookies; url: URL }) {
	const showDevDiagnostics = dev && isTruthy(process.env['PUBLIC_SHOW_DEV_SITEMAP'])
	const isLocalPreviewHost = dev && ['localhost', '127.0.0.1'].includes(url.hostname)
	const activeStage = getActiveReleaseStage({
		cookies,
		enablePreview: isLocalPreviewHost
	})
	const inventory = await getRouteInventory({
		includeDevOnlyCategories: true,
		activeStage
	})

	return {
		routes: inventory.routes,
		grouped: inventory.grouped,
		stats: inventory.stats,
		showDevDiagnostics,
		activeStage
	}
}
