<script lang="ts">
	import { joinCalendarEvent, leaveCalendarEvent, type CalendarEventsResponse } from '../../../api/calendar'
	import { applyEventMutationState } from './feed-state'
	import MonthEventCalendar from './MonthEventCalendar.svelte'
	let {
		initialUpcoming = []
	} = $props<{
		initialUpcoming?: CalendarEventsResponse['upcoming']
	}>()

	let upcoming = $state<CalendarEventsResponse['upcoming']>([])
	let pendingEventId = $state<number | null>(null)

	$effect(() => {
		upcoming = initialUpcoming
	})

	async function join(eventId: number, guestCount = 0) {
		pendingEventId = eventId
		try {
			const result = await joinCalendarEvent(eventId, { guestCount })
			upcoming = applyEventMutationState(upcoming, eventId, result.state)
		} catch (error) {
			console.error(error)
		} finally {
			pendingEventId = null
		}
	}

	async function leave(eventId: number) {
		pendingEventId = eventId
		try {
			const result = await leaveCalendarEvent(eventId)
			upcoming = applyEventMutationState(upcoming, eventId, result.state)
		} catch (error) {
			console.error(error)
		} finally {
			pendingEventId = null
		}
	}
</script>

<MonthEventCalendar
	title="Calendar"
	events={upcoming}
	{pendingEventId}
	onJoin={join}
	onLeave={leave}
/>
