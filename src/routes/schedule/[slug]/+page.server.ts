import { error } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { buildPaymentLink, getCalendarProgramBySlug, listEventsFeed } from '@calendar/core'
import { mockCalendarRecent, mockCalendarUpcoming, mockPrograms } from '$lib/admin/mock/admin-mock-data'
import type { RequestEvent } from './$types'

export async function load(event: RequestEvent) {
	const mockMode = event.url.searchParams.get('mock') === '1'
	const slug = event.params.slug

	if (mockMode) {
		const activity = mockPrograms.find((program) => program.slug === slug)
		if (!activity) error(404, 'Program not found')

		return {
			activity,
			mockMode: true,
			upcoming: mockCalendarUpcoming.filter((entry) => entry.activitySlug === slug),
			recent: mockCalendarRecent.filter((entry) => entry.activitySlug === slug)
		}
	}

	const env = await buildEnv(event.platform)
	const activity = await getCalendarProgramBySlug(env.DB, slug)
	if (!activity) error(404, 'Program not found')

	const rawUserId = event.locals.user?.id
	const userId =
		typeof rawUserId === 'string'
			? rawUserId
			: typeof rawUserId === 'number'
				? String(rawUserId)
				: ''

	const feed = userId ? await listEventsFeed(env.DB, userId, false) : { upcoming: [], recent: [] }
	const upcoming = feed.upcoming
		.filter((entry) => entry.activitySlug === activity.slug)
		.map((entry) => ({
			...entry,
			payUrl: buildPaymentLink({
				provider: entry.paymentProvider,
				handle: entry.paymentHandle,
				amountCents: entry.costCents,
				currency: entry.currency,
				note: entry.paymentNoteTemplate || entry.title
			})
		}))
	const recent = feed.recent.filter((entry) => entry.activitySlug === activity.slug)

	return { activity, upcoming, recent, mockMode: false }
}
