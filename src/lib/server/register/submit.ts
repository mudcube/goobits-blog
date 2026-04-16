import type { RequestEvent } from '@sveltejs/kit'
import { mergeRuntimeEnv, resolveBaseUrl, resolveRuntimeDb } from '$lib/server/calendar/runtime'
import { runRegisterAntiAbuse } from '$lib/server/antiabuse'
import { registerUser } from '$lib/server/calendar/auth/register'
import { getAsn, getClientIp } from '$lib/server/request-meta'
import type { RegisterFormData } from '@src/domains/register/schema'

export async function submitRegisterData(
	event: Pick<RequestEvent, 'request' | 'platform' | 'getClientAddress' | 'url'>,
	data: RegisterFormData
) {
	const env = mergeRuntimeEnv(event.platform?.env)
	const db = await resolveRuntimeDb(event.platform?.env)
	if (!db) {
		return { ok: false as const, status: 503 as const, error: 'Registration is temporarily unavailable.' }
	}

	const antiAbuse = await runRegisterAntiAbuse({
		email: data.email,
		ip: getClientIp(event.request, { env, getClientAddress: event.getClientAddress }),
		asn: getAsn(event.request),
		deviceId: data.device_id,
		honeypot: data.website,
		startedAtMs: Number.parseInt(data.started_at || '0', 10),
		turnstileToken: data['cf-turnstile-response'],
		env
	})

	if (!antiAbuse.ok) {
		return {
			ok: false as const,
			status: 400 as const,
			error: antiAbuse.message || 'We could not complete that request. Please try again later.'
		}
	}

	const result = await registerUser(db, {
		name: data.name,
		email: data.email,
		password: data.password,
		baseUrl: resolveBaseUrl(event.url, env),
		env
	})

	if (!result.ok) {
		return {
			ok: false as const,
			status: 400 as const,
			error: result.error || 'We could not complete that request. Please try again later.'
		}
	}

	return { ok: true as const }
}
