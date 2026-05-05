import {
	getAdminViewSettings as fetchAdminViewSettings,
	setAdminViewSettings as commitAdminViewSettings
} from '@calendar/ui/api/admin'

export type AdminCalendarWeekStart = 'monday' | 'sunday'

const DEFAULT_WEEK_START: AdminCalendarWeekStart = 'monday'

export const CALENDAR_WEEK_START_CHANGED_EVENT = 'admin-calendar-week-start-changed'

let cached: AdminCalendarWeekStart = DEFAULT_WEEK_START
let hydrated = false

function dispatchChange(value: AdminCalendarWeekStart) {
	if (typeof window === 'undefined') return
	window.dispatchEvent(
		new CustomEvent<AdminCalendarWeekStart>(CALENDAR_WEEK_START_CHANGED_EVENT, { detail: value })
	)
}

export function hydrateAdminCalendarWeekStart(value: AdminCalendarWeekStart) {
	if (cached === value && hydrated) return
	cached = value
	hydrated = true
	dispatchChange(value)
}

export function getAdminCalendarWeekStart(): AdminCalendarWeekStart {
	return cached
}

export async function refreshAdminCalendarWeekStart(): Promise<AdminCalendarWeekStart> {
	const result = await fetchAdminViewSettings()
	cached = result.view.weekStart
	hydrated = true
	dispatchChange(cached)
	return cached
}

export async function setAdminCalendarWeekStart(
	value: AdminCalendarWeekStart
): Promise<AdminCalendarWeekStart> {
	const previous = cached
	cached = value
	hydrated = true
	dispatchChange(value)
	try {
		const result = await commitAdminViewSettings({ weekStart: value })
		cached = result.view.weekStart
		dispatchChange(cached)
		return cached
	} catch (error) {
		cached = previous
		dispatchChange(previous)
		throw error
	}
}
