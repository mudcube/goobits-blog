<script lang="ts">
	import type { OpenDay } from './types'
	import type { CalendarDay } from './types'
	import CalendarGrid from './CalendarGrid.svelte'
	import InlineClaim from './InlineClaim.svelte'
	import { createCalendarSurface, isSameDay, startOfDay } from './calendar-surface.svelte'

	let {
		activity,
		openDays,
		claimed = false,
		pendingDay = $bindable<OpenDay | null>(null),
		onSelectDay,
		onClaim,
		variant = 'compact',
		showHero = true
	}: {
		activity: { icon: string; label: string; tagline: string }
		openDays: OpenDay[]
		claimed?: boolean
		pendingDay?: OpenDay | null
		onSelectDay: (day: OpenDay) => void
		onClaim: (name: string) => void
		variant?: 'compact' | 'member'
		showHero?: boolean
	} = $props()

	const today = $derived(startOfDay(new Date()))
	const hasOpenDays = $derived(openDays.some(day => !isPast(day.date)))
	const isEntireMonthPast = $derived(openDays.length > 0 && openDays.every(day => isPast(day.date)))

	function findOpenDay(date: Date) {
		return openDays.find(od => isSameDay(od.date, date))
	}

	function isPast(date: Date) {
		return startOfDay(date) < today
	}

	function isToday(date: Date) {
		return isSameDay(date, today)
	}

	function isActive(date: Date) {
		return !!findOpenDay(date)
	}

	function eventCount(date: Date) {
		return findOpenDay(date)?.bookings.length ?? 0
	}

	const calendar = createCalendarSurface({
		isPast,
		isToday,
		isActive,
		eventCount,
		ariaLabel: (date) =>
			`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${isActive(date) && !isPast(date) ? ', available' : ''}`
	})

	function handleSelect(day: CalendarDay) {
		const match = findOpenDay(day.date)
		if (!match) return
		pendingDay = match
		if (claimed) onSelectDay(match)
	}
</script>

{#if showHero}
	<div class="cs__hero">
		<span class="cs__icon">{activity.icon}</span>
		<h2 class="cs__name">{activity.label}</h2>
	</div>
{/if}

<div class="cs__grid">
	<CalendarGrid
		days={calendar.days}
		weekdays={calendar.weekdays}
		monthLabel={calendar.monthLabel}
		selectedDate={pendingDay?.date ?? null}
		prevMonth={calendar.prevMonth}
		nextMonth={calendar.nextMonth}
		onSelect={handleSelect}
		{variant}
	/>
</div>

{#if !hasOpenDays}
	<div class="cs__empty">
		{#if isEntireMonthPast}
			<p class="cs__empty-title">This month has passed</p>
			<p class="cs__empty-sub">Navigate forward to find upcoming open days.</p>
		{:else}
			<p class="cs__empty-title">No open days this month</p>
			<p class="cs__empty-sub">Try checking next month, or ask the organizer to open more days.</p>
		{/if}
	</div>
{:else if variant !== 'member'}
	<div class="cs__legend">
		<span class="cs__legend-item"><span class="cs__dot"></span> Available</span>
		{#if openDays.some(day => day.bookings.length > 0)}<span class="cs__legend-item"><span class="cs__dot cs__dot--grn"></span> Others going</span>{/if}
	</div>
{/if}

{#if !claimed}
	<InlineClaim day={pendingDay?.date ?? null} {onClaim} />
{/if}

<style>
	.cs__hero { text-align: center; margin-bottom: 0.75rem; }
	.cs__icon { font-size: 1.5rem; display: block; margin-bottom: 0.1rem; }
	.cs__name { margin: 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.03em; }
	.cs__legend { display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem; }
	.cs__legend-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.58rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); }
	.cs__dot { width: 0.26rem; height: 0.26rem; border-radius: 999px; background: var(--book-accent, #a78bfa); }
	.cs__dot--grn { background: var(--book-dot-green, #4ade80); }
	.cs__empty { text-align: center; padding: 0.75rem 0; }
	.cs__empty-title { margin: 0; font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); }
	.cs__empty-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 38%, transparent); }
</style>
