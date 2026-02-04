const FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy'

export async function getFreeBusy({
	accessToken,
	timeMin,
	timeMax,
	calendarIds
}: {
	accessToken: string
	timeMin: string
	timeMax: string
	calendarIds: string[]
}) {
	const res = await fetch(FREEBUSY_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify({
			timeMin,
			timeMax,
			items: calendarIds.map(id => ({ id }))
		})
	})

	if (!res.ok) {
		const errText = await res.text()
		throw new Error(`Google freeBusy failed: ${res.status} ${errText}`)
	}

	const data = await res.json()
	const busy: Array<{ start: string; end: string }> = []
	for (const calId of calendarIds) {
		const entries = data.calendars?.[calId]?.busy ?? []
		for (const entry of entries) {
			busy.push({ start: entry.start, end: entry.end })
		}
	}

	return { busy }
}
