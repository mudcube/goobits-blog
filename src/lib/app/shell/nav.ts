import { isNavItemVisibleInStage, releasedHeaderNavItems, type ReleaseStage } from '$lib/app/release'

export type NavItem = {
	href: string
	label: string
	matchPrefix?: boolean
	external?: boolean
	nofollow?: boolean
}

export function getHeaderNavItems(activeStage: ReleaseStage): NavItem[] {
	return releasedHeaderNavItems
		.filter((item) => isNavItemVisibleInStage(item, activeStage))
		.map(({ stages: _stages, ...item }) => item)
}

export const footerPrimaryItems: NavItem[] = [
	{ href: '/labs', label: 'Labs' }
]

export const footerLegalItems: NavItem[] = [
	{ href: '/cookies', label: 'Cookies' },
	{ href: '/privacy', label: 'Privacy' },
	{ href: '/terms', label: 'Terms' }
]

export const footerElsewhereItems: NavItem[] = [
	{ href: 'https://beheremeow.app', label: 'BeHereMeow', external: true, nofollow: false },
	{ href: 'https://colorpiano.com', label: 'ColorPiano', external: true, nofollow: false },
	{ href: 'https://github.com/mudcube', label: 'GitHub', external: true, nofollow: true },
	{ href: 'https://sketch.io', label: 'Sketch.IO', external: true, nofollow: false }
]
