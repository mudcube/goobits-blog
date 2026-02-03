import { deleteEvent } from '../providers/google/events.js'
import { cancelBooking, getEventLinks } from '../storage/d1.js'

export async function cancelBookingAndEvents({ db, accessToken, bookingId }) {
	const links = await getEventLinks({ db, bookingId })
	for (const link of links) {
		if (link.provider === 'google') {
			await deleteEvent({
				accessToken,
				calendarId: link.calendar_id,
				eventId: link.event_id
			})
		}
	}

	await cancelBooking({ db, bookingId })
}
