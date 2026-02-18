export const mikoCalendarPreset = {
	brand: {
		siteName: 'MIKO.ART',
		calendarName: 'Rainbow Gym',
		adminEmail: 'admin@miko.art',
		inviteBypassDomain: '@miko.art'
	},
	routes: {
		calendarBase: '/calendar',
		adminBase: '/admin',
		authBase: '/auth',
		apiCalendarBase: '/api/calendar',
		apiAdminBase: '/api/admin',
		apiCalendarAdminBase: '/api/calendar/admin',
		calendarLoginPath: '/calendar/login',
		calendarLoginRedirectPath: '/calendar/login/redirect'
	}
} as const
