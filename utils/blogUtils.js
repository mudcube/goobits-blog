import { blogConfig, getBlogVersion, getBlogPostFiles } from '../config/index.js'
import { getPostReadTime } from './readTimeUtils.js'

// Simple console logger for the package
const logger = console

// In-memory cache for blog posts to avoid re-reading files on every request
const postsCache = new Map()
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes cache

// URL localizer function that can be set by the consuming app
let _localizeUrl = (url) => url
export function setUrlLocalizer(localizer) {
	_localizeUrl = localizer
}

/**
 * Clear the blog posts cache (useful for development)
 */
export function clearBlogCache() {
	postsCache.clear()
	if (blogConfig.debug) {
		logger.log('[BlogUtils] Blog cache cleared')
	}
}

// Log version info on import when debugging is enabled
if (blogConfig.debug) {
	const { versionString } = getBlogVersion()
	logger.log('[BlogUtils]', versionString)
}

/**
 * @typedef {Object} ProcessedPost
 * @property {{ fm: PostMetadata }} metadata - Contains post metadata with 'fm' property
 * @property {string} date - ISO formatted date string
 * @property {string} urlPath - Relative URL path to the post
 * @property {string} [path] - Original file path for debugging
 * @property {string} [content] - Full markdown content for read time calculation
 * @property {string} [lang] - Language of the post content if processed for i18n
 */

/**
 * @typedef {Object} PostMetadata
 * @property {string} title - Post title
 * @property {string} date - Post date in YYYY-MM-DD format
 * @property {string} slug - Post slug for URL
 * @property {string[]} [categories] - Post categories array
 * @property {string} [category] - Single category (fallback, prefer categories array)
 * @property {boolean} [featured] - Whether the post is featured
 * @property {string} [excerpt] - Post excerpt
 * @property {{ name: string; avatar?: string; url?: string }} author - Post author
 * @property {{ src: string; alt: string; width?: number; height?: number }} [image] - Post main image
 * @property {{ src: string; alt: string; width?: number; height?: number }} [thumbnail] - Post thumbnail image
 * @property {string[]} [tags] - Post tags array
 * @property {number} [readTime] - Estimated reading time in minutes
 * @property {Object} [i18n] - Language-specific versions of metadata keyed by language code
 */

/**
 * Formats a date for display in a readable format
 * @param {string|Date} dateString - The date to format
 * @param {boolean} shortFormat - Whether to use numeric short format (mm/dd/yyyy)
 * @returns {string} The formatted date string
 */
export function formatDate(dateString, shortFormat = false) {
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
 * @param {string} text - The text to convert to a slug
 * @returns {string} The formatted slug
 */
export function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-')
}

/**
 * Extracts an emoji from a title, or returns a default emoji
 * @param {string} title - The title to extract an emoji from
 * @param {string} defaultEmoji - The default emoji to use if none is found
 * @returns {string} The extracted emoji or default
 */
export function getEmojiFromTitle(title, defaultEmoji = blogConfig.pageContent.emptyStateEmoji) {
	const emojiMatch = title?.match(/(\p{Emoji})/u)
	return emojiMatch ? emojiMatch[0] : defaultEmoji
}

/**
 * Get image data from a post with proper fallbacks
 * @param {ProcessedPost} post - The post to extract image data from
 * @returns {{ src: string, alt: string, width?: number, height?: number }} Image data
 */
export function getPostImageData(post) {
	if (!post?.metadata?.fm) return { src: '', alt: 'Blog post' }

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
		alt: `${ alt } - ${ blogConfig.name }`,
		...(width ? { width } : {}),
		...(height ? { height } : {})
	}
}

/**
 * Get categories from a post with proper fallbacks
 * @param {ProcessedPost} post - The post to extract categories from
 * @returns {string[]} Array of categories
 */
export function getPostCategories(post) {
	if (!post?.metadata?.fm) return []

	if (post.metadata.fm.categories && Array.isArray(post.metadata.fm.categories)) {
		return post.metadata.fm.categories
	} else if (post.metadata.fm.category) {
		return [ post.metadata.fm.category ]
	} else {
		return []
	}
}

/**
 * Get tags from a post with proper fallbacks
 * @param {ProcessedPost} post - The post to extract tags from
 * @returns {string[]} Array of tags
 */
export function getPostTags(post) {
	if (!post?.metadata?.fm) return []
	return Array.isArray(post.metadata.fm.tags) ? post.metadata.fm.tags : []
}

/**
 * Generate taxonomy entries (categories or tags) for SvelteKit prerendering
 * @param {ProcessedPost[]} posts - Array of processed posts
 * @param {Function} extractorFn - Function to extract taxonomy terms from a post (e.g., getPostCategories or getPostTags)
 * @param {Function} slugifyFn - Function to convert terms to URL-friendly slugs (e.g., slugify)
 * @param {string[]} [languages] - Optional array of language codes for i18n
 * @returns {Array<{slug: string, lang?: string}>} Array of entry objects for SvelteKit prerendering
 */
export function generateTaxonomyEntries(posts, extractorFn, slugifyFn, languages = []) {
	// Extract unique taxonomy terms
	const uniqueTerms = new Set()

	posts.forEach(post => {
		const terms = extractorFn(post)
		terms.forEach(term => {
			uniqueTerms.add(term)
		})

		// Also add terms from localized content if available
		if (post.metadata.fm.i18n) {
			Object.keys(post.metadata.fm.i18n).forEach(lang => {
				// Create a localized post object to pass to the extractor function
				const localizedPost = {
					metadata: {
						fm: {
							...post.metadata.fm,
							...post.metadata.fm.i18n[lang],
							i18n: post.metadata.fm.i18n
						}
					}
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
	const entries = []

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
 * @param {ProcessedPost[]} posts - Array of processed posts
 * @param {string} categorySlug - Slugified category to filter by
 * @param {Function} slugifyFn - Function to convert categories to slugs (e.g., slugify)
 * @returns {ProcessedPost[]} Array of posts in the specified category
 */
export function filterPostsByCategory(posts, categorySlug, slugifyFn) {
	return posts.filter(post => {
		// Check if it matches in categories array
		const hasMatchingCategoryArray = Array.isArray(post.metadata.fm.categories) &&
			post.metadata.fm.categories.some(cat => slugifyFn(cat) === categorySlug)

		// Check if it matches the singular category field
		const hasMatchingSingularCategory = typeof post.metadata.fm.category === 'string' &&
			slugifyFn(post.metadata.fm.category) === categorySlug

		// Check if this term exists as a tag but not as a category (to filter out)
		const isTagOnly = post.metadata.fm.tags?.some(tag => slugifyFn(tag) === categorySlug) &&
			!hasMatchingCategoryArray && !hasMatchingSingularCategory

		// Include if it matches either category format and is not exclusively a tag
		return (hasMatchingCategoryArray || hasMatchingSingularCategory) && !isTagOnly
	})
}

/**
 * Filter posts by a specific tag
 * @param {ProcessedPost[]} posts - Array of processed posts
 * @param {string} tagSlug - Slugified tag to filter by
 * @param {Function} slugifyFn - Function to convert tags to slugs (e.g., slugify)
 * @returns {ProcessedPost[]} Array of posts with the specified tag
 */
export function filterPostsByTag(posts, tagSlug, slugifyFn) {
	return posts.filter(post => {
		// Check if it's in the tags array
		const hasMatchingTag = post.metadata.fm.tags?.some(tag => slugifyFn(tag) === tagSlug)

		// Ensure it's actually a tag, not just a similarly named category
		const isCategoryOnly = (
			// Check if it's also in categories but not in tags
			(Array.isArray(post.metadata.fm.categories) &&
				post.metadata.fm.categories.some(cat => slugifyFn(cat) === tagSlug) &&
				!post.metadata.fm.tags?.some(tag => slugifyFn(tag) === tagSlug)) ||
			// Or check if it's the singular category
			(typeof post.metadata.fm.category === 'string' &&
				slugifyFn(post.metadata.fm.category) === tagSlug &&
				!post.metadata.fm.tags?.some(tag => slugifyFn(tag) === tagSlug))
		)

		// Only include if it's truly a tag and not just a similarly named category
		return hasMatchingTag && !isCategoryOnly
	})
}

/**
 * Find the original (non-slugified) name of a taxonomy term
 * @param {ProcessedPost[]} posts - Array of processed posts
 * @param {Function} extractorFn - Function to extract taxonomy terms from a post
 * @param {string} slugifiedTerm - The slugified term to look up
 * @param {Function} slugifyFn - Function to convert terms to slugs
 * @returns {string} Original taxonomy term, or the slugified term if not found
 */
export function getOriginalTaxonomyName(posts, extractorFn, slugifiedTerm, slugifyFn) {
	return posts.flatMap(post => extractorFn(post))
		.find(term => slugifyFn(term) === slugifiedTerm) || slugifiedTerm
}

/**
 * Parse the categories description file to get metadata for categories
 * @param {string} fileContent - Content of the _categories.md file
 * @returns {Object.<string, {
 *   title?: string,
 *   description?: string,
 *   image?: string,
 *   alt?: string
 * }>} Category data keyed by slugified category name
 */
export function parseCategoryDescriptions(fileContent) {
	// Extract the frontmatter content between --- markers
	const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/)

	if (!frontmatterMatch || !frontmatterMatch[1]) {
		return {}
	}

	// Parse the YAML-like structure manually
	const lines = frontmatterMatch[1].split('\n')
	const categoryData = {}

	let currentCategory = null

	for (const line of lines) {
		// Skip empty lines
		if (!line.trim()) continue

		// Check for main category definition (key:)
		const categoryMatch = line.match(/^([a-z0-9-]+):\s*$/)
		if (categoryMatch) {
			currentCategory = categoryMatch[1]
			categoryData[currentCategory] = {}
			continue
		}

		// If we're in a category definition, look for properties
		if (currentCategory) {
			const propMatch = line.match(/^\s\s([a-z-]+):\s*"(.+)"$/) || line.match(/^\s\s([a-z-]+):\s*(.+)$/)
			if (propMatch) {
				const [ , propName, propValue ] = propMatch
				categoryData[currentCategory][propName] = propValue.replace(/^"(.*)"$/, '$1') // Remove quotes if present
			}
		}
	}

	return categoryData
}

/**
 * Load category descriptions from the _categories.md file
 * @param {string} [lang] - Optional language code for localized category files
 * @returns {Promise<Object.<string, {title?: string, description?: string, image?: string, alt?: string}>>} Category data
 */
export async function loadCategoryDescriptions(lang = 'en') {
	if (typeof process === 'undefined') {
		logger.warn('loadCategoryDescriptions requires Node.js environment')
		return {}
	}

	const { promises: fs } = await import('fs')
	const { join } = await import('path')

	// First try to load language-specific category file if it exists
	let categoriesPath = join(process.cwd(), `src/content/_categories.${ lang }.md`)

	// Check if language-specific file exists, otherwise fall back to default
	try {
		await fs.access(categoriesPath)
	} catch (e) {
		// Fallback to default if language-specific file doesn't exist
		categoriesPath = join(process.cwd(), 'src/content/_categories.md')
	}

	try {
		const fileContent = await fs.readFile(categoriesPath, 'utf-8')
		return parseCategoryDescriptions(fileContent)
	} catch (readError) {
		logger.warn(`Could not read category descriptions file: ${ readError.message }`)
		return {}
	}
}

/**
 * Add language prefix to URL if i18n is enabled and configured to include language in URL
 * Using Paraglide's localizeHref function for URL localization
 * @param {string} url - The URL to localize
 * @returns {string} Localized URL with language prefix if needed
 */
export function localizeUrl(url) {
	// Skip if i18n is not enabled or includeLanguageInURL is disabled
	if (!blogConfig.i18n?.enabled || !blogConfig.i18n.includeLanguageInURL) {
		return url
	}

	// Use the injected URL localizer to add the locale prefix
	return _localizeUrl(url)
}

/**
 * Generate URL for a blog post
 * @param {ProcessedPost} post - The post to generate URL for
 * @param {boolean} [withLanguage=true] - Whether to add language prefix
 * @param {string} [languageCode] - Specific language code to use (overrides current language)
 * @returns {string} Relative URL to the post
 */
export function getPostUrl(post, withLanguage = false, _languageCode) {
	if (!post?.urlPath) return withLanguage ? _localizeUrl(blogConfig.uri) : blogConfig.uri
	const url = `${ blogConfig.uri }${ post.urlPath }`
	return withLanguage ? _localizeUrl(url) : url
}

/**
 * Generate URL for a category
 * @param {string} category - The category name
 * @param {boolean} [withLanguage=true] - Whether to add language prefix
 * @returns {string} Relative URL to the category
 */
export function getCategoryUrl(category, withLanguage = false) {
	if (!category) return withLanguage ? _localizeUrl(blogConfig.uri) : blogConfig.uri
	const url = `${ blogConfig.uri }/category/${ slugify(category) }`
	return withLanguage ? _localizeUrl(url) : url
}

/**
 * Generate URL for a tag
 * @param {string} tag - The tag name
 * @param {boolean} [withLanguage=true] - Whether to add language prefix
 * @returns {string} Relative URL to the tag
 */
export function getTagUrl(tag, withLanguage = false) {
	if (!tag) return withLanguage ? _localizeUrl(blogConfig.uri) : blogConfig.uri
	const url = `${ blogConfig.uri }/tag/${ slugify(tag) }`
	return withLanguage ? _localizeUrl(url) : url
}

/**
 * Get excerpt from a post with proper fallbacks and length control
 * @param {ProcessedPost} post - The post to extract excerpt from
 * @param {number} [maxLength] - Maximum length of excerpt
 * @returns {string} Post excerpt
 */
export function getPostExcerpt(post, maxLength = blogConfig.posts.excerptLength) {
	if (!post?.metadata?.fm) return ''

	let excerpt = post.metadata.fm.excerpt || ''

	if (!excerpt && post.content) {
		excerpt = post.content
			.replace(/<[^>]*>/g, '')
			.replace(/[#*_~`]/g, '')
			.replace(/\n+/g, ' ')
			.trim()
			.substring(0, maxLength * 2)
	}

	if (excerpt.length > maxLength) {
		const truncated = excerpt.substring(0, maxLength)
		const lastSpace = truncated.lastIndexOf(' ')
		excerpt = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated
		excerpt += '...'
	}

	return excerpt
}

/**
 * Generate URL for various blog entities with a unified interface
 * @param {Object} options - URL generation options
 * @param {string} options.type - Type of entity ('post', 'category', 'tag', 'blog')
 * @param {*} options.data - The data needed for URL generation (post object, category name, tag name)
 * @param {boolean} [options.withLanguage=true] - Whether to add language prefix
 * @returns {string} Generated URL
 */
export function getBlogUrl(options) {
	const { type, data, withLanguage = false } = options

	switch (type) {
	case 'post':
		return getPostUrl(data, withLanguage)
	case 'category':
		return getCategoryUrl(data, withLanguage)
	case 'tag':
		return getTagUrl(data, withLanguage)
	case 'blog':
		return withLanguage ? _localizeUrl(blogConfig.uri) : blogConfig.uri
	default:
		return withLanguage ? _localizeUrl('/') : '/'
	}
}

/**
 * Process an image path to handle different sources consistently
 * @param {string} imagePath - The raw image path or URL
 * @param {string} [defaultPrefix=blogConfig.images.defaults.blogPath] - Default prefix for relative paths
 * @param {string} [fallbackImage=''] - Fallback image URL if path is empty
 * @returns {string} Processed image path
 */
export function processImagePath(
	imagePath,
	defaultPrefix = blogConfig.images.defaults.blogPath,
	fallbackImage = ''
) {
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

	return `${ defaultPrefix }${ imagePath }`
}

/**
 * Get cover image URL for a blog post with proper path handling
 * @param {ProcessedPost} post - The post to get cover image for
 * @param {string} [fallbackImage=blogConfig.images.defaults.coverImage] - Fallback image URL if post has no image
 * @returns {string} Processed cover image URL
 */
export function getCoverImageUrl(post, fallbackImage = blogConfig.images.defaults.coverImage) {
	const rawImage = post?.metadata?.fm?.image?.src || ''
	return processImagePath(rawImage, blogConfig.images.defaults.blogPath, fallbackImage)
}

/**
 * Get author avatar URL with proper path handling
 * @param {ProcessedPost} post - The post to get author avatar for
 * @param {string} [fallbackImage=blogConfig.images.defaults.authorAvatar] - Fallback avatar image if author has no avatar
 * @returns {string} Processed author avatar URL
 */
export function getAuthorAvatarUrl(post, fallbackImage = blogConfig.images.defaults.authorAvatar) {
	const avatar = post?.metadata?.fm?.author?.avatar
	// Fix missing author avatar by using static path
	if (avatar && avatar.includes('authors/')) {
		return `/static${ avatar }`
	}
	return processImagePath(avatar, blogConfig.images.defaults.authorsPath, fallbackImage)
}

/**
 * Extracts all unique categories from all blog posts
 * @param {ProcessedPost[]} posts - Array of processed blog posts
 * @param {number} [limit=blogConfig.posts.popularCategoriesCount] - Maximum number of categories to return
 * @returns {string[]} Array of category names sorted by frequency (most used first)
 */
export function getAllCategories(posts, limit = blogConfig.posts.popularCategoriesCount) {
	if (!posts || !Array.isArray(posts) || posts.length === 0) {
		return []
	}

	const categoryCount = {}

	posts.forEach(post => {
		// Skip posts with missing metadata
		if (!post?.metadata?.fm) return

		if (Array.isArray(post.metadata.fm.categories)) {
			post.metadata.fm.categories.forEach(category => {
				categoryCount[category] = (categoryCount[category] || 0) + 1
			})
		} else if (typeof post.metadata.fm.categories === 'string' && post.metadata.fm.categories) {
			categoryCount[post.metadata.fm.categories] = (categoryCount[post.metadata.fm.categories] || 0) + 1
		} else if (typeof post.metadata.fm.category === 'string' && post.metadata.fm.category) {
			categoryCount[post.metadata.fm.category] = (categoryCount[post.metadata.fm.category] || 0) + 1
		}
	})

	return Object.entries(categoryCount)
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(entry => entry[0])
}

/**
 * Extracts all unique tags from all blog posts
 * @param {ProcessedPost[]} posts - Array of processed blog posts
 * @param {number} [limit=blogConfig.posts.popularTagsCount] - Maximum number of tags to return
 * @returns {string[]} Array of tag names sorted by frequency (most used first)
 */
export function getAllTags(posts, limit = blogConfig.posts.popularTagsCount) {
	if (!posts || !Array.isArray(posts) || posts.length === 0) {
		return []
	}

	const tagCount = {}

	posts.forEach(post => {
		// Skip posts with missing metadata
		if (!post?.metadata?.fm) return

		if (Array.isArray(post.metadata.fm.tags)) {
			post.metadata.fm.tags.forEach(tag => {
				tagCount[tag] = (tagCount[tag] || 0) + 1
			})
		}
	})

	return Object.entries(tagCount)
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(entry => entry[0])
}

/**
 * Gets the most recent posts from the blog
 * @param {ProcessedPost[]} posts - Array of all blog posts
 * @param {number} [count=blogConfig.posts.recentPostsCount] - Number of recent posts to return
 * @returns {ProcessedPost[]} Array of the most recent posts
 */
export function getRecentPosts(posts, count = blogConfig.posts.recentPostsCount) {
	if (!posts || !Array.isArray(posts)) {
		return []
	}

	return posts.slice(0, count)
}

/**
 * Gets similar posts based on categories and tags
 * @param {ProcessedPost[]} allPosts - Array of all blog posts
 * @param {string} currentPostId - ID of the current post to exclude from results
 * @param {string|null} currentCategory - Category of the current post
 * @param {string[]} currentTags - Tags of the current post
 * @param {number} [count=blogConfig.posts.relatedPostsCount] - Number of similar posts to return
 * @returns {ProcessedPost[]} Array of similar posts sorted by relevance
 */
export function getSimilarPosts(
	allPosts,
	currentPostId,
	currentCategory,
	currentTags = [],
	count = blogConfig.posts.relatedPostsCount
) {
	if (!allPosts || !Array.isArray(allPosts)) {
		return []
	}

	const otherPosts = allPosts.filter(post => post.path !== currentPostId)

	const scoredPosts = otherPosts.map(post => {
		let score = 0

		const postCategory = post.metadata.fm.category || (post.metadata.fm.categories?.[0] || null)
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
		.slice(0, count)
		.map(item => item.post)
}

/**
 * Estimates the reading time from markdown frontmatter and file size
 * This is a fallback when we can't get the full content
 * @param {Object} metadata - The frontmatter metadata
 * @param {number} fileSize - The size of the file in bytes (if available)
 * @returns {number} Estimated reading time in minutes
 */

/**
 * Gets raw markdown content from a blog post file path
 * This is primarily used for accurate read time calculation
 * @param {string} filePath - The import.meta.glob path to the markdown file
 * @returns {Promise<string>} The markdown content without frontmatter
 */
export async function getMarkdownContent(filePath) {
	// Server-side (Node.js) environment
	if (typeof process !== 'undefined') {
		try {
			const fs = await import('node:fs/promises')
			const path = await import('node:path')

			const projectRoot = process.cwd()
			const contentPath = filePath.replace(
				blogConfig.posts.contentBasePath,
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
			if (blogConfig.debug) {
				logger.warn('Error reading markdown file:', error)
			}
			return ''
		}
	}

	// Browser environment
	try {
		const fetchPath = filePath.replace(
			blogConfig.posts.contentBasePath,
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
		if (blogConfig.debug) {
			logger.warn('Error fetching markdown file:', error)
		}
		return ''
	}
}

/**
 * Gets all blog posts, processes them, and returns the array sorted by date
 * This is the source of truth for all blog post data in the application
 * @param {Object} [options] - Optional configuration options
 * @param {string} [options.lang] - Language code for localized content (e.g., 'en', 'es')
 * @param {boolean} [options.includeContent=false] - Whether to include full markdown content (increases memory usage)
 * @param {boolean} [options.includeLocalizedVersions=false] - Whether to include localized versions in the result
 * @returns {Promise<ProcessedPost[]>} Array of processed blog posts
 */
export async function getAllPosts(options = {}) {
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
		if (blogConfig.debug) {
			logger.log('[BlogUtils] Using cached blog posts', `(${ cached.posts.length } posts)`)
		}
		return cached.posts
	}

	logger.log('[BlogUtils] Loading blog posts from disk' + (lang !== 'en' ? ` for language: ${ lang }` : ''))

	// Use the abstracted function to get blog post files
	const posts = getBlogPostFiles()

	const processedPosts = await Promise.all(
		Object.entries(posts).map(async ([ filePath, resolver ]) => {
			const postModule = /** @type {Object} */ (await resolver())

			// Validate basic metadata requirements
			if (!postModule?.metadata?.date) {
				if (blogConfig.debug) {
					logger.warn('[BlogUtils] Skipping post due to missing metadata:', filePath)
				}
				return null
			}

			// Validate date format
			const postDate = new Date(postModule.metadata.date)
			if (isNaN(postDate.getTime())) {
				if (blogConfig.debug) {
					logger.warn('[BlogUtils] Skipping post due to invalid date:', filePath)
				}
				return null
			}

			// Generate URL path components
			const year = postDate.getFullYear()
			const month = (postDate.getMonth() + 1).toString().padStart(2, '0')
			const filename = filePath.split('/').pop().replace('.md', '')
			const slug = postModule.metadata.slug || filename
			const urlPath = `/${ year }/${ month }/${ slug }`

			// Get content and calculate file size if needed
			let content = ''
			// let fileSize = 0
			if (includeContent) {
				content = await getMarkdownContent(filePath)
				// fileSize = content.length
			}

			// Calculate read time with our utility function
			let readTime = 0

			// First check if readTime is already set in metadata
			if (postModule.metadata.readTime) {
				readTime = postModule.metadata.readTime
			} else {
				// Use our utility function to calculate read time
				const post = {
					metadata: { fm: postModule.metadata },
					content: content
				}
				readTime = getPostReadTime(post)
			}

			// Update read time in metadata if needed
			if (!postModule.metadata.readTime) {
				postModule.metadata.readTime = readTime
			}

			// Create the base post object
			// Convert file path to proper import path for dynamic imports
			const importPath = filePath.replace('@blog/', '/src/content/Blog/')

			const basePost = {
				metadata: { fm: postModule.metadata },
				date: postModule.metadata.date,
				urlPath: urlPath,
				path: importPath,
				content: includeContent ? content : '',
				lang: 'en' // Default language
			}

			// Handle localization
			if (includeLocalizedVersions && postModule.metadata.i18n) {
				// Return array with base post and all localizations
				const localizedPosts = Object.keys(postModule.metadata.i18n).map(langCode => ({
					...structuredClone(basePost),
					metadata: {
						fm: {
							...postModule.metadata,
							...postModule.metadata.i18n[langCode],
							i18n: postModule.metadata.i18n // Keep the i18n map
						}
					},
					lang: langCode
				}))

				return [ basePost, ...localizedPosts ]
			} else if (lang !== 'en' && postModule.metadata.i18n?.[lang]) {
				// Return just the requested localization
				return {
					...basePost,
					metadata: {
						fm: {
							...postModule.metadata,
							...postModule.metadata.i18n[lang],
							i18n: postModule.metadata.i18n
						}
					},
					lang
				}
			} else {
				// Return the base post (English or no localization)
				return basePost
			}
		})
	)

	// Flatten any nested arrays from localized versions and filter out nulls
	const flattenedPosts = processedPosts.flat().filter(Boolean)

	// Sort the posts by date in descending order (newest first)
	const sortedPosts = flattenedPosts.sort((a, b) =>
		new Date(b.date).getTime() - new Date(a.date).getTime()
	)

	// Cache the results
	postsCache.set(cacheKey, {
		posts: sortedPosts,
		timestamp: Date.now()
	})

	logger.log('[BlogUtils] Successfully processed', sortedPosts.length, 'blog posts (cached for 5 minutes)')
	return sortedPosts
}

/**
 * Gets popular categories from the blog (dynamically extracted from posts)
 * @param {ProcessedPost[]} [posts] - Optional array of posts to extract from
 * @returns {Promise<string[]>} Array of popular category names
 */
export async function getPopularCategories(posts) {
	if (posts && Array.isArray(posts)) {
		return getAllCategories(posts)
	}

	const allPosts = await getAllPosts().catch(error => {
		if (blogConfig.debug) {
			logger.error('[BlogUtils] Error getting popular categories:', error)
		}
		return []
	})

	return getAllCategories(allPosts)
}

/**
 * Gets popular tags from the blog (dynamically extracted from posts)
 * @param {ProcessedPost[]} [posts] - Optional array of posts to extract from
 * @returns {Promise<string[]>} Array of popular tag names
 */
export async function getPopularTags(posts) {
	if (posts && Array.isArray(posts)) {
		return getAllTags(posts)
	}

	const allPosts = await getAllPosts().catch(error => {
		if (blogConfig.debug) {
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
 * Generates a properly formatted XML document with channel information
 * and individual items for each post, including title, link, description,
 * publication date, author, and categories. Handles proper escaping of all
 * content to ensure valid XML.
 *
 * @param {ProcessedPost[]} posts - Array of blog posts to include in feed
 * @param {Object} options - RSS feed configuration options
 * @param {string} options.siteUrl - Base URL of the site (required)
 * @param {string} [options.feedTitle] - Title of the feed (defaults to blogConfig.name)
 * @param {string} [options.feedDescription] - Description of the feed (defaults to blogConfig.description)
 * @param {string} [options.feedPath] - Path to the feed (defaults to /blog/rss.xml)
 * @param {number} [options.maxItems] - Maximum number of items to include (defaults to 20)
 * @param {string} [options.language] - Feed language code (defaults to 'en')
 * @returns {string} RSS feed XML as a string
 * @throws {Error} If siteUrl is not provided
 */
export function generateRssFeed(posts, options) {
	if (!options?.siteUrl) {
		throw new Error('siteUrl is required to generate RSS feed')
	}

	logger.info(`Generating RSS feed for ${ posts.length } posts`)

	// Default options
	const {
		siteUrl,
		feedTitle = blogConfig.name,
		feedDescription = blogConfig.description,
		feedPath = `${ blogConfig.uri }/rss.xml`,
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
  <link>${ baseUrl }${ blogConfig.uri }</link>
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
			const author = post.metadata.fm.author?.name || blogConfig.name
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
		} catch (error) {
			logger.warn(`Error adding post to RSS feed: ${ error.message }`, post.path)
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
 * Replaces the five predefined entity references in XML:
 * & becomes &amp;
 * < becomes &lt;
 * > becomes &gt;
 * " becomes &quot;
 * ' becomes &apos;
 *
 * @param {string} str - String to escape
 * @returns {string} XML-safe escaped string
 */
function escapeXml(str) {
	if (!str) return ''

	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

/**
 * Generates category XML elements for a post's categories and tags
 * @param {ProcessedPost} post - Blog post
 * @returns {string} Categories XML string to include in the feed item
 */
function getRssCategoriesXml(post) {
	if (!post.metadata?.fm) return ''

	const categories = []

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