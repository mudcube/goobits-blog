import { dev } from '$app/environment'
import type { ContactFormData } from './schema'

export type ContactDeliveryResult =
	| { ok: true; status: 200 | 202 }
	| { ok: false; status: 502 | 503; error: string }

export async function deliverContactMessage(
	data: ContactFormData,
	webhook: string
): Promise<ContactDeliveryResult> {
	if (!webhook) {
		if (!dev) {
			console.error('[contact] CONTACT_WEBHOOK_URL missing in non-dev environment')
			return { ok: false, status: 503, error: 'Contact delivery is not configured.' }
		}

		console.info('[contact] message accepted (no CONTACT_WEBHOOK_URL configured)', {
			from: data.email,
			name: data.name,
			length: data.message.length
		})
		return { ok: true, status: 202 }
	}

	const response = await fetch(webhook, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			event: 'miko-contact-form',
			source: 'miko.art',
			sentAt: new Date().toISOString(),
			...data
		})
	})

	if (!response.ok) {
		return { ok: false, status: 502, error: 'Contact delivery failed.' }
	}

	return { ok: true, status: 200 }
}
