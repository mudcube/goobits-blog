import { describe, it, expect } from 'vitest'
import {
	initBlogConfig,
	buildPostsApiUrl,
	loadConfiguredCategoryDescriptions
} from '../src/config/index.js'

describe('blog config integration hooks', () => {
	it('builds posts API URLs from a custom hook', () => {
		initBlogConfig({}, {
			buildPostsApiUrl(params) {
				return `/custom/posts?${params.toString()}`
			}
		})

		const params = new URLSearchParams({ page: '2', limit: '6' })
		expect(buildPostsApiUrl(params)).toBe('/custom/posts?page=2&limit=6')
	})

	it('loads category descriptions from a custom host hook', async () => {
		initBlogConfig({}, {
			loadCategoryDescriptions: (lang) => Promise.resolve({
				canvas: {
					description: `Canvas posts for ${lang}`
				}
			})
		})

		const result = await loadConfiguredCategoryDescriptions<{ description: string }>('en')
		expect(result['canvas']?.description).toBe('Canvas posts for en')
	})
})
