import type { NavItem } from '../../types/nav'

export function normalizeTopbarPath(path: string) {
	if (!path || path === '/') return '/'
	return path.endsWith('/') ? path.slice(0, -1) : path
}

export function isTopbarItemActive(item: NavItem, currentPath: string) {
	const path = normalizeTopbarPath(currentPath)
	const href = normalizeTopbarPath(item.href)
	if (href === '/') return path === '/'
	if (item.matchPrefix) return path === href || path.startsWith(`${href}/`)
	return path === href
}

export function shouldDisableTopbarPrefetch(href: string, disablePrefetchPrefixes: string[]) {
	return disablePrefetchPrefixes.some((prefix) => href.startsWith(prefix))
}

export function isTopbarSeparator(item: NavItem) {
	return item.href === ''
}
