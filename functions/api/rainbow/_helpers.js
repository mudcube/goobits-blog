import {
	createSession,
	validateSession,
	deleteSession,
	getSessionCookie,
	clearSessionCookie,
	parseSessionCookie
} from '../../../packages/calendar/src/rainbow/session.js'
import { parseAdminSessionCookie, validateAdminSession } from '../../../packages/calendar/src/admin/session.js'
import {
	createInvite,
	validateInvite,
	consumeInvite,
	listInvites,
	deleteInvite,
	hasUserRedeemedAnyInvite
} from '../../../packages/calendar/src/rainbow/invites.js'
import {
	PROVIDERS,
	buildGoogleAuthUrl,
	buildAppleAuthUrl,
	exchangeGoogleCode,
	getGoogleUserInfo,
	exchangeAppleCode,
	parseAppleIdToken
} from '../../../packages/calendar/src/rainbow/providers.js'
import {
	createRainbowUser,
	getRainbowUserById,
	listRainbowUsers,
	createRainbowOauthState,
	consumeRainbowOauthState
} from '../../../packages/calendar/src/storage/d1.js'

export function errorResponse(message, status = 400, code = 'bad_request') {
	return jsonResponse({ ok: false, error: { code, message } }, status)
}

export function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	})
}

export async function readJson(request) {
	const text = await request.text()
	if (!text) return {}
	try {
		return JSON.parse(text)
	} catch (err) {
		return null
	}
}

export function generateState() {
	const bytes = new Uint8Array(32)
	crypto.getRandomValues(bytes)
	return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getBaseUrl(env) {
	return env.PUBLIC_BASE_URL || env.BASE_URL || ''
}

export async function requireAdmin({ env, request }) {
	const token = parseAdminSessionCookie(request.headers.get('cookie'))
	if (!token) return false
	const result = await validateAdminSession({ db: env.DB, token })
	return result?.valid ?? false
}

export {
	createSession,
	validateSession,
	deleteSession,
	getSessionCookie,
	clearSessionCookie,
	parseSessionCookie,
	createInvite,
	validateInvite,
	consumeInvite,
	listInvites,
	deleteInvite,
	hasUserRedeemedAnyInvite,
	PROVIDERS,
	buildGoogleAuthUrl,
	buildAppleAuthUrl,
	exchangeGoogleCode,
	getGoogleUserInfo,
	exchangeAppleCode,
	parseAppleIdToken,
	createRainbowUser,
	getRainbowUserById,
	listRainbowUsers,
	createRainbowOauthState,
	consumeRainbowOauthState
}
