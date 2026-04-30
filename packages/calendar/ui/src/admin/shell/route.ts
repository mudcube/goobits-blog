import { getCalendarUiConfig } from '../../config'

export type AdminNavSection = 'dashboard' | 'crew' | 'events' | 'settings'

export type AdminBreadcrumbItem = {
	label: string
	href?: string
}

export type AdminRouteActionId =
	| 'view-program'
	| 'program-settings'
	| 'new-program'
	| 'back-to-events'
	| 'crew-invite'
	| 'view-calendar'
	| 'event-edit'
	| 'event-cancel'

export type AdminRouteInfo = {
	kind:
		| 'dashboard'
		| 'crew-index'
		| 'crew-detail'
		| 'events-index'
		| 'event-program'
		| 'event-detail'
		| 'settings'
	currentSection: AdminNavSection
	title: string
	breadcrumbs: AdminBreadcrumbItem[]
	actions: AdminRouteActionId[]
	programSlug?: string
	eventId?: string
	userId?: string
}

type GetAdminRouteOptions = {
	detailLabel?: string | null
	hrefWithMock?: (path: string) => string
}

function normalizePath(pathname: string) {
	return pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
}

function prettySegment(value: string) {
	return value
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}

function escapeRegex(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getAdminRoute(pathname: string, options: GetAdminRouteOptions = {}): AdminRouteInfo {
	const config = getCalendarUiConfig()
	const adminBase = config.routes.adminBase
	const normalized = normalizePath(pathname)
	const hrefWithMock = options.hrefWithMock ?? ((path: string) => path)
	const baseCrumbs: AdminBreadcrumbItem[] = [
		{ label: 'Dashboard', href: hrefWithMock(`${adminBase}/`) }
	]
	const adminBasePattern = escapeRegex(adminBase)

	if (normalized === adminBase) {
		return {
			kind: 'dashboard',
			currentSection: 'dashboard',
			title: 'Dashboard',
			breadcrumbs: baseCrumbs,
			actions: ['view-calendar']
		}
	}

	if (normalized === `${adminBase}/crew`) {
		return {
			kind: 'crew-index',
			currentSection: 'crew',
			title: 'Crew',
			breadcrumbs: [...baseCrumbs, { label: 'Crew' }],
			actions: ['crew-invite']
		}
	}

	const crewDetailMatch = normalized.match(new RegExp(`^${adminBasePattern}/crew/([^/]+)$`))
	if (crewDetailMatch) {
		const userId = crewDetailMatch[1]!
		return {
			kind: 'crew-detail',
			currentSection: 'crew',
			title: 'Crew',
			breadcrumbs: [
				...baseCrumbs,
				{ label: 'Crew', href: hrefWithMock(`${adminBase}/crew/`) },
				{ label: prettySegment(userId) }
			],
			actions: [],
			userId
		}
	}

	if (normalized === `${adminBase}/events`) {
		return {
			kind: 'events-index',
			currentSection: 'events',
			title: 'Events',
			breadcrumbs: [...baseCrumbs, { label: 'Events' }],
			actions: ['new-program']
		}
	}

	const eventProgramMatch = normalized.match(new RegExp(`^${adminBasePattern}/events/program/([^/]+)$`))
	if (eventProgramMatch) {
		const programSlug = eventProgramMatch[1]!
		if (programSlug === 'new') {
			return {
				kind: 'event-program',
				currentSection: 'events',
				title: 'Events',
				breadcrumbs: [
					...baseCrumbs,
					{ label: 'Events', href: hrefWithMock(`${adminBase}/events/`) },
					{ label: 'New Program' }
				],
				actions: ['back-to-events']
			}
		}
		return {
			kind: 'event-program',
			currentSection: 'events',
			title: 'Events',
			breadcrumbs: [
				...baseCrumbs,
				{ label: 'Events', href: hrefWithMock(`${adminBase}/events/`) },
				{ label: prettySegment(programSlug) }
			],
			actions: ['view-program', 'program-settings'],
			programSlug
		}
	}

	const eventDetailMatch = normalized.match(new RegExp(`^${adminBasePattern}/events/detail/([^/]+)$`))
	if (eventDetailMatch) {
		const eventId = eventDetailMatch[1]!
		return {
			kind: 'event-detail',
			currentSection: 'events',
			title: 'Events',
			breadcrumbs: [
				...baseCrumbs,
				{ label: 'Events', href: hrefWithMock(`${adminBase}/events/`) },
				{ label: options.detailLabel?.trim() || 'Event Detail' }
			],
			actions: ['event-edit', 'event-cancel'],
			eventId
		}
	}


	return {
		kind: 'settings',
			currentSection: 'settings',
			title: 'Settings',
			breadcrumbs: [...baseCrumbs, { label: 'Settings' }],
			actions: []
	}
}
