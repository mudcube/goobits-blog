import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { capturePayPalCheckoutOrder } from '@calendar/core'
import { apiError, apiOk, requireCalendarUserId, runCalendarRequest } from '@calendar/kit'
import { enforceSameOrigin } from '@calendar/app/admin-api-helpers'

function readString(body: Record<string, unknown>, key: string, maxLength: number) {
	const value = body[key]
	return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export async function POST(event: RequestEvent) {
	return runCalendarRequest('calendar.payments.paypal.capture', async () => {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf
		const user = requireCalendarUserId(event)
		if (user.response) return user.response
		const body = (await event.request.json().catch(() => null)) as Record<string, unknown> | null
		if (!body || typeof body !== 'object') return apiError('Invalid payment request', { status: 400 })
		const orderId = readString(body, 'orderId', 80)
		if (!orderId) return apiError('Missing PayPal order id', { status: 400 })
		const env = await buildEnv(event.platform)
		const result = await capturePayPalCheckoutOrder({ db: env.DB, env, orderId, userId: user.userId })
		return apiOk(result)
	})
}
