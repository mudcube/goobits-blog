import type { ProcessedPost } from '@goobits/blog/utils'

export type JournalMetadata = Omit<ProcessedPost['metadata'], 'fm'> & {
	fm: ProcessedPost['metadata']['fm'] & {
		coverImage?: string
	}
}

export type JournalPost = Omit<ProcessedPost, 'date' | 'metadata'> & {
	date: Date
	metadata: JournalMetadata
	year: string
	month: string
	slug: string
	urlPath: string
}

export type JournalSort = 'newest' | 'oldest' | 'title'

export { formatJournalLabel } from '@goobits/blog-theme-miko'

export function getJournalCategories(posts: JournalPost[]) {
	const categories = new Set<string>()
	for (const post of posts) {
		for (const category of post.metadata.fm?.categories || []) {
			categories.add(category)
		}
	}

	return [...categories].sort(localeSort)
}

export function getFirstCategory(post: JournalPost) {
	return post.metadata.fm?.categories?.[0] || ''
}

/**
 * Convert a JournalPost (app viewmodel, `date: Date`) back to a
 * ProcessedPost (blog core type, `date: string`) so it can be passed
 * to blog core helpers like `getCoverImageUrl` and `getPostExcerpt`.
 *
 * This is a thin shape adapter — no data transformation beyond
 * serializing the date.
 */
export function toProcessedPost(post: JournalPost | null | undefined): ProcessedPost | null {
	if (!post) { return null }
	return {
		...post,
		date: post.date instanceof Date ? post.date.toISOString() : String(post.date ?? '')
	} as ProcessedPost
}

export function filterAndSortJournalPosts(
	posts: JournalPost[],
	searchQuery: string,
	selectedCategory: string,
	sortBy: JournalSort
) {
	const query = normalizeQuery(searchQuery)
	const filtered = posts.filter((post) => {
		if (selectedCategory !== 'all') {
			const categories = post.metadata.fm?.categories || []
			if (!categories.includes(selectedCategory)) return false
		}

		return matchesQuery(query, [post.metadata.fm?.title || '', post.urlPath || ''])
	})

	return filtered.sort((a, b) => {
		if (sortBy === 'title') return localeSort(a.metadata.fm?.title || '', b.metadata.fm?.title || '')

		const aTime = new Date(a.date).getTime()
		const bTime = new Date(b.date).getTime()
		if (sortBy === 'oldest') return aTime - bTime
		return bTime - aTime
	})
}

function localeSort(a: string, b: string) {
	return a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true })
}

function normalizeQuery(value: string) {
	return value.trim().toLowerCase()
}

function matchesQuery(query: string, values: string[]) {
	if (!query) return true
	return values.some((value) => String(value || '').toLowerCase().includes(query))
}
