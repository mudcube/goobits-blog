import {
	getAdminPaymentDefaults,
	getAdminViewSettings,
	getCalendarConfig,
	getCalendarPrograms,
	getDefaultAdminViewSettings,
	getPaymentCheckoutConfig,
	listEventsFeed,
	listInvites,
	listCalendarUsers,
	requireEnv,
	type AdminViewSettings
} from '@calendar/core'
import { buildEnv } from '@calendar/kit'
import { redirect } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'

export const prerender = false

function adminRootWithContext(url: URL) {
	const config = getCalendarConfig()
	const next = new URL(`${config.routes.adminBase}/`, url)
	if (url.searchParams.get('mock') === '1') {
		next.searchParams.set('mock', '1')
	}
	return `${next.pathname}${next.search}`
}

function readAdminUserId(user: unknown): number | null {
	if (!user || typeof user !== 'object') return null
	const raw = (user as { id?: unknown }).id
	if (typeof raw === 'number' && Number.isFinite(raw)) return raw
	if (typeof raw === 'string') {
		const parsed = Number.parseInt(raw, 10)
		if (Number.isFinite(parsed)) return parsed
	}
	return null
}

type BootstrapUser = {
	id: number | string
	email: string
	name: string | null
	avatar_url: string | null
	email_verified: number | boolean
	last_login_at: number | null
	provider: string | null
}

export async function load(event: RequestEvent) {
	const config = getCalendarConfig()
	const locals = event.locals as { user?: unknown; calendarAdmin?: boolean }
	const user = locals.calendarAdmin ? (locals.user ?? null) : null
	const isAdminRoot =
		event.url.pathname === config.routes.adminBase ||
		event.url.pathname === `${config.routes.adminBase}/`
	if (!user && !isAdminRoot) {
		throw redirect(302, adminRootWithContext(event.url))
	}

	let viewSettings: AdminViewSettings = getDefaultAdminViewSettings()
	let bootstrap: {
		programs: Awaited<ReturnType<typeof getCalendarPrograms>>
		upcoming: Awaited<ReturnType<typeof listEventsFeed>>['upcoming']
		recent: Awaited<ReturnType<typeof listEventsFeed>>['recent']
		paymentDefaults: Awaited<ReturnType<typeof getAdminPaymentDefaults>>
		paymentIntegrations: Awaited<ReturnType<typeof getPaymentCheckoutConfig>>
		invites: Awaited<ReturnType<typeof listInvites>>
		users: BootstrapUser[]
	} | null = null

	const userId = readAdminUserId(user)
	if (userId != null) {
		try {
			const env = await buildEnv(event.platform)
			const db = env.DB
			const base64Key = requireEnv(env, 'TOKEN_ENC_KEY')

			const [
				viewResult,
				programs,
				feed,
				paymentDefaults,
				paymentIntegrations,
				invites,
				usersRaw
			] = await Promise.all([
				getAdminViewSettings(db, userId),
				getCalendarPrograms(db),
				listEventsFeed(db, '__admin__', false),
				getAdminPaymentDefaults(db),
				getPaymentCheckoutConfig({ db, env, base64Key }),
				listInvites({ db }),
				listCalendarUsers({ db })
			])

			viewSettings = viewResult
			bootstrap = {
				programs,
				upcoming: feed.upcoming,
				recent: feed.recent,
				paymentDefaults,
				paymentIntegrations,
				invites,
				users: (usersRaw as Array<Record<string, unknown>>).map((u) => ({
					id: u['id'] as number | string,
					email: String(u['email'] ?? ''),
					name: (u['name'] as string | null) ?? null,
					avatar_url: (u['avatar_url'] as string | null) ?? null,
					email_verified: (u['email_verified'] as number | boolean) ?? 0,
					last_login_at: (u['last_login_at'] as number | null) ?? null,
					provider: (u['provider'] as string | null) ?? null
				}))
			}
		} catch (error) {
			console.warn('[admin-layout] failed to bootstrap admin data:', error)
		}
	}

	return { user, viewSettings, bootstrap }
}
