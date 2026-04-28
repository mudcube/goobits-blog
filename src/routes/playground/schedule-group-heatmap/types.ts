export type GroupPerson = {
	id: string
	name: string
	color: string
	availableSlots: string[]
}

export type GroupDay = {
	id: string
	label: string
	dayLabel: string
	dateLabel: string
}

export const SLOT_LEN_MIN = 30
export const HOUR_START = 17
export const HOUR_END = 23
