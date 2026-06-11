import {
	configureCalendarActivityCatalog,
	configureCalendarConfig,
	type CalendarActivityDefinition
} from '@calendar/core/config'

export const calendarSitePreset = {
	brand: {
		siteName: 'pdx.fun',
		calendarName: 'pdx.fun',
		adminEmail: 'hello@pdx.fun',
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
		productId: '-//PDX.FUN//Events//EN',
		uidPrefix: 'pdx-fun',
		uidDomain: 'pdx.fun',
		filename: 'pdx-fun-events.ics'
	}
} as const

export const calendarSiteActivities: CalendarActivityDefinition[] = [
	{
		slug: 'gym',
		label: 'Gym',
		activityName: 'Movement',
		eyebrow: 'Movement',
		heroTitleLines: ['Hang out. Work out.', 'Have fun.'],
		heroSubtitle: 'Find open gyms, movement jams, and active things around Portland.',
		description: 'Open gyms and movement events',
		icon: '💪',
		serviceStatusNote: 'Open for bookings'
	},
	{
		slug: 'circus',
		label: 'Circus',
		activityName: 'Circus',
		eyebrow: 'Circus',
		eyebrowClass: 'eyebrow-circus',
		glowClass: 'glow-circus',
		formGlowClass: 'form-glow-circus',
		heroTitleLines: ['Fly high. Spin fast.', 'Be brave.'],
		heroSubtitle: 'Aerial arts, circus skills, and playful training for all levels.',
		description: 'Aerial arts and circus skills',
		icon: '🎪',
		serviceStatusNote: 'Open for bookings'
	},
	{
		slug: 'adventure',
		label: 'Adventure',
		activityName: 'Adventure',
		eyebrow: 'Adventure',
		eyebrowClass: 'eyebrow-adventure',
		glowClass: 'glow-adventure',
		formGlowClass: 'form-glow-adventure',
		heroTitleLines: ['Get outside.', 'Find something new.'],
		heroSubtitle: 'Weekend adventures, hikes, rides, and trips with local crews.',
		description: 'Outdoor trips and local excursions',
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
