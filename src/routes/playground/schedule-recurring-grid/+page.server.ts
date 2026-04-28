import type { PageServerLoad } from './$types'

export type RecurringSlot = {
	id: string
	day: number
	startMin: number
	durationMin: number
	title: string
	color: string
}

export const load: PageServerLoad = async () => {
	const slots: RecurringSlot[] = [
		{ id: 's1', day: 0, startMin: 9 * 60, durationMin: 60, title: 'Morning yoga', color: '#7a5af8' },
		{ id: 's2', day: 0, startMin: 18 * 60, durationMin: 60, title: 'Restorative', color: '#7a5af8' },
		{ id: 's3', day: 1, startMin: 7 * 60, durationMin: 45, title: 'Hot flow', color: '#ef6c5d' },
		{ id: 's4', day: 1, startMin: 12 * 60, durationMin: 45, title: 'Lunch yoga', color: '#7a5af8' },
		{ id: 's5', day: 2, startMin: 18 * 60, durationMin: 75, title: 'Power yoga', color: '#ef6c5d' },
		{ id: 's6', day: 3, startMin: 9 * 60, durationMin: 60, title: 'Morning yoga', color: '#7a5af8' },
		{ id: 's7', day: 3, startMin: 17 * 60 + 30, durationMin: 60, title: 'Beginner', color: '#22c55e' },
		{ id: 's8', day: 4, startMin: 7 * 60, durationMin: 45, title: 'Hot flow', color: '#ef6c5d' },
		{ id: 's9', day: 4, startMin: 18 * 60, durationMin: 60, title: 'Friday wind-down', color: '#7a5af8' },
		{ id: 's10', day: 5, startMin: 10 * 60, durationMin: 90, title: 'Weekend long', color: '#0ea5e9' },
		{ id: 's11', day: 6, startMin: 10 * 60, durationMin: 60, title: 'Sunday gentle', color: '#0ea5e9' }
	]
	return { slots, hourStart: 6, hourEnd: 21 }
}
