import type { CalendarProviderName } from './providers'
import { getCalendarUiConfig } from '../../config'

export type AuthRedirectOptions = {
	inviteCode?: string
	redirectTo?: string
}

export function buildProviderLoginHref(provider: CalendarProviderName, options: AuthRedirectOptions = {}) {
	const authBase = getCalendarUiConfig().routes.authBase
	const params = new URLSearchParams()
	if (options.inviteCode) params.set('invite', options.inviteCode)
	if (options.redirectTo) params.set('redirect', options.redirectTo)

	const query = params.toString()
	return `${authBase}/${provider}${query ? `?${query}` : ''}`
}
