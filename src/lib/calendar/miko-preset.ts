/**
 * Miko-specific calendar preset — site brand strings, route paths, ICS
 * identity, and the activity catalog. Lives in `src/lib/` rather than
 * `packages/calendar/presets/` because these are site-level decisions
 * (miko.art brand, /schedule paths, miko-calendar UIDs); the calendar
 * package is meant to be reusable, the preset is not.
 *
 * Loaded once at app startup via hooks.server.ts and +layout.ts.
 */
import {
	configureCalendarActivityCatalog,
	configureCalendarConfig,
	type CalendarActivityDefinition
} from '@calendar/core/config'

export const mikoCalendarPreset = {
	brand: {
		siteName: 'MIKO.ART',
		calendarName: 'Rainbow Gym',
		adminEmail: 'admin@miko.art',
		inviteBypassDomain: 'miko.art'
	},
	routes: {
		calendarBase: '/schedule',
		adminBase: '/schedule/admin',
		authBase: '/auth',
		apiCalendarBase: '/api/calendar',
		apiAdminBase: '/api/admin',
		apiCalendarAdminBase: '/api/admin',
		calendarLoginPath: '/schedule/login',
		calendarLoginRedirectPath: '/schedule/login/redirect'
	},
	ics: {
		productId: '-//MIKO.ART//Calendar Social//EN',
		uidPrefix: 'miko-calendar',
		uidDomain: 'miko.art',
		filename: 'miko-events.ics'
	}
} as const

export const mikoCalendarActivities: CalendarActivityDefinition[] = [
	{
		slug: 'gym',
		label: 'Gym',
		activityName: 'Rainbow Gym',
		eyebrow: 'Rainbow Gym',
		heroTitleLines: ['Hang out. Work out.', 'Have fun.'] as [string, string],
		heroSubtitle: "Grab a time slot and let's do something fun together.",
		description: 'Book events and work out together',
		icon: '💪',
		serviceStatusNote: 'Open for bookings'
	},
	{
		slug: 'circus',
		label: 'Circus',
		activityName: 'Rainbow Circus',
		eyebrow: 'Rainbow Circus',
		eyebrowClass: 'eyebrow-circus',
		glowClass: 'glow-circus',
		formGlowClass: 'form-glow-circus',
		heroTitleLines: ['Fly high. Spin fast.', 'Be brave.'] as [string, string],
		heroSubtitle: 'Aerial arts and circus skills training for all levels.',
		description: 'Aerial arts and circus skills',
		icon: '🎪',
		serviceStatusNote: 'Open for bookings'
	},
	{
		slug: 'adventure',
		label: 'Adventure',
		activityName: 'Rainbow Adventure',
		eyebrow: 'Rainbow Adventure',
		eyebrowClass: 'eyebrow-adventure',
		glowClass: 'glow-adventure',
		formGlowClass: 'form-glow-adventure',
		heroTitleLines: ['Get outside.', 'Find something new.'] as [string, string],
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
		heroTitleLines: ['Grab some snacks.', 'Watch together.'] as [string, string],
		heroSubtitle: 'Weekend movie nights with the community.',
		description: 'Community film screenings',
		icon: '🎬',
		serviceStatusNote: 'Open for bookings'
	}
]

export function applyMikoCalendarPreset() {
	configureCalendarActivityCatalog([...mikoCalendarActivities])
	return configureCalendarConfig(mikoCalendarPreset)
}
