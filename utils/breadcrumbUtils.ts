/**
 * Utility functions for generating breadcrumb navigation in the blog
 */

import { blogConfig } from '../config/index.js'
import { getCategoryUrl } from './blogUtils.js'

// Post metadata for breadcrumbs
interface BreadcrumbPostMetadata {
	title?: string
	category?: string
	categories?: string[]
}

// Post type for breadcrumbs
interface BreadcrumbPost {
	metadata?: {
		fm?: BreadcrumbPostMetadata
	}
}

// Breadcrumb item interface
export interface BreadcrumbItem {
	href: string
	label: string
}

// Breadcrumb configuration interface
export interface BreadcrumbConfig {
	items: BreadcrumbItem[]
	current: string
	showHome: boolean
}

// Page type for breadcrumb generation
export type PageType = 'index' | 'post' | 'category' | 'tag'

// Page data interface for breadcrumb generation
export interface BreadcrumbPageData {
	pageType: PageType
	post?: BreadcrumbPost
	category?: string
	categoryName?: string
	tag?: string
	tagName?: string
}

/**
 * Generate breadcrumb configuration based on page data
 *
 * @param data - Page data from SvelteKit load function
 * @returns Breadcrumb configuration for the Breadcrumbs component
 */
export function generateBreadcrumbs(data: BreadcrumbPageData | null | undefined): BreadcrumbConfig {
	const { name, uri } = blogConfig

	// Default configuration
	const breadcrumbConfig: BreadcrumbConfig = {
		items: [],
		current: '',
		showHome: true
	}

	if (!data) { return breadcrumbConfig }

	// Handle different page types
	switch (data.pageType) {
	case 'index':
		// For blog index, just use the blog title
		breadcrumbConfig.current = name
		break

	case 'post':
		// For posts, add blog link and use post title
		if (data.post) {
			breadcrumbConfig.items = [
				{ href: uri, label: name }
			]

			// If post has a category, add it to the breadcrumb path
			if (data.post.metadata?.fm?.category) {
				const { category } = data.post.metadata.fm
				breadcrumbConfig.items.push({
					href: getCategoryUrl(category, false),
					label: category
				})
			} else if (data.post.metadata?.fm?.categories?.[0]) {
				const category = data.post.metadata.fm.categories[0]
				breadcrumbConfig.items.push({
					href: getCategoryUrl(category, false),
					label: category
				})
			}

			// Use post title as current
			breadcrumbConfig.current = data.post.metadata?.fm?.title ?? 'Post'
		}
		break

	case 'category':
		// For category pages, add blog link and use category name
		if (data.category) {
			breadcrumbConfig.items = [
				{ href: uri, label: name }
			]
			breadcrumbConfig.current = data.categoryName ?? data.category
		}
		break

	case 'tag':
		// For tag pages, add blog link and use tag name
		if (data.tag) {
			breadcrumbConfig.items = [
				{ href: uri, label: name }
			]
			breadcrumbConfig.current = data.tagName ?? data.tag
		}
		break

	default:
		// Unknown page type
		breadcrumbConfig.current = 'Blog'
	}

	return breadcrumbConfig
}

export default {
	generateBreadcrumbs
}
