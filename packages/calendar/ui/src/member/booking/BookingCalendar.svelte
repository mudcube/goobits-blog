<script lang="ts">
	import { joinCalendarEvent, type CalendarEventsResponse } from '../../api/calendar'
	import { applyEventMutationState } from './feed-state'
	import {
		BookedStep,
		CalendarStep,
		StepIndicator,
		TimeStep,
		type Activity,
		type BookingSlot,
		type OpenDay,
		type Person,
		isoDay,
		startOfDay
	} from '../../booking'
	import { ft, formatDate } from '../../booking/time'

	type FeedEvent = CalendarEventsResponse['upcoming'][number]

	let {
		activity,
		initialUpcoming = [],
		mockMode = false
	} = $props<{
		activity: Activity
		initialUpcoming?: CalendarEventsResponse['upcoming']
		mockMode?: boolean
	}>()

	let localUpcoming = $state<CalendarEventsResponse['upcoming'] | null>(null)
	let upcoming = $derived(localUpcoming ?? initialUpcoming)
	let stepNum = $state(0)
	let maxReached = $state(0)
	let selectedDay = $state<OpenDay | null>(null)
	let pendingDay = $state<OpenDay | null>(null)
	let selectedSlotId = $state<string | number | null>(null)
	let start = $state(12)
	let end = $state(14)
	let bookingError = $state('')

	const openDays = $derived.by(() => eventsToPresetDays(upcoming))
	const selectedSlot = $derived.by(() => selectedDay?.slots?.find(slot => slot.id === selectedSlotId) ?? null)
	const overlapping = $derived(selectedDay ? selectedDay.bookings.filter(person => person.start < end && person.end > start) : [])

	function decimalHour(iso: string) {
		const date = new Date(iso)
		return date.getHours() + date.getMinutes() / 60
	}

	function formatTimeRange(startIso: string, endIso: string) {
		return `${ft(decimalHour(startIso))}-${ft(decimalHour(endIso))}`
	}

	function participantToPerson(event: FeedEvent): Person[] {
		return event.participants.map((participant, index) => ({
			name: participant.name ?? 'Guest',
			color: ['#d4748c', '#d8944a', '#6bb5a0', '#7a9ed4'][index % 4]!,
			start: decimalHour(event.startsAt),
			end: decimalHour(event.endsAt)
		}))
	}

	function eventsToPresetDays(events: FeedEvent[]): OpenDay[] {
		const groups = new Map<string, FeedEvent[]>()
		for (const event of events) {
			const key = isoDay(new Date(event.startsAt))
			const group = groups.get(key) ?? []
			group.push(event)
			groups.set(key, group)
		}

		return [...groups.values()]
			.map((eventsForDay) => {
				eventsForDay.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
				const first = eventsForDay[0]!
				const date = startOfDay(new Date(first.startsAt))
				const slots: BookingSlot[] = eventsForDay.map((event) => ({
					id: event.id,
					eventId: event.id,
					label: formatTimeRange(event.startsAt, event.endsAt),
					start: decimalHour(event.startsAt),
					end: decimalHour(event.endsAt),
					seatsLeft: event.seatsLeft,
					capacity: event.capacity,
					waitlistCount: event.waitlistCount,
					userStatus: event.userStatus
				}))
				const bookings = eventsForDay.flatMap(participantToPerson)
				return {
					date,
					mode: 'preset' as const,
					eventId: first.id,
					slots,
					bookings,
					windowStart: Math.min(...slots.map(slot => slot.start)),
					windowEnd: Math.max(...slots.map(slot => slot.end)),
					maxDuration: Math.max(...slots.map(slot => slot.end - slot.start)),
					capacity: Math.max(...eventsForDay.map(event => event.capacity))
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	function goStep(next: number) {
		stepNum = next
		if (next > maxReached) maxReached = next
	}

	function selectDay(day: OpenDay) {
		selectedDay = day
		const firstSlot = day.slots?.[0] ?? null
		selectedSlotId = firstSlot?.id ?? null
		start = firstSlot?.start ?? day.windowStart
		end = firstSlot?.end ?? Math.min(day.windowStart + 1, day.windowEnd)
		goStep(1)
	}

	function joinPerson(person: Person) {
		start = person.start
		end = person.end
	}

	function applyMockJoin(eventId: number) {
		localUpcoming = upcoming.map((event: FeedEvent) => {
			if (event.id !== eventId) return event
			const canJoin = event.seatsLeft >= 1
			return {
				...event,
				seatsTaken: canJoin ? Math.min(event.capacity, event.seatsTaken + 1) : event.seatsTaken,
				seatsLeft: canJoin ? Math.max(0, event.seatsLeft - 1) : event.seatsLeft,
				waitlistCount: canJoin ? event.waitlistCount : event.waitlistCount + 1,
				userStatus: canJoin ? 'joined' : 'waitlist',
				userGuestCount: 0
			}
		})
	}

	async function confirmBooking() {
		if (!selectedDay) return
		const eventId = Number(selectedSlot?.eventId ?? selectedSlotId ?? selectedDay.eventId)
		if (!Number.isFinite(eventId) || eventId <= 0) return

		bookingError = ''
		try {
			if (mockMode) {
				applyMockJoin(eventId)
				goStep(2)
				return
			}
			const result = await joinCalendarEvent(eventId, { guestCount: 0 })
			localUpcoming = applyEventMutationState(upcoming, eventId, result.state)
			goStep(2)
		} catch {
			bookingError = 'Failed to book. Try again.'
		}
	}

	function onStepNav(step: number) {
		if (step === stepNum) return
		if (step < stepNum) goStep(step)
	}

	const stepLabels = $derived.by((): [string, string, string] => {
		const dayLabel = selectedDay ? formatDate(selectedDay.date) : 'Day'
		const timeLabel = stepNum >= 2 ? `${ft(start)}-${ft(end)}` : 'Time'
		return [dayLabel, timeLabel, 'Booked']
	})
</script>

<div class="member-booking">
	<StepIndicator current={stepNum} {maxReached} labels={stepLabels} onNavigate={onStepNav} />

	<div class="member-booking__panel">
		{#if stepNum === 0}
			<CalendarStep
				{activity}
				openDays={openDays}
				claimed={true}
				bind:pendingDay
				onSelectDay={selectDay}
				onClaim={() => {}}
				variant="member"
				showHero={false}
			/>
		{:else if stepNum === 1 && selectedDay}
			<TimeStep
				day={selectedDay}
				hourly={[]}
				sunrise={6}
				sunset={20}
				hasRain={false}
				{overlapping}
				bind:start
				bind:end
				bind:selectedSlotId
				onJoin={joinPerson}
				onConfirm={confirmBooking}
			/>
			{#if bookingError}<p class="member-booking__error">{bookingError}</p>{/if}
		{:else if stepNum === 2 && selectedDay}
			<BookedStep
				activityIcon={activity.icon}
				activityLabel={activity.label}
				date={selectedDay.date}
				{start}
				{end}
				{overlapping}
				onBack={() => goStep(0)}
				onEdit={() => goStep(1)}
			/>
		{/if}
	</div>
</div>

<style>
	.member-booking {
		--book-accent: color-mix(in srgb, var(--link) 72%, #7a5af8 28%);
		--book-confirm: #22c55e;
		--book-confirm-hover: #16a34a;
		--book-dot-green: #4ade80;
		width: min(100%, 54rem);
	}

	.member-booking__panel {
		position: relative;
		padding: 0;
	}

	.member-booking__error {
		margin: 0.5rem 0 0;
		color: #f87171;
		font-size: 0.78rem;
		font-weight: 600;
		text-align: center;
	}
</style>
