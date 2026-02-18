import { getCalendarConfig } from '../config/calendar.ts'

export type CalendarActivityConfig = {
	slug: string
	href: string
	label: string
	activityName: string
	pageTitle: string
	eyebrow: string
	eyebrowClass?: string
	glowClass?: string
	formGlowClass?: string
	heroTitleLines: [string] | [string, string]
	heroSubtitle: string
	serviceStatusNote?: string
	description: string
	icon: string
}

export function getCalendarActivities() {
	const config = getCalendarConfig()
	const calendarBase = config.routes.calendarBase
	const calendarName = config.brand.calendarName
	const siteName = config.brand.siteName

	return {
		gym: {
			slug: 'gym',
			href: `${calendarBase}/gym`,
			label: 'Gym',
			activityName: calendarName,
			pageTitle: `Gym | ${calendarName} | ${siteName}`,
			eyebrow: calendarName,
			heroTitleLines: ['Hang out. Work out.', 'Whatever.'],
			heroSubtitle: "Grab a time slot and let's do something fun together.",
			description: 'Book sessions and work out together',
			icon: '💪'
		},
		circus: {
			slug: 'circus',
			href: `${calendarBase}/circus`,
			label: 'Circus',
			activityName: 'Rainbow Circus',
			pageTitle: `Circus | ${calendarName} | ${siteName}`,
			eyebrow: 'Rainbow Circus',
			eyebrowClass: 'eyebrow-circus',
			glowClass: 'glow-circus',
			formGlowClass: 'form-glow-circus',
			heroTitleLines: ['Fly high. Spin fast.', 'Be brave.'],
			heroSubtitle: 'Aerial arts and circus skills training for all levels.',
			description: 'Aerial arts and circus skills',
			icon: '🎪'
		},
		adventure: {
			slug: 'adventure',
			href: `${calendarBase}/adventure`,
			label: 'Adventure',
			activityName: 'Rainbow Adventure',
			pageTitle: `Adventure | ${calendarName} | ${siteName}`,
			eyebrow: 'Rainbow Adventure',
			eyebrowClass: 'eyebrow-adventure',
			glowClass: 'glow-adventure',
			formGlowClass: 'form-glow-adventure',
			heroTitleLines: ['Get outside.', 'Find something new.'],
			heroSubtitle: 'Outdoor excursions and group adventures in the Pacific Northwest.',
			description: 'Outdoor excursions and trips',
			icon: '🏔️'
		},
		'movie-night': {
			slug: 'movie-night',
			href: `${calendarBase}/movie-night`,
			label: 'Movies',
			activityName: 'Movie Night',
			pageTitle: `Movie Night | ${calendarName} | ${siteName}`,
			eyebrow: 'Movie Night',
			eyebrowClass: 'eyebrow-movie',
			glowClass: 'glow-movie',
			formGlowClass: 'form-glow-movie',
			heroTitleLines: ['Grab some snacks.', 'Watch together.'],
			heroSubtitle: 'Community movie screenings and cozy film nights.',
			description: 'Community film screenings',
			icon: '🎬'
		}
	} satisfies Record<string, CalendarActivityConfig>
}

export function getCalendarActivityList(): CalendarActivityConfig[] {
	const activities = getCalendarActivities()
	return [
		activities.gym,
		activities.circus,
		activities.adventure,
		activities['movie-night']
	]
}
