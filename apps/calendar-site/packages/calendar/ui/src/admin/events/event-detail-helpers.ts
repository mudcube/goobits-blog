/**
 * Pure presentation helpers for the event-detail page — date/time formatting
 * and attendee-status labels. Extracted from AdminEventDetailPage so the
 * page focuses on orchestration.
 */

import { TIME_FORMAT_OPTIONS, DAY_LABEL_OPTIONS } from '../../shared/date-format'

export function formatEventRange(startsAt: string, endsAt: string): string {
	const start = new Date(startsAt)
	const end = new Date(endsAt)
	const sameDay = start.toDateString() === end.toDateString()
	const dayLabel = start.toLocaleDateString(undefined, DAY_LABEL_OPTIONS)
	const startTime = start.toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS)
	const endTime = end.toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS)
	if (sameDay) return `${dayLabel} at ${startTime} – ${endTime}`
	const endLabel = end.toLocaleDateString(undefined, DAY_LABEL_OPTIONS)
	return `${dayLabel} at ${startTime} – ${endLabel} at ${endTime}`
}

export function formatDayLabel(iso: string): string {
	return new Date(iso).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric'
	})
}

export function formatTimeOnly(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS)
}

export function formatDuration(startsAt: string, endsAt: string): string {
	const startMs = new Date(startsAt).getTime()
	const endMs = new Date(endsAt).getTime()
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return '-'
	const minutes = Math.round((endMs - startMs) / 60000)
	if (minutes < 60) return `${minutes} min`
	const hours = Math.floor(minutes / 60)
	const rem = minutes % 60
	return rem === 0 ? `${hours} hr${hours === 1 ? '' : 's'}` : `${hours}h ${rem}m`
}

// Delegates to the canonical `initials()` in crew-helpers — attendee names
// and crew member names are the same shape, so no need for a parallel
// implementation. Re-exported under this name for the EventAttendeesList
// caller's readability.
export { initials as attendeeInitials } from '../members/crew-helpers'

type AttendeeView = {
	status: string
	waitlistPosition: number | null
	attendanceStatus: string
}

export function attendeeBadge(attendee: AttendeeView, eventEnded: boolean): string {
	if (attendee.status === 'waitlist' || attendee.waitlistPosition) return 'Waitlist'
	if (!eventEnded) return 'Joined'
	if (attendee.attendanceStatus === 'attended') return 'Attended'
	if (attendee.attendanceStatus === 'flaked') return 'Flaked'
	return 'Joined'
}

export function attendeeDetail(attendee: AttendeeView, eventEnded: boolean): string {
	if (attendee.status === 'waitlist' || attendee.waitlistPosition) {
		return attendee.waitlistPosition ? `Position #${attendee.waitlistPosition}` : 'Pending opening'
	}
	if (!eventEnded) return 'Booking confirmed'
	if (attendee.attendanceStatus === 'attended') return 'Marked attended'
	if (attendee.attendanceStatus === 'flaked') return 'Marked no-show'
	return 'Booking confirmed'
}
