import type { BlogPost } from './blogPost.js'
import { slugify } from './blogUrls.js'

export interface BlogTaxonomyTerm {
	name: string
	slug: string
	count: number
}

function collectTerms(posts: BlogPost[], select: (post: BlogPost) => string[]): BlogTaxonomyTerm[] {
	const terms = new Map<string, BlogTaxonomyTerm>()

	for (const post of posts) {
		for (const name of select(post)) {
			const slug = slugify(name)
			if (!slug) {
				continue
			}
			const current = terms.get(slug)
			terms.set(slug, {
				name: current?.name ?? name,
				slug,
				count: (current?.count ?? 0) + 1
			})
		}
	}

	return [ ...terms.values() ].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export function getBlogCategories(posts: BlogPost[]): BlogTaxonomyTerm[] {
	return collectTerms(posts, post => post.categories)
}

export function getBlogTags(posts: BlogPost[]): BlogTaxonomyTerm[] {
	return collectTerms(posts, post => post.tags)
}

export function hasBlogCategory(post: BlogPost, category: string): boolean {
	const target = slugify(category)
	return post.categories.some(value => slugify(value) === target)
}

export function hasBlogTag(post: BlogPost, tag: string): boolean {
	const target = slugify(tag)
	return post.tags.some(value => slugify(value) === target)
}
