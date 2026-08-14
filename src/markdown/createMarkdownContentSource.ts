import type { BlogContentSource } from '../core/blogContentSource.js'
import type {
	BlogAuthor,
	BlogImage,
	BlogPost,
	BlogPostMetadataInput,
	BlogPostReference,
	BlogPostTranslation
} from '../core/blogPost.js'
import { canReadDrafts, type BlogPostPage, type BlogQuery, type BlogReadContext } from '../core/blogQuery.js'
import { hasBlogCategory, hasBlogTag } from '../core/blogTaxonomy.js'
import { slugify } from '../core/blogUrls.js'

export type MarkdownImport = () => Promise<unknown>
export type MarkdownImportRecord = Record<string, MarkdownImport>
export type MarkdownFailureMode = 'throw' | 'warn' | 'skip'

export interface MarkdownContentSourceOptions {
	files: MarkdownImportRecord | (() => MarkdownImportRecord)
	basePath?: string
	defaultLanguage?: string
	wordsPerMinute?: number
	readContent?: (filePath: string) => Promise<string>
	resolveSourcePath?: (filePath: string) => string
	importFailureMode?: MarkdownFailureMode
	cacheTtlMs?: number
	logger?: Pick<Console, 'warn'>
}

interface MarkdownModule {
	metadata: BlogPostMetadataInput
}

interface ResolvedPath {
	id: string
	slug: string
	year: string
	month: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return []
	}

	return value.flatMap(item => {
		const text = getString(item)
		return text ? [ text ] : []
	})
}

function getNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function getAuthor(value: unknown): BlogAuthor | undefined {
	if (!isRecord(value)) {
		return undefined
	}
	const name = getString(value['name'])
	if (!name) {
		return undefined
	}

	const avatar = getString(value['avatar'])
	const url = getString(value['url'])
	return { name, ...(avatar ? { avatar } : {}), ...(url ? { url } : {}) }
}

function getImage(value: unknown, fallbackAlt: string): BlogImage | undefined {
	if (typeof value === 'string') {
		return { src: value, alt: fallbackAlt }
	}
	if (!isRecord(value)) {
		return undefined
	}
	const src = getString(value['src'])
	if (!src) {
		return undefined
	}
	const alt = getString(value['alt']) ?? fallbackAlt
	const width = getNumber(value['width'])
	const height = getNumber(value['height'])
	return {
		src,
		alt,
		...(width !== undefined ? { width } : {}),
		...(height !== undefined ? { height } : {})
	}
}

function resolveAssetPath(path: string, postUrlPath: string): string {
	if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\/|#)/i.test(path)) {
		return path
	}

	return `${ postUrlPath.replace(/\/$/, '') }/${ path.replace(/^\.\//, '') }`
}

function resolveImagePath(image: BlogImage | undefined, postUrlPath: string): BlogImage | undefined {
	return image ? { ...image, src: resolveAssetPath(image.src, postUrlPath) } : undefined
}

function getTranslations(value: unknown): Record<string, BlogPostTranslation> | undefined {
	if (!isRecord(value)) {
		return undefined
	}
	const translations: Record<string, BlogPostTranslation> = {}
	for (const [ language, translation ] of Object.entries(value)) {
		if (!isRecord(translation)) {
			continue
		}
		const title = getString(translation['title'])
		const excerpt = getString(translation['excerpt'])
		const categories = getStringArray(translation['categories'])
		const tags = getStringArray(translation['tags'])
		translations[language] = {
			...(title ? { title } : {}),
			...(excerpt ? { excerpt } : {}),
			...(categories.length > 0 ? { categories } : {}),
			...(tags.length > 0 ? { tags } : {})
		}
	}

	return Object.keys(translations).length > 0 ? translations : undefined
}

function resolvePath(filePath: string, date: Date, explicitSlug?: string): ResolvedPath {
	const parts = filePath.replace(/\\/g, '/').split('/').filter(Boolean)
	const filename = (parts.at(-1) ?? '').replace(/\.(md|svx|mdx)$/i, '')
	const nested = filename === 'index'
	const pathSlug = nested ? parts.at(-2) ?? '' : filename
	let yearIndex = -1
	for (let index = parts.length - 1; index >= 0; index -= 1) {
		if (/^\d{4}$/.test(parts[index] ?? '')) {
			yearIndex = index
			break
		}
	}
	const monthPart = yearIndex >= 0 ? parts[yearIndex + 1] : undefined
	const year = yearIndex >= 0 ? parts[yearIndex] ?? '' : String(date.getUTCFullYear())
	const month = monthPart && /^\d{1,2}$/.test(monthPart)
		? monthPart.padStart(2, '0')
		: String(date.getUTCMonth() + 1).padStart(2, '0')
	const slug = slugify(explicitSlug ?? pathSlug)
	const idPath = nested ? parts.slice(0, -1) : [ ...parts.slice(0, -1), filename ]

	return { id: idPath.join('/'), slug, year, month }
}

function normalizeBasePath(path: string): string {
	const trimmed = path.trim()
	return trimmed && trimmed !== '/' ? `/${ trimmed.replace(/^\/+|\/+$/g, '') }` : ''
}

function stripFrontmatter(content: string): string {
	return content.replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, '')
}

function extractFirstImage(content: string): string | undefined {
	const markdown = content.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/)?.[1]
	if (markdown) {
		return markdown
	}

	return content.match(/<img[^>]*\bsrc=["']([^"']+)["']/i)?.[1]
}

function extractLinks(content: string): string[] {
	const links = new Set<string>()
	for (const match of content.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
		if (match.index > 0 && content[match.index - 1] === '!') {
			continue
		}
		const href = match[1]
		if (href?.startsWith('/')) {
			links.add(href)
		}
	}
	return [ ...links ]
}

function createExcerpt(content: string, length = 220): string {
	const text = content
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[#*_>`~-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

	return text.length <= length ? text : `${ text.slice(0, length).trimEnd() }...`
}

function calculateReadTime(content: string, wordsPerMinute: number): number {
	const words = content.trim().split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.ceil(words / wordsPerMinute))
}

function localizePost(post: BlogPost, language: string, includeTranslations: boolean): BlogPost {
	const translation = post.translations?.[language]
	const { translations, ...basePost } = post
	return {
		...basePost,
		lang: translation ? language : post.lang,
		title: translation?.title ?? post.title,
		excerpt: translation?.excerpt ?? post.excerpt,
		categories: translation?.categories ?? [ ...post.categories ],
		tags: translation?.tags ?? [ ...post.tags ],
		aliases: [ ...post.aliases ],
		links: [ ...post.links ],
		relatedPostIds: [ ...post.relatedPostIds ],
		...(includeTranslations && translations ? { translations } : {})
	}
}

function stripContent(post: BlogPost, includeContent: boolean): BlogPost {
	if (includeContent) {
		return post
	}

	const { content: _content, ...summary } = post
	return summary
}

function sortPosts(posts: BlogPost[], sort: BlogQuery['sort']): void {
	posts.sort((left, right) => {
		if (sort === 'title') {
			return left.title.localeCompare(right.title)
		}
		const difference = new Date(right.date).getTime() - new Date(left.date).getTime()
		return sort === 'oldest' ? -difference : difference
	})
}

function isMarkdownModule(value: unknown): value is MarkdownModule {
	return isRecord(value) && isRecord(value['metadata'])
}

export function createMarkdownContentSource(options: MarkdownContentSourceOptions): BlogContentSource {
	const basePath = normalizeBasePath(options.basePath ?? '/blog')
	const defaultLanguage = options.defaultLanguage ?? 'en'
	const wordsPerMinute = Math.max(1, options.wordsPerMinute ?? 220)
	const cacheTtlMs = Math.max(0, options.cacheTtlMs ?? 300_000)
	const failureMode = options.importFailureMode ?? 'warn'
	const logger = options.logger ?? console
	let cache: { posts: BlogPost[]; createdAt: number } | null = null

	const handleFailure = (filePath: string, error: unknown): null => {
		if (failureMode === 'throw') {
			const message = error instanceof Error ? error.message : String(error)
			throw new Error(`Failed to import blog post "${ filePath }": ${ message }`)
		}
		if (failureMode === 'warn') {
			logger.warn(`Skipping blog post "${ filePath }" after import failure`, error)
		}
		return null
	}

	const loadPosts = async (): Promise<BlogPost[]> => {
		if (cache && Date.now() - cache.createdAt < cacheTtlMs) {
			return cache.posts
		}
		const files = typeof options.files === 'function' ? options.files() : options.files
		const loaded = await Promise.all(Object.entries(files).map(async ([ filePath, load ]): Promise<BlogPost | null> => {
			try {
				const module = await load()
				if (!isMarkdownModule(module)) {
					throw new Error('Markdown module does not export metadata')
				}
				const { metadata } = module
				const dateValue = getString(metadata.date)
				const date = dateValue ? new Date(dateValue) : new Date(Number.NaN)
				if (!dateValue || Number.isNaN(date.getTime())) {
					throw new Error('Post metadata has no valid date')
				}
				const title = getString(metadata.title) ?? 'Untitled post'
				const resolved = resolvePath(filePath, date, getString(metadata.slug))
				if (!resolved.slug) {
					throw new Error('Post path has no usable slug')
				}
				const rawContent = options.readContent ? await options.readContent(filePath) : ''
				const content = stripFrontmatter(rawContent)
				const categories = [ ...getStringArray(metadata.categories) ]
				const category = getString(metadata.category)
				if (category && !categories.includes(category)) {
					categories.push(category)
				}
				const image = getImage(metadata.image, title)
				const coverImage = getString(metadata.coverImage)
				const extractedImage = extractFirstImage(content)
				const aliases = getStringArray(metadata.aliases)
				const urlPath = `${ basePath }/${ resolved.year }/${ resolved.month }/${ resolved.slug }`
				const finalImage = resolveImagePath(image ?? (coverImage || extractedImage
					? { src: coverImage ?? extractedImage ?? '', alt: title }
					: undefined), urlPath)
				const readTime = getNumber(metadata.readTime)
				const excerpt = getString(metadata.excerpt) ?? createExcerpt(content)
				const translations = getTranslations(metadata.i18n)
				const updated = getString(metadata.updated)
				const author = getAuthor(metadata.author)
				const normalizedAuthor = author?.avatar
					? { ...author, avatar: resolveAssetPath(author.avatar, urlPath) }
					: author
				const thumbnail = resolveImagePath(getImage(metadata.thumbnail, title), urlPath)
				const normalizedCoverImage = coverImage ? resolveAssetPath(coverImage, urlPath) : undefined
				return {
					id: resolved.id,
					slug: resolved.slug,
					title,
					date: date.toISOString(),
					excerpt,
					categories,
					tags: getStringArray(metadata.tags),
					featured: metadata.featured === true,
					lang: defaultLanguage,
					status: metadata.draft === true ? 'draft' : 'published',
					urlPath,
					readTimeMinutes: readTime === undefined ? calculateReadTime(content, wordsPerMinute) : Math.max(1, readTime),
					aliases,
					links: [ ...new Set([ ...getStringArray(metadata.links), ...extractLinks(content) ]) ],
					relatedPostIds: getStringArray(metadata.relatedPosts),
					...(updated ? { updated } : {}),
					...(normalizedAuthor ? { author: normalizedAuthor } : {}),
					...(finalImage ? { image: finalImage } : {}),
					...(thumbnail ? { thumbnail } : {}),
					...(normalizedCoverImage ? { coverImage: normalizedCoverImage } : {}),
					...(content ? { content } : {}),
					sourcePath: options.resolveSourcePath?.(filePath) ?? filePath,
					...(translations ? { translations } : {})
				}
			} catch (error) {
				return handleFailure(filePath, error)
			}
		}))

		const posts = loaded.filter((post): post is BlogPost => post !== null)
		cache = { posts, createdAt: Date.now() }
		return posts
	}

	const listPosts = async (query: BlogQuery = {}, context: BlogReadContext = {}): Promise<BlogPostPage> => {
		const language = query.language ?? defaultLanguage
		let posts = (await loadPosts())
			.filter(post => post.status === 'published' || canReadDrafts(query, context))
			.map(post => localizePost(post, language, query.includeTranslations === true))

		if (query.category) {
			posts = posts.filter(post => hasBlogCategory(post, query.category ?? ''))
		}
		if (query.tag) {
			posts = posts.filter(post => hasBlogTag(post, query.tag ?? ''))
		}
		const search = query.search?.trim().toLowerCase()
		if (search) {
			posts = posts.filter(post => `${ post.title } ${ post.excerpt } ${ post.categories.join(' ') } ${ post.tags.join(' ') } ${ post.content ?? '' }`
				.toLowerCase()
				.includes(search))
		}

		sortPosts(posts, query.sort ?? 'newest')
		const total = posts.length
		const page = Math.max(1, Math.floor(query.page ?? 1))
		const pageSize = Math.max(1, Math.floor(query.pageSize ?? 12))
		const start = (page - 1) * pageSize
		const pagePosts = posts.slice(start, start + pageSize)
			.map(post => stripContent(post, query.includeContent === true))

		return { posts: pagePosts, total, page, pageSize, hasNextPage: start + pageSize < total }
	}

	return {
		listPosts,
		getPost: async (reference: BlogPostReference, query = {}, context = {}): Promise<BlogPost | null> => {
			const key = typeof reference === 'string' ? reference : reference.id
			const page = await listPosts({ ...query, page: 1, pageSize: Number.MAX_SAFE_INTEGER }, context)
			return page.posts.find(post =>
				post.id === key ||
				post.slug === key ||
				post.urlPath === key ||
				post.aliases.includes(key)
			) ?? null
		},
		invalidate: (): void => {
			cache = null
		}
	}
}
