<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte'
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

	const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	function getMonthRange(date: Date) {
		const start = new Date(date.getFullYear(), date.getMonth(), 1)
		const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
		return { start, end }
	}

	function getCalendarDays(date: Date) {
		const { start, end } = getMonthRange(date)
		const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

		const startDay = (start.getDay() + 6) % 7
		for (let i = 0; i < startDay; i += 1) {
			const d = new Date(start)
			d.setDate(d.getDate() - (startDay - i))
			days.push({ date: d, isCurrentMonth: false })
		}

		for (let d = 1; d <= end.getDate(); d += 1) {
			days.push({ date: new Date(date.getFullYear(), date.getMonth(), d), isCurrentMonth: true })
		}

		const endDay = (end.getDay() + 6) % 7
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

	function eventTone(event: CalendarEventsResponse['upcoming'][number] | undefined) {
		const slug = (event as { activitySlug?: string } | undefined)?.activitySlug || ''
		if (slug === 'circus') return 'circus'
		if (slug === 'movies') return 'movies'
		if (slug === 'adventure') return 'outdoors'
		if (slug === 'gym') return 'gym'
		return ''
	}

	function dotColorForTone(tone: string) {
		if (tone === 'circus') return '#ff7a59'
		if (tone === 'movies') return '#4fa8ff'
		if (tone === 'outdoors') return '#2eb67d'
		if (tone === 'gym') return '#a855f7'
		return ''
	}

	const calendarDays = $derived(getCalendarDays(currentMonth))
	const monthLabel = $derived(getMonthLabel(currentMonth))
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
	<div class="calendar-home__feed-head">
		<h2 class="calendar-home__feed-title">{title}</h2>
	</div>

	<div class="admin-calendar__head">
		<div class="admin-calendar__nav">
			<button class="admin-calendar__arrow" type="button" aria-label="Previous month" onclick={prevMonth} disabled={!isPreviousMonthAllowed}>
				<ChevronLeft size={18} strokeWidth={2} />
			</button>
		</div>
		<h3 class="admin-calendar__title">{monthLabel}</h3>
		<div class="admin-calendar__nav">
			<button class="admin-calendar__arrow" type="button" aria-label="Next month" onclick={nextMonth} disabled={!isNextMonthAllowed}>
				<ChevronRight size={18} strokeWidth={2} />
			</button>
		</div>
	</div>

	<div class="admin-calendar__table">
		<div class="admin-calendar__weekdays">
			{#each weekDays as day}
				<span>{day}</span>
			{/each}
		</div>
		<div class="admin-calendar__grid">
			{#each calendarDays as day}
				{@const dayEvents = getEventsForDate(day.date)}
				{@const eventCount = dayEvents.length}
				{@const tone = eventTone(dayEvents[0])}
				<button
					class="admin-calendar__day"
					class:admin-calendar__day--off={!day.isCurrentMonth}
					class:admin-calendar__day--past={isPast(day.date)}
					class:admin-calendar__day--today={isToday(day.date)}
					class:admin-calendar__day--selected={selectedDate && isSameDay(day.date, selectedDate)}
					disabled={!day.isCurrentMonth || isPast(day.date) || eventCount === 0}
					onclick={() => selectDate(day.date, day.isCurrentMonth)}
				>
					<span class="admin-calendar__day-num">{day.date.getDate()}</span>
					{#if day.isCurrentMonth && !isPast(day.date) && eventCount > 0}
						<span
							class="admin-calendar__event-dots"
							style={`--admin-calendar-dot-override: ${dotColorForTone(tone) || 'var(--admin-calendar-dot)'}`}
							aria-hidden="true"
						>
							{#each Array.from({ length: Math.min(eventCount, 3) }, (_, index) => index) as dotIndex (dotIndex)}
								<span class="admin-calendar__event-dot"></span>
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

<style>
	.admin-calendar__head {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
		padding: 0.25rem 0;
		margin-bottom: 0.55rem;
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
		border: 1px solid var(--admin-calendar-border-uniform, color-mix(in srgb, var(--text) 14%, transparent));
		background: transparent;
		cursor: pointer;
		color: var(--admin-calendar-arrow-fg, color-mix(in srgb, var(--text) 60%, transparent));
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: background 0.15s, color 0.15s, opacity 0.15s;
	}

	.admin-calendar__arrow:hover {
		color: var(--admin-calendar-arrow-hover-fg, color-mix(in srgb, var(--link) 80%, var(--text) 20%));
	}

	.admin-calendar__arrow:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.admin-calendar__table {
		border: 1px solid var(--admin-calendar-border-uniform, color-mix(in srgb, var(--text) 14%, transparent));
		border-radius: 0.5rem 0.5rem 1rem 1rem;
		overflow: hidden;
	}

	.admin-calendar__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-bottom: 0;
		border-bottom: 1px solid var(--admin-calendar-border-uniform, color-mix(in srgb, var(--text) 14%, transparent));
		background: var(--admin-calendar-weekday-row-bg, #1f1f23);
	}

	.admin-calendar__weekdays span {
		text-align: right;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--admin-calendar-weekday-row-fg, #f7f7fb);
		padding: 0.28rem 0.45rem 0.28rem 0;
		border-right: 1px solid var(--admin-calendar-border-uniform, color-mix(in srgb, var(--text) 14%, transparent));
	}

	.admin-calendar__weekdays span:last-child {
		border-right: 0;
	}

	.admin-calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0;
	}

	.admin-calendar__day {
		position: relative;
		aspect-ratio: 1;
		border: 0;
		border-right: 1px solid var(--admin-calendar-border-uniform, color-mix(in srgb, var(--text) 14%, transparent));
		border-bottom: 1px solid var(--admin-calendar-border-uniform, color-mix(in srgb, var(--text) 14%, transparent));
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
		background: color-mix(in srgb, var(--text) 5%, transparent);
	}

	.admin-calendar__day--off .admin-calendar__day-num {
		opacity: 0.28;
	}

	.admin-calendar__day--past {
		opacity: 0.5;
	}

	.admin-calendar__day--past:not(.admin-calendar__day--off) .admin-calendar__day-num {
		opacity: 0.62;
	}

	.admin-calendar__day-num {
		font-family: var(--font-ui-sans, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1;
		position: absolute;
		top: 0.48rem;
		right: 0.45rem;
	}

	.admin-calendar__event-dots {
		position: absolute;
		left: 0.42rem;
		bottom: 0.34rem;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}

	.admin-calendar__event-dot {
		width: 0.33rem;
		height: 0.33rem;
		border-radius: 999px;
		background: var(--admin-calendar-dot-override, var(--admin-calendar-dot, color-mix(in srgb, var(--link) 76%, var(--text) 24%)));
	}

	.admin-calendar__day--today .admin-calendar__day-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 999px;
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--link) 32%, transparent);
		font-weight: 600;
	}

	.admin-calendar__day--selected {
		border-radius: 0.55rem;
		background: color-mix(in srgb, var(--link) 11%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--link) 62%, transparent);
	}
</style>
