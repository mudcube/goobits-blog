import type { ContactFormData } from '../core/contact'
import type { ContactDeliveryResult } from './deliver'

export type ContactAntiAbuseResult =
	| { ok: true }
	| { ok: false; status: number; error: string }

export type ContactSubmitResult = ContactDeliveryResult | { ok: false; status: number; error: string }

export async function submitContactMessage({
	data,
	validateAntiAbuse,
	deliver
}: {
	data: ContactFormData
	validateAntiAbuse: (data: ContactFormData) => Promise<ContactAntiAbuseResult>
	deliver: (data: ContactFormData) => Promise<ContactDeliveryResult>
}): Promise<ContactSubmitResult> {
	const antiAbuse = await validateAntiAbuse(data)
	if (!antiAbuse.ok) {
		return antiAbuse
	}

	return deliver(data)
}
