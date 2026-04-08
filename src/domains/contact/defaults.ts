import type { ContactFormData } from './schema'

export function getContactFormDefaults(input?: Partial<ContactFormData>): ContactFormData {
	return {
		from: input?.from || '',
		topic: input?.topic || '',
		started_at: input?.started_at || String(Date.now()),
		device_id: input?.device_id || '',
		website: input?.website || '',
		name: input?.name || '',
		email: input?.email || '',
		message: input?.message || '',
		['cf-turnstile-response']: input?.['cf-turnstile-response'] || ''
	}
}
