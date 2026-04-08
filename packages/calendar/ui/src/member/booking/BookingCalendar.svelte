<script lang="ts">
	import { joinCalendarEvent, leaveCalendarEvent, type CalendarEventsResponse } from '../../api/calendar'
	import { applyEventMutationState } from './feed-state'
	import MonthEventCalendar from './MonthEventCalendar.svelte'
	let {
		initialUpcoming = [],
		mockMode = false
	} = $props<{
		initialUpcoming?: CalendarEventsResponse['upcoming']
		mockMode?: boolean
	}>()

	let localUpcoming = $state<CalendarEventsResponse['upcoming'] | null>(null)
	let upcoming = $derived(localUpcoming ?? initialUpcoming)
	let pendingEventId = $state<number | null>(null)

	type FeedEvent = CalendarEventsResponse['upcoming'][number]

	function applyMockJoin(eventId: number, guestCount = 0) {
		localUpcoming = upcoming.map((event: FeedEvent) => {
			if (event.id !== eventId) return event
			const requested = 1 + Math.max(0, guestCount)
			const canJoin = event.seatsLeft >= requested
			const nextSeatsTaken = canJoin ? Math.min(event.capacity, event.seatsTaken + requested) : event.seatsTaken
			const nextSeatsLeft = Math.max(0, event.capacity - nextSeatsTaken)
			const nextWaitlist = canJoin ? event.waitlistCount : event.waitlistCount + requested
			return {
				...event,
				seatsTaken: nextSeatsTaken,
				seatsLeft: nextSeatsLeft,
				waitlistCount: nextWaitlist,
				userStatus: canJoin ? 'joined' : 'waitlist',
				userGuestCount: Math.max(0, guestCount)
			}
		})
	}

	function applyMockLeave(eventId: number) {
		localUpcoming = upcoming.map((event: FeedEvent) => {
			if (event.id !== eventId) return event
			if (!event.userStatus) return event
			if (event.userStatus === 'waitlist') {
				const waitlistDrop = 1 + Math.max(0, event.userGuestCount || 0)
				return {
					...event,
					waitlistCount: Math.max(0, event.waitlistCount - waitlistDrop),
					userStatus: null,
					userGuestCount: 0
				}
			}
			const seatDrop = 1 + Math.max(0, event.userGuestCount || 0)
			const nextSeatsTaken = Math.max(0, event.seatsTaken - seatDrop)
			return {
				...event,
				seatsTaken: nextSeatsTaken,
				seatsLeft: Math.max(0, event.capacity - nextSeatsTaken),
				userStatus: null,
				userGuestCount: 0
			}
		})
	}

	async function join(eventId: number, guestCount = 0) {
		pendingEventId = eventId
		try {
			if (mockMode) {
				applyMockJoin(eventId, guestCount)
				return
			}
			const result = await joinCalendarEvent(eventId, { guestCount })
			localUpcoming = applyEventMutationState(upcoming, eventId, result.state)
		} catch (error) {
			console.error(error)
		} finally {
			pendingEventId = null
		}
	}

	async function leave(eventId: number) {
		pendingEventId = eventId
		try {
			if (mockMode) {
				applyMockLeave(eventId)
				return
			}
			const result = await leaveCalendarEvent(eventId)
			localUpcoming = applyEventMutationState(upcoming, eventId, result.state)
		} catch (error) {
			console.error(error)
		} finally {
			pendingEventId = null
		}
	}
</script>

<MonthEventCalendar
	title=""
	events={upcoming}
	{pendingEventId}
	onJoin={join}
	onLeave={leave}
/>
