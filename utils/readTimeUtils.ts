import { blogConfig } from '../config/index.js'
import { createLogger } from './logger.js'

const logger = createLogger('ReadTimeUtils')

// Module name for error context
const MODULE_NAME = 'ReadTimeUtils'

// Read time configuration interface
export interface ReadTimeConfig {
	wordsPerMinute: number
	defaultTime: number
	minTimeForLongArticle: number
	minTimeForVeryLongArticle: number
	longArticleThreshold: number
	veryLongArticleThreshold: number
	headingsWeight: number
}

// Post frontmatter interface for read time calculation
export interface ReadTimePostMetadata {
	readTime?: number
	excerpt?: string
}

// Post interface for read time calculation
export interface ReadTimePost {
	metadata?: {
		fm?: ReadTimePostMetadata
	}
	content?: string
}

// Default configuration that can be used without dependency on blogConfig
export const DEFAULT_READ_TIME_CONFIG: ReadTimeConfig = {
	wordsPerMinute: 225,
	defaultTime: 3,
	minTimeForLongArticle: 5,
	minTimeForVeryLongArticle: 10,
	longArticleThreshold: 1500, // Word count
	veryLongArticleThreshold: 3000, // Word count
	headingsWeight: 5
}

/**
 * Logs an error and returns it for consistent error handling
 * @param _moduleName - Name of the module for error context
 * @param error - The error to handle
 * @returns The original error
 */
function handleError(_moduleName: string, error: Error): Error {
	logger.error('Error:', error)
	return error
}

// Valid type names for validation
type ValidTypeName = 'string' | 'number' | 'object' | 'array'

/**
 * Validates that a value is of the expected type
 * @param value - The value to validate
 * @param type - Expected type ('string', 'number', 'object', 'array')
 * @param name - Parameter name for error messages
 * @param isOptional - Whether the value can be null/undefined
 * @throws Error If validation fails
 */
function validateType(value: unknown, type: ValidTypeName, name: string, isOptional = true): void {
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

/**
 * Gets the default read time from options, blogConfig, or defaults (in priority order)
 * @param options - Options that may contain defaultTime
 * @returns The default read time in minutes
 */
function getDefaultTime(options: Partial<ReadTimeConfig> = {}): number {
	return options.defaultTime ??
		blogConfig.posts.readTime.defaultTime ??
		DEFAULT_READ_TIME_CONFIG.defaultTime
}

/**
 * Calculates estimated reading time based on word count and content complexity
 *
 * @param content - The text content to analyze
 * @param options - Configuration options
 * @returns Estimated reading time in minutes (rounded up to nearest whole number)
 * @throws Error If content processing fails
 */
export function calculateReadTime(content: string, options: Partial<ReadTimeConfig> = {}): number {
	// Return default time for non-string content
	if (!content || typeof content !== 'string') {
		return getDefaultTime(options)
	}

	try {
		// Merge configuration sources with decreasing priority:
		// 1. Provided options
		// 2. blogConfig (if available)
		// 3. DEFAULT_READ_TIME_CONFIG
		const config: ReadTimeConfig = {
			...DEFAULT_READ_TIME_CONFIG,
			...blogConfig.posts.readTime,
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
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err))
		handleError(MODULE_NAME, error)
		return getDefaultTime(options)
	}
}

/**
 * Calculates estimated reading time from markdown content and frontmatter
 *
 * @param post - The blog post object
 * @param options - Configuration options (see calculateReadTime)
 * @returns Estimated reading time in minutes
 * @throws Error If post object is invalid or processing fails
 */
export function getPostReadTime(post: ReadTimePost | null | undefined, options: Partial<ReadTimeConfig> = {}): number {
	try {
		// If post is null or undefined, return default
		if (post === null || post === undefined) {
			return getDefaultTime(options)
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
			const config: ReadTimeConfig = {
				...DEFAULT_READ_TIME_CONFIG,
				...blogConfig.posts.readTime,
				...options
			}

			return Math.max(
				calculateReadTime(post.metadata.fm.excerpt, options) * 3,
				config.defaultTime
			)
		}

		// Fallback to default time
		return getDefaultTime(options)
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err))
		handleError(MODULE_NAME, error)
		return getDefaultTime(options)
	}
}

export default {
	calculateReadTime,
	getPostReadTime,
	DEFAULT_READ_TIME_CONFIG
}
