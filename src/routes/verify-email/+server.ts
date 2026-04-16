import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { resolveRuntimeDb } from '$lib/server/calendar/runtime'
import { consumeEmailVerificationToken } from '$lib/server/calendar/email/verification'
import { getCalendarConfig } from '@calendar/core'

export const GET: RequestHandler = async ({ url, platform }) => {
	const calendarLoginPath = getCalendarConfig().routes.calendarLoginPath
	const db = await resolveRuntimeDb(platform?.env)
	if (!db) throw redirect(303, `${calendarLoginPath}?verified=unavailable`)

	const token = (url.searchParams.get('token') || '').trim()
	if (!token) {
		throw redirect(303, `${calendarLoginPath}?verified=invalid`)
	}

	const result = await consumeEmailVerificationToken({ db, token })
	if (!result.ok) {
		throw redirect(303, `${calendarLoginPath}?verified=${result.reason}`)
	}

	throw redirect(303, `${calendarLoginPath}?verified=1`)
}
