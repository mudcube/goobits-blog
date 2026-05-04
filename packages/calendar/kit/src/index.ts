import { apiError, apiOk, apiValidationError, logApiError, noStoreHeaders } from './http/api'
import { getCalendarUserId, requireCalendarUserId, runCalendarRequest, unauthorizedCalendar } from './http/calendar-auth'
import { buildEnv, type RuntimeEnv } from './runtime/build-env'
import {
	createCalendarAuthAdapters,
	createCalendarSessionAdapter,
	createCalendarUserAdapter
} from './auth/calendar-adapters'
import {
	clearCalendarLoginContext,
	getCalendarAuth,
	getCalendarLoginContext,
	getCalendarRedirect,
	normalizeCalendarRedirect,
	setCalendarLoginContext
} from './auth/calendar'
import { getDevDb } from './dev/devDb'
import type { D1DatabaseLike, D1PreparedStatement } from './dev/types'

export {
	apiError,
	apiOk,
	apiValidationError,
	logApiError,
	noStoreHeaders,
	getCalendarUserId,
	requireCalendarUserId,
	runCalendarRequest,
	unauthorizedCalendar,
	buildEnv,
	createCalendarAuthAdapters,
	createCalendarSessionAdapter,
	createCalendarUserAdapter,
	getCalendarAuth,
	getCalendarLoginContext,
	getCalendarRedirect,
	normalizeCalendarRedirect,
	clearCalendarLoginContext,
	setCalendarLoginContext,
	getDevDb
}

export type { RuntimeEnv, D1DatabaseLike, D1PreparedStatement }
