// Booking sub-entry for @calendar/core.
//
// Re-exports the booking flow surface: event feeds, join/leave/waitlist,
// confirmations, slot availability, templates, and member-facing pages.

export {
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

export {
	generateConfirmationId,
	setConfirmationId,
	getBookingByConfirmation,
	cancelBookingByConfirmation
} from './services/bookings/confirmation.ts'

export { getSlotAvailability, type SlotAvailabilityResult } from './services/bookings/slot-availability.ts'

export { promoteWaitlistedParticipant, type PromoteWaitlistResult } from './services/bookings/promote-waitlist.ts'

export {
	loadCalendarMemberShellData,
	loadCalendarMemberHomeData,
	loadCalendarMemberProfileData,
	type CalendarHomeFeedEvent,
	type CalendarMemberHomeData,
	type CalendarShellUser,
	type CalendarMemberShellData,
	type CalendarMemberProfileData
} from './services/member/pages.ts'
