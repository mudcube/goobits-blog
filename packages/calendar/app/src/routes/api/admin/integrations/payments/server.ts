import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import {
	deletePaymentCredentials,
	getPaymentCheckoutConfig,
	savePayPalPaymentCredentials,
	saveSquarePaymentCredentials
} from '@calendar/core/payments'
import { requireEnv } from '@calendar/core/config'
import { logAdminEvent, requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'
import { apiError, apiOk } from '@calendar/kit'

function readString(body: Record<string, unknown>, key: string, maxLength: number) {
	const value = body[key]
	return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function readEnvironment(body: Record<string, unknown>) {
	return readString(body, 'environment', 24).toLowerCase() === 'live' ? 'live' : 'sandbox'
}

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.integrations.payments.get', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const env = await buildEnv(event.platform)
		const payments = await getPaymentCheckoutConfig({
			db: env.DB,
			env,
			base64Key: requireEnv(env, 'TOKEN_ENC_KEY')
		})
		return apiOk({ payments })
	})
}

export async function PUT(event: RequestEvent) {
	return runApiRequest('admin.integrations.payments.put', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const body = (await event.request.json().catch(() => null)) as Record<string, unknown> | null
		if (!body || typeof body !== 'object') return apiError('Invalid payment integration settings', { status: 400 })
		const provider = readString(body, 'provider', 24)
		const env = await buildEnv(event.platform)
		const base64Key = requireEnv(env, 'TOKEN_ENC_KEY')
		if (provider === 'paypal') {
			const clientId = readString(body, 'clientId', 240)
			const clientSecret = readString(body, 'clientSecret', 240)
			if (!clientId || !clientSecret) {
				return apiError('PayPal client ID and client secret are required', { status: 400 })
			}
			await savePayPalPaymentCredentials({
				db: env.DB,
				base64Key,
				clientId,
				clientSecret,
				environment: readEnvironment(body)
			})
			logAdminEvent(event, 'payment_integration_save', { provider: 'paypal' })
			return apiOk({})
		}
		if (provider === 'square') {
			const applicationId = readString(body, 'applicationId', 240)
			const locationId = readString(body, 'locationId', 160)
			const accessToken = readString(body, 'accessToken', 300)
			if (!applicationId || !locationId || !accessToken) {
				return apiError('Square application ID, location ID, and access token are required', { status: 400 })
			}
			await saveSquarePaymentCredentials({
				db: env.DB,
				base64Key,
				applicationId,
				locationId,
				accessToken,
				environment: readEnvironment(body)
			})
			logAdminEvent(event, 'payment_integration_save', { provider: 'square' })
			return apiOk({})
		}
		return apiError('Unsupported payment integration provider', { status: 400 })
	})
}

export async function DELETE(event: RequestEvent) {
	return runApiRequest('admin.integrations.payments.delete', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const provider = event.url.searchParams.get('provider')
		const normalized = provider === 'paypal' ? 'paypal' : provider === 'square' ? 'square' : null
		if (!normalized) return apiError('Unsupported payment integration provider', { status: 400 })
		const env = await buildEnv(event.platform)
		await deletePaymentCredentials(env.DB, normalized)
		logAdminEvent(event, 'payment_integration_delete', { provider: normalized })
		return apiOk({})
	})
}
