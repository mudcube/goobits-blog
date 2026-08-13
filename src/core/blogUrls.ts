import type { BlogConfig } from '../config/blogConfig.js'
import type { BlogPost } from './blogPost.js'

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
	type: 'category' | 'tag',
	slug: string,
	config: BlogConfig
): string {
	return ensurePath(`${ config.basePath }/${ type }/${ slug }`)
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
