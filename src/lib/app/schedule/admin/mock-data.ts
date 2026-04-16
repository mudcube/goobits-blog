import type { AdminEventsResponse, AdminProgramsResponse } from '@calendar/ui/api/admin'
import type { CalendarEventsResponse, CalendarPaymentDefaultsResponse } from '@calendar/ui/api/calendar'

type MockParticipant = AdminEventsResponse['upcoming'][number]['participants'][number]

function isoWithTimeOffset(daysOffset: number, hour: number, minute: number) {
	const d = new Date()
	d.setDate(d.getDate() + daysOffset)
	d.setHours(hour, minute, 0, 0)
	return d.toISOString()
}

function addMinutes(iso: string, minutes: number) {
	return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()
}

function nextWeekdayDate(weekday: number, weeksAhead = 0) {
	const now = new Date()
	const currentWeekday = now.getDay()
	const delta = (weekday - currentWeekday + 7) % 7
	const d = new Date(now)
	d.setHours(0, 0, 0, 0)
	d.setDate(d.getDate() + delta + weeksAhead * 7)
	return d
}

function isoFromWeekdayAt(weekday: number, hour: number, minute = 0, weeksAhead = 0) {
	const d = nextWeekdayDate(weekday, weeksAhead)
	d.setHours(hour, minute, 0, 0)
	return d.toISOString()
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

export const mockDashboardEvents: AdminEventsResponse['upcoming'] = [
	// Gym: Monday/Wednesday/Friday between 12 PM and 6 PM
	{
		id: 9001,
		title: 'Morning Flow',
		activityLabel: 'Yoga',
		activitySlug: 'gym',
		startsAt: isoFromWeekdayAt(1, 12, 0),
		endsAt: addMinutes(isoFromWeekdayAt(1, 12, 0), 90),
		seatsTaken: 5,
		capacity: 8,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Gym Sessions {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, marco, ava]
	},
	{
		id: 9002,
		title: 'Open Gym',
		activityLabel: 'Gym',
		activitySlug: 'gym',
		startsAt: isoFromWeekdayAt(3, 15, 0),
		endsAt: addMinutes(isoFromWeekdayAt(3, 15, 0), 120),
		seatsTaken: 6,
		capacity: 10,
		seatsLeft: 4,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Gym Sessions {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: mockParticipants
	},
	{
		id: 9003,
		title: 'Leg Day Crew',
		activityLabel: 'Gym',
		activitySlug: 'gym',
		startsAt: isoFromWeekdayAt(5, 17, 0),
		endsAt: addMinutes(isoFromWeekdayAt(5, 17, 0), 90),
		seatsTaken: 4,
		capacity: 8,
		seatsLeft: 4,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Gym Sessions {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, marco, ava]
	},
	// Circus: Monday/Wednesday/Friday between 12 PM and 6 PM
	{
		id: 9004,
		title: 'Aerial Fundamentals',
		activityLabel: 'Circus',
		activitySlug: 'circus',
		startsAt: isoFromWeekdayAt(1, 13, 30),
		endsAt: addMinutes(isoFromWeekdayAt(1, 13, 30), 120),
		seatsTaken: 4,
		capacity: 5,
		seatsLeft: 1,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Circus Sessions {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, marco, ava]
	},
	{
		id: 9005,
		title: 'Silks Conditioning',
		activityLabel: 'Circus',
		activitySlug: 'circus',
		startsAt: isoFromWeekdayAt(3, 16, 0),
		endsAt: addMinutes(isoFromWeekdayAt(3, 16, 0), 90),
		seatsTaken: 3,
		capacity: 6,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Circus Sessions {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, tyler]
	},
	{
		id: 9006,
		title: 'Trapeze Basics',
		activityLabel: 'Circus',
		activitySlug: 'circus',
		startsAt: isoFromWeekdayAt(5, 12, 30),
		endsAt: addMinutes(isoFromWeekdayAt(5, 12, 30), 90),
		seatsTaken: 5,
		capacity: 8,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Circus Sessions {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [marco, ava, tyler]
	},
	// Adventure: weekends, all day blocks
	{
		id: 9007,
		title: 'Trail Hike',
		activityLabel: 'Adventure',
		activitySlug: 'adventure',
		startsAt: isoFromWeekdayAt(6, 9, 0),
		endsAt: addMinutes(isoFromWeekdayAt(6, 9, 0), 180),
		seatsTaken: 3,
		capacity: 6,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-adventure',
		paymentNoteTemplate: 'Adventure Club {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, tyler]
	},
	{
		id: 9008,
		title: 'Forest Ridge Day Trip',
		activityLabel: 'Adventure',
		activitySlug: 'adventure',
		startsAt: isoFromWeekdayAt(0, 13, 0),
		endsAt: addMinutes(isoFromWeekdayAt(0, 13, 0), 240),
		seatsTaken: 4,
		capacity: 8,
		seatsLeft: 4,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-adventure',
		paymentNoteTemplate: 'Adventure Club {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [jen, marco, ava]
	},
	// Movies: weekends only
	{
		id: 9009,
		title: 'Studio Ghibli Night',
		activityLabel: 'Movies',
		activitySlug: 'movie-night',
		startsAt: isoFromWeekdayAt(6, 19, 0),
		endsAt: addMinutes(isoFromWeekdayAt(6, 19, 0), 120),
		seatsTaken: 4,
		capacity: 8,
		seatsLeft: 4,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-movies',
		paymentNoteTemplate: 'Movie Nights {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: mockParticipants
	},
	{
		id: 9010,
		title: 'Movie Matinee',
		activityLabel: 'Movies',
		activitySlug: 'movie-night',
		startsAt: isoFromWeekdayAt(0, 14, 0),
		endsAt: addMinutes(isoFromWeekdayAt(0, 14, 0), 120),
		seatsTaken: 6,
		capacity: 10,
		seatsLeft: 4,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-movies',
		paymentNoteTemplate: 'Movie Nights {{title}}',
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
		activitySlug: 'movie-night',
		startsAt: isoWithTimeOffset(-1, 20, 0),
		endsAt: isoWithTimeOffset(-1, 22, 0),
		seatsTaken: 6,
		capacity: 8,
		seatsLeft: 2,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Movie Nights {{title}}',
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
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Gym Sessions {{title}}',
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
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Circus Sessions {{title}}',
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
		paymentHandle: '@community-gym',
		paymentNoteTemplate: 'Gym Sessions {{title}}',
		recapText: 'Busy session with mixed circuits.',
		heroImageUrl: null,
		participants: [tyler]
	},
	{
		id: 9105,
		title: 'Forest Ridge Day Trip',
		activityLabel: 'Adventure',
		activitySlug: 'adventure',
		startsAt: isoWithTimeOffset(-3, 11, 0),
		endsAt: isoWithTimeOffset(-3, 15, 0),
		seatsTaken: 5,
		capacity: 8,
		seatsLeft: 3,
		waitlistCount: 0,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@community-adventure',
		paymentNoteTemplate: 'Adventure Club {{title}}',
		recapText: 'Sunny trails and great vibes.',
		heroImageUrl: null,
		participants: [jen, ava]
	}
]

function toMemberFeedEvent(
	event: AdminEventsResponse['upcoming'][number]
): CalendarEventsResponse['upcoming'][number] {
	return {
		id: event.id,
		activitySlug: event.activitySlug || '',
		activityLabel: event.activityLabel,
		title: event.title,
		startsAt: event.startsAt,
		endsAt: event.endsAt,
		capacity: event.capacity,
		seatsTaken: event.seatsTaken,
		seatsLeft: event.seatsLeft,
		waitlistCount: event.waitlistCount,
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: event.costCents,
		currency: event.currency,
		paymentProvider: event.paymentProvider,
		paymentHandle: event.paymentHandle,
		paymentNoteTemplate: event.paymentNoteTemplate,
		recapText: event.recapText,
		heroImageUrl: event.heroImageUrl,
		participants: event.participants.map((participant) => ({
			userId: participant.userId || '',
			name: participant.name || null,
			avatarUrl: participant.avatarUrl || null
		}))
	}
}

export const mockCalendarUpcoming: CalendarEventsResponse['upcoming'] = mockDashboardEvents.map(toMemberFeedEvent)
export const mockCalendarRecent: CalendarEventsResponse['recent'] = mockDashboardRecentEvents.map(toMemberFeedEvent)

export const mockPrograms: AdminProgramsResponse['programs'] = [
	{
		slug: 'gym',
		href: '/schedule/gym',
		label: 'Gym Sessions',
		icon: '💪',
		eyebrow: 'Gym Sessions',
		heroTitleLines: ['Hang out. Work out.', 'Whatever.'],
		heroSubtitle: "Grab a time slot and let's do something fun together.",
		description: 'Strength, movement, and play sessions for all levels.',
		enabled: true,
		sortOrder: 1,
		pageTitle: 'Gym Sessions',
		activityName: 'Gym',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-gym',
		glowClass: 'glow-gym',
		formGlowClass: 'form-glow-gym'
	},
	{
		slug: 'circus',
		href: '/schedule/circus',
		label: 'Circus Sessions',
		icon: '🎪',
		eyebrow: 'Circus Sessions',
		heroTitleLines: ['Fly high. Spin fast.', 'Be brave.'],
		heroSubtitle: 'Aerial arts and circus skills training for all levels.',
		description: 'Aerial arts and circus skills training for all levels.',
		enabled: true,
		sortOrder: 2,
		pageTitle: 'Circus Sessions',
		activityName: 'Circus',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-circus',
		glowClass: 'glow-circus',
		formGlowClass: 'form-glow-circus'
	},
	{
		slug: 'adventure',
		href: '/schedule/adventure',
		label: 'Adventure Club',
		icon: '🏔️',
		eyebrow: 'Adventure Club',
		heroTitleLines: ['Explore more.', 'Get outside.'],
		heroSubtitle: 'Weekend adventures, hikes, and trips with the crew.',
		description: 'Weekend adventures, hikes, and trips with the crew.',
		enabled: true,
		sortOrder: 3,
		pageTitle: 'Adventure Club',
		activityName: 'Adventure',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-adventure',
		glowClass: 'glow-adventure',
		formGlowClass: 'form-glow-adventure'
	},
	{
		slug: 'movie-night',
		href: '/schedule/movie-night',
		label: 'Movie Nights',
		icon: '🎬',
		eyebrow: 'Movie Nights',
		heroTitleLines: ['Bring snacks.', 'Cue the projector.'],
		heroSubtitle: 'Weekend movie nights with the community.',
		description: 'Weekend movie nights with the community.',
		enabled: true,
		sortOrder: 4,
		pageTitle: 'Movie Nights',
		activityName: 'Movies',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-movie',
		glowClass: 'glow-movie',
		formGlowClass: 'form-glow-movie'
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
	{ id: 'u-owner', name: 'Owner', email: 'miko@example.com', role: 'owner', isSelf: true, created_at: nowUnix - 220 * 24 * 60 * 60 },
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
	handle: '@community-payments'
}
