import type { BlogConfig } from '../config/blogConfig.js'
import type { BlogPost } from './blogPost.js'
import { getBlogPostUrl } from './blogUrls.js'

export interface BlogRssOptions {
	siteUrl?: string
	title?: string
	description?: string
	feedPath?: string
	language?: string
	limit?: number
	buildDate?: Date
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

export function generateBlogRssFeed(
	posts: BlogPost[],
	config: BlogConfig,
	options: BlogRssOptions = {}
): string {
	const siteUrl = (options.siteUrl ?? config.canonicalOrigin)?.replace(/\/+$/, '')
	if (!siteUrl) {
		throw new Error('A siteUrl or canonicalOrigin is required to generate RSS')
	}

	const feedPath = options.feedPath ?? config.feedPath
	const items = posts
		.filter((post) => post.status === 'published')
		.slice(0, options.limit ?? config.feedLimit)
		.map((post) => {
			const url = `${siteUrl}${getBlogPostUrl(post, config)}`
			const categories = [...new Set([...post.categories, ...post.tags])]
				.map((category) => `    <category>${escapeXml(category)}</category>`)
				.join('\n')
			const author = post.author?.name ?? config.messages.defaultAuthor
			return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description>${escapeXml(post.excerpt || config.messages.missingExcerpt)}</description>
    <author>${escapeXml(author)}</author>${categories ? `\n${categories}` : ''}
  </item>`
		})
		.join('\n')

	return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(options.title ?? config.name)}</title>
  <link>${siteUrl}${config.basePath || '/'}</link>
  <description>${escapeXml(options.description ?? config.description)}</description>
  <language>${escapeXml(options.language ?? config.defaultLanguage)}</language>
  <lastBuildDate>${(options.buildDate ?? new Date()).toUTCString()}</lastBuildDate>
  <atom:link href="${siteUrl}${feedPath}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`
}
