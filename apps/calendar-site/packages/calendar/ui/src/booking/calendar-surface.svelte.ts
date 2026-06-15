import type { CalendarDay, CalendarDayCapacity } from './types'

export type CalendarWeekStart = 'monday' | 'sunday'
export type CalendarTone = '' | 'circus' | 'movies' | 'outdoors' | 'gym'

type CalendarSurfaceOptions = {
	initialMonth?: Date
	weekStart?: () => CalendarWeekStart
	isPast: (date: Date) => boolean
	isToday: (date: Date) => boolean
	isActive: (date: Date) => boolean
	eventCount?: (date: Date) => number
	dotColor?: (date: Date) => string
	/** Per-dot colors for mixed-activity days. Takes precedence over `dotColor` when non-empty. */
	dotColors?: (date: Date) => string[]
	ariaLabel?: (date: Date) => string
	title?: () => string
	/** Optional: return capacity info to render the chip indicator instead of dots. */
	capacity?: (date: Date) => CalendarDayCapacity | null | undefined
}

const WEEKDAYS_MONDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAYS_SUNDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function startOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Re-export canonical date helpers so admin + booking share one
// implementation. isSameDay lives in @calendar/ui/shared/date-checks;
// isoDay lives in @calendar/core/utils.
export { isSameDay } from '../shared/date-checks'
export { isoDay } from '@calendar/core/utils'

export function dominantAxisValue(vector: [number, number, number]) {
	return Math.abs(vector[1]) >= Math.abs(vector[0]) ? vector[1] : vector[0]
}

export function dotColorForTone(tone: CalendarTone) {
	if (tone === 'circus') return '#ff7a59'
	if (tone === 'movies') return '#4fa8ff'
	if (tone === 'outdoors') return '#2eb67d'
	if (tone === 'gym') return '#a855f7'
	return ''
}

function weekdaysFor(weekStart: CalendarWeekStart) {
	return weekStart === 'sunday' ? WEEKDAYS_SUNDAY : WEEKDAYS_MONDAY
}

function leadingOffset(firstDay: Date, weekStart: CalendarWeekStart) {
	const weekday = firstDay.getDay()
	return weekStart === 'sunday' ? weekday : (weekday + 6) % 7
}

export function createCalendarSurface({
	initialMonth = new Date(),
	weekStart = () => 'monday',
	isPast,
	isToday,
	isActive,
	eventCount = () => 0,
	dotColor = () => '',
	dotColors,
	ariaLabel,
	title = () => '',
	capacity
}: CalendarSurfaceOptions) {
	let currentMonth = $state(startOfMonth(initialMonth))

	const weekdays = $derived(weekdaysFor(weekStart()))
	const monthLabel = $derived(
		title() || currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	)

	const days = $derived.by((): CalendarDay[] => {
		const first = startOfMonth(currentMonth)
		const last = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
		const cells: CalendarDay[] = []
		const offset = leadingOffset(first, weekStart())

		for (let i = 0; i < offset; i++) {
			const date = new Date(first)
			date.setDate(date.getDate() - (offset - i))
			cells.push(toCalendarDay(date, false))
		}

		for (let day = 1; day <= last.getDate(); day++) {
			cells.push(toCalendarDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), true))
		}

		let trailingDay = 1
		while (cells.length % 7 !== 0) {
			cells.push(toCalendarDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, trailingDay), false))
			trailingDay += 1
		}

		return cells
	})

	function toCalendarDay(date: Date, inMonth: boolean): CalendarDay {
		const day: CalendarDay = {
			date,
			inMonth,
			isToday: isToday(date),
			isActive: isActive(date),
			isPast: isPast(date),
			dotCount: eventCount(date)
		}
		const color = dotColor(date)
		const colors = dotColors?.(date)
		const label = ariaLabel?.(date)
		const cap = capacity?.(date)
		if (color) day.dotColor = color
		if (colors && colors.some(Boolean)) day.dotColors = colors
		if (label) day.ariaLabel = label
		if (cap) day.capacity = cap
		return day
	}

	function prevMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
	}

	function setMonth(date: Date) {
		currentMonth = startOfMonth(date)
	}

	return {
		get currentMonth() {
			return currentMonth
		},
		get weekdays() {
			return weekdays
		},
		get monthLabel() {
			return monthLabel
		},
		get days() {
			return days
		},
		prevMonth,
		nextMonth,
		setMonth
	}
}
