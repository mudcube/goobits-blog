import type { RequestHandler } from './$types'
import { blogConfig, formatLabel, getAllPosts } from '@goobits/blog/core'
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
		// post.content is raw source markdown (not HTML) — serve as-is. LLMs
		// parse markdown cleanly and the structure preserved here (headings,
		// lists, code fences) actually helps retrieval.
		const body = String(post.content || '').trim()

		const entry = [
			`## ${title}`,
			'',
			`URL: ${url}`,
			`Date: ${date}`,
			...(categories ? [`Categories: ${categories}`] : []),
			...(tags ? [`Tags: ${tags}`] : []),
			'',
			body || '_(no content)_',
			'',
			'---',
			''
		].join('\n')
		entries.push(entry)
	}

	const output = header + entries.join('\n')

	return new Response(output, {
		headers: {
			'content-type': 'text/plain; charset=utf-8'
		}
	})
}
