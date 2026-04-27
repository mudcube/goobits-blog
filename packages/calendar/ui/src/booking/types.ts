export type Person = { name: string; color: string; start: number; end: number }
export type PersonRow = Person[]

export type OpenDay = {
	date: Date
	eventId?: number
	bookings: Person[]
	windowStart: number
	windowEnd: number
	maxDuration: number
	capacity: number
}

export type Step = 'calendar' | 'claim' | 'day' | 'done'
