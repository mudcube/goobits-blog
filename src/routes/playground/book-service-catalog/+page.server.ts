import type { PageServerLoad } from './$types'

export type Service = {
	id: string
	emoji: string
	name: string
	durationMin: number
	priceUsd: number
	description: string
}

export const load: PageServerLoad = async () => {
	const services: Service[] = [
		{
			id: 'cut',
			emoji: '✂️',
			name: 'Haircut',
			durationMin: 45,
			priceUsd: 65,
			description: 'Wash, cut, blow-dry.'
		},
		{
			id: 'color',
			emoji: '🎨',
			name: 'Single-process color',
			durationMin: 90,
			priceUsd: 145,
			description: 'Root touch-up or all-over color.'
		},
		{
			id: 'highlights',
			emoji: '✨',
			name: 'Highlights',
			durationMin: 150,
			priceUsd: 220,
			description: 'Foil or balayage with toner and gloss.'
		},
		{
			id: 'cut-color',
			emoji: '💇',
			name: 'Cut + color combo',
			durationMin: 180,
			priceUsd: 240,
			description: 'Full service — save $25 vs booking separately.'
		},
		{
			id: 'consult',
			emoji: '💬',
			name: 'Consultation',
			durationMin: 20,
			priceUsd: 0,
			description: 'Chat about goals before a bigger session.'
		}
	]
	return { services }
}
