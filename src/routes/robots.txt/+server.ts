import type { RequestHandler } from './$types'
import { getBaseUrl, getPlatformEnv, resolveSiteOrigin } from '@goobits/sitemap/server'

export const prerender = true

// Disallow entries use trailing slashes so they scope to the directory and
// don't accidentally block sibling paths like `/admin-style` or `/apilog`.
const RULES = [
	'Allow: /',
	'Disallow: /admin/',
	'Disallow: /schedule/admin/',
	'Disallow: /api/',
	'Disallow: /dev/',
	'Disallow: /health'
]

// Generative Engine Optimization: explicitly name AI crawlers so the journal
// and apps surfaces are discoverable by ChatGPT, Claude, Perplexity, and
// friends. The Disallow list still applies to them.
const AI_BOTS = [
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

const block = (userAgent: string) => [`User-agent: ${userAgent}`, ...RULES].join('\n')

export const GET: RequestHandler = ({ platform, url }) => {
	const baseUrl = getBaseUrl(getPlatformEnv(platform))
	const origin = resolveSiteOrigin(baseUrl ? { baseUrl, requestUrl: url, fallbackOrigin: 'https://miko.art' } : { requestUrl: url, fallbackOrigin: 'https://miko.art' })

	// `LLM-Content` and `LLM-Full-Content` are not standard robots.txt
	// directives, so we keep them as comments — crawlers that recognize the
	// convention still find them, and Lighthouse stops flagging them as
	// unknown directives.
	const trailer = [
		`Sitemap: ${origin}/sitemap.xml`,
		`# LLM-Content: ${origin}/llms.txt`,
		`# LLM-Full-Content: ${origin}/llms-full.txt`
	].join('\n')

	const robots = [block('*'), ...AI_BOTS.map(block), trailer].join('\n\n')

	return new Response(robots, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=300, s-maxage=300'
		}
	})
}
