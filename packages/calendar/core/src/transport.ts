// Transport sub-entry for @calendar/core.
//
// Request-validation parsers + the shared TransportValidationError.
// (Long-term these belong in @calendar/kit, but they're exposed here today
// because too many call sites would break with a move; see the federation
// README for the kit/core layering goal.)

export {
	parseAdminRulesInput,
	parseAdminProgramMutationInput,
	parseAdminCreateEventsBatchInput,
	parseAdminEventUpdateInput,
	parseAdminSyncQueueActionInput,
	parseSyncQueueProcessLimitInput,
	parseAdminUserProgramAccessInput,
	parseAdminPaymentDefaultsInput,
	type AdminRulesInput,
	type AdminProgramUpsertInput,
	type AdminProgramMutationInput,
	type AdminCreateEventsBatchInput,
	type AdminEventUpdateInput,
	type AdminSyncQueueActionInput,
	type AdminUserProgramAccessInput,
	type AdminPaymentDefaultsInput
} from './transport/admin.ts'

export {
	parseCalendarJoinEventInput,
	parseCalendarProfileInput,
	parseCalendarInviteCreateInput,
	parseCalendarInviteClaimInput,
	parseCalendarSessionBootstrapInput,
	parseCalendarAvailabilityInput,
	parseCalendarBookingLookupInput,
	parseDiscordWebhookTextInput,
	type CalendarJoinEventInput,
	type CalendarProfileInput,
	type CalendarInviteCreateInput,
	type CalendarInviteClaimInput,
	type CalendarSessionBootstrapInput,
	type CalendarAvailabilityInput,
	type CalendarBookingLookupInput
} from './transport/calendar.ts'

export { parsePositiveInteger } from './transport/parse.ts'
export { TransportValidationError, asTransportErrorMessage } from './transport/errors.ts'
