import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { createPayPalCheckoutOrder, getPaymentCheckoutContext } from '@calendar/core/payments'
import { parsePositiveInteger, readStringOrEmpty, TransportValidationError } from '@calendar/core/transport'
import { apiError, apiOk, apiValidationError, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'
import { enforceSameOrigin } from '@calendar/app/admin-api-helpers'

export async function POST(event: RequestEvent) {
	return runCalendarRequest(
		'calendar.payments.paypal.order',
		async () => {
			const csrf = enforceSameOrigin(event)
			if (csrf) return csrf
			const user = requireCalendarUserId(event)
			if (user.response) return user.response
			const body = (await event.request.json().catch(() => null)) as Record<string, unknown> | null
			if (!body || typeof body !== 'object') return apiError('Invalid payment request', { status: 400 })
			const eventId = parsePositiveInteger(body['eventId'])
			if (!eventId) return apiError('Invalid event id', { status: 400 })
			const confirmationId = readStringOrEmpty(body, 'confirmationId', 64) || null
			const rawFunding = readStringOrEmpty(body, 'fundingSource', 24).toLowerCase()
			const fundingSource = rawFunding === 'venmo' ? 'venmo' : 'paypal'
			const env = await buildEnv(event.platform)
			const context = await getPaymentCheckoutContext(env.DB, {
				eventId,
				userId: user.userId,
				confirmationId
			})
			if (!context) return apiError('Paid booking not found', { status: 404, code: 'payment_context_not_found' })
			const order = await createPayPalCheckoutOrder({
				db: env.DB,
				env,
				context,
				fundingSource
			})
			return apiOk(order)
		},
		{
			onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
		}
	)
}
