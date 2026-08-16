import { describe, expect, it } from 'vitest'

import { createBlogConfig } from '../../src/config/blogConfig.js'
import { createBlogPost } from '../../src/core/blogPost.js'
import { localizeBlogPost, resolveBlogLanguage } from '../../src/i18n/index.js'

describe('Blog localization', () => {
	it('accepts configured languages and falls back to the default', () => {
		const config = createBlogConfig({
			defaultLanguage: 'en',
			supportedLanguages: [ 'en', 'es' ]
		})

		expect(resolveBlogLanguage(config, 'es')).toBe('es')
		expect(resolveBlogLanguage(config, 'fr')).toBe('en')
		expect(resolveBlogLanguage(config)).toBe('en')
	})

	it('applies partial translations without mutating the source post', () => {
		const post = createBlogPost({
			id: 'hello',
			slug: 'hello',
			title: 'Hello',
			date: '2026-08-01',
			excerpt: 'Original excerpt',
			categories: [ 'Notes' ],
			tags: [ 'Welcome' ],
			urlPath: '/journal/hello',
			translations: {
				es: { title: 'Hola', categories: [ 'Notas' ] }
			}
		})

		expect(localizeBlogPost(post, 'es')).toMatchObject({
			lang: 'es',
			title: 'Hola',
			excerpt: 'Original excerpt',
			categories: [ 'Notas' ],
			tags: [ 'Welcome' ]
		})
		expect(post).toMatchObject({ lang: 'en', title: 'Hello', categories: [ 'Notes' ] })
		expect(localizeBlogPost(post, 'fr')).toBe(post)
	})
})
