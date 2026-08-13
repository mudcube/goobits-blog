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
	/** Custom post-content resolver for host apps with non-standard content locations */
	loadPostContent?: (params: LoadPostContentParams) => Promise<unknown>
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

export interface LoadPostContentParams {
	path: string
	data: ServerLoadData
	logger: Logger
}

// Use console for logging within the package
const logger: Logger = console

async function defaultLoadPostContent({ path }: LoadPostContentParams): Promise<unknown> {
	const module: unknown = await import(/* @vite-ignore */ path)
	const moduleObj = module as { default?: unknown } | null | undefined
	return moduleObj?.default ?? null
}

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
	const { logger: customLogger, loadPostContent = defaultLoadPostContent } = options
	const log = customLogger || logger

	return async function load({ data }: ClientLoadParams): Promise<ClientLoadResult> {
		// If this is a blog post, try to load the content. The server load has already
		// supplied metadata; this enhances with the rendered component when available
		// and falls back to null on error so the page can still render.
		let postContent: unknown = null

		if (data.pageType === 'post' && data.post?.path) {
			log.log('[ClientLoad] Attempting to load blog post content from path:', data.post.path)
			try {
				postContent = await loadPostContent({
					path: data.post.path,
					data,
					logger: log
				})
				if (postContent !== null && postContent !== undefined) {
					log.log('[ClientLoad] Successfully loaded blog post content')
				} else {
					log.log('[ClientLoad] Post content loader returned no content')
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
