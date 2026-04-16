import { D1SessionAdapter } from '@goobits/auth/adapters'
import {
	consumeInvite,
	parseCalendarInviteClaimInput,
	TransportValidationError,
	validateInvite
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, buildEnv } from '@calendar/kit'
import type { RequestEvent } from '@sveltejs/kit'

type CalendarUserRow = { id: string | number }

function createGuestEmail() {
	return `guest-${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}@guest.local`
}

export async function POST(event: RequestEvent) {
	try {
		const env = await buildEnv(event.platform)
		const secureCookies = env['NODE_ENV'] !== 'development'
		const { code, name, email } = parseCalendarInviteClaimInput(
			await event.request.json().catch(() => null)
		)

		const result = await validateInvite({ db: env.DB, code, email })
		if (!result.valid || !result.invite || typeof result.invite.id !== 'number') {
			const reason = result.reason ?? 'invalid'
			const status = reason === 'not_found' ? 404 : 403
			return apiError(`Invite ${reason}`, { status, code: `invite_${reason}` })
		}

		if (result.invite.email && !email) {
			return apiError('This invite requires the matching email address.', {
				status: 400,
				code: 'invite_email_required'
			})
		}

		const effectiveEmail = (email || result.invite.email || createGuestEmail()).toLowerCase()
		const existing = await env.DB.prepare(
			`SELECT id FROM calendar_users WHERE lower(email) = lower(?) LIMIT 1`
		).bind(effectiveEmail).first<CalendarUserRow>()

		if (existing) {
			return apiError('An account already exists for that email. Use Google or Apple sign-in instead.', {
				status: 409,
				code: 'account_exists'
			})
		}

		let userId: string | number | undefined
		if (!userId) {
			const inserted = await env.DB.prepare(
				`INSERT INTO calendar_users (email, name, email_verified, created_at, last_login_at)
				 VALUES (?, ?, ?, unixepoch(), unixepoch())`
			).bind(effectiveEmail, name, result.invite.email || email ? 1 : 0).run()
			userId = inserted.meta.last_row_id
		}

		await consumeInvite({ db: env.DB, inviteId: result.invite.id, userId: String(userId) })

		const sessionAdapter = new D1SessionAdapter(env.DB, {
			sessionsTable: 'calendar_sessions',
			usersTable: 'calendar_users',
			cookieName: 'calendar_session',
			secureCookies,
			sessionLifetime: 7 * 24 * 60 * 60 * 1000,
			userColumns: {
				id: 'id',
				email: 'email',
				name: 'name',
				avatar: 'avatar_url',
				password: 'password',
				emailVerified: 'email_verified'
			}
		})

		const session = await sessionAdapter.createSession(String(userId))
		sessionAdapter.setSessionCookie(event.cookies, session)

		return apiOk({
			ok: true,
			userId: String(userId),
			email: effectiveEmail
		})
	} catch (error) {
		if (error instanceof TransportValidationError) {
			return apiValidationError(error)
		}
		console.error('Calendar invite claim failed:', error)
		return apiError('Internal server error')
	}
}
