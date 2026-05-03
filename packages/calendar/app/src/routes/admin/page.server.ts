import { getAdminAuth, ensureAdminAccount } from '@calendar/kit'
import { createSigninHandler, createLogoutHandler } from '@goobits/auth/handlers'
import { checkRateLimit, getCalendarConfig } from '@calendar/core'
import { logAdminEvent } from '@calendar/app/admin-api-helpers'
import { redirect } from '@sveltejs/kit'
import type { Actions, RequestEvent } from '@sveltejs/kit'
import type { User } from '@goobits/auth/types'

type RateLimitDb = Parameters<typeof checkRateLimit>[0]['db']

function isAuthUser(value: unknown): value is User {
	if (!value || typeof value !== 'object') return false
	const record = value as Record<string, unknown>
	return (typeof record['id'] === 'string' || typeof record['id'] === 'number') && typeof record['email'] === 'string'
}

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

export const load = async (event: RequestEvent) => {
	const locals = event.locals as { user?: Record<string, unknown> }
	return { user: locals.user ?? null, initialTab: 'dashboard' }
}

export const actions: Actions = {
	login: async (event) => {
		const { credentialsProvider, userAdapter, sessionAdapter, env, db } = await getAdminAuth({ event })
		const rateLimitKey = event.getClientAddress?.() ?? 'unknown'
		const preflightLimit = await checkAdminLoginLimit(db, rateLimitKey)
		if (!preflightLimit.allowed) {
			return {
				error: 'Too many attempts. Try again later.',
				success: false
			}
		}
		await ensureAdminAccount({ userAdapter, env })
		type CredentialsInput = Parameters<typeof credentialsProvider.authenticate>[0]
		let usedPreflightLimit = false

		const handler = createSigninHandler({
			credentialsProvider: {
				authenticate: async (input) => {
					const result = await credentialsProvider.authenticate({
						...(input as Omit<CredentialsInput, 'userAdapter'>),
						userAdapter: input.userAdapter as CredentialsInput['userAdapter']
					})
					return {
						user: isAuthUser(result.user) ? result.user : null,
						valid: result.valid
					}
				}
			},
			userAdapter,
			sessionAdapter,
			redirectTo: withMockContext(`${getCalendarConfig().routes.adminBase}/`, event.url),
			rateLimit: {
				check: async (key: string) => {
					if (!usedPreflightLimit && key === rateLimitKey) {
						usedPreflightLimit = true
						return preflightLimit
					}
					return checkAdminLoginLimit(db, key)
				}
			},
			onSignin: () => {
				logAdminEvent(event, 'login_success')
			}
		})

		try {
			return await handler(event)
		} catch (err) {
			// Some handler helpers throw SvelteKit control-flow objects. Normalize redirects so SvelteKit
			// always recognizes them, even if they originate from a different module graph instance.
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				const status = Number((err as { status?: unknown }).status)
				const location = (err as { location?: unknown }).location
				if (Number.isFinite(status) && typeof location === 'string') {
					throw redirect(status, location)
				}
			}
			console.error('[admin] login handler threw', err instanceof Error ? err.message : String(err))
			throw err
		}
	},

	logout: async (event) => {
		const { sessionAdapter } = await getAdminAuth({ event })
		return createLogoutHandler({
			sessionAdapter,
			redirectAfterLogout: withMockContext(`${getCalendarConfig().routes.adminBase}/`, event.url)
		})(event)
	}
}
