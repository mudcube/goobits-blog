import { dev } from '$app/environment'
import { redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { zod4 as zod } from 'sveltekit-superforms/adapters'
import { mergeRuntimeEnv } from '$lib/server/runtime'
import { runContactAntiAbuse } from '$lib/server/antiabuse'
import { getAsn, getClientIp } from '$lib/server/request-meta'
import { contactSchema, type ContactFormData } from './schema'
import { getContactFormDefaults } from './defaults'
import { deliverContactMessage } from './deliver'

export const prerender = false

type ContactLoadEvent = Parameters<ServerLoad>[0]

function getTurnstileSiteKey(env: Record<string, string | undefined>) {
	const localWidgetEnabled = env['TURNSTILE_ENABLE_LOCALHOST'] === 'true'
	return dev && !localWidgetEnabled ? '' : env['PUBLIC_TURNSTILE_SITE_KEY'] || ''
}

export async function submitContactData(
	event: Pick<RequestEvent, 'request' | 'platform' | 'getClientAddress'>,
	data: ContactFormData
) {
	const env = mergeRuntimeEnv(event.platform?.env)
	const antiAbuse = await runContactAntiAbuse({
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

	const envWebhook = event.platform?.env?.['CONTACT_WEBHOOK_URL']
	const processWebhook = process.env['CONTACT_WEBHOOK_URL']
	const webhook = typeof envWebhook === 'string' ? envWebhook : typeof processWebhook === 'string' ? processWebhook : ''

	return deliverContactMessage(data, webhook)
}

export const load = async ({ url, platform }: ContactLoadEvent) => {
	const env = mergeRuntimeEnv(platform?.env)
	const form = await superValidate(
		getContactFormDefaults({
			from: url.searchParams.get('from')?.trim() || '',
			topic: url.searchParams.get('topic')?.trim() || '',
			started_at: String(Date.now())
		}),
		zod(contactSchema),
		{ errors: false }
	)

	return {
		form,
		turnstileSiteKey: getTurnstileSiteKey(env)
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(contactSchema))
		if (!form.valid) {
			return setError(form, '', 'Please review the highlighted fields.', { status: 400 })
		}

		const result = await submitContactData(event, form.data as ContactFormData)
		if (!result.ok) {
			return setError(form, '', result.error, { status: result.status })
		}

		throw redirect(303, '/contact/thank-you/')
	}
}
