import { sequence } from '@sveltejs/kit/hooks'
import { createCalendarAuthHandles } from '@calendar/app'
import { getCalendarConfig } from '@calendar/core/config'
import { applyCalendarSitePreset } from '$lib/calendar-site-preset'
import { applySecurityHeaders } from '$lib/security/headers'
import type { Handle } from '@sveltejs/kit'

applyCalendarSitePreset()
const calendarConfig = getCalendarConfig()

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

const themeHandle: Handle = async ({ event, resolve }) => {
	const locals = event.locals as Record<string, unknown>
	locals['themePreferences'] = {
		theme: 'dark',
		themeScheme: 'default'
	}

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

const securityHeadersHandle: Handle = async ({ event, resolve }) => {
	const nonce = crypto.randomUUID()
	event.locals.cspNonce = nonce

	let response: Response
	try {
		response = await resolve(event, {
			transformPageChunk: ({ html }) => html.replace(/<script(?=[\s>])/g, `<script nonce="${nonce}"`)
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

	try {
		applySecurityHeaders(response, event.url, nonce)
	} catch (error) {
		if (!(error instanceof TypeError) || !String(error.message).includes('immutable')) {
			throw error
		}
		response = new Response(response.body, response)
		applySecurityHeaders(response, event.url, nonce)
	}

	return response
}

export const handle = sequence(
	securityHeadersHandle,
	themeHandle,
	handleAdminAuth,
	handleCalendarAuth,
	requireCalendarUser
)
