<script lang="ts">
	import VirtualMonthStack from './VirtualMonthStack.svelte'
	import { isSameDay, isoDay, startOfDay, type CalendarTone } from './month-stack'
	import type { CalendarEventsResponse } from '../../api/calendar'

	type FeedEvent = CalendarEventsResponse['upcoming'][number]

	let {
		events = [],
		title = 'Calendar',
		pendingEventId = null,
		onJoin,
		onLeave
	} = $props<{
		events?: CalendarEventsResponse['upcoming']
		title?: string
		pendingEventId?: number | null
		onJoin?: (eventId: number, guestCount?: number) => void | Promise<void>
		onLeave?: (eventId: number) => void | Promise<void>
	}>()

	let selectedDate = $state<Date | null>(null)

	function isPast(date: Date) {
		return date < startOfDay(new Date())
	}

	function isToday(date: Date) {
		return isSameDay(date, new Date())
	}

	const eventsByDate = $derived.by(() => {
		const grouped = new Map<string, FeedEvent[]>()
		for (const event of events) {
			const key = isoDay(new Date(event.startsAt))
			const dayEvents = grouped.get(key) || []
			dayEvents.push(event)
			grouped.set(key, dayEvents)
		}
		for (const dayEvents of grouped.values()) {
			dayEvents.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
		}
		return grouped
	})

	function getEventsForDate(date: Date) {
		return eventsByDate.get(isoDay(date)) || []
	}

	function formatDayLabel(date: Date) {
		return date.toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})
	}

	function formatTimeRange(startIso: string, endIso: string) {
		const start = new Date(startIso)
		const end = new Date(endIso)
		const startText = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
		const endText = end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
		return `${startText}-${endText}`
	}

	function selectDateFromCalendar(date: Date) {
		if (isPast(date)) return
		if (getEventsForDate(date).length === 0) return
		selectedDate = date
	}

	function eventTone(event: FeedEvent | undefined): CalendarTone {
		const slug = (event as { activitySlug?: string } | undefined)?.activitySlug || ''
		if (slug === 'circus') return 'circus'
		if (slug === 'movies' || slug === 'movie-night') return 'movies'
		if (slug === 'adventure') return 'outdoors'
		if (slug === 'gym') return 'gym'
		return ''
	}

	const selectedDateIso = $derived.by(() => (selectedDate ? isoDay(selectedDate) : null))
	const selectedDateEvents = $derived(selectedDate ? getEventsForDate(selectedDate) : [])
</script>

<section class="calendar-page__section calendar-home__section">
	{#if title}
		<div class="calendar-home__feed-head">
			<h2 class="calendar-home__feed-title">{title}</h2>
		</div>
	{/if}

	<VirtualMonthStack
		selectedDateIso={selectedDateIso}
		onSelect={(date) => selectDateFromCalendar(date)}
		{isPast}
		{isToday}
		isActive={(date) => getEventsForDate(date).length > 0}
		eventCount={(date) => getEventsForDate(date).length}
		eventTone={(date) => eventTone(getEventsForDate(date)[0])}
	/>

	{#if selectedDate}
		<div class="calendar-page__slots-section">
			<div class="calendar-page__slots-header">
				<h3>{formatDayLabel(selectedDate)}</h3>
				<span class="calendar-page__slots-count">{selectedDateEvents.length} event{selectedDateEvents.length === 1 ? '' : 's'}</span>
			</div>
			<div class="calendar-page__slots-grid">
				{#each selectedDateEvents as event}
					<button
						class="calendar-page__slot-button"
						class:calendar-page__slot-button--active={event.userStatus !== null}
						class:calendar-page__slot-button--full={event.seatsLeft <= 0}
						disabled={pendingEventId === event.id || (!onJoin && !onLeave)}
						onclick={() => (event.userStatus ? onLeave?.(event.id) : onJoin?.(event.id, 0))}
					>
						<span class="calendar-page__slot-time">{formatTimeRange(event.startsAt, event.endsAt)}</span>
						{#if event.seatsLeft > 0}
							<span class="calendar-page__slot-availability">{event.seatsLeft} left</span>
						{:else}
							<span class="calendar-page__slot-full">Waitlist</span>
						{/if}
						<span class="calendar-page__slot-availability">
							{pendingEventId === event.id
								? '...'
								: event.userStatus
									? 'Leave'
									: event.seatsLeft > 0
										? 'Join'
										: 'Join waitlist'}
						</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</section>
