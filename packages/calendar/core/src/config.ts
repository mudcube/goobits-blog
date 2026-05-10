// Config sub-entry for @calendar/core.
//
// Re-exports the calendar config + activity catalog + program slug helpers
// + venue timezone + env helpers. These are cross-cutting in that they're
// consumed almost everywhere, but they sit at the bottom of the dependency
// graph so a focused entry helps callers express "I'm just reading config".

export {
	configureCalendarConfig,
	getCalendarConfig,
	resetCalendarConfig,
	type CalendarConfig,
	type CalendarConfigInput
} from './config/calendar.ts'

export { requireEnv, getEnv } from './config/env.ts'

export {
	configureCalendarActivityCatalog,
	getCalendarActivities,
	getCalendarActivityDefinitions,
	getCalendarActivityList,
	resetCalendarActivityCatalog,
	type CalendarActivityConfig,
	type CalendarActivityDefinition
} from './social/activities.ts'

export { isKnownProgramSlug, isValidProgramSlug, type CalendarProgramSlug } from './social/programs.ts'

export { VENUE_TIMEZONE, addWeeksInVenueTime } from './social/venue.ts'
