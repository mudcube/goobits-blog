import type { BlogPost } from './blogPost.js'

export interface RelatedPostResult {
	post: BlogPost
	reasons: Array<'editorial' | 'category' | 'tag' | 'link' | 'text' | 'recent'>
	score: number
}

export interface RelatedPostsOptions {
	limit?: number
	now?: Date
}

function intersectCount(left: string[], right: string[]): number {
	const values = new Set(left.map(value => value.toLowerCase()))
	return right.reduce((count, value) => count + (values.has(value.toLowerCase()) ? 1 : 0), 0)
}

function textTokens(post: BlogPost): Set<string> {
	return new Set(`${ post.title } ${ post.excerpt } ${ post.tags.join(' ') }`
		.toLowerCase()
		.match(/[a-z0-9]{3,}/g) ?? [])
}

export function resolveRelatedPosts(
	post: BlogPost,
	candidates: BlogPost[],
	options: RelatedPostsOptions = {}
): RelatedPostResult[] {
	const limit = Math.max(0, options.limit ?? 4)
	const now = options.now ?? new Date()
	const sourceTokens = textTokens(post)

	return candidates
		.filter(candidate => candidate.id !== post.id && candidate.status === 'published')
		.map(candidate => {
			const reasons: RelatedPostResult['reasons'] = []
			let score = 0
			if (post.relatedPostIds.includes(candidate.id) || post.relatedPostIds.includes(candidate.slug)) {
				reasons.push('editorial')
				score += 100
			}
			const categories = intersectCount(post.categories, candidate.categories)
			if (categories > 0) {
				reasons.push('category')
				score += categories * 18
			}
			const tags = intersectCount(post.tags, candidate.tags)
			if (tags > 0) {
				reasons.push('tag')
				score += tags * 10
			}
			if (post.links.includes(candidate.urlPath) || candidate.links.includes(post.urlPath)) {
				reasons.push('link')
				score += 24
			}
			const sharedTokens = [ ...textTokens(candidate) ].filter(token => sourceTokens.has(token)).length
			if (sharedTokens > 0) {
				reasons.push('text')
				score += Math.min(sharedTokens, 8)
			}
			const ageDays = Math.max(0, (now.getTime() - new Date(candidate.date).getTime()) / 86_400_000)
			const recency = Math.max(0, 4 - Math.floor(ageDays / 365))
			if (recency > 0) {
				reasons.push('recent')
				score += recency
			}

			return { post: candidate, reasons, score }
		})
		.filter(result => result.score > 0)
		.sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime())
		.slice(0, limit)
}
