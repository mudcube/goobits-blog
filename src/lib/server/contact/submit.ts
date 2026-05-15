import type { RequestEvent } from '@sveltejs/kit'
import { deliverContactMessage, submitContactMessage } from '@goobits/contact/server'
import type { ContactFormData } from '@goobits/contact/core'
import { mergeRuntimeEnv, resolveRuntimeDb } from '$lib/server/runtime'
import { runContactAntiAbuse } from '$lib/server/antiabuse'
import { getAsn, getClientIp } from '$lib/server/request-meta'

export async function submitContactData(
	event: Pick<RequestEvent, 'request' | 'platform' | 'getClientAddress'>,
	data: ContactFormData
) {
	const env = mergeRuntimeEnv(event.platform?.env)
	const db = await resolveRuntimeDb(event.platform?.env)

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
					env,
					...(db ? { db } : {})
				})

			if (antiAbuse.ok) return { ok: true as const }
			return {
				ok: false as const,
				status: 400,
				error: antiAbuse.message || 'We could not complete that request. Please try again later.'
			}
		},
		deliver: async (payload) => {
			const webhook =
				typeof env['CONTACT_WEBHOOK_URL'] === 'string'
					? env['CONTACT_WEBHOOK_URL']
					: ''
			// Use a literal fallback rather than deriving from `event.request.url`'s
			// hostname — on Workers that's the inbound `Host` header, which is
			// attacker-controlled and would let a poisoned Host inject the value
			// forwarded to the email webhook (see security audit M2).
			const source =
				typeof env['CONTACT_SOURCE'] === 'string' && env['CONTACT_SOURCE'].length > 0
					? env['CONTACT_SOURCE']
					: 'contact-source-unset'
			const eventName =
				typeof env['CONTACT_EVENT'] === 'string' && env['CONTACT_EVENT'].length > 0
					? env['CONTACT_EVENT']
					: 'contact-form'

				return deliverContactMessage(payload, {
					webhook,
					source,
					event: eventName,
					secret: env['CONTACT_WEBHOOK_SECRET'] || '',
					timeoutMs: 5000
				})
		}
	})
}
