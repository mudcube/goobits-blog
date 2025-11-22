/**
 * Blog i18n Hooks
 *
 * Utilities for integrating blog with your i18n solution
 */

import { blogConfig } from '../config.js'

/**
 * Server hook for handling i18n in incoming requests
 * This should be called from your main hooks.server.js handle function
 *
 * @param {Object} event - SvelteKit handle event
 * @param {Function} [handler] - Optional custom i18n handler
 * @returns {Promise<void>}
 *
 * @example
 * // In hooks.server.js
 * import { handleBlogI18n } from '@goobits/blog/i18n'
 *
 * export async function handle({ event, resolve }) {
 *   // Handle blog i18n
 *   await handleBlogI18n(event)
 *
 *   // Your other handlers...
 *
 *   // Resolve the request
 *   return await resolve(event)
 * }
 */
export async function handleBlogI18n(event, handler) {
	// Only run if i18n is enabled and the URL is related to the blog
	// Using startsWith for path-based check instead of includes for better security
	if (blogConfig.i18n?.enabled &&
		event.url.pathname &&
		(event.url.pathname === blogConfig.uri ||
		 event.url.pathname.startsWith(blogConfig.uri + '/'))) {

		// Only call handler if it's actually a function
		if (typeof handler === 'function') {
			try {
				await handler(event)
			} catch (error) {
				// Import logger inline to avoid circular dependencies
				const { createLogger } = await import('../utils/logger.js')
				const logger = createLogger('BlogI18n')
				logger.error('Error in blog i18n handler:', error.message)
				// Don't rethrow to avoid breaking the request flow
			}
		}
	}
}

/**
 * Page server load hook for handling i18n in page server loads
 * @param {Object} event - SvelteKit page server load event
 * @param {Function} [originalLoad] - The original load function if any
 * @returns {Promise<Object>} The load function result with i18n data
 *
 * @example
 * // In +page.server.js
 * import { loadWithBlogI18n } from '@goobits/blog/i18n'
 *
 * export const load = async (event) => {
 *   // Your original load function
 *   const originalLoad = async () => {
 *     return { yourData: 'here' }
 *   }
 *
 *   // Use the i18n-enhanced load function
 *   return await loadWithBlogI18n(event, originalLoad)
 * }
 */
export async function loadWithBlogI18n(event, originalLoad) {
	// Call the original load function if provided and it's a function
	const originalData = (typeof originalLoad === 'function') ?
		await originalLoad(event) : {}

	// Skip if i18n is not enabled
	if (!blogConfig.i18n?.enabled) {
		return originalData
	}

	// Get the language from locals or url
	const lang = event.locals?.lang || blogConfig.i18n.defaultLanguage

	// Return the data with i18n information
	return {
		...originalData,
		i18n: {
			lang,
			supportedLanguages: blogConfig.i18n.supportedLanguages
		}
	}
}

/**
 * Layout server load hook for adding i18n data to layouts
 * Alias for loadWithBlogI18n, typically used in +layout.server.js
 * @type {typeof loadWithBlogI18n}
 */
export const layoutLoadWithBlogI18n = loadWithBlogI18n

export default {
	handleBlogI18n,
	loadWithBlogI18n,
	layoutLoadWithBlogI18n
}