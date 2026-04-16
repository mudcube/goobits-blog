export type AdminNavSection = 'dashboard' | 'crew' | 'events' | 'settings'

export type AdminBreadcrumbItem = {
	label: string
	href?: string
}

export type AdminRouteActionId =
	| 'view-program'
	| 'program-settings'
	| 'new-event'
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
		| 'event-new'
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

export function getAdminRoute(pathname: string, options: GetAdminRouteOptions = {}): AdminRouteInfo {
	const normalized = normalizePath(pathname)
	const hrefWithMock = options.hrefWithMock ?? ((path: string) => path)
	const baseCrumbs: AdminBreadcrumbItem[] = [
		{ label: 'Dashboard', href: hrefWithMock('/schedule/admin/') }
	]

	if (normalized === '/schedule/admin') {
		return {
			kind: 'dashboard',
			currentSection: 'dashboard',
			title: 'Dashboard',
			breadcrumbs: baseCrumbs,
			actions: ['view-calendar']
		}
	}

	if (normalized === '/schedule/admin/crew') {
		return {
			kind: 'crew-index',
			currentSection: 'crew',
			title: 'Crew',
			breadcrumbs: [...baseCrumbs, { label: 'Crew' }],
			actions: ['crew-invite']
		}
	}

	const crewDetailMatch = normalized.match(/^\/schedule\/admin\/crew\/([^/]+)$/)
	if (crewDetailMatch) {
		const userId = crewDetailMatch[1]!
		return {
			kind: 'crew-detail',
			currentSection: 'crew',
			title: 'Crew',
			breadcrumbs: [
				...baseCrumbs,
				{ label: 'Crew', href: hrefWithMock('/schedule/admin/crew/') },
				{ label: prettySegment(userId) }
			],
			actions: [],
			userId
		}
	}

	if (normalized === '/schedule/admin/events') {
		return {
			kind: 'events-index',
			currentSection: 'events',
			title: 'Events',
			breadcrumbs: [...baseCrumbs, { label: 'Events' }],
			actions: ['new-event']
		}
	}

	if (normalized === '/schedule/admin/events/new') {
		return {
			kind: 'event-new',
			currentSection: 'events',
			title: 'Events',
			breadcrumbs: [
				...baseCrumbs,
				{ label: 'Events', href: hrefWithMock('/schedule/admin/events/') },
				{ label: 'New Event' }
			],
			actions: ['back-to-events']
		}
	}

	const eventProgramMatch = normalized.match(/^\/schedule\/admin\/events\/program\/([^/]+)$/)
	if (eventProgramMatch) {
		const programSlug = eventProgramMatch[1]!
		return {
			kind: 'event-program',
			currentSection: 'events',
			title: 'Events',
			breadcrumbs: [
				...baseCrumbs,
				{ label: 'Events', href: hrefWithMock('/schedule/admin/events/') },
				{ label: prettySegment(programSlug) }
			],
			actions: ['view-program', 'program-settings'],
			programSlug
		}
	}

	const eventDetailMatch = normalized.match(/^\/schedule\/admin\/events\/detail\/([^/]+)$/)
	if (eventDetailMatch) {
		const eventId = eventDetailMatch[1]!
		return {
			kind: 'event-detail',
			currentSection: 'events',
			title: 'Events',
			breadcrumbs: [
				...baseCrumbs,
				{ label: 'Events', href: hrefWithMock('/schedule/admin/events/') },
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
