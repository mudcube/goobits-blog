import type { JournalPost } from '@src/domains/journal/server/posts'
import { localeSort, matchesQuery, normalizeQuery } from '$lib/utils/collections'
import { formatDateYear } from '$lib/utils/date'

export type JournalSort = 'newest' | 'oldest' | 'title'

const JOURNAL_LABEL_MAP: Record<string, string> = {
	apps: 'Apps',
	'code-art': 'Code Art',
	colrd: 'Colrd',
	diy: 'DIY'
}

export function formatJournalLabel(value: string) {
	const normalized = value.trim().toLowerCase()
	if (!normalized) return ''
	if (JOURNAL_LABEL_MAP[normalized]) return JOURNAL_LABEL_MAP[normalized]
	return normalized
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

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

export function groupJournalPostsByYear(posts: JournalPost[]) {
	const grouped: Record<string, JournalPost[]> = {}
	for (const post of posts) {
		const year = formatDateYear(post.date)
		if (!grouped[year]) grouped[year] = []
		grouped[year].push(post)
	}
	return grouped
}

export function getJournalYearOrder(grouped: Record<string, JournalPost[]>) {
	return Object.keys(grouped).sort((a, b) => Number(b) - Number(a))
}
