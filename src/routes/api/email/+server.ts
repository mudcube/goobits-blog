import type { RequestHandler } from './$types'
import {
	createContactFailureResponse,
	createContactSuccessResponse,
	parseContactRequest
} from '@goobits/contact/server'
import { submitContactData } from '$lib/server/contact/submit'
import { contactSchema } from '@goobits/contact/core'
import { mergeRuntimeEnv } from '$lib/server/runtime'

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
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
