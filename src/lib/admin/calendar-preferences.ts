export type AdminCalendarWeekStart = 'monday' | 'sunday'

const STORAGE_KEY = 'admin.calendar.weekStart'
export const CALENDAR_WEEK_START_CHANGED_EVENT = 'admin-calendar-week-start-changed'

export function getAdminCalendarWeekStart(): AdminCalendarWeekStart {
	if (typeof window === 'undefined') return 'monday'
	const value = window.localStorage.getItem(STORAGE_KEY)
	return value === 'sunday' ? 'sunday' : 'monday'
}

export function setAdminCalendarWeekStart(value: AdminCalendarWeekStart) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY, value)
	window.dispatchEvent(new CustomEvent<AdminCalendarWeekStart>(CALENDAR_WEEK_START_CHANGED_EVENT, { detail: value }))
}
