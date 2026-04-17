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

function gymEvent(id: number, title: string, weekday: number, hour: number, minute: number, durationMin: number, weeksAhead: number, participants: MockParticipant[], taken: number, cap: number) {
	const starts = isoFromWeekdayAt(weekday, hour, minute, weeksAhead)
	return {
		id, title, activityLabel: 'Gym', activitySlug: 'gym',
		startsAt: starts, endsAt: addMinutes(starts, durationMin),
		seatsTaken: taken, capacity: cap, seatsLeft: cap - taken, waitlistCount: 0,
		costCents: 0, currency: 'USD', paymentProvider: 'venmo',
		paymentHandle: '@community-gym', paymentNoteTemplate: 'Gym Sessions {{title}}',
		recapText: null, heroImageUrl: null, participants
	} satisfies AdminEventsResponse['upcoming'][number]
}

function circusEvent(id: number, title: string, weekday: number, hour: number, minute: number, durationMin: number, weeksAhead: number, participants: MockParticipant[], taken: number, cap: number) {
	const starts = isoFromWeekdayAt(weekday, hour, minute, weeksAhead)
	return {
		id, title, activityLabel: 'Circus', activitySlug: 'circus',
		startsAt: starts, endsAt: addMinutes(starts, durationMin),
		seatsTaken: taken, capacity: cap, seatsLeft: cap - taken, waitlistCount: 0,
		costCents: 0, currency: 'USD', paymentProvider: 'venmo',
		paymentHandle: '@community-gym', paymentNoteTemplate: 'Circus Sessions {{title}}',
		recapText: null, heroImageUrl: null, participants
	} satisfies AdminEventsResponse['upcoming'][number]
}

function adventureEvent(id: number, title: string, weekday: number, hour: number, minute: number, durationMin: number, weeksAhead: number, participants: MockParticipant[], taken: number, cap: number) {
	const starts = isoFromWeekdayAt(weekday, hour, minute, weeksAhead)
	return {
		id, title, activityLabel: 'Adventure', activitySlug: 'adventure',
		startsAt: starts, endsAt: addMinutes(starts, durationMin),
		seatsTaken: taken, capacity: cap, seatsLeft: cap - taken, waitlistCount: 0,
		costCents: 0, currency: 'USD', paymentProvider: 'venmo',
		paymentHandle: '@community-adventure', paymentNoteTemplate: 'Adventure Club {{title}}',
		recapText: null, heroImageUrl: null, participants
	} satisfies AdminEventsResponse['upcoming'][number]
}

function movieEvent(id: number, title: string, weekday: number, hour: number, minute: number, durationMin: number, weeksAhead: number, participants: MockParticipant[], taken: number, cap: number) {
	const starts = isoFromWeekdayAt(weekday, hour, minute, weeksAhead)
	return {
		id, title, activityLabel: 'Movies', activitySlug: 'movie-night',
		startsAt: starts, endsAt: addMinutes(starts, durationMin),
		seatsTaken: taken, capacity: cap, seatsLeft: cap - taken, waitlistCount: 0,
		costCents: 0, currency: 'USD', paymentProvider: 'venmo',
		paymentHandle: '@community-movies', paymentNoteTemplate: 'Movie Nights {{title}}',
		recapText: null, heroImageUrl: null, participants
	} satisfies AdminEventsResponse['upcoming'][number]
}

export const mockDashboardEvents: AdminEventsResponse['upcoming'] = [
	// ── Gym: Mon/Wed/Fri, repeating 3 weeks ──
	// Week 0
	gymEvent(9001, 'Morning Flow',    1, 12, 0,  90, 0, [jen, marco, ava],           5, 8),
	gymEvent(9002, 'Open Gym',        3, 15, 0, 120, 0, mockParticipants,             6, 10),
	gymEvent(9003, 'Leg Day Crew',    5, 17, 0,  90, 0, [jen, marco, ava],            4, 8),
	// Week 1
	gymEvent(9011, 'Morning Flow',    1, 12, 0,  90, 1, [jen, ava],                   3, 8),
	gymEvent(9012, 'Open Gym',        3, 15, 0, 120, 1, [marco, tyler],               2, 10),
	gymEvent(9013, 'Upper Body',      5, 17, 0,  90, 1, [jen, tyler],                 2, 8),
	gymEvent(9014, 'Saturday Stretch', 6, 10, 0, 60, 1, [ava],                        1, 6),
	// Week 2
	gymEvent(9015, 'Morning Flow',    1, 12, 0,  90, 2, [marco],                      1, 8),
	gymEvent(9016, 'Open Gym',        3, 15, 0, 120, 2, [jen, marco, ava],            3, 10),
	gymEvent(9017, 'Leg Day Crew',    5, 17, 0,  90, 2, [],                           0, 8),

	// ── Circus: Tue/Thu, repeating 3 weeks ──
	// Week 0
	circusEvent(9004, 'Aerial Fundamentals', 2, 13, 30, 120, 0, [jen, marco, ava],    4, 5),
	circusEvent(9005, 'Silks Conditioning',  4, 16,  0,  90, 0, [jen, tyler],         3, 6),
	// Week 1
	circusEvent(9018, 'Aerial Fundamentals', 2, 13, 30, 120, 1, [marco, ava],         2, 5),
	circusEvent(9019, 'Trapeze Basics',      4, 16,  0,  90, 1, [jen, marco, tyler],  3, 8),
	circusEvent(9020, 'Open Aerial',         6, 11,  0, 120, 1, [ava, tyler],         2, 6),
	// Week 2
	circusEvent(9021, 'Aerial Fundamentals', 2, 13, 30, 120, 2, [jen],                1, 5),
	circusEvent(9022, 'Silks Conditioning',  4, 16,  0,  90, 2, [],                   0, 6),

	// ── Adventure: weekends, various weeks ──
	// Week 0
	adventureEvent(9007, 'Trail Hike',            6,  9, 0, 180, 0, [jen, tyler],         3, 6),
	adventureEvent(9008, 'Forest Ridge Day Trip', 0, 13, 0, 240, 0, [jen, marco, ava],    4, 8),
	// Week 1
	adventureEvent(9023, 'River Walk',            6, 10, 0, 150, 1, [marco, ava],          2, 8),
	adventureEvent(9024, 'Sunset Point Hike',     0,  8, 0, 240, 1, [jen, tyler],          2, 6),
	// Week 2
	adventureEvent(9025, 'Waterfall Loop',        6,  9, 0, 210, 2, [],                    0, 8),

	// ── Movies: Fri/Sat evenings, various weeks ──
	// Week 0
	movieEvent(9009, 'Studio Ghibli Night',   6, 19, 0, 120, 0, mockParticipants,    4, 8),
	movieEvent(9010, 'Movie Matinee',         0, 14, 0, 120, 0, mockParticipants,    6, 10),
	// Week 1
	movieEvent(9026, 'Sci-Fi Double Feature', 5, 19, 0, 180, 1, [jen, marco, tyler], 3, 8),
	movieEvent(9027, 'Documentary Night',     6, 20, 0, 120, 1, [ava, marco],        2, 8),
	// Week 2
	movieEvent(9028, 'Anime Marathon',        6, 18, 0, 240, 2, [jen],               1, 10),
	movieEvent(9029, 'Classic Cinema',        0, 15, 0, 120, 2, [],                  0, 8),
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
