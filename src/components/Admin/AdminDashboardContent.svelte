<script lang="ts">
	import AdminCalendarWidget from '@components/Admin/AdminCalendarWidget.svelte'
	import AdminDashboardTodayTimeline from '@components/Admin/AdminDashboardTodayTimeline.svelte'
	import AdminDashboardRecentFeed from '@components/Admin/AdminDashboardRecentFeed.svelte'

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

	const { events, recentEvents, onOpenEvent } = $props<{
		events: DashboardEvent[]
		recentEvents: DashboardEvent[]
		onOpenEvent: (eventId: number) => void
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
</script>

<section class="admin-dashboard">
	<AdminDashboardTodayTimeline {events} {onOpenEvent} />
	<AdminDashboardRecentFeed {recentEvents} />

	<AdminCalendarWidget
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
		compact={true}
	/>
</section>

<style>
	.admin-dashboard {
		display: grid;
		gap: 1rem;
	}
</style>
