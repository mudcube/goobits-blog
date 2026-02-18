import { deleteEvent } from '../providers/google/events.ts'
import { cancelBooking, getEventLinks, type D1DatabaseLike } from '../storage/d1.ts'

export async function cancelBookingAndEvents({
	db,
	accessToken,
	bookingId
}: {
	db: D1DatabaseLike
	accessToken: string
	bookingId: number
}) {
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
