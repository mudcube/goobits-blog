<script lang="ts">
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

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

	function getMonthRange(date: Date) {
		const start = new Date(date.getFullYear(), date.getMonth(), 1)
		const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
		return { start, end }
	}

	function getCalendarDays(date: Date) {
		const { start, end } = getMonthRange(date)
		const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

		const startDay = start.getDay()
		for (let i = 0; i < startDay; i += 1) {
			const d = new Date(start)
			d.setDate(d.getDate() - (startDay - i))
			days.push({ date: d, isCurrentMonth: false })
		}

		for (let d = 1; d <= end.getDate(); d += 1) {
			days.push({ date: new Date(date.getFullYear(), date.getMonth(), d), isCurrentMonth: true })
		}

		const endDay = end.getDay()
		for (let i = 1; i < 7 - endDay; i += 1) {
			const d = new Date(end)
			d.setDate(d.getDate() + i)
			days.push({ date: d, isCurrentMonth: false })
		}

		return days
	}

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

	function goToToday() {
		currentMonth = new Date()
		selectedDate = null
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

	function selectDate(date: Date, isCurrentMonth: boolean) {
		if (!isCurrentMonth || isPast(date)) return
		if (getEventsForDate(date).length === 0) return
		selectedDate = date
	}

	const calendarDays = $derived(getCalendarDays(currentMonth))
	const monthLabel = $derived(getMonthLabel(currentMonth))
	const selectedDateEvents = $derived(selectedDate ? getEventsForDate(selectedDate) : [])
	const isCurrentCalendarMonth = $derived(
		currentMonth.getMonth() === new Date().getMonth() &&
			currentMonth.getFullYear() === new Date().getFullYear()
	)
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
	<div class="calendar-home__feed-head">
		<h2 class="calendar-home__feed-title">{title}</h2>
	</div>

	<div class="calendar-page__calendar-header">
		<button class="calendar-page__month-button" onclick={prevMonth} aria-label="Previous month" disabled={!isPreviousMonthAllowed}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="15 18 9 12 15 6" />
			</svg>
		</button>
		<h3 class="calendar-page__month-label">{monthLabel}</h3>
		<button class="calendar-page__month-button" onclick={nextMonth} aria-label="Next month" disabled={!isNextMonthAllowed}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
		{#if !isCurrentCalendarMonth}
			<button class="calendar-page__today-button" onclick={goToToday}>Today</button>
		{/if}
	</div>

	<div class="calendar-page__calendar">
		<div class="calendar-page__weekdays">
			{#each weekDays as day}
				<span>{day}</span>
			{/each}
		</div>
		<div class="calendar-page__grid">
			{#each calendarDays as day}
				{@const dayEvents = getEventsForDate(day.date)}
				{@const eventCount = dayEvents.length}
				<button
					class="calendar-page__day"
					class:calendar-page__day--other-month={!day.isCurrentMonth}
					class:calendar-page__day--past={isPast(day.date)}
					class:calendar-page__day--today={isToday(day.date)}
					class:calendar-page__day--selected={selectedDate && isSameDay(day.date, selectedDate)}
					class:calendar-page__day--has-slots={eventCount > 0}
					disabled={!day.isCurrentMonth || isPast(day.date) || eventCount === 0}
					onclick={() => selectDate(day.date, day.isCurrentMonth)}
				>
					<span class="calendar-page__day-number">{day.date.getDate()}</span>
					{#if day.isCurrentMonth && !isPast(day.date) && eventCount > 0}
						<span class="calendar-page__day-dots">
							{#each Array.from({ length: Math.min(eventCount, 3) }, (_, index) => index) as dotIndex (dotIndex)}
								<span class="calendar-page__day-dot"></span>
							{/each}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

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
