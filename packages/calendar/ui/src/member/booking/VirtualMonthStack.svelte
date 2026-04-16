<script lang="ts">
	import { browser, dev } from '$app/environment'
	import { onMount } from 'svelte'
	import MonthGrid from './MonthGrid.svelte'
	import {
		addMonths,
		buildMonthItem,
		startOfMonth,
		type CalendarTone
	} from './month-stack'
	import { createWheelMonthPager } from './wheel-month-pager'

	const WHEEL_TRIGGER_DELTA = 48
	const SAME_DIRECTION_REARM_GAP_MS = 700

	const {
		selectedDateIso = null,
		onSelect,
		isPast,
		isToday,
		isActive,
		eventCount = () => 0,
		eventTone = () => '',
		testId = 'member-calendar'
	} = $props<{
		selectedDateIso?: string | null
		onSelect: (date: Date, element: HTMLButtonElement) => void
		isPast: (date: Date) => boolean
		isToday: (date: Date) => boolean
		isActive: (date: Date) => boolean
		eventCount?: (date: Date) => number
		eventTone?: (date: Date) => CalendarTone
		testId?: string
	}>()

	const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	let viewportElement = $state<HTMLDivElement | null>(null)
	let currentMonth = $state(startOfMonth(new Date()))
	let isPaging = $state(false)
	let lastPageDirection = $state<1 | -1 | 0>(0)
	let currentGestureStartGap = $state(Number.POSITIVE_INFINITY)
	let wheelGestureConsumed = $state(false)
	let debugEnabled = $state(false)
	let debugEntries = $state<string[]>([])

	function pushDebug(message: string) {
		if (!debugEnabled) return
		const stamped = `${new Date().toISOString().slice(11, 23)} ${message}`
		debugEntries = [stamped, ...debugEntries].slice(0, 18)
		console.debug('[calendar-debug]', stamped)
	}

	function dayAriaLabel(date: Date) {
		const parts = [
			date.toLocaleDateString(undefined, {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			})
		]
		if (isToday(date)) parts.push('today')
		if (isActive(date)) {
			const count = Math.max(0, eventCount(date) || 0)
			parts.push(count === 1 ? '1 event available' : `${count} events available`)
		}
		return parts.join(', ')
	}

	const visibleMonth = $derived.by(() => buildMonthItem(currentMonth))

	async function pageByMonth(direction: 1 | -1) {
		if (isPaging) return
		isPaging = true
		try {
			lastPageDirection = direction
			currentMonth = addMonths(currentMonth, direction)
			pushDebug(`visible-month ${visibleMonth.key}`)
		} finally {
			window.requestAnimationFrame(() => {
				isPaging = false
			})
		}
	}

	onMount(() => {
		const wheelPager = createWheelMonthPager({
			triggerDelta: WHEEL_TRIGGER_DELTA,
			sameDirectionRearmGapMs: SAME_DIRECTION_REARM_GAP_MS,
			getLastPageDirection: () => lastPageDirection,
			onPage: (direction) => {
				void pageByMonth(direction)
			},
			onDebug: pushDebug,
			onStateChange: (state) => {
				wheelGestureConsumed = state.consumed
				currentGestureStartGap = state.gestureStartGap
			}
		})
		const handleWheel = (event: Event) => {
			wheelPager.handle(event as WheelEvent)
		}

		debugEnabled = browser && dev && new URLSearchParams(window.location.search).has('calendarDebug')
		viewportElement?.addEventListener('wheel', handleWheel, { passive: false })
		pushDebug(`visible-month ${visibleMonth.key}`)
		pushDebug('mounted')

		return () => {
			viewportElement?.removeEventListener('wheel', handleWheel)
			wheelPager.destroy()
		}
	})
</script>

<div class="member-calendar" data-testid={testId}>
	<div class="member-calendar__legend">
		<span class="member-calendar__legend-dot" aria-hidden="true"></span>
		<span>has events</span>
	</div>

	<div class="member-calendar__month-banner" data-current-month-key={visibleMonth.key}>
		<h3 class="member-calendar__month-banner-title">{visibleMonth.label}</h3>
	</div>

	<div class="member-calendar__weekday-row" aria-hidden="true">
		{#each weekdays as weekday}
			<span>{weekday}</span>
		{/each}
	</div>

	<div class="member-calendar__viewport" bind:this={viewportElement} aria-label="Calendar month view">
		<MonthGrid
			month={visibleMonth}
			{selectedDateIso}
			{isPast}
			{isToday}
			{isActive}
			{eventCount}
			{eventTone}
			{dayAriaLabel}
			{onSelect}
		/>
	</div>

	{#if debugEnabled}
		<div class="member-calendar__debug" aria-live="polite">
			<div class="member-calendar__debug-head">
				<span>Calendar Debug</span>
				<span>month={visibleMonth.key}</span>
				<span>gesture={wheelGestureConsumed ? 'consumed' : 'open'}</span>
				<span>gap={Number.isFinite(currentGestureStartGap) ? Math.round(currentGestureStartGap) : 'inf'}</span>
			</div>
			<div class="member-calendar__debug-log">
				{#each debugEntries as entry}
					<div>{entry}</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.member-calendar {
		--member-calendar-border: color-mix(in srgb, var(--text) 14%, transparent);
		--member-calendar-panel: color-mix(in srgb, var(--panel-bg) 88%, transparent);
		--member-calendar-dot: color-mix(in srgb, var(--link) 72%, var(--text) 28%);
		--member-calendar-selected-bg: color-mix(in srgb, var(--link) 10%, transparent);
		--member-calendar-selected-ring: color-mix(in srgb, var(--link) 28%, transparent);
		--member-calendar-selected-border: color-mix(in srgb, var(--link) 46%, transparent);
		--member-calendar-day-hover: color-mix(in srgb, var(--panel-bg) 82%, white 18%);

		display: grid;
		gap: 0.75rem;
		width: 100%;
	}

	.member-calendar__debug {
		position: sticky;
		bottom: 0.5rem;
		z-index: 40;
		display: grid;
		gap: 0.35rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
		border-radius: 0.9rem;
		background: color-mix(in srgb, black 88%, transparent);
		color: #f4f4f8;
		font: 0.72rem/1.35 ui-monospace, 'SFMono-Regular', Menlo, monospace;
	}

	.member-calendar__debug-head {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		color: color-mix(in srgb, white 82%, transparent);
	}

	.member-calendar__debug-log {
		display: grid;
		gap: 0.12rem;
		max-height: 10rem;
		overflow: auto;
	}

	.member-calendar__legend {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: color-mix(in srgb, var(--text) 46%, transparent);
	}

	.member-calendar__legend-dot {
		width: 0.42rem;
		height: 0.42rem;
		border-radius: 999px;
		background: var(--member-calendar-dot);
		flex-shrink: 0;
	}

	.member-calendar__weekday-row {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		padding: 0 0.55rem;

		span {
			font-size: 0.68rem;
			font-weight: 600;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: color-mix(in srgb, var(--text) 52%, transparent);
			text-align: center;
		}
	}

	.member-calendar__month-banner {
		display: flex;
		align-items: center;
		min-height: 2rem;
		padding: 0 0.2rem;
	}

	.member-calendar__month-banner-title {
		font-family: var(--font-display);
		font-size: clamp(1.2rem, 2vw, 1.55rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		margin: 0;
	}

	.member-calendar__viewport {
		height: min(76vh, 52rem);
		display: grid;
		align-content: start;
		overflow: hidden;
		padding: 0;
		touch-action: none;
		outline: none;
	}

	@media (max-width: 720px) {
		.member-calendar__viewport {
			height: min(72vh, 44rem);
		}
	}
</style>
