import { json, type RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { parseSyncQueueProcessLimitInput, processCalendarSyncQueue, TransportValidationError } from '@calendar/core'
import { apiError, apiValidationError } from '@calendar/kit'

export async function POST(event: RequestEvent) {
	try {
		const env = await buildEnv(event.platform)
		const configured = String(env['CALENDAR_SYNC_CRON_SECRET'] || '')
		if (!configured) return apiError('Unauthorized', { status: 401 })

		const authHeader = event.request.headers.get('authorization') || ''
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : ''
		if (!token || token !== configured) return apiError('Unauthorized', { status: 401 })

		const limit = parseSyncQueueProcessLimitInput(await event.request.json().catch(() => null))
		const result = await processCalendarSyncQueue(env.DB, env, limit)
		return json({ ok: true, ...result })
	} catch (error) {
		if (error instanceof TransportValidationError) {
			return apiValidationError(error)
		}
		console.error('Internal calendar sync runner failed:', error)
		return apiError('Internal server error')
	}
}
