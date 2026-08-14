// @vitest-environment node

import { render } from 'svelte/server'
import { describe, expect, it } from 'vitest'

import { createBlogConfig } from '../../src/config/blogConfig.js'
import type { BlogPost } from '../../src/core/blogPost.js'
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
		categories: [ 'Engineering' ],
		tags: [ 'Svelte' ],
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
				posts: [ post() ],
				config,
				categories: [{ name: 'Engineering', slug: 'engineering', count: 1 }]
			}
		}).body

		expect(card).toContain('Direct fields')
		expect(card).toContain('/journal/category/engineering')
		expect(card).not.toContain('metadata')
		expect(index).toContain('Field notes')
		expect(index).toContain('Direct fields')
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

	it('shows only configured social networks alongside working share and copy actions', () => {
		const {body} = render(SocialShare, {
			props: {
				url: 'https://example.com/journal/direct',
				title: 'Direct fields',
				networks: [ 'email' ]
			}
		})

		expect(body).toContain('Share')
		expect(body).toContain('Copy link')
		expect(body).toContain('mailto:')
		expect(body).not.toContain('facebook.com')
		expect(body).not.toContain('x.com/intent')
	})
})
