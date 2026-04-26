import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getCalendarProfile, parseCalendarProfileInput, saveCalendarProfile, TransportValidationError } from '@calendar/core'
import { apiOk, apiValidationError, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'
import { enforceSameOrigin } from '@calendar/app/admin-api-helpers'

export async function GET(event: RequestEvent) {
	return runCalendarRequest('calendar.profile.get', async () => {
		const user = requireCalendarUserId(event)
		if (user.response) return user.response
		const userId = user.userId
		const env = await buildEnv(event.platform)
		const profile = await getCalendarProfile(env.DB, userId)
		return apiOk({ profile })
	})
}

export async function POST(event: RequestEvent) {
	return runCalendarRequest('calendar.profile.save', async () => {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf
		const user = requireCalendarUserId(event)
		if (user.response) return user.response
		const userId = user.userId
		const input = parseCalendarProfileInput(await event.request.json().catch(() => null))

		const env = await buildEnv(event.platform)
		await saveCalendarProfile(env.DB, userId, {
			emergencyContact: input.emergencyContact,
			dietaryRestrictions: input.dietaryRestrictions,
			chatHandle: input.chatHandle
		})
		return apiOk({})
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
