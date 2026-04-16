import type { RequestEvent } from '@sveltejs/kit'
import { deliverContactMessage, submitContactMessage } from '@goobits/contact/server'
import type { ContactFormData } from '@goobits/contact/core'
import { mergeRuntimeEnv } from '$lib/server/runtime'
import { runContactAntiAbuse } from '$lib/server/antiabuse'
import { getAsn, getClientIp } from '$lib/server/request-meta'

export async function submitContactData(
	event: Pick<RequestEvent, 'request' | 'platform' | 'getClientAddress'>,
	data: ContactFormData
) {
	const env = mergeRuntimeEnv(event.platform?.env)

	return submitContactMessage({
		data,
		validateAntiAbuse: async (payload) => {
			const antiAbuse = await runContactAntiAbuse({
				email: payload.email,
				ip: getClientIp(event.request, { env, getClientAddress: event.getClientAddress }),
				asn: getAsn(event.request),
				deviceId: payload.device_id,
				honeypot: payload.website,
				startedAtMs: Number.parseInt(payload.started_at || '0', 10),
				turnstileToken: payload['cf-turnstile-response'],
				env
			})

			if (antiAbuse.ok) return { ok: true as const }
			return {
				ok: false as const,
				status: 400,
				error: antiAbuse.message || 'We could not complete that request. Please try again later.'
			}
		},
		deliver: async (payload) => {
			const envWebhook = event.platform?.env?.['CONTACT_WEBHOOK_URL']
			const processWebhook = process.env['CONTACT_WEBHOOK_URL']
			const webhook =
				typeof envWebhook === 'string'
					? envWebhook
					: typeof processWebhook === 'string'
						? processWebhook
						: ''

			return deliverContactMessage(payload, {
				webhook,
				source: 'miko.art',
				event: 'miko-contact-form'
			})
		}
	})
}
