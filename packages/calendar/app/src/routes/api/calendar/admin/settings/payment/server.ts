import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import {
	getAdminPaymentDefaults,
	parseAdminPaymentDefaultsInput,
	setAdminPaymentDefaults,
	TransportValidationError
} from '@calendar/core'
import { apiOk, apiValidationError } from '@calendar/kit'
import { requireAdminRequest, runApiRequest } from '@calendar/app/admin-api-helpers'

export async function GET(event: RequestEvent) {
	return runApiRequest('admin.settings.payment.get', async () => {
		const guard = requireAdminRequest(event)
		if (guard) return guard
		const { db } = await getAdminAuth({ event })
		const payment = await getAdminPaymentDefaults(db)
		return apiOk({ payment })
	})
}

export async function PUT(event: RequestEvent) {
	return runApiRequest('admin.settings.payment.put', async () => {
		const guard = requireAdminRequest(event, { csrf: true })
		if (guard) return guard
		const input = parseAdminPaymentDefaultsInput(await event.request.json().catch(() => null))
		const { db } = await getAdminAuth({ event })
		await setAdminPaymentDefaults(db, input)
		return apiOk({})
	}, {
		onError: (error) => (error instanceof TransportValidationError ? apiValidationError(error) : null)
	})
}
