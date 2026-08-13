import { createBlogConfig, type BlogConfig, type BlogConfigInput } from '../config/blogConfig.js'
import type { BlogContentSource } from './blogContentSource.js'
import type { BlogPost, BlogPostReference } from './blogPost.js'
import type { BlogPostPage, BlogQuery, BlogReadContext } from './blogQuery.js'
import { getBlogCategories, getBlogTags, type BlogTaxonomyTerm } from './blogTaxonomy.js'
import { resolveRelatedPosts, type RelatedPostResult } from './resolveRelatedPosts.js'
import { generateBlogRssFeed, type BlogRssOptions } from './rssFeed.js'

export interface BlogEngineOptions {
	config?: BlogConfigInput
	contentSource: BlogContentSource
}

export interface BlogEngine {
	config: BlogConfig
	listPosts(query?: BlogQuery, context?: BlogReadContext): Promise<BlogPostPage>
	getPost(
		reference: BlogPostReference,
		query?: Pick<BlogQuery, 'language' | 'includeContent' | 'includeTranslations' | 'visibility'>,
		context?: BlogReadContext
	): Promise<BlogPost | null>
	getCategories(query?: BlogQuery, context?: BlogReadContext): Promise<BlogTaxonomyTerm[]>
	getTags(query?: BlogQuery, context?: BlogReadContext): Promise<BlogTaxonomyTerm[]>
	getRelatedPosts(
		post: BlogPost,
		options?: { limit?: number; context?: BlogReadContext }
	): Promise<RelatedPostResult[]>
	generateRss(options?: BlogRssOptions): Promise<string>
	invalidate(): void
}

export function createBlogEngine(options: BlogEngineOptions): BlogEngine {
	const config = createBlogConfig(options.config)
	const { contentSource } = options
	const publishedQuery = (query: BlogQuery = {}): BlogQuery => ({
		pageSize: config.pageSize,
		language: config.defaultLanguage,
		...query
	})

	return {
		config,
		listPosts: async (query = {}, context = {}): Promise<BlogPostPage> =>
			await contentSource.listPosts(publishedQuery(query), context),
		getPost: async (reference, query = {}, context = {}): Promise<BlogPost | null> =>
			await contentSource.getPost(reference, {
				language: config.defaultLanguage,
				...query
			}, context),
		getCategories: async (query = {}, context = {}): Promise<BlogTaxonomyTerm[]> => {
			const page = await contentSource.listPosts({ ...publishedQuery(query), page: 1, pageSize: Number.MAX_SAFE_INTEGER }, context)
			return getBlogCategories(page.posts)
		},
		getTags: async (query = {}, context = {}): Promise<BlogTaxonomyTerm[]> => {
			const page = await contentSource.listPosts({ ...publishedQuery(query), page: 1, pageSize: Number.MAX_SAFE_INTEGER }, context)
			return getBlogTags(page.posts)
		},
		getRelatedPosts: async (post, relatedOptions = {}): Promise<RelatedPostResult[]> => {
			const page = await contentSource.listPosts({ page: 1, pageSize: Number.MAX_SAFE_INTEGER }, relatedOptions.context)
			return resolveRelatedPosts(post, page.posts, {
				limit: relatedOptions.limit ?? config.relatedPostsLimit
			})
		},
		generateRss: async (rssOptions = {}): Promise<string> => {
			const page = await contentSource.listPosts({
				page: 1,
				pageSize: rssOptions.limit ?? config.feedLimit,
				visibility: 'published'
			})
			return generateBlogRssFeed(page.posts, config, rssOptions)
		},
		invalidate: (): void => {
			contentSource.invalidate?.()
		}
	}
}
