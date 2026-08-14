import { describe, expect, it } from 'vitest'
import { BlogRouteError, createBlogRouteHandlers, type BlogRouteEvent } from '../../src/sveltekit/createBlogRouteHandlers.js'
import { createFixtureEngine } from '../fixtures/markdownFixture.js'

function event(slug = '', preview = false, query = ''): BlogRouteEvent {
	return {
		params: { slug },
		locals: { preview },
		url: new URL(`https://example.com/journal/${ slug }${ query }`)
	}
}

describe('SvelteKit blog routes', () => {
	const engine = createFixtureEngine()
	const handlers = createBlogRouteHandlers({
		engine,
		getReadContext: routeEvent => ({ allowDrafts: routeEvent.locals['preview'] === true })
	})

	it('loads mounted index, post, and taxonomy routes', async () => {
		await expect(handlers.loadIndex(event())).resolves.toMatchObject({
			pageType: 'index',
			totalPosts: 2,
			hasMorePosts: true
		})
		await expect(handlers.loadRoute(event('2024/03/flat'))).resolves.toMatchObject({
			pageType: 'post',
			post: { slug: 'flat' },
			relatedPosts: [{ post: { slug: 'nested' } }]
		})
		await expect(handlers.loadRoute(event('category/engineering'))).resolves.toMatchObject({
			pageType: 'category',
			totalPosts: 2
		})
	})

	it('requires preview context for draft routes', async () => {
		await expect(handlers.loadRoute(event('2024/05/draft'))).rejects.toBeInstanceOf(BlogRouteError)
		await expect(handlers.loadRoute(event('2024/05/draft', true))).resolves.toMatchObject({
			post: { title: 'Private Draft' }
		})
		const previewIndex = await handlers.loadIndex(event('', true))
		expect(previewIndex.totalPosts).toBe(3)
		expect(previewIndex.categories).toContainEqual({ name: 'Notes', slug: 'notes', count: 1 })
	})

	it('passes paging, search, and sort query state through list routes', async () => {
		await expect(handlers.loadIndex(event('', false, '?page=2&q=music&sort=oldest'))).resolves.toMatchObject({
			page: 2,
			pageSize: 1,
			search: 'music',
			sort: 'oldest',
			posts: [{ slug: 'nested' }]
		})
	})

	it('returns an empty valid taxonomy search without converting it to a 404', async () => {
		await expect(handlers.loadRoute(event(
			'category/engineering',
			false,
			'?q=definitely-missing'
		))).resolves.toMatchObject({
			pageType: 'category',
			totalPosts: 0,
			posts: []
		})
		await expect(handlers.loadRoute(event(
			'category/missing',
			false,
			'?q=definitely-missing'
		))).rejects.toMatchObject({ status: 404 })
	})

	it('generates published entries and RSS only', async () => {
		const entries = await handlers.entries()
		expect(entries).toContainEqual({ slug: '2024/03/flat' })
		expect(entries).not.toContainEqual({ slug: '2024/05/draft' })

		const rssEvent = event('rss.xml')
		rssEvent.url = new URL('https://preview.example/journal/rss.xml')
		const response = await handlers.GET(rssEvent)
		const xml = await response.text()
		expect(response.status).toBe(200)
		expect(xml).toContain('Flat &amp; Friendly')
		expect(xml).not.toContain('Private Draft')
		expect(xml).toContain('https://example.com/journal/2024/03/flat')
		expect(xml).not.toContain('https://preview.example')
	})

	it('rejects unknown and static asset routes', async () => {
		await expect(handlers.loadRoute(event('missing'))).rejects.toMatchObject({ status: 404 })
		await expect(handlers.loadRoute(event('styles.css'))).rejects.toMatchObject({ status: 404 })
	})
})
