import type { RequestHandler } from './$types'
import {
	createContactFailureResponse,
	createContactSuccessResponse,
	parseContactRequest
} from '$lib/server/contact/api'
import { submitContactData } from '$lib/server/contact/submit'
import { contactSchema } from '@src/domains/contact/schema'

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const { expectsJson, payload, errorResponse } = await parseContactRequest(request)
	if (errorResponse) {
		return errorResponse
	}

	const parsed = contactSchema.safeParse(payload)
	if (!parsed.success) {
		return createContactFailureResponse(
			request.url,
			expectsJson,
			'Please provide a valid name, email, and message.',
			400
		)
	}

	const result = await submitContactData({ request, platform, getClientAddress }, parsed.data)
	if (!result.ok) {
		return createContactFailureResponse(request.url, expectsJson, result.error, result.status)
	}

	return createContactSuccessResponse(request.url, expectsJson, result.status)
}
