/**
 * Blog i18n Hooks
 *
 * Utilities for integrating blog with your i18n solution
 */

import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit'
import { blogConfig } from '../config.js'

/**
 * Handler function type for custom i18n processing
 */
export type I18nHandler = (event: RequestEvent) => Promise<void> | void

/**
 * Load function type for server-side loading
 */
export type LoadFunction<T = Record<string, unknown>> = (event: ServerLoadEvent) => Promise<T> | T

/**
 * Result type from loadWithBlogI18n when i18n is enabled
 */
export interface I18nLoadResult {
	i18n: {
		lang: string
		supportedLanguages: string[]
	}
}

/**
 * Extended App.Locals interface with i18n properties
 */
interface LocalsWithI18n {
	lang?: string
}

/**
 * Server hook for handling i18n in incoming requests
 * This should be called from your main hooks.server.js handle function
 *
 * @param event - SvelteKit handle event
 * @param handler - Optional custom i18n handler
 * @returns Promise that resolves when i18n handling is complete
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
export async function handleBlogI18n(event: RequestEvent, handler?: I18nHandler): Promise<void> {
	const config = blogConfig

	// Only run if i18n is enabled and the URL is related to the blog
	// Using startsWith for path-based check instead of includes for better security
	if (config.i18n?.enabled &&
		event.url.pathname &&
		(event.url.pathname === config.uri ||
		 event.url.pathname.startsWith(`${config.uri}/`))) {

		// Only call handler if it's actually a function
		if (typeof handler === 'function') {
			try {
				await handler(event)
			} catch (error: unknown) {
				// Import logger inline to avoid circular dependencies
				const { createLogger } = await import('../utils/logger.js')
				const logger = createLogger('BlogI18n')
				const errorMessage = error instanceof Error ? error.message : String(error)
				logger.error('Error in blog i18n handler:', errorMessage)
				// Don't rethrow to avoid breaking the request flow
			}
		}
	}
}

/**
 * Page server load hook for handling i18n in page server loads
 * @param event - SvelteKit page server load event
 * @param originalLoad - The original load function if any
 * @returns The load function result with i18n data
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
export async function loadWithBlogI18n<T extends Record<string, unknown>>(
	event: ServerLoadEvent,
	originalLoad?: LoadFunction<T>
): Promise<T | (T & I18nLoadResult)> {
	const config = blogConfig

	// Call the original load function if provided and it's a function
	const originalData: T = (typeof originalLoad === 'function') ?
		await originalLoad(event) : {} as T

	// Skip if i18n is not enabled
	if (!config.i18n?.enabled) {
		return originalData
	}

	// Get the language from locals or url
	const locals = event.locals as LocalsWithI18n
	const lang = locals.lang ?? config.i18n.defaultLanguage

	// Return the data with i18n information
	return {
		...originalData,
		i18n: {
			lang,
			supportedLanguages: config.i18n.supportedLanguages
		}
	}
}

/**
 * Layout server load hook for adding i18n data to layouts
 * Alias for loadWithBlogI18n, typically used in +layout.server.js
 */
export const layoutLoadWithBlogI18n = loadWithBlogI18n

export default {
	handleBlogI18n,
	loadWithBlogI18n,
	layoutLoadWithBlogI18n
}
