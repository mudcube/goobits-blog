import type { BlogSort } from '../core/blogQuery.js'

export interface BlogFilterValues {
	search: string
	sort: BlogSort
}

export type BlogFilterNavigate = (href: string) => Promise<void> | void

export interface BlogFilterNavigation {
	apply: (values: BlogFilterValues) => Promise<boolean>
	cancel: () => void
	scheduleSearch: (values: BlogFilterValues) => void
}

export interface BlogFilterNavigationOptions {
	currentUrl?: () => string | URL
	debounceMs?: number
	navigate?: BlogFilterNavigate
}

const PLACEHOLDER_ORIGIN = 'https://blog.invalid'

function currentBrowserUrl(): string {
	return window.location.href
}

function navigateBrowser(href: string): void {
	window.location.assign(href)
}

function comparableHref(value: string | URL): string {
	const url = value instanceof URL ? value : new URL(value, PLACEHOLDER_ORIGIN)
	return `${ url.pathname }${ url.search }${ url.hash }`
}

export function buildBlogFilterHref(currentUrl: string | URL, values: BlogFilterValues): string {
	const url = currentUrl instanceof URL
		? new URL(currentUrl)
		: new URL(currentUrl, PLACEHOLDER_ORIGIN)
	const query = values.search.trim()

	url.searchParams.delete('page')
	if (query) {
		url.searchParams.set('q', query)
	} else {
		url.searchParams.delete('q')
	}
	if (values.sort === 'newest') {
		url.searchParams.delete('sort')
	} else {
		url.searchParams.set('sort', values.sort)
	}

	return comparableHref(url)
}

export function createBlogFilterNavigation(options: BlogFilterNavigationOptions = {}): BlogFilterNavigation {
	const currentUrl = options.currentUrl ?? currentBrowserUrl
	const navigate = options.navigate ?? navigateBrowser
	const debounceMs = Math.max(0, options.debounceMs ?? 250)
	let searchTimer: ReturnType<typeof setTimeout> | null = null

	function cancel(): void {
		if (searchTimer) {
			clearTimeout(searchTimer)
			searchTimer = null
		}
	}

	async function apply(values: BlogFilterValues): Promise<boolean> {
		cancel()
		const current = currentUrl()
		const href = buildBlogFilterHref(current, values)
		if (href === comparableHref(current)) {
			return false
		}
		await navigate(href)
		return true
	}

	function scheduleSearch(values: BlogFilterValues): void {
		cancel()
		searchTimer = setTimeout(() => {
			searchTimer = null
			void apply(values)
		}, debounceMs)
	}

	return { apply, cancel, scheduleSearch }
}
