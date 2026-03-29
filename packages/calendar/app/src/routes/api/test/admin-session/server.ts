import { json, type RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { createAdminAdapters, ensureAdminUser } from '@calendar/core'
import { apiError } from '@calendar/kit'

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

		const secureCookies = env['NODE_ENV'] !== 'development'
		const { userAdapter, sessionAdapter } = createAdminAdapters({
			db: env.DB,
			secureCookies,
			sessionLifetimeMs: 60 * 24 * 60 * 60 * 1000
		})

		const user = await ensureAdminUser({
			userAdapter,
			passcode: String(env['ADMIN_PASSCODE'] || '')
		})

		const session = await sessionAdapter.createSession(String(user.id))
		sessionAdapter.setSessionCookie(event.cookies, session)

		return json({ ok: true, userId: String(user.id), email: user.email })
	} catch (error) {
		console.error('E2E admin session bootstrap failed:', error)
		return apiError('Internal server error')
	}
}
