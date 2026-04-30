<script lang="ts">
	import { onMount } from 'svelte'
	import CalendarGrid from '../../booking/CalendarGrid.svelte'
	import type { CalendarDay } from '../../booking/types'
	import { createCalendarSurface, type CalendarWeekStart } from '../../booking/calendar-surface.svelte'
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
		compact = false,
		interactive = 'active-only'
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
		interactive?: 'active-only' | 'all-future'
	}>()

	function dotColorForTone(tone: string) {
		if (tone === 'circus') return '#ff7a59'
		if (tone === 'movies') return '#4fa8ff'
		if (tone === 'outdoors') return '#2eb67d'
		if (tone === 'gym') return '#a855f7'
		return ''
	}

	let weekStart = $state<AdminCalendarWeekStart>('monday')

	$effect(() => {
		if (!syncWeekStartPreference) weekStart = initialWeekStart === 'sunday' ? 'sunday' : 'monday'
	})

	const calendar = createCalendarSurface({
		weekStart: () => weekStart as CalendarWeekStart,
		isPast: (date) => isPast(date),
		isToday: (date) => isToday(date),
		isActive: (date) => isActive(date),
		eventCount: (date) => eventCount(date),
		dotColor: (date) => dotColorForTone(eventTone(date)) || '',
		title: () => title
	})

	$effect(() => {
		calendar.setMonth(currentMonth)
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
		days={calendar.days}
		weekdays={calendar.weekdays}
		monthLabel={calendar.monthLabel}
		{selectedDate}
		prevMonth={onPrev}
		nextMonth={onNext}
		onSelect={handleSelect}
		{interactive}
	/>
	{#if calendar.days.some(d => d.isActive && !d.isPast)}
		<div class="ac__legend">
			<span class="ac__legend-item"><span class="ac__dot-swatch" style="border-color:var(--cg-accent, var(--admin-accent));background:color-mix(in srgb, var(--cg-accent, var(--admin-accent)) 5%, transparent);"></span> Has events</span>
		</div>
	{/if}
</div>

<style>
	.ac { --cg-accent: var(--admin-accent, #a78bfa); padding: 1rem; border: 1px solid var(--admin-card-border); border-radius: 0.875rem; background: var(--admin-card-bg); margin-top: 1rem; }
	.ac--compact { font-size: 0.9em; }
	.ac__legend { display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem; }
	.ac__legend-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); }
	.ac__dot-swatch { width: 0.65rem; height: 0.65rem; border-radius: 0.15rem; border: 1px solid transparent; }
</style>
