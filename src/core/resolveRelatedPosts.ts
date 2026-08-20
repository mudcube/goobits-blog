import MiniSearch from 'minisearch'

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

interface RelatedSearchDocument {
	id: string
	title: string
	excerpt: string
	categories: string
	tags: string
}

function intersectCount(left: string[], right: string[]): number {
	const values = new Set(left.map((value) => value.toLowerCase()))
	return right.reduce((count, value) => count + (values.has(value.toLowerCase()) ? 1 : 0), 0)
}

function textTokens(post: BlogPost): Set<string> {
	return new Set(
		`${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase().match(/[a-z0-9]{3,}/g) ??
			[]
	)
}

function getTextScores(post: BlogPost, candidates: BlogPost[]): Map<string, number> {
	const documents = candidates.map((candidate): RelatedSearchDocument => ({
		id: candidate.id,
		title: candidate.title,
		excerpt: candidate.excerpt,
		categories: candidate.categories.join(' '),
		tags: candidate.tags.join(' ')
	}))
	const search = new MiniSearch<RelatedSearchDocument>({
		fields: ['title', 'excerpt', 'categories', 'tags'],
		storeFields: ['id'],
		searchOptions: {
			boost: { title: 3, tags: 2, categories: 2 },
			combineWith: 'OR',
			fuzzy: 0.2,
			prefix: true
		}
	})
	search.addAll(documents)
	const results = search.search(
		`${post.title} ${post.excerpt} ${post.categories.join(' ')} ${post.tags.join(' ')}`
	)
	const maximum = results[0]?.score ?? 0
	return new Map(
		results.map((result) => [
			String(result.id),
			maximum > 0 ? Math.min(16, (result.score / maximum) * 16) : 0
		])
	)
}

function diversify(results: RelatedPostResult[], limit: number): RelatedPostResult[] {
	const remaining = [...results]
	const selected: RelatedPostResult[] = []
	const categoryCounts = new Map<string, number>()

	while (selected.length < limit && remaining.length > 0) {
		let bestIndex = 0
		let bestAdjustedScore = Number.NEGATIVE_INFINITY
		for (const [index, result] of remaining.entries()) {
			const primaryCategory = result.post.categories[0]?.toLowerCase() ?? ''
			const repetitionPenalty = primaryCategory ? (categoryCounts.get(primaryCategory) ?? 0) * 6 : 0
			const adjustedScore = result.score - repetitionPenalty
			if (adjustedScore > bestAdjustedScore) {
				bestAdjustedScore = adjustedScore
				bestIndex = index
			}
		}
		const [next] = remaining.splice(bestIndex, 1)
		if (!next) {
			break
		}
		selected.push(next)
		const primaryCategory = next.post.categories[0]?.toLowerCase()
		if (primaryCategory) {
			categoryCounts.set(primaryCategory, (categoryCounts.get(primaryCategory) ?? 0) + 1)
		}
	}

	return selected
}

export function resolveRelatedPosts(
	post: BlogPost,
	candidates: BlogPost[],
	options: RelatedPostsOptions = {}
): RelatedPostResult[] {
	const limit = Math.max(0, options.limit ?? 4)
	const now = options.now ?? new Date()
	const sourceTokens = textTokens(post)
	const publishedCandidates = candidates.filter(
		(candidate) => candidate.id !== post.id && candidate.status === 'published'
	)
	const textScores = getTextScores(post, publishedCandidates)

	const ranked = publishedCandidates
		.map((candidate) => {
			const reasons: RelatedPostResult['reasons'] = []
			let score = 0
			if (
				post.relatedPostIds.includes(candidate.id) ||
				post.relatedPostIds.includes(candidate.slug)
			) {
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
			const sharedTokens = [...textTokens(candidate)].filter((token) =>
				sourceTokens.has(token)
			).length
			const textScore = textScores.get(candidate.id) ?? 0
			if (sharedTokens > 0 || textScore > 0) {
				reasons.push('text')
				score += Math.max(Math.min(sharedTokens, 8), textScore)
			}
			const ageDays = Math.max(0, (now.getTime() - new Date(candidate.date).getTime()) / 86_400_000)
			const recency = Math.max(0, 4 - Math.floor(ageDays / 365))
			if (recency > 0) {
				reasons.push('recent')
				score += recency
			}

			return { post: candidate, reasons, score }
		})
		.filter((result) => result.score > 0)
		.sort(
			(a, b) =>
				b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
		)

	return diversify(ranked, limit)
}
