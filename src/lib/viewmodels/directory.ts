import { localeSort, matchesQuery, normalizeQuery } from '$lib/utils/collections'

export type DirectoryItem = {
	href: string
	title: string
	vibe: string
	date?: string
}

export type DirectorySort = 'title' | 'path'

export function filterAndSortDirectoryItems(
	items: DirectoryItem[],
	searchQuery: string,
	sortBy: DirectorySort
) {
	const query = normalizeQuery(searchQuery)
	const filtered = items.filter((item) => matchesQuery(query, [item.title, item.href, item.vibe]))

	return filtered.sort((a, b) => {
		if (sortBy === 'path') return localeSort(a.href, b.href)
		return localeSort(a.title, b.title)
	})
}
