import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { blogConfig, loadPost } from '@goobits/blog/core'
import { formatLabel } from '@goobits/blog-theme-miko'
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

function htmlToMarkdown(html: string): string {
	return String(html || '')
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n')
		.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
		.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
		.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n')
		.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, inner) =>
			'\n\n' + String(inner).replace(/<[^>]+>/g, '').split('\n').map(l => `> ${l.trim()}`).join('\n') + '\n\n'
		)
		.replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
		.replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
		.replace(/<em\b[^>]*>([\s\S]*?)<\/em>/gi, '_$1_')
		.replace(/<i\b[^>]*>([\s\S]*?)<\/i>/gi, '_$1_')
		.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
		.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, '\n\n```\n$1\n```\n\n')
		.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
		.replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
		.replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '![$1]($2)')
		.replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '![]($1)')
		.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
		.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n')
		.replace(/<br\s*\/?>(?!$)/gi, '\n')
		.replace(/<\/(p|div|section|article)>/gi, '\n\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, '\'')
		.replace(/\n{3,}/g, '\n\n')
		.replace(/^[ \t]+|[ \t]+$/gm, '')
		.trim()
}

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
	const url = `${SITE_ORIGIN}${blogConfig.uri}${post.urlPath}`.replace(/\/?$/, '/')
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

	const body = htmlToMarkdown(String(post.content || ''))

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
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600, s-maxage=3600'
		}
	})
}

export async function entries() {
	const { getAllPosts } = await import('@goobits/blog/core')
	const posts = await getAllPosts({ lang: 'en' }).catch(() => [])
	return posts
		.map(post => {
			// urlPath looks like "/2018/01/sketchpad-5-0" — split into parts
			const parts = String(post.urlPath || '').split('/').filter(Boolean)
			if (parts.length !== 3) { return null }
			const [year, month, slug] = parts as [string, string, string]
			return { year, month, slug }
		})
		.filter((v): v is { year: string; month: string; slug: string } => v !== null)
}
