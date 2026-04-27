<script lang="ts">
	import { onMount } from 'svelte'
	import CalendarGrid from '../../booking/CalendarGrid.svelte'
	import type { CalendarDay } from '../../booking/types'
	import {
		CALENDAR_WEEK_START_CHANGED_EVENT,
		getAdminCalendarWeekStart,
		type AdminCalendarWeekStart
	} from '../shared/calendar-preferences'

	const {
		currentMonth,
		selectedDateIso = null,
		title = '',
		initialWeekStart = 'monday',
		syncWeekStartPreference = true,
		onPrev,
		onNext,
		onSelect,
		isPast,
		isToday,
		isActive,
		eventCount = () => 0,
		eventTone = () => '',
		compact = false
	} = $props<{
		currentMonth: Date
		selectedDateIso?: string | null
		title?: string
		initialWeekStart?: AdminCalendarWeekStart
		syncWeekStartPreference?: boolean
		onPrev: () => void
		onNext: () => void
		onSelect: (date: Date, element: HTMLButtonElement) => void
		isPast: (date: Date) => boolean
		isToday: (date: Date) => boolean
		isActive: (date: Date) => boolean
		eventCount?: (date: Date) => number
		eventTone?: (date: Date) => string
		compact?: boolean
	}>()

	function dotColorForTone(tone: string) {
		if (tone === 'circus') return '#ff7a59'
		if (tone === 'movies') return '#4fa8ff'
		if (tone === 'outdoors') return '#2eb67d'
		if (tone === 'gym') return '#a855f7'
		return ''
	}

	const WEEKDAYS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	const WEEKDAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	let weekStart = $state<AdminCalendarWeekStart>('monday')

	$effect(() => {
		if (!syncWeekStartPreference) weekStart = initialWeekStart === 'sunday' ? 'sunday' : 'monday'
	})

	const weekdays = $derived(weekStart === 'sunday' ? WEEKDAYS_SUN : WEEKDAYS_MON)

	const monthLabel = $derived(
		title || currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	)

	const gridDays = $derived.by((): CalendarDay[] => {
		const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
		const last = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
		const days: CalendarDay[] = []

		const firstWeekday = first.getDay()
		const offset = weekStart === 'monday' ? (firstWeekday + 6) % 7 : firstWeekday
		for (let i = 0; i < offset; i++) {
			const d = new Date(first)
			d.setDate(d.getDate() - (offset - i))
			days.push({ date: d, inMonth: false, isToday: false, isActive: false, isPast: true })
		}

		for (let day = 1; day <= last.getDate(); day++) {
			const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
			const tone = eventTone(d)
			days.push({
				date: d,
				inMonth: true,
				isToday: isToday(d),
				isActive: isActive(d),
				isPast: isPast(d),
				dotCount: eventCount(d),
				dotColor: dotColorForTone(tone) || '',
			})
		}

		let pad = 1
		while (days.length % 7 !== 0) {
			const d = new Date(last)
			d.setDate(d.getDate() + pad++)
			days.push({ date: d, inMonth: false, isToday: false, isActive: false, isPast: false })
		}

		return days
	})

	const selectedDate = $derived.by(() => {
		if (!selectedDateIso) return null
		const [y, m, d] = selectedDateIso.split('-').map(Number)
		return new Date(y!, m! - 1, d!)
	})

	function handleSelect(day: CalendarDay, element: HTMLButtonElement) {
		onSelect(day.date, element)
	}

	onMount(() => {
		if (!syncWeekStartPreference) return
		weekStart = getAdminCalendarWeekStart()
		const onChanged = (event: Event) => {
			weekStart = (event as CustomEvent<AdminCalendarWeekStart>).detail === 'sunday' ? 'sunday' : 'monday'
		}
		window.addEventListener(CALENDAR_WEEK_START_CHANGED_EVENT, onChanged as EventListener)
		return () => window.removeEventListener(CALENDAR_WEEK_START_CHANGED_EVENT, onChanged as EventListener)
	})
</script>

<div class="ac" class:ac--compact={compact}>
	<CalendarGrid
		days={gridDays}
		{weekdays}
		{monthLabel}
		{selectedDate}
		prevMonth={onPrev}
		nextMonth={onNext}
		onSelect={handleSelect}
	/>
</div>

<style>
	.ac { --cg-accent: var(--admin-accent, #a78bfa); padding: 1rem; border: 1px solid var(--admin-card-border); border-radius: 0.875rem; background: var(--admin-card-bg); }
	.ac--compact { font-size: 0.9em; }
</style>
