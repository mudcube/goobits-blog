import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { buildPaymentLink, listEventsFeed } from '@calendar/core'
import { apiOk, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runCalendarRequest('calendar.events.list', async () => {
		const user = requireCalendarUserId(event)
		if (user.response) return user.response
		const userId = user.userId
		const env = await buildEnv(event.platform)
		const onlyMine = event.url.searchParams.get('mine') === '1'
		const feed = await listEventsFeed(env.DB, userId, onlyMine)
		const withPayLinks = {
			upcoming: feed.upcoming.map((entry) => ({
				...entry,
				payUrl: buildPaymentLink({
					provider: entry.paymentProvider,
					handle: entry.paymentHandle,
					amountCents: entry.costCents,
					currency: entry.currency,
					note: entry.paymentNoteTemplate || entry.title
				})
			})),
			recent: feed.recent
		}
		return apiOk(withPayLinks)
	})
}
