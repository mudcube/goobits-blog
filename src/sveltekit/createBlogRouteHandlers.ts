import type { BlogEngine } from '../core/createBlogEngine.js'
import type { BlogPost } from '../core/blogPost.js'
import type { BlogQuery, BlogReadContext, BlogSort } from '../core/blogQuery.js'
import type { RelatedPostResult } from '../core/resolveRelatedPosts.js'
import type { BlogTaxonomyTerm } from '../core/blogTaxonomy.js'
import { slugify } from '../core/blogUrls.js'
import { generateBlogEntries, type BlogEntry } from './generateBlogEntries.js'

export interface BlogRouteEvent {
	params: Record<string, string | undefined>
	locals: Record<string, unknown>
	url: URL
}

interface BlogListData {
	posts: BlogPost[]
	totalPosts: number
	hasMorePosts: boolean
	categories: BlogTaxonomyTerm[]
	tags: BlogTaxonomyTerm[]
	lang: string
	page: number
	pageSize: number
	search: string
	sort: BlogSort
}

export interface BlogIndexData extends BlogListData {
	pageType: 'index'
}

export interface BlogTaxonomyData extends BlogListData {
	pageType: 'category' | 'tag'
	term: string
}

export interface BlogPostData {
	pageType: 'post'
	post: BlogPost
	relatedPosts: RelatedPostResult[]
	lang: string
}

export type BlogRouteData = BlogIndexData | BlogTaxonomyData | BlogPostData

export class BlogRouteError extends Error {
	readonly status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'BlogRouteError'
		this.status = status
	}
}

export interface BlogRouteHandlersOptions<Context extends BlogReadContext = BlogReadContext> {
	engine: BlogEngine<Context>
	getLanguage?: (event: BlogRouteEvent) => string
	getReadContext?: (event: BlogRouteEvent) => Context
	prerender?: boolean
	trailingSlash?: 'always' | 'never' | 'ignore'
}

export interface BlogRouteHandlers {
	prerender: boolean
	trailingSlash: 'always' | 'never' | 'ignore'
	loadIndex(event: BlogRouteEvent): Promise<BlogIndexData>
	loadRoute(event: BlogRouteEvent): Promise<BlogRouteData>
	entries(): Promise<BlogEntry[]>
	GET(event: BlogRouteEvent): Promise<Response>
}

function normalizeSlug(slug: string | undefined): string {
	return (slug ?? '').replace(/^\/+|\/+$/g, '')
}

function isStaticAsset(slug: string): boolean {
	return /\.(css|scss|js|ts|jsx|tsx|png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|eot|mp3|mp4|pdf)$/i.test(slug)
}

function readListQuery(event: BlogRouteEvent, pageSize: number): Required<Pick<BlogQuery, 'page' | 'pageSize' | 'search' | 'sort'>> {
	const requestedPage = Number(event.url.searchParams.get('page') ?? 1)
	const sortValue = event.url.searchParams.get('sort')
	const sort: BlogSort = sortValue === 'oldest' || sortValue === 'title' ? sortValue : 'newest'
	return {
		page: Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1,
		pageSize,
		search: event.url.searchParams.get('q')?.trim() ?? '',
		sort
	}
}

export function createBlogRouteHandlers<Context extends BlogReadContext = BlogReadContext>(
	options: BlogRouteHandlersOptions<Context>
): BlogRouteHandlers {
	const { engine } = options
	const getLanguage = options.getLanguage ?? (() => engine.config.defaultLanguage)

	const loadIndex = async (event: BlogRouteEvent): Promise<BlogIndexData> => {
		const lang = getLanguage(event)
		const context = options.getReadContext?.(event)
		const query = readListQuery(event, engine.config.pageSize)
		const visibility = context?.allowDrafts === true ? 'all' : 'published'
		const [ page, categories, tags ] = await Promise.all([
			engine.listPosts({ language: lang, ...query, visibility }, context),
			engine.getCategories({ language: lang, visibility }, context),
			engine.getTags({ language: lang, visibility }, context)
		])
		return {
			pageType: 'index',
			posts: page.posts,
			totalPosts: page.total,
			hasMorePosts: page.hasNextPage,
			categories,
			tags,
			lang,
			page: page.page,
			pageSize: page.pageSize,
			search: query.search,
			sort: query.sort
		}
	}

	const loadTaxonomy = async (
		event: BlogRouteEvent,
		pageType: 'category' | 'tag',
		term: string
	): Promise<BlogTaxonomyData> => {
		const lang = getLanguage(event)
		const context = options.getReadContext?.(event)
		const query = readListQuery(event, engine.config.pageSize)
		const visibility = context?.allowDrafts === true ? 'all' : 'published'
		const [ page, categories, tags ] = await Promise.all([
			engine.listPosts({
				language: lang,
				...query,
				visibility,
				...(pageType === 'category' ? { category: term } : { tag: term })
			}, context),
			engine.getCategories({ language: lang, visibility }, context),
			engine.getTags({ language: lang, visibility }, context)
		])
		const taxonomy = pageType === 'category' ? categories : tags
		if (!taxonomy.some(item => item.slug === slugify(term))) {
			throw new BlogRouteError(404, `${ pageType } "${ term }" was not found`)
		}
		return {
			pageType,
			term,
			posts: page.posts,
			totalPosts: page.total,
			hasMorePosts: page.hasNextPage,
			categories,
			tags,
			lang,
			page: page.page,
			pageSize: page.pageSize,
			search: query.search,
			sort: query.sort
		}
	}

	return {
		prerender: options.prerender ?? true,
		trailingSlash: options.trailingSlash ?? 'always',
		loadIndex,
		loadRoute: async (event): Promise<BlogRouteData> => {
			const slug = normalizeSlug(event.params['slug'])
			if (!slug) {
				return await loadIndex(event)
			}
			if (isStaticAsset(slug)) {
				throw new BlogRouteError(404, 'Not a blog route')
			}
			if (slug.startsWith('category/')) {
				return await loadTaxonomy(event, 'category', slug.slice('category/'.length))
			}
			if (slug.startsWith('tag/')) {
				return await loadTaxonomy(event, 'tag', slug.slice('tag/'.length))
			}

			const lang = getLanguage(event)
			const context = options.getReadContext?.(event)
			const mountedPath = `${ engine.config.basePath }/${ slug }`.replace(/\/{2,}/g, '/')
			const post = await engine.getPost(mountedPath, {
				language: lang,
				visibility: context?.allowDrafts === true ? 'all' : 'published'
			}, context)
			if (!post) {
				throw new BlogRouteError(404, 'Blog post was not found')
			}
			const relatedPosts = await engine.getRelatedPosts(post, context ? { context } : {})
			return { pageType: 'post', post, relatedPosts, lang }
		},
		entries: async (): Promise<BlogEntry[]> => await generateBlogEntries(engine),
		GET: async (event): Promise<Response> => {
			try {
				const context = options.getReadContext?.(event)
				const xml = await engine.generateRss({
					siteUrl: engine.config.canonicalOrigin ?? event.url.origin
				}, context)
				return new Response(xml, {
					headers: {
						'Content-Type': 'application/xml; charset=utf-8',
						'Cache-Control': 'max-age=600, s-maxage=600'
					}
				})
			} catch {
				return new Response('Failed to generate RSS feed', { status: 500 })
			}
		}
	}
}
