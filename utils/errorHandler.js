/**
 * Standardized error handling utilities for @goobits/blog
 */

import { createLogger } from './logger.js'

const logger = createLogger('ErrorHandler')

/**
 * Error types for better error categorization
 */
export const ErrorTypes = {
	// Common error types
	VALIDATION: 'VALIDATION',
	NETWORK: 'NETWORK',
	RATE_LIMIT: 'RATE_LIMIT',
	SERVER: 'SERVER',
	UNKNOWN: 'UNKNOWN',

	// Blog-specific error types
	CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',
	INVALID_METADATA: 'INVALID_METADATA',
	ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
	MARKDOWN_PARSE: 'MARKDOWN_PARSE',
	RSS_GENERATION: 'RSS_GENERATION'
}

/**
 * Standardized error class for blog package
 *
 * @class BlogError
 * @extends Error
 */
export class BlogError extends Error {
	/**
	 * Create a standardized blog error
	 *
	 * @param {string} message - Error message
	 * @param {string} [type=ErrorTypes.UNKNOWN] - Error type from ErrorTypes
	 * @param {Object} [details={}] - Additional error details
	 */
	constructor(message, type = ErrorTypes.UNKNOWN, details = {}) {
		super(message)
		this.name = 'BlogError'
		this.type = type
		this.details = details
		this.timestamp = new Date().toISOString()
	}
}

/**
 * Create standardized error response suitable for API returns
 *
 * @param {Error|string} error - The error to handle
 * @param {string} [type=ErrorTypes.UNKNOWN] - Error type from ErrorTypes
 * @param {Object} [details={}] - Additional error details
 * @returns {Object} Standardized error object
 */
export function createErrorResponse(error, type = ErrorTypes.UNKNOWN, details = {}) {
	const message = error instanceof Error ? error.message : String(error)

	return {
		success: false,
		error: {
			message,
			type,
			details,
			timestamp: new Date().toISOString()
		}
	}
}

/**
 * Handle and log errors consistently
 *
 * @param {Error|string} error - The error to handle
 * @param {string} context - Context where error occurred
 * @param {Object} [metadata={}] - Additional metadata
 * @returns {BlogError} Standardized error instance
 */
export function handleError(error, context, metadata = {}) {
	// Determine error type based on error content
	let errorType = ErrorTypes.UNKNOWN
	const message = error instanceof Error ? error.message : String(error)

	// Categorize error
	if (message.includes('validation') || message.includes('invalid metadata')) {
		errorType = ErrorTypes.VALIDATION
	} else if (message.includes('network') || message.includes('fetch')) {
		errorType = ErrorTypes.NETWORK
	} else if (message.includes('rate') || message.includes('429')) {
		errorType = ErrorTypes.RATE_LIMIT
	} else if (message.includes('server') || message.includes('500')) {
		errorType = ErrorTypes.SERVER
	} else if (message.includes('not found') || message.includes('404')) {
		errorType = ErrorTypes.CONTENT_NOT_FOUND
	} else if (message.includes('metadata')) {
		errorType = ErrorTypes.INVALID_METADATA
	} else if (message.includes('route')) {
		errorType = ErrorTypes.ROUTE_NOT_FOUND
	} else if (message.includes('markdown') || message.includes('parse')) {
		errorType = ErrorTypes.MARKDOWN_PARSE
	} else if (message.includes('rss') || message.includes('feed')) {
		errorType = ErrorTypes.RSS_GENERATION
	}

	// Log error with context
	logger.error(`[${ context }] ${ message }`, { errorType, metadata })

	// Return standardized error
	return new BlogError(message, errorType, metadata)
}

/**
 * Extract user-friendly error message
 *
 * @param {Error|Object} error - The error object
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyMessage(error) {
	if (error instanceof BlogError) {
		switch (error.type) {
		case ErrorTypes.VALIDATION:
			return 'Invalid blog data. Please check the content format.'
		case ErrorTypes.NETWORK:
			return 'Network error. Please check your connection and try again.'
		case ErrorTypes.RATE_LIMIT:
			return 'Too many requests. Please wait a moment and try again.'
		case ErrorTypes.SERVER:
			return 'Server error. Please try again later.'
		case ErrorTypes.CONTENT_NOT_FOUND:
			return 'The requested blog content could not be found.'
		case ErrorTypes.INVALID_METADATA:
			return 'Invalid blog metadata. Please check the frontmatter format.'
		case ErrorTypes.ROUTE_NOT_FOUND:
			return 'Blog page not found. Check the URL and try again.'
		case ErrorTypes.MARKDOWN_PARSE:
			return 'Error parsing blog content. Please check the markdown format.'
		case ErrorTypes.RSS_GENERATION:
			return 'Error generating RSS feed. Please try again later.'
		default:
			return 'An unexpected error occurred with the blog. Please try again.'
		}
	}

	// Fallback for non-standardized errors
	return error?.message || 'An unexpected error occurred with the blog.'
}