import type { PageServerLoad } from './$types'

export type Slot = {
	id: string
	startMin: number
	durationMin: number
	available: boolean
}

function buildSlots(): Slot[] {
	const slots: Slot[] = []
	const slotLen = 30
	for (let h = 9; h < 18; h++) {
		for (let m = 0; m < 60; m += slotLen) {
			const startMin = h * 60 + m
			const id = `s-${h}-${m}`
			const taken = (h === 11 && m === 30) || (h === 13 && m === 0) || (h === 13 && m === 30) || (h === 16 && m === 0)
			slots.push({ id, startMin, durationMin: slotLen, available: !taken })
		}
	}
	return slots
}

export const load: PageServerLoad = async () => {
	return {
		slots: buildSlots(),
		dateLabel: 'Saturday, April 4'
	}
}
