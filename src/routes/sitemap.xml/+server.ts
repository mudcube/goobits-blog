import type { RequestHandler } from './$types'
import { isLocalPreviewHost } from '$lib/app/is-local-preview-host'
import { getActiveReleaseStage } from '$lib/app/release'
import { getPublicSitemapRoutes } from '$lib/app/routes/route-index.server'
import { buildSitemapXml, getBaseUrl, getPlatformEnv, resolveSiteOrigin } from '@goobits/sitemap/server'

export const prerender = true

export const GET: RequestHandler = async ({ cookies, platform, url }) => {
	const baseUrl = getBaseUrl(getPlatformEnv(platform))
	const origin = resolveSiteOrigin(baseUrl ? { baseUrl, requestUrl: url, fallbackOrigin: 'https://miko.art' } : { requestUrl: url, fallbackOrigin: 'https://miko.art' })
	const isLocalPreviewHostRequest = isLocalPreviewHost(url.hostname)
	const activeStage = getActiveReleaseStage({
		cookies,
		enablePreview: isLocalPreviewHostRequest
	})
	const routes = await getPublicSitemapRoutes(activeStage)

	const xml = buildSitemapXml(origin, routes)

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=300, s-maxage=300'
		}
	})
}
