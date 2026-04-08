import type { RegisterFormData } from './schema'

export function getRegisterFormDefaults(input?: Partial<RegisterFormData>): RegisterFormData {
	return {
		name: input?.name || '',
		email: input?.email || '',
		password: input?.password || '',
		started_at: input?.started_at || String(Date.now()),
		device_id: input?.device_id || '',
		website: input?.website || '',
		['cf-turnstile-response']: input?.['cf-turnstile-response'] || ''
	}
}
