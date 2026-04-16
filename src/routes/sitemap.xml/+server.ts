import type { RequestHandler } from './$types'
import { isLocalPreviewHost } from '$lib/app/is-local-preview-host'
import { getActiveReleaseStage } from '$lib/app/release'
import { getPublicSitemapRoutes } from '$lib/server/route-index'
import { escapeXml, formatSitemapLastMod, getBaseUrl, getPlatformEnv, resolveSiteOrigin, toAbsoluteUrl } from '$lib/server/seo'

export const prerender = true

export const GET: RequestHandler = async ({ cookies, platform, url }) => {
	const baseUrl = getBaseUrl(getPlatformEnv(platform))
	const origin = resolveSiteOrigin(baseUrl ? { baseUrl, requestUrl: url } : { requestUrl: url })
	const isLocalPreviewHostRequest = isLocalPreviewHost(url.hostname)
	const activeStage = getActiveReleaseStage({
		cookies,
		enablePreview: isLocalPreviewHostRequest
	})
	const routes = await getPublicSitemapRoutes(activeStage)

	const urlEntries = routes.map(route => {
		const loc = escapeXml(toAbsoluteUrl(origin, route.path))
		const lastMod = escapeXml(formatSitemapLastMod(route.lastModified))
		return `<url><loc>${loc}</loc><lastmod>${lastMod}</lastmod></url>`
	}).join('')

	const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}</urlset>`

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=300, s-maxage=300'
		}
	})
}
