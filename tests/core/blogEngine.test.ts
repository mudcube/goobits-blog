import { describe, expect, it } from 'vitest'
import { createBlogConfig } from '../../src/config/blogConfig.js'
import { createBlogUrlResolver, getCanonicalBlogUrl, slugify } from '../../src/core/blogUrls.js'
import { resolveRelatedPosts } from '../../src/core/resolveRelatedPosts.js'
import { generateBlogRssFeed } from '../../src/core/rssFeed.js'
import { createFixtureEngine } from '../fixtures/markdownFixture.js'

describe('Blog engine', () => {
	it('creates isolated immutable-by-ownership configuration instances', () => {
		const journal = createBlogConfig({ name: 'Journal', basePath: '/journal/' })
		const notes = createBlogConfig({ name: 'Notes', defaultLanguage: 'fr' })

		expect(journal).toMatchObject({ name: 'Journal', basePath: '/journal', defaultLanguage: 'en' })
		expect(notes).toMatchObject({ name: 'Notes', basePath: '/blog', supportedLanguages: [ 'fr' ] })
	})

	it('normalizes slugs and canonical URLs', () => {
		const config = createBlogConfig({ canonicalOrigin: 'https://example.com/', basePath: '/journal' })
		expect(slugify('Q&A: Café Notes')).toBe('q-and-a-cafe-notes')
		expect(getCanonicalBlogUrl('/journal/post', config)).toBe('https://example.com/journal/post')
	})

	it('keeps custom URL strategies behind one resolver', () => {
		const config = createBlogConfig({ basePath: '/journal' })
		const urls = createBlogUrlResolver({
			taxonomy: (type, slug) => `/topics/${ type }/${ slug }`
		})

		expect(urls.blog(config)).toBe('/journal')
		expect(urls.taxonomy('tag', 'music', config)).toBe('/topics/tag/music')
		expect(urls.feed(config)).toBe('/journal/rss.xml')
	})

	it('derives taxonomy counts when the source has no optimized capability', async () => {
		const engine = createFixtureEngine()
		const categories = await engine.getCategories()

		expect(categories).toEqual([ { name: 'Engineering', slug: 'engineering', count: 2 } ])
	})

	it('ranks published related posts with explainable signals', async () => {
		const engine = createFixtureEngine()
		const page = await engine.listPosts(
			{ visibility: 'all', pageSize: 10 },
			{ allowDrafts: true }
		)
		const sourcePost = page.posts.find(post => post.slug === 'nested')
		expect(sourcePost).toBeDefined()
		if (!sourcePost) {
			return
		}
		const related = resolveRelatedPosts(sourcePost, page.posts, { now: new Date('2024-06-01') })

		expect(related.map(result => result.post.slug)).toEqual([ 'flat' ])
		expect(related[0]?.reasons).toContain('editorial')
		expect(related[0]?.reasons).toContain('category')
	})

	it('excludes drafts and escapes unsafe feed values', async () => {
		const engine = createFixtureEngine()
		const page = await engine.listPosts({ visibility: 'all', pageSize: 10 }, { allowDrafts: true })
		const xml = generateBlogRssFeed(page.posts, engine.config, { buildDate: new Date('2024-06-01') })

		expect(xml).toContain('Flat &amp; Friendly')
		expect(xml).not.toContain('Private Draft')
		expect(xml).toContain('https://example.com/journal/2024/03/flat')
	})
})
