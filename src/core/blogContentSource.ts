import type { BlogPost, BlogPostReference } from './blogPost.js'
import type { BlogPostPage, BlogQuery, BlogReadContext } from './blogQuery.js'

export interface BlogContentSource {
	listPosts(query?: BlogQuery, context?: BlogReadContext): Promise<BlogPostPage>
	getPost(
		reference: BlogPostReference,
		query?: Pick<BlogQuery, 'language' | 'includeContent' | 'includeTranslations' | 'visibility'>,
		context?: BlogReadContext
	): Promise<BlogPost | null>
	invalidate?(): void
}
