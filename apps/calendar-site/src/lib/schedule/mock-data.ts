type MockProgram = {
	slug: string
	href: string
	label: string
	icon: string
	eyebrow: string
	heroTitleLines: string[]
	heroSubtitle: string
	description: string
	enabled: boolean
	sortOrder: number
	pageTitle: string
	activityName: string
	serviceStatusNote: string
	eyebrowClass: string
	glowClass: string
	formGlowClass: string
}

type MockCalendarEvent = {
	id: number
	activitySlug: string
	activityLabel: string
	title: string
	startsAt: string
	endsAt: string
	capacity: number
	seatsTaken: number
	seatsLeft: number
	waitlistCount: number
	userStatus: null
	userGuestCount: number
	location: null
	note: null
	costCents: number
	currency: string
	paymentProvider: string
	paymentHandle: string
	paymentNoteTemplate: string
	recapText: string | null
	heroImageUrl: string | null
	participants: Array<{ userId: string; name: string | null; avatarUrl: string | null }>
}

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

const participants = [
	{ userId: 'u-jen', name: 'Jen Kline', avatarUrl: null },
	{ userId: 'u-marco', name: 'Marco Ruiz', avatarUrl: null },
	{ userId: 'u-ava', name: 'Ava Lee', avatarUrl: null },
	{ userId: 'u-tyler', name: 'Tyler Scott', avatarUrl: null }
] as const

export const scheduleMockPrograms: MockProgram[] = [
	{
		slug: 'gym',
		href: '/gym',
		label: 'Rainbow Gym',
		icon: '💪',
		eyebrow: 'Rainbow Gym',
		heroTitleLines: ['Hang out. Work out.', 'Whatever.'],
		heroSubtitle: "Grab a time slot and let's do something fun together.",
		description: 'Strength, movement, and play events for all levels.',
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
		href: '/circus',
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
	},
	{
		slug: 'adventure',
		href: '/adventure',
		label: 'Rainbow Adventure',
		icon: '🏔️',
		eyebrow: 'Rainbow Adventure',
		heroTitleLines: ['Explore more.', 'Get outside.'],
		heroSubtitle: 'Weekend adventures, hikes, and trips with the crew.',
		description: 'Weekend adventures, hikes, and trips with the crew.',
		enabled: true,
		sortOrder: 3,
		pageTitle: 'Rainbow Adventure',
		activityName: 'Adventure',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-adventure',
		glowClass: 'glow-adventure',
		formGlowClass: 'form-glow-adventure'
	},
	{
		slug: 'movie-night',
		href: '/movie-night',
		label: 'Rainbow Movies',
		icon: '🎬',
		eyebrow: 'Rainbow Movies',
		heroTitleLines: ['Bring snacks.', 'Cue the projector.'],
		heroSubtitle: 'Weekend movie nights with the community.',
		description: 'Weekend movie nights with the community.',
		enabled: true,
		sortOrder: 4,
		pageTitle: 'Rainbow Movies',
		activityName: 'Movies',
		serviceStatusNote: 'Open for bookings',
		eyebrowClass: 'eyebrow-movie',
		glowClass: 'glow-movie',
		formGlowClass: 'form-glow-movie'
	}
]

const jen = participants[0]!
const marco = participants[1]!
const ava = participants[2]!
const tyler = participants[3]!

function mockEvent(id: number, slug: string, label: string, title: string, weekday: number, hour: number, minute: number, durationMin: number, weeksAhead: number, people: typeof participants[number][], taken: number, cap: number, handle = '@rainbowgym', template = ''): MockCalendarEvent {
	const starts = isoFromWeekdayAt(weekday, hour, minute, weeksAhead)
	return {
		id, activitySlug: slug, activityLabel: label, title,
		startsAt: starts, endsAt: addMinutes(starts, durationMin),
		seatsTaken: taken, capacity: cap, seatsLeft: cap - taken, waitlistCount: 0,
		userStatus: null, userGuestCount: 0, location: null, note: null,
		costCents: 0, currency: 'USD', paymentProvider: 'venmo',
		paymentHandle: handle, paymentNoteTemplate: template || `${label} {{title}}`,
		recapText: null, heroImageUrl: null, participants: people.map(p => ({ ...p }))
	}
}

export const scheduleMockUpcoming: MockCalendarEvent[] = [
	// ── Gym: Mon/Wed/Fri, 3 weeks ──
	mockEvent(9030, 'gym', 'Gym', 'Early Strength',    1,  7, 30, 60, 0, [jen],                2, 6),
	mockEvent(9001, 'gym', 'Gym', 'Morning Flow',     1, 12, 0,  90, 0, [jen, marco, ava],    5, 8),
	mockEvent(9031, 'gym', 'Gym', 'After Work Lift',  1, 18, 0,  75, 0, [...participants],     8, 8),
	mockEvent(9002, 'gym', 'Gym', 'Open Gym',         3, 15, 0, 120, 0, [...participants],     6, 10),
	mockEvent(9032, 'gym', 'Gym', 'Mobility Reset',   3, 18, 30, 45, 0, [ava],                 1, 5),
	mockEvent(9033, 'gym', 'Gym', 'Lunch Circuit',    5, 12, 15, 60, 0, [marco],               3, 6),
	mockEvent(9003, 'gym', 'Gym', 'Leg Day Crew',     5, 17, 0,  90, 0, [jen, marco, ava],     4, 8),
	mockEvent(9011, 'gym', 'Gym', 'Morning Flow',     1, 12, 0,  90, 1, [jen, ava],            3, 8),
	mockEvent(9034, 'gym', 'Gym', 'Evening Strength', 1, 18, 15, 75, 1, [marco, tyler],        5, 6),
	mockEvent(9035, 'gym', 'Gym', 'Quick Circuit',    3,  7, 45, 45, 1, [ava],                 2, 5),
	mockEvent(9012, 'gym', 'Gym', 'Open Gym',         3, 15, 0, 120, 1, [marco, tyler],        2, 10),
	mockEvent(9013, 'gym', 'Gym', 'Upper Body',       5, 17, 0,  90, 1, [jen, tyler],          2, 8),
	mockEvent(9014, 'gym', 'Gym', 'Saturday Stretch', 6, 10, 0,  60, 1, [ava],                 1, 6),
	mockEvent(9015, 'gym', 'Gym', 'Morning Flow',     1, 12, 0,  90, 2, [marco],               1, 8),
	mockEvent(9016, 'gym', 'Gym', 'Open Gym',         3, 15, 0, 120, 2, [jen, marco, ava],     3, 10),
	mockEvent(9017, 'gym', 'Gym', 'Leg Day Crew',     5, 17, 0,  90, 2, [],                    0, 8),

	// ── Circus: Tue/Thu, 3 weeks ──
	mockEvent(9004, 'circus', 'Circus', 'Aerial Fundamentals', 2, 13, 30, 120, 0, [jen, marco, ava],   4, 5),
	mockEvent(9005, 'circus', 'Circus', 'Silks Conditioning',  4, 16,  0,  90, 0, [jen, tyler],        3, 6),
	mockEvent(9018, 'circus', 'Circus', 'Aerial Fundamentals', 2, 13, 30, 120, 1, [marco, ava],        2, 5),
	mockEvent(9019, 'circus', 'Circus', 'Trapeze Basics',      4, 16,  0,  90, 1, [jen, marco, tyler], 3, 8),
	mockEvent(9020, 'circus', 'Circus', 'Open Aerial',         6, 11,  0, 120, 1, [ava, tyler],        2, 6),
	mockEvent(9021, 'circus', 'Circus', 'Aerial Fundamentals', 2, 13, 30, 120, 2, [jen],               1, 5),
	mockEvent(9022, 'circus', 'Circus', 'Silks Conditioning',  4, 16,  0,  90, 2, [],                  0, 6),

	// ── Adventure: weekends, 3 weeks ──
	mockEvent(9007, 'adventure', 'Adventure', 'Trail Hike',            6,  9, 0, 180, 0, [jen, tyler],      3, 6, '@rainbowadventure'),
	mockEvent(9008, 'adventure', 'Adventure', 'Forest Ridge Day Trip', 0, 13, 0, 240, 0, [jen, marco, ava], 4, 8, '@rainbowadventure'),
	mockEvent(9023, 'adventure', 'Adventure', 'River Walk',            6, 10, 0, 150, 1, [marco, ava],      2, 8, '@rainbowadventure'),
	mockEvent(9024, 'adventure', 'Adventure', 'Sunset Point Hike',     0,  8, 0, 240, 1, [jen, tyler],      2, 6, '@rainbowadventure'),
	mockEvent(9025, 'adventure', 'Adventure', 'Waterfall Loop',        6,  9, 0, 210, 2, [],                0, 8, '@rainbowadventure'),

	// ── Movies: Fri/Sat evenings, 3 weeks ──
	mockEvent(9009, 'movie-night', 'Movies', 'Studio Ghibli Night',   6, 19, 0, 120, 0, [...participants],    4, 8, '@rainbowmovies'),
	mockEvent(9010, 'movie-night', 'Movies', 'Movie Matinee',         0, 14, 0, 120, 0, [...participants],    6, 10, '@rainbowmovies'),
	mockEvent(9026, 'movie-night', 'Movies', 'Sci-Fi Double Feature', 5, 19, 0, 180, 1, [jen, marco, tyler], 3, 8, '@rainbowmovies'),
	mockEvent(9027, 'movie-night', 'Movies', 'Documentary Night',     6, 20, 0, 120, 1, [ava, marco],        2, 8, '@rainbowmovies'),
	mockEvent(9028, 'movie-night', 'Movies', 'Anime Marathon',        6, 18, 0, 240, 2, [jen],               1, 10, '@rainbowmovies'),
	mockEvent(9029, 'movie-night', 'Movies', 'Classic Cinema',        0, 15, 0, 120, 2, [],                  0, 8, '@rainbowmovies'),
]

export const scheduleMockRecent: MockCalendarEvent[] = [
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
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowmovies',
		paymentNoteTemplate: 'Rainbow Movies {{title}}',
		recapText: 'Great turnout and cozy vibes.',
		heroImageUrl: null,
		participants: [participants[0]!]
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
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: 'Solid energy and clean finish.',
		heroImageUrl: null,
		participants: [participants[1]!]
	},
	{
		id: 9103,
		title: 'Forest Ridge Day Trip',
		activityLabel: 'Adventure',
		activitySlug: 'adventure',
		startsAt: isoWithTimeOffset(-3, 11, 0),
		endsAt: isoWithTimeOffset(-3, 15, 0),
		seatsTaken: 5,
		capacity: 8,
		seatsLeft: 3,
		waitlistCount: 0,
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowadventure',
		paymentNoteTemplate: 'Rainbow Adventure {{title}}',
		recapText: 'Sunny trails and great vibes.',
		heroImageUrl: null,
		participants: [participants[0]!, participants[2]!]
	}
]
