import type { BlogPost, BlogPostReference } from './blogPost.js'
import type { BlogPostPage, BlogQuery, BlogReadContext } from './blogQuery.js'
import type { BlogTaxonomyTerm } from './blogTaxonomy.js'
import type { RelatedPostResult, RelatedPostsOptions } from './resolveRelatedPosts.js'

export interface BlogContentSource<Context extends BlogReadContext = BlogReadContext> {
	listPosts(query?: BlogQuery, context?: Context): Promise<BlogPostPage>
	getPost(
		reference: BlogPostReference,
		query?: Pick<BlogQuery, 'language' | 'includeContent' | 'includeTranslations' | 'visibility'>,
		context?: Context
	): Promise<BlogPost | null>
	getCategories?(query?: BlogQuery, context?: Context): Promise<BlogTaxonomyTerm[]>
	getTags?(query?: BlogQuery, context?: Context): Promise<BlogTaxonomyTerm[]>
	getRelatedPosts?(
		post: BlogPost,
		options?: RelatedPostsOptions,
		context?: Context
	): Promise<RelatedPostResult[]>
	invalidate?(): void
}
