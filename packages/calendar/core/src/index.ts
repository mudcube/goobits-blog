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
import { isoDay } from './utils/time.ts'
import {
	canBootstrapCalendarAdmin,
	getCalendarAdminCount,
	getCalendarUserByEmail,
	grantCalendarAdmin,
	grantCalendarAdminByEmail,
	isCalendarAdmin
} from './access/admin-permissions.ts'
import {
	isAdminBootstrap,
	type AdminBootstrap,
	type AdminBootstrapUser,
	type AdminBootstrapInvite,
	type AdminBootstrapPaymentIntegrations
} from './services/admin/bootstrap-types.ts'
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
} from './config/activities.ts'
import { isKnownProgramSlug, isValidProgramSlug, type CalendarProgramSlug } from './config/programs.ts'
import { VENUE_TIMEZONE, addWeeksInVenueTime } from './config/venue.ts'
import { buildPaymentLink, type PaymentProvider } from './services/payments/pay.ts'
import {
	loadCalendarMemberShellData,
	loadCalendarMemberHomeData,
	loadCalendarMemberProfileData,
	type CalendarHomeFeedEvent,
	type CalendarMemberHomeData,
	type CalendarShellUser,
	type CalendarMemberShellData,
	type CalendarMemberProfileData
} from './services/member/pages.ts'
import {
	getCalendarPrograms,
	getEnabledCalendarPrograms,
	isCalendarProgramEnabled,
	setCalendarProgramEnabled,
	getCalendarProgramBySlug,
	getEnabledCalendarProgramByActivityName,
	upsertCalendarProgram,
	deleteCalendarProgram,
	reorderCalendarPrograms,
	type CalendarProgramState,
	type CalendarProgramInput
} from './services/admin/programs.ts'
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
	updateEventHeroImage,
	updateEventRecapText,
	getEventHeroImage,
	getCalendarProfile,
	saveCalendarProfile,
	type CalendarEventParticipant,
	type CalendarFeedEvent,
	type CalendarEventsFeed,
	type CalendarProfile,
	type CalendarEventMutationState
} from './services/bookings/social.ts'
import {
	enqueueCalendarSyncJob,
	getCalendarSyncQueueHealth,
	retryCalendarSyncDeadLetters,
	purgeCalendarSyncDeadLetters,
	processCalendarSyncQueue
} from './services/sync/queue.ts'
import {
	generateInviteCode,
	createInvite,
	validateInvite,
	consumeInvite,
	listInvites,
	deleteInvite,
	deleteInviteByCode,
	hasUserRedeemedAnyInvite
} from './services/invites/invites.ts'
import {
	listUserProgramAccess,
	setUserProgramAccess,
	replaceUserProgramAccess,
	hasUserProgramAccess,
	type CalendarUserProgramAccess
} from './access/user-program-access.ts'
import {
	getAdminPaymentDefaults,
	setAdminPaymentDefaults,
	type AdminPaymentDefaults
} from './services/payments/admin-payment-defaults.ts'
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
} from './services/payments/checkout.ts'
import { listEventTemplates, type CalendarEventTemplate } from './services/admin/event-templates.ts'
import { promoteWaitlistedParticipant, type PromoteWaitlistResult } from './services/bookings/promote-waitlist.ts'
import { getAdminEventDetail, type AdminEventDetail } from './services/admin/event-detail.ts'
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
} from './services/bookings/confirmation.ts'
import { getSlotAvailability, type SlotAvailabilityResult } from './services/bookings/slot-availability.ts'
import {
	getAdminPreference,
	getAdminPreferences,
	setAdminPreference
} from './services/admin/preferences.ts'
import {
	getAdminViewSettings,
	setAdminViewSettings,
	getDefaultAdminViewSettings,
	type AdminViewSettings,
	type WeekStart
} from './services/admin/view-settings.ts'
import {
	putEventHero,
	deleteEventHero,
	extractHeroKeyFromUrl,
	HeroUploadError,
	ALLOWED_HERO_MIME_TYPES,
	MAX_HERO_BYTES,
	type AllowedHeroMimeType,
	type PutHeroResult
} from './media/hero-upload.ts'
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
	canBootstrapCalendarAdmin,
	getCalendarAdminCount,
	getCalendarUserByEmail,
	grantCalendarAdmin,
	grantCalendarAdminByEmail,
	isCalendarAdmin,
	isAdminBootstrap,
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
	VENUE_TIMEZONE,
	addWeeksInVenueTime,
	isoDay,
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
	reorderCalendarPrograms,
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
	updateEventHeroImage,
	updateEventRecapText,
	getEventHeroImage,
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
	replaceUserProgramAccess,
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
	setActiveCalendarSyncProvider,
	getAdminPreference,
	getAdminPreferences,
	setAdminPreference,
	getAdminViewSettings,
	setAdminViewSettings,
	getDefaultAdminViewSettings,
	putEventHero,
	deleteEventHero,
	extractHeroKeyFromUrl,
	HeroUploadError,
	ALLOWED_HERO_MIME_TYPES,
	MAX_HERO_BYTES
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
	WeatherProvider,
	AdminViewSettings,
	WeekStart,
	AllowedHeroMimeType,
	PutHeroResult,
	AdminBootstrap,
	AdminBootstrapUser,
	AdminBootstrapInvite,
	AdminBootstrapPaymentIntegrations
}
