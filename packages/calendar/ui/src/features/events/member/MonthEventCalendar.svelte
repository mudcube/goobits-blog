<script lang="ts">
	import AdminCalendarWidget from '@components/Admin/AdminCalendarWidget.svelte'
	import type { CalendarEventsResponse } from '../../../api/calendar'

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

	let currentMonth = $state(new Date())
	let selectedDate = $state<Date | null>(null)

	function isSameDay(a: Date, b: Date) {
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		)
	}

	function isPast(date: Date) {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return date < today
	}

	function isToday(date: Date) {
		return isSameDay(date, new Date())
	}

	function getEventsForDate(date: Date) {
		return events.filter((event: CalendarEventsResponse['upcoming'][number]) =>
			isSameDay(new Date(event.startsAt), date)
		)
	}

	function getMonthLabel(date: Date) {
		return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
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

	function prevMonth() {
		if (!isPreviousMonthAllowed) return
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		selectedDate = null
	}

	function nextMonth() {
		if (!isNextMonthAllowed) return
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		selectedDate = null
	}

	function selectDateFromCalendar(date: Date) {
		if (isPast(date)) return
		if (getEventsForDate(date).length === 0) return
		currentMonth = new Date(date.getFullYear(), date.getMonth(), 1)
		selectedDate = date
	}

	function eventTone(event: CalendarEventsResponse['upcoming'][number] | undefined) {
		const slug = (event as { activitySlug?: string } | undefined)?.activitySlug || ''
		if (slug === 'circus') return 'circus'
		if (slug === 'movies') return 'movies'
		if (slug === 'adventure') return 'outdoors'
		if (slug === 'gym') return 'gym'
		return ''
	}

	const monthLabel = $derived(getMonthLabel(currentMonth))
	const selectedDateIso = $derived.by(() => {
		if (!selectedDate) return null
		const y = selectedDate.getFullYear()
		const m = `${selectedDate.getMonth() + 1}`.padStart(2, '0')
		const d = `${selectedDate.getDate()}`.padStart(2, '0')
		return `${y}-${m}-${d}`
	})
	const selectedDateEvents = $derived(selectedDate ? getEventsForDate(selectedDate) : [])
	const isPreviousMonthAllowed = $derived.by(() => {
		const now = new Date()
		const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		return prev.getFullYear() > now.getFullYear() || (prev.getFullYear() === now.getFullYear() && prev.getMonth() >= now.getMonth())
	})
	const isNextMonthAllowed = $derived.by(() => {
		const maxMonth = new Date()
		maxMonth.setMonth(maxMonth.getMonth() + 3)
		const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		return next <= maxMonth
	})

</script>

<section class="calendar-page__section calendar-home__section">
	{#if title}
		<div class="calendar-home__feed-head">
			<h2 class="calendar-home__feed-title">{title}</h2>
		</div>
	{/if}

	<AdminCalendarWidget
		{currentMonth}
		selectedDateIso={selectedDateIso}
		title={monthLabel}
		initialWeekStart="monday"
		syncWeekStartPreference={false}
		onPrev={prevMonth}
		onNext={nextMonth}
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
						onclick={() =>
							event.userStatus ? onLeave?.(event.id) : onJoin?.(event.id, 0)}
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

<style>
	:global(.calendar-home__section .admin-calendar__day:not(.admin-calendar__day--active)) {
		opacity: 1;
	}
</style>
