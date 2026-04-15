import type { RequestHandler } from './$types'
import { blogConfig, getAllPosts } from '@goobits/blog/core'
import { formatLabel } from '@goobits/blog-theme-miko'
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
 * /llms-full.txt — the expanded variant of /llms.txt. Contains the full
 * plain-text content of every journal entry concatenated into a single
 * file so AI retrieval systems can ingest the entire archive in one
 * fetch. Pair with /llms.txt (curated index).
 */

function htmlToPlainText(html: string): string {
	return String(html || '')
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
		.replace(/<\/(p|div|h[1-6]|li|blockquote|pre|tr|section|article)>/gi, '\n\n')
		.replace(/<br\s*\/?>(?!$)/gi, '\n')
		.replace(/<li\b[^>]*>/gi, '- ')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, '\'')
		.replace(/\n{3,}/g, '\n\n')
		.replace(/[ \t]+/g, ' ')
		.replace(/^[ \t]+|[ \t]+$/gm, '')
		.trim()
}

export const GET: RequestHandler = async () => {
	const allPosts = await getAllPosts({ lang: 'en', includeContent: true }).catch(() => [])

	const sortedPosts = [...allPosts].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	)

	const header = [
		`# ${SITE_NAME} — Full Content Archive`,
		'',
		`> ${SITE_ENTITY_DESCRIPTION}`,
		'',
		`Generated: ${new Date().toISOString()}`,
		`Author: ${SITE_AUTHOR}`,
		`Website: ${SITE_ORIGIN}`,
		`Curated index: ${SITE_ORIGIN}/llms.txt`,
		`Journal index: ${SITE_ORIGIN}${blogConfig.uri}/`,
		'',
		'This file contains the full plain-text content of every journal entry',
		'in reverse chronological order. Sections are separated by horizontal',
		'rules. Each entry begins with its title, date, and taxonomy metadata,',
		'followed by the post body with HTML stripped.',
		'',
		'---',
		''
	].join('\n')

	const entries: string[] = []
	for (const post of sortedPosts) {
		const fm = post.metadata?.fm ?? {}
		const title = fm.title || 'Untitled Entry'
		const date = post.date
			? new Date(post.date).toISOString().slice(0, 10)
			: 'unknown'
		const url = `${SITE_ORIGIN}${blogConfig.uri}${post.urlPath}`.replace(/\/?$/, '/')
		const categories = (fm.categories ?? (fm.category ? [fm.category] : []))
			.map((c: string) => formatLabel(c))
			.join(', ')
		const tags = (fm.tags ?? []).map((t: string) => formatLabel(t)).join(', ')
		const body = htmlToPlainText(String(post.content || ''))

		const entry = [
			`## ${title}`,
			'',
			`URL: ${url}`,
			`Date: ${date}`,
			categories ? `Categories: ${categories}` : '',
			tags ? `Tags: ${tags}` : '',
			'',
			body || '_(no content)_',
			'',
			'---',
			''
		]
			.filter(line => line !== null && line !== undefined)
			.join('\n')
		entries.push(entry)
	}

	const output = header + entries.join('\n')

	return new Response(output, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600, s-maxage=3600'
		}
	})
}
