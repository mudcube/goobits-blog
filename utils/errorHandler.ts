/**
 * Standardized error handling utilities for @goobits/blog
 */

import { createLogger } from './logger.js'

const logger = createLogger('ErrorHandler')

// Error type values
export type ErrorTypeValue =
	| 'VALIDATION'
	| 'NETWORK'
	| 'RATE_LIMIT'
	| 'SERVER'
	| 'UNKNOWN'
	| 'CONTENT_NOT_FOUND'
	| 'INVALID_METADATA'
	| 'ROUTE_NOT_FOUND'
	| 'MARKDOWN_PARSE'
	| 'RSS_GENERATION'

/**
 * Error types for better error categorization
 */
export const ErrorTypes = {
	// Common error types
	VALIDATION: 'VALIDATION' as const,
	NETWORK: 'NETWORK' as const,
	RATE_LIMIT: 'RATE_LIMIT' as const,
	SERVER: 'SERVER' as const,
	UNKNOWN: 'UNKNOWN' as const,

	// Blog-specific error types
	CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND' as const,
	INVALID_METADATA: 'INVALID_METADATA' as const,
	ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND' as const,
	MARKDOWN_PARSE: 'MARKDOWN_PARSE' as const,
	RSS_GENERATION: 'RSS_GENERATION' as const
} as const

// Error details type
export interface ErrorDetails {
	[key: string]: unknown
}

// Error response type
export interface ErrorResponse {
	success: false
	error: {
		message: string
		type: ErrorTypeValue
		details: ErrorDetails
		timestamp: string
	}
}

/**
 * Standardized error class for blog package
 */
export class BlogError extends Error {
	public readonly type: ErrorTypeValue
	public readonly details: ErrorDetails
	public readonly timestamp: string

	/**
	 * Create a standardized blog error
	 *
	 * @param message - Error message
	 * @param type - Error type from ErrorTypes
	 * @param details - Additional error details
	 */
	constructor(message: string, type: ErrorTypeValue = 'UNKNOWN', details: ErrorDetails = {}) {
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
 * @param error - The error to handle
 * @param type - Error type from ErrorTypes
 * @param details - Additional error details
 * @returns Standardized error object
 */
export function createErrorResponse(
	error: Error | string,
	type: ErrorTypeValue = 'UNKNOWN',
	details: ErrorDetails = {}
): ErrorResponse {
	const message = error instanceof Error ? error.message : error

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
 * @param error - The error to handle
 * @param context - Context where error occurred
 * @param metadata - Additional metadata
 * @returns Standardized error instance
 */
export function handleError(error: Error | string, context: string, metadata: ErrorDetails = {}): BlogError {
	// Determine error type based on error content
	let errorType: ErrorTypeValue = 'UNKNOWN'
	const message = error instanceof Error ? error.message : error

	// Categorize error
	if (message.includes('validation') || message.includes('invalid metadata')) {
		errorType = 'VALIDATION'
	} else if (message.includes('network') || message.includes('fetch')) {
		errorType = 'NETWORK'
	} else if (message.includes('rate') || message.includes('429')) {
		errorType = 'RATE_LIMIT'
	} else if (message.includes('server') || message.includes('500')) {
		errorType = 'SERVER'
	} else if (message.includes('not found') || message.includes('404')) {
		errorType = 'CONTENT_NOT_FOUND'
	} else if (message.includes('metadata')) {
		errorType = 'INVALID_METADATA'
	} else if (message.includes('route')) {
		errorType = 'ROUTE_NOT_FOUND'
	} else if (message.includes('markdown') || message.includes('parse')) {
		errorType = 'MARKDOWN_PARSE'
	} else if (message.includes('rss') || message.includes('feed')) {
		errorType = 'RSS_GENERATION'
	}

	// Log error with context
	logger.error(`[${ context }] ${ message }`, { errorType, metadata })

	// Return standardized error
	return new BlogError(message, errorType, metadata)
}

/**
 * Extract user-friendly error message
 *
 * @param error - The error object
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(error: Error | BlogError | { message?: string }): string {
	if (error instanceof BlogError) {
		switch (error.type) {
		case 'VALIDATION':
			return 'Invalid blog data. Please check the content format.'
		case 'NETWORK':
			return 'Network error. Please check your connection and try again.'
		case 'RATE_LIMIT':
			return 'Too many requests. Please wait a moment and try again.'
		case 'SERVER':
			return 'Server error. Please try again later.'
		case 'CONTENT_NOT_FOUND':
			return 'The requested blog content could not be found.'
		case 'INVALID_METADATA':
			return 'Invalid blog metadata. Please check the frontmatter format.'
		case 'ROUTE_NOT_FOUND':
			return 'Blog page not found. Check the URL and try again.'
		case 'MARKDOWN_PARSE':
			return 'Error parsing blog content. Please check the markdown format.'
		case 'RSS_GENERATION':
			return 'Error generating RSS feed. Please try again later.'
		default:
			return 'An unexpected error occurred with the blog. Please try again.'
		}
	}

	// Fallback for non-standardized errors
	return error?.message || 'An unexpected error occurred with the blog.'
}
