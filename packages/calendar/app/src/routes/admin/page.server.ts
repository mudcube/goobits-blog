import { getAdminAuth, ensureAdminAccount } from '@calendar/kit'
import { createSigninHandler, createLogoutHandler } from '@goobits/auth/handlers'
import { checkRateLimit, getCalendarConfig } from '@calendar/core'
import { logAdminEvent } from '@calendar/app/admin-api-helpers'
import { redirect } from '@sveltejs/kit'
import type { Actions, RequestEvent } from '@sveltejs/kit'
import type { User } from '@goobits/auth/types'

function isAuthUser(value: unknown): value is User {
	if (!value || typeof value !== 'object') return false
	const record = value as Record<string, unknown>
	return (typeof record['id'] === 'string' || typeof record['id'] === 'number')
		&& typeof record['email'] === 'string'
}

export const load = async (event: RequestEvent) => {
	const locals = event.locals as { user?: Record<string, unknown> }
	return { user: locals.user ?? null, initialTab: 'dashboard' }
}

export const actions: Actions = {
		login: async (event) => {
			const { credentialsProvider, userAdapter, sessionAdapter, env, db } = await getAdminAuth({ event })
			await ensureAdminAccount({ userAdapter, env })
			type CredentialsInput = Parameters<typeof credentialsProvider.authenticate>[0]

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
				redirectTo: getCalendarConfig().routes.adminBase,
				rateLimit: {
					check: async (key: string) => {
						try {
							return await checkRateLimit({ db, key: `rate:admin_login:${key}`, limit: 10, windowSeconds: 60 })
						} catch {
							return { allowed: true }
						}
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
				console.error('[admin] login handler threw', err)
				throw err
			}
		},

	logout: async (event) => {
		const { sessionAdapter } = await getAdminAuth({ event })
		return createLogoutHandler({ sessionAdapter, redirectAfterLogout: getCalendarConfig().routes.adminBase })(event)
	}
}
