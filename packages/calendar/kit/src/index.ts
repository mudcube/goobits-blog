import { apiError, apiOk, apiValidationError, logApiError, noStoreHeaders } from './http/api'
import { getCalendarUserId, requireCalendarUserId, runCalendarRequest, unauthorizedCalendar } from './http/calendar-auth'
import { buildEnv, type RuntimeEnv } from './runtime/build-env'
import {
	createCalendarAuthAdapters,
	createCalendarSessionAdapter,
	createCalendarUserAdapter
} from './auth/calendar-adapters'
import { getDevDb } from './dev/devDb'
import type { D1DatabaseLike, D1PreparedStatement, R2BucketLike, R2PutOptions } from './dev/types'

// NOTE: Calendar-specific auth wiring (getCalendarAuth, login context, etc.)
// used to live here but reaches into @calendar/core domain logic, which would
// invert the desired core ← kit layering. It now lives in
// @calendar/app/src/server/auth/calendar.ts where domain-aware auth setup
// belongs. kit stays as cross-cutting infra (HTTP, runtime, dev shim, auth
// adapters that only depend on @goobits/auth).

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
	getDevDb
}

export type { RuntimeEnv, D1DatabaseLike, D1PreparedStatement, R2BucketLike, R2PutOptions }
