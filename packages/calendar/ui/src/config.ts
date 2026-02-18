import { getCalendarConfig } from '@calendar/core'

function stripTrailingSlash(path: string) {
	return path.endsWith('/') ? path.slice(0, -1) : path
}

export function getCalendarUiConfig() {
	const config = getCalendarConfig()
	return {
		...config,
		routes: {
			...config.routes,
			calendarBase: stripTrailingSlash(config.routes.calendarBase),
			adminBase: stripTrailingSlash(config.routes.adminBase),
			authBase: stripTrailingSlash(config.routes.authBase),
			apiCalendarBase: stripTrailingSlash(config.routes.apiCalendarBase),
			apiAdminBase: stripTrailingSlash(config.routes.apiAdminBase),
			apiCalendarAdminBase: stripTrailingSlash(config.routes.apiCalendarAdminBase),
			calendarLoginPath: stripTrailingSlash(config.routes.calendarLoginPath),
			calendarLoginRedirectPath: stripTrailingSlash(config.routes.calendarLoginRedirectPath)
		}
	}
}

export function withCalendarApi(path: string) {
	return `${getCalendarUiConfig().routes.apiCalendarBase}${path}`
}

export function withAdminApi(path: string) {
	return `${getCalendarUiConfig().routes.apiAdminBase}${path}`
}
