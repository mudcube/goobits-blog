import { error, fail, redirect } from '@sveltejs/kit'
import { buildEnv, getCalendarUserId } from '@calendar/kit'
import { cancelEvent, updateEventCapacity, updateEventDetails } from '@calendar/core/booking'
import { enqueueCalendarSyncJob, processCalendarSyncQueue } from '@calendar/core/sync'
import {
	canManageCalendarEvent,
	getCalendarTenantById,
	getCalendarTenantOrganizerEvent
} from '@calendar/core/tenants'
import type { Actions, PageServerLoad, RequestEvent } from './$types'

async function enqueueOrganizerEventSync(env: Awaited<ReturnType<typeof buildEnv>>, eventId: number, trigger: string, userId: string) {
	try {
		await enqueueCalendarSyncJob(env.DB, {
			eventId,
			trigger,
			requestedByUserId: userId
		})
		void processCalendarSyncQueue(env.DB, env, 2).catch((syncError) => {
			console.warn(`Best-effort calendar sync processing failed after ${trigger}:`, syncError)
		})
	} catch (syncError) {
		console.warn(`Failed to enqueue calendar sync after ${trigger}:`, syncError)
	}
}

function readEventId(event: RequestEvent) {
	const eventId = Number.parseInt(event.params.event, 10)
	if (!Number.isFinite(eventId) || eventId <= 0) throw error(404, 'Event not found')
	return eventId
}

function readDateTime(value: FormDataEntryValue | null) {
	const date = new Date(String(value || ''))
	if (!Number.isFinite(date.getTime())) return null
	return date.toISOString()
}

async function loadManagedEvent(event: RequestEvent) {
	const userId = getCalendarUserId(event)
	const eventId = readEventId(event)
	if (!userId) throw redirect(303, `/login?redirect=${encodeURIComponent(`/organizer/events/${eventId}`)}`)

	const env = await buildEnv(event.platform)
	const access = await canManageCalendarEvent(env.DB, {
		eventId,
		userId,
		allowGlobalAdmin: false
	})
	if (!access.ok) {
		throw error(access.reason === 'not_found' ? 404 : 403, access.reason === 'not_found' ? 'Event not found' : 'Access denied')
	}

	const tenant = await getCalendarTenantById(env.DB, access.tenantId)
	if (!tenant) throw error(404, 'Organizer not found')
	const organizerEvent = await getCalendarTenantOrganizerEvent(env.DB, {
		tenantId: access.tenantId,
		eventId
	})
	if (!organizerEvent) throw error(404, 'Event not found')

	return {
		env,
		userId,
		tenant,
		event: organizerEvent
	}
}

export const load: PageServerLoad = async (event) => {
	const managed = await loadManagedEvent(event)
	return {
		tenant: managed.tenant,
		event: managed.event
	}
}

export const actions: Actions = {
	updateEvent: async (event) => {
		const { env, userId, event: organizerEvent } = await loadManagedEvent(event)
		const form = await event.request.formData()
		const title = String(form.get('title') || '').trim()
		const startsAt = readDateTime(form.get('startsAt'))
		const endsAt = readDateTime(form.get('endsAt'))
		const capacity = Number.parseInt(String(form.get('capacity') || ''), 10)

		if (!title || !startsAt || !endsAt || !Number.isFinite(capacity) || capacity < 1 || capacity > 250) {
			return fail(400, {
				intent: 'update',
				error: 'Enter a title, valid times, and a capacity from 1 to 250.'
			})
		}
		if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
			return fail(400, {
				intent: 'update',
				error: 'End time must be after start time.'
			})
		}

		const detailsChanged = await updateEventDetails(env.DB, {
			eventId: organizerEvent.id,
			title,
			startsAt,
			endsAt
		})
		const capacityChanged = await updateEventCapacity(env.DB, {
			eventId: organizerEvent.id,
			capacity
		})
		if (!detailsChanged && !capacityChanged) {
			return fail(404, {
				intent: 'update',
				error: 'Event not found.'
			})
		}
		await enqueueOrganizerEventSync(env, organizerEvent.id, 'organizer_event_update', userId)
		return { intent: 'update', success: true }
	},

	cancelEvent: async (event) => {
		const { env, userId, event: organizerEvent } = await loadManagedEvent(event)
		const changed = await cancelEvent(env.DB, { eventId: organizerEvent.id })
		if (!changed) {
			return fail(404, {
				intent: 'cancel',
				error: 'Event not found.'
			})
		}
		await enqueueOrganizerEventSync(env, organizerEvent.id, 'organizer_event_cancel', userId)
		return { intent: 'cancel', success: true }
	}
}
