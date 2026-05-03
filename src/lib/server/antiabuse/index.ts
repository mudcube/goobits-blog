import { checkRateLimit as checkMemoryRateLimit, compactRateLimitBuckets, keyForRateLimit } from './rate-limit'
import { isDisposableEmailDomain, type DisposableMode } from './disposable-email'
import { verifyTurnstileToken } from './turnstile'

export type RegisterAntiAbuseInput = {
	email: string
	ip: string
	asn: string
	deviceId: string
	honeypot: string
	startedAtMs: number
	turnstileToken: string
	nowMs?: number
	env: Record<string, string | undefined>
	db?: RateLimitDb
}

export type RegisterAntiAbuseResult = {
	ok: boolean
	reason: 'allow' | 'blocked' | 'challenge_required'
	message?: string
	requiresChallenge: boolean
}

export type ContactAntiAbuseInput = {
	email: string
	ip: string
	asn: string
	deviceId: string
	honeypot: string
	startedAtMs: number
	turnstileToken: string
	nowMs?: number
	env: Record<string, string | undefined>
	db?: RateLimitDb
}

type RateLimitDb = {
	prepare: (query: string) => {
		bind: (...values: unknown[]) => {
			run: () => Promise<unknown>
			first: <T = unknown>() => Promise<T | null>
		}
	}
}

function toInt(value: string | undefined, fallback: number) {
	if (!value) return fallback
	const parsed = Number.parseInt(value, 10)
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback
	return parsed
}

function enabled(value: string | undefined, fallback = false) {
	if (!value) return fallback
	return value === '1' || value.toLowerCase() === 'true'
}

function evaluateDisposablePolicy(modeRaw: string | undefined): DisposableMode {
	if (modeRaw === 'block' || modeRaw === 'score' || modeRaw === 'off') return modeRaw
	return 'score'
}

function isDevelopmentRuntime(env: Record<string, string | undefined>) {
	return env['NODE_ENV'] === 'development'
}

function shouldBypassTurnstileForLocalPreview(env: Record<string, string | undefined>) {
	return isDevelopmentRuntime(env) && enabled(env['TURNSTILE_ENABLE_LOCALHOST'], false)
}

function shouldFailOpenTurnstile(env: Record<string, string | undefined>) {
	return isDevelopmentRuntime(env) && enabled(env['TURNSTILE_FAIL_OPEN'], false)
}

function genericFailure(): RegisterAntiAbuseResult {
	return {
		ok: false,
		reason: 'blocked',
		message: 'We could not complete that request. Please try again later.',
		requiresChallenge: true
	}
}

function missingTurnstileSecretResult(env: Record<string, string | undefined>): RegisterAntiAbuseResult {
	if (shouldFailOpenTurnstile(env)) {
		return { ok: true, reason: 'allow', requiresChallenge: false }
	}

	return {
		ok: false,
		reason: 'challenge_required',
		message: 'Please retry and complete the security check.',
		requiresChallenge: true
	}
}

async function checkAbuseRateLimit(db: RateLimitDb | undefined, key: string, limit: number, windowMs: number) {
	if (!db) return checkMemoryRateLimit(key, limit, windowMs)
	const now = Math.floor(Date.now() / 1000)
	const resetAt = now + Math.max(1, Math.ceil(windowMs / 1000))
	await db.prepare(
		`INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
		 ON CONFLICT(key) DO UPDATE SET
		   count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
		   reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END`
	).bind(key, resetAt, now, now).run()
	const row = await db.prepare(
		`SELECT count, reset_at FROM rate_limits WHERE key = ? LIMIT 1`
	).bind(key).first<{ count: number; reset_at: number }>()
	const count = Number(row?.count ?? 1)
	return {
		allowed: count <= limit,
		remaining: Math.max(0, limit - count),
		resetAt: Number(row?.reset_at ?? resetAt) * 1000,
		count
	}
}

export async function runRegisterAntiAbuse(input: RegisterAntiAbuseInput): Promise<RegisterAntiAbuseResult> {
	const now = input.nowMs ?? Date.now()
	const antiAbuseEnabled = enabled(input.env['ANTIABUSE_ENABLED'], true)
	if (!antiAbuseEnabled) return { ok: true, reason: 'allow', requiresChallenge: false }

	compactRateLimitBuckets()

	if (input.honeypot.trim().length > 0) {
		return genericFailure()
	}

	const minSubmitMs = toInt(input.env['ABUSE_MIN_SUBMIT_MS'], 2500)
	if (!Number.isFinite(input.startedAtMs) || input.startedAtMs <= 0 || now - input.startedAtMs < minSubmitMs) {
		return genericFailure()
	}

	let riskScore = 0
	const ratePerIp = toInt(input.env['REGISTRATION_RATE_LIMIT_PER_IP'], 12)
	const ratePerEmail = toInt(input.env['REGISTRATION_RATE_LIMIT_PER_EMAIL'], 5)
	const ratePerDevice = toInt(input.env['REGISTRATION_RATE_LIMIT_PER_DEVICE'], 8)
	const ratePerAsn = toInt(input.env['REGISTRATION_RATE_LIMIT_PER_ASN'], 30)
	const rateWindowMs = toInt(input.env['REGISTRATION_RATE_LIMIT_WINDOW_MS'], 60 * 60 * 1000)

	const ipCheck = await checkAbuseRateLimit(input.db, keyForRateLimit('signup:ip', input.ip || 'unknown'), ratePerIp, rateWindowMs)
	if (!ipCheck.allowed) return genericFailure()
	if (ipCheck.count > Math.ceil(ratePerIp * 0.7)) riskScore += 1

	const emailCheck = await checkAbuseRateLimit(
		input.db,
		keyForRateLimit('signup:email', input.email || 'unknown@example.com'),
		ratePerEmail,
		rateWindowMs
	)
	if (!emailCheck.allowed) return genericFailure()
	if (emailCheck.count > Math.ceil(ratePerEmail * 0.6)) riskScore += 1

	if (input.deviceId) {
			const deviceCheck = await checkAbuseRateLimit(
				input.db,
				keyForRateLimit('signup:device', input.deviceId),
			ratePerDevice,
			rateWindowMs
		)
		if (!deviceCheck.allowed) return genericFailure()
		if (deviceCheck.count > Math.ceil(ratePerDevice * 0.7)) riskScore += 1
	}

	if (input.asn) {
		const asnCheck = await checkAbuseRateLimit(input.db, keyForRateLimit('signup:asn', input.asn), ratePerAsn, rateWindowMs)
		if (!asnCheck.allowed) return genericFailure()
		if (asnCheck.count > Math.ceil(ratePerAsn * 0.75)) riskScore += 1
	}

	const disposableMode = evaluateDisposablePolicy(input.env['DISPOSABLE_EMAIL_BLOCK_MODE'])
	if (isDisposableEmailDomain(input.email)) {
		if (disposableMode === 'block') return genericFailure()
		if (disposableMode === 'score') riskScore += 2
	}

	const alwaysRequireTurnstile = enabled(input.env['TURNSTILE_REQUIRED'], true)
	const shouldRequireChallenge = alwaysRequireTurnstile || riskScore >= 2
	if (!shouldRequireChallenge) {
		return { ok: true, reason: 'allow', requiresChallenge: false }
	}
	if (shouldBypassTurnstileForLocalPreview(input.env)) {
		return { ok: true, reason: 'allow', requiresChallenge: true }
	}

	const secret = input.env['TURNSTILE_SECRET_KEY'] || ''
	if (!secret) {
		return missingTurnstileSecretResult(input.env)
	}

	const verification = await verifyTurnstileToken({
		secret,
		token: input.turnstileToken,
		remoteIp: input.ip
	})

	if (!verification.success) {
		return {
			ok: false,
			reason: 'challenge_required',
			message: 'Please retry and complete the security check.',
			requiresChallenge: true
		}
	}

	return { ok: true, reason: 'allow', requiresChallenge: true }
}

export async function runContactAntiAbuse(input: ContactAntiAbuseInput): Promise<RegisterAntiAbuseResult> {
	const now = input.nowMs ?? Date.now()
	const antiAbuseEnabled = enabled(input.env['ANTIABUSE_ENABLED'], true)
	if (!antiAbuseEnabled) return { ok: true, reason: 'allow', requiresChallenge: false }

	compactRateLimitBuckets()

	if (input.honeypot.trim().length > 0) {
		return genericFailure()
	}

	const minSubmitMs = toInt(input.env['CONTACT_MIN_SUBMIT_MS'], 100)
	if (!Number.isFinite(input.startedAtMs) || input.startedAtMs <= 0 || now - input.startedAtMs < minSubmitMs) {
		return genericFailure()
	}

	let riskScore = 0
	const ratePerIp = toInt(input.env['CONTACT_RATE_LIMIT_PER_IP'], 10)
	const ratePerEmail = toInt(input.env['CONTACT_RATE_LIMIT_PER_EMAIL'], 3)
	const ratePerDevice = toInt(input.env['CONTACT_RATE_LIMIT_PER_DEVICE'], 5)
	const ratePerAsn = toInt(input.env['CONTACT_RATE_LIMIT_PER_ASN'], 20)
	const rateWindowMs = toInt(input.env['CONTACT_RATE_LIMIT_WINDOW_MS'], 60 * 60 * 1000)

	const ipCheck = await checkAbuseRateLimit(input.db, keyForRateLimit('contact:ip', input.ip || 'unknown'), ratePerIp, rateWindowMs)
	if (!ipCheck.allowed) return genericFailure()
	if (ipCheck.count > Math.ceil(ratePerIp * 0.5)) riskScore += 1

	const emailCheck = await checkAbuseRateLimit(
		input.db,
		keyForRateLimit('contact:email', input.email || 'unknown@example.com'),
		ratePerEmail,
		rateWindowMs
	)
	if (!emailCheck.allowed) return genericFailure()
	if (emailCheck.count > Math.ceil(ratePerEmail * 0.5)) riskScore += 1

	if (input.deviceId) {
			const deviceCheck = await checkAbuseRateLimit(
				input.db,
				keyForRateLimit('contact:device', input.deviceId),
			ratePerDevice,
			rateWindowMs
		)
		if (!deviceCheck.allowed) return genericFailure()
		if (deviceCheck.count > Math.ceil(ratePerDevice * 0.6)) riskScore += 1
	}

	if (input.asn) {
		const asnCheck = await checkAbuseRateLimit(input.db, keyForRateLimit('contact:asn', input.asn), ratePerAsn, rateWindowMs)
		if (!asnCheck.allowed) return genericFailure()
		if (asnCheck.count > Math.ceil(ratePerAsn * 0.6)) riskScore += 1
	}

	if (isDisposableEmailDomain(input.email)) {
		riskScore += 1
	}

	const alwaysRequireTurnstile = enabled(input.env['TURNSTILE_REQUIRED'], true)
	const shouldRequireChallenge = alwaysRequireTurnstile || riskScore >= 2
	if (!shouldRequireChallenge) {
		return { ok: true, reason: 'allow', requiresChallenge: false }
	}
	if (shouldBypassTurnstileForLocalPreview(input.env)) {
		return { ok: true, reason: 'allow', requiresChallenge: true }
	}

	const secret = input.env['TURNSTILE_SECRET_KEY'] || ''
	if (!secret) {
		return missingTurnstileSecretResult(input.env)
	}

	const verification = await verifyTurnstileToken({
		secret,
		token: input.turnstileToken,
		remoteIp: input.ip
	})

	if (!verification.success) {
		return {
			ok: false,
			reason: 'challenge_required',
			message: 'Please retry and complete the security check.',
			requiresChallenge: true
		}
	}

	return { ok: true, reason: 'allow', requiresChallenge: true }
}
