import { describe, expect, it, vi } from 'vitest'
import { createMarkdownContentSource } from '../../src/markdown/createMarkdownContentSource.js'
import { createFixtureEngine, markdownFiles } from '../fixtures/markdownFixture.js'

describe('createMarkdownContentSource', () => {
	it('normalizes flat and nested paths into direct post fields', async () => {
		const engine = createFixtureEngine()
		const page = await engine.listPosts({ pageSize: 10 })

		expect(page.posts).toHaveLength(2)
		expect(page.posts.map(post => post.urlPath)).toEqual([
			'/journal/2024/04/nested',
			'/journal/2024/03/flat'
		])
		expect(page.posts[1]).toMatchObject({
			title: 'Flat & Friendly',
			categories: [ 'Engineering' ],
			tags: [ 'Svelte', 'Music' ],
			status: 'published',
			sourcePath: '@journal/2024/03/flat.md'
		})
		expect(page.posts[1]).not.toHaveProperty('metadata')
	})

	it('derives image, excerpt, links, and read time without mutating frontmatter', async () => {
		const metadata = {
			title: 'Derived',
			date: '2024-06-01'
		}
		const source = createMarkdownContentSource({
			files: { '/content/2024/06/derived.md': () => Promise.resolve({ metadata }) },
			readContent: () => Promise.resolve('![Hero](/hero.jpg) Some useful copy. [Other](/blog/other).')
		})
		const page = await source.listPosts({ includeContent: true })

		expect(page.posts[0]).toMatchObject({
			excerpt: 'Some useful copy. Other.',
			image: { src: '/hero.jpg', alt: 'Derived' },
			links: [ '/blog/other' ],
			readTimeMinutes: 1
		})
		expect(metadata).toEqual({ title: 'Derived', date: '2024-06-01' })
	})

	it('resolves relative post assets against the mounted post URL', async () => {
		const source = createMarkdownContentSource({
			basePath: '/journal',
			files: {
				'/content/2026/08/assets/index.md': () => Promise.resolve({
					metadata: {
						title: 'Assets',
						date: '2026-08-13',
						coverImage: 'images/hero.jpg',
						author: { name: 'Miko', avatar: './images/avatar.jpg' }
					}
				})
			}
		})
		const [ post ] = (await source.listPosts()).posts

		expect(post).toMatchObject({
			coverImage: '/journal/2026/08/assets/images/hero.jpg',
			image: { src: '/journal/2026/08/assets/images/hero.jpg' },
			author: { avatar: '/journal/2026/08/assets/images/avatar.jpg' }
		})
	})

	it('requires both an all-post query and authorized context for drafts', async () => {
		const engine = createFixtureEngine()

		expect((await engine.listPosts({ pageSize: 10 })).total).toBe(2)
		expect((await engine.listPosts({ visibility: 'all', pageSize: 10 })).total).toBe(2)
		expect((await engine.listPosts(
			{ visibility: 'all', pageSize: 10 },
			{ allowDrafts: true }
		)).total).toBe(3)
		expect(await engine.getPost('draft')).toBeNull()
		expect(await engine.getPost('draft', { visibility: 'all' }, { allowDrafts: true }))
			.toMatchObject({ status: 'draft' })
	})

	it('supports pagination, search, category, tag, aliases, and localization', async () => {
		const engine = createFixtureEngine()
		const firstPage = await engine.listPosts()
		expect(firstPage).toMatchObject({ total: 2, page: 1, pageSize: 1, hasNextPage: true })
		expect((await engine.listPosts({ search: 'music', pageSize: 10 })).posts).toHaveLength(2)
		expect((await engine.listPosts({ category: 'engineering', pageSize: 10 })).posts).toHaveLength(2)
		expect((await engine.listPosts({ tag: 'music', pageSize: 10 })).posts).toHaveLength(1)
		expect(await engine.getPost('/journal/old-flat', { language: 'es' })).toMatchObject({
			title: 'Plano y amable',
			lang: 'es'
		})
	})

	it('implements throw, warn, and skip failure policies', async () => {
		const files = {
			...markdownFiles,
			'/content/invalid.md': () => Promise.reject(new Error('broken import'))
		}
		const warn = vi.fn()
		const warningSource = createMarkdownContentSource({ files, importFailureMode: 'warn', logger: { warn } })
		expect((await warningSource.listPosts({ pageSize: 10 })).total).toBe(2)
		expect(warn).toHaveBeenCalledOnce()

		const silentSource = createMarkdownContentSource({ files, importFailureMode: 'skip' })
		expect((await silentSource.listPosts({ pageSize: 10 })).total).toBe(2)

		const strictSource = createMarkdownContentSource({ files, importFailureMode: 'throw' })
		await expect(strictSource.listPosts()).rejects.toThrow('broken import')
	})

	it('invalidates its cache explicitly', async () => {
		const load = vi.fn(() => Promise.resolve({ metadata: { title: 'Cached', date: '2024-01-01' } }))
		const source = createMarkdownContentSource({ files: { '/content/2024/01/cached.md': load } })
		await source.listPosts()
		await source.listPosts()
		expect(load).toHaveBeenCalledOnce()
		source.invalidate?.()
		await source.listPosts()
		expect(load).toHaveBeenCalledTimes(2)
	})
})
