const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

export type OutlookCalendarEventInput = {
	subject: string
	body?: { contentType: 'text' | 'html'; content: string }
	start: { dateTime: string; timeZone: string }
	end: { dateTime: string; timeZone: string }
	location?: { displayName: string }
	showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown'
}

function calendarEventsUrl(calendarId?: string | null) {
	if (!calendarId) return `${GRAPH_BASE}/me/events`
	return `${GRAPH_BASE}/me/calendars/${encodeURIComponent(calendarId)}/events`
}

export async function createOutlookEvent({
	accessToken,
	calendarId,
	event
}: {
	accessToken: string
	calendarId?: string | null
	event: OutlookCalendarEventInput
}) {
	const res = await fetch(calendarEventsUrl(calendarId), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify(event)
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Outlook create event failed: ${res.status} ${errText}`)
	}

	const data = await res.json()
	return { id: String(data.id || ''), htmlLink: typeof data.webLink === 'string' ? data.webLink : null }
}

export async function deleteOutlookEvent({
	accessToken,
	eventId
}: {
	accessToken: string
	eventId: string
}) {
	const res = await fetch(`${GRAPH_BASE}/me/events/${encodeURIComponent(eventId)}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})

	if (!res.ok && res.status !== 404) {
		const errText = await res.text()
		throw new Error(`Outlook delete event failed: ${res.status} ${errText}`)
	}
}
