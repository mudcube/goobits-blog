import { load as coreLoad } from '@calendar/app/routes/calendar/page.server'
import { mockCalendarRecent, mockCalendarUpcoming, mockPrograms } from '@calendar/ui/admin/mock/admin-mock-data'

export async function load(event: Parameters<typeof coreLoad>[0]) {
	const mockMode = event.url.searchParams.get('mock') === '1'
	if (!mockMode) return coreLoad(event)

	const baseData = await coreLoad(event)
	const activities = mockPrograms.map((program) => ({
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
		upcoming: mockCalendarUpcoming,
		recent: mockCalendarRecent
	}
}
