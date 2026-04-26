import {
	consumeInvite,
	parseCalendarInviteClaimInput,
	TransportValidationError,
	validateInvite
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, buildEnv } from '@calendar/kit'
import type { RequestEvent } from '@sveltejs/kit'
import { enforceSameOrigin } from '@calendar/app/admin-api-helpers'
import { ensureCalendarUserByEmail, setCalendarSessionCookie } from '../../../../server/auth/calendar-session'

function createGuestEmail() {
	return `guest-${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}@guest.local`
}

async function rollbackInviteConsumption({
	db,
	inviteId,
	userId
}: {
	db: Awaited<ReturnType<typeof buildEnv>>['DB']
	inviteId: number
	userId: string
}) {
	await db.prepare(
		`DELETE FROM calendar_invite_redemptions
		 WHERE id = (
			 SELECT id
			 FROM calendar_invite_redemptions
			 WHERE invite_id = ? AND user_id = ?
			 ORDER BY redeemed_at DESC, id DESC
			 LIMIT 1
		 )`
	).bind(inviteId, userId).run()

	await db.prepare(
		`UPDATE calendar_invites
		 SET uses_remaining = uses_remaining + 1
		 WHERE id = ? AND uses_remaining IS NOT NULL`
	).bind(inviteId).run()
}

export async function POST(event: RequestEvent) {
	let createdUserId: string | null = null
	let consumedInviteId: number | null = null
	let consumedUserId: string | null = null
	try {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf

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
			return apiError('Could not claim this invite. Use Google or Apple sign-in instead.', {
				status: 409,
				code: 'invite_claim_unavailable'
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
				status: 409,
				code: `invite_${consumed.reason}`
			})
		}
		consumedInviteId = result.invite.id
		consumedUserId = String(user.userId)

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
		if (consumedInviteId !== null && consumedUserId) {
			try {
				const env = await buildEnv(event.platform)
				await rollbackInviteConsumption({
					db: env.DB,
					inviteId: consumedInviteId,
					userId: consumedUserId
				})
			} catch (rollbackError) {
				console.error('Calendar invite claim rollback failed:', rollbackError)
			}
		}
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
