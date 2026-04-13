/**
 * Client-side load utilities for blog pages
 */

/**
 * Logger interface for consistent logging across the package
 */
export interface Logger {
	log: (...args: unknown[]) => void
	error: (...args: unknown[]) => void
	warn?: (...args: unknown[]) => void
	info?: (...args: unknown[]) => void
}

/**
 * Options for createBlogPageLoad
 */
export interface BlogPageLoadOptions {
	/** Custom logger function */
	logger?: Logger
}

/**
 * Post data from server load
 */
export interface PostData {
	path?: string
	[key: string]: unknown
}

/**
 * Data passed from the server load function
 */
export interface ServerLoadData {
	pageType: 'index' | 'category' | 'tag' | 'post'
	post?: PostData
	[key: string]: unknown
}

/**
 * Return type from the client load function
 */
export interface ClientLoadResult extends ServerLoadData {
	postContent: unknown
}

/**
 * Parameters passed to the client load function
 */
export interface ClientLoadParams {
	data: ServerLoadData
}

// Use console for logging within the package
const logger: Logger = console

/**
 * Creates a client-side load function for blog pages
 * Handles dynamic content loading for blog posts
 *
 * @example
 * // In your blog/[...slug]/+page.js
 * import { createBlogPageLoad } from '@goobits/blog/handlers'
 * export const load = createBlogPageLoad()
 *
 * @param options - Configuration options
 * @returns Page load function
 */
export function createBlogPageLoad(options: BlogPageLoadOptions = {}): (params: ClientLoadParams) => Promise<ClientLoadResult> {
	const { logger: customLogger } = options
	const log = customLogger || logger

	return async function load({ data }: ClientLoadParams): Promise<ClientLoadResult> {
		// If this is a blog post, try to load the content
		let postContent: unknown = null

		if (data.pageType === 'post' && data.post?.path) {
			log.log('[ClientLoad] Attempting to load blog post content from path:', data.post.path)
			try {
				// Dynamic import of the blog post content
				const module: unknown = await import(/* @vite-ignore */ data.post.path)
				const moduleObj = module as { default?: unknown } | null | undefined
				if (moduleObj?.default !== undefined) {
					postContent = moduleObj.default
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
				hasPost: Boolean(data.post),
				hasPath: Boolean(data.post?.path)
			})
		}

		// Return the server data plus any loaded content components
		return {
			...data,
			postContent
		}
	}
}
