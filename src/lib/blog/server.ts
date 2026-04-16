import { readFileSync } from 'fs'
import { join } from 'path'
import { compile } from 'mdsvex'
import { getAllPosts, type ProcessedPost } from '@goobits/blog/utils'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import { remarkTableOfContents } from '$lib/blog/remark-table-of-contents'
import type { JournalMetadata, JournalPost } from '$lib/blog/viewmodel'

type Frontmatter = Record<string, unknown> & {
	date?: string | Date
	fm?: {
		title?: string
		categories?: string[]
		tags?: string[]
		coverImage?: string
		[key: string]: unknown
	}
}

type MdsvexCompileResult = {
	code?: string
	data?: Frontmatter
}

function normalizePost(post: ProcessedPost): JournalPost {
	const segments = post.urlPath.split('/').filter(Boolean)
	const year = segments[0] || ''
	const month = segments[1] || ''
	const slug = segments[2] || ''

	return {
		...post,
		date: new Date(post.date),
		metadata: post.metadata as JournalMetadata,
		year,
		month,
		slug,
		urlPath: `journal/${year}/${month}/${slug}`
	}
}

function resolvePostDate(value: unknown, fallback: () => Date): Date {
	if (value instanceof Date) return value
	if (typeof value === 'string') {
		const parsed = new Date(value)
		if (!Number.isNaN(parsed.getTime())) return parsed
	}
	return fallback()
}

function stripScriptTags(html: string) {
	return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

function upgradeInsecureMediaUrls(html: string) {
	return html.replace(/(<(?:img|source)\b[^>]*\b(?:src|srcset)=["'])http:\/\//gi, '$1https://')
}

const OWNED_EXTERNAL_DOMAINS = [
	'miko.art',
	'sketch.io',
	'sketchpad.com',
	'colorpiano.com',
	'colorsphere.app',
	'sandart.app',
	'zendala.app',
	'beheremeow.app'
]

function isOwnedExternalUrl(href: string) {
	try {
		const url = new URL(href)
		return OWNED_EXTERNAL_DOMAINS.some(
			(domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
		)
	} catch {
		return false
	}
}

function mergeRelAttribute(existingRel: string | null, requiredTokens: string[]) {
	const relTokens = new Set(
		(existingRel ?? '')
			.split(/\s+/)
			.map((token) => token.trim())
			.filter(Boolean)
	)

	for (const token of requiredTokens) {
		relTokens.add(token)
	}

	return [ ...relTokens ].join(' ')
}

function normalizeExternalAnchorRel(html: string) {
	return html.replace(/<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi, (anchorTag, quote, href: string) => {
		if (!/^https?:\/\//i.test(href) || isOwnedExternalUrl(href)) {
			return anchorTag
		}

		const relMatch = anchorTag.match(/\brel=(['"])(.*?)\1/i)
		const mergedRel = mergeRelAttribute(relMatch?.[2] ?? null, [ 'nofollow' ])

		if (relMatch) {
			return anchorTag.replace(/\brel=(['"])(.*?)\1/i, `rel=${quote}${mergedRel}${quote}`)
		}

		return anchorTag.replace(/>$/, ` rel=${quote}${mergedRel}${quote}>`)
	})
}

function getJournalPostFilePath(year: string, month: string, slug: string) {
	return join(process.cwd(), 'static/journal', year, month, slug, 'index.md')
}

export async function getJournalPosts() {
	try {
		ensureJournalBlogConfig()
		const posts = await getAllPosts({ includeContent: false })
		return posts.map(normalizePost)
	} catch (error) {
		console.error('[journal-blog] getJournalPosts failed', error)
		throw error
	}
}

export async function getPost({
	year,
	month,
	slug
}: {
	year: string
	month: string
	slug: string
}): Promise<JournalPost | null> {
	try {
		ensureJournalBlogConfig()

		const allPosts = await getJournalPosts()
		const matchedPost = allPosts.find((post) => post.year === year && post.month === month && post.slug === slug)
		if (!matchedPost) return null

		const mdContent = readFileSync(getJournalPostFilePath(year, month, slug), 'utf-8')
		const compiled = (await compile(mdContent, {
			remarkPlugins: [remarkTableOfContents]
		})) as MdsvexCompileResult
		const renderedContent = (compiled?.code ?? '').replace(/{@html `(.*?)`}/gs, '$1')
		const strippedContent = normalizeExternalAnchorRel(
			stripScriptTags(upgradeInsecureMediaUrls(renderedContent))
		)
		const fallbackDate = () => new Date(`${year}-${month}-01`)
		const postDate = resolvePostDate(compiled?.data?.date, fallbackDate)

		return {
			...matchedPost,
			content: strippedContent,
			metadata: {
				...(matchedPost.metadata ?? {}),
				fm: {
					...matchedPost.metadata.fm,
					...((compiled?.data ?? {}) as Record<string, unknown>)
				}
			} as JournalMetadata,
			date: postDate
		}
	} catch (error) {
		console.error('[journal-blog] getPost failed', { year, month, slug }, error)
		throw error
	}
}
