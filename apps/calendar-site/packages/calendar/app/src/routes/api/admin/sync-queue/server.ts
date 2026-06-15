import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import {
	processCalendarSyncQueue,
	purgeCalendarSyncDeadLetters,
	retryCalendarSyncDeadLetters
} from '@calendar/core/sync'
import { parseAdminSyncQueueActionInput, TransportValidationError } from '@calendar/core/transport'
import { apiOk, apiValidationError } from '@calendar/kit'

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.sync-queue', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const env = await buildEnv(event.platform)
		const input = parseAdminSyncQueueActionInput(await event.request.json().catch(() => null))
		if (input.action === 'retry_dead_letters') {
			const result = await retryCalendarSyncDeadLetters(env.DB, input.limit)
			return apiOk({ action: input.action, ...result })
		}
		if (input.action === 'purge_dead_letters') {
			const result = await purgeCalendarSyncDeadLetters(env.DB, input.limit)
			return apiOk({ action: input.action, ...result })
		}
		const result = await processCalendarSyncQueue(env.DB, env, input.limit)
		return apiOk({ action: input.action, ...result })
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
