import { dev } from '$app/environment'
import { redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { zod4 as zod } from 'sveltekit-superforms/adapters'
import { mergeRuntimeEnv, resolveBaseUrl, resolveRuntimeDb } from '$lib/server/runtime'
import { runRegisterAntiAbuse } from '$lib/server/antiabuse'
import { registerUser } from '$lib/server/auth/register'
import { getAsn, getClientIp } from '$lib/server/request-meta'
import { getRegisterFormDefaults } from './defaults'
import { registerSchema, type RegisterFormData } from './schema'

type RegisterLoadEvent = Parameters<ServerLoad>[0]

function getTurnstileSiteKey(env: Record<string, string | undefined>) {
	const localWidgetEnabled = env['TURNSTILE_ENABLE_LOCALHOST'] === 'true'
	return dev && !localWidgetEnabled ? '' : env['PUBLIC_TURNSTILE_SITE_KEY'] || ''
}

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

export const load = async ({ platform }: RegisterLoadEvent) => {
	const env = mergeRuntimeEnv(platform?.env)
	const form = await superValidate(getRegisterFormDefaults(), zod(registerSchema))
	return {
		form,
		turnstileSiteKey: getTurnstileSiteKey(env)
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(registerSchema))
		if (!form.valid) {
			return setError(form, '', 'Please review the highlighted fields.', { status: 400 })
		}

		const result = await submitRegisterData(event, form.data as RegisterFormData)
		if (!result.ok) {
			return setError(form, '', result.error, { status: result.status })
		}

		throw redirect(303, '/register/success')
	}
}
