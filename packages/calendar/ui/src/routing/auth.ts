import { ApiClientError } from '../api/http'
import { getCalendarUiConfig } from '../config'

export function isCalendarLoginPath(pathname: string): boolean {
	const calendarLoginPath = getCalendarUiConfig().routes.calendarLoginPath
	return pathname === calendarLoginPath || pathname === `${calendarLoginPath}/`
}

export function buildCalendarLoginRedirect(pathname: string): string {
	const calendarLoginPath = getCalendarUiConfig().routes.calendarLoginPath
	return `${calendarLoginPath}?redirect=${encodeURIComponent(pathname)}`
}

export function shouldRedirectCalendarGuest(user: unknown, pathname: string): boolean {
	return !user && !isCalendarLoginPath(pathname)
}

export function handleUnauthorizedSessionError(error: unknown): boolean {
	if (error instanceof ApiClientError && error.status === 401) {
		window.location.reload()
		return true
	}
	return false
}
