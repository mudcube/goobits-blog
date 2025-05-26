import { blogConfig } from '../config.js'
import { createLogger } from './logger.js'

const logger = createLogger('ReadTimeUtils')

// Create simple implementations of these utility functions
function handleError(moduleName, error) {
	logger.error(`Error:`, error)
	return error
}

function validateType(value, type, name, isOptional = true) {
	if (value === undefined || value === null) {
		if (!isOptional) {
			throw new Error(`${ name } is required`)
		}
		return
	}

	const actualType = typeof value
	if (type === 'array') {
		if (!Array.isArray(value)) {
			throw new Error(`${ name } must be an array, got ${ actualType }`)
		}
	} else if (actualType !== type) {
		throw new Error(`${ name } must be a ${ type }, got ${ actualType }`)
	}
}

// Module name for error context
const MODULE_NAME = 'ReadTimeUtils'

// Default configuration that can be used without dependency on blogConfig
export const DEFAULT_READ_TIME_CONFIG = {
	wordsPerMinute: 225,
	defaultTime: 3,
	minTimeForLongArticle: 5,
	minTimeForVeryLongArticle: 10,
	longArticleThreshold: 1500, // Word count
	veryLongArticleThreshold: 3000, // Word count
	headingsWeight: 5
}

/**
 * Calculates estimated reading time based on word count and content complexity
 *
 * @param {string} content - The text content to analyze
 * @param {Object} [options] - Configuration options
 * @param {number} [options.wordsPerMinute=225] - Reading speed in words per minute
 * @param {number} [options.defaultTime=3] - Default read time in minutes if calculation fails
 * @param {number} [options.minTimeForLongArticle=5] - Minimum read time for long articles
 * @param {number} [options.minTimeForVeryLongArticle=10] - Minimum read time for very long articles
 * @param {number} [options.longArticleThreshold=1500] - Word count threshold for long articles
 * @param {number} [options.veryLongArticleThreshold=3000] - Word count threshold for very long articles
 * @param {number} [options.headingsWeight=5] - How many headings equal one minute of reading time
 * @returns {number} Estimated reading time in minutes (rounded up to nearest whole number)
 * @throws {Error} If content processing fails
 */
export function calculateReadTime(content, options = {}) {
	// Return default time for non-string content
	if (!content || typeof content !== 'string') {
		// Use options defaultTime, or fall back to blogConfig if available, or use our own defaults
		return options.defaultTime ||
           (blogConfig?.posts?.readTime?.defaultTime) ||
           DEFAULT_READ_TIME_CONFIG.defaultTime
	}

	try {
		// Merge configuration sources with decreasing priority:
		// 1. Provided options
		// 2. blogConfig (if available)
		// 3. DEFAULT_READ_TIME_CONFIG
		const config = {
			...DEFAULT_READ_TIME_CONFIG,
			...(blogConfig?.posts?.readTime || {}),
			...options
		}

		const {
			wordsPerMinute,
			defaultTime,
			minTimeForLongArticle,
			minTimeForVeryLongArticle,
			longArticleThreshold,
			veryLongArticleThreshold,
			headingsWeight
		} = config

		// Remove HTML tags
		const cleanContent = content.replace(/<[^>]*>/g, '')

		// Count words by splitting on whitespace
		const words = cleanContent.trim().split(/\s+/).filter(Boolean)
		const wordCount = words.length

		// Count headings in markdown content (lines starting with # characters)
		const headingsMatch = content.match(/^#+\s+.+$/gm) || []
		const headingCount = headingsMatch.length

		// Calculate base reading time in minutes
		let readTime = Math.ceil(wordCount / wordsPerMinute)

		// Add time for headings (complex structure increases reading time)
		if (headingCount > 0) {
			readTime += Math.ceil(headingCount / headingsWeight)
		}

		// Adjust for article length
		if (wordCount > veryLongArticleThreshold) {
			readTime = Math.max(readTime, minTimeForVeryLongArticle)
		} else if (wordCount > longArticleThreshold) {
			readTime = Math.max(readTime, minTimeForLongArticle)
		}

		// Ensure minimum reading time
		readTime = Math.max(readTime, defaultTime)

		return readTime
	} catch (error) {
		// Use consistent error handling
		handleError(MODULE_NAME, error)
	}
}

/**
 * Calculates estimated reading time from markdown content and frontmatter
 *
 * @param {Object} post - The blog post object
 * @param {Object} [post.metadata] - Post metadata
 * @param {Object} [post.metadata.fm] - Frontmatter metadata
 * @param {number} [post.metadata.fm.readTime] - Explicitly set reading time in minutes
 * @param {string} [post.content] - Markdown content
 * @param {Object} [options] - Configuration options (see calculateReadTime)
 * @returns {number} Estimated reading time in minutes
 * @throws {Error} If post object is invalid or processing fails
 */
export function getPostReadTime(post, options = {}) {
	try {
		// If post is null or undefined, return default
		if (post === null || post === undefined) {
			const defaultTime = options.defaultTime ||
                        (blogConfig?.posts?.readTime?.defaultTime) ||
                        DEFAULT_READ_TIME_CONFIG.defaultTime
			return defaultTime
		}

		// Validate post is an object if provided
		validateType(post, 'object', 'post', false)

		// If readTime is explicitly set in metadata, use that
		if (post?.metadata?.fm?.readTime) {
			return post.metadata.fm.readTime
		}

		// If we have content, calculate read time
		if (post?.content) {
			return calculateReadTime(post.content, options)
		}

		// If we have an excerpt, use that to estimate (multiply by 3 for approximation)
		if (post?.metadata?.fm?.excerpt) {
			const config = {
				...DEFAULT_READ_TIME_CONFIG,
				...(blogConfig?.posts?.readTime || {}),
				...options
			}

			return Math.max(
				calculateReadTime(post.metadata.fm.excerpt, options) * 3,
				config.defaultTime
			)
		}

		// Fallback to default time
		const defaultTime = options.defaultTime ||
                     (blogConfig?.posts?.readTime?.defaultTime) ||
                     DEFAULT_READ_TIME_CONFIG.defaultTime
		return defaultTime
	} catch (error) {
		// Use consistent error handling
		handleError(MODULE_NAME, error)
	}
}

export default {
	calculateReadTime,
	getPostReadTime,
	DEFAULT_READ_TIME_CONFIG
}