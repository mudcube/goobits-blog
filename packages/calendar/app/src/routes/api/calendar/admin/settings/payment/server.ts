import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getAdminPaymentDefaults, setAdminPaymentDefaults } from '@calendar/core/admin'
import { parseAdminPaymentDefaultsInput, TransportValidationError } from '@calendar/core/transport'
import { apiOk, apiValidationError } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.settings.payment.get', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const { DB: db } = await buildEnv(event.platform)
		const payment = await getAdminPaymentDefaults(db)
		return apiOk({ payment })
	})
}

export async function PUT(event: RequestEvent) {
	return runApiRequest('admin.settings.payment.put', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const input = parseAdminPaymentDefaultsInput(await event.request.json().catch(() => null))
		const { DB: db } = await buildEnv(event.platform)
		await setAdminPaymentDefaults(db, input)
		return apiOk({})
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
