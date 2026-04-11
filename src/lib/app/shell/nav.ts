import { isNavItemVisibleInStage, releasedHeaderNavItems, type ReleaseStage } from '$lib/app/release'

export type NavItem = {
	href: string
	label: string
	matchPrefix?: boolean
	external?: boolean
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
	{ href: 'https://beheremeow.app', label: 'BeHereMeow', external: true },
	{ href: 'https://colorpiano.com', label: 'ColorPiano', external: true },
	{ href: 'https://github.com/mudcube', label: 'GitHub', external: true },
	{ href: 'https://sketch.io', label: 'Sketch.IO', external: true }
]
