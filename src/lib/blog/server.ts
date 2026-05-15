import { readFileSync, accessSync } from 'fs'
import { join, dirname, normalize, sep } from 'path'
import { compile } from 'mdsvex'
import { getAllPosts, type ProcessedPost } from '@goobits/blog/utils'
import { getBlogConfig } from '@goobits/blog/config'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import { remarkTableOfContents } from '@goobits/blog/utils/remark-table-of-contents'
// @ts-expect-error -- JS rehype plugin, no type declarations
import { rehypeWebpPicture } from '@goobits/blog/utils/rehype-webp-picture'
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

function escapeHtmlAttr(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

/**
 * True if `candidatePath` resolves to a location at or under `rootPath`.
 * Both arguments must be absolute. Used to defend against path-traversal in
 * author-controlled image src values.
 */
function isPathInside(candidatePath: string, rootPath: string): boolean {
	const normalizedRoot = normalize(rootPath)
	const normalizedCandidate = normalize(candidatePath)
	const rootWithSep = normalizedRoot.endsWith(sep) ? normalizedRoot : normalizedRoot + sep
	return normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(rootWithSep)
}

/**
 * Wrap <img> tags in <picture> elements with WebP sources when a .webp
 * sibling file exists on disk. Preserves the original <img> as fallback
 * for older browsers.
 */
function upgradeImagesToWebpPicture(html: string, postDir: string) {
	const staticRoot = join(process.cwd(), 'static')
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

		// Resolve where the WebP would live on disk and refuse anything that
		// escapes its expected root (`static/` for absolute srcs, the post dir
		// for relative srcs). Without this, an author-controlled
		// `<img src="/../../etc/passwd.png">` could probe arbitrary filesystem
		// locations via `accessSync`. See journal audit J5.
		const isAbsolute = src.startsWith('/')
		const webpDiskPath = isAbsolute ? join(staticRoot, webpSrc) : join(postDir, webpSrc)
		const allowedRoot = isAbsolute ? staticRoot : postDir
		if (!isPathInside(webpDiskPath, allowedRoot)) {
			return imgTag
		}

		try {
			accessSync(webpDiskPath)
		} catch {
			return imgTag
		}

		// Resolve public path for the WebP source
		const webpPublicPath = isAbsolute ? webpSrc : webpSrc

		// Add loading="lazy" and decoding="async" if not already present
		let enhancedAttrs = attrs
		if (!/\bloading=/i.test(enhancedAttrs)) {
			enhancedAttrs += ' loading="lazy"'
		}
		if (!/\bdecoding=/i.test(enhancedAttrs)) {
			enhancedAttrs += ' decoding="async"'
		}

		// Escape the srcset value — it's derived from author-controlled `src`,
		// and even though we just refused dangerous paths, an embedded `"` or
		// `<` could break out of the attribute quoting. See journal audit J6.
		return `<picture><source type="image/webp" srcset="${escapeHtmlAttr(webpPublicPath)}"><img${enhancedAttrs}></picture>`
	})
}

function upgradeInsecureMediaUrls(html: string) {
	return html.replace(/(<(?:img|source)\b[^>]*\b(?:src|srcset)=["'])http:\/\//gi, '$1https://')
}

function isOwnedExternalUrl(href: string) {
	try {
		// Resolve relative-to-the-base for protocol-relative URLs (`//example.com`).
		// `new URL('//example.com', 'https://anchor')` → `https://example.com`.
		const url = new URL(href, 'https://anchor.invalid')
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

// Schemes that can execute or otherwise escape the page context. `data:` is
// included because of `data:text/html,…` payloads. `blob:` and `filesystem:`
// can host scripts. `intent://` and `chrome-extension://` only do anything in
// specific clients but offer no benefit in journal anchors.
const DANGEROUS_HREF_PROTOCOL =
	/^\s*(javascript|data|vbscript|file|blob|filesystem|intent|chrome-extension):/i

const NAMED_ENTITY_DECODE: Record<string, string> = {
	tab: '\t',
	newline: '\n',
	lf: '\n',
	cr: '\r',
	nbsp: ' '
}

function isDangerousHref(href: string) {
	const decoded = href
		.replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
		.replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
		.replace(/&([a-zA-Z]+);?/g, (match, name: string) => {
			const lower = name.toLowerCase()
			return NAMED_ENTITY_DECODE[lower] ?? match
		})
	return DANGEROUS_HREF_PROTOCOL.test(decoded)
}

function neutralizeDangerousAnchors(html: string) {
	return html.replace(/<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi, (anchorTag, quote, href: string) => {
		if (!isDangerousHref(href)) return anchorTag
		console.warn('[journal-blog] Stripped dangerous anchor href:', href)
		return anchorTag.replace(/\bhref=(['"])(.*?)\1/i, `href=${quote}#${quote}`)
	})
}

// Match http(s):// and protocol-relative `//host/...`. Don't match site-
// internal `/foo`, fragments, mailto:, tel:, etc.
const EXTERNAL_HREF = /^(?:https?:)?\/\//i

function normalizeExternalAnchorRel(html: string) {
	return html.replace(/<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi, (anchorTag, quote, href: string) => {
		if (!EXTERNAL_HREF.test(href) || isOwnedExternalUrl(href)) {
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
			rehypePlugins: [rehypeWebpPicture]
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
