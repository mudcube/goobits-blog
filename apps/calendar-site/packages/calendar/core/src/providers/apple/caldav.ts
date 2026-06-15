export type AppleCalDavConnection = {
	username: string
	appPassword: string
	calendarUrl: string
}

export type AppleCalendarEventInput = {
	uid: string
	summary: string
	description?: string
	startsAt: string
	endsAt: string
	location?: string | null
}

function normalizeCalendarUrl(calendarUrl: string) {
	const trimmed = calendarUrl.trim()
	const parsed = new URL(trimmed)
	if (parsed.protocol !== 'https:') {
		throw new Error('Apple CalDAV calendar URL must use HTTPS')
	}
	const host = parsed.hostname.toLowerCase()
	if (host !== 'caldav.icloud.com' && !host.endsWith('.caldav.icloud.com')) {
		throw new Error('Apple CalDAV calendar URL host is not allowed')
	}
	const normalized = parsed.toString()
	return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function escapeText(value: string) {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
}

function formatIcsDate(value: string) {
	const date = new Date(value)
	if (!Number.isFinite(date.getTime())) throw new Error('Invalid Apple CalDAV event date')
	return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function basicAuth(connection: AppleCalDavConnection) {
	return `Basic ${btoa(`${connection.username}:${connection.appPassword}`)}`
}

export function buildAppleEventIcs(event: AppleCalendarEventInput) {
	const now = formatIcsDate(new Date().toISOString())
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//MIKO.ART//Calendar Sync//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${escapeText(event.uid)}`,
		`DTSTAMP:${now}`,
		`DTSTART:${formatIcsDate(event.startsAt)}`,
		`DTEND:${formatIcsDate(event.endsAt)}`,
		`SUMMARY:${escapeText(event.summary)}`,
		event.description ? `DESCRIPTION:${escapeText(event.description)}` : '',
		event.location ? `LOCATION:${escapeText(event.location)}` : '',
		'END:VEVENT',
		'END:VCALENDAR'
	].filter(Boolean)
	return `${lines.join('\r\n')}\r\n`
}

export async function appleCreateEvent({
	connection,
	event
}: {
	connection: AppleCalDavConnection
	event: AppleCalendarEventInput
}) {
	const calendarUrl = normalizeCalendarUrl(connection.calendarUrl)
	const eventId = `${event.uid}.ics`
	const url = new URL(encodeURIComponent(eventId), calendarUrl).toString()
	const res = await fetch(url, {
		method: 'PUT',
		headers: {
			Authorization: basicAuth(connection),
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-None-Match': '*'
		},
		body: buildAppleEventIcs(event)
	})

	if (!res.ok && res.status !== 412) {
		const errText = await res.text()
		throw new Error(`Apple CalDAV create event failed: ${res.status} ${errText}`)
	}

	return { id: eventId, htmlLink: null as string | null }
}

export async function appleDeleteEvent({
	connection,
	eventId
}: {
	connection: AppleCalDavConnection
	eventId: string
}) {
	const calendarUrl = normalizeCalendarUrl(connection.calendarUrl)
	const url = new URL(encodeURIComponent(eventId), calendarUrl).toString()
	const res = await fetch(url, {
		method: 'DELETE',
		headers: {
			Authorization: basicAuth(connection)
		}
	})

	if (!res.ok && res.status !== 404) {
		const errText = await res.text()
		throw new Error(`Apple CalDAV delete event failed: ${res.status} ${errText}`)
	}
}
