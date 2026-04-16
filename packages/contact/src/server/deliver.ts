import { dev } from '$app/environment'
import type { ContactFormData } from '../core/contact'

export type ContactDeliveryConfig = {
	webhook: string
	source: string
	event?: string
}

export type ContactDeliveryResult =
	| { ok: true; status: 200 | 202 }
	| { ok: false; status: 502 | 503; error: string }

export async function deliverContactMessage(
	data: ContactFormData,
	config: ContactDeliveryConfig
): Promise<ContactDeliveryResult> {
	if (!config.webhook) {
		if (!dev) {
			console.error('[contact] webhook missing in non-dev environment')
			return { ok: false, status: 503, error: 'Contact delivery is not configured.' }
		}

		console.info('[contact] message accepted (no webhook configured)', {
			from: data.email,
			name: data.name,
			length: data.message.length,
			source: config.source
		})
		return { ok: true, status: 202 }
	}

	try {
		const response = await fetch(config.webhook, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				event: config.event || 'contact-form',
				source: config.source,
				sentAt: new Date().toISOString(),
				...data
			})
		})

		if (!response.ok) {
			return { ok: false, status: 502, error: 'Contact delivery failed.' }
		}
	} catch (error) {
		console.error('[contact] delivery request failed', {
			error: error instanceof Error ? error.message : String(error),
			source: config.source
		})
		return { ok: false, status: 502, error: 'Contact delivery failed.' }
	}

	return { ok: true, status: 200 }
}
