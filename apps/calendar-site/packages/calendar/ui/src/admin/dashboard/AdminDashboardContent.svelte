<script lang="ts">
	import AdminCalendar from '@calendar/ui/admin/dashboard/AdminCalendar.svelte'
	import AdminDashboardTodayTimeline from '@calendar/ui/admin/dashboard/AdminDashboardTodayTimeline.svelte'
	import AdminDashboardRecentFeed from '@calendar/ui/admin/dashboard/AdminDashboardRecentFeed.svelte'
	import AdminMetaCards from '@calendar/ui/admin/shared/AdminMetaCards.svelte'
	import { getActivityColor, getActivityIcon } from '../../shared'
	import { formatEventDayLabel, formatEventTimeLabel } from '../../shared'

	type Participant = {
		name?: string | null
		displayName?: string | null
		userId?: string | null
	}

	type DashboardEvent = {
		id: number
		title: string
		activityLabel: string
		activitySlug?: string | null
		startsAt: string
		seatsTaken: number
		capacity: number
		participants?: Participant[]
	}

	const { events, recentEvents, onOpenEvent, mockMode = false } = $props<{
		events: DashboardEvent[]
		recentEvents: DashboardEvent[]
		onOpenEvent: (eventId: number) => void
		mockMode?: boolean
	}>()

	let currentMonth = $state(new Date())
	let selectedDateIso = $state<string | null>(null)

	function isoDay(date: Date) {
		const y = date.getFullYear()
		const m = `${date.getMonth() + 1}`.padStart(2, '0')
		const d = `${date.getDate()}`.padStart(2, '0')
		return `${y}-${m}-${d}`
	}

	function isToday(date: Date) {
		return isoDay(date) === isoDay(new Date())
	}

	function eventCountFor(date: Date) {
		const key = isoDay(date)
		return events.filter((event: DashboardEvent) => isoDay(new Date(event.startsAt)) === key).length
	}

	function eventToneFor(date: Date) {
		const key = isoDay(date)
		const first = events.find((event: DashboardEvent) => isoDay(new Date(event.startsAt)) === key)
		return first?.activitySlug || ''
	}

	function eventTonesFor(date: Date) {
		const key = isoDay(date)
		return events
			.filter((event: DashboardEvent) => isoDay(new Date(event.startsAt)) === key)
			.sort((a: DashboardEvent, b: DashboardEvent) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
			.map((event: DashboardEvent) => event.activitySlug || '')
	}

	function prevMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
	}

	function selectDate(date: Date) {
		selectedDateIso = isoDay(date)
	}

	function isPastDate(date: Date) {
		const d = new Date(date)
		d.setHours(0, 0, 0, 0)
		const now = new Date()
		now.setHours(0, 0, 0, 0)
		return d < now
	}

	const selectedDateEvents = $derived.by(() => {
		if (!selectedDateIso) return []
		return [...events]
			.filter((event) => isoDay(new Date(event.startsAt)) === selectedDateIso)
			.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
	})

	const selectedDateLabel = $derived.by(() => {
		if (!selectedDateIso) return ''
		const [year, month, day] = selectedDateIso.split('-').map((part) => Number(part))
		const date = new Date(year || 0, (month || 1) - 1, day || 1)
		return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
	})

	function timeLabel(iso: string) {
		return formatEventTimeLabel(iso)
	}
</script>

<section class="admin-dashboard">
	<AdminDashboardTodayTimeline {events} {onOpenEvent} />
	<AdminDashboardRecentFeed {recentEvents} {mockMode} />

	<AdminCalendar
		currentMonth={currentMonth}
		selectedDateIso={selectedDateIso}
		onPrev={prevMonth}
		onNext={nextMonth}
		onSelect={(date) => selectDate(date)}
		isPast={isPastDate}
		isToday={isToday}
		isActive={(date) => eventCountFor(date) > 0}
		eventCount={eventCountFor}
		eventTone={eventToneFor}
		eventTones={eventTonesFor}
		compact={true}
	/>

	{#if selectedDateIso && selectedDateEvents.length > 0}
		<div class="admin-dashboard__selected-day">
			<h4>{selectedDateLabel}</h4>
			<AdminMetaCards
				items={selectedDateEvents.map((event) => ({
					id: String(event.id),
					label: event.title,
					detail: `${formatEventDayLabel(event.startsAt)} · ${timeLabel(event.startsAt)}`,
					dotColor: getActivityColor(event.activityLabel, event.activitySlug || undefined),
					dotIcon: getActivityIcon(event.activityLabel, event.activitySlug || undefined),
					onClick: () => onOpenEvent(event.id),
					ariaLabel: `Open ${event.title}`,
				}))}
				emptyText="No events on this day."
			/>
		</div>
	{/if}
</section>

<style>
	.admin-dashboard {
		display: grid;
		gap: 1rem;
	}

	.admin-dashboard__selected-day {
		display: grid;
		gap: 0.4rem;
	}

</style>
