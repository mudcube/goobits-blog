import { getEnv, requireEnv } from '../../../packages/calendar/src/config/env.ts'
import { checkRateLimit, validateAdminSessionFromHeader } from '../../../packages/calendar/src/index.ts'

import type { D1DatabaseLike } from '../../../packages/calendar/src/storage/d1.ts'

export type EnvLike = {
	DB: D1DatabaseLike
	NODE_ENV?: string
	[key: string]: string | D1DatabaseLike | undefined
}

export function getCalendarIds(env: EnvLike): string[] {
	const ids = getEnv(env, 'GOOGLE_CALENDAR_IDS', '') || ''
	return ids.split(',').map(id => id.trim()).filter(Boolean)
}

export function getPrimaryCalendarId(env: EnvLike): string | undefined {
	const explicit = getEnv(env, 'GOOGLE_PRIMARY_CALENDAR_ID', '')
	if (explicit) return explicit
	return getCalendarIds(env)[0]
}

export function getCapacity(env: EnvLike): number {
	const value = getEnv(env, 'BOOKING_CAPACITY', '4') || '4'
	return Number.parseInt(value, 10) || 1
}

export function getSlotMinutes(env: EnvLike): number {
	const value = getEnv(env, 'BOOKING_SLOT_MINUTES', '60') || '60'
	return Number.parseInt(value, 10) || 60
}

export function getBufferMinutes(env: EnvLike): number {
	const value = getEnv(env, 'BOOKING_BUFFER_MINUTES', '15') || '15'
	return Number.parseInt(value, 10) || 15
}

export function getMinNoticeHours(env: EnvLike): number {
	const value = getEnv(env, 'BOOKING_MIN_NOTICE_HOURS', '24') || '24'
	return Number.parseInt(value, 10) || 24
}

export function getLocation(env: EnvLike): string {
	return getEnv(env, 'BOOKING_LOCATION', 'Rainbow Gym, Portland OR') || ''
}

export function getTokenKey(env: EnvLike): string {
	return requireEnv(env, 'TOKEN_ENC_KEY')
}

export function getAdminPasscode(env: EnvLike): string {
	return getEnv(env, 'ADMIN_PASSCODE', '') || ''
}

export async function requireAdmin({
	env,
	request
}: {
	env: EnvLike
	request: Request
}): Promise<boolean> {
	const result = await validateAdminSessionFromHeader({
		db: env.DB,
		cookieHeader: request.headers.get('cookie'),
		secureCookies: env.NODE_ENV !== 'development'
	})
	return result?.ok ?? false
}

function isSameOriginRequest(request: Request) {
	const urlOrigin = new URL(request.url).origin

	const origin = request.headers.get('origin')
	if (origin) return origin === urlOrigin

	const referer = request.headers.get('referer')
	if (referer) {
		try {
			return new URL(referer).origin === urlOrigin
		} catch {
			return false
		}
	}

	return false
}

export function enforceSameOriginRequest(request: Request) {
	if (!isSameOriginRequest(request)) {
		return errorResponse('Forbidden', 403, 'forbidden')
	}
	return null
}

export function errorResponse(message: string, status = 400, code = 'bad_request') {
	return jsonResponse({ ok: false, error: { code, message } }, status)
}

export function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	})
}

export async function readJson(
	request: Request,
	{ maxBytes = 8192 }: { maxBytes?: number } = {}
) {
	const contentLength = request.headers.get('content-length')
	if (contentLength) {
		const bytes = Number.parseInt(contentLength, 10)
		if (Number.isFinite(bytes) && bytes > maxBytes) {
			return { ok: false, status: 413, error: { code: 'payload_too_large', message: 'Payload too large' } }
		}
	}

	const text = await request.text()
	if (!text) return { ok: true, value: {} }
	if (text.length > maxBytes) {
		return { ok: false, status: 413, error: { code: 'payload_too_large', message: 'Payload too large' } }
	}

	try {
		return { ok: true, value: JSON.parse(text) }
	} catch {
		return { ok: false, status: 400, error: { code: 'invalid_json', message: 'Invalid JSON' } }
	}
}

export async function enforceRateLimit({
	env,
	request,
	keySuffix,
	limit = 30,
	windowSeconds = 60
}: {
	env: EnvLike
	request: Request
	keySuffix: string
	limit?: number
	windowSeconds?: number
}) {
	const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim()
	let ip = cloudflareIp || 'unknown'

	// Only trust XFF when explicitly enabled (for non-Cloudflare deployments).
	if (!cloudflareIp && env['RATE_LIMIT_TRUST_XFF'] === 'true') {
		const forwarded = request.headers.get('x-forwarded-for')
		const firstForwarded = forwarded?.split(',')[0]?.trim()
		ip = firstForwarded || 'unknown'
	}

	const key = `rate:${keySuffix}:${ip}`
	const result = await checkRateLimit({ db: env.DB, key, limit, windowSeconds })
	if (!result.allowed) {
		return errorResponse('Too many requests', 429, 'rate_limited')
	}
	return null
}
