/**
 * Client-side load utilities for blog pages
 */

// Use console for logging within the package
const logger = console

/**
 * Creates a client-side load function for blog pages
 * Handles dynamic content loading for blog posts
 *
 * @example
 * // In your blog/[...slug]/+page.js
 * import { createBlogPageLoad } from '@goobits/blog/handlers'
 * export const load = createBlogPageLoad()
 *
 * @param {Object} options - Configuration options
 * @param {Function} [options.logger] - Logger function
 * @returns {Function} Page load function
 */
export function createBlogPageLoad(options = {}) {
	const { logger: customLogger } = options
	const log = customLogger || logger

	return async function load({ data }) {
		// If this is a blog post, try to load the content
		let postContent = null

		if (data.pageType === 'post' && data.post?.path) {
			log.log('[ClientLoad] Attempting to load blog post content from path:', data.post.path)
			try {
				// Dynamic import of the blog post content
				const module = await import(/* @vite-ignore */ data.post.path)
				if (module && module.default) {
					postContent = module.default
					log.log('[ClientLoad] Successfully loaded blog post content')
				} else {
					log.log('[ClientLoad] Module imported but no default export found')
				}
			} catch (error) {
				log.error('[ClientLoad] Error loading blog post content during prerendering:', error)
			}
		} else {
			log.log('[ClientLoad] Not a post page or missing path:', {
				pageType: data.pageType,
				hasPost: !!data.post,
				hasPath: !!data.post?.path
			})
		}

		// Return the server data plus any loaded content components
		return {
			...data,
			postContent
		}
	}
}