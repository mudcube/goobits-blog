/**
 * Blog Route Utilities
 *
 * Helper functions for loading blog content in different contexts
 */

import {
	getAllPosts,
	slugify,
	filterPostsByCategory,
	filterPostsByTag,
	getPostCategories,
	getPostTags,
	getOriginalTaxonomyName,
	loadCategoryDescriptions
} from '../utils/blogUtils.js'
import { getBlogConfig } from '../config/index.js'

/**
 * Loads data for the main blog index page
 * @param {string} lang - The language code for which to load the index
 * @param {Object} config - Blog configuration
 * @param {Object} options - Additional options
 * @param {boolean} options.initialLoad - If true, only return first batch for SSR
 * @returns {Promise<object>} An object containing page data
 */
export async function loadBlogIndex(lang, config = null, options = {}) {
	const finalConfig = config || getBlogConfig()
	const { initialLoad = false } = options

	const allPosts = await getAllPosts({
		lang,
		includeContent: false,
		config: finalConfig
	})

	// If this is the initial SSR load, only return the first batch
	const posts = initialLoad
		? allPosts.slice(0, finalConfig.pagination?.postsPerBatch || 6)
		: allPosts

	// Calculate total count for pagination info
	const totalPosts = allPosts.length
	const postsPerBatch = finalConfig.pagination?.postsPerBatch || 6
	const hasMorePosts = totalPosts > postsPerBatch

	return {
		pageType: 'index',
		posts,
		allPosts, // Always send allPosts for sidebar categories/tags calculation
		totalPosts,
		hasMorePosts,
		lang
		// Don't include config in returned data to avoid serialization issues
	}
}

/**
 * Loads data for a specific category page
 * @param {string} categorySlugParam - The slug of the category
 * @param {string} lang - The language code
 * @param {Object} config - Blog configuration
 * @returns {Promise<object>} An object containing page data for the category
 * @throws {Error} If the category slug is not specified or not found
 */
export async function loadCategory(categorySlugParam, lang, config = null) {
	const finalConfig = config || getBlogConfig()
	if (!categorySlugParam) {
		const error = new Error('Category not specified')
		error.status = 404
		throw error
	}

	const slug = categorySlugParam.replace(/\/$/, '')
	const allPosts = await getAllPosts({ lang, config: finalConfig })
	const categoryDescriptions = await loadCategoryDescriptions(lang, finalConfig)
	const slugLowerCase = slug.toLowerCase()
	const categoryInfo = categoryDescriptions[slugLowerCase] || {}
	const posts = filterPostsByCategory(allPosts, slugLowerCase, slugify)
	const originalCategory = getOriginalTaxonomyName(
		allPosts,
		getPostCategories,
		slugLowerCase,
		slugify
	)

	if (posts.length === 0 && !originalCategory) {
		const error = new Error(`Category "${ slug }" not found or has no posts`)
		error.status = 404
		throw error
	}

	return {
		pageType: 'category',
		posts,
		allPosts,
		category: originalCategory || slug,
		currentCategory: originalCategory || slug,
		categoryDescription: categoryInfo.description || null,
		categoryImage: categoryInfo.image || null,
		categoryImageAlt: categoryInfo.alt || null,
		lang
	}
}

/**
 * Loads data for a specific tag page
 * @param {string} tagSlugParam - The slug of the tag
 * @param {string} lang - The language code
 * @param {Object} config - Blog configuration
 * @returns {Promise<object>} An object containing page data for the tag
 * @throws {Error} If the tag slug is not specified or not found
 */
export async function loadTag(tagSlugParam, lang, config = null) {
	const finalConfig = config || getBlogConfig()
	if (!tagSlugParam) {
		const error = new Error('Tag not specified')
		error.status = 404
		throw error
	}

	const slug = tagSlugParam.replace(/\/$/, '')
	const allPosts = await getAllPosts({ lang, config: finalConfig })
	const slugLowerCase = slug.toLowerCase()
	const posts = filterPostsByTag(allPosts, slugLowerCase, slugify)
	const originalTag = getOriginalTaxonomyName(
		allPosts,
		getPostTags,
		slugLowerCase,
		slugify
	)

	if (posts.length === 0 && !originalTag) {
		const error = new Error(`Tag "${ slug }" not found or has no posts`)
		error.status = 404
		throw error
	}

	return {
		pageType: 'tag',
		posts,
		allPosts,
		tag: originalTag || slug,
		currentTag: originalTag || slug,
		lang
	}
}

/**
 * Loads data for an individual blog post
 * @param {string} year - The year of the post
 * @param {string} month - The month of the post
 * @param {string} postSlug - The slug of the post
 * @param {string} lang - The language code
 * @param {Object} config - Blog configuration
 * @returns {Promise<object>} An object containing page data for the post
 * @throws {Error} If the post is not found or if there's an issue loading it
 */
export async function loadPost(year, month, postSlug, lang, config = null) {
	const finalConfig = config || getBlogConfig()
	try {
		const allPosts = await getAllPosts({
			lang,
			includeContent: true,
			config: finalConfig
		})

		const foundPost = allPosts.find(p => {
			if (!p.urlPath) {
				return false
			}

			const urlParts = p.urlPath.split('/').filter(part => part)
			return (
				urlParts.length === 3 &&
				urlParts[0] === year &&
				urlParts[1] === month &&
				(urlParts[2] === postSlug || slugify(urlParts[2]) === slugify(postSlug))
			)
		})

		if (!foundPost) {
			const error = new Error(`Article not found: ${ year }/${ month }/${ postSlug }`)
			error.status = 404
			throw error
		}

		return {
			pageType: 'post',
			post: foundPost,
			allPosts,
			lang
		}
	} catch (err) {
		if (err.status) {
			throw err
		}

		const error = new Error(err.message || 'Could not load article')
		error.status = 500
		throw error
	}
}

/**
 * Generates entries for prerendering based on all possible blog routes
 * @param {string[]} languages - Array of supported language codes
 * @param {Object} config - Blog configuration
 * @returns {Promise<object[]>} Array of entry objects for prerendering
 */
export async function generateBlogEntries(languages = [ 'en' ], config = null) {
	const finalConfig = config || getBlogConfig()
	const allPostsData = await getAllPosts({
		includeLocalizedVersions: true,
		config: finalConfig
	})

	const generatedEntries = []
	const baseLocale = languages[0] || 'en'

	// Generate post entries
	allPostsData.forEach(post => {
		if (!post || !post.urlPath) return

		const pathParts = post.urlPath.split('/').filter(part => part)
		if (pathParts.length < 3) return

		const [ year, month, postSlug ] = pathParts
		const fullSlug = `${ year }/${ month }/${ postSlug }`

		if (post.lang && post.lang !== baseLocale && languages.includes(post.lang)) {
			generatedEntries.push({
				slug: fullSlug,
				lang: post.lang
			})
		} else if (languages.length > 1) {
			languages.forEach(lang => {
				generatedEntries.push({
					slug: fullSlug,
					lang
				})
			})
		} else {
			generatedEntries.push({
				slug: fullSlug
			})
		}
	})

	// Generate category entries
	const allCategories = new Set()
	allPostsData.forEach(post => {
		const categories = getPostCategories(post)
		categories.forEach(cat => allCategories.add(slugify(cat)))
	})

	allCategories.forEach(categorySlug => {
		languages.forEach(lang => {
			generatedEntries.push({
				slug: `category/${ categorySlug }`,
				lang
			})
		})
	})

	// Generate tag entries
	const allTags = new Set()
	allPostsData.forEach(post => {
		const tags = getPostTags(post)
		tags.forEach(tag => allTags.add(slugify(tag)))
	})

	allTags.forEach(tagSlug => {
		languages.forEach(lang => {
			generatedEntries.push({
				slug: `tag/${ tagSlug }`,
				lang
			})
		})
	})

	return generatedEntries
}