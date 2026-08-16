import { describe, expect, it, vi } from 'vitest'

import type { BlogContentSource } from '../../src/core/blogContentSource.js'
import { createBlogPost } from '../../src/core/blogPost.js'
import type { BlogReadContext } from '../../src/core/blogQuery.js'
import { createBlogEngine } from '../../src/core/createBlogEngine.js'

interface TenantContext extends BlogReadContext {
	tenantId: string
	viewerId?: string
}

const post = createBlogPost({
	id: 'post-1',
	slug: 'hello',
	title: 'Hello',
	date: new Date('2026-08-01T12:00:00Z'),
	urlPath: '/journal/2026/08/hello',
	categories: [ 'Notes' ],
	tags: [ 'Welcome' ]
})

describe('Blog adapter contracts', () => {
	it('normalizes database records into isolated posts', () => {
		const inputCategories = [ 'Notes' ]
		const normalized = createBlogPost({
			id: 'post-2',
			slug: 'normalized',
			title: 'Normalized',
			date: '2026-08-02',
			urlPath: '/journal/normalized',
			categories: inputCategories
		})
		inputCategories.push('Changed')

		expect(normalized).toMatchObject({
			date: '2026-08-02T00:00:00.000Z',
			categories: [ 'Notes' ],
			status: 'published',
			readTimeMinutes: 1
		})
	})

	it('passes typed context to optimized source capabilities', async () => {
		const listPosts = vi.fn<BlogContentSource<TenantContext>['listPosts']>().mockResolvedValue({
			posts: [ post ],
			total: 1,
			page: 1,
			pageSize: 12,
			hasNextPage: false
		})
		const getCategories = vi.fn<NonNullable<BlogContentSource<TenantContext>['getCategories']>>()
			.mockResolvedValue([{ name: 'Optimized', slug: 'optimized', count: 1 }])
		const getTags = vi.fn<NonNullable<BlogContentSource<TenantContext>['getTags']>>()
			.mockResolvedValue([{ name: 'Fast', slug: 'fast', count: 1 }])
		const getRelatedPosts = vi.fn<NonNullable<BlogContentSource<TenantContext>['getRelatedPosts']>>()
			.mockResolvedValue([])
		const source: BlogContentSource<TenantContext> = {
			listPosts,
			getPost: vi.fn().mockResolvedValue(post),
			getCategories,
			getTags,
			getRelatedPosts
		}
		const engine = createBlogEngine<TenantContext>({ contentSource: source })
		const context: TenantContext = { tenantId: 'bandamp', viewerId: 'viewer-1' }

		await expect(engine.getCategories({}, context)).resolves.toHaveLength(1)
		await expect(engine.getTags({}, context)).resolves.toHaveLength(1)
		await expect(engine.getRelatedPosts(post, { context })).resolves.toEqual([])
		await engine.generateRss({ siteUrl: 'https://example.com' }, context)

		expect(getCategories).toHaveBeenCalledWith(expect.any(Object), context)
		expect(getTags).toHaveBeenCalledWith(expect.any(Object), context)
		expect(getRelatedPosts).toHaveBeenCalledWith(post, { limit: 4 }, context)
		expect(listPosts).toHaveBeenLastCalledWith(expect.objectContaining({ visibility: 'published' }), context)
	})
})
