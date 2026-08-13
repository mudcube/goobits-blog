/**
 * Blog Route Utilities
 *
 * Helper functions for loading blog content in different contexts
 */

import { error } from '@sveltejs/kit'
import {
	getAllPosts,
	slugify,
	filterPostsByCategory,
	filterPostsByTag,
	getPostCategories,
	getPostTags,
	getOriginalTaxonomyName,
	type ProcessedPost,
	type PostMetadata,
	type GetAllPostsOptions
} from '../utils/blogUtils.js'
import { getBlogConfig, loadConfiguredCategoryDescriptions } from '../config/index.js'

/**
 * Blog configuration type
 */
export interface BlogConfig {
	pagination?: {
		postsPerBatch?: number
	}
	posts?: {
		urlBasePath?: string
	}
	uri?: string
}

// Re-export types from blogUtils for convenience
export type { ProcessedPost, PostMetadata, GetAllPostsOptions }

/**
 * Options for loadBlogIndex
 */
export interface LoadBlogIndexOptions {
	/** If true, only return first batch for SSR */
	initialLoad?: boolean
	/** If true, posts with `draft: true` frontmatter are included */
	includeDrafts?: boolean
}

/**
 * Options for loadCategory / loadTag / loadPost
 */
export interface LoadPostsOptions {
	/** If true, posts with `draft: true` frontmatter are included */
	includeDrafts?: boolean
}

/**
 * Blog index page data
 */
export interface BlogIndexData {
	pageType: 'index'
	posts: ProcessedPost[]
	allPosts: ProcessedPost[]
	totalPosts: number
	hasMorePosts: boolean
	lang: string
}

/**
 * Category page data
 */
export interface CategoryData {
	pageType: 'category'
	posts: ProcessedPost[]
	allPosts: ProcessedPost[]
	category: string
	currentCategory: string
	categoryDescription: string | null
	categoryImage: string | null
	categoryImageAlt: string | null
	lang: string
}

/**
 * Tag page data
 */
export interface TagData {
	pageType: 'tag'
	posts: ProcessedPost[]
	allPosts: ProcessedPost[]
	tag: string
	currentTag: string
	lang: string
}

/**
 * Post page data
 */
export interface PostPageData {
	pageType: 'post'
	post: ProcessedPost
	allPosts: ProcessedPost[]
	lang: string
}

/**
 * Custom error with HTTP status code
 */
export interface HttpError extends Error {
	status: number
}

/**
 * Type guard to check if an error has a status property
 */
function isHttpError(error: unknown): error is HttpError {
	return (
		error instanceof Error &&
		'status' in error &&
		typeof (error as HttpError).status === 'number'
	)
}

function normalizeRoutePath(path: string | null | undefined): string {
	if (typeof path !== 'string' || path.length === 0) {
		return ''
	}
	return path.startsWith('/') ? path : `/${path}`
}

function normalizeRouteBase(path: string | null | undefined): string {
	if (!path || path === '/') {
		return ''
	}
	return normalizeRoutePath(path).replace(/\/+$/, '')
}

function getRouteRelativePostPath(path: string, config: BlogConfig | null = null): string {
	const resolvedConfig = config ?? getBlogConfig()
	const normalizedPath = normalizeRoutePath(path)
	const routeBasePath = resolvedConfig.posts?.urlBasePath
	const routeBase = typeof routeBasePath === 'string' ? routeBasePath : ''
	const normalizedUri = typeof resolvedConfig.uri === 'string' ? resolvedConfig.uri : ''
	const candidateBases = [
		normalizeRouteBase(routeBase),
		normalizeRouteBase(normalizedUri)
	].filter(Boolean)

	for (const base of candidateBases) {
		if (normalizedPath === base) {
			return '/'
		}
		if (normalizedPath.startsWith(`${base}/`)) {
			return normalizedPath.slice(base.length) || '/'
		}
	}

	return normalizedPath
}

/**
 * Creates an error with an HTTP status code
 */
export function createHttpError(message: string, status: number): HttpError {
	try {
		error(status, message)
	} catch (caught) {
		if (caught !== null && typeof caught === 'object') {
			Object.defineProperty(caught, 'message', {
				value: message,
				enumerable: true,
				configurable: true
			})
		}
		throw caught
	}
}

/**
 * Blog entry for prerendering
 */
export interface BlogEntry {
	slug: string
	lang?: string
}

/**
 * Category description data
 */
interface CategoryInfo {
	description?: string
	image?: string
	alt?: string
}

/**
 * Loads data for the main blog index page
 * @param lang - The language code for which to load the index
 * @param config - Blog configuration
 * @param options - Additional options
 * @returns An object containing page data
 */
export async function loadBlogIndex(
	lang: string,
	config: BlogConfig | null = null,
	options: LoadBlogIndexOptions = {}
): Promise<BlogIndexData> {
	const finalConfig = config || getBlogConfig()
	const { initialLoad = false, includeDrafts = false } = options

	const allPosts: ProcessedPost[] = await getAllPosts({
		lang,
		includeContent: false,
		includeDrafts
	})

	// If this is the initial SSR load, only return the first batch
	const posts = initialLoad
		? allPosts.slice(0, finalConfig.pagination?.postsPerBatch || 6)
		: allPosts

	// Calculate total count for pagination info
	const totalPosts = allPosts.length
	const postsPerBatch = finalConfig.pagination?.postsPerBatch || 6
	const hasMorePosts = totalPosts > postsPerBatch

	return {
		pageType: 'index',
		posts,
		allPosts, // Always send allPosts for sidebar categories/tags calculation
		totalPosts,
		hasMorePosts,
		lang
		// Don't include config in returned data to avoid serialization issues
	}
}

/**
 * Loads data for a specific category page
 * @param categorySlugParam - The slug of the category
 * @param lang - The language code
 * @param config - Blog configuration
 * @returns An object containing page data for the category
 * @throws If the category slug is not specified or not found
 */
export async function loadCategory(
	categorySlugParam: string,
	lang: string,
	_config: BlogConfig | null = null,
	options: LoadPostsOptions = {}
): Promise<CategoryData> {
	if (!categorySlugParam) {
		throw createHttpError('Category not specified', 404)
	}

	const slug = categorySlugParam.replace(/\/$/, '')
	const { includeDrafts = false } = options
	const allPosts: ProcessedPost[] = await getAllPosts({ lang, includeDrafts })
	const categoryDescriptions: Record<string, CategoryInfo> = await loadConfiguredCategoryDescriptions<CategoryInfo>(lang)
	const slugLowerCase = slug.toLowerCase()
	const categoryInfo: CategoryInfo = categoryDescriptions[slugLowerCase] || {}
	const posts = filterPostsByCategory(allPosts, slugLowerCase, slugify)
	const originalCategory = getOriginalTaxonomyName(
		allPosts,
		getPostCategories,
		slugLowerCase,
		slugify
	)

	if (posts.length === 0 && !originalCategory) {
		throw createHttpError(`Category "${ slug }" not found or has no posts`, 404)
	}

	return {
		pageType: 'category',
		posts,
		allPosts,
		category: originalCategory || slug,
		currentCategory: originalCategory || slug,
		categoryDescription: categoryInfo.description || null,
		categoryImage: categoryInfo.image || null,
		categoryImageAlt: categoryInfo.alt || null,
		lang
	}
}

/**
 * Loads data for a specific tag page
 * @param tagSlugParam - The slug of the tag
 * @param lang - The language code
 * @param config - Blog configuration
 * @returns An object containing page data for the tag
 * @throws If the tag slug is not specified or not found
 */
export async function loadTag(
	tagSlugParam: string,
	lang: string,
	_config: BlogConfig | null = null,
	options: LoadPostsOptions = {}
): Promise<TagData> {
	if (!tagSlugParam) {
		throw createHttpError('Tag not specified', 404)
	}

	const slug = tagSlugParam.replace(/\/$/, '')
	const { includeDrafts = false } = options
	const allPosts: ProcessedPost[] = await getAllPosts({ lang, includeDrafts })
	const slugLowerCase = slug.toLowerCase()
	const posts = filterPostsByTag(allPosts, slugLowerCase, slugify)
	const originalTag = getOriginalTaxonomyName(
		allPosts,
		getPostTags,
		slugLowerCase,
		slugify
	)

	if (posts.length === 0 && !originalTag) {
		throw createHttpError(`Tag "${ slug }" not found or has no posts`, 404)
	}

	return {
		pageType: 'tag',
		posts,
		allPosts,
		tag: originalTag || slug,
		currentTag: originalTag || slug,
		lang
	}
}

/**
 * Loads data for an individual blog post
 * @param year - The year of the post
 * @param month - The month of the post
 * @param postSlug - The slug of the post
 * @param lang - The language code
 * @param config - Blog configuration
 * @returns An object containing page data for the post
 * @throws If the post is not found or if there's an issue loading it
 */
export async function loadPost(
	year: string,
	month: string,
	postSlug: string,
	lang: string,
	_config: BlogConfig | null = null,
	options: LoadPostsOptions = {}
): Promise<PostPageData> {
	try {
		const { includeDrafts = false } = options
		const allPosts: ProcessedPost[] = await getAllPosts({
			lang,
			includeContent: true,
			includeDrafts
		})

		const foundPost = allPosts.find((p: ProcessedPost) => {
			if (!p.urlPath) {
				return false
			}

			const urlParts = getRouteRelativePostPath(p.urlPath, _config).split('/').filter((part: string) => part)
			if (urlParts.length !== 3) {
				return false
			}

			const [ postYear, postMonth, postSlugPart ] = urlParts as [string, string, string]
			return (
				postYear === year &&
				postMonth === month &&
				(postSlugPart === postSlug || slugify(postSlugPart) === slugify(postSlug))
			)
		})

		if (!foundPost) {
			throw createHttpError(`Article not found: ${ year }/${ month }/${ postSlug }`, 404)
		}

			// Ship full markdown content only on the current post. The rest of
			// allPosts is used by the entry page for similar-posts navigation
			// (title/excerpt/tags/cover) and doesn't need bodies — stripping
			// `content` keeps the inline hydration script small.
			const navPosts: ProcessedPost[] = allPosts.map((p: ProcessedPost) => {
				if (p === foundPost) {
					return p
				}
				const { content: _content, ...rest } = p
				return rest
			})

		return {
			pageType: 'post',
			post: foundPost,
			allPosts: navPosts,
			lang
		}
	} catch (err: unknown) {
		if (isHttpError(err)) {
			throw err
		}

		const message = err instanceof Error ? err.message : 'Could not load article'
		throw createHttpError(message, 500)
	}
}

/**
 * Generates entries for prerendering based on all possible blog routes
 * @param languages - Array of supported language codes
 * @param config - Blog configuration
 * @returns Array of entry objects for prerendering
 */
export async function generateBlogEntries(
	languages: string[] = [ 'en' ],
	_config: BlogConfig | null = null
): Promise<BlogEntry[]> {
	const allPostsData: ProcessedPost[] = await getAllPosts({
		includeLocalizedVersions: true
	})

	const generatedEntries: BlogEntry[] = []
	const baseLocale = languages[0] || 'en'

	// Generate post entries
	allPostsData.forEach((post: ProcessedPost) => {
		if (!post?.urlPath) {return}

		const pathParts = getRouteRelativePostPath(post.urlPath, _config).split('/').filter((part: string) => part)
		if (pathParts.length < 3) {return}

		const [ year, month, postSlug ] = pathParts as [string, string, string, ...string[]]
		const fullSlug = `${ year }/${ month }/${ postSlug }`

		if (post.lang && post.lang !== baseLocale && languages.includes(post.lang)) {
			generatedEntries.push({
				slug: fullSlug,
				lang: post.lang
			})
		} else if (languages.length > 1) {
			languages.forEach((lang: string) => {
				generatedEntries.push({
					slug: fullSlug,
					lang
				})
			})
		} else {
			generatedEntries.push({
				slug: fullSlug
			})
		}
	})

	// Generate category entries
	const allCategories = new Set<string>()
	allPostsData.forEach((post: ProcessedPost) => {
		const categories = getPostCategories(post)
		categories.forEach((cat: string) => allCategories.add(slugify(cat)))
	})

	allCategories.forEach((categorySlug: string) => {
		languages.forEach((lang: string) => {
			generatedEntries.push({
				slug: `category/${ categorySlug }`,
				lang
			})
		})
	})

	// Generate tag entries
	const allTags = new Set<string>()
	allPostsData.forEach((post: ProcessedPost) => {
		const tags = getPostTags(post)
		tags.forEach((tag: string) => allTags.add(slugify(tag)))
	})

	allTags.forEach((tagSlug: string) => {
		languages.forEach((lang: string) => {
			generatedEntries.push({
				slug: `tag/${ tagSlug }`,
				lang
			})
		})
	})

	return generatedEntries
}
