import type { RequestEvent } from '@sveltejs/kit'
import { getAdminAuth } from '@calendar/kit'
import {
	getAdminPaymentDefaults,
	parseAdminPaymentDefaultsInput,
	setAdminPaymentDefaults,
	TransportValidationError
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, logApiError } from '@calendar/kit'
import { enforceSameOrigin, requireAdminSession, unauthorized } from '@calendar/app/admin-api-helpers'

export async function GET(event: RequestEvent) {
	try {
		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const { db } = await getAdminAuth({ event })
		const payment = await getAdminPaymentDefaults(db)
		return apiOk({ payment })
	} catch (err) {
		logApiError('admin.settings.payment.get', err)
		return apiError('Internal server error')
	}
}

export async function PUT(event: RequestEvent) {
	try {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf

		const auth = await requireAdminSession({ event })
		if (!auth.ok) return unauthorized()

		const input = parseAdminPaymentDefaultsInput(await event.request.json().catch(() => null))
		const { db } = await getAdminAuth({ event })
		await setAdminPaymentDefaults(db, input)
		return apiOk({})
	} catch (err) {
		if (err instanceof TransportValidationError) {
			return apiValidationError(err)
		}
		logApiError('admin.settings.payment.put', err)
		return apiError('Internal server error')
	}
}
