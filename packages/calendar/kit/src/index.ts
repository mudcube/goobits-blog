import { apiError, apiOk, apiValidationError, logApiError, noStoreHeaders } from './http/api'
import { getCalendarUserId, unauthorizedCalendar } from './http/calendar-auth'
import { buildEnv, type RuntimeEnv } from './runtime/build-env'
import { getAdminAuth, ensureAdminAccount } from './auth/admin'
import { getCalendarAuth, getCalendarRedirect, setCalendarLoginContext } from './auth/calendar'
import { getDevDb } from './dev/devDb'
import type { D1DatabaseLike, D1PreparedStatement } from './dev/types'

export {
	apiError,
	apiOk,
	apiValidationError,
	logApiError,
	noStoreHeaders,
	getCalendarUserId,
	unauthorizedCalendar,
	buildEnv,
	getAdminAuth,
	ensureAdminAccount,
	getCalendarAuth,
	getCalendarRedirect,
	setCalendarLoginContext,
	getDevDb
}

export type { RuntimeEnv, D1DatabaseLike, D1PreparedStatement }
