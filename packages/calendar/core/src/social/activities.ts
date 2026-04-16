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

export type CalendarActivityDefinition = Omit<CalendarActivityConfig, 'href' | 'pageTitle'> & {
	titleLabel?: string
}

const DEFAULT_CALENDAR_ACTIVITY_DEFINITIONS: CalendarActivityDefinition[] = []

let calendarActivityDefinitions: CalendarActivityDefinition[] = DEFAULT_CALENDAR_ACTIVITY_DEFINITIONS.map((activity) => ({ ...activity }))

function toActivityConfig(activity: CalendarActivityDefinition): CalendarActivityConfig {
	const config = getCalendarConfig()
	const calendarBase = config.routes.calendarBase
	const calendarName = config.brand.calendarName
	const siteName = config.brand.siteName
	return {
		slug: activity.slug,
		href: `${calendarBase}/${activity.slug}`,
		label: activity.label,
		activityName: activity.activityName,
		pageTitle: `${activity.titleLabel ?? activity.label} | ${calendarName} | ${siteName}`,
		eyebrow: activity.eyebrow,
		heroTitleLines: activity.heroTitleLines,
		heroSubtitle: activity.heroSubtitle,
		description: activity.description,
		icon: activity.icon,
		...(activity.eyebrowClass ? { eyebrowClass: activity.eyebrowClass } : {}),
		...(activity.glowClass ? { glowClass: activity.glowClass } : {}),
		...(activity.formGlowClass ? { formGlowClass: activity.formGlowClass } : {}),
		...(activity.serviceStatusNote ? { serviceStatusNote: activity.serviceStatusNote } : {})
	}
}

export function configureCalendarActivityCatalog(input: CalendarActivityDefinition[] = []) {
	calendarActivityDefinitions = input.map((activity) => ({ ...activity }))
	return getCalendarActivityList()
}

export function resetCalendarActivityCatalog() {
	calendarActivityDefinitions = DEFAULT_CALENDAR_ACTIVITY_DEFINITIONS.map((activity) => ({ ...activity }))
	return getCalendarActivityList()
}

export function getCalendarActivityDefinitions(): CalendarActivityDefinition[] {
	return calendarActivityDefinitions.map((activity) => ({ ...activity }))
}

export function getCalendarActivities() {
	const activityList = getCalendarActivityList()
	return Object.fromEntries(activityList.map((activity) => [activity.slug, activity])) satisfies Record<string, CalendarActivityConfig>
}

export function getCalendarActivityList(): CalendarActivityConfig[] {
	return calendarActivityDefinitions.map(toActivityConfig)
}
