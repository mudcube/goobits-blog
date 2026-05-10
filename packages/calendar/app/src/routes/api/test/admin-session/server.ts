import { json, type RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getCalendarConfig } from '@calendar/core/config'
import { grantCalendarAdmin } from '@calendar/core/admin'
import { apiError } from '@calendar/kit'
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

		const adminEmail = getCalendarConfig().brand.adminEmail
		const user = await ensureCalendarUserByEmail({
			db: env.DB,
			email: adminEmail,
			name: 'Admin',
			emailVerified: true
		})
		if (!user.ok) return apiError('Unauthorized', { status: 401 })

		await grantCalendarAdmin({
			db: env.DB,
			userId: String(user.userId),
			grantedBy: String(user.userId)
		})

		const secureCookies = env['NODE_ENV'] !== 'development'
		await setCalendarSessionCookie({
			db: env.DB,
			cookies: event.cookies,
			secureCookies,
			userId: String(user.userId)
		})

		return json({ ok: true, userId: String(user.userId), email: adminEmail })
	} catch (error) {
		console.error('E2E admin session bootstrap failed:', error)
		return apiError('Internal server error')
	}
}
