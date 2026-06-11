import { test } from 'vitest'
import { runCalendarBookingCalendarSmoke } from './scripts/calendar-booking-calendar-smoke'

test('calendar booking calendar smoke', async () => {
	await runCalendarBookingCalendarSmoke()
}, 120_000)
