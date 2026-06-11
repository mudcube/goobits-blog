import { load as coreLoad } from '@calendar/app/routes/calendar/page.server'
import { isScheduleDesignMode, withScheduleDesignMode } from '$lib/schedule/design-mode'
import { scheduleMockPrograms, scheduleMockRecent, scheduleMockUpcoming } from '$lib/schedule/mock-data'

export async function load(event: Parameters<typeof coreLoad>[0]) {
	const mockMode = isScheduleDesignMode(event.url)
	if (!mockMode) return coreLoad(event)

	const baseData = await coreLoad(event)
	const activities = scheduleMockPrograms.map((program) => ({
		id: program.slug,
		slug: program.slug,
		label: program.activityName || program.label,
		icon: program.icon,
		description: program.description,
		href: withScheduleDesignMode(`/${program.slug}/`, mockMode)
	}))

	return {
		...baseData,
		mockMode: true,
		activities,
		upcoming: scheduleMockUpcoming,
		recent: scheduleMockRecent
	}
}
