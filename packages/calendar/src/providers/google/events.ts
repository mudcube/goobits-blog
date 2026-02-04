const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars'

export async function createEvent({
	accessToken,
	calendarId,
	event
}: {
	accessToken: string
	calendarId: string
	event: any
}) {
	const res = await fetch(`${CALENDAR_BASE}/${encodeURIComponent(calendarId)}/events`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify(event)
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Google create event failed: ${res.status} ${errText}`)
	}

	const data = await res.json()
	return { id: data.id, htmlLink: data.htmlLink }
}

export async function deleteEvent({
	accessToken,
	calendarId,
	eventId
}: {
	accessToken: string
	calendarId: string
	eventId: string
}) {
	const res = await fetch(`${CALENDAR_BASE}/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})

	if (!res.ok && res.status !== 404) {
		const errText = await res.text()
		throw new Error(`Google delete event failed: ${res.status} ${errText}`)
	}
}
