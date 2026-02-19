import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { createEventsBatch, getAdminPaymentDefaults, listEventsFeed } from '@calendar/core'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { getCalendarProgramBySlug, parseAdminCreateEventsBatchInput, TransportValidationError } from '@calendar/core'
import { apiOk, apiError, apiValidationError } from '@calendar/kit'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.events.list', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const env = await buildEnv(event.platform)
		const feed = await listEventsFeed(env.DB, '__admin__', false)
		return apiOk({ upcoming: feed.upcoming, recent: feed.recent })
	})
}

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.events.create', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard

		const input = parseAdminCreateEventsBatchInput(await event.request.json().catch(() => null))

		const env = await buildEnv(event.platform)
		const defaults = await getAdminPaymentDefaults(env.DB)
		const program = await getCalendarProgramBySlug(env.DB, input.activitySlug, { includeDisabled: true })
		if (!program) {
			return apiError('Program not found', { status: 404 })
		}
		const ids = await createEventsBatch(env.DB, {
			activitySlug: program.slug,
			title: input.title,
			startsAt: input.startsAt,
			endsAt: input.endsAt,
			capacity: input.capacity,
			costCents: input.costCents,
			currency: input.currency,
			paymentProvider: input.paymentProvider || defaults.provider || null,
			paymentHandle: input.paymentHandle || defaults.handle || null,
			paymentNoteTemplate: input.paymentNoteTemplate,
			location: input.location,
			note: input.note,
			repeatWeeks: input.repeatWeeks
		})

		logAdminEvent(event, 'events_create_batch', { count: ids.length, activitySlug: input.activitySlug })
		return apiOk({ ids })
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
