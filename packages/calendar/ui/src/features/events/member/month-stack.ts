export type CalendarTone = '' | 'circus' | 'movies' | 'outdoors' | 'gym'

export type CalendarCell = {
	date: Date
	currentMonth: boolean
}

export type MonthItem = {
	key: string
	date: Date
	label: string
	cells: CalendarCell[]
}

export function startOfMonth(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addMonths(date: Date, count: number) {
	return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

export function isSameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}

export function isoDay(date: Date) {
	const y = date.getFullYear()
	const m = `${date.getMonth() + 1}`.padStart(2, '0')
	const d = `${date.getDate()}`.padStart(2, '0')
	return `${y}-${m}-${d}`
}

export function monthKey(date: Date) {
	return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
}

export function buildMonthCells(month: Date) {
	const first = startOfMonth(month)
	const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
	const cells: CalendarCell[] = []
	const firstWeekdayOffset = (first.getDay() + 6) % 7

	for (let i = 0; i < firstWeekdayOffset; i += 1) {
		const date = new Date(first)
		date.setDate(date.getDate() - (firstWeekdayOffset - i))
		cells.push({ date, currentMonth: false })
	}

	for (let day = 1; day <= last.getDate(); day += 1) {
		cells.push({
			date: new Date(month.getFullYear(), month.getMonth(), day),
			currentMonth: true
		})
	}

	let trailingDay = 1
	while (cells.length % 7 !== 0) {
		cells.push({
			date: new Date(month.getFullYear(), month.getMonth() + 1, trailingDay),
			currentMonth: false
		})
		trailingDay += 1
	}

	return cells
}

export function buildMonthItem(month: Date): MonthItem {
	return {
		key: monthKey(month),
		date: month,
		label: month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
		cells: buildMonthCells(month)
	}
}

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
