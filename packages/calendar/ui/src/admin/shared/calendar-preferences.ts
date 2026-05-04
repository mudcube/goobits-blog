export type AdminCalendarWeekStart = 'monday' | 'sunday'

// TODO: migrate this preference to the DB so it travels across devices.
// Current state: per-browser via localStorage, since week-start is a visual
// preference with a sane default and one-admin setups don't need cross-device.
// To migrate:
//   1. Add a `admin_calendar_week_start` row in calendar_admin_settings
//      (existing global key/value table — see migration 0015) OR a per-admin
//      preferences JSON column on calendar_admins (preferred for future
//      per-admin settings).
//   2. Server helper in @calendar/core for read/write.
//   3. API route under /api/admin/preferences (GET + PUT).
//   4. Initial load via dashboard.loadStatus or a separate preferences fetch.
//   5. setAdminCalendarWeekStart becomes write-through: localStorage cache
//      for fast initial paint, plus fire-and-forget POST to the API.
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
