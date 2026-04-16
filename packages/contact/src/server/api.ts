import { json } from '@sveltejs/kit'

export function redirectForContactForm(location: URL | string) {
	return new Response(null, {
		status: 303,
		headers: {
			location: typeof location === 'string' ? location : location.toString()
		}
	})
}

export async function parseContactRequest(
	request: Request,
	options: { invalidBodyRedirectPath: string }
) {
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
				: redirectForContactForm(
					new URL(
						`${options.invalidBodyRedirectPath}?error=${encodeURIComponent('Invalid request body.')}`,
						request.url
					)
				)
		}
	}
}

export function createContactFailureResponse(
	requestUrl: string,
	expectsJson: boolean,
	error: string,
	status: number,
	options: { errorRedirectPath: string }
) {
	if (expectsJson) {
		return json({ ok: false, error }, { status })
	}

	return redirectForContactForm(
		new URL(`${options.errorRedirectPath}?error=${encodeURIComponent(error)}`, requestUrl)
	)
}

export function createContactSuccessResponse(
	requestUrl: string,
	expectsJson: boolean,
	status: number,
	options: { successRedirectPath: string }
) {
	if (expectsJson) {
		return json({ ok: true }, { status: status === 202 ? 202 : 200 })
	}

	return redirectForContactForm(new URL(options.successRedirectPath, requestUrl))
}
