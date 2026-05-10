import { json, type RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { parseCalendarSessionBootstrapInput, TransportValidationError } from '@calendar/core/transport'
import { apiError, apiValidationError } from '@calendar/kit'
import { ensureCalendarUserByEmail, setCalendarSessionCookie } from '../../../../server/auth/calendar-session'

export async function POST(event: RequestEvent) {
	try {
		const env = await buildEnv(event.platform)
		if (env['NODE_ENV'] !== 'development') return apiError('Unauthorized', { status: 401 })
		if (env['E2E_RUN'] !== '1') return apiError('Unauthorized', { status: 401 })

		const expected = String(env['E2E_TEST_TOKEN'] || env['ADMIN_PASSCODE'] || '')
		if (!expected) return apiError('Unauthorized', { status: 401 })
		const authHeader = event.request.headers.get('authorization') || ''
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : ''
		if (!token || token !== expected) return apiError('Unauthorized', { status: 401 })

		const { email, name } = parseCalendarSessionBootstrapInput(await event.request.json().catch(() => null))
		const user = await ensureCalendarUserByEmail({
			db: env.DB,
			email,
			name,
			emailVerified: true
		})
		if (!user.ok) return apiError('Unauthorized', { status: 401 })

		const secureCookies = env['NODE_ENV'] !== 'development'
		await setCalendarSessionCookie({
			db: env.DB,
			cookies: event.cookies,
			secureCookies,
			userId: String(user.userId)
		})

		return json({ ok: true, email, userId: String(user.userId) })
	} catch (error) {
		if (error instanceof TransportValidationError) {
			return apiValidationError(error)
		}
		console.error('E2E calendar session bootstrap failed:', error)
		return apiError('Internal server error')
	}
}
