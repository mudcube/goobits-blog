export type CalendarBrandConfig = {
	siteName: string
	calendarName: string
	adminEmail: string
	inviteBypassDomain: string
}

export type CalendarRoutesConfig = {
	calendarBase: string
	adminBase: string
	authBase: string
	apiCalendarBase: string
	apiAdminBase: string
	apiCalendarAdminBase: string
	calendarLoginPath: string
	calendarLoginRedirectPath: string
}

export type CalendarIcsConfig = {
	productId: string
	uidPrefix: string
	uidDomain: string
	filename: string
}

export type CalendarConfig = {
	brand: CalendarBrandConfig
	routes: CalendarRoutesConfig
	ics: CalendarIcsConfig
}

export type CalendarConfigInput = {
	brand?: Partial<CalendarBrandConfig>
	routes?: Partial<CalendarRoutesConfig>
	ics?: Partial<CalendarIcsConfig>
}

const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
	brand: {
		siteName: 'SITE',
		calendarName: 'Community Calendar',
		adminEmail: 'admin@example.com',
		inviteBypassDomain: ''
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
	},
	ics: {
		productId: '-//CALENDAR//Social Calendar//EN',
		uidPrefix: 'calendar',
		uidDomain: 'calendar.local',
		filename: 'calendar-events.ics'
	}
}

let calendarConfig: CalendarConfig = {
	brand: { ...DEFAULT_CALENDAR_CONFIG.brand },
	routes: { ...DEFAULT_CALENDAR_CONFIG.routes },
	ics: { ...DEFAULT_CALENDAR_CONFIG.ics }
}

export function getCalendarConfig(): CalendarConfig {
	return {
		brand: { ...calendarConfig.brand },
		routes: { ...calendarConfig.routes },
		ics: { ...calendarConfig.ics }
	}
}

export function configureCalendarConfig(input: CalendarConfigInput = {}) {
	calendarConfig = {
		brand: {
			...calendarConfig.brand,
			...(input.brand ?? {})
		},
		routes: {
			...calendarConfig.routes,
			...(input.routes ?? {})
		},
		ics: {
			...calendarConfig.ics,
			...(input.ics ?? {})
		}
	}
	return getCalendarConfig()
}

export function resetCalendarConfig() {
	calendarConfig = {
		brand: { ...DEFAULT_CALENDAR_CONFIG.brand },
		routes: { ...DEFAULT_CALENDAR_CONFIG.routes },
		ics: { ...DEFAULT_CALENDAR_CONFIG.ics }
	}
	return getCalendarConfig()
}
