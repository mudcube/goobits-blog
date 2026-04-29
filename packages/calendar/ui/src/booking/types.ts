export type Person = { name: string; color: string; start: number; end: number }
export type PersonRow = Person[]

export type OpenDay = {
	date: Date
	mode?: 'range' | 'preset'
	eventId?: number
	slots?: BookingSlot[]
	bookings: Person[]
	windowStart: number
	windowEnd: number
	maxDuration: number
	capacity: number
}

export type BookingSlot = {
	id: number | string
	label: string
	start: number
	end: number
	seatsLeft?: number
	capacity?: number
	waitlistCount?: number
	userStatus?: string | null
	eventId?: number
}

export type Step = 'calendar' | 'claim' | 'day' | 'done'

export type TourStep = {
	selector: string
	message: string
	position?: 'top' | 'bottom'
	phase: number
}

export type CalendarDay = {
	date: Date
	inMonth: boolean
	isToday: boolean
	isActive: boolean
	isPast: boolean
	dotCount?: number
	dotColor?: string
	ariaLabel?: string
}
