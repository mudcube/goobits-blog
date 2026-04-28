import type { PageServerLoad } from './$types'

export type Resource = {
	id: string
	name: string
	detail: string
	available: boolean
}

export type ResourceGroup = {
	id: string
	label: string
	required: boolean
	multiple: boolean
	resources: Resource[]
}

export const load: PageServerLoad = async () => {
	const groups: ResourceGroup[] = [
		{
			id: 'room',
			label: 'Room',
			required: true,
			multiple: false,
			resources: [
				{ id: 'r-a', name: 'Studio A', detail: 'Window light · 240 sqft', available: true },
				{ id: 'r-b', name: 'Studio B', detail: 'Blackout · 180 sqft', available: true },
				{ id: 'r-c', name: 'Studio C', detail: 'Cyc wall · 320 sqft', available: false }
			]
		},
		{
			id: 'crew',
			label: 'Crew',
			required: true,
			multiple: true,
			resources: [
				{ id: 'c-mika', name: 'Mika', detail: 'Lead stylist', available: true },
				{ id: 'c-jules', name: 'Jules', detail: 'Color specialist', available: true },
				{ id: 'c-tay', name: 'Tay', detail: 'Assistant', available: true }
			]
		},
		{
			id: 'equipment',
			label: 'Equipment',
			required: false,
			multiple: true,
			resources: [
				{ id: 'e-projector', name: 'Projector', detail: '4K · ceiling mount', available: true },
				{ id: 'e-mic', name: 'Lavalier mic kit', detail: '2 channels', available: true },
				{ id: 'e-tripod', name: 'Tripod', detail: 'Carbon · max 12 kg', available: false }
			]
		}
	]
	return { groups }
}
