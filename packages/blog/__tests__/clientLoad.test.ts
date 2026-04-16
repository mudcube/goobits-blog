import { describe, it, expect, vi } from 'vitest'
import { createBlogPageLoad } from '../handlers/clientLoad.js'

describe('createBlogPageLoad', () => {
	it('uses a custom post-content loader when provided', async () => {
		const loadPostContent = vi.fn().mockResolvedValue({ component: 'PostComponent' })
		const load = createBlogPageLoad({ loadPostContent })

		const result = await load({
			data: {
				pageType: 'post',
				post: {
					path: '/custom/content/post.md'
				}
			}
		})

		expect(loadPostContent).toHaveBeenCalledWith({
			path: '/custom/content/post.md',
			data: {
				pageType: 'post',
				post: {
					path: '/custom/content/post.md'
				}
			},
			logger: console
		})
		expect(result.postContent).toEqual({ component: 'PostComponent' })
	})

	it('returns null post content when the custom loader does not resolve a component', async () => {
		const loadPostContent = vi.fn().mockResolvedValue(null)
		const load = createBlogPageLoad({ loadPostContent })

		const result = await load({
			data: {
				pageType: 'post',
				post: {
					path: '/missing/post.md'
				}
			}
		})

		expect(result.postContent).toBeNull()
	})

	it('skips content loading for non-post pages', async () => {
		const loadPostContent = vi.fn()
		const load = createBlogPageLoad({ loadPostContent })

		const result = await load({
			data: {
				pageType: 'index'
			}
		})

		expect(loadPostContent).not.toHaveBeenCalled()
		expect(result.postContent).toBeNull()
	})
})
