import { describe, expect, it } from 'vitest'

import type { BlogReadContext } from '../../src/core/blogQuery.js'
import {
	createMarkdownBlog,
	type BlogRouteEvent
} from '../../src/sveltekit/index.js'

interface PreviewContext extends BlogReadContext {
	viewerId?: string
}

interface PreviewLocals {
	preview?: boolean
	viewerId?: string
}

type PreviewEvent = BlogRouteEvent<PreviewLocals>

const modules = {
	'/content/2026/08/hello/index.md': () => Promise.resolve({
		default: 'rendered-post',
		metadata: {
			title: 'Hello',
			date: '2026-08-01',
			category: 'Notes'
		}
	}),
	'/content/2026/08/draft/index.md': () => Promise.resolve({
		default: 'rendered-draft',
		metadata: {
			title: 'Draft',
			date: '2026-08-02',
			draft: true
		}
	})
}

const rawContent = {
	'/content/2026/08/hello/index.md': '# Hello\n\nPublished content.',
	'/content/2026/08/draft/index.md': '# Draft\n\nPrivate content.'
}

function event(slug = '', locals: PreviewLocals = {}): PreviewEvent {
	return {
		params: { slug },
		locals,
		url: new URL(`https://example.com/journal/${ slug }`)
	}
}

describe('createMarkdownBlog', () => {
	const blog = createMarkdownBlog<PreviewContext, PreviewEvent>({
		config: {
			name: 'Journal',
			basePath: '/journal',
			canonicalOrigin: 'https://example.com'
		},
		modules,
		rawContent,
		getContext: routeEvent => ({
			allowDrafts: routeEvent.locals.preview === true,
			...(routeEvent.locals.viewerId ? { viewerId: routeEvent.locals.viewerId } : {})
		})
	})

	it('returns ready-to-bind configured index and route loads', async () => {
		await expect(blog.routes.index(event())).resolves.toMatchObject({
			pageType: 'index',
			totalPosts: 1,
			config: { name: 'Journal', basePath: '/journal' }
		})
		const postData = await blog.routes.route(event('2026/08/hello'))
		expect(postData).toMatchObject({ pageType: 'post', post: { title: 'Hello' } })
		await expect(blog.routes.page({ data: postData })).resolves.toMatchObject({
			postContent: 'rendered-post'
		})
	})

	it('keeps preview authorization in the typed context pipeline', async () => {
		await expect(blog.routes.route(event('2026/08/draft'))).rejects.toMatchObject({ status: 404 })
		await expect(blog.routes.route(event('2026/08/draft', {
			preview: true,
			viewerId: 'viewer-1'
		}))).resolves.toMatchObject({ post: { title: 'Draft' } })
	})

	it('exposes entries and RSS without bypassing the engine', async () => {
		await expect(blog.routes.entries()).resolves.toEqual([
			{ slug: '2026/08/hello' },
			{ slug: 'category/notes' }
		])
		const response = await blog.routes.rss(event('rss.xml'))
		expect(response.status).toBe(200)
		expect(await response.text()).toContain('<title>Hello</title>')
	})
})
