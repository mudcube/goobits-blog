import type { RequestEvent } from '@sveltejs/kit'
import { buildEnv } from '@calendar/kit'
import { getCalendarConfig, listUpcomingEvents } from '@calendar/core'
import { requireCalendarUserId } from '@calendar/kit'

function escapeIcsText(value: string) {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/,/g, '\\,')
		.replace(/;/g, '\\;')
}

function toIcsDate(value: string) {
	return value.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export async function GET(event: RequestEvent) {
	const calendarConfig = getCalendarConfig()
	const user = requireCalendarUserId(event)
	if (user.response) return user.response
	const userId = user.userId

	const env = await buildEnv(event.platform)
	const events = await listUpcomingEvents(env.DB, userId, true)

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:${calendarConfig.ics.productId}`,
		'CALSCALE:GREGORIAN'
	]

	for (const eventItem of events) {
		if (eventItem.userStatus !== 'joined') continue
		lines.push('BEGIN:VEVENT')
		lines.push(`UID:${calendarConfig.ics.uidPrefix}-${eventItem.id}@${calendarConfig.ics.uidDomain}`)
		lines.push(`DTSTAMP:${toIcsDate(new Date().toISOString())}`)
		lines.push(`DTSTART:${toIcsDate(eventItem.startsAt)}`)
		lines.push(`DTEND:${toIcsDate(eventItem.endsAt)}`)
		lines.push(`SUMMARY:${escapeIcsText(eventItem.title)}`)
		lines.push(`DESCRIPTION:${escapeIcsText(`${eventItem.activityLabel} session`)}`)
		if (eventItem.location) lines.push(`LOCATION:${escapeIcsText(eventItem.location)}`)
		lines.push('END:VEVENT')
	}
	lines.push('END:VCALENDAR')

	return new Response(lines.join('\r\n'), {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `inline; filename="${calendarConfig.ics.filename}"`,
			'Cache-Control': 'no-store, max-age=0'
		}
	})
}
