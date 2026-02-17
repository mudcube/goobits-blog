import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { resolveRuntimeDb } from '$lib/server/runtime'
import { consumeEmailVerificationToken } from '$lib/server/email/verification'

export const GET: RequestHandler = async ({ url, platform }) => {
	const db = await resolveRuntimeDb(platform?.env)
	if (!db) redirect(303, '/calendar/login?verified=unavailable')

	const token = (url.searchParams.get('token') || '').trim()
	const email = (url.searchParams.get('email') || '').trim().toLowerCase()
	if (!token || !email) {
		redirect(303, '/calendar/login?verified=invalid')
	}

	const result = await consumeEmailVerificationToken({ db, token, email })
	if (!result.ok) {
		redirect(303, `/calendar/login?verified=${result.reason}`)
	}

	redirect(303, '/calendar/login?verified=1')
}
