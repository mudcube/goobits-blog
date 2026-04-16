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
		href: '/schedule/gym',
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
		href: '/schedule/circus',
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
		href: '/schedule/adventure',
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
		href: '/schedule/movie-night',
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

export const scheduleMockUpcoming: MockCalendarEvent[] = [
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
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Gym {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [participants[0]!, participants[1]!, participants[2]!]
	},
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
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowgym',
		paymentNoteTemplate: 'Rainbow Circus {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [participants[0]!, participants[1]!, participants[2]!]
	},
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
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowadventure',
		paymentNoteTemplate: 'Rainbow Adventure {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [participants[0]!, participants[3]!]
	},
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
		userStatus: null,
		userGuestCount: 0,
		location: null,
		note: null,
		costCents: 0,
		currency: 'USD',
		paymentProvider: 'venmo',
		paymentHandle: '@rainbowmovies',
		paymentNoteTemplate: 'Rainbow Movies {{title}}',
		recapText: null,
		heroImageUrl: null,
		participants: [...participants]
	}
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
