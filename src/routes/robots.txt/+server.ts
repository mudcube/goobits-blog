import type { RequestHandler } from './$types'
import { getBaseUrl, getPlatformEnv, resolveSiteOrigin } from '@goobits/sitemap/server'

export const prerender = true

export const GET: RequestHandler = ({ platform, url }) => {
	const baseUrl = getBaseUrl(getPlatformEnv(platform))
	const origin = resolveSiteOrigin(baseUrl ? { baseUrl, requestUrl: url, fallbackOrigin: 'https://miko.art' } : { requestUrl: url, fallbackOrigin: 'https://miko.art' })

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

	// `LLM-Content` and `LLM-Full-Content` are not standard robots.txt
	// directives, so we keep them as comments — crawlers that recognize
	// the convention still find them, and Lighthouse stops flagging them
	// as unknown directives.
	const trailer = [
		`Sitemap: ${origin}/sitemap.xml`,
		`# LLM-Content: ${origin}/llms.txt`,
		`# LLM-Full-Content: ${origin}/llms-full.txt`
	]

	const robots = [ ...blocks, trailer.join('\n') ].join('\n\n')

	return new Response(robots, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=300, s-maxage=300'
		}
	})
}
