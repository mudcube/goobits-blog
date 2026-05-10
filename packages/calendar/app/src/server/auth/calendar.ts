import { GoobitsAuth } from '@goobits/auth'
import { createCookieLoginContext, normalizeSafeRedirectPath } from '@goobits/auth/login-context'
import { GoogleProvider, AppleProvider } from '@goobits/auth/providers'
import type { OAuthProfile, OAuthTokens, RequestEventLike, User } from '@goobits/auth/types'
import { dev } from '$app/environment'
import { consumeInvite, hasUserRedeemedAnyInvite, replaceUserProgramAccess, validateInvite } from '@calendar/core/invites'
import { getCalendarConfig } from '@calendar/core/config'
import { createCalendarAuthAdapters, getDevDb, type D1DatabaseLike } from '@calendar/kit'
import { redirect } from '@sveltejs/kit'
import type { Cookies } from '@sveltejs/kit'

const INVITE_COOKIE = 'calendar_invite'
const REDIRECT_COOKIE = 'calendar_redirect'
const INVITE_TTL_SECONDS = 600
const calendarLoginContext = createCookieLoginContext({
	cookies: {
		invite: INVITE_COOKIE,
		redirectTo: REDIRECT_COOKIE
	},
	options: {
		maxAge: INVITE_TTL_SECONDS
	}
})

type PlatformEnv = {
	DB?: D1DatabaseLike
	NODE_ENV?: string
	PUBLIC_BASE_URL?: string
	BASE_URL?: string
	GOOGLE_CLIENT_ID?: string
	GOOGLE_CLIENT_SECRET?: string
	GOOGLE_REDIRECT_URI?: string
	GOOGLE_AUTH_REDIRECT_URI?: string
	APPLE_CLIENT_ID?: string
	APPLE_TEAM_ID?: string
	APPLE_KEY_ID?: string
	APPLE_PRIVATE_KEY?: string
	APPLE_REDIRECT_URI?: string
	APPLE_AUTH_REDIRECT_URI?: string
	[key: string]: string | D1DatabaseLike | undefined
}
type PlatformLike = { env?: PlatformEnv } | null | undefined

async function getDb(platform: PlatformLike) {
	if (dev) {
		return await getDevDb()
	}
	return platform?.env?.DB || null
}

function getBaseUrl({ env, url }: { env: Record<string, string | undefined>; url: URL }) {
	return env['PUBLIC_BASE_URL'] || env['BASE_URL'] || url?.origin || ''
}

function normalizeRedirectUri(value: string) {
	// OAuth providers require exact string matching; remove trailing slashes to avoid mismatch.
	return value.endsWith('/') ? value.slice(0, -1) : value
}

function emailMatchesDomain(email: string, domain: string) {
	if (!email || !domain) return false
	const normalizedDomain = domain.trim().toLowerCase().replace(/^@+/, '')
	if (!normalizedDomain) return false
	const atIndex = email.lastIndexOf('@')
	if (atIndex < 0 || atIndex === email.length - 1) return false
	return email.slice(atIndex + 1) === normalizedDomain
}

export function normalizeCalendarRedirect(redirectTo: unknown) {
	const config = getCalendarConfig()
	const allowedPrefixes = [config.routes.calendarBase, config.routes.adminBase]
	return normalizeSafeRedirectPath(redirectTo, { allowedPrefixes })
}

export function getCalendarLoginContext(cookies: Pick<Cookies, 'get'>) {
	const context = calendarLoginContext.get(cookies)
	return {
		invite: context.invite,
		redirectTo: normalizeCalendarRedirect(context.redirectTo)
	}
}

export function clearCalendarLoginContext(cookies: Pick<Cookies, 'delete'>) {
	calendarLoginContext.clear(cookies)
}

export async function getCalendarAuth({ event }: { event: { platform?: PlatformLike; url: URL } }) {
	const db = await getDb(event.platform)
	if (!db) throw new Error('Database unavailable')

	const env = {
		...Object.fromEntries(
			Object.entries(process.env).filter(([, value]) => typeof value === 'string')
		),
		...(event.platform?.env ?? {})
	} as Record<string, string | undefined>
	const baseUrl = getBaseUrl({ env, url: event.url })
	const secureCookies = env['NODE_ENV'] !== 'development'
	const config = getCalendarConfig()

	const { sessionAdapter, userAdapter, rateLimitStore } = createCalendarAuthAdapters(db, secureCookies)

	const providers: {
		google?: { provider: InstanceType<typeof GoogleProvider>; scopes: string[] }
		apple?: { provider: InstanceType<typeof AppleProvider> }
	} = {}
	if (env['GOOGLE_CLIENT_ID'] && env['GOOGLE_CLIENT_SECRET']) {
		const callbackUrl = normalizeRedirectUri(env['GOOGLE_AUTH_REDIRECT_URI'] || `${baseUrl}/auth/google/callback`)
		providers['google'] = {
			provider: new GoogleProvider({
				clientId: env['GOOGLE_CLIENT_ID'],
				clientSecret: env['GOOGLE_CLIENT_SECRET'],
				callbackUrl
			}),
			scopes: ['openid', 'profile', 'email']
		}
	}

	if (env['APPLE_CLIENT_ID'] && env['APPLE_TEAM_ID'] && env['APPLE_KEY_ID'] && env['APPLE_PRIVATE_KEY']) {
		const callbackUrl = normalizeRedirectUri(env['APPLE_AUTH_REDIRECT_URI'] || `${baseUrl}/auth/apple/callback`)
		providers['apple'] = {
			provider: new AppleProvider({
				clientId: env['APPLE_CLIENT_ID'],
				teamId: env['APPLE_TEAM_ID'],
				keyId: env['APPLE_KEY_ID'],
				privateKey: env['APPLE_PRIVATE_KEY'],
				callbackUrl
			})
		}
	}

	const auth = new GoobitsAuth({
		adapter: {
			session: sessionAdapter,
			user: userAdapter
		},
		cookies: {
			secure: secureCookies
		},
		providers,
		urls: {
			afterLogin: config.routes.calendarLoginRedirectPath,
			afterLogout: config.routes.calendarLoginPath
		},
			profile: 'secure',
			security: {
				rateLimit: {
					store: rateLimitStore,
					trustProxyHeader: true
				}
			},
			sessions: {},
		hooks: {
			onLoginMode: 'manual',
			onLogin: async (evt: RequestEventLike, profile: OAuthProfile, _tokens: OAuthTokens | null, user?: User | null) => {
				const { invite, redirectTo } = getCalendarLoginContext(evt.cookies)

				if (user) {
					const hasRedeemed = await hasUserRedeemedAnyInvite({ db, userId: user.id })
					const normalizedEmail = (profile.email || '').trim().toLowerCase()
					const inviteBypassDomain = config.brand.inviteBypassDomain.trim().toLowerCase()
					const canBypassInvite = emailMatchesDomain(normalizedEmail, inviteBypassDomain)
					if (!hasRedeemed) {
						if (!canBypassInvite) {
							if (!invite) {
								throw redirect(302, `${config.routes.calendarLoginPath}?error=invite_required`)
							}
							const result = await validateInvite({ db, code: invite, email: profile.email })
							if (!result.valid) {
								throw redirect(302, `${config.routes.calendarLoginPath}?error=invite_${result.reason}`)
							}
							if (!result.invite || typeof result.invite.id !== 'number') {
								throw redirect(302, `${config.routes.calendarLoginPath}?error=invite_invalid`)
							}

							const consumed = await consumeInvite({
								db,
								inviteId: result.invite.id,
								userId: user.id,
								usesRemaining: result.invite.uses_remaining
							})
							if (!consumed.ok) {
								throw redirect(302, `${config.routes.calendarLoginPath}?error=invite_${consumed.reason}`)
							}
							if (result.invite.target_activity_slug) {
								await replaceUserProgramAccess(db, String(user.id), [result.invite.target_activity_slug])
							}
						}
					}

					await db.prepare(
						`UPDATE calendar_users SET last_login_at = strftime('%s','now') WHERE id = ?`
					).bind(user.id).run()
				}

				if (!user) {
					throw redirect(302, `${config.routes.calendarLoginPath}?error=signin_failed`)
				}
				const session = await sessionAdapter.createSession(user.id)
				sessionAdapter.setSessionCookie(evt.cookies, session)
				clearCalendarLoginContext(evt.cookies)

				if (redirectTo) {
					calendarLoginContext.set(evt.cookies, { redirectTo }, { secure: secureCookies })
				}

				return { userId: user.id }
			},
			onError: async (_evt: RequestEventLike, error: unknown) => {
				const isRedirect = (
					typeof error === 'object' &&
					error !== null &&
					'status' in error &&
					'location' in error &&
					typeof (error as { status?: unknown }).status === 'number'
				)
				if (isRedirect) return
				console.error('[calendar auth] oauth callback error', error)
			}
		}
	})

	return { auth, db, env, secureCookies }
}

export function setCalendarLoginContext(
	cookies: Pick<Cookies, 'set'>,
	{ invite, redirectTo, secure }: { invite?: string; redirectTo?: string; secure: boolean }
) {
	const safeRedirect = normalizeCalendarRedirect(redirectTo)
	calendarLoginContext.set(cookies, { invite, redirectTo: safeRedirect }, { secure })
}

export function getCalendarRedirect(cookies: Pick<Cookies, 'get' | 'delete'>) {
	const context = calendarLoginContext.take(cookies, ['redirectTo'])
	return normalizeCalendarRedirect(context.redirectTo)
}
