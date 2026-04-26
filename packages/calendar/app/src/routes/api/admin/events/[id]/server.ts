import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { cancelEvent, enqueueCalendarSyncJob, parseAdminEventUpdateInput, processCalendarSyncQueue, setAttendanceStatus, TransportValidationError, updateEventCapacity, updateEventDetails, updateEventMemory } from '@calendar/core'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiOk, apiError, apiValidationError } from '@calendar/kit'

async function enqueueEventSync(env: Awaited<ReturnType<typeof buildEnv>>, eventId: number, trigger: string) {
	try {
		await enqueueCalendarSyncJob(env.DB, { eventId, trigger, requestedByUserId: null })
		void processCalendarSyncQueue(env.DB, env, 2).catch((error) => {
			console.warn(`Best-effort calendar sync processing failed after ${trigger}:`, error)
		})
	} catch (error) {
		console.warn(`Failed to enqueue calendar sync after ${trigger}:`, error)
	}
}

export async function POST(event: RequestEvent) {
	return runApiRequest('admin.events.update', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard

		const eventParam = event.params['id']
		if (!eventParam) {
			return apiError('Missing event id', { status: 400 })
		}
		const eventId = Number.parseInt(eventParam, 10)
		if (!Number.isFinite(eventId) || eventId <= 0) {
			return apiError('Invalid event id', { status: 400 })
		}

		const env = await buildEnv(event.platform)
		const input = parseAdminEventUpdateInput(await event.request.json().catch(() => null))
		if (input.action === 'capacity') {
			await updateEventCapacity(env.DB, { eventId, capacity: input.capacity })
			await enqueueEventSync(env, eventId, 'admin_event_capacity')
			logAdminEvent(event, 'event_capacity_update', { eventId, capacity: input.capacity })
			return apiOk({})
		}

		if (input.action === 'attendance') {
			await setAttendanceStatus(env.DB, { eventId, userId: input.userId, attendanceStatus: input.attendanceStatus })
			logAdminEvent(event, 'event_attendance_update', { eventId, userId: input.userId, attendanceStatus: input.attendanceStatus })
			return apiOk({})
		}

		if (input.action === 'event') {
			await updateEventDetails(env.DB, {
				eventId,
				title: input.title,
				startsAt: input.startsAt,
				endsAt: input.endsAt
			})
			await enqueueEventSync(env, eventId, 'admin_event_update')
			logAdminEvent(event, 'event_update', { eventId })
			return apiOk({})
		}

		if (input.action === 'memory') {
			await updateEventMemory(env.DB, {
				eventId,
				recapText: input.recapText,
				heroImageUrl: input.heroImageUrl
			})
			logAdminEvent(event, 'event_memory_update', { eventId })
			return apiOk({})
		}

		if (input.action === 'delete') {
			await cancelEvent(env.DB, { eventId })
			await enqueueEventSync(env, eventId, 'admin_event_cancel')
			logAdminEvent(event, 'event_delete', { eventId })
			return apiOk({})
		}

		return apiError('Unknown action', { status: 400 })
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
