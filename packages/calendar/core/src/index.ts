import {
	getGoogleAuthUrl,
	exchangeGoogleCode,
	ensureValidGoogleToken,
	googleFreeBusy,
	googleCreateEvent,
	googleDeleteEvent,
	DEFAULT_SCOPES
} from './providers/google/index.ts'
import {
	getConnection,
	saveConnection,
	deleteConnection,
	createOauthState,
	consumeOauthState,
	checkRateLimit,
	listCalendarUsers
} from './storage/d1.ts'
import { toErrorResponse } from './utils/errors.ts'
import {
	getAdminEmail,
	ADMIN_COOKIE_NAME,
	createAdminAdapters,
	ensureAdminUser,
	parseCookieHeader,
	validateAdminSessionFromHeader
} from './admin/auth.ts'
import {
	configureCalendarConfig,
	getCalendarConfig,
	resetCalendarConfig,
	type CalendarConfig,
	type CalendarConfigInput
} from './config/calendar.ts'
import { requireEnv, getEnv } from './config/env.ts'
import { getCalendarActivities, getCalendarActivityList, type CalendarActivityConfig } from './social/activities.ts'
import { isKnownProgramSlug, isValidProgramSlug, type CalendarProgramSlug } from './social/programs.ts'
import { buildPaymentLink, type PaymentProvider } from './services/pay.ts'
import {
	loadCalendarMemberShellData,
	loadCalendarMemberHomeData,
	loadCalendarMemberProfileData,
	type CalendarHomeFeedEvent,
	type CalendarMemberHomeData,
	type CalendarShellUser,
	type CalendarMemberShellData,
	type CalendarMemberProfileData
} from './services/member-pages.ts'
import {
	getCalendarPrograms,
	getEnabledCalendarPrograms,
	isCalendarProgramEnabled,
	setCalendarProgramEnabled,
	getCalendarProgramBySlug,
	getEnabledCalendarProgramByActivityName,
	upsertCalendarProgram,
	deleteCalendarProgram,
	type CalendarProgramState,
	type CalendarProgramInput
} from './services/programs.ts'
import {
	listUpcomingEvents,
	listRecentEvents,
	listEventsFeed,
	createEventsBatch,
	getEventMutationState,
	joinEvent,
	leaveEvent,
	bumpWaitlist,
	updateEventCapacity,
	setAttendanceStatus,
	updateEventMemory,
	getCalendarProfile,
	saveCalendarProfile,
	type CalendarEventParticipant,
	type CalendarFeedEvent,
	type CalendarEventsFeed,
	type CalendarProfile,
	type CalendarEventMutationState
} from './services/social.ts'
import {
	enqueueCalendarSyncJob,
	getCalendarSyncQueueHealth,
	retryCalendarSyncDeadLetters,
	purgeCalendarSyncDeadLetters,
	processCalendarSyncQueue
} from './services/sync-queue.ts'
import {
	generateInviteCode,
	createInvite,
	validateInvite,
	consumeInvite,
	listInvites,
	deleteInvite,
	hasUserRedeemedAnyInvite
} from './calendar/invites.ts'
import {
	parseAdminRulesInput,
	parseAdminProgramMutationInput,
	parseAdminCreateEventsBatchInput,
	parseAdminEventUpdateInput,
	parseAdminSyncQueueActionInput,
	parseSyncQueueProcessLimitInput,
	type AdminRulesInput,
	type AdminProgramUpsertInput,
	type AdminProgramMutationInput,
	type AdminCreateEventsBatchInput,
	type AdminEventUpdateInput,
	type AdminSyncQueueActionInput
} from './transport/admin.ts'
import {
	parseCalendarJoinEventInput,
	parseCalendarProfileInput,
	parseCalendarInviteCreateInput,
	parseCalendarSessionBootstrapInput,
	parseDiscordWebhookTextInput,
	type CalendarJoinEventInput,
	type CalendarProfileInput,
	type CalendarInviteCreateInput,
	type CalendarSessionBootstrapInput
} from './transport/calendar.ts'
import { TransportValidationError, asTransportErrorMessage } from './transport/errors.ts'

export {
	getGoogleAuthUrl,
	exchangeGoogleCode,
	ensureValidGoogleToken,
	googleFreeBusy,
	googleCreateEvent,
	googleDeleteEvent,
	DEFAULT_SCOPES,
	getConnection,
	saveConnection,
	deleteConnection,
	createOauthState,
	consumeOauthState,
	checkRateLimit,
	listCalendarUsers,
	toErrorResponse,
	getAdminEmail,
	ADMIN_COOKIE_NAME,
	createAdminAdapters,
	ensureAdminUser,
	parseCookieHeader,
	validateAdminSessionFromHeader,
	configureCalendarConfig,
	getCalendarConfig,
	resetCalendarConfig,
	requireEnv,
	getEnv,
	getCalendarActivities,
	getCalendarActivityList,
	isKnownProgramSlug,
	isValidProgramSlug,
	buildPaymentLink,
	loadCalendarMemberShellData,
	loadCalendarMemberHomeData,
	loadCalendarMemberProfileData,
	getCalendarPrograms,
	getEnabledCalendarPrograms,
	isCalendarProgramEnabled,
	setCalendarProgramEnabled,
	getCalendarProgramBySlug,
	getEnabledCalendarProgramByActivityName,
	upsertCalendarProgram,
	deleteCalendarProgram,
	listUpcomingEvents,
	listRecentEvents,
	listEventsFeed,
	createEventsBatch,
	getEventMutationState,
	joinEvent,
	leaveEvent,
	bumpWaitlist,
	updateEventCapacity,
	setAttendanceStatus,
	updateEventMemory,
	getCalendarProfile,
	saveCalendarProfile,
	enqueueCalendarSyncJob,
	getCalendarSyncQueueHealth,
	retryCalendarSyncDeadLetters,
	purgeCalendarSyncDeadLetters,
	processCalendarSyncQueue,
	generateInviteCode,
	createInvite,
	validateInvite,
	consumeInvite,
	listInvites,
	deleteInvite,
	hasUserRedeemedAnyInvite,
	parseAdminRulesInput,
	parseAdminProgramMutationInput,
	parseAdminCreateEventsBatchInput,
	parseAdminEventUpdateInput,
	parseAdminSyncQueueActionInput,
	parseSyncQueueProcessLimitInput,
	parseCalendarJoinEventInput,
	parseCalendarProfileInput,
	parseCalendarInviteCreateInput,
	parseCalendarSessionBootstrapInput,
	parseDiscordWebhookTextInput,
	TransportValidationError,
	asTransportErrorMessage
}

export type {
	CalendarConfig,
	CalendarConfigInput,
	CalendarActivityConfig,
	CalendarProgramSlug,
	PaymentProvider,
	CalendarHomeFeedEvent,
	CalendarMemberHomeData,
	CalendarShellUser,
	CalendarMemberShellData,
	CalendarMemberProfileData,
	CalendarProgramState,
	CalendarProgramInput,
	CalendarEventParticipant,
	CalendarFeedEvent,
	CalendarEventsFeed,
	CalendarProfile,
	CalendarEventMutationState,
	AdminRulesInput,
	AdminProgramUpsertInput,
	AdminProgramMutationInput,
	AdminCreateEventsBatchInput,
	AdminEventUpdateInput,
	AdminSyncQueueActionInput,
	CalendarJoinEventInput,
	CalendarProfileInput,
	CalendarInviteCreateInput,
	CalendarSessionBootstrapInput
}
