<script lang="ts">
	import { onMount } from 'svelte'
	import { ChevronLeft, ChevronRight } from '@lucide/svelte'
	import {
		CALENDAR_WEEK_START_CHANGED_EVENT,
		getAdminCalendarWeekStart,
		type AdminCalendarWeekStart
	} from '$lib/admin/calendar-preferences'

	type CalendarCell = {
		date: Date
		currentMonth: boolean
	}

	type CalendarSnapshot = {
		days: CalendarCell[]
		selectedDateIso: string | null
	}

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

	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	const MONTH_SLIDE_MS = 180
	let weekStart = $state<AdminCalendarWeekStart>('monday')
	let renderedMonth = $state(new Date(0))
	let renderedSelectedDateIso = $state<string | null>(null)
	let transitionSnapshot = $state<CalendarSnapshot | null>(null)
	let isMonthAnimating = $state(false)

	$effect(() => {
		if (syncWeekStartPreference) return
		weekStart = initialWeekStart === 'sunday' ? 'sunday' : 'monday'
	})

	const orderedWeekdays = $derived.by(() => {
		if (weekStart === 'sunday') return weekdays
		return [...weekdays.slice(1), weekdays[0]]
	})

	let monthDirection = $state(0)

	const monthLabel = $derived(
		title || currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	)

	function buildDays(month: Date, start: AdminCalendarWeekStart) {
		const first = new Date(month.getFullYear(), month.getMonth(), 1)
		const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
		const grid: CalendarCell[] = []

		const firstWeekday = first.getDay()
		const firstWeekdayOffset = start === 'monday' ? (firstWeekday + 6) % 7 : firstWeekday
		for (let i = 0; i < firstWeekdayOffset; i += 1) {
			const d = new Date(first)
			d.setDate(d.getDate() - (firstWeekdayOffset - i))
			grid.push({ date: d, currentMonth: false })
		}

		for (let day = 1; day <= last.getDate(); day += 1) {
			grid.push({
				date: new Date(month.getFullYear(), month.getMonth(), day),
				currentMonth: true
			})
		}

		let i = 1
		while (grid.length % 7 !== 0) {
			const d = new Date(last)
			d.setDate(d.getDate() + i)
			grid.push({ date: d, currentMonth: false })
			i += 1
		}

		return grid
	}

	const days = $derived.by(() => buildDays(currentMonth, weekStart))

	function isoDay(date: Date) {
		const y = date.getFullYear()
		const m = `${date.getMonth() + 1}`.padStart(2, '0')
		const d = `${date.getDate()}`.padStart(2, '0')
		return `${y}-${m}-${d}`
	}

	function clearAnimation() {
		isMonthAnimating = false
		transitionSnapshot = null
	}

	let clearAnimationTimer: number | null = null

	$effect(() => {
		const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
		const previousMonthMs = renderedMonth.getTime()
		const nextMonthMs = nextMonth.getTime()

		if (previousMonthMs === 0) {
			renderedMonth = nextMonth
			renderedSelectedDateIso = selectedDateIso
			return
		}

		if (nextMonthMs === previousMonthMs) {
			renderedSelectedDateIso = selectedDateIso
			return
		}

		monthDirection = nextMonthMs > previousMonthMs ? 1 : -1
		transitionSnapshot = {
			days: buildDays(renderedMonth, weekStart),
			selectedDateIso: renderedSelectedDateIso
		}
		renderedMonth = nextMonth
		renderedSelectedDateIso = selectedDateIso
		isMonthAnimating = true

		if (typeof window !== 'undefined') {
			if (clearAnimationTimer) clearTimeout(clearAnimationTimer)
			clearAnimationTimer = window.setTimeout(clearAnimation, MONTH_SLIDE_MS)
		}
	})

	onMount(() => {
		if (!syncWeekStartPreference) return
		weekStart = getAdminCalendarWeekStart()
		const onWeekStartChanged = (event: Event) => {
			const value = (event as CustomEvent<AdminCalendarWeekStart>).detail
			weekStart = value === 'sunday' ? 'sunday' : 'monday'
		}
		window.addEventListener(CALENDAR_WEEK_START_CHANGED_EVENT, onWeekStartChanged as EventListener)
		return () => {
			if (clearAnimationTimer) clearTimeout(clearAnimationTimer)
			window.removeEventListener(
				CALENDAR_WEEK_START_CHANGED_EVENT,
				onWeekStartChanged as EventListener
			)
		}
	})
</script>

{#snippet calendarGrid(daysToRender: CalendarCell[], selectedIso: string | null)}
	<div class="admin-calendar__grid">
		{#each daysToRender as day}
			{@const isDayPast = isPast(day.date)}
			{@const isDayToday = isToday(day.date)}
			{@const isDayActive = isActive(day.date)}
			{@const dayEventCount = Math.max(0, eventCount(day.date) || 0)}
			{@const dayTone = eventTone(day.date)}
			<button
				type="button"
				class="admin-calendar__day"
				class:admin-calendar__day--off={!day.currentMonth}
				class:admin-calendar__day--past={isDayPast}
				class:admin-calendar__day--today={isDayToday}
				class:admin-calendar__day--active={isDayActive}
				class:admin-calendar__day--selected={selectedIso === isoDay(day.date)}
				disabled={isDayPast || (!day.currentMonth && !isDayActive)}
				onclick={(event) => onSelect(day.date, event.currentTarget as HTMLButtonElement)}
			>
				<span class="admin-calendar__day-num">{day.date.getDate()}</span>
				{#if dayEventCount > 0}
					<span
						class="admin-calendar__event-dots"
						style={`--admin-calendar-dot-override: ${dotColorForTone(dayTone) || 'var(--admin-calendar-dot)'}`}
						aria-hidden="true"
					>
						<span class="admin-calendar__event-dot"></span>
						{#if dayEventCount > 1}
							<span class="admin-calendar__event-dot"></span>
						{/if}
					</span>
				{/if}
			</button>
		{/each}
	</div>
{/snippet}

<section
	class="admin-calendar"
	class:admin-calendar--compact={compact}
>
	<div class="admin-calendar__head">
		<div class="admin-calendar__nav">
			<button class="admin-calendar__arrow" type="button" aria-label="Previous month" onclick={onPrev}>
				<ChevronLeft size={18} strokeWidth={2} />
			</button>
		</div>
		<span class="admin-calendar__title">{monthLabel}</span>
		<div class="admin-calendar__nav">
			<button class="admin-calendar__arrow" type="button" aria-label="Next month" onclick={onNext}>
				<ChevronRight size={18} strokeWidth={2} />
			</button>
		</div>
	</div>

	<div class="admin-calendar__table">
		<div class="admin-calendar__weekdays">
			{#each orderedWeekdays as wd}
				<span>{wd}</span>
			{/each}
		</div>

		<div class="admin-calendar__grid-frame">
			{#if transitionSnapshot}
				<div
					class="admin-calendar__grid-layer admin-calendar__grid-layer--previous"
					class:admin-calendar__grid-layer--slide-out-left={isMonthAnimating && monthDirection > 0}
					class:admin-calendar__grid-layer--slide-out-right={isMonthAnimating && monthDirection < 0}
					aria-hidden="true"
				>
					{@render calendarGrid(transitionSnapshot.days, transitionSnapshot.selectedDateIso)}
				</div>
			{/if}

			<div
				class="admin-calendar__grid-layer admin-calendar__grid-layer--current"
				class:admin-calendar__grid-layer--slide-in-right={isMonthAnimating && monthDirection > 0}
				class:admin-calendar__grid-layer--slide-in-left={isMonthAnimating && monthDirection < 0}
			>
				{@render calendarGrid(days, selectedDateIso)}
			</div>
		</div>
	</div>
</section>

<style>
	.admin-calendar {
		width: 100%;
		font-family: var(--font-ui-sans, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
		background: transparent;
		padding: 0;
		--admin-calendar-border-uniform: var(
			--admin-calendar-grid-border,
			color-mix(in srgb, var(--admin-calendar-weekday-row-bg, #1f1f23) 26%, transparent)
		);
	}

	.admin-calendar--compact {
		width: 100%;
	}

	.admin-calendar__head {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
		padding: 0.25rem 0;
		margin-bottom: 0.55rem;
	}

	.admin-calendar__table {
		border: 1px solid var(--admin-calendar-border-uniform);
		border-radius: 0.5rem 0.5rem 1rem 1rem;
		overflow: hidden;
		background: transparent;
	}

	.admin-calendar__title {
		font-family: var(--font-display);
		font-size: clamp(1rem, 1.8vw, 1.35rem);
		font-weight: 500;
		min-width: 10rem;
		text-align: center;
	}

	.admin-calendar__nav {
		display: flex;
		gap: 0.25rem;
	}

	.admin-calendar__arrow {
		width: 32px;
		height: 32px;
		border-radius: 999px;
		border: 1px solid var(--admin-calendar-border-uniform);
		background: transparent;
		box-shadow: none;
		cursor: pointer;
		color: var(--admin-calendar-arrow-fg);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: background 0.15s, color 0.15s;
	}

	.admin-calendar__arrow:hover {
		color: var(--admin-calendar-arrow-hover-fg);
		background: transparent;
	}

	.admin-calendar__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-bottom: 0;
		border-bottom: 1px solid var(--admin-calendar-border-uniform);
		background: var(--admin-calendar-weekday-row-bg, #1f1f23);
	}

	.admin-calendar__weekdays span {
		text-align: right;
		font-size: 0.68rem;
		font-weight: 600;
		font-family: inherit;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--admin-calendar-weekday-row-fg, #f7f7fb);
		padding: 0.28rem 0.45rem 0.28rem 0;
		border-right: 1px solid var(--admin-calendar-border-uniform);
	}

	.admin-calendar__weekdays span:last-child {
		border-right: 0;
	}

	.admin-calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0;
	}

	.admin-calendar__grid-frame {
		display: grid;
		overflow: clip;
	}

	.admin-calendar__grid-layer {
		grid-area: 1 / 1;
		min-width: 0;
	}

	.admin-calendar__grid-layer--current {
		z-index: 1;
	}

	.admin-calendar__grid-layer--previous {
		z-index: 2;
		pointer-events: none;
	}

	.admin-calendar__day {
		position: relative;
		aspect-ratio: 1;
		border: 0;
		border-right: 1px solid var(--admin-calendar-border-uniform);
		border-bottom: 1px solid var(--admin-calendar-border-uniform);
		border-radius: 0;
		background: transparent;
		cursor: pointer;
		transition: background 120ms ease, border-radius 120ms ease, box-shadow 120ms ease;
	}

	.admin-calendar__day:nth-child(7n) {
		border-right: 0;
	}

	.admin-calendar__day:nth-last-child(-n + 7) {
		border-bottom: 0;
	}

	.admin-calendar__day:hover:not(.admin-calendar__day--past) {
		background: var(--admin-calendar-day-hover);
	}

	.admin-calendar__day--off {
		background: transparent;
	}

	.admin-calendar__day--off .admin-calendar__day-num {
		opacity: 1;
	}

	.admin-calendar__day--past {
		pointer-events: none;
	}

	.admin-calendar__day--past .admin-calendar__day-num {
		opacity: 0.5;
	}

	.admin-calendar__day-num {
		position: absolute;
		top: 0.68rem;
		right: 0.68rem;
		font-size: 0.95rem;
		font-weight: 500;
		font-family: inherit;
		line-height: 1;
	}

	.admin-calendar__event-dots {
		position: absolute;
		right: 0.6rem;
		bottom: 0.44rem;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}

	.admin-calendar__event-dot {
		width: 0.36rem;
		height: 0.36rem;
		border-radius: 999px;
		background: var(--admin-calendar-dot-override, var(--admin-calendar-dot));
	}

	.admin-calendar__day--today .admin-calendar__day-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 999px;
		border: 1px solid var(--admin-calendar-border-uniform);
		background: transparent;
		font-weight: 600;
		top: 0.48rem;
		right: 0.48rem;
	}

	.admin-calendar__day--selected {
		background: var(--admin-calendar-selected-bg);
		box-shadow:
			inset 0 0 0 1px var(--admin-calendar-selected-border),
			0 0 0 2px var(--admin-calendar-selected-ring);
		border-radius: 0.7rem;
		z-index: 1;
	}

	.admin-calendar__grid-layer--slide-in-right {
		animation: admin-calendar-slide-in-right 180ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.admin-calendar__grid-layer--slide-in-left {
		animation: admin-calendar-slide-in-left 180ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.admin-calendar__grid-layer--slide-out-left {
		animation: admin-calendar-slide-out-left 180ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	.admin-calendar__grid-layer--slide-out-right {
		animation: admin-calendar-slide-out-right 180ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	@keyframes admin-calendar-slide-in-right {
		from {
			transform: translateX(16px);
			opacity: 0.16;
		}

		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes admin-calendar-slide-in-left {
		from {
			transform: translateX(-16px);
			opacity: 0.16;
		}

		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes admin-calendar-slide-out-left {
		from {
			transform: translateX(0);
			opacity: 1;
		}

		to {
			transform: translateX(-16px);
			opacity: 0;
		}
	}

	@keyframes admin-calendar-slide-out-right {
		from {
			transform: translateX(0);
			opacity: 1;
		}

		to {
			transform: translateX(16px);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.admin-calendar__grid-layer--slide-in-right,
		.admin-calendar__grid-layer--slide-in-left,
		.admin-calendar__grid-layer--slide-out-left,
		.admin-calendar__grid-layer--slide-out-right {
			animation: none;
		}
	}

	@media (max-width: 720px) {
		.admin-calendar__title {
			min-width: 8.5rem;
		}
	}
</style>
