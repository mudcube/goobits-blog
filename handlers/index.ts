/**
 * Blog Route Handlers for SvelteKit
 *
 * Ready-to-use route handlers that can be imported into your SvelteKit routes
 * to quickly set up a blog on any website.
 */

import { getAllPosts, generateRssFeed } from '../utils/index.js'
import {
	loadBlogIndex,
	loadCategory,
	loadTag,
	loadPost,
	generateBlogEntries
} from './routeUtils.js'
import type {
	BlogConfig,
	BlogEntry,
	BlogIndexData,
	CategoryData,
	TagData,
	PostPageData,
	HttpError
} from './routeUtils.js'

/**
 * SvelteKit locals object with optional paraglideLocale
 */
export interface Locals {
	paraglideLocale?: string
	[key: string]: unknown
}

/**
 * SvelteKit route params
 */
export interface RouteParams {
	slug?: string
	[key: string]: string | undefined
}

/**
 * Server load event parameters
 */
export interface ServerLoadEvent {
	params: RouteParams
	locals: Locals
}

/**
 * Request event with URL for handlers
 */
export interface RequestEvent {
	url: URL
}

/**
 * Function to extract language from locals
 */
export type GetLanguageFunction = (locals: Locals) => string

/**
 * Error handler function for RSS feed
 */
export type ErrorHandler = (error: unknown) => Response

/**
 * Options for createBlogIndexHandler
 */
export interface BlogIndexHandlerOptions {
	/** Whether to prerender the page */
	prerender?: boolean
	/** Function to get language from locals */
	getLanguage?: GetLanguageFunction
	/** Blog configuration overrides */
	config?: BlogConfig | null
}

/**
 * Return type for createBlogIndexHandler
 */
export interface BlogIndexHandler {
	prerender: boolean
	load: (event: ServerLoadEvent) => Promise<BlogIndexData>
}

/**
 * Options for createBlogSlugHandler
 */
export interface BlogSlugHandlerOptions {
	/** Whether to prerender pages */
	prerender?: boolean
	/** Trailing slash behavior */
	trailingSlash?: 'always' | 'never' | 'ignore'
	/** Function to get language from locals */
	getLanguage?: GetLanguageFunction
	/** List of supported languages */
	languages?: string[]
	/** Blog configuration overrides */
	config?: BlogConfig | null
}

/**
 * Return type for createBlogSlugHandler
 */
export interface BlogSlugHandler {
	prerender: boolean
	trailingSlash: 'always' | 'never' | 'ignore'
	entries: () => Promise<BlogEntry[]>
	load: (event: ServerLoadEvent) => Promise<BlogIndexData | CategoryData | TagData | PostPageData>
}

/**
 * Options for createRSSFeedHandler
 */
export interface RSSFeedHandlerOptions {
	/** Path to the RSS feed */
	feedPath?: string
	/** Custom error handler */
	errorHandler?: ErrorHandler | null
}

/**
 * Custom error with HTTP status code
 */
function createHttpError(message: string, status: number): HttpError {
	const error = new Error(message) as HttpError
	error.status = status
	return error
}

/**
 * Creates a blog index handler for +page.server.js
 *
 * @example
 * // In your routes/blog/+page.server.js
 * import { createBlogIndexHandler } from '@goobits/blog/handlers'
 * export const { load, prerender } = createBlogIndexHandler()
 *
 * @param options - Configuration options
 * @returns Object with load function and prerender setting
 */
export function createBlogIndexHandler(options: BlogIndexHandlerOptions = {}): BlogIndexHandler {
	const {
		prerender = true,
		getLanguage = (locals: Locals): string => locals?.paraglideLocale || 'en',
		config = null
	} = options

	return {
		prerender,
		load: async ({ params: _params, locals }: ServerLoadEvent): Promise<BlogIndexData> => {
			const lang = getLanguage(locals)
			return await loadBlogIndex(lang, config, { initialLoad: true })
		}
	}
}

/**
 * Creates a blog slug handler for +page.server.js
 * Handles individual posts, categories, and tags
 *
 * @example
 * // In your routes/blog/[...slug]/+page.server.js
 * import { createBlogSlugHandler } from '@goobits/blog/handlers'
 * export const { load, entries, prerender } = createBlogSlugHandler()
 *
 * @param options - Configuration options
 * @returns Object with load, entries functions and settings
 */
export function createBlogSlugHandler(options: BlogSlugHandlerOptions = {}): BlogSlugHandler {
	const {
		prerender = true,
		trailingSlash = 'always',
		getLanguage = (locals: Locals): string => locals?.paraglideLocale || 'en',
		languages = [ 'en' ],
		config = null
	} = options

	return {
		prerender,
		trailingSlash,
		entries: async (): Promise<BlogEntry[]> => await generateBlogEntries(languages, config),
		load: async ({ params, locals }: ServerLoadEvent): Promise<BlogIndexData | CategoryData | TagData | PostPageData> => {
			const { slug } = params
			const lang = getLanguage(locals)

			// Router logic - normalize slug by removing trailing slashes
			const normalizedSlug = slug ? slug.replace(/\/$/, '') : ''
			const routeParts = normalizedSlug ? normalizedSlug.split('/') : []

			// Skip static asset requests (CSS, SCSS, JS, images, etc.)
			if (normalizedSlug.match(/\.(css|scss|js|ts|jsx|tsx|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
				throw createHttpError('Not a blog route', 404)
			}

			if (!normalizedSlug || normalizedSlug === '') {
				return await loadBlogIndex(lang, config)
			}

			if (normalizedSlug.startsWith('category/')) {
				const categorySlug = normalizedSlug.replace('category/', '')
				return await loadCategory(categorySlug, lang, config)
			}

			if (normalizedSlug.startsWith('tag/')) {
				const tagSlug = normalizedSlug.replace('tag/', '')
				return await loadTag(tagSlug, lang, config)
			}

			if (normalizedSlug.match(/^\d{4}\/\d{2}\/.+/)) {
				const [ year, month, postSlug ] = routeParts
				// The regex match ensures these values exist, but we need to satisfy TypeScript
				if (year && month && postSlug) {
					return await loadPost(year, month, postSlug, lang, config)
				}
			}

			// If no pattern matches, throw 404
			throw createHttpError('Blog page not found', 404)
		}
	}
}

/**
 * Creates an RSS feed handler for +server.js
 *
 * @example
 * // In your routes/blog/rss.xml/+server.js
 * import { createRSSFeedHandler } from '@goobits/blog/handlers'
 * export const GET = createRSSFeedHandler()
 *
 * @param options - Configuration options
 * @returns GET handler function
 */
export function createRSSFeedHandler(options: RSSFeedHandlerOptions = {}): (event: RequestEvent) => Promise<Response> {
	const {
		feedPath = '/blog/rss.xml',
		errorHandler = null
	} = options

	return async ({ url }: RequestEvent): Promise<Response> => {
		try {
			const posts = await getAllPosts()

			const feed = generateRssFeed(posts, {
				siteUrl: url.origin,
				feedPath
			})

			return new Response(feed, {
				headers: {
					'Content-Type': 'application/xml',
					'Cache-Control': 'max-age=600, s-maxage=600'
				}
			})
		} catch (error: unknown) {
			if (errorHandler) {
				return errorHandler(error)
			}

			return new Response(
				'<rss version="2.0"><channel><title>Error</title><description>Failed to generate RSS feed</description></channel></rss>',
				{
					status: 500,
					headers: { 'Content-Type': 'application/xml' }
				}
			)
		}
	}
}

export * from './routeUtils.js'
export * from './clientLoad.js'
