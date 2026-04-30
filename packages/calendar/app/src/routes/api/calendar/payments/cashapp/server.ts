import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import {
	createSquareCashAppPayment,
	getPaymentCheckoutContext,
	parsePositiveInteger,
	TransportValidationError
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'
import { enforceSameOrigin } from '@calendar/app/admin-api-helpers'

function readString(body: Record<string, unknown>, key: string, maxLength: number) {
	const value = body[key]
	return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function POST(event: RequestEvent) {
	return runCalendarRequest(
		'calendar.payments.cashapp',
		async () => {
			const csrf = enforceSameOrigin(event)
			if (csrf) return csrf
			const user = requireCalendarUserId(event)
			if (user.response) return user.response
			const body = (await event.request.json().catch(() => null)) as Record<string, unknown> | null
			if (!body || typeof body !== 'object') return apiError('Invalid payment request', { status: 400 })
			const eventId = parsePositiveInteger(body['eventId'])
			if (!eventId) return apiError('Invalid event id', { status: 400 })
			const sourceId = readString(body, 'sourceId', 256)
			if (!sourceId) return apiError('Missing Cash App payment token', { status: 400 })
			const confirmationId = readString(body, 'confirmationId', 64) || null
			const env = await buildEnv(event.platform)
			const context = await getPaymentCheckoutContext(env.DB, {
				eventId,
				userId: user.userId,
				confirmationId
			})
			if (!context) return apiError('Paid booking not found', { status: 404, code: 'payment_context_not_found' })
			const result = await createSquareCashAppPayment({
				db: env.DB,
				env,
				context,
				sourceId
			})
			return apiOk(result)
		},
		{
			onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
		}
	)
}
