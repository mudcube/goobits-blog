import { addMinutes, overlaps } from '../utils/time.ts'

export function buildSlots({
	timeMin,
	timeMax,
	slotMinutes,
	bufferMinutes,
	capacityPerSlot,
	busy,
	bookings
}: {
	timeMin: string
	timeMax: string
	slotMinutes: number
	bufferMinutes: number
	capacityPerSlot: number
	busy: Array<{ start: string; end: string }>
	bookings: Array<{ start_at: string; end_at: string; seats?: number | null }>
}) {
	const slots: Array<{ start: string; end: string; available: boolean; remaining: number }> = []
	let cursor = new Date(timeMin).toISOString()
	const end = new Date(timeMax).toISOString()

	const bufferedBusy = busy.map(range => ({
		start: addMinutes(range.start, -bufferMinutes),
		end: addMinutes(range.end, bufferMinutes)
	}))

	while (new Date(cursor) < new Date(end)) {
		const slotStart = cursor
		const slotEnd = addMinutes(slotStart, slotMinutes)

		if (new Date(slotEnd) > new Date(end)) break

		const isBusy = bufferedBusy.some(range => overlaps(slotStart, slotEnd, range.start, range.end))

		const seatsBooked = bookings
			.filter(booking => overlaps(slotStart, slotEnd, booking.start_at, booking.end_at))
			.reduce((sum, booking) => sum + (booking.seats ?? 1), 0)

		const remaining = Math.max(0, capacityPerSlot - seatsBooked)

		slots.push({
			start: slotStart,
			end: slotEnd,
			available: !isBusy && remaining > 0,
			remaining
		})

		cursor = addMinutes(slotStart, slotMinutes)
	}

	return slots
}
