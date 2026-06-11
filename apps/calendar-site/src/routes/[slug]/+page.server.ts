import { error } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { listEventsFeed } from '@calendar/core/booking'
import { getCalendarProgramBySlug } from '@calendar/core/admin'
import { buildPaymentLink } from '@calendar/core/payments'
import { isScheduleDesignMode } from '$lib/schedule/design-mode'
import { scheduleMockPrograms, scheduleMockRecent, scheduleMockUpcoming } from '$lib/schedule/mock-data'
import type { RequestEvent } from './$types'

export async function load(event: RequestEvent) {
	const slug = event.params.slug

	if (isScheduleDesignMode(event.url)) {
		const activity = scheduleMockPrograms.find((program) => program.slug === slug)
		if (!activity) throw error(404, 'Program not found')

		return {
			activity,
			mockMode: true,
			upcoming: scheduleMockUpcoming.filter((entry) => entry.activitySlug === slug),
			recent: scheduleMockRecent.filter((entry) => entry.activitySlug === slug)
		}
	}

	const env = await buildEnv(event.platform)
	const activity = await getCalendarProgramBySlug(env.DB, slug)
	if (!activity) throw error(404, 'Program not found')

	const userId = event.locals.user?.id ?? ''
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
