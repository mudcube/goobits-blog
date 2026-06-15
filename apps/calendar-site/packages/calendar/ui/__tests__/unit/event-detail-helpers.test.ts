import { describe, expect, it } from 'vitest'
import {
	formatDayLabel,
	formatTimeOnly,
	formatDuration,
	attendeeBadge,
	attendeeDetail
} from '../../src/admin/events/event-detail-helpers'

describe('formatDuration', () => {
	it('returns "-" for invalid input', () => {
		expect(formatDuration('not-a-date', 'also-not')).toBe('-')
	})

	it('returns "-" when end is before or equal to start', () => {
		const a = '2026-05-09T14:00:00Z'
		const b = '2026-05-09T13:00:00Z'
		expect(formatDuration(a, b)).toBe('-')
		expect(formatDuration(a, a)).toBe('-')
	})

	it('formats minutes for sub-hour ranges', () => {
		expect(formatDuration('2026-05-09T14:00:00Z', '2026-05-09T14:30:00Z')).toBe('30 min')
	})

	it('formats whole hours', () => {
		expect(formatDuration('2026-05-09T14:00:00Z', '2026-05-09T15:00:00Z')).toBe('1 hr')
		expect(formatDuration('2026-05-09T14:00:00Z', '2026-05-09T17:00:00Z')).toBe('3 hrs')
	})

	it('formats mixed hours + minutes', () => {
		expect(formatDuration('2026-05-09T14:00:00Z', '2026-05-09T15:30:00Z')).toBe('1h 30m')
	})
})

describe('formatDayLabel', () => {
	it('produces a "Mon DD" style string', () => {
		// Result varies by runtime locale; just ensure it's non-empty + has a digit.
		const result = formatDayLabel('2026-05-09T14:00:00Z')
		expect(result.length).toBeGreaterThan(0)
		expect(/\d/.test(result)).toBe(true)
	})
})

describe('formatTimeOnly', () => {
	it('produces a non-empty time string', () => {
		const result = formatTimeOnly('2026-05-09T14:00:00Z')
		expect(result.length).toBeGreaterThan(0)
	})
})

describe('attendeeBadge', () => {
	const base = { status: 'joined', waitlistPosition: null, attendanceStatus: '' }

	it('returns Waitlist for waitlisted attendees', () => {
		expect(attendeeBadge({ ...base, status: 'waitlist' }, false)).toBe('Waitlist')
		expect(attendeeBadge({ ...base, waitlistPosition: 3 }, false)).toBe('Waitlist')
	})

	it('returns Joined for active joins on a future event', () => {
		expect(attendeeBadge(base, false)).toBe('Joined')
	})

	it('returns Attended/Flaked once event has ended', () => {
		expect(attendeeBadge({ ...base, attendanceStatus: 'attended' }, true)).toBe('Attended')
		expect(attendeeBadge({ ...base, attendanceStatus: 'flaked' }, true)).toBe('Flaked')
	})

	it('returns Joined for past events without attendance recorded', () => {
		expect(attendeeBadge(base, true)).toBe('Joined')
	})
})

describe('attendeeDetail', () => {
	const base = { status: 'joined', waitlistPosition: null, attendanceStatus: '' }

	it('shows position when on waitlist', () => {
		expect(attendeeDetail({ ...base, waitlistPosition: 2 }, false)).toBe('Position #2')
	})

	it('shows pending opening when waitlisted without position', () => {
		expect(attendeeDetail({ ...base, status: 'waitlist' }, false)).toBe('Pending opening')
	})

	it('shows confirmation for active future bookings', () => {
		expect(attendeeDetail(base, false)).toBe('Booking confirmed')
	})

	it('shows attendance for past events', () => {
		expect(attendeeDetail({ ...base, attendanceStatus: 'attended' }, true)).toBe('Marked attended')
		expect(attendeeDetail({ ...base, attendanceStatus: 'flaked' }, true)).toBe('Marked no-show')
	})
})
