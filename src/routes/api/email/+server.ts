import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { submitContactData } from '@src/domains/contact/actions'
import { contactSchema } from '@src/domains/contact/schema'

function getContactRedirectUrl(requestUrl: string, error?: string) {
	const url = new URL('/contact/', requestUrl)
	if (error) url.searchParams.set('error', error)
	return url
}

function redirectForForm(location: URL | string) {
	return new Response(null, {
		status: 303,
		headers: {
			location: typeof location === 'string' ? location : location.toString()
		}
	})
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const contentType = request.headers.get('content-type') || ''
	const expectsJson = contentType.includes('application/json')
	let payload: unknown

	try {
		if (expectsJson) {
			payload = await request.json()
		} else {
			const formData = await request.formData()
			payload = Object.fromEntries(formData.entries())
		}
	} catch {
		if (expectsJson) {
			return json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
		}
		return redirectForForm(getContactRedirectUrl(request.url, 'Invalid request body.'))
	}

	const parsed = contactSchema.safeParse(payload)
	if (!parsed.success) {
		if (expectsJson) {
			return json({ ok: false, error: 'Please provide a valid name, email, and message.' }, { status: 400 })
		}
		return redirectForForm(getContactRedirectUrl(request.url, 'Please provide a valid name, email, and message.'))
	}

	const result = await submitContactData({ request, platform, getClientAddress }, parsed.data)
	if (!result.ok) {
		if (expectsJson) {
			return json({ ok: false, error: result.error }, { status: result.status })
		}
		return redirectForForm(getContactRedirectUrl(request.url, result.error))
	}

	if (expectsJson) {
		return json({ ok: true }, { status: result.status === 202 ? 202 : 200 })
	}

	return redirectForForm(new URL('/contact/thank-you/', request.url))
}
