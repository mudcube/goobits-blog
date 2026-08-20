import { createBlogConfig, type BlogConfig, type BlogConfigInput } from '../config/blogConfig.js'
import type { BlogContentSource } from './blogContentSource.js'
import type { BlogPost, BlogPostReference } from './blogPost.js'
import type { BlogPostPage, BlogQuery, BlogReadContext } from './blogQuery.js'
import { getBlogCategories, getBlogTags, type BlogTaxonomyTerm } from './blogTaxonomy.js'
import { resolveRelatedPosts, type RelatedPostResult } from './resolveRelatedPosts.js'
import { generateBlogRssFeed, type BlogRssOptions } from './rssFeed.js'

export interface BlogEngineOptions<Context extends BlogReadContext = BlogReadContext> {
	config?: BlogConfigInput
	contentSource: BlogContentSource<Context>
}

export interface BlogEngine<Context extends BlogReadContext = BlogReadContext> {
	config: BlogConfig
	listPosts(query?: BlogQuery, context?: Context): Promise<BlogPostPage>
	getPost(
		reference: BlogPostReference,
		query?: Pick<BlogQuery, 'language' | 'includeContent' | 'includeTranslations' | 'visibility'>,
		context?: Context
	): Promise<BlogPost | null>
	getCategories(query?: BlogQuery, context?: Context): Promise<BlogTaxonomyTerm[]>
	getTags(query?: BlogQuery, context?: Context): Promise<BlogTaxonomyTerm[]>
	getRelatedPosts(
		post: BlogPost,
		options?: { limit?: number; context?: Context }
	): Promise<RelatedPostResult[]>
	generateRss(options?: BlogRssOptions, context?: Context): Promise<string>
	invalidate(): void
}

export function createBlogEngine<Context extends BlogReadContext = BlogReadContext>(
	options: BlogEngineOptions<Context>
): BlogEngine<Context> {
	const config = createBlogConfig(options.config)
	const { contentSource } = options
	const publishedQuery = (query: BlogQuery = {}): BlogQuery => ({
		pageSize: config.pageSize,
		language: config.defaultLanguage,
		...query
	})

	return {
		config,
		listPosts: async (query = {}, context): Promise<BlogPostPage> =>
			await contentSource.listPosts(publishedQuery(query), context),
		getPost: async (reference, query = {}, context): Promise<BlogPost | null> =>
			await contentSource.getPost(
				reference,
				{
					language: config.defaultLanguage,
					...query
				},
				context
			),
		getCategories: async (query = {}, context): Promise<BlogTaxonomyTerm[]> => {
			if (contentSource.getCategories) {
				return await contentSource.getCategories(publishedQuery(query), context)
			}
			const page = await contentSource.listPosts(
				{ ...publishedQuery(query), page: 1, pageSize: Number.MAX_SAFE_INTEGER },
				context
			)
			return getBlogCategories(page.posts)
		},
		getTags: async (query = {}, context): Promise<BlogTaxonomyTerm[]> => {
			if (contentSource.getTags) {
				return await contentSource.getTags(publishedQuery(query), context)
			}
			const page = await contentSource.listPosts(
				{ ...publishedQuery(query), page: 1, pageSize: Number.MAX_SAFE_INTEGER },
				context
			)
			return getBlogTags(page.posts)
		},
		getRelatedPosts: async (post, relatedOptions = {}): Promise<RelatedPostResult[]> => {
			const limit = relatedOptions.limit ?? config.relatedPostsLimit
			if (contentSource.getRelatedPosts) {
				return await contentSource.getRelatedPosts(post, { limit }, relatedOptions.context)
			}
			const page = await contentSource.listPosts(
				{ page: 1, pageSize: Number.MAX_SAFE_INTEGER },
				relatedOptions.context
			)
			return resolveRelatedPosts(post, page.posts, { limit })
		},
		generateRss: async (rssOptions = {}, context): Promise<string> => {
			const page = await contentSource.listPosts(
				{
					page: 1,
					pageSize: rssOptions.limit ?? config.feedLimit,
					visibility: 'published'
				},
				context
			)
			return generateBlogRssFeed(page.posts, config, rssOptions)
		},
		invalidate: (): void => {
			contentSource.invalidate?.()
		}
	}
}
