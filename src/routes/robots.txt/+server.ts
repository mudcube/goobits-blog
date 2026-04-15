import type { RequestHandler } from './$types'
import { getBaseUrl, getPlatformEnv, resolveSiteOrigin } from '$lib/server/seo'

export const prerender = true

export const GET: RequestHandler = ({ platform, url }) => {
	const baseUrl = getBaseUrl(getPlatformEnv(platform))
	const origin = resolveSiteOrigin(baseUrl ? { baseUrl, requestUrl: url } : { requestUrl: url })

	// Generative Engine Optimization: explicitly allow AI crawlers so the
	// journal and apps surfaces are discoverable by ChatGPT, Claude,
	// Perplexity, and friends. The Disallow list still applies to them.
	const aiBots = [
		'GPTBot',
		'ChatGPT-User',
		'OAI-SearchBot',
		'ClaudeBot',
		'Claude-Web',
		'PerplexityBot',
		'Perplexity-User',
		'Google-Extended',
		'GoogleOther',
		'CCBot',
		'Applebot-Extended',
		'Amazonbot',
		'Bytespider',
		'Meta-ExternalAgent',
		'FacebookBot',
		'YouBot',
		'cohere-ai',
		'Diffbot'
	]

	const blocks: string[] = []

	const defaultBlock = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /admin',
		'Disallow: /schedule/admin',
		'Disallow: /api',
		'Disallow: /dev',
		'Disallow: /health'
	]
	blocks.push(defaultBlock.join('\n'))

	for (const bot of aiBots) {
		const block = [
			`User-agent: ${bot}`,
			'Allow: /',
			'Disallow: /admin',
			'Disallow: /schedule/admin',
			'Disallow: /api',
			'Disallow: /dev',
			'Disallow: /health'
		]
		blocks.push(block.join('\n'))
	}

	const trailer = [
		`Sitemap: ${origin}/sitemap.xml`,
		`LLM-Content: ${origin}/llms.txt`,
		`LLM-Full-Content: ${origin}/llms-full.txt`
	]

	const robots = [ ...blocks, trailer.join('\n') ].join('\n\n')

	return new Response(robots, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=300, s-maxage=300'
		}
	})
}
