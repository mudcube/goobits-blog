import { getEnv, requireEnv } from '../../../packages/calendar/src/config/env.js'
import { checkRateLimit, parseAdminSessionCookie, validateAdminSession } from '../../../packages/calendar/src/index.js'

export function getCalendarIds(env) {
	const ids = getEnv(env, 'GOOGLE_CALENDAR_IDS', '')
	return ids.split(',').map(id => id.trim()).filter(Boolean)
}

export function getPrimaryCalendarId(env) {
	const explicit = getEnv(env, 'GOOGLE_PRIMARY_CALENDAR_ID', '')
	if (explicit) return explicit
	return getCalendarIds(env)[0]
}

export function getCapacity(env) {
	const value = getEnv(env, 'BOOKING_CAPACITY', '4')
	return Number.parseInt(value, 10) || 1
}

export function getSlotMinutes(env) {
	const value = getEnv(env, 'BOOKING_SLOT_MINUTES', '60')
	return Number.parseInt(value, 10) || 60
}

export function getBufferMinutes(env) {
	const value = getEnv(env, 'BOOKING_BUFFER_MINUTES', '15')
	return Number.parseInt(value, 10) || 15
}

export function getMinNoticeHours(env) {
	const value = getEnv(env, 'BOOKING_MIN_NOTICE_HOURS', '24')
	return Number.parseInt(value, 10) || 24
}

export function getLocation(env) {
	return getEnv(env, 'BOOKING_LOCATION', 'Rainbow Gym, Portland OR')
}

export function getTokenKey(env) {
	return requireEnv(env, 'TOKEN_ENC_KEY')
}

export function getAdminPasscode(env) {
	return getEnv(env, 'ADMIN_PASSCODE', '')
}

export async function requireAdmin({ env, request }) {
	const token = parseAdminSessionCookie(request.headers.get('cookie'))
	if (!token) return false
	const result = await validateAdminSession({ db: env.DB, token })
	return result?.valid ?? false
}

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

export async function enforceRateLimit({ env, request, keySuffix, limit = 30, windowSeconds = 60 }) {
	const ip = request.headers.get('cf-connecting-ip') || 'unknown'
	const key = `rate:${keySuffix}:${ip}`
	const result = await checkRateLimit({ db: env.DB, key, limit, windowSeconds })
	if (!result.allowed) {
		return errorResponse('Too many requests', 429, 'rate_limited')
	}
	return null
}
