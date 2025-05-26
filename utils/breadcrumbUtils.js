/**
 * Utility functions for generating breadcrumb navigation in the blog
 */

import { blogConfig } from '../config.js'
import { getCategoryUrl } from './blogUtils.js'

/**
 * Generate breadcrumb configuration based on page data
 *
 * @param {Object} data - Page data from SvelteKit load function
 * @param {string} data.pageType - Type of page ('index', 'post', 'category', 'tag')
 * @param {Object} [data.post] - Current post data for post pages
 * @param {string} [data.category] - Current category slug for category pages
 * @param {string} [data.categoryName] - Current category display name
 * @param {string} [data.tag] - Current tag slug for tag pages
 * @param {string} [data.tagName] - Current tag display name
 * @returns {Object} Breadcrumb configuration for the Breadcrumbs component
 */
export function generateBreadcrumbs(data) {
	// Default configuration
	const breadcrumbConfig = {
		items: [],
		current: '',
		showHome: true
	}

	if (!data) return breadcrumbConfig

	// Handle different page types
	switch(data.pageType) {
	case 'index':
		// For blog index, just use the blog title
		breadcrumbConfig.current = blogConfig.name || 'Blog'
		break

	case 'post':
		// For posts, add blog link and use post title
		if (data.post) {
			breadcrumbConfig.items = [
				{ href: blogConfig.uri, label: blogConfig.name || 'Blog' }
			]

			// If post has a category, add it to the breadcrumb path
			if (data.post.metadata?.fm?.category) {
				const category = data.post.metadata.fm.category
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
			breadcrumbConfig.current = data.post.metadata?.fm?.title || 'Post'
		}
		break

	case 'category':
		// For category pages, add blog link and use category name
		if (data.category) {
			breadcrumbConfig.items = [
				{ href: blogConfig.uri, label: blogConfig.name || 'Blog' }
			]
			breadcrumbConfig.current = data.categoryName || data.category
		}
		break

	case 'tag':
		// For tag pages, add blog link and use tag name
		if (data.tag) {
			breadcrumbConfig.items = [
				{ href: blogConfig.uri, label: blogConfig.name || 'Blog' }
			]
			breadcrumbConfig.current = data.tagName || data.tag
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