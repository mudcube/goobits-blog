import type { BlogPost } from './blogPost.js'

export type BlogSort = 'newest' | 'oldest' | 'title'
export type BlogVisibility = 'published' | 'all'

export interface BlogReadContext {
	allowDrafts?: boolean
}

export interface BlogQuery {
	language?: string
	includeContent?: boolean
	includeTranslations?: boolean
	visibility?: BlogVisibility
	search?: string
	category?: string
	tag?: string
	sort?: BlogSort
	page?: number
	pageSize?: number
}

export interface BlogPostPage {
	posts: BlogPost[]
	total: number
	page: number
	pageSize: number
	hasNextPage: boolean
}

export function canReadDrafts(query: BlogQuery, context: BlogReadContext): boolean {
	return query.visibility === 'all' && context.allowDrafts === true
}
