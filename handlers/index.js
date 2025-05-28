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

/**
 * Creates a blog index handler for +page.server.js
 *
 * @example
 * // In your routes/blog/+page.server.js
 * import { createBlogIndexHandler } from '@goobits/blog/handlers'
 * export const { load, prerender } = createBlogIndexHandler()
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.prerender=true] - Whether to prerender the page
 * @param {Function} [options.getLanguage] - Function to get language from locals
 * @param {Object} [options.config] - Blog configuration overrides
 * @returns {Object} Object with load function and prerender setting
 */
export function createBlogIndexHandler(options = {}) {
	const {
		prerender = true,
		getLanguage = (locals) => locals?.paraglideLocale || 'en',
		config = null
	} = options

	return {
		prerender,
		load: async ({ params: _params, locals }) => {
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
 * @param {Object} options - Configuration options
 * @param {boolean} [options.prerender=true] - Whether to prerender pages
 * @param {string} [options.trailingSlash='always'] - Trailing slash behavior
 * @param {Function} [options.getLanguage] - Function to get language from locals
 * @param {string[]} [options.languages] - List of supported languages
 * @param {Object} [options.config] - Blog configuration overrides
 * @returns {Object} Object with load, entries functions and settings
 */
export function createBlogSlugHandler(options = {}) {
	const {
		prerender = true,
		trailingSlash = 'always',
		getLanguage = (locals) => locals?.paraglideLocale || 'en',
		languages = [ 'en' ],
		config = null
	} = options

	return {
		prerender,
		trailingSlash,
		entries: async () => generateBlogEntries(languages, config),
		load: async ({ params, locals }) => {
			const { slug } = params
			const lang = getLanguage(locals)

			// Router logic - normalize slug by removing trailing slashes
			const normalizedSlug = slug ? slug.replace(/\/$/, '') : ''
			const routeParts = normalizedSlug ? normalizedSlug.split('/') : []

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
				return await loadPost(year, month, postSlug, lang, config)
			}

			// If no pattern matches, throw 404
			const error = new Error('Blog page not found')
			error.status = 404
			throw error
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
 * @param {Object} options - Configuration options
 * @param {string} [options.feedPath='/blog/rss.xml'] - Path to the RSS feed
 * @param {Function} [options.errorHandler] - Custom error handler
 * @returns {Function} GET handler function
 */
export function createRSSFeedHandler(options = {}) {
	const {
		feedPath = '/blog/rss.xml',
		errorHandler = null
	} = options

	return async ({ url }) => {
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
		} catch (error) {
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