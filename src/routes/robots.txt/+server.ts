import type { RequestHandler } from './$types'
import { getBaseUrl, getPlatformEnv, resolveSiteOrigin } from '$lib/server/seo'

export const prerender = true

export const GET: RequestHandler = ({ platform, url }) => {
	const baseUrl = getBaseUrl(getPlatformEnv(platform))
	const origin = resolveSiteOrigin(baseUrl ? { baseUrl, requestUrl: url } : { requestUrl: url })

	const robots = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /admin',
		'Disallow: /api',
		'Disallow: /health',
		`Sitemap: ${origin}/sitemap.xml`
	].join('\n')

	return new Response(robots, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=300, s-maxage=300'
		}
	})
}
