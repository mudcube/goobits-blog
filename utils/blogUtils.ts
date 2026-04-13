import { blogConfig, getBlogVersion, getBlogPostFiles } from '../config/index.js'
import { getPostReadTime } from './readTimeUtils.js'
import { createLogger, type Logger } from './logger.js'

// Declare Node.js globals for environments where @types/node may not be installed
declare const process: { cwd: () => string } | undefined

// Node.js module types for dynamic import
type NodeFsPromises = {
	access(path: string): Promise<void>
	readFile(path: string, encoding: string): Promise<string>
}

type NodePath = {
	join(...paths: string[]): string
}

// Helper to dynamically import Node.js fs module
// Uses Function constructor to avoid bundler issues with dynamic imports
async function getNodeFs(): Promise<NodeFsPromises | null> {
	try {
		// eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call, no-new-func
		const fs = await (Function('return import("fs")')() as Promise<{ promises: NodeFsPromises }>)
		return fs.promises
	} catch {
		return null
	}
}

// Helper to dynamically import Node.js path module
// Uses Function constructor to avoid bundler issues with dynamic imports
async function getNodePath(): Promise<NodePath | null> {
	try {
		// eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call, no-new-func
		return await (Function('return import("path")')() as Promise<NodePath>)
	} catch {
		return null
	}
}

const logger: Logger = createLogger('BlogUtils')

// Post image interface
export interface PostImage {
	src: string
	alt: string
	width?: number
	height?: number
}

// Post author interface
export interface PostAuthor {
	name: string
	avatar?: string
	url?: string
}

// i18n localization data
export interface I18nData {
	[langCode: string]: Partial<PostMetadata>
}

// Post metadata interface
export interface PostMetadata {
	title: string
	date: string
	slug?: string | undefined
	categories?: string[] | undefined
	category?: string | undefined
	featured?: boolean | undefined
	excerpt?: string | undefined
	author?: PostAuthor | undefined
	image?: PostImage | undefined
	thumbnail?: PostImage | undefined
	tags?: string[] | undefined
	readTime?: number | undefined
	updated?: string | undefined
	i18n?: I18nData | undefined
}

// Processed post interface
export interface ProcessedPost {
	metadata: {
		fm: PostMetadata
	}
	date: string
	urlPath: string
	path?: string
	content?: string
	lang?: string
}

// Taxonomy entry interface
export interface TaxonomyEntry {
	slug: string
	lang?: string
}

// Category data from _categories.md file
export interface CategoryData {
	title?: string
	description?: string
	image?: string
	alt?: string
}

// RSS feed options
export interface RssFeedOptions {
	siteUrl: string
	feedTitle?: string
	feedDescription?: string
	feedPath?: string
	maxItems?: number
	language?: string
}

// URL options for getBlogUrl
export interface BlogUrlOptions {
	type: 'post' | 'category' | 'tag' | 'blog'
	data?: ProcessedPost | string
	withLanguage?: boolean
}

// Get all posts options
export interface GetAllPostsOptions {
	lang?: string
	includeContent?: boolean
	includeLocalizedVersions?: boolean
}

// Post module from import
interface PostModule {
	metadata: PostMetadata
}

// Type for post files from getBlogPostFiles
type PostFilesRecord = Record<string, () => Promise<unknown>>

// In-memory cache for blog posts to avoid re-reading files on every request
interface CacheEntry {
	posts: ProcessedPost[]
	timestamp: number
}

const postsCache = new Map<string, CacheEntry>()
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes cache

// URL localizer function that can be set by the consuming app
type UrlLocalizer = (url: string) => string
let _localizeUrl: UrlLocalizer = (url: string): string => url

/**
 * Sets a custom URL localizer function for i18n support
 * @param localizer - Function that transforms URLs for localization
 */
export function setUrlLocalizer(localizer: UrlLocalizer): void {
	_localizeUrl = localizer
}

/**
 * Clear the blog posts cache (useful for development)
 */
export function clearBlogCache(): void {
	postsCache.clear()
	const config = blogConfig
	if (config.debug) {
		logger.info('Blog cache cleared')
	}
}

/**
 * Validates that posts is a non-empty array
 * @param posts - Value to validate
 * @returns True if posts is a valid non-empty array
 */
function isValidPostArray(posts: unknown): posts is ProcessedPost[] {
	return Array.isArray(posts) && posts.length > 0
}

// Log version info on import when debugging is enabled
const configForDebug = blogConfig
if (configForDebug.debug) {
	const { versionString } = getBlogVersion()
	logger.info('[BlogUtils]', versionString)
}

/**
 * Formats a date for display in a readable format
 * @param dateString - The date to format
 * @param shortFormat - Whether to use numeric short format (mm/dd/yyyy)
 * @returns The formatted date string
 */
export function formatDate(dateString: string | Date, shortFormat = false): string {
	const date = new Date(dateString)
	// Check for invalid date
	if (isNaN(date.getTime())) {
		return 'Unknown date'
	}
	if (shortFormat) {
		return date.toLocaleDateString('en-US', {
			month: 'numeric',
			day: 'numeric',
			year: 'numeric'
		})
	}
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	})
}

/**
 * Converts a string to a URL-friendly slug (lowercase and dasherized)
 * @param text - The text to convert to a slug
 * @returns The formatted slug
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-')
}

/**
 * Extracts an emoji from a title, or returns a default emoji
 * @param title - The title to extract an emoji from
 * @param defaultEmoji - The default emoji to use if none is found
 * @returns The extracted emoji or default
 */
export function getEmojiFromTitle(title: string | undefined | null, defaultEmoji?: string): string {
	const config = blogConfig
	const fallback = defaultEmoji ?? config.pageContent.emptyStateEmoji
	const emojiMatch = title?.match(/(\p{Emoji})/u)
	return emojiMatch ? emojiMatch[0] : fallback
}

/**
 * Get image data from a post with proper fallbacks
 * @param post - The post to extract image data from
 * @returns Image data
 */
export function getPostImageData(post: ProcessedPost | null | undefined): PostImage {
	const config = blogConfig
	if (!post?.metadata?.fm) { return { src: '', alt: 'Blog post' } }

	const src = post.metadata.fm.thumbnail?.src ||
		post.metadata.fm.image?.src || ''

	const alt = post.metadata.fm.thumbnail?.alt ||
		post.metadata.fm.image?.alt ||
		post.metadata.fm.title ||
		'Blog post'

	const width = post.metadata.fm.thumbnail?.width ||
		post.metadata.fm.image?.width

	const height = post.metadata.fm.thumbnail?.height ||
		post.metadata.fm.image?.height

	return {
		src,
		alt: `${ alt } - ${ config.name }`,
		...(width !== undefined ? { width } : {}),
		...(height !== undefined ? { height } : {})
	}
}

/**
 * Get categories from a post with proper fallbacks
 * @param post - The post to extract categories from
 * @returns Array of categories
 */
export function getPostCategories(post: ProcessedPost | null | undefined): string[] {
	if (!post?.metadata?.fm) { return [] }

	if (post.metadata.fm.categories && Array.isArray(post.metadata.fm.categories)) {
		return post.metadata.fm.categories
	}
	if (post.metadata.fm.category) {
		return [ post.metadata.fm.category ]
	}
	return []
}

/**
 * Get tags from a post with proper fallbacks
 * @param post - The post to extract tags from
 * @returns Array of tags
 */
export function getPostTags(post: ProcessedPost | null | undefined): string[] {
	if (!post?.metadata?.fm) { return [] }
	return Array.isArray(post.metadata.fm.tags) ? post.metadata.fm.tags : []
}

// Type for extractor function
type TaxonomyExtractor = (post: ProcessedPost) => string[]

// Type for slugify function
type SlugifyFn = (text: string) => string

/**
 * Generate taxonomy entries (categories or tags) for SvelteKit prerendering
 * @param posts - Array of processed posts
 * @param extractorFn - Function to extract taxonomy terms from a post
 * @param slugifyFn - Function to convert terms to URL-friendly slugs
 * @param languages - Optional array of language codes for i18n
 * @returns Array of entry objects for SvelteKit prerendering
 */
export function generateTaxonomyEntries(
	posts: ProcessedPost[],
	extractorFn: TaxonomyExtractor,
	slugifyFn: SlugifyFn,
	languages: string[] = []
): TaxonomyEntry[] {
	// Extract unique taxonomy terms
	const uniqueTerms = new Set<string>()

	posts.forEach(post => {
		const terms = extractorFn(post)
		terms.forEach(term => {
			uniqueTerms.add(term)
		})

		// Also add terms from localized content if available
		if (post.metadata.fm.i18n) {
			Object.keys(post.metadata.fm.i18n).forEach(lang => {
				// Create a localized post object to pass to the extractor function
				const i18nData = post.metadata.fm.i18n?.[lang]
				const localizedPost: ProcessedPost = {
					metadata: {
						fm: {
							...post.metadata.fm,
							...i18nData,
							i18n: post.metadata.fm.i18n
						}
					},
					date: post.date,
					urlPath: post.urlPath
				}

				const localizedTerms = extractorFn(localizedPost)
				localizedTerms.forEach(term => {
					uniqueTerms.add(term)
				})
			})
		}
	})

	// If no terms found, add a placeholder to prevent build errors
	if (uniqueTerms.size === 0) {
		if (extractorFn === getPostCategories) {
			uniqueTerms.add('uncategorized')
		} else {
			uniqueTerms.add('general')
		}
	}

	// Convert terms to entry objects for SvelteKit prerendering
	const entries: TaxonomyEntry[] = []

	Array.from(uniqueTerms).forEach(term => {
		if (languages.length > 1) {
			// Create entries for each language
			languages.forEach(lang => {
				entries.push({
					slug: slugifyFn(term),
					lang
				})
			})
		} else {
			// Just create one entry if no language array provided
			entries.push({ slug: slugifyFn(term) })
		}
	})

	return entries
}

/**
 * Filter posts by a specific category
 * @param posts - Array of processed posts
 * @param categorySlug - Slugified category to filter by
 * @param slugifyFn - Function to convert categories to slugs
 * @returns Array of posts in the specified category
 */
export function filterPostsByCategory(
	posts: ProcessedPost[],
	categorySlug: string,
	slugifyFn: SlugifyFn
): ProcessedPost[] {
	return posts.filter(post => {
		// Check if it matches in categories array
		const hasMatchingCategoryArray = Array.isArray(post.metadata.fm.categories) &&
			post.metadata.fm.categories.some((cat: string) => slugifyFn(cat) === categorySlug)

		// Check if it matches the singular category field
		const hasMatchingSingularCategory = typeof post.metadata.fm.category === 'string' &&
			slugifyFn(post.metadata.fm.category) === categorySlug

		// Check if this term exists as a tag but not as a category (to filter out)
		const isTagOnly = post.metadata.fm.tags?.some((tag: string) => slugifyFn(tag) === categorySlug) &&
			!hasMatchingCategoryArray && !hasMatchingSingularCategory

		// Include if it matches either category format and is not exclusively a tag
		return (hasMatchingCategoryArray || hasMatchingSingularCategory) && !isTagOnly
	})
}

/**
 * Filter posts by a specific tag
 * @param posts - Array of processed posts
 * @param tagSlug - Slugified tag to filter by
 * @param slugifyFn - Function to convert tags to slugs
 * @returns Array of posts with the specified tag
 */
export function filterPostsByTag(
	posts: ProcessedPost[],
	tagSlug: string,
	slugifyFn: SlugifyFn
): ProcessedPost[] {
	return posts.filter(post => {
		// Check if it's in the tags array
		const hasMatchingTag = post.metadata.fm.tags?.some((tag: string) => slugifyFn(tag) === tagSlug)

		// Ensure it's actually a tag, not just a similarly named category
		const isCategoryOnly = (
			// Check if it's also in categories but not in tags
			(Array.isArray(post.metadata.fm.categories) &&
				post.metadata.fm.categories.some((cat: string) => slugifyFn(cat) === tagSlug) &&
				!post.metadata.fm.tags?.some((tag: string) => slugifyFn(tag) === tagSlug)) ||
			// Or check if it's the singular category
			(typeof post.metadata.fm.category === 'string' &&
				slugifyFn(post.metadata.fm.category) === tagSlug &&
				!post.metadata.fm.tags?.some((tag: string) => slugifyFn(tag) === tagSlug))
		)

		// Only include if it's truly a tag and not just a similarly named category
		return hasMatchingTag && !isCategoryOnly
	})
}

/**
 * Find the original (non-slugified) name of a taxonomy term
 * @param posts - Array of processed posts
 * @param extractorFn - Function to extract taxonomy terms from a post
 * @param slugifiedTerm - The slugified term to look up
 * @param slugifyFn - Function to convert terms to slugs
 * @returns Original taxonomy term, or the slugified term if not found
 */
export function getOriginalTaxonomyName(
	posts: ProcessedPost[],
	extractorFn: TaxonomyExtractor,
	slugifiedTerm: string,
	slugifyFn: SlugifyFn
): string {
	return posts.flatMap(post => extractorFn(post))
		.find(term => slugifyFn(term) === slugifiedTerm) || slugifiedTerm
}

/**
 * Parse the categories description file to get metadata for categories
 * @param fileContent - Content of the _categories.md file
 * @returns Category data keyed by slugified category name
 */
export function parseCategoryDescriptions(fileContent: string): Record<string, CategoryData> {
	// Extract the frontmatter content between --- markers
	const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/)

	if (!frontmatterMatch?.[1]) {
		return {}
	}

	// Parse the YAML-like structure manually
	const lines = frontmatterMatch[1].split('\n')
	const categoryData: Record<string, CategoryData> = {}

	let currentCategory: string | null = null

	for (const line of lines) {
		// Skip empty lines
		if (!line.trim()) { continue }

		// Check for main category definition (key:)
		const categoryMatch = line.match(/^([a-z0-9-]+):\s*$/)
		if (categoryMatch?.[1]) {
			currentCategory = categoryMatch[1]
			categoryData[currentCategory] = {}
			continue
		}

		// If we're in a category definition, look for properties
		if (currentCategory) {
			const propMatch = line.match(/^\s\s([a-z-]+):\s*"(.+)"$/) || line.match(/^\s\s([a-z-]+):\s*(.+)$/)
			if (propMatch) {
				const [ , propName, propValue ] = propMatch
				if (propName && propValue) {
					const category = categoryData[currentCategory]
					if (category) {
						(category as Record<string, string>)[propName] = propValue.replace(/^"(.*)"$/, '$1')
					}
				}
			}
		}
	}

	return categoryData
}

/**
 * Load category descriptions from the _categories.md file
 * @param lang - Optional language code for localized category files
 * @returns Category data
 */
export async function loadCategoryDescriptions(lang = 'en'): Promise<Record<string, CategoryData>> {
	if (typeof process === 'undefined') {
		logger.warn('loadCategoryDescriptions requires Node.js environment')
		return {}
	}

	// Get Node.js modules
	const fs = await getNodeFs()
	const path = await getNodePath()

	if (!fs || !path) {
		logger.warn('Node.js fs or path module not available')
		return {}
	}

	// First try to load language-specific category file if it exists
	let categoriesPath = path.join(process?.cwd() ?? '', `src/content/_categories.${ lang }.md`)

	// Check if language-specific file exists, otherwise fall back to default
	try {
		await fs.access(categoriesPath)
	} catch {
		// Fallback to default if language-specific file doesn't exist
		categoriesPath = path.join(process?.cwd() ?? '', 'src/content/_categories.md')
	}

	try {
		const fileContent = await fs.readFile(categoriesPath, 'utf-8')
		return parseCategoryDescriptions(fileContent)
	} catch (readError) {
		const errorMessage = readError instanceof Error ? readError.message : String(readError)
		logger.warn(`Could not read category descriptions file: ${ errorMessage }`)
		return {}
	}
}

/**
 * Add language prefix to URL if i18n is enabled and configured to include language in URL
 * Using Paraglide's localizeHref function for URL localization
 * @param url - The URL to localize
 * @returns Localized URL with language prefix if needed
 */
export function localizeUrl(url: string): string {
	const config = blogConfig
	// Skip if i18n is not enabled or includeLanguageInURL is disabled
	if (!config.i18n?.enabled || !config.i18n.includeLanguageInURL) {
		return url
	}

	// Use the injected URL localizer to add the locale prefix
	return _localizeUrl(url)
}

/**
 * Generate URL for a blog post
 * @param post - The post to generate URL for
 * @param withLanguage - Whether to add language prefix
 * @returns Relative URL to the post
 */
export function getPostUrl(post: ProcessedPost | null | undefined, withLanguage = false): string {
	const config = blogConfig
	if (!post?.urlPath) { return withLanguage ? _localizeUrl(config.uri) : config.uri }
	const url = `${ config.uri }${ post.urlPath }`
	return withLanguage ? _localizeUrl(url) : url
}

/**
 * Generate URL for a category
 * @param category - The category name
 * @param withLanguage - Whether to add language prefix
 * @returns Relative URL to the category
 */
export function getCategoryUrl(category: string | null | undefined, withLanguage = false): string {
	const config = blogConfig
	if (!category) { return withLanguage ? _localizeUrl(config.uri) : config.uri }
	const url = `${ config.uri }/category/${ slugify(category) }`
	return withLanguage ? _localizeUrl(url) : url
}

/**
 * Generate URL for a tag
 * @param tag - The tag name
 * @param withLanguage - Whether to add language prefix
 * @returns Relative URL to the tag
 */
export function getTagUrl(tag: string | null | undefined, withLanguage = false): string {
	const config = blogConfig
	if (!tag) { return withLanguage ? _localizeUrl(config.uri) : config.uri }
	const url = `${ config.uri }/tag/${ slugify(tag) }`
	return withLanguage ? _localizeUrl(url) : url
}

/**
 * Get excerpt from a post with proper fallbacks and length control
 * @param post - The post to extract excerpt from
 * @param maxLength - Maximum length of excerpt
 * @returns Post excerpt
 */
export function getPostExcerpt(post: ProcessedPost | null | undefined, maxLength?: number): string {
	const config = blogConfig
	const limit = maxLength ?? config.posts.excerptLength
	if (!post?.metadata?.fm) { return '' }

	let excerpt = post.metadata.fm.excerpt || ''

	if (!excerpt && post.content) {
		excerpt = post.content
			.replace(/<[^>]*>/g, '')
			.replace(/[#*_~`]/g, '')
			.replace(/\n+/g, ' ')
			.trim()
			.substring(0, limit * 2)
	}

	if (excerpt.length > limit) {
		const truncated = excerpt.substring(0, limit)
		const lastSpace = truncated.lastIndexOf(' ')
		excerpt = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated
		excerpt += '...'
	}

	return excerpt
}

/**
 * Generate URL for various blog entities with a unified interface
 * @param options - URL generation options
 * @returns Generated URL
 */
export function getBlogUrl(options: BlogUrlOptions): string {
	const config = blogConfig
	const { type, data, withLanguage = false } = options

	switch (type) {
	case 'post':
		return getPostUrl(data as ProcessedPost, withLanguage)
	case 'category':
		return getCategoryUrl(data as string, withLanguage)
	case 'tag':
		return getTagUrl(data as string, withLanguage)
	case 'blog':
		return withLanguage ? _localizeUrl(config.uri) : config.uri
	default:
		return withLanguage ? _localizeUrl('/') : '/'
	}
}

/**
 * Process an image path to handle different sources consistently
 * @param imagePath - The raw image path or URL
 * @param defaultPrefix - Default prefix for relative paths
 * @param fallbackImage - Fallback image URL if path is empty
 * @returns Processed image path
 */
export function processImagePath(
	imagePath: string | null | undefined,
	defaultPrefix?: string,
	fallbackImage = ''
): string {
	const config = blogConfig
	const prefix = defaultPrefix ?? config.images.defaults.blogPath

	if (!imagePath) {
		return fallbackImage || ''
	}

	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
		return imagePath
	}

	if (imagePath.startsWith('//')) {
		return `https:${ imagePath }`
	}

	if (imagePath.startsWith('/')) {
		return imagePath
	}

	if (imagePath.startsWith('data:')) {
		return imagePath
	}

	return `${ prefix }${ imagePath }`
}

/**
 * Get cover image URL for a blog post with proper path handling
 * @param post - The post to get cover image for
 * @param fallbackImage - Fallback image URL if post has no image
 * @returns Processed cover image URL
 */
export function getCoverImageUrl(post: ProcessedPost | null | undefined, fallbackImage?: string): string {
	const config = blogConfig
	const fallback = fallbackImage ?? config.images.defaults.coverImage
	const rawImage = post?.metadata?.fm?.image?.src || ''
	return processImagePath(rawImage, config.images.defaults.blogPath, fallback)
}

/**
 * Get author avatar URL with proper path handling
 * @param post - The post to get author avatar for
 * @param fallbackImage - Fallback avatar image if author has no avatar
 * @returns Processed author avatar URL
 */
export function getAuthorAvatarUrl(post: ProcessedPost | null | undefined, fallbackImage?: string): string {
	const config = blogConfig
	const fallback = fallbackImage ?? config.images.defaults.authorAvatar
	const avatar = post?.metadata?.fm?.author?.avatar
	// Fix missing author avatar by using static path
	if (avatar?.includes('authors/')) {
		return `/static${ avatar }`
	}
	return processImagePath(avatar, config.images.defaults.authorsPath, fallback)
}

/**
 * Extracts all unique categories from all blog posts
 * @param posts - Array of processed blog posts
 * @param limit - Maximum number of categories to return
 * @returns Array of category names sorted by frequency (most used first)
 */
export function getAllCategories(posts: ProcessedPost[], limit?: number): string[] {
	const config = blogConfig
	const maxCategories = limit ?? config.posts.popularCategoriesCount

	if (!isValidPostArray(posts)) {
		return []
	}

	const categoryCount: Record<string, number> = {}

	posts.forEach(post => {
		if (Array.isArray(post.metadata.fm.categories)) {
			post.metadata.fm.categories.forEach((category: string) => {
				categoryCount[category] = (categoryCount[category] ?? 0) + 1
			})
		} else if (typeof post.metadata.fm.categories === 'string' && post.metadata.fm.categories) {
			const cat = post.metadata.fm.categories
			categoryCount[cat] = (categoryCount[cat] ?? 0) + 1
		} else if (typeof post.metadata.fm.category === 'string' && post.metadata.fm.category) {
			const cat = post.metadata.fm.category
			categoryCount[cat] = (categoryCount[cat] ?? 0) + 1
		}
	})

	return Object.entries(categoryCount)
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxCategories)
		.map(entry => entry[0])
}

/**
 * Extracts all unique tags from all blog posts
 * @param posts - Array of processed blog posts
 * @param limit - Maximum number of tags to return
 * @returns Array of tag names sorted by frequency (most used first)
 */
export function getAllTags(posts: ProcessedPost[], limit?: number): string[] {
	const config = blogConfig
	const maxTags = limit ?? config.posts.popularTagsCount

	if (!isValidPostArray(posts)) {
		return []
	}

	const tagCount: Record<string, number> = {}

	posts.forEach(post => {
		if (Array.isArray(post.metadata.fm.tags)) {
			post.metadata.fm.tags.forEach((tag: string) => {
				tagCount[tag] = (tagCount[tag] ?? 0) + 1
			})
		}
	})

	return Object.entries(tagCount)
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxTags)
		.map(entry => entry[0])
}

/**
 * Gets the most recent posts from the blog
 * @param posts - Array of all blog posts
 * @param count - Number of recent posts to return
 * @returns Array of the most recent posts
 */
export function getRecentPosts(posts: ProcessedPost[], count?: number): ProcessedPost[] {
	const config = blogConfig
	const limit = count ?? config.posts.recentPostsCount

	return posts.slice(0, limit)
}

/**
 * Gets similar posts based on categories and tags
 * @param allPosts - Array of all blog posts
 * @param currentPostId - ID of the current post to exclude from results
 * @param currentCategory - Category of the current post
 * @param currentTags - Tags of the current post
 * @param count - Number of similar posts to return
 * @returns Array of similar posts sorted by relevance
 */
export function getSimilarPosts(
	allPosts: ProcessedPost[],
	currentPostId: string,
	currentCategory: string | null,
	currentTags: string[] = [],
	count?: number
): ProcessedPost[] {
	const config = blogConfig
	const limit = count ?? config.posts.relatedPostsCount

	const otherPosts = allPosts.filter(post => post.path !== currentPostId)

	const scoredPosts = otherPosts.map(post => {
		let score = 0

		const postCategory = post.metadata.fm.category || (post.metadata.fm.categories?.[0] ?? null)
		if (currentCategory && postCategory === currentCategory) {
			score += 5
		}

		const postTags = post.metadata.fm.tags || []
		for (const tag of currentTags) {
			if (postTags.includes(tag)) {
				score += 2
			}
		}

		return { post, score }
	})

	return scoredPosts
		.sort((a, b) => b.score - a.score)
		.filter(item => item.score > 0)
		.slice(0, limit)
		.map(item => item.post)
}

/**
 * Gets raw markdown content from a blog post file path
 * This is primarily used for accurate read time calculation
 * @param filePath - The import.meta.glob path to the markdown file
 * @returns The markdown content without frontmatter
 */
export async function getMarkdownContent(filePath: string): Promise<string> {
	const config = blogConfig

	// Server-side (Node.js) environment
	if (typeof process !== 'undefined') {
		try {
			// Get Node.js modules
			const fs = await getNodeFs()
			const path = await getNodePath()

			if (!fs || !path) {
				return ''
			}

			const projectRoot = process.cwd()
			const contentPath = filePath.replace(
				config.posts.contentBasePath,
				'/src/content/Blog'
			).replace('//', '/')

			const fullPath = path.join(projectRoot, contentPath)
			const content = await fs.readFile(fullPath, 'utf-8')

			const contentParts = content.split('---')
			if (contentParts.length >= 3) {
				return contentParts.slice(2).join('---')
			}
			return ''
		} catch (error) {
			if (config.debug) {
				logger.warn('Error reading markdown file:', error)
			}
			return ''
		}
	}

	// Browser environment
	try {
		const fetchPath = filePath.replace(
			config.posts.contentBasePath,
			'/src/content/Blog'
		).replace('//', '/')

		const response = await fetch(fetchPath)
		const content = await response.text()
		const contentParts = content.split('---')
		if (contentParts.length >= 3) {
			return contentParts.slice(2).join('---')
		}
		return ''
	} catch (error) {
		if (config.debug) {
			logger.warn('Error fetching markdown file:', error)
		}
		return ''
	}
}

/**
 * Gets all blog posts, processes them, and returns the array sorted by date
 * This is the source of truth for all blog post data in the application
 * @param options - Optional configuration options
 * @returns Array of processed blog posts
 */
export async function getAllPosts(options: GetAllPostsOptions = {}): Promise<ProcessedPost[]> {
	const config = blogConfig
	const {
		lang = 'en',
		includeContent = false,
		includeLocalizedVersions = false
	} = options

	// Create cache key based on options
	const cacheKey = JSON.stringify({ lang, includeContent, includeLocalizedVersions })

	// Check if we have cached data that's still fresh
	const cached = postsCache.get(cacheKey)
	if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
		if (config.debug) {
			logger.info('[BlogUtils] Using cached blog posts', `(${ cached.posts.length } posts)`)
		}
		return cached.posts
	}

	logger.info(`[BlogUtils] Loading blog posts from disk${ lang !== 'en' ? ` for language: ${ lang }` : '' }`)

	// Use the abstracted function to get blog post files
	const posts = getBlogPostFiles() as PostFilesRecord

	const processedPosts = await Promise.all(
		Object.entries(posts).map(async ([ filePath, resolver ]): Promise<ProcessedPost | ProcessedPost[] | null> => {
			const postModule = await resolver() as PostModule

			// Validate basic metadata requirements
			if (!postModule?.metadata?.date) {
				if (config.debug) {
					logger.warn('[BlogUtils] Skipping post due to missing metadata:', filePath)
				}
				return null
			}

			// Validate date format
			const postDate = new Date(postModule.metadata.date)
			if (isNaN(postDate.getTime())) {
				if (config.debug) {
					logger.warn('[BlogUtils] Skipping post due to invalid date:', filePath)
				}
				return null
			}

			// Generate URL path components
			const year = postDate.getFullYear()
			const month = (postDate.getMonth() + 1).toString().padStart(2, '0')
			const filenamePart = filePath.split('/').pop()
			const filename = filenamePart ? filenamePart.replace('.md', '') : ''
			const slug = postModule.metadata.slug || filename
			const urlPath = `/${ year }/${ month }/${ slug }`

			// Get content and calculate file size if needed
			let content = ''
			if (includeContent) {
				content = await getMarkdownContent(filePath)
			}

			// Calculate read time with our utility function
			let readTime = 0

			// First check if readTime is already set in metadata
			if (postModule.metadata.readTime) {
				({ readTime } = postModule.metadata)
			} else {
				// Use our utility function to calculate read time
				// Create a minimal object that satisfies ReadTimePost interface
				// Use type assertion since PostMetadata is a superset of ReadTimePostMetadata
				const postForReadTime = {
					metadata: {
						fm: {
							...(postModule.metadata.readTime !== undefined
								? { readTime: postModule.metadata.readTime }
								: {}),
							...(postModule.metadata.excerpt !== undefined
								? { excerpt: postModule.metadata.excerpt }
								: {})
						}
					},
					...(content ? { content } : {})
				}
				readTime = getPostReadTime(postForReadTime)
			}

			// Update read time in metadata if needed
			if (!postModule.metadata.readTime) {
				postModule.metadata.readTime = readTime
			}

			// Create the base post object
			// Convert file path to proper import path for dynamic imports
			const importPath = filePath.replace('@blog/', '/src/content/Blog/')

			const basePost: ProcessedPost = {
				metadata: { fm: postModule.metadata },
				date: postModule.metadata.date,
				urlPath,
				path: importPath,
				content: includeContent ? content : '',
				lang: 'en' // Default language
			}

			// Handle localization
			if (includeLocalizedVersions && postModule.metadata.i18n) {
				// Return array with base post and all localizations
				const localizedPosts = Object.keys(postModule.metadata.i18n).map((langCode): ProcessedPost => {
					const i18nData = postModule.metadata.i18n?.[langCode]
					return {
						...structuredClone(basePost),
						metadata: {
							fm: {
								...postModule.metadata,
								...i18nData,
								i18n: postModule.metadata.i18n // Keep the i18n map
							}
						},
						lang: langCode
					}
				})

				return [ basePost, ...localizedPosts ]
			}
			if (lang !== 'en' && postModule.metadata.i18n?.[lang]) {
				// Return just the requested localization
				const i18nData = postModule.metadata.i18n[lang]
				return {
					...basePost,
					metadata: {
						fm: {
							...postModule.metadata,
							...i18nData,
							i18n: postModule.metadata.i18n
						}
					},
					lang
				}
			}
			// Return the base post (English or no localization)
			return basePost
		})
	)

	// Flatten any nested arrays from localized versions and filter out nulls
	const flattenedPosts = processedPosts.flat().filter((post): post is ProcessedPost => post !== null)

	// Sort the posts by date in descending order (newest first)
	const sortedPosts = flattenedPosts.sort((a, b) =>
		new Date(b.date).getTime() - new Date(a.date).getTime()
	)

	// Cache the results
	postsCache.set(cacheKey, {
		posts: sortedPosts,
		timestamp: Date.now()
	})

	logger.info('[BlogUtils] Successfully processed', sortedPosts.length, 'blog posts (cached for 5 minutes)')
	return sortedPosts
}

/**
 * Gets popular categories from the blog (dynamically extracted from posts)
 * @param posts - Optional array of posts to extract from
 * @returns Array of popular category names
 */
export async function getPopularCategories(posts?: ProcessedPost[]): Promise<string[]> {
	const config = blogConfig

	if (posts && Array.isArray(posts)) {
		return getAllCategories(posts)
	}

	const allPosts = await getAllPosts().catch((error: unknown) => {
		if (config.debug) {
			logger.error('[BlogUtils] Error getting popular categories:', error)
		}
		return []
	})

	return getAllCategories(allPosts)
}

/**
 * Gets popular tags from the blog (dynamically extracted from posts)
 * @param posts - Optional array of posts to extract from
 * @returns Array of popular tag names
 */
export async function getPopularTags(posts?: ProcessedPost[]): Promise<string[]> {
	const config = blogConfig

	if (posts && Array.isArray(posts)) {
		return getAllTags(posts)
	}

	const allPosts = await getAllPosts().catch((error: unknown) => {
		if (config.debug) {
			logger.error('[BlogUtils] Error getting popular tags:', error)
		}
		return []
	})

	return getAllTags(allPosts)
}

// -----------------------------------------------------------------------------
// RSS Feed Generation Functions
// -----------------------------------------------------------------------------

/**
 * Creates a valid RSS 2.0 feed XML string from an array of blog posts
 *
 * @param posts - Array of blog posts to include in feed
 * @param options - RSS feed configuration options
 * @returns RSS feed XML as a string
 * @throws Error If siteUrl is not provided
 */
export function generateRssFeed(posts: ProcessedPost[], options: RssFeedOptions): string {
	const config = blogConfig

	if (!options?.siteUrl) {
		throw new Error('siteUrl is required to generate RSS feed')
	}

	logger.info(`Generating RSS feed for ${ posts.length } posts`)

	// Default options
	const {
		siteUrl,
		feedTitle = config.name,
		feedDescription = config.description,
		feedPath = `${ config.uri }/rss.xml`,
		maxItems = 20,
		language = 'en'
	} = options

	// Ensure siteUrl doesn't end with a slash
	const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl

	// Limit posts to the max items and filter out any invalid posts
	const limitedPosts = posts
		.filter(post => post?.metadata?.fm?.title && post?.date)
		.slice(0, maxItems)

	// Build the RSS feed XML with proper channel information
	let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${ escapeXml(feedTitle) }</title>
  <link>${ baseUrl }${ config.uri }</link>
  <description>${ escapeXml(feedDescription) }</description>
  <language>${ language }</language>
  <lastBuildDate>${ new Date().toUTCString() }</lastBuildDate>
  <generator>SvelteKit Blog RSS Generator</generator>
  <atom:link href="${ baseUrl }${ feedPath }" rel="self" type="application/rss+xml" />
`

	// Add items to the feed
	limitedPosts.forEach(post => {
		try {
			const postUrl = `${ baseUrl }${ getPostUrl(post) }`
			const pubDate = new Date(post.date).toUTCString()
			const title = post.metadata.fm.title || 'Untitled Post'
			const excerpt = getPostExcerpt(post, 300) || 'No description available'
			const author = post.metadata.fm.author?.name || config.name
			const categories = getRssCategoriesXml(post)
			const modifiedDate = post.metadata.fm.updated
				? new Date(post.metadata.fm.updated).toUTCString()
				: null

			xml += `  <item>
    <title>${ escapeXml(title) }</title>
    <link>${ postUrl }</link>
    <guid isPermaLink="true">${ postUrl }</guid>
    <pubDate>${ pubDate }</pubDate>
${ modifiedDate ? `    <lastBuildDate>${ modifiedDate }</lastBuildDate>\n` : '' }
    <description>${ escapeXml(excerpt) }</description>
    <author>${ escapeXml(author) }</author>
${ categories }
  </item>
`
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err)
			logger.warn(`Error adding post to RSS feed: ${ errorMessage }`, post.path)
			// Continue with next post
		}
	})

	// Close the XML
	xml += '</channel>\n</rss>'

	return xml
}

/**
 * Escapes special characters in XML content to prevent malformed XML
 *
 * @param str - String to escape
 * @returns XML-safe escaped string
 */
function escapeXml(str: string): string {
	if (str === '') { return '' }

	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

/**
 * Generates category XML elements for a post's categories and tags
 * @param post - Blog post
 * @returns Categories XML string to include in the feed item
 */
function getRssCategoriesXml(post: ProcessedPost): string {
	const categories: string[] = []

	// Add categories from post metadata
	if (Array.isArray(post.metadata.fm.categories)) {
		categories.push(...post.metadata.fm.categories)
	} else if (post.metadata.fm.category) {
		categories.push(post.metadata.fm.category)
	}

	// Add tags as categories (standard RSS practice)
	if (Array.isArray(post.metadata.fm.tags)) {
		categories.push(...post.metadata.fm.tags)
	}

	// Generate XML for each unique category
	return [ ...new Set(categories) ]
		.map(category => `    <category>${ escapeXml(category) }</category>\n`)
		.join('')
}
