import type { BlogPost } from '../core/blogPost.js'

export interface BlogPageServerData {
	pageType: 'index' | 'category' | 'tag' | 'post'
	post?: BlogPost
}

export interface BlogPageLoadResult extends BlogPageServerData {
	postContent: unknown
}

export interface BlogPageLoadOptions {
	loadPostContent?: (sourcePath: string, data: BlogPageServerData) => Promise<unknown>
	onError?: (error: unknown) => void
}

export function createBlogPageLoad(
	options: BlogPageLoadOptions = {}
): (params: { data: BlogPageServerData }) => Promise<BlogPageLoadResult> {
	return async ({ data }): Promise<BlogPageLoadResult> => {
		let postContent: unknown = null
		if (data.pageType === 'post' && data.post?.sourcePath && options.loadPostContent) {
			try {
				postContent = await options.loadPostContent(data.post.sourcePath, data)
			} catch (error) {
				options.onError?.(error)
			}
		}

		return { ...data, postContent }
	}
}
