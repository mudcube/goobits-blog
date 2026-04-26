import {
	getBookingByConfirmation,
	cancelBookingByConfirmation,
	TransportValidationError
} from '@calendar/core'
import { apiError, apiOk, apiValidationError, buildEnv } from '@calendar/kit'
import type { RequestEvent } from '@sveltejs/kit'
import { enforceSameOrigin } from '../../../../admin-api-helpers'

export async function GET(event: RequestEvent) {
	try {
		const env = await buildEnv(event.platform)
		const confirmationId = event.url.searchParams.get('id')
		if (!confirmationId) {
			return apiError('Missing confirmation id', { status: 400, code: 'missing_id' })
		}

		const booking = await getBookingByConfirmation(env.DB, confirmationId)
		if (!booking) {
			return apiError('Booking not found', { status: 404, code: 'not_found' })
		}

		return apiOk({
			id: booking.id,
			confirmationId: booking.confirmation_id,
			status: booking.status,
			eventTitle: booking.event_title,
			eventStart: booking.event_start,
			eventEnd: booking.event_end,
			activitySlug: booking.activity_slug
		})
	} catch (error) {
		if (error instanceof TransportValidationError) return apiValidationError(error)
		console.error('Booking lookup failed:', error)
		return apiError('Internal server error')
	}
}

export async function DELETE(event: RequestEvent) {
	try {
		const csrf = enforceSameOrigin(event)
		if (csrf) return csrf

		const env = await buildEnv(event.platform)
		const confirmationId = event.url.searchParams.get('id')
		if (!confirmationId) {
			return apiError('Missing confirmation id', { status: 400, code: 'missing_id' })
		}

		const userId = (event.locals as { user?: { id: string } }).user?.id
		if (!userId) {
			return apiError('Not authenticated', { status: 401, code: 'unauthorized' })
		}

		const result = await cancelBookingByConfirmation(env.DB, confirmationId, userId)
		if (!result.ok) {
			const status = result.code === 'not_found' ? 404 : result.code === 'forbidden' ? 403 : 400
			return apiError(`Booking ${result.code}`, { status, code: `booking_${result.code}` })
		}

		return apiOk({ ok: true })
	} catch (error) {
		if (error instanceof TransportValidationError) return apiValidationError(error)
		console.error('Booking cancellation failed:', error)
		return apiError('Internal server error')
	}
}
