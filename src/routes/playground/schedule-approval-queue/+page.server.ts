import type { PageServerLoad } from './$types'

export type ApprovalRequest = {
	id: string
	requesterName: string
	requesterEmail: string
	eventTitle: string
	eventTime: string
	requestedAt: string
	note?: string
}

export const load: PageServerLoad = async () => {
	const requests: ApprovalRequest[] = [
		{
			id: 'r1',
			requesterName: 'Sasha Kim',
			requesterEmail: 'sasha@example.com',
			eventTitle: 'Portrait session — 90 min',
			eventTime: 'Sat Apr 4, 3:00pm',
			requestedAt: '14 min ago',
			note: 'Prefer outdoor light if weather allows.'
		},
		{
			id: 'r2',
			requesterName: 'Theo Bennett',
			requesterEmail: 'theo@example.com',
			eventTitle: 'Studio rehearsal — 2 hr',
			eventTime: 'Sun Apr 5, 11:00am',
			requestedAt: '1 hour ago'
		},
		{
			id: 'r3',
			requesterName: 'Iris Wong',
			requesterEmail: 'iris@example.com',
			eventTitle: 'Mixing review — 60 min',
			eventTime: 'Mon Apr 6, 4:30pm',
			requestedAt: '3 hours ago',
			note: 'Bringing reference tracks on USB.'
		}
	]
	return { requests }
}
