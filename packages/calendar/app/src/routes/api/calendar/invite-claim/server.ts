import {
	consumeInvite,
	parseCalendarInviteClaimInput,
	TransportValidationError,
	validateInvite
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, buildEnv } from '@calendar/kit'
import type { RequestEvent } from '@sveltejs/kit'
import { ensureCalendarUserByEmail, setCalendarSessionCookie } from '../../../../server/auth/calendar-session'

function createGuestEmail() {
	return `guest-${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}@guest.local`
}

export async function POST(event: RequestEvent) {
	let createdUserId: string | null = null
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
		const user = await ensureCalendarUserByEmail({
			db: env.DB,
			email: effectiveEmail,
			name,
			emailVerified: !!(result.invite.email && effectiveEmail === result.invite.email.toLowerCase()),
			rejectIfExists: true
		})

		if (!user.ok) {
			return apiError('An account already exists for that email. Use Google or Apple sign-in instead.', {
				status: 409,
				code: 'account_exists'
			})
		}
		if (user.created) createdUserId = String(user.userId)
		const consumed = await consumeInvite({
			db: env.DB,
			inviteId: result.invite.id,
			userId: String(user.userId),
			usesRemaining: result.invite.uses_remaining
		})
		if (!consumed.ok) {
			if (createdUserId) {
				await env.DB.prepare(`DELETE FROM calendar_users WHERE id = ?`).bind(createdUserId).run()
				createdUserId = null
			}
			return apiError('This invite can no longer be claimed.', {
				status: consumed.reason === 'expired' ? 409 : 409,
				code: `invite_${consumed.reason}`
			})
		}

		await setCalendarSessionCookie({
			db: env.DB,
			cookies: event.cookies,
			secureCookies,
			userId: String(user.userId)
		})

		return apiOk({
			ok: true,
			userId: String(user.userId),
			email: effectiveEmail
		})
	} catch (error) {
		if (createdUserId) {
			try {
				const env = await buildEnv(event.platform)
				await env.DB.prepare(`DELETE FROM calendar_users WHERE id = ?`).bind(createdUserId).run()
			} catch (cleanupError) {
				console.error('Calendar invite claim cleanup failed:', cleanupError)
			}
		}
		if (error instanceof TransportValidationError) {
			return apiValidationError(error)
		}
		console.error('Calendar invite claim failed:', error)
		return apiError('Internal server error')
	}
}
