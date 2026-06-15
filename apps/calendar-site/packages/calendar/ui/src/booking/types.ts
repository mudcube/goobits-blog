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

export type CalendarDayCapacity = {
	filled: number
	capacity: number
	/** When true, render as a recurring (purple) chip; when false, neutral/once-off styling. */
	recurring?: boolean
}

export type CalendarDay = {
	date: Date
	inMonth: boolean
	isToday: boolean
	isActive: boolean
	isPast: boolean
	dotCount?: number
	dotColor?: string
	/** Per-dot colors for mixed-activity days. When set, takes precedence over `dotColor`. */
	dotColors?: string[]
	ariaLabel?: string
	/** Optional capacity-utilization indicator. When present, renders a chip + progress bar in the cell instead of (or in addition to) dots. */
	capacity?: CalendarDayCapacity
}
