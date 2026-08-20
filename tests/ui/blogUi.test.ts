// @vitest-environment node

import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'

import { createBlogConfig } from '../../src/config/blogConfig.js'
import type { BlogAuthor, BlogPost } from '../../src/core/blogPost.js'
import type { BlogTaxonomyType } from '../../src/core/blogUrls.js'
import BlogCard from '../../src/ui/BlogCard.svelte'
import BlogIndex from '../../src/ui/BlogIndex.svelte'
import NewsletterForm from '../../src/ui/NewsletterForm.svelte'
import SocialShare from '../../src/ui/SocialShare.svelte'

const config = createBlogConfig({
	name: 'Journal',
	description: 'Field notes',
	basePath: '/journal',
	canonicalOrigin: 'https://example.com'
})

function post(overrides: Partial<BlogPost> = {}): BlogPost {
	return {
		id: '2026/08/direct',
		slug: 'direct',
		title: 'Direct fields',
		date: '2026-08-13T00:00:00.000Z',
		excerpt: 'Direct normalized fields.',
		categories: ['Engineering'],
		tags: ['Svelte'],
		featured: false,
		lang: 'en',
		status: 'published',
		urlPath: '/journal/2026/08/direct',
		readTimeMinutes: 3,
		aliases: [],
		links: [],
		relatedPostIds: [],
		...overrides
	}
}

describe('Blog v3 UI', () => {
	it('renders cards and indexes from direct BlogPost fields', () => {
		const card = render(BlogCard, { props: { post: post(), basePath: config.basePath } }).body
		const index = render(BlogIndex, {
			props: {
				posts: [post()],
				config,
				categories: [{ name: 'Engineering', slug: 'engineering', count: 1 }]
			}
		}).body

		expect(card).toContain('Direct fields')
		expect(card).toContain('/journal/category/engineering')
		expect(card).not.toContain('metadata')
		expect(index).toContain('Field notes')
		expect(index).toContain('Direct fields')
		expect(index).toContain('blog-index__search')
		expect(index.indexOf('name="q"')).toBeLessThan(index.indexOf('>Search</'))
		expect(index.indexOf('>Search</')).toBeLessThan(index.indexOf('name="sort"'))
	})

	it('uses injected URLs and shared author presentation throughout cards', () => {
		const { body } = render(BlogCard, {
			props: {
				post: post({
					author: { name: 'Miko', avatar: '/miko.jpg', url: '/legacy-author' }
				}),
				config,
				urlResolver: {
					post: (value: BlogPost) => `/@miko/blog/${value.slug}`,
					taxonomy: (type: BlogTaxonomyType, slug: string) => `/@miko/blog/${type}/${slug}`,
					author: (author: BlogAuthor) => `/@${author.name.toLowerCase()}`
				}
			}
		})

		expect(body).toContain('/@miko/blog/direct')
		expect(body).toContain('/@miko/blog/category/engineering')
		expect(body).toContain('/@miko/blog/tag/svelte')
		expect(body).toContain('href="/@miko"')
		expect(body).toContain('src="/miko.jpg"')
	})

	it('localizes sort, discovery, and pagination labels', () => {
		const { body } = render(BlogIndex, {
			props: {
				posts: [post()],
				config: createBlogConfig({ name: 'Journal', pageSize: 1 }),
				totalPosts: 2,
				messages: {
					blogPages: 'Pages du journal',
					blogTopics: 'Sujets',
					pageStatus: (current: number, total: number) => `${current} sur ${total}`,
					nextPage: 'Suivant',
					sortNewest: 'Plus recentes'
				}
			}
		})

		expect(body).toContain('Pages du journal')
		expect(body).toContain('1 sur 2')
		expect(body).toContain('Suivant')
		expect(body).toContain('Plus recentes')
	})

	it('does not render a newsletter without a working host adapter', () => {
		const hidden = render(NewsletterForm, { props: {} }).body
		const configured = render(NewsletterForm, {
			props: { onSubscribe: () => Promise.resolve({ accepted: true }) }
		}).body

		expect(hidden).not.toContain('<form')
		expect(configured).toContain('<form')
		expect(configured).toContain('Email address')
	})

	it('renders configured share actions through Goo buttons with native link semantics', () => {
		const { body } = render(SocialShare, {
			props: {
				url: 'https://example.com/journal/direct',
				title: 'Direct fields',
				networks: ['email', 'facebook', 'x']
			}
		})

		expect(body).toContain('Share')
		expect(body).toContain('Copy link')
		expect(body.match(/<(?:button|a)\b[^>]*class="goo-button(?: |")/g)).toHaveLength(5)
		expect(body).toContain('class="goo-button blog-share__network"')
		expect(body).toContain('mailto:')
		expect(body).toContain('facebook.com/sharer/sharer.php')
		expect(body).toContain('x.com/intent/post')
		expect(body.match(/target="_blank"/g)).toHaveLength(2)
		expect(body.match(/rel="noopener noreferrer nofollow"/g)).toHaveLength(2)
	})
})
