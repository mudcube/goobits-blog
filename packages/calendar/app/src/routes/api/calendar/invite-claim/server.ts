import { consumeInvite, replaceUserProgramAccess, validateInvite } from '@calendar/core/invites'
import { checkRateLimit } from '@calendar/core/storage'
import { acceptCalendarTenantInvite, validateCalendarTenantInvite } from '@calendar/core/tenants'
import { parseCalendarInviteClaimInput, TransportValidationError } from '@calendar/core/transport'
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

async function enforceInviteClaimRateLimit(event: RequestEvent, db: Awaited<ReturnType<typeof buildEnv>>['DB'], code: string, email: string | null) {
	const ip =
		event.getClientAddress?.() ||
		event.request.headers.get('cf-connecting-ip') ||
		event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		'unknown'
	const checks = [
		{ key: `rate:invite_claim:ip:${ip}`, limit: 20, windowSeconds: 60 },
		{ key: `rate:invite_claim:code:${code.toLowerCase()}`, limit: 8, windowSeconds: 60 },
		...(email ? [{ key: `rate:invite_claim:email:${email.toLowerCase()}`, limit: 10, windowSeconds: 60 }] : [])
	]
	for (const check of checks) {
		const result = await checkRateLimit({ db, ...check })
		if (!result.allowed) return apiError('Too many attempts. Try again later.', { status: 429, code: 'rate_limited' })
	}
	return null
}

function inviteValidationStatus(reason: string | undefined) {
	return reason === 'not_found' ? 404 : 403
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
		const rateLimited = await enforceInviteClaimRateLimit(event, env.DB, code, email)
		if (rateLimited) return rateLimited

		const result = await validateInvite({ db: env.DB, code, email })
		if (!result.valid || !result.invite || typeof result.invite.id !== 'number') {
			const tenantResult = await validateCalendarTenantInvite(env.DB, { code, email })
			if (!tenantResult.valid) {
				const reason = result.reason === 'not_found' ? tenantResult.reason : (result.reason ?? 'invalid')
				return apiError(`Invite ${reason}`, { status: inviteValidationStatus(reason), code: `invite_${reason}` })
			}
			if (!tenantResult.invite.tenantId) {
				const reason = 'not_found'
				return apiError(`Invite ${reason}`, { status: inviteValidationStatus(reason), code: `invite_${reason}` })
			}

			if (!email) {
				return apiError('This invite requires the matching email address.', {
					status: 400,
					code: 'invite_email_required'
				})
			}

			const user = await ensureCalendarUserByEmail({
				db: env.DB,
				email: email.toLowerCase(),
				name,
				emailVerified: tenantResult.invite.email.toLowerCase() === email.toLowerCase(),
				rejectIfExists: false
			})
			if (!user.ok) {
				return apiError('Could not claim this invite. Use Google or Apple sign-in instead.', {
					status: 409,
					code: 'invite_claim_unavailable'
				})
			}
			if (user.created) createdUserId = String(user.userId)
			const accepted = await acceptCalendarTenantInvite(env.DB, {
				code,
				userId: String(user.userId),
				email
			})
			if (!accepted.ok) {
				if (createdUserId) {
					await env.DB.prepare(`DELETE FROM calendar_users WHERE id = ?`).bind(createdUserId).run()
					createdUserId = null
				}
				return apiError('This invite can no longer be claimed.', {
					status: accepted.reason === 'accepted' ? 409 : inviteValidationStatus(accepted.reason),
					code: `invite_${accepted.reason === 'accepted' ? 'exhausted' : accepted.reason}`
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
				email: email.toLowerCase()
			})
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
		if (result.invite.target_activity_slug) {
			await replaceUserProgramAccess(env.DB, String(user.userId), [result.invite.target_activity_slug])
		}
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
