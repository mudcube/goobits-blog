export type ContactPayload = {
	name: string
	email: string
	message: string
	from?: string
	topic?: string
	device_id?: string
	started_at?: string
	website?: string
	['cf-turnstile-response']?: string
}

export type ContactSubmitResult = {
	ok: boolean
	error?: string
	requiresChallenge?: boolean
}

export function toContactPayload(formData: FormData): ContactPayload {
	const from = String(formData.get('from') ?? '').trim()
	const topic = String(formData.get('topic') ?? '').trim()
	const deviceId = String(formData.get('device_id') ?? '').trim()
	const startedAt = String(formData.get('started_at') ?? '').trim()
	const website = String(formData.get('website') ?? '')
	const turnstileToken = String(formData.get('cf-turnstile-response') ?? '').trim()
	return {
		name: String(formData.get('name') ?? '').trim(),
		email: String(formData.get('email') ?? '').trim(),
		message: String(formData.get('message') ?? '').trim(),
		...(from ? { from } : {}),
		...(topic ? { topic } : {}),
		...(deviceId ? { device_id: deviceId } : {}),
		...(startedAt ? { started_at: startedAt } : {}),
		...(website ? { website } : {}),
		...(turnstileToken ? { 'cf-turnstile-response': turnstileToken } : {})
	}
}

export async function submitContact(payload: ContactPayload): Promise<ContactSubmitResult> {
	const response = await fetch('/api/email', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(payload)
	})

	if (response.ok) return { ok: true }

	let error = 'Unable to send your message right now.'
	let requiresChallenge = false
	try {
		const data = (await response.json()) as { error?: string; requiresChallenge?: boolean }
		if (typeof data.error === 'string' && data.error.length > 0) error = data.error
		requiresChallenge = data.requiresChallenge === true
	} catch {
		// ignore json parse errors and return generic failure
	}

	return { ok: false, error, requiresChallenge }
}
