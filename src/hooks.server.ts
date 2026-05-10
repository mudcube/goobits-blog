import { error, redirect } from '@sveltejs/kit'
import { redirects } from '@src/redirects.ts'
import { sequence } from '@sveltejs/kit/hooks'
import { createCalendarAuthHandles } from '@calendar/app'
import { getCalendarConfig } from '@calendar/core/config'
import { applyMikoCalendarPreset } from '$lib/calendar/miko-preset'
import { configureAdminMockCatalog } from '@calendar/ui/admin/mock/catalog'
import { getActiveReleaseStage, isRouteReleased } from '$lib/app/release'
import { isLocalPreviewHost as isAllowedLocalPreviewHost } from '$lib/app/is-local-preview-host'
import { ensureJournalBlogConfig } from '$lib/blog/config'
import { dev } from '$app/environment'
import type { Handle } from '@sveltejs/kit'
import {
	mockCrewInvites,
	mockCrewUsers,
	mockDashboardEvents,
	mockDashboardRecentEvents,
	mockPaymentDefaults,
	mockPrograms
} from '$lib/app/schedule/admin/mock-data'
applyMikoCalendarPreset()
configureAdminMockCatalog({
	dashboardEvents: mockDashboardEvents,
	dashboardRecentEvents: mockDashboardRecentEvents,
	programs: mockPrograms,
	crewUsers: mockCrewUsers,
	crewInvites: mockCrewInvites,
	paymentDefaults: mockPaymentDefaults
})
ensureJournalBlogConfig()
const calendarConfig = getCalendarConfig()
const forcedThemePreferences = {
	theme: 'dark',
	themeScheme: 'default'
} as const

/**
 * Processes redirects based on configured rules
 * @param {Object} options - Handler options
 * @param {Object} options.event - SvelteKit event object
 * @param {Function} options.resolve - SvelteKit resolve function
 * @returns {Promise<Response>} Passed to next handler if no redirect matches
 * @throws {Redirect} Redirects to target URL if a match is found
 */
async function handleRedirects({ event, resolve }: Parameters<Handle>[0]) {
	const pathname = event.url.pathname.toLowerCase()

	// Legacy labs are static folders with index.html files.
	// Serve /labs/<slug> and /labs/<slug>/ directly without browser redirect.
	const labParts = pathname.split('/').filter(Boolean)
	const labSlug = labParts[1]
	if (labParts.length === 2 && labParts[0] === 'labs' && labSlug && !labSlug.endsWith('.html')) {
		const rewritten = new URL(event.url)
		rewritten.pathname = `/labs/${labSlug}/index.html`
		return event.fetch(rewritten.toString(), {
			method: event.request.method
		})
	}

	const matchingRedirect = redirects.find(redirect => {
		if (redirect.from.includes('(.*)')) {
			const pattern = new RegExp(redirect.from)
			return pattern.test(pathname)
		}
		if (redirect.from.endsWith('*')) {
			return pathname.startsWith(redirect.from.slice(0, -1))
		}
		return redirect.from === pathname
	})

	if (!matchingRedirect) {
		return resolve(event)
	}

	let redirectTo = matchingRedirect.to

	// Handle regex capture group replacements
	if (matchingRedirect.from.includes('(.*)')) {
		const pattern = new RegExp(matchingRedirect.from)
		redirectTo = pathname.replace(pattern, matchingRedirect.to)
	}

	redirect(matchingRedirect.status, redirectTo)
}

const themeHandle: Handle = async ({ event, resolve }) => {
	const locals = event.locals as Record<string, unknown>
	locals['themePreferences'] = forcedThemePreferences

	return resolve(event, {
		transformPageChunk: ({ html }) => {
			const withThemeClass = html.replace('%sveltekit.theme%', 'theme-dark scheme-default')
			return withThemeClass.replace(
				/<html([\s\S]*?)>/i,
				'<html$1 data-theme="dark">'
			)
		}
	})
}

const releaseVisibilityHandle: Handle = async ({ event, resolve }) => {
	const isLocalPreviewHost = dev && isAllowedLocalPreviewHost(event.url.hostname)
	const activeStage = getActiveReleaseStage({
		cookies: event.cookies,
		enablePreview: isLocalPreviewHost
	})

	if (!isRouteReleased(event.url.pathname, activeStage)) {
		throw error(404, 'Not found')
	}

	return resolve(event)
}

const { handleAdminAuth, handleCalendarAuth, requireCalendarUser } = createCalendarAuthHandles({
	adminBase: calendarConfig.routes.adminBase,
	apiAdminBase: calendarConfig.routes.apiAdminBase,
	apiCalendarAdminBase: calendarConfig.routes.apiCalendarAdminBase,
	calendarBase: calendarConfig.routes.calendarBase,
	apiCalendarBase: calendarConfig.routes.apiCalendarBase,
	authBase: calendarConfig.routes.authBase,
	calendarLoginPath: calendarConfig.routes.calendarLoginPath,
	calendarLoginRedirectPath: calendarConfig.routes.calendarLoginRedirectPath
})

function setIfMissing(headers: Headers, key: string, value: string) {
	if (!headers.has(key)) headers.set(key, value)
}

const securityHeadersHandle: Handle = async ({ event, resolve }) => {
	// Generate a unique nonce per request for CSP script-src
	const nonce = crypto.randomUUID()
	event.locals.cspNonce = nonce

	let response: Response
	try {
		response = await resolve(event, {
			transformPageChunk: ({ html }) => {
				// Add nonce attribute to all <script> tags in the rendered HTML
				return html.replace(/<script(?=[\s>])/g, `<script nonce="${nonce}"`)
			}
		})
	} catch (caught) {
		if (caught && typeof caught === 'object' && 'status' in caught && 'location' in caught) {
			const status = Number((caught as { status?: unknown }).status)
			const location = (caught as { location?: unknown }).location
			if (Number.isFinite(status) && typeof location === 'string') {
				response = new Response(null, { status, headers: { location } })
			} else {
				throw caught
			}
		} else {
			throw caught
		}
	}

	const url = event.url
	const isHttps = url?.protocol === 'https:'
	const noindexPrefixes = [
		'/api',
		'/auth',
		'/contact/thank-you',
		'/playground',
		'/health',
		'/register',
		'/schedule',
		'/verify-email'
	]
	const shouldNoindex = noindexPrefixes.some(prefix => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))

	const csp = [
		"default-src 'self'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
			"img-src 'self' data: blob: https://miko.art https://www.miko.art https://media.miko.art https://cdn.jsdelivr.net https://challenges.cloudflare.com https://*.googleusercontent.com",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
			`script-src 'self' https://challenges.cloudflare.com https://www.paypal.com https://www.paypalobjects.com https://web.squarecdn.com https://sandbox.web.squarecdn.com 'nonce-${nonce}'${dev ? " 'unsafe-eval'" : ''}`,
			"frame-src 'self' https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com",
			"connect-src 'self' https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://connect.squareup.com https://connect.squareupsandbox.com https://web.squarecdn.com https://sandbox.web.squarecdn.com",
			"font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com"
	].join('; ')

	const applySecurityHeaders = (target: Response) => {
		setIfMissing(target.headers, 'Content-Security-Policy', csp)
		setIfMissing(target.headers, 'Referrer-Policy', 'strict-origin-when-cross-origin')
		setIfMissing(target.headers, 'X-Content-Type-Options', 'nosniff')
		setIfMissing(target.headers, 'X-Frame-Options', 'DENY')
		setIfMissing(target.headers, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
		if (shouldNoindex) {
			setIfMissing(target.headers, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
		}
		if (isHttps) {
			setIfMissing(target.headers, 'Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
		}
	}

	try {
		applySecurityHeaders(response)
	} catch (error) {
		// Redirect responses can expose immutable headers in some runtimes.
		// Clone into a mutable response so global headers can still be applied.
		if (!(error instanceof TypeError) || !String(error.message).includes('immutable')) {
			throw error
		}
		response = new Response(response.body, response)
		applySecurityHeaders(response)
	}

	return response
}

export const handle = sequence(
	securityHeadersHandle,
	themeHandle,
	handleRedirects,
	releaseVisibilityHandle,
	handleAdminAuth,
	handleCalendarAuth,
	requireCalendarUser
)
