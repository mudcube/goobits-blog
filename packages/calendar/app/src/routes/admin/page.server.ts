import { buildEnv, createCalendarSessionAdapter } from '@calendar/kit'
import { createLogoutHandler } from '@goobits/auth/handlers'
import { hashAdminApiKey, timingSafeEqual } from '@goobits/auth/security'
import { canBootstrapCalendarAdmin, grantCalendarAdmin } from '@calendar/core/admin'
import { checkRateLimit } from '@calendar/core/storage'
import { getCalendarConfig } from '@calendar/core/config'
import { enforceSameOrigin, logAdminEvent } from '@calendar/app/admin-api-helpers'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, RequestEvent } from '@sveltejs/kit'

type RateLimitDb = Parameters<typeof checkRateLimit>[0]['db']

function withMockContext(path: string, url: URL) {
	if (url.searchParams.get('mock') !== '1') return path
	return `${path}${path.includes('?') ? '&' : '?'}mock=1`
}

async function checkAdminLoginLimit(db: RateLimitDb, key: string) {
	try {
		return await checkRateLimit({
			db,
			key: `rate:admin_login:${key}`,
			limit: 10,
			windowSeconds: 60
		})
	} catch {
		return { allowed: false }
	}
}

async function passcodeMatches(input: string, expected: string) {
	if (!input || !expected) return false
	const [inputHash, expectedHash] = await Promise.all([
		hashAdminApiKey(input),
		hashAdminApiKey(expected)
	])
	return timingSafeEqual(inputHash, expectedHash)
}

function adminBootstrapEmail(env: Record<string, unknown>) {
	const configured = env['ADMIN_BOOTSTRAP_EMAIL']
	if (typeof configured === 'string' && configured.trim()) {
		return configured.trim()
	}
	return getCalendarConfig().brand.adminEmail
}

export const load = async (event: RequestEvent) => {
	const locals = event.locals as { user?: Record<string, unknown>; calendarAdmin?: boolean }
	const config = getCalendarConfig()
	const env = await buildEnv(event.platform)
	const currentEmail = typeof locals.user?.['email'] === 'string' ? locals.user['email'] : null
	const canBootstrapAdmin = locals.user
		? await canBootstrapCalendarAdmin({
			db: env.DB,
			userEmail: currentEmail,
			bootstrapEmail: adminBootstrapEmail(env)
		})
		: false
	const adminPath = `${config.routes.adminBase}/`
	return {
		user: locals.calendarAdmin ? (locals.user ?? null) : null,
		currentUser: locals.user ?? null,
		isAdmin: locals.calendarAdmin === true,
		canBootstrapAdmin,
		loginUrl: `${config.routes.calendarLoginPath}?redirect=${encodeURIComponent(adminPath)}`,
		initialTab: 'dashboard'
	}
}

export const actions: Actions = {
	grantAdmin: async (event) => {
		const locals = event.locals as { user?: { id?: string | number; email?: string } | null }
		const sameOrigin = enforceSameOrigin(event)
		if (sameOrigin) {
			return fail(403, {
				error: 'Forbidden.',
				success: false
			})
		}
		if (!locals.user?.id) {
			const config = getCalendarConfig()
			throw redirect(302, `${config.routes.calendarLoginPath}?redirect=${encodeURIComponent(`${config.routes.adminBase}/`)}`)
		}

		const env = await buildEnv(event.platform)
		const canBootstrap = await canBootstrapCalendarAdmin({
			db: env.DB,
			userEmail: locals.user.email,
			bootstrapEmail: adminBootstrapEmail(env)
		})
		if (!canBootstrap) {
			logAdminEvent(event, 'admin_grant_denied', { userId: locals.user.id, email: locals.user.email })
			return fail(403, {
				error: 'This account cannot bootstrap admin access.',
				success: false
			})
		}

		const rateLimitKey = event.getClientAddress?.() ?? 'unknown'
		const preflightLimit = await checkAdminLoginLimit(env.DB, rateLimitKey)
		if (!preflightLimit.allowed) {
			return fail(429, {
				error: 'Too many attempts. Try again later.',
				success: false
			})
		}

		const formData = await event.request.formData()
		const passcode = String(formData.get('password') || '')
		const expected = typeof env['ADMIN_PASSCODE'] === 'string' ? env['ADMIN_PASSCODE'] : ''
		if (!(await passcodeMatches(passcode, expected))) {
			return fail(400, {
				error: 'Passcode did not match.',
				success: false
			})
		}

		await grantCalendarAdmin({
			db: env.DB,
			userId: locals.user.id,
			grantedBy: locals.user.id
		})
		logAdminEvent(event, 'admin_granted', { userId: locals.user.id, email: locals.user.email })
		throw redirect(303, withMockContext(`${getCalendarConfig().routes.adminBase}/`, event.url))
	},

	logout: async (event) => {
		const env = await buildEnv(event.platform)
		const secureCookies = event.url.protocol === 'https:'
		const sessionAdapter = createCalendarSessionAdapter(env.DB, secureCookies)
		return createLogoutHandler({
			sessionAdapter,
			redirectAfterLogout: withMockContext(`${getCalendarConfig().routes.adminBase}/`, event.url)
		})(event)
	}
}
