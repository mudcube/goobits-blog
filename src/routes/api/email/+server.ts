import { dev } from '$app/environment'
import { error, type RequestHandler } from '@sveltejs/kit'
import {
	createContactFailureResponse,
	createContactSuccessResponse,
	parseContactRequest
} from '@goobits/contact/server'
import { submitContactData } from '$lib/server/contact/submit'
import { contactSchema } from '@goobits/contact/core'
import { mergeRuntimeEnv } from '$lib/server/runtime'
import { hasCloudflareMetadata } from '$lib/server/request-meta'

/**
 * Same-origin guard. SvelteKit's form actions enforce same-origin POSTs by
 * default, but this is a raw `+server.ts` endpoint that accepts both form-
 * encoded and JSON bodies — so a cross-origin page could otherwise POST on
 * behalf of a visitor (using their Cloudflare IP / Turnstile cookie / etc.).
 *
 * We allow POSTs whose Origin matches the request URL's origin (typical
 * browser submission) and reject everything else. Server-to-server callers
 * (no Origin header) still pass since `null`/missing Origin is browser-set.
 */
function isSameOriginPost(request: Request): boolean {
	const origin = request.headers.get('origin')
	if (!origin) return true // server-to-server / curl / non-browser
	try {
		return new URL(origin).origin === new URL(request.url).origin
	} catch {
		return false
	}
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	if (!isSameOriginPost(request)) {
		throw error(403, 'Cross-origin contact submissions are not allowed.')
	}

	// In production, refuse requests missing Cloudflare metadata — they'd
	// otherwise collapse into a shared `'unknown'` rate-limit bucket. Dev
	// runs through localhost without those headers, so allow them through.
	if (!dev && !hasCloudflareMetadata(request)) {
		throw error(400, 'Bad request.')
	}

	const env = mergeRuntimeEnv(platform?.env)
	const CONTACT_FORM_PATH =
		(typeof env['CONTACT_FORM_PATH'] === 'string' && env['CONTACT_FORM_PATH']) || '/contact/'
	const CONTACT_THANK_YOU_PATH =
		(typeof env['CONTACT_THANK_YOU_PATH'] === 'string' && env['CONTACT_THANK_YOU_PATH']) ||
		'/contact/thank-you/'

	const { expectsJson, payload, errorResponse } = await parseContactRequest(request, {
		invalidBodyRedirectPath: CONTACT_FORM_PATH
	})
	if (errorResponse) {
		return errorResponse
	}

	const parsed = contactSchema.safeParse(payload)
	if (!parsed.success) {
		return createContactFailureResponse(
			request.url,
			expectsJson,
			'Please provide a valid name, email, and message.',
			400,
			{ errorRedirectPath: CONTACT_FORM_PATH }
		)
	}

	const result = await submitContactData({ request, platform, getClientAddress }, parsed.data)
	if (!result.ok) {
		return createContactFailureResponse(request.url, expectsJson, result.error, result.status, {
			errorRedirectPath: CONTACT_FORM_PATH
		})
	}

	return createContactSuccessResponse(request.url, expectsJson, result.status, {
		successRedirectPath: CONTACT_THANK_YOU_PATH
	})
}
