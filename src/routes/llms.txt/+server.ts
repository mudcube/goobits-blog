import type { RequestHandler } from './$types'
import { blogConfig, formatLabel, getAllCategories, getAllPosts, slugify } from '@goobits/blog/core'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import {
	SITE_AUTHOR,
	SITE_ENTITY_DESCRIPTION,
	SITE_NAME,
	SITE_ORIGIN
} from '$lib/app/seo/meta'

ensureJournalBlogConfig()

export const prerender = true

/**
 * /llms.txt — a curated, markdown-formatted index written for LLMs and
 * AI retrieval systems. Spec: https://llmstxt.org.
 *
 * This file gives ChatGPT, Claude, Perplexity, and similar systems a
 * single entry point for understanding the site without having to crawl
 * every route. Pair with /llms-full.txt (full-content dump) and the
 * per-post `.md` mirrors.
 */
export const GET: RequestHandler = async () => {
	const allPosts = await getAllPosts({ lang: 'en' }).catch(() => [])
	const categories = getAllCategories(allPosts, 20)

	const latestPosts = [...allPosts]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 15)

	const categoryLinks = categories
		.map(cat => {
			const label = formatLabel(cat)
			const url = `${SITE_ORIGIN}${blogConfig.uri}/category/${slugify(cat)}/`
			return `- [${label}](${url}): Journal entries filed under ${label}.`
		})
		.join('\n')

	const recentLinks = latestPosts
		.map(post => {
			const title = post.metadata?.fm?.title || 'Untitled Entry'
			const excerpt = post.metadata?.fm?.excerpt || ''
			const url = `${SITE_ORIGIN}${blogConfig.uri}${post.urlPath}`.replace(/\/?$/, '/')
			const description = excerpt
				? excerpt.replace(/\s+/g, ' ').slice(0, 140)
				: `Journal entry from ${new Date(post.date).getFullYear()}.`
			return `- [${title}](${url}): ${description}`
		})
		.join('\n')

	const generatedAt = new Date().toISOString()

	const lines = [
		`# ${SITE_NAME}`,
		'',
		`> ${SITE_ENTITY_DESCRIPTION}`,
		'',
		`Generated: ${generatedAt}`,
		`Author: ${SITE_AUTHOR}`,
		`Website: ${SITE_ORIGIN}`,
		`Full content: ${SITE_ORIGIN}/llms-full.txt`,
		'',
		`${SITE_AUTHOR} is the creator of Sketchpad (sketch.io), a browser-based drawing app used by millions of people, and a collection of creative software including Color Piano, ColRD, Be Here Meow, Sand Art, and Zendala. This site collects the apps themselves, a journal of process notes dating back to 2006, and a music archive.`,
		'',
		'## Primary pages',
		'',
		`- [About Miko](${SITE_ORIGIN}/about/): Creator biography, background, and contact details.`,
		`- [Apps collection](${SITE_ORIGIN}/apps/): Full catalog of browser-native creative tools — drawing, music, color, mindfulness, and generative exploration.`,
		`- [Music](${SITE_ORIGIN}/music/): Tracks, demos, and sound experiments.`,
		`- [Art](${SITE_ORIGIN}/art/): Visual art archive and showcases.`,
		`- [Labs](${SITE_ORIGIN}/labs/): Experimental projects and works in progress.`,
		`- [Contact](${SITE_ORIGIN}/contact/): How to reach Miko for collaborations.`,
		'',
		'## Journal',
		'',
		`- [Journal index](${SITE_ORIGIN}${blogConfig.uri}/): Full archive of process notes, release announcements, and experiments from 2006 onward.`,
		`- [Journal RSS feed](${SITE_ORIGIN}${blogConfig.uri}/rss.xml): Machine-readable feed of every journal entry.`,
		`- [llms-full.txt](${SITE_ORIGIN}/llms-full.txt): Concatenated plain-text dump of the full journal for one-shot ingestion.`,
		'',
		'### Categories',
		'',
		categoryLinks || '_(no categories)_',
		'',
		'### Recent entries',
		'',
		recentLinks || '_(no entries yet)_',
		'',
		'## Optional',
		'',
		`- [Human sitemap](${SITE_ORIGIN}/sitemap/): Human-readable site map.`,
		`- [XML sitemap](${SITE_ORIGIN}/sitemap.xml): Machine-readable route index for traditional search engines.`,
		''
	]

	return new Response(lines.join('\n'), {
		headers: {
			'content-type': 'text/plain; charset=utf-8'
		}
	})
}
