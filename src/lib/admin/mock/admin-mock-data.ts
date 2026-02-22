import type { AdminEventsResponse, AdminProgramsResponse } from '@calendar/ui/api/admin'
import type { CalendarPaymentDefaultsResponse } from '@calendar/ui/api/calendar'

type MockParticipant = AdminEventsResponse['upcoming'][number]['participants'][number]

function isoWithTimeOffset(daysOffset: number, hour: number, minute: number) {
	const d = new Date()
	d.setDate(d.getDate() + daysOffset)
	d.setHours(hour, minute, 0, 0)
	return d.toISOString()
}

function isoTodayAtMinuteOfDay(minuteOfDay: number) {
	const d = new Date()
	const clamped = Math.max(0, Math.min(23 * 60 + 59, minuteOfDay))
	const hours = Math.floor(clamped / 60)
	const minutes = clamped % 60
	d.setHours(hours, minutes, 0, 0)
	return d.toISOString()
}

function isoFromDateWithMinutes(base: Date, minutesFromMidnight: number) {
	const d = new Date(base)
	const clamped = Math.max(0, Math.min(23 * 60 + 59, minutesFromMidnight))
	const hours = Math.floor(clamped / 60)
	const minutes = clamped % 60
	d.setHours(hours, minutes, 0, 0)
	return d.toISOString()
}

function addMinutes(iso: string, minutes: number) {
	return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()
}

function todayPastAndFutureSlots() {
	const now = new Date()
	const nowMinute = now.getHours() * 60 + now.getMinutes()
	// Keep one mock item clearly before "now" and one after "now" for same-day timeline previews.
	const pastMinute = Math.max(0, nowMinute - 120)
	const futureMinute = Math.min(23 * 60 + 59, nowMinute + 180)
	return {
		pastIso: isoTodayAtMinuteOfDay(pastMinute),
		futureIso: isoTodayAtMinuteOfDay(futureMinute)
	}
}

const mockParticipants: MockParticipant[] = [
	{ userId: 'u-jen', name: 'Jen Kline', avatarUrl: null },
	{ userId: 'u-marco', name: 'Marco Ruiz', avatarUrl: null },
	{ userId: 'u-ava', name: 'Ava Lee', avatarUrl: null },
	{ userId: 'u-tyler', name: 'Tyler Scott', avatarUrl: null }
]
const jen = mockParticipants[0]!
const marco = mockParticipants[1]!
const ava = mockParticipants[2]!
const tyler = mockParticipants[3]!
const todaySlots = todayPastAndFutureSlots()
const now = new Date()
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const tomorrowStart = new Date(todayStart)
tomorrowStart.setDate(todayStart.getDate() + 1)
const dayAfterTomorrowStart = new Date(todayStart)
dayAfterTomorrowStart.setDate(todayStart.getDate() + 2)

export const mockDashboardEvents: AdminEventsResponse['upcoming'] = [
	{
		id: 9001,
		title: 'Morning Flow',
		activityLabel: 'Yoga',
		activitySlug: 'gym',
		startsAt: todaySlots.pastIso,
		endsAt: addMinutes(todaySlots.pastIso, 90),
		seatsTaken: 5,
		capacity: 8,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, marco, ava]
	},
	{
		id: 9002,
		title: 'Studio Ghibli Night',
		activityLabel: 'Movies',
		activitySlug: 'gym',
		startsAt: todaySlots.futureIso,
		endsAt: addMinutes(todaySlots.futureIso, 120),
		seatsTaken: 4,
		capacity: 8,
		seatsLeft: 4,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: mockParticipants
	},
	{
		id: 9003,
		title: 'Aerial Fundamentals',
		activityLabel: 'Circus',
		activitySlug: 'circus',
		startsAt: isoFromDateWithMinutes(tomorrowStart, 10 * 60 + 30),
		endsAt: isoFromDateWithMinutes(tomorrowStart, 12 * 60 + 30),
		seatsTaken: 4,
		capacity: 5,
		seatsLeft: 1,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Circus {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, marco, ava]
	},
	{
		id: 9004,
		title: 'Open Gym',
		activityLabel: 'Gym',
		activitySlug: 'gym',
		startsAt: isoFromDateWithMinutes(dayAfterTomorrowStart, 18 * 60),
		endsAt: isoFromDateWithMinutes(dayAfterTomorrowStart, 20 * 60),
		seatsTaken: 6,
		capacity: 10,
		seatsLeft: 4,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: mockParticipants
	}
]

export const mockDashboardRecentEvents: AdminEventsResponse['recent'] = [
	{
		id: 9101,
		title: 'Ghibli Night',
		activityLabel: 'Movies',
		activitySlug: 'gym',
		startsAt: isoWithTimeOffset(-1, 20, 0),
		endsAt: isoWithTimeOffset(-1, 22, 0),
		seatsTaken: 6,
		capacity: 8,
		seatsLeft: 2,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: 'Great turnout and cozy vibes.',
		heroImageUrl: null,
		participants: [jen]
	},
	{
		id: 9102,
		title: 'Morning Flow',
		activityLabel: 'Yoga',
		activitySlug: 'gym',
		startsAt: isoWithTimeOffset(-1, 9, 0),
		endsAt: isoWithTimeOffset(-1, 10, 30),
		seatsTaken: 5,
		capacity: 8,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: 'Solid energy and clean finish.',
		heroImageUrl: null,
		participants: [marco]
	},
	{
		id: 9103,
		title: 'Aerial Fundamentals',
		activityLabel: 'Circus',
		activitySlug: 'circus',
		startsAt: isoWithTimeOffset(-2, 10, 30),
		endsAt: isoWithTimeOffset(-2, 12, 30),
		seatsTaken: 4,
		capacity: 5,
		seatsLeft: 1,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Circus {{title}}',
		recapText: 'Great progression on fundamentals.',
		heroImageUrl: null,
		participants: [ava]
	},
	{
		id: 9104,
		title: 'Open Gym',
		activityLabel: 'Gym',
		activitySlug: 'gym',
		startsAt: isoWithTimeOffset(-2, 18, 0),
		endsAt: isoWithTimeOffset(-2, 20, 0),
		seatsTaken: 7,
		capacity: 10,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: 'Busy session with mixed circuits.',
		heroImageUrl: null,
		participants: [tyler]
	}
]

export const mockPrograms: AdminProgramsResponse['programs'] = [
	{
		slug: 'gym',
		href: '/calendar/gym',
		label: 'Rainbow Gym',
		icon: '💪',
		eyebrow: 'Rainbow Gym',
		heroTitleLines: ['Hang out. Work out.', 'Whatever.'],
		heroSubtitle: "Grab a time slot and let's do something fun together.",
		description: 'Strength, movement, and play sessions for all levels.',
		enabled: true,
		sortOrder: 1,
		pageTitle: 'Rainbow Gym',
		activityName: 'Gym',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-gym',
		glowClass: 'glow-gym',
		formGlowClass: 'form-glow-gym'
	},
	{
		slug: 'circus',
		href: '/calendar/circus',
		label: 'Rainbow Circus',
		icon: '🎪',
		eyebrow: 'Rainbow Circus',
		heroTitleLines: ['Fly high. Spin fast.', 'Be brave.'],
		heroSubtitle: 'Aerial arts and circus skills training for all levels.',
		description: 'Aerial arts and circus skills training for all levels.',
		enabled: true,
		sortOrder: 2,
		pageTitle: 'Rainbow Circus',
		activityName: 'Circus',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-circus',
		glowClass: 'glow-circus',
		formGlowClass: 'form-glow-circus'
	}
]

export type MockCrewUser = {
	id: string
	name: string
	email: string
	role?: string
	isSelf?: boolean
	created_at?: number
}

export type MockCrewInvite = {
	id: string
	code: string
	email: string
	created_at: number
	expires_in_days?: number
}

const nowUnix = Math.floor(Date.now() / 1000)

export const mockCrewUsers: MockCrewUser[] = [
	{ id: 'u-miko', name: 'Miko', email: 'miko@example.com', role: 'owner', isSelf: true, created_at: nowUnix - 220 * 24 * 60 * 60 },
	{ id: 'u-sarah', name: 'Sarah', email: 'sarah@example.com', created_at: nowUnix - 120 * 24 * 60 * 60 },
	{ id: 'u-alex', name: 'Alex', email: 'alex@example.com', created_at: nowUnix - 90 * 24 * 60 * 60 },
	{ id: 'u-jamie', name: 'Jamie', email: 'jamie@example.com', created_at: nowUnix - 60 * 24 * 60 * 60 },
	{ id: 'u-morgan', name: 'Morgan', email: 'morgan@example.com', created_at: nowUnix - 40 * 24 * 60 * 60 },
	{ id: 'u-marco', name: 'Marco', email: 'marco@example.com', created_at: nowUnix - 30 * 24 * 60 * 60 },
	{ id: 'u-jen', name: 'Jen', email: 'jen@example.com', created_at: nowUnix - 20 * 24 * 60 * 60 }
]

export const mockCrewInvites: MockCrewInvite[] = [
	{
		id: 'inv-sarah',
		code: 'a3x8f',
		email: 'sarah@example.com',
		created_at: nowUnix - 3 * 24 * 60 * 60,
		expires_in_days: 4
	},
	{
		id: 'inv-dev',
		code: 'z9q2r',
		email: 'dev@example.com',
		created_at: nowUnix - 1 * 60 * 60,
		expires_in_days: 7
	}
]

export const mockPaymentDefaults: CalendarPaymentDefaultsResponse['payment'] = {
	provider: 'venmo',
	handle: '@rainbowgym'
}
