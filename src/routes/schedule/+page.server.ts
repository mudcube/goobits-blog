import { load as coreLoad } from '@calendar/app/routes/calendar/page.server'
import { scheduleMockPrograms, scheduleMockRecent, scheduleMockUpcoming } from '$lib/app/schedule/mock-data'

export async function load(event: Parameters<typeof coreLoad>[0]) {
	const mockMode = event.url.searchParams.get('mock') === '1'
	if (!mockMode) return coreLoad(event)

	const baseData = await coreLoad(event)
	const activities = scheduleMockPrograms.map((program) => ({
		id: program.slug,
		slug: program.slug,
		label: program.activityName || program.label,
		icon: program.icon,
		description: program.description,
		href: `/schedule/${program.slug}/${mockMode ? '?mock=1' : ''}`
	}))

	return {
		...baseData,
		mockMode: true,
		activities,
		upcoming: scheduleMockUpcoming,
		recent: scheduleMockRecent
	}
}
