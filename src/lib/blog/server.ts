import { readFileSync, accessSync } from 'fs'
import { join, dirname } from 'path'
import { compile } from 'mdsvex'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { getAllPosts, type ProcessedPost } from '@goobits/blog/utils'
import { getBlogConfig } from '@goobits/blog/config'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import { remarkTableOfContents } from '@goobits/blog/utils/remark-table-of-contents.js'
// @ts-expect-error -- JS rehype plugin, no type declarations
import { rehypeWebpPicture } from '@goobits/blog/utils/rehype-webp-picture.js'
import type { JournalMetadata, JournalPost } from '$lib/blog/viewmodel'

const sanitizeSchema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		'*': [...(defaultSchema.attributes?.['*'] ?? []), 'id'],
		img: [...(defaultSchema.attributes?.['img'] ?? []), 'loading', 'decoding', 'width', 'height']
	}
}

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

/**
 * Wrap <img> tags in <picture> elements with WebP sources when a .webp
 * sibling file exists on disk. Preserves the original <img> as fallback
 * for older browsers.
 */
function upgradeImagesToWebpPicture(html: string, postDir: string) {
	return html.replace(/<img\b([^>]*)>/gi, (imgTag, attrs: string) => {
		const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/)
		if (!srcMatch?.[1]) return imgTag

		const src = srcMatch[1]

		// Skip images that are already WebP, SVGs, data URIs, or external URLs
		if (/\.webp$/i.test(src) || /\.svg$/i.test(src) || /^data:/i.test(src) || /^https?:\/\//i.test(src)) {
			return imgTag
		}

		// Build the WebP sibling path
		const ext = src.substring(src.lastIndexOf('.'))
		const webpSrc = src.substring(0, src.length - ext.length) + '.webp'

		// Check if the WebP file exists on disk
		const webpDiskPath = src.startsWith('/') ? join(process.cwd(), 'static', webpSrc) : join(postDir, webpSrc)

		try {
			accessSync(webpDiskPath)
		} catch {
			return imgTag
		}

		// Resolve public path for the WebP source
		const webpPublicPath = src.startsWith('/') ? webpSrc : webpSrc

		// Add loading="lazy" and decoding="async" if not already present
		let enhancedAttrs = attrs
		if (!/\bloading=/i.test(enhancedAttrs)) {
			enhancedAttrs += ' loading="lazy"'
		}
		if (!/\bdecoding=/i.test(enhancedAttrs)) {
			enhancedAttrs += ' decoding="async"'
		}

		return `<picture><source type="image/webp" srcset="${webpPublicPath}"><img${enhancedAttrs}></picture>`
	})
}

function upgradeInsecureMediaUrls(html: string) {
	return html.replace(/(<(?:img|source)\b[^>]*\b(?:src|srcset)=["'])http:\/\//gi, '$1https://')
}

function isOwnedExternalUrl(href: string) {
	try {
		const url = new URL(href)
		const ownedDomains = getBlogConfig().ownedDomains ?? []
		return ownedDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))
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

	return [...relTokens].join(' ')
}

const DANGEROUS_HREF_PROTOCOL = /^\s*(javascript|data|vbscript|file):/i

function isDangerousHref(href: string) {
	const decoded = href
		.replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
		.replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
	return DANGEROUS_HREF_PROTOCOL.test(decoded)
}

function neutralizeDangerousAnchors(html: string) {
	return html.replace(/<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi, (anchorTag, quote, href: string) => {
		if (!isDangerousHref(href)) return anchorTag
		console.warn('[journal-blog] Stripped dangerous anchor href:', href)
		return anchorTag.replace(/\bhref=(['"])(.*?)\1/i, `href=${quote}#${quote}`)
	})
}

function normalizeExternalAnchorRel(html: string) {
	return html.replace(/<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi, (anchorTag, quote, href: string) => {
		if (!/^https?:\/\//i.test(href) || isOwnedExternalUrl(href)) {
			return anchorTag
		}

		const relMatch = anchorTag.match(/\brel=(['"])(.*?)\1/i)
		const mergedRel = mergeRelAttribute(relMatch?.[2] ?? null, ['nofollow', 'noopener', 'noreferrer'])

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
			remarkPlugins: [remarkTableOfContents],
			rehypePlugins: [[rehypeSanitize, sanitizeSchema], rehypeWebpPicture]
		})) as MdsvexCompileResult
		const renderedContent = (compiled?.code ?? '').replace(/{@html `(.*?)`}/gs, '$1')
		const postFilePath = getJournalPostFilePath(year, month, slug)
		const postDir = dirname(postFilePath)
		const strippedContent = upgradeImagesToWebpPicture(
			normalizeExternalAnchorRel(
				neutralizeDangerousAnchors(stripScriptTags(upgradeInsecureMediaUrls(renderedContent)))
			),
			postDir
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
