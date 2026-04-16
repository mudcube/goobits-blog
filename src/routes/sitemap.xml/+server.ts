import type { RequestHandler } from './$types'
import { getConfiguredReleaseStage } from '$lib/app/release'
import { getPublicSitemapRoutes } from '$lib/app/routes/route-index.server'
import { buildSitemapXml, getBaseUrl, resolveSiteOrigin } from '@goobits/sitemap/server'

export const prerender = true

export const GET: RequestHandler = async () => {
	const activeStage = getConfiguredReleaseStage()
	const baseUrl = getBaseUrl(undefined)
	const origin = baseUrl
		? resolveSiteOrigin({ baseUrl, fallbackOrigin: 'https://miko.art' })
		: resolveSiteOrigin({ fallbackOrigin: 'https://miko.art' })
	const routes = await getPublicSitemapRoutes(activeStage)
	const xml = buildSitemapXml(origin, routes)

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=300, s-maxage=300'
		}
	})
}
