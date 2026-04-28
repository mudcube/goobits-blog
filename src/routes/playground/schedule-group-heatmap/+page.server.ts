import type { PageServerLoad } from './$types'
import type { GroupDay, GroupPerson } from './types'
import { SLOT_LEN_MIN, HOUR_START, HOUR_END } from './types'

export const load: PageServerLoad = async () => {
	const days: GroupDay[] = [
		{ id: 'd1', label: 'Tue', dayLabel: 'Tuesday', dateLabel: 'Apr 1' },
		{ id: 'd2', label: 'Wed', dayLabel: 'Wednesday', dateLabel: 'Apr 2' },
		{ id: 'd3', label: 'Thu', dayLabel: 'Thursday', dateLabel: 'Apr 3' },
		{ id: 'd4', label: 'Fri', dayLabel: 'Friday', dateLabel: 'Apr 4' },
		{ id: 'd5', label: 'Sat', dayLabel: 'Saturday', dateLabel: 'Apr 5' }
	]

	const people: GroupPerson[] = [
		{
			id: 'p1',
			name: 'Mika',
			color: '#7a5af8',
			availableSlots: [
				...slotsFor('d1', 18, 22),
				...slotsFor('d3', 19, 22),
				...slotsFor('d4', 17, 23),
				...slotsFor('d5', 18, 23)
			]
		},
		{
			id: 'p2',
			name: 'Riley',
			color: '#ef6c5d',
			availableSlots: [
				...slotsFor('d2', 18, 21),
				...slotsFor('d3', 17, 22),
				...slotsFor('d4', 18, 22),
				...slotsFor('d5', 17, 22)
			]
		},
		{
			id: 'p3',
			name: 'Avery',
			color: '#22c55e',
			availableSlots: [
				...slotsFor('d1', 17, 20),
				...slotsFor('d3', 18, 22),
				...slotsFor('d4', 19, 23),
				...slotsFor('d5', 18, 21)
			]
		},
		{
			id: 'p4',
			name: 'Jordan',
			color: '#0ea5e9',
			availableSlots: [
				...slotsFor('d2', 17, 19),
				...slotsFor('d3', 18, 21),
				...slotsFor('d4', 18, 23),
				...slotsFor('d5', 17, 23)
			]
		},
		{
			id: 'p5',
			name: 'Sasha',
			color: '#eab308',
			availableSlots: [
				...slotsFor('d1', 19, 22),
				...slotsFor('d3', 19, 23),
				...slotsFor('d4', 17, 22),
				...slotsFor('d5', 19, 22)
			]
		}
	]

	return { days, people, slotLen: SLOT_LEN_MIN, hourStart: HOUR_START, hourEnd: HOUR_END }
}

function slotsFor(dayId: string, fromHour: number, toHour: number): string[] {
	const slots: string[] = []
	for (let m = fromHour * 60; m < toHour * 60; m += SLOT_LEN_MIN) {
		slots.push(`${dayId}:${m}`)
	}
	return slots
}
