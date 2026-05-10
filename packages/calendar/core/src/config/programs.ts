import { getCalendarActivityList, type CalendarActivityConfig } from './activities.ts'

export type CalendarProgramSlug = CalendarActivityConfig['slug']

export function isKnownProgramSlug(value: string): value is CalendarProgramSlug {
	const knownProgramSlugs = new Set<CalendarProgramSlug>(getCalendarActivityList().map((activity) => activity.slug))
	return knownProgramSlugs.has(value as CalendarProgramSlug)
}

export function isValidProgramSlug(slug: string) {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}
