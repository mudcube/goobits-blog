/**
 * RSS Feed Generation Tests
 *
 * These tests focus on XML validity, proper escaping (XSS prevention),
 * and edge cases in feed generation. RSS is an external interface -
 * broken feeds affect users with feed readers.
 */

import { describe, it, expect, vi } from 'vitest'
import { generateRssFeed, type ProcessedPost, type RssFeedOptions } from '../utils/blogUtils.js'

// Mock the blog config
vi.mock('../config/index.js', () => ({
	blogConfig: {
		name: 'Test Blog',
		description: 'A test blog description',
		uri: '/blog',
		posts: {
			excerptLength: 150
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
	authorName?: string
	updated?: string
} = {}): ProcessedPost {
	const fm: ProcessedPost['metadata']['fm'] = {
		title: overrides.title ?? 'Test Post',
		date: overrides.date ?? '2024-01-15'
	}
	if (overrides.categories) { fm.categories = overrides.categories }
	if (overrides.category) { fm.category = overrides.category }
	if (overrides.tags) { fm.tags = overrides.tags }
	if (overrides.excerpt) { fm.excerpt = overrides.excerpt }
	if (overrides.authorName) { fm.author = { name: overrides.authorName } }
	if (overrides.updated) { fm.updated = overrides.updated }

	const post: ProcessedPost = {
		metadata: { fm },
		date: overrides.date ?? '2024-01-15',
		urlPath: overrides.urlPath ?? '/2024/01/test-post',
		path: overrides.path ?? '/content/Blog/2024/01/test-post.md',
		content: overrides.content ?? ''
	}
	return post
}

const defaultOptions: RssFeedOptions = {
	siteUrl: 'https://example.com',
	feedTitle: 'Test Feed',
	feedDescription: 'Test Description',
	feedPath: '/blog/rss.xml',
	maxItems: 20,
	language: 'en'
}

describe('generateRssFeed', () => {
	describe('XML Structure', () => {
		it('generates valid XML declaration', () => {
			const posts = [createPost({})]
			const xml = generateRssFeed(posts, defaultOptions)
			expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8" \?>/)
		})

		it('includes required RSS 2.0 elements', () => {
			const posts = [createPost({})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('<rss version="2.0"')
			expect(xml).toContain('<channel>')
			expect(xml).toContain('</channel>')
			expect(xml).toContain('</rss>')
		})

		it('includes channel metadata', () => {
			const posts = [createPost({})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('<title>Test Feed</title>')
			expect(xml).toContain('<description>Test Description</description>')
			expect(xml).toContain('<link>https://example.com/blog</link>')
			expect(xml).toContain('<language>en</language>')
		})

		it('includes atom:link for feed self-reference', () => {
			const posts = [createPost({})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"')
			expect(xml).toContain('<atom:link href="https://example.com/blog/rss.xml"')
			expect(xml).toContain('rel="self"')
			expect(xml).toContain('type="application/rss+xml"')
		})
	})

	describe('XSS Prevention / XML Escaping', () => {
		// These are critical security tests

		it('escapes < and > in post titles', () => {
			const posts = [createPost({ title: '<script>alert("xss")</script>' })]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).not.toContain('<script>')
			expect(xml).toContain('&lt;script&gt;')
		})

		it('escapes ampersands in content', () => {
			const posts = [createPost({ title: 'Tom & Jerry' })]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('Tom &amp; Jerry')
			expect(xml).not.toMatch(/Tom & Jerry/) // raw & would be invalid XML
		})

		it('escapes quotes in content', () => {
			const posts = [createPost({ title: 'Say "Hello"' })]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('&quot;Hello&quot;')
		})

		it('escapes apostrophes in content', () => {
			const posts = [createPost({ title: "It's working" })]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('&apos;')
		})

		it('escapes malicious content in excerpts', () => {
			const posts = [createPost({
				excerpt: '<img src=x onerror="alert(1)">'
			})]
			const xml = generateRssFeed(posts, defaultOptions)

			// HTML tag brackets are escaped - this is the key security measure
			// The < becomes &lt; so browsers won't parse it as HTML
			expect(xml).not.toContain('<img')
			expect(xml).toContain('&lt;img')
			// Quotes are also escaped to prevent attribute injection
			expect(xml).toContain('&quot;alert')
		})

		it('escapes malicious content in author names', () => {
			const posts = [createPost({
				authorName: '<script>steal(cookies)</script>'
			})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).not.toContain('<script>')
		})

		it('escapes category names with special characters', () => {
			const posts = [createPost({
				categories: ['C++ & C#', '<Web>']
			})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('C++ &amp; C#')
			expect(xml).toContain('&lt;Web&gt;')
		})
	})

	describe('Input Validation', () => {
		it('throws error when siteUrl is not provided', () => {
			const posts = [createPost({})]
			expect(() => generateRssFeed(posts, {} as RssFeedOptions)).toThrow('siteUrl is required')
		})

		it('throws error when siteUrl is empty string', () => {
			const posts = [createPost({})]
			expect(() => generateRssFeed(posts, { siteUrl: '' })).toThrow('siteUrl is required')
		})

		it('handles empty posts array without throwing', () => {
			const xml = generateRssFeed([], defaultOptions)
			expect(xml).toContain('<channel>')
			expect(xml).not.toContain('<item>')
		})
	})

	describe('URL Handling', () => {
		it('removes trailing slash from siteUrl', () => {
			const posts = [createPost({})]
			const xml = generateRssFeed(posts, {
				...defaultOptions,
				siteUrl: 'https://example.com/'
			})

			// Should not have double slashes
			expect(xml).not.toContain('https://example.com//blog')
			expect(xml).toContain('https://example.com/blog')
		})

		it('generates correct post URLs', () => {
			const posts = [createPost({ urlPath: '/2024/03/my-post' })]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('https://example.com/blog/2024/03/my-post')
		})

		it('includes guid with isPermaLink attribute', () => {
			const posts = [createPost({})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toMatch(/<guid isPermaLink="true">https:\/\/example\.com\/blog\//)
		})
	})

	describe('Item Content', () => {
		it('includes pubDate in correct format', () => {
			const posts = [createPost({ date: '2024-06-15' })]
			const xml = generateRssFeed(posts, defaultOptions)

			// Should be in RFC 822 format
			expect(xml).toMatch(/<pubDate>.*2024.*<\/pubDate>/)
		})

		it('includes lastBuildDate when post has updated field', () => {
			const posts = [createPost({
				date: '2024-01-15',
				updated: '2024-06-15'
			})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('<lastBuildDate>')
		})

		it('uses post excerpt for description', () => {
			const posts = [createPost({ excerpt: 'This is my custom excerpt' })]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('<description>This is my custom excerpt</description>')
		})

		it('uses fallback description when no excerpt', () => {
			const posts = [createPost({})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('<description>No description available</description>')
		})

		it('includes author element', () => {
			const posts = [createPost({ authorName: 'John Doe' })]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('<author>John Doe</author>')
		})

		it('includes categories for each post', () => {
			const posts = [createPost({
				categories: ['JavaScript', 'Testing'],
				tags: ['vitest', 'unit-tests']
			})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('<category>JavaScript</category>')
			expect(xml).toContain('<category>Testing</category>')
			expect(xml).toContain('<category>vitest</category>')
			expect(xml).toContain('<category>unit-tests</category>')
		})

		it('deduplicates categories and tags', () => {
			const posts = [createPost({
				categories: ['JavaScript'],
				tags: ['JavaScript'] // Same as category
			})]
			const xml = generateRssFeed(posts, defaultOptions)

			// Should only appear once due to Set deduplication
			const matches = xml.match(/<category>JavaScript<\/category>/g)
			expect(matches?.length).toBe(1)
		})
	})

	describe('Post Limits and Filtering', () => {
		it('respects maxItems limit', () => {
			const posts = Array.from({ length: 50 }, (_, i) =>
				createPost({ title: `Post ${i}`, urlPath: `/2024/01/post-${i}` })
			)
			const xml = generateRssFeed(posts, { ...defaultOptions, maxItems: 10 })

			const itemCount = (xml.match(/<item>/g) || []).length
			expect(itemCount).toBe(10)
		})

		it('filters out posts without title', () => {
			const posts = [
				createPost({ title: 'Valid Post' }),
				{ ...createPost({}), metadata: { fm: { title: '', date: '2024-01-15' } } } as ProcessedPost
			]
			const xml = generateRssFeed(posts, defaultOptions)

			const itemCount = (xml.match(/<item>/g) || []).length
			expect(itemCount).toBe(1)
		})

		it('filters out posts without date', () => {
			const posts = [
				createPost({ title: 'Valid Post' }),
				{ ...createPost({}), date: '' } as ProcessedPost
			]
			const xml = generateRssFeed(posts, defaultOptions)

			const itemCount = (xml.match(/<item>/g) || []).length
			expect(itemCount).toBe(1)
		})
	})

	describe('Edge Cases', () => {
		it('handles posts with missing urlPath gracefully', () => {
			const posts = [{ ...createPost({}), urlPath: '' } as ProcessedPost]
			// Should not throw
			expect(() => generateRssFeed(posts, defaultOptions)).not.toThrow()
		})

		it('handles very long excerpts by truncating', () => {
			const longContent = 'A'.repeat(1000)
			const posts = [createPost({ content: longContent })]
			const xml = generateRssFeed(posts, defaultOptions)

			// Description should be truncated (default 300 char limit in generateRssFeed)
			const descMatch = xml.match(/<description>(.*?)<\/description>/s)
			const capturedDesc = descMatch?.[1]
			expect(capturedDesc).toBeDefined()
			expect(capturedDesc?.length).toBeLessThan(350) // Some margin for "..."
		})

		it('handles unicode content correctly', () => {
			const posts = [createPost({
				title: '日本語タイトル',
				excerpt: 'Émoji content: 🚀'
			})]
			const xml = generateRssFeed(posts, defaultOptions)

			expect(xml).toContain('日本語タイトル')
			expect(xml).toContain('🚀')
		})
	})
})
