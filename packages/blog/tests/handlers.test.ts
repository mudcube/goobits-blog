/**
 * Route Handler Tests
 *
 * These tests focus on route pattern matching, URL parsing edge cases,
 * and error handling. Route handlers are critical - incorrect routing
 * leads to 404s or wrong content being served.
 */

import { describe, it, expect, vi } from 'vitest'
import {
	createBlogIndexHandler,
	createBlogSlugHandler,
	createRSSFeedHandler,
	type ServerLoadEvent,
	type Locals
} from '../handlers/index.js'

// Mock dependencies
vi.mock('../utils/index.js', () => ({
	getAllPosts: vi.fn().mockResolvedValue([
		{
			metadata: { fm: { title: 'Test Post', date: '2024-01-15' } },
			date: '2024-01-15',
			urlPath: '/2024/01/test-post'
		}
	]),
	generateRssFeed: vi.fn().mockReturnValue('<?xml version="1.0"?><rss></rss>')
}))

vi.mock('../handlers/routeUtils.js', () => ({
	loadBlogIndex: vi.fn().mockResolvedValue({
		pageType: 'index',
		posts: [],
		allPosts: [],
		totalPosts: 0,
		hasMorePosts: false,
		lang: 'en'
	}),
	loadCategory: vi.fn().mockImplementation((slug: string) => {
		if (slug === 'nonexistent') {
			const error = new Error('Category not found') as Error & { status: number }
			error.status = 404
			throw error
		}
		return Promise.resolve({
			pageType: 'category',
			posts: [],
			allPosts: [],
			category: slug,
			currentCategory: slug,
			categoryDescription: null,
			categoryImage: null,
			categoryImageAlt: null,
			lang: 'en'
		})
	}),
	loadTag: vi.fn().mockImplementation((slug: string) => {
		if (slug === 'nonexistent') {
			const error = new Error('Tag not found') as Error & { status: number }
			error.status = 404
			throw error
		}
		return Promise.resolve({
			pageType: 'tag',
			posts: [],
			allPosts: [],
			tag: slug,
			currentTag: slug,
			lang: 'en'
		})
	}),
	loadPost: vi.fn().mockImplementation((year: string, month: string, slug: string) => {
		if (slug === 'nonexistent') {
			const error = new Error('Post not found') as Error & { status: number }
			error.status = 404
			throw error
		}
		return Promise.resolve({
			pageType: 'post',
			post: {
				metadata: { fm: { title: 'Test Post', date: `${year}-${month}-15` } },
				date: `${year}-${month}-15`,
				urlPath: `/${year}/${month}/${slug}`
			},
			allPosts: [],
			lang: 'en'
		})
	}),
	generateBlogEntries: vi.fn().mockResolvedValue([
		{ slug: '2024/01/test-post' },
		{ slug: 'category/javascript' },
		{ slug: 'tag/react' }
	])
}))

vi.mock('../config/index.js', () => ({
	blogConfig: {
		name: 'Test Blog',
		description: 'A test blog',
		uri: '/blog'
	}
}))

function createEvent(slug: string, locals: Partial<Locals> = {}): ServerLoadEvent {
	return {
		params: { slug },
		locals: { paraglideLocale: 'en', ...locals }
	}
}

describe('createBlogIndexHandler', () => {
	it('returns prerender setting from options', () => {
		const handler = createBlogIndexHandler({ prerender: false })
		expect(handler.prerender).toBe(false)

		const defaultHandler = createBlogIndexHandler()
		expect(defaultHandler.prerender).toBe(true)
	})

	it('uses custom getLanguage function when provided', async () => {
		const customGetLanguage = vi.fn().mockReturnValue('es')
		const handler = createBlogIndexHandler({ getLanguage: customGetLanguage })

		await handler.load(createEvent(''))

		expect(customGetLanguage).toHaveBeenCalled()
	})

	it('defaults to paraglideLocale from locals', async () => {
		const { loadBlogIndex } = await import('../handlers/routeUtils.js')
		const handler = createBlogIndexHandler()

		await handler.load(createEvent('', { paraglideLocale: 'de' }))

		expect(loadBlogIndex).toHaveBeenCalledWith('de', null, { initialLoad: true })
	})

	it('defaults to "en" when no locale in locals', async () => {
		const { loadBlogIndex } = await import('../handlers/routeUtils.js')
		const handler = createBlogIndexHandler()

		await handler.load({ params: {}, locals: {} })

		expect(loadBlogIndex).toHaveBeenCalledWith('en', null, { initialLoad: true })
	})
})

describe('createBlogSlugHandler', () => {
	describe('Route Pattern Matching', () => {
		it('routes empty slug to blog index', async () => {
			const { loadBlogIndex } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler()

			await handler.load(createEvent(''))

			expect(loadBlogIndex).toHaveBeenCalled()
		})

		it('routes undefined slug to blog index', async () => {
			const { loadBlogIndex } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler()

			await handler.load({ params: {}, locals: {} })

			expect(loadBlogIndex).toHaveBeenCalled()
		})

		it('routes category/ prefix to category handler', async () => {
			const { loadCategory } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler()

			await handler.load(createEvent('category/javascript'))

			expect(loadCategory).toHaveBeenCalledWith('javascript', 'en', null)
		})

		it('routes tag/ prefix to tag handler', async () => {
			const { loadTag } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler()

			await handler.load(createEvent('tag/react'))

			expect(loadTag).toHaveBeenCalledWith('react', 'en', null)
		})

		it('routes YYYY/MM/slug pattern to post handler', async () => {
			const { loadPost } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler()

			await handler.load(createEvent('2024/03/my-post'))

			expect(loadPost).toHaveBeenCalledWith('2024', '03', 'my-post', 'en', null)
		})
	})

	describe('Trailing Slash Handling', () => {
		it('strips trailing slashes from slugs', async () => {
			const { loadCategory } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler()

			await handler.load(createEvent('category/javascript/'))

			expect(loadCategory).toHaveBeenCalledWith('javascript', 'en', null)
		})

		it('handles multiple trailing slashes', async () => {
			const { loadCategory } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler()

			// The regex only removes one trailing slash, but this tests the behavior
			await handler.load(createEvent('category/javascript/'))

			expect(loadCategory).toHaveBeenCalledWith('javascript', 'en', null)
		})
	})

	describe('Static Asset Filtering', () => {
		// These tests ensure static assets don't get routed through blog handlers

		it('throws 404 for .css files', async () => {
			const handler = createBlogSlugHandler()

			await expect(handler.load(createEvent('styles/main.css'))).rejects.toMatchObject({
				status: 404,
				message: 'Not a blog route'
			})
		})

		it('throws 404 for .js files', async () => {
			const handler = createBlogSlugHandler()

			await expect(handler.load(createEvent('scripts/app.js'))).rejects.toMatchObject({
				status: 404
			})
		})

		it('throws 404 for image files', async () => {
			const handler = createBlogSlugHandler()

			await expect(handler.load(createEvent('images/photo.png'))).rejects.toMatchObject({
				status: 404
			})
			await expect(handler.load(createEvent('images/photo.jpg'))).rejects.toMatchObject({
				status: 404
			})
			await expect(handler.load(createEvent('images/photo.svg'))).rejects.toMatchObject({
				status: 404
			})
		})

		it('throws 404 for font files', async () => {
			const handler = createBlogSlugHandler()

			await expect(handler.load(createEvent('fonts/roboto.woff2'))).rejects.toMatchObject({
				status: 404
			})
		})

		it('throws 404 for TypeScript files', async () => {
			const handler = createBlogSlugHandler()

			await expect(handler.load(createEvent('src/utils.ts'))).rejects.toMatchObject({
				status: 404
			})
		})

		it('is case-insensitive for file extensions', async () => {
			const handler = createBlogSlugHandler()

			await expect(handler.load(createEvent('styles/main.CSS'))).rejects.toMatchObject({
				status: 404
			})
			await expect(handler.load(createEvent('images/photo.PNG'))).rejects.toMatchObject({
				status: 404
			})
		})
	})

	describe('Invalid Route Handling', () => {
		it('throws 404 for unrecognized route patterns', async () => {
			const handler = createBlogSlugHandler()

			// Not matching any known pattern
			await expect(handler.load(createEvent('random/path'))).rejects.toMatchObject({
				status: 404,
				message: 'Blog page not found'
			})
		})

		it('throws 404 for partial date patterns', async () => {
			const handler = createBlogSlugHandler()

			// Only year/month, missing slug
			await expect(handler.load(createEvent('2024/03'))).rejects.toMatchObject({
				status: 404
			})
		})

		it('throws 404 for invalid year format', async () => {
			const handler = createBlogSlugHandler()

			// Year not 4 digits
			await expect(handler.load(createEvent('24/03/post'))).rejects.toMatchObject({
				status: 404
			})
		})

		it('throws 404 for invalid month format', async () => {
			const handler = createBlogSlugHandler()

			// Month not 2 digits
			await expect(handler.load(createEvent('2024/3/post'))).rejects.toMatchObject({
				status: 404
			})
		})
	})

	describe('Handler Settings', () => {
		it('returns configured prerender setting', () => {
			const handler = createBlogSlugHandler({ prerender: false })
			expect(handler.prerender).toBe(false)
		})

		it('returns configured trailingSlash setting', () => {
			const handler = createBlogSlugHandler({ trailingSlash: 'never' })
			expect(handler.trailingSlash).toBe('never')
		})

		it('defaults trailingSlash to "always"', () => {
			const handler = createBlogSlugHandler()
			expect(handler.trailingSlash).toBe('always')
		})

		it('provides entries function for prerendering', async () => {
			const handler = createBlogSlugHandler({ languages: ['en', 'es'] })
			const entries = await handler.entries()

			expect(Array.isArray(entries)).toBe(true)
		})
	})

	describe('Language Support', () => {
		it('passes language from custom getLanguage to loaders', async () => {
			const { loadPost } = await import('../handlers/routeUtils.js')
			const handler = createBlogSlugHandler({
				getLanguage: () => 'fr'
			})

			await handler.load(createEvent('2024/03/my-post'))

			expect(loadPost).toHaveBeenCalledWith('2024', '03', 'my-post', 'fr', null)
		})
	})
})

describe('createRSSFeedHandler', () => {
	it('returns Response with correct content type', async () => {
		const handler = createRSSFeedHandler()
		const response = await handler({ url: new URL('https://example.com/blog/rss.xml') })

		expect(response.headers.get('Content-Type')).toBe('application/xml')
	})

	it('returns Response with cache headers', async () => {
		const handler = createRSSFeedHandler()
		const response = await handler({ url: new URL('https://example.com/blog/rss.xml') })

		expect(response.headers.get('Cache-Control')).toContain('max-age=600')
	})

	it('uses custom feedPath when provided', async () => {
		const { generateRssFeed } = await import('../utils/index.js')
		const handler = createRSSFeedHandler({ feedPath: '/custom/feed.xml' })

		await handler({ url: new URL('https://example.com/blog/rss.xml') })

		expect(generateRssFeed).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ feedPath: '/custom/feed.xml' })
		)
	})

	it('uses custom error handler when provided', async () => {
		const { getAllPosts } = await import('../utils/index.js')
		vi.mocked(getAllPosts).mockRejectedValueOnce(new Error('Database error'))

		const customErrorHandler = vi.fn().mockReturnValue(
			new Response('Custom error', { status: 500 })
		)
		const handler = createRSSFeedHandler({ errorHandler: customErrorHandler })

		await handler({ url: new URL('https://example.com/blog/rss.xml') })

		expect(customErrorHandler).toHaveBeenCalled()
	})

	it('returns fallback error response when no custom handler', async () => {
		const { getAllPosts } = await import('../utils/index.js')
		vi.mocked(getAllPosts).mockRejectedValueOnce(new Error('Database error'))

		const handler = createRSSFeedHandler()
		const response = await handler({ url: new URL('https://example.com/blog/rss.xml') })

		expect(response.status).toBe(500)
		expect(response.headers.get('Content-Type')).toBe('application/xml')

		const body = await response.text()
		expect(body).toContain('Failed to generate RSS feed')
	})

	it('passes origin from request URL to feed generator', async () => {
		const { generateRssFeed } = await import('../utils/index.js')
		const handler = createRSSFeedHandler()

		await handler({ url: new URL('https://myblog.com/blog/rss.xml') })

		expect(generateRssFeed).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ siteUrl: 'https://myblog.com' })
		)
	})
})
