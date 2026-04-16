import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { formatLabel, getAllPosts, getPostUrl, loadPost } from '@goobits/blog/core'
import type { ProcessedPost } from '@goobits/blog/utils'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import { SITE_AUTHOR, SITE_ORIGIN } from '$lib/app/seo/meta'

ensureJournalBlogConfig()

export const prerender = true

/**
 * Markdown mirror for a journal entry.
 *
 * The llms.txt spec recommends that every content page expose a clean
 * markdown twin at the same URL with `.md` appended. AI retrieval
 * systems fetch the `.md` variant for cleaner ingestion — no CSS, no
 * navigation chrome, just the post.
 *
 * Route: /journal/:year/:month/:slug.md
 */

export const GET: RequestHandler = async ({ params }) => {
	const { year, month, slug } = params

	if (!year || !month || !slug) {
		throw error(404, 'Not found')
	}

	let result
	try {
		result = await loadPost(year, month, slug, 'en')
	} catch {
		throw error(404, 'Not found')
	}

	const post = result.post
	if (!post) {
		throw error(404, 'Not found')
	}

	const fm = post.metadata?.fm ?? {}
	const title = fm.title || 'Untitled Entry'
	const date = post.date
		? new Date(post.date).toISOString().slice(0, 10)
		: ''
	const url = `${SITE_ORIGIN}${getPostUrl(post)}`.replace(/\/?$/, '/')
	const categories = (fm.categories ?? (fm.category ? [fm.category] : [])) as string[]
	const tags = (fm.tags ?? []) as string[]

	const frontmatter = [
		'---',
		`title: "${title.replace(/"/g, '\\"')}"`,
		date ? `date: "${date}"` : '',
		`url: "${url}"`,
		`author: "${SITE_AUTHOR}"`,
		categories.length > 0
			? `categories: [${categories.map(c => `"${formatLabel(c)}"`).join(', ')}]`
			: '',
		tags.length > 0
			? `tags: [${tags.map(t => `"${formatLabel(t)}"`).join(', ')}]`
			: '',
		fm.excerpt ? `excerpt: "${fm.excerpt.replace(/"/g, '\\"')}"` : '',
		'---',
		''
	].filter(Boolean).join('\n')

	// post.content is the raw source markdown read from disk by blog core
	// (via getMarkdownContent). We serve it straight — no HTML round-trip.
	const body = String(post.content || '').trim()

	const markdown = [
		frontmatter,
		`# ${title}`,
		'',
		body || '_(no content)_',
		'',
		'---',
		'',
		`Source: ${url}`,
		''
	].join('\n')

	return new Response(markdown, {
		headers: {
			'content-type': 'text/plain; charset=utf-8'
		}
	})
}

export async function entries() {
	const posts: ProcessedPost[] = await getAllPosts({ lang: 'en' }).catch(() => [])
	return posts
		.map((post: ProcessedPost) => {
			const parts = String(getPostUrl(post) || '')
				.replace(/^\/journal\//, '')
				.replace(/^\/blog\//, '')
				.split('/')
				.filter(Boolean)
			if (parts.length !== 3) { return null }
			const [year, month, slug] = parts as [string, string, string]
			return { year, month, slug }
		})
		.filter((v: { year: string; month: string; slug: string } | null): v is { year: string; month: string; slug: string } => v !== null)
}
