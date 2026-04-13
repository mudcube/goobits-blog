/**
 * Blog Utilities Tests
 *
 * These tests focus on edge cases and potential bugs in core blog utilities.
 * Each test justifies its existence by probing for specific failure modes.
 */

import { describe, it, expect, vi } from 'vitest'
import {
	slugify,
	formatDate,
	getPostExcerpt,
	processImagePath,
	filterPostsByCategory,
	filterPostsByTag,
	parseCategoryDescriptions,
	getAllCategories,
	getAllTags,
	getSimilarPosts,
	generateTaxonomyEntries,
	getOriginalTaxonomyName,
	getPostCategories,
	getPostTags,
	getEmojiFromTitle,
	type ProcessedPost
} from '../utils/blogUtils.js'

// Mock the blog config to avoid external dependencies
vi.mock('../config/index.js', () => ({
	blogConfig: {
		name: 'Test Blog',
		description: 'A test blog',
		uri: '/blog',
		posts: {
			contentBasePath: '/content/Blog',
			excerptLength: 150,
			relatedPostsCount: 3,
			recentPostsCount: 5,
			popularTagsCount: 10,
			popularCategoriesCount: 10
		},
		pageContent: {
			emptyStateEmoji: '📝'
		},
		images: {
			defaults: {
				coverImage: '/default-cover.jpg',
				authorAvatar: '/default-avatar.jpg',
				blogPath: '/images/blog/',
				authorsPath: '/images/authors/'
			}
		}
	},
	getBlogVersion: () => ({ versionString: '1.0.0' }),
	getBlogPostFiles: () => ({})
}))

// Helper to create test posts with clean optional property handling
function createPost(overrides: {
	title?: string
	date?: string
	categories?: string[]
	category?: string
	tags?: string[]
	excerpt?: string
	content?: string
	urlPath?: string
	path?: string
} = {}): ProcessedPost {
	const fm: ProcessedPost['metadata']['fm'] = {
		title: overrides.title ?? 'Test Post',
		date: overrides.date ?? '2024-01-15'
	}
	if (overrides.categories) { fm.categories = overrides.categories }
	if (overrides.category) { fm.category = overrides.category }
	if (overrides.tags) { fm.tags = overrides.tags }
	if (overrides.excerpt) { fm.excerpt = overrides.excerpt }

	const post: ProcessedPost = {
		metadata: { fm },
		date: overrides.date ?? '2024-01-15',
		urlPath: overrides.urlPath ?? '/2024/01/test-post',
		path: overrides.path ?? '/content/Blog/2024/01/test-post.md',
		content: overrides.content ?? ''
	}
	return post
}

describe('slugify', () => {
	// These tests catch real bugs in URL generation

	it('handles multiple consecutive spaces without creating double dashes', () => {
		// Bug: "hello   world" could become "hello---world" breaking URLs
		expect(slugify('hello   world')).toBe('hello-world')
	})

	it('handles leading/trailing whitespace', () => {
		// Bug: " hello " could become "-hello-" creating invalid URLs
		expect(slugify('  hello world  ')).toBe('hello-world')
	})

	it('strips special characters that break URLs', () => {
		// Bug: Special chars in slugs can break routing or cause XSS
		expect(slugify('hello@world#test$foo')).toBe('helloworldtestfoo')
	})

	it('preserves hyphens but collapses them', () => {
		// Bug: "hello--world" double hyphens look unprofessional
		expect(slugify('hello--world')).toBe('hello-world')
		expect(slugify('hello - world')).toBe('hello-world')
	})

	it('handles empty string without throwing', () => {
		// Bug: Empty input could throw or return undefined
		expect(slugify('')).toBe('')
	})

	it('handles unicode characters by stripping them', () => {
		// Bug: Unicode in URLs causes encoding issues
		expect(slugify('café résumé')).toBe('caf-rsum')
	})

	it('handles strings that become empty after processing', () => {
		// Bug: "###" becomes "" which could break routing
		expect(slugify('###')).toBe('')
	})
})

describe('formatDate', () => {
	// These tests catch date parsing edge cases

	it('returns "Unknown date" for invalid date strings', () => {
		// Bug: Invalid dates could show "Invalid Date" or throw
		expect(formatDate('not-a-date')).toBe('Unknown date')
		expect(formatDate('2024-13-45')).toBe('Unknown date')
	})

	it('handles empty string gracefully', () => {
		expect(formatDate('')).toBe('Unknown date')
	})

	it('handles Date objects directly', () => {
		const date = new Date('2024-06-15')
		expect(formatDate(date)).toContain('June')
		expect(formatDate(date)).toContain('15')
		expect(formatDate(date)).toContain('2024')
	})

	it('returns short format when requested', () => {
		// Verifies short format is actually numeric
		const result = formatDate('2024-06-15', true)
		expect(result).toMatch(/\d+\/\d+\/\d+/)
	})

	it('handles ISO date strings with time component', () => {
		// Bug: "2024-01-15T10:30:00Z" could be parsed incorrectly
		expect(formatDate('2024-01-15T10:30:00Z')).toContain('2024')
	})
})

describe('getPostExcerpt', () => {
	// These tests catch content truncation bugs

	it('returns empty string for null/undefined post', () => {
		expect(getPostExcerpt(null)).toBe('')
		expect(getPostExcerpt(undefined)).toBe('')
	})

	it('uses frontmatter excerpt when available', () => {
		const post = createPost({ excerpt: 'Custom excerpt here' })
		expect(getPostExcerpt(post)).toBe('Custom excerpt here')
	})

	it('strips HTML tags from content when generating excerpt', () => {
		// Bug: HTML tags in excerpts break rendering or cause XSS
		const post = createPost({
			content: '<p>Hello <strong>world</strong></p><script>alert("xss")</script>'
		})
		const excerpt = getPostExcerpt(post)
		expect(excerpt).not.toContain('<')
		expect(excerpt).not.toContain('>')
		expect(excerpt).not.toContain('script')
	})

	it('strips markdown formatting from content', () => {
		// Bug: Markdown symbols like **bold** appear in excerpts
		const post = createPost({
			content: '# Heading\n**bold** and *italic* and `code`'
		})
		const excerpt = getPostExcerpt(post)
		expect(excerpt).not.toContain('#')
		expect(excerpt).not.toContain('*')
		expect(excerpt).not.toContain('`')
	})

	it('truncates at word boundary, not mid-word', () => {
		// Bug: "extraordinarily" could become "extraordinar..." mid-word
		const post = createPost({
			content: 'This is a test with extraordinarily long words that should not be cut mid-word'
		})
		const excerpt = getPostExcerpt(post, 30)
		// Should end with "..." and not cut a word in half
		expect(excerpt).toMatch(/\.\.\.$/)
		expect(excerpt).not.toMatch(/extraordinar\.\.\./)
	})

	it('adds ellipsis only when content is truncated', () => {
		const post = createPost({ excerpt: 'Short' })
		expect(getPostExcerpt(post)).toBe('Short')
		expect(getPostExcerpt(post)).not.toContain('...')
	})
})

describe('processImagePath', () => {
	// These tests catch URL handling edge cases

	it('returns absolute HTTP URLs unchanged', () => {
		expect(processImagePath('http://example.com/img.jpg')).toBe('http://example.com/img.jpg')
		expect(processImagePath('https://example.com/img.jpg')).toBe('https://example.com/img.jpg')
	})

	it('converts protocol-relative URLs to HTTPS', () => {
		// Bug: "//example.com/img.jpg" could fail to load
		expect(processImagePath('//example.com/img.jpg')).toBe('https://example.com/img.jpg')
	})

	it('preserves absolute paths starting with /', () => {
		expect(processImagePath('/images/photo.jpg')).toBe('/images/photo.jpg')
	})

	it('preserves data URIs', () => {
		// Bug: data: URIs could get prefix added, breaking them
		const dataUri = 'data:image/png;base64,iVBORw0KGgo='
		expect(processImagePath(dataUri)).toBe(dataUri)
	})

	it('adds prefix to relative paths', () => {
		expect(processImagePath('photo.jpg', '/images/')).toBe('/images/photo.jpg')
	})

	it('returns fallback for null/undefined/empty paths', () => {
		expect(processImagePath(null, '/prefix/', '/fallback.jpg')).toBe('/fallback.jpg')
		expect(processImagePath(undefined, '/prefix/', '/fallback.jpg')).toBe('/fallback.jpg')
		expect(processImagePath('', '/prefix/', '/fallback.jpg')).toBe('/fallback.jpg')
	})

	it('returns empty string when no fallback provided for empty path', () => {
		expect(processImagePath(null)).toBe('')
		expect(processImagePath('')).toBe('')
	})
})

describe('filterPostsByCategory', () => {
	// These tests catch the complex category/tag disambiguation logic

	const posts = [
		createPost({ title: 'Post 1', categories: ['JavaScript', 'Web Dev'] }),
		createPost({ title: 'Post 2', category: 'Python' }),
		createPost({ title: 'Post 3', categories: ['JavaScript'], tags: ['python'] }),
		createPost({ title: 'Post 4', tags: ['JavaScript'] }) // tag only, not category
	]

	it('finds posts with matching category in categories array', () => {
		const result = filterPostsByCategory(posts, 'javascript', slugify)
		expect(result.map(p => p.metadata.fm.title)).toContain('Post 1')
		expect(result.map(p => p.metadata.fm.title)).toContain('Post 3')
	})

	it('finds posts with matching singular category field', () => {
		const result = filterPostsByCategory(posts, 'python', slugify)
		expect(result.map(p => p.metadata.fm.title)).toContain('Post 2')
	})

	it('excludes posts where term is only a tag, not a category', () => {
		// Critical: Post 4 has "JavaScript" as a tag only, not a category
		// It should NOT appear in category filter results
		const result = filterPostsByCategory(posts, 'javascript', slugify)
		expect(result.map(p => p.metadata.fm.title)).not.toContain('Post 4')
	})

	it('expects input slug to be pre-slugified (lowercase)', () => {
		// The function contract is that categorySlug should already be slugified
		// Passing an uppercase slug will NOT match - this is expected behavior
		const upperResult = filterPostsByCategory(posts, 'JAVASCRIPT', slugify)
		expect(upperResult.length).toBe(0)

		// Correct usage: pass slugified (lowercase) slug
		const lowerResult = filterPostsByCategory(posts, 'javascript', slugify)
		expect(lowerResult.length).toBeGreaterThan(0)
	})

	it('returns empty array for non-existent category', () => {
		const result = filterPostsByCategory(posts, 'nonexistent', slugify)
		expect(result).toEqual([])
	})
})

describe('filterPostsByTag', () => {
	const posts = [
		createPost({ title: 'Post 1', tags: ['react', 'testing'] }),
		createPost({ title: 'Post 2', categories: ['React'] }), // category only, not tag
		createPost({ title: 'Post 3', tags: ['react'], categories: ['Web Dev'] }),
		createPost({ title: 'Post 4', category: 'testing' }) // singular category, not tag
	]

	it('finds posts with matching tag', () => {
		const result = filterPostsByTag(posts, 'react', slugify)
		expect(result.map(p => p.metadata.fm.title)).toContain('Post 1')
		expect(result.map(p => p.metadata.fm.title)).toContain('Post 3')
	})

	it('excludes posts where term is only a category, not a tag', () => {
		// Critical: Post 2 has "React" as category only
		// It should NOT appear in tag filter results
		const result = filterPostsByTag(posts, 'react', slugify)
		expect(result.map(p => p.metadata.fm.title)).not.toContain('Post 2')
	})

	it('excludes posts with singular category matching but no tag', () => {
		// Post 4 has "testing" as singular category, not tag
		const result = filterPostsByTag(posts, 'testing', slugify)
		expect(result.map(p => p.metadata.fm.title)).toContain('Post 1')
		expect(result.map(p => p.metadata.fm.title)).not.toContain('Post 4')
	})

	it('returns empty array when no posts have matching tag', () => {
		const result = filterPostsByTag(posts, 'nonexistent', slugify)
		expect(result).toEqual([])
	})
})

describe('parseCategoryDescriptions', () => {
	// Tests for YAML-like frontmatter parsing edge cases

	it('extracts category data from valid frontmatter', () => {
		const content = `---
javascript:
  description: "JavaScript posts"
  image: /js-image.jpg
python:
  description: "Python posts"
---

Body content here
`
		const result = parseCategoryDescriptions(content)
		expect(result['javascript']?.description).toBe('JavaScript posts')
		expect(result['javascript']?.image).toBe('/js-image.jpg')
		expect(result['python']?.description).toBe('Python posts')
	})

	it('returns empty object when no frontmatter exists', () => {
		const content = 'Just some content without frontmatter'
		expect(parseCategoryDescriptions(content)).toEqual({})
	})

	it('returns empty object for empty string', () => {
		expect(parseCategoryDescriptions('')).toEqual({})
	})

	it('handles frontmatter with only opening delimiter', () => {
		const content = `---
incomplete: frontmatter
`
		expect(parseCategoryDescriptions(content)).toEqual({})
	})

	it('handles values with quotes correctly', () => {
		const content = `---
test:
  description: "Value with quotes"
---`
		const result = parseCategoryDescriptions(content)
		expect(result['test']?.description).toBe('Value with quotes')
	})

	it('handles values without quotes', () => {
		const content = `---
test:
  description: Value without quotes
---`
		const result = parseCategoryDescriptions(content)
		expect(result['test']?.description).toBe('Value without quotes')
	})
})

describe('getAllCategories', () => {
	it('returns categories sorted by frequency (most used first)', () => {
		const posts = [
			createPost({ categories: ['JavaScript'] }),
			createPost({ categories: ['JavaScript'] }),
			createPost({ categories: ['JavaScript'] }),
			createPost({ categories: ['Python'] }),
			createPost({ categories: ['Python'] }),
			createPost({ categories: ['Rust'] })
		]
		const result = getAllCategories(posts, 10)
		expect(result[0]).toBe('JavaScript')
		expect(result[1]).toBe('Python')
		expect(result[2]).toBe('Rust')
	})

	it('returns empty array for empty posts array', () => {
		expect(getAllCategories([], 10)).toEqual([])
	})

	it('respects limit parameter', () => {
		const posts = [
			createPost({ categories: ['A'] }),
			createPost({ categories: ['B'] }),
			createPost({ categories: ['C'] }),
			createPost({ categories: ['D'] })
		]
		expect(getAllCategories(posts, 2).length).toBe(2)
	})

	it('handles posts with singular category field', () => {
		const posts = [
			createPost({ category: 'SingleCat' }),
			createPost({ category: 'SingleCat' })
		]
		const result = getAllCategories(posts, 10)
		expect(result).toContain('SingleCat')
	})

	it('handles mixed categories array and singular category', () => {
		const posts = [
			createPost({ categories: ['ArrayCat'] }),
			createPost({ category: 'SingularCat' })
		]
		const result = getAllCategories(posts, 10)
		expect(result).toContain('ArrayCat')
		expect(result).toContain('SingularCat')
	})
})

describe('getAllTags', () => {
	it('returns tags sorted by frequency', () => {
		const posts = [
			createPost({ tags: ['react', 'testing'] }),
			createPost({ tags: ['react', 'vue'] }),
			createPost({ tags: ['react'] }),
			createPost({ tags: ['vue'] })
		]
		const result = getAllTags(posts, 10)
		expect(result[0]).toBe('react')
		expect(result[1]).toBe('vue')
	})

	it('returns empty array for posts without tags', () => {
		const posts = [createPost({}), createPost({})]
		expect(getAllTags(posts, 10)).toEqual([])
	})

	it('returns empty array for empty posts array', () => {
		expect(getAllTags([], 10)).toEqual([])
	})
})

describe('getSimilarPosts', () => {
	const posts = [
		createPost({ title: 'Current', path: '/current', category: 'JavaScript', tags: ['react', 'testing'] }),
		createPost({ title: 'Same Category', path: '/same-cat', category: 'JavaScript', tags: ['vue'] }),
		createPost({ title: 'Same Tag', path: '/same-tag', category: 'Python', tags: ['react'] }),
		createPost({ title: 'Both Match', path: '/both', category: 'JavaScript', tags: ['react', 'testing'] }),
		createPost({ title: 'No Match', path: '/no-match', category: 'Rust', tags: ['cargo'] })
	]

	it('excludes the current post from results', () => {
		const result = getSimilarPosts(posts, '/current', 'JavaScript', ['react', 'testing'], 10)
		expect(result.map(p => p.metadata.fm.title)).not.toContain('Current')
	})

	it('ranks posts with both category and tag matches higher', () => {
		const result = getSimilarPosts(posts, '/current', 'JavaScript', ['react', 'testing'], 10)
		// "Both Match" has category (5 pts) + 2 tags (4 pts) = 9 pts, should be first
		expect(result[0]?.metadata.fm.title).toBe('Both Match')
	})

	it('excludes posts with zero similarity score', () => {
		const result = getSimilarPosts(posts, '/current', 'JavaScript', ['react'], 10)
		expect(result.map(p => p.metadata.fm.title)).not.toContain('No Match')
	})

	it('respects count limit', () => {
		const result = getSimilarPosts(posts, '/current', 'JavaScript', ['react', 'testing'], 2)
		expect(result.length).toBeLessThanOrEqual(2)
	})

	it('returns empty array when no similar posts exist', () => {
		const result = getSimilarPosts(posts, '/current', 'Unique Category', ['unique-tag'], 10)
		expect(result).toEqual([])
	})
})

describe('generateTaxonomyEntries', () => {
	const posts = [
		createPost({ categories: ['JavaScript', 'Web Dev'] }),
		createPost({ categories: ['Python'] })
	]

	it('generates unique slugified entries', () => {
		const result = generateTaxonomyEntries(posts, getPostCategories, slugify)
		const slugs = result.map(e => e.slug)
		expect(slugs).toContain('javascript')
		expect(slugs).toContain('web-dev')
		expect(slugs).toContain('python')
	})

	it('generates entries for each language when multiple languages provided', () => {
		const result = generateTaxonomyEntries(posts, getPostCategories, slugify, ['en', 'es'])
		// Should have entries for each category in each language
		const jsEntries = result.filter(e => e.slug === 'javascript')
		expect(jsEntries.length).toBe(2)
		expect(jsEntries.map(e => e.lang)).toContain('en')
		expect(jsEntries.map(e => e.lang)).toContain('es')
	})

	it('adds placeholder when no terms found for categories', () => {
		const emptyPosts: ProcessedPost[] = []
		// This requires passing getPostCategories to trigger 'uncategorized'
		const result = generateTaxonomyEntries(emptyPosts, getPostCategories, slugify)
		expect(result.map(e => e.slug)).toContain('uncategorized')
	})

	it('adds placeholder when no terms found for tags', () => {
		const emptyPosts: ProcessedPost[] = []
		const result = generateTaxonomyEntries(emptyPosts, getPostTags, slugify)
		expect(result.map(e => e.slug)).toContain('general')
	})
})

describe('getOriginalTaxonomyName', () => {
	const posts = [
		createPost({ categories: ['JavaScript Tutorials', 'Web Development'] })
	]

	it('returns original name when slug matches', () => {
		const result = getOriginalTaxonomyName(posts, getPostCategories, 'javascript-tutorials', slugify)
		expect(result).toBe('JavaScript Tutorials')
	})

	it('returns slugified term when no match found', () => {
		const result = getOriginalTaxonomyName(posts, getPostCategories, 'nonexistent', slugify)
		expect(result).toBe('nonexistent')
	})
})

describe('getEmojiFromTitle', () => {
	it('extracts emoji from title', () => {
		expect(getEmojiFromTitle('Hello World 🎉')).toBe('🎉')
		expect(getEmojiFromTitle('🚀 Launching Soon')).toBe('🚀')
	})

	it('returns default emoji when no emoji in title', () => {
		expect(getEmojiFromTitle('No emoji here')).toBe('📝')
	})

	it('returns default for null/undefined title', () => {
		expect(getEmojiFromTitle(null)).toBe('📝')
		expect(getEmojiFromTitle(undefined)).toBe('📝')
	})

	it('uses custom default when provided', () => {
		expect(getEmojiFromTitle('No emoji', '🔧')).toBe('🔧')
	})
})
