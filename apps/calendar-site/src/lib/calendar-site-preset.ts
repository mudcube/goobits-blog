import {
	configureCalendarActivityCatalog,
	configureCalendarConfig,
	type CalendarActivityDefinition
} from '@calendar/core/config'

export const calendarSitePreset = {
	brand: {
		siteName: 'Calendar',
		calendarName: 'Community Calendar',
		adminEmail: 'admin@example.com',
		inviteBypassDomain: ''
	},
	routes: {
		calendarBase: '/',
		adminBase: '/admin',
		authBase: '/auth',
		apiCalendarBase: '/api/calendar',
		apiAdminBase: '/api/admin',
		apiCalendarAdminBase: '/api/admin',
		calendarLoginPath: '/login',
		calendarLoginRedirectPath: '/login/redirect'
	},
	ics: {
		productId: '-//CALENDAR//Community Calendar//EN',
		uidPrefix: 'calendar',
		uidDomain: 'calendar.local',
		filename: 'calendar-events.ics'
	}
} as const

export const calendarSiteActivities: CalendarActivityDefinition[] = [
	{
		slug: 'gym',
		label: 'Gym',
		activityName: 'Community Gym',
		eyebrow: 'Community Gym',
		heroTitleLines: ['Hang out. Work out.', 'Have fun.'],
		heroSubtitle: "Grab a time slot and let's do something fun together.",
		description: 'Book events and work out together',
		icon: '💪',
		serviceStatusNote: 'Open for bookings'
	},
	{
		slug: 'circus',
		label: 'Circus',
		activityName: 'Community Circus',
		eyebrow: 'Community Circus',
		eyebrowClass: 'eyebrow-circus',
		glowClass: 'glow-circus',
		formGlowClass: 'form-glow-circus',
		heroTitleLines: ['Fly high. Spin fast.', 'Be brave.'],
		heroSubtitle: 'Aerial arts and circus skills training for all levels.',
		description: 'Aerial arts and circus skills',
		icon: '🎪',
		serviceStatusNote: 'Open for bookings'
	},
	{
		slug: 'adventure',
		label: 'Adventure',
		activityName: 'Community Adventure',
		eyebrow: 'Community Adventure',
		eyebrowClass: 'eyebrow-adventure',
		glowClass: 'glow-adventure',
		formGlowClass: 'form-glow-adventure',
		heroTitleLines: ['Get outside.', 'Find something new.'],
		heroSubtitle: 'Weekend adventures, hikes, and trips with the crew.',
		description: 'Outdoor excursions and trips',
		icon: '🏔️',
		serviceStatusNote: 'Open for bookings'
	},
	{
		slug: 'movie-night',
		label: 'Movies',
		titleLabel: 'Movie Night',
		activityName: 'Movie Night',
		eyebrow: 'Movie Night',
		eyebrowClass: 'eyebrow-movie',
		glowClass: 'glow-movie',
		formGlowClass: 'form-glow-movie',
		heroTitleLines: ['Grab some snacks.', 'Watch together.'],
		heroSubtitle: 'Weekend movie nights with the community.',
		description: 'Community film screenings',
		icon: '🎬',
		serviceStatusNote: 'Open for bookings'
	}
]

export function applyCalendarSitePreset() {
	configureCalendarActivityCatalog([...calendarSiteActivities])
	return configureCalendarConfig(calendarSitePreset)
}
