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
	getOutlookAuthUrl,
	exchangeOutlookCode,
	ensureValidOutlookToken,
	outlookCreateEvent,
	outlookDeleteEvent,
	OUTLOOK_SCOPES
} from './providers/outlook/index.ts'
import {
	appleCreateEvent,
	appleDeleteEvent,
	buildAppleEventIcs,
	type AppleCalDavConnection,
	type AppleCalendarEventInput
} from './providers/apple/caldav.ts'
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
	getCalendarUserByEmail,
	grantCalendarAdmin,
	grantCalendarAdminByEmail,
	isCalendarAdmin
} from './admin/permissions.ts'
import {
	configureCalendarConfig,
	getCalendarConfig,
	resetCalendarConfig,
	type CalendarConfig,
	type CalendarConfigInput
} from './config/calendar.ts'
import { requireEnv, getEnv } from './config/env.ts'
import {
	configureCalendarActivityCatalog,
	getCalendarActivities,
	getCalendarActivityDefinitions,
	getCalendarActivityList,
	resetCalendarActivityCatalog,
	type CalendarActivityConfig,
	type CalendarActivityDefinition
} from './social/activities.ts'
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
	updateEventDetails,
	cancelEvent,
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
	deleteInviteByCode,
	hasUserRedeemedAnyInvite
} from './calendar/invites.ts'
import {
	listUserProgramAccess,
	setUserProgramAccess,
	hasUserProgramAccess,
	type CalendarUserProgramAccess
} from './access/user-program-access.ts'
import {
	getAdminPaymentDefaults,
	setAdminPaymentDefaults,
	type AdminPaymentDefaults
} from './payments/admin-payment-defaults.ts'
import {
	capturePayPalCheckoutOrder,
	createPayPalCheckoutOrder,
	createSquareCashAppPayment,
	deletePaymentCredentials,
	getPaymentCheckoutConfig,
	getPaymentCheckoutContext,
	savePayPalPaymentCredentials,
	saveSquarePaymentCredentials,
	type CheckoutProvider,
	type PaymentCheckoutContext
} from './payments/checkout.ts'
import { listEventTemplates, type CalendarEventTemplate } from './events/event-templates.ts'
import { promoteWaitlistedParticipant, type PromoteWaitlistResult } from './events/promote-waitlist.ts'
import { getAdminEventDetail, type AdminEventDetail } from './events/event-detail.ts'
import {
	fetchWeatherForEvent,
	fetchDayForecast,
	type WeatherSnapshot,
	type DayForecast
} from './weather/weather-provider.ts'
import { createMockWeatherProvider } from './weather/mock-provider.ts'
import type { WeatherProvider } from './weather/provider.ts'
import {
	generateConfirmationId,
	setConfirmationId,
	getBookingByConfirmation,
	cancelBookingByConfirmation
} from './services/booking-confirmation.ts'
import { getSlotAvailability, type SlotAvailabilityResult } from './services/slot-availability.ts'
import {
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
import { parsePositiveInteger } from './transport/parse.ts'
import {
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
import { TransportValidationError, asTransportErrorMessage } from './transport/errors.ts'
import {
	getActiveCalendarSyncProvider,
	isCalendarSyncProvider,
	setActiveCalendarSyncProvider,
	type CalendarSyncProvider
} from './sync/settings.ts'

export {
	getGoogleAuthUrl,
	exchangeGoogleCode,
	ensureValidGoogleToken,
	googleFreeBusy,
	googleCreateEvent,
	googleDeleteEvent,
	DEFAULT_SCOPES,
	getOutlookAuthUrl,
	exchangeOutlookCode,
	ensureValidOutlookToken,
	outlookCreateEvent,
	outlookDeleteEvent,
	OUTLOOK_SCOPES,
	appleCreateEvent,
	appleDeleteEvent,
	buildAppleEventIcs,
	getConnection,
	saveConnection,
	deleteConnection,
	createOauthState,
	consumeOauthState,
	checkRateLimit,
	listCalendarUsers,
	toErrorResponse,
	getCalendarUserByEmail,
	grantCalendarAdmin,
	grantCalendarAdminByEmail,
	isCalendarAdmin,
	configureCalendarConfig,
	getCalendarConfig,
	resetCalendarConfig,
	requireEnv,
	getEnv,
	configureCalendarActivityCatalog,
	getCalendarActivities,
	getCalendarActivityDefinitions,
	getCalendarActivityList,
	resetCalendarActivityCatalog,
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
	updateEventDetails,
	cancelEvent,
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
	deleteInviteByCode,
	hasUserRedeemedAnyInvite,
	listUserProgramAccess,
	setUserProgramAccess,
	hasUserProgramAccess,
	getAdminPaymentDefaults,
	setAdminPaymentDefaults,
	capturePayPalCheckoutOrder,
	createPayPalCheckoutOrder,
	createSquareCashAppPayment,
	deletePaymentCredentials,
	getPaymentCheckoutConfig,
	getPaymentCheckoutContext,
	savePayPalPaymentCredentials,
	saveSquarePaymentCredentials,
	listEventTemplates,
	promoteWaitlistedParticipant,
	getAdminEventDetail,
	fetchWeatherForEvent,
	fetchDayForecast,
	createMockWeatherProvider,
	parseAdminRulesInput,
	parseAdminProgramMutationInput,
	parseAdminCreateEventsBatchInput,
	parseAdminEventUpdateInput,
	parseAdminSyncQueueActionInput,
	parseSyncQueueProcessLimitInput,
	parseAdminUserProgramAccessInput,
	parseAdminPaymentDefaultsInput,
	parseCalendarJoinEventInput,
	parseCalendarProfileInput,
	parseCalendarInviteCreateInput,
	parseCalendarInviteClaimInput,
	parseCalendarSessionBootstrapInput,
	parseCalendarAvailabilityInput,
	parseCalendarBookingLookupInput,
	parseDiscordWebhookTextInput,
	TransportValidationError,
	asTransportErrorMessage,
	parsePositiveInteger,
	generateConfirmationId,
	setConfirmationId,
	getBookingByConfirmation,
	cancelBookingByConfirmation,
	getSlotAvailability,
	getActiveCalendarSyncProvider,
	isCalendarSyncProvider,
	setActiveCalendarSyncProvider
}

export type {
	CalendarConfig,
	CalendarConfigInput,
	CalendarActivityConfig,
	CalendarActivityDefinition,
	CalendarProgramSlug,
	PaymentProvider,
	CheckoutProvider,
	PaymentCheckoutContext,
	CalendarSyncProvider,
	AppleCalDavConnection,
	AppleCalendarEventInput,
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
	AdminUserProgramAccessInput,
	AdminPaymentDefaultsInput,
	CalendarJoinEventInput,
	CalendarProfileInput,
	CalendarInviteCreateInput,
	CalendarInviteClaimInput,
	CalendarSessionBootstrapInput,
	CalendarAvailabilityInput,
	CalendarBookingLookupInput,
	SlotAvailabilityResult,
	CalendarUserProgramAccess,
	AdminPaymentDefaults,
	CalendarEventTemplate,
	PromoteWaitlistResult,
	AdminEventDetail,
	WeatherSnapshot,
	DayForecast,
	WeatherProvider
}
