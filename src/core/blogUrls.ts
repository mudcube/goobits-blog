import type { BlogConfig } from '../config/blogConfig.js'
import type { BlogAuthor, BlogPost } from './blogPost.js'

export type BlogTaxonomyType = 'category' | 'tag'

export interface BlogUrlResolver {
	blog(config: BlogConfig): string
	post(post: BlogPost, config: BlogConfig): string
	taxonomy(type: BlogTaxonomyType, slug: string, config: BlogConfig): string
	feed(config: BlogConfig): string
	author(author: BlogAuthor, config: BlogConfig): string | null
}

export type BlogUrlResolverInput = Partial<BlogUrlResolver>

function ensurePath(path: string): string {
	return `/${ path.replace(/^\/+/, '').replace(/\/{2,}/g, '/') }`
}

export function getBlogUrl(config: BlogConfig): string {
	return config.basePath || '/'
}

export function getBlogPostUrl(post: BlogPost, config?: BlogConfig): string {
	const path = ensurePath(post.urlPath)
	if (!config?.basePath || path === config.basePath || path.startsWith(`${ config.basePath }/`)) {
		return path
	}

	return ensurePath(`${ config.basePath }/${ path }`)
}

export function getBlogTaxonomyUrl(
	type: BlogTaxonomyType,
	slug: string,
	config: BlogConfig
): string {
	return ensurePath(`${ config.basePath }/${ type }/${ slug }`)
}

export function getBlogFeedUrl(config: BlogConfig): string {
	return config.feedPath
}

export function getBlogAuthorUrl(author: BlogAuthor, _config: BlogConfig): string | null {
	return author.url ?? null
}

const defaultBlogUrlResolver: BlogUrlResolver = {
	blog: getBlogUrl,
	post: getBlogPostUrl,
	taxonomy: getBlogTaxonomyUrl,
	feed: getBlogFeedUrl,
	author: getBlogAuthorUrl
}

export function createBlogUrlResolver(input: BlogUrlResolverInput = {}): BlogUrlResolver {
	return { ...defaultBlogUrlResolver, ...input }
}

export function getCanonicalBlogUrl(path: string, config: BlogConfig): string | null {
	if (!config.canonicalOrigin) {
		return null
	}

	return `${ config.canonicalOrigin }${ ensurePath(path) }`
}

export function slugify(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/&/g, ' and ')
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/-{2,}/g, '-')
		.replace(/^-+|-+$/g, '')
}
