import { json } from '@sveltejs/kit'

export function getContactRedirectUrl(requestUrl: string, error?: string) {
	const url = new URL('/contact/', requestUrl)
	if (error) url.searchParams.set('error', error)
	return url
}

export function redirectForContactForm(location: URL | string) {
	return new Response(null, {
		status: 303,
		headers: {
			location: typeof location === 'string' ? location : location.toString()
		}
	})
}

export async function parseContactRequest(request: Request) {
	const contentType = request.headers.get('content-type') || ''
	const expectsJson = contentType.includes('application/json')

	try {
		const payload = expectsJson
			? await request.json()
			: Object.fromEntries((await request.formData()).entries())

		return {
			expectsJson,
			payload
		}
	} catch {
		return {
			expectsJson,
			errorResponse: expectsJson
				? json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
				: redirectForContactForm(getContactRedirectUrl(request.url, 'Invalid request body.'))
		}
	}
}

export function createContactFailureResponse(requestUrl: string, expectsJson: boolean, error: string, status: number) {
	if (expectsJson) {
		return json({ ok: false, error }, { status })
	}

	return redirectForContactForm(getContactRedirectUrl(requestUrl, error))
}

export function createContactSuccessResponse(requestUrl: string, expectsJson: boolean, status: number) {
	if (expectsJson) {
		return json({ ok: true }, { status: status === 202 ? 202 : 200 })
	}

	return redirectForContactForm(new URL('/contact/thank-you/', requestUrl))
}
