import { describe, expect, it } from 'vitest'
import { BlogRouteError, createBlogRouteHandlers, type BlogRouteEvent } from '../../src/sveltekit/createBlogRouteHandlers.js'
import { createFixtureEngine } from '../fixtures/markdownFixture.js'

function event(slug = '', preview = false): BlogRouteEvent {
	return {
		params: { slug },
		locals: { preview },
		url: new URL(`https://example.com/journal/${ slug }`)
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
			post: { slug: 'flat' }
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
	})

	it('generates published entries and RSS only', async () => {
		const entries = await handlers.entries()
		expect(entries).toContainEqual({ slug: '2024/03/flat' })
		expect(entries).not.toContainEqual({ slug: '2024/05/draft' })

		const response = await handlers.GET(event('rss.xml'))
		const xml = await response.text()
		expect(response.status).toBe(200)
		expect(xml).toContain('Flat &amp; Friendly')
		expect(xml).not.toContain('Private Draft')
	})

	it('rejects unknown and static asset routes', async () => {
		await expect(handlers.loadRoute(event('missing'))).rejects.toMatchObject({ status: 404 })
		await expect(handlers.loadRoute(event('styles.css'))).rejects.toMatchObject({ status: 404 })
	})
})
