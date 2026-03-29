import { configureCalendarConfig } from '@calendar/core'

export const mikoCalendarPreset = {
	brand: {
		siteName: 'MIKO.ART',
		calendarName: 'Rainbow Gym',
		adminEmail: 'admin@miko.art',
		inviteBypassDomain: '@miko.art'
	},
	routes: {
		calendarBase: '/schedule',
		adminBase: '/schedule/admin',
		authBase: '/auth',
		apiCalendarBase: '/api/calendar',
		apiAdminBase: '/api/admin',
		apiCalendarAdminBase: '/api/calendar/admin',
		calendarLoginPath: '/schedule/login',
		calendarLoginRedirectPath: '/schedule/login/redirect'
	},
	ics: {
		productId: '-//MIKO.ART//Calendar Social//EN',
		uidPrefix: 'miko-calendar',
		uidDomain: 'miko.art',
		filename: 'miko-events.ics'
	}
} as const

export function applyMikoCalendarPreset() {
	return configureCalendarConfig(mikoCalendarPreset)
}
