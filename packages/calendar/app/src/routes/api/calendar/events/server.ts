import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { createEventsBatch, listEventsFeed } from '@calendar/core/booking'
import { getCalendarProgramBySlug } from '@calendar/core/admin'
import { buildPaymentLink } from '@calendar/core/payments'
import { ensureCalendarCreatorTenant } from '@calendar/core/tenants'
import { parseCalendarCreateEventInput, TransportValidationError } from '@calendar/core/transport'
import { enqueueCalendarSyncJob, processCalendarSyncQueue } from '@calendar/core/sync'
import { apiError, apiOk, apiValidationError, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'
import { enforceSameOrigin } from '@calendar/app/admin-api-helpers'

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

export async function POST(event: RequestEvent) {
	return runCalendarRequest(
		'calendar.events.create',
		async () => {
			const csrf = enforceSameOrigin(event)
			if (csrf) return csrf
			const user = requireCalendarUserId(event)
			if (user.response) return user.response
			const userId = user.userId
			const input = parseCalendarCreateEventInput(await event.request.json().catch(() => null))
			const env = await buildEnv(event.platform)
			const program = await getCalendarProgramBySlug(env.DB, input.activitySlug)
			if (!program) return apiError('Program not found', { status: 404 })

			const tenant = await ensureCalendarCreatorTenant(env.DB, { userId })
			const ids = await createEventsBatch(env.DB, {
				tenantId: tenant.id,
				createdByUserId: userId,
				activitySlug: program.slug,
				title: input.title,
				startsAt: input.startsAt,
				endsAt: input.endsAt,
				capacity: input.capacity,
				location: input.location,
				note: input.note,
				...(input.timezone ? { timezone: input.timezone } : {})
			})

			try {
				await Promise.all(ids.map((eventId) => enqueueCalendarSyncJob(env.DB, {
					eventId,
					trigger: 'member_event_create',
					requestedByUserId: userId
				})))
				void processCalendarSyncQueue(env.DB, env, Math.min(10, ids.length)).catch((error) => {
					console.warn('Best-effort calendar sync processing failed after member event create:', error)
				})
			} catch (error) {
				console.warn('Failed to enqueue calendar sync after member event create:', error)
			}

			return apiOk({ ids, tenant })
		},
		{
			onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
		}
	)
}
