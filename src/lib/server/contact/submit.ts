import type { RequestEvent } from '@sveltejs/kit'
import { mergeRuntimeEnv } from '$lib/server/calendar/runtime'
import { runContactAntiAbuse } from '$lib/server/antiabuse'
import { getAsn, getClientIp } from '$lib/server/request-meta'
import type { ContactFormData } from '@src/domains/contact/schema'
import { deliverContactMessage } from './deliver'

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
	const webhook =
		typeof envWebhook === 'string'
			? envWebhook
			: typeof processWebhook === 'string'
				? processWebhook
				: ''

	return deliverContactMessage(data, webhook)
}
