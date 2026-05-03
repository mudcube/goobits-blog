import { dev } from '$app/environment'
import type { ContactFormData } from '../core/contact'

export type ContactDeliveryConfig = {
	webhook: string
	source: string
	event?: string
	secret?: string
	timeoutMs?: number
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

	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 5000)
	try {
		const response = await fetch(config.webhook, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				...(config.secret ? { 'x-contact-webhook-secret': config.secret } : {})
			},
			signal: controller.signal,
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
	} finally {
		clearTimeout(timeout)
	}

	return { ok: true, status: 200 }
}
