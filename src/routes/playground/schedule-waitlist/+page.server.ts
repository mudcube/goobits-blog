import type { PageServerLoad } from './$types'

export type WaitlistEntry = {
	id: string
	name: string
	requestedAt: string
	eventTitle: string
	notifyChannel: 'email' | 'sms'
}

export const load: PageServerLoad = async () => {
	const entries: WaitlistEntry[] = [
		{ id: 'w1', name: 'Riley Cho', requestedAt: '2 hours ago', eventTitle: 'Sunday Yoga · 9:00am', notifyChannel: 'email' },
		{ id: 'w2', name: 'Marco Vidal', requestedAt: '5 hours ago', eventTitle: 'Sunday Yoga · 9:00am', notifyChannel: 'sms' },
		{ id: 'w3', name: 'Avery Park', requestedAt: 'yesterday', eventTitle: 'Studio Recording · Mar 12', notifyChannel: 'email' },
		{ id: 'w4', name: 'Jordan Liu', requestedAt: '2 days ago', eventTitle: 'Studio Recording · Mar 12', notifyChannel: 'email' }
	]
	return { entries }
}
